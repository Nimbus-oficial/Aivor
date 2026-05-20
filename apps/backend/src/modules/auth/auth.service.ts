import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  getSupportedProviders() {
    return ["google", "apple", "email"] as const;
  }
}
