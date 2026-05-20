import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  getProfile(userId: string) {
    return {
      id: userId,
      displayName: "Cliente Orvex",
      locale: "pt-BR"
    };
  }
}
