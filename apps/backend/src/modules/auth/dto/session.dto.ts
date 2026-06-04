export interface CreateSessionDto {
  userId?: string | null;
  sessionHash: string;
  provider?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
}

export interface RevokeSessionDto {
  sessionHash: string;
}

export interface PrivyLoginDto {
  accessToken: string;
  identityToken?: string;
  walletAddress?: string;
  chainId?: number;
}

export interface PrivyLogoutDto {
  sessionToken: string;
}
