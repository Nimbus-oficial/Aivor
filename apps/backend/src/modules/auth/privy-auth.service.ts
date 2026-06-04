import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PrivyClient,
  verifyAccessToken,
  type User,
  type VerifyAccessTokenResponse
} from "@privy-io/node";
import { createRemoteJWKSet, type JWTVerifyGetKey } from "jose";

interface PrivyConfig {
  appId: string;
  appSecret?: string;
  verificationKey?: string;
  jwksUrl?: string;
  apiUrl: string;
}

@Injectable()
export class PrivyAuthService {
  private client?: PrivyClient;
  private remoteJwks?: JWTVerifyGetKey;

  constructor(private readonly configService: ConfigService) {}

  isConfigured() {
    return Boolean(this.getConfigOrNull());
  }

  async verifyAccessToken(accessToken: string) {
    const config = this.getConfig();
    try {
      return await verifyAccessToken({
        access_token: accessToken,
        app_id: config.appId,
        verification_key: this.getVerificationKey(config)
      });
    } catch {
      throw new UnauthorizedException("Invalid Privy access token");
    }
  }

  async getUserFromIdentityToken(identityToken?: string) {
    if (!identityToken) return null;
    try {
      return await this.getClient().users().get({ id_token: identityToken });
    } catch {
      throw new UnauthorizedException("Invalid Privy identity token");
    }
  }

  getPrimaryEmail(user: User | null) {
    const account = user?.linked_accounts.find((linkedAccount) => {
      const typed = linkedAccount as { type?: string; address?: string; email?: string | null };
      return typed.type === "email" || Boolean(typed.email);
    }) as { address?: string; email?: string | null } | undefined;

    return account?.email ?? account?.address ?? null;
  }

  getDisplayName(user: User | null) {
    const account = user?.linked_accounts.find((linkedAccount) => {
      const typed = linkedAccount as { name?: string | null; username?: string | null };
      return Boolean(typed.name ?? typed.username);
    }) as { name?: string | null; username?: string | null } | undefined;

    return account?.name ?? account?.username ?? null;
  }

  getEthereumWallets(user: User | null) {
    return (
      user?.linked_accounts
        .map((linkedAccount) => linkedAccount as { type?: string; address?: string; chain_type?: string; chain_id?: string })
        .filter((linkedAccount) => {
          return (
            (linkedAccount.type === "wallet" || linkedAccount.type === "smart_wallet") &&
            /^0x[0-9a-fA-F]{40}$/.test(linkedAccount.address ?? "") &&
            (!linkedAccount.chain_type || linkedAccount.chain_type === "ethereum")
          );
        })
        .map((linkedAccount) => ({
          address: linkedAccount.address as string,
          chainId: Number(linkedAccount.chain_id ?? 8453) || 8453
        })) ?? []
    );
  }

  getSessionExpiration(verified: VerifyAccessTokenResponse) {
    return new Date(verified.expiration * 1000);
  }

  private getClient() {
    const config = this.getConfig();
    if (!config.appSecret) {
      throw new UnauthorizedException("Privy app secret is required to read identity token details");
    }

    this.client ??= new PrivyClient({
      appId: config.appId,
      appSecret: config.appSecret,
      apiUrl: config.apiUrl,
      jwtVerificationKey: config.verificationKey
    });

    return this.client;
  }

  private getVerificationKey(config: PrivyConfig) {
    if (config.verificationKey) return config.verificationKey;
    if (!config.jwksUrl) {
      throw new UnauthorizedException("Privy verification key or JWKS URL is required");
    }

    this.remoteJwks ??= createRemoteJWKSet(new URL(config.jwksUrl));
    return this.remoteJwks;
  }

  private getConfig() {
    const config = this.getConfigOrNull();
    if (!config) {
      throw new UnauthorizedException("Privy is not configured");
    }
    return config;
  }

  private getConfigOrNull(): PrivyConfig | null {
    const appId = this.configService.get<string>("PRIVY_APP_ID")?.trim();
    const appSecret = this.configService.get<string>("PRIVY_APP_SECRET")?.trim();
    const verificationKey = this.configService.get<string>("PRIVY_VERIFICATION_KEY")?.trim();
    const jwksUrl = this.configService.get<string>("PRIVY_JWKS_URL")?.trim();
    if (!appId || (!verificationKey && !jwksUrl)) return null;

    return {
      appId,
      appSecret: appSecret || undefined,
      verificationKey: verificationKey || undefined,
      jwksUrl: jwksUrl || undefined,
      apiUrl: this.configService.get<string>("PRIVY_API_URL")?.trim() || "https://api.privy.io"
    };
  }
}
