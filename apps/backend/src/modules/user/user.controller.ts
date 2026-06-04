import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import type { AddWalletDto, CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":userId/profile")
  getProfile(@Param("userId") userId: string) {
    return ok(this.userService.getProfile(userId), "mock");
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.userService.createOperationalUser(body);
    return ok(user, "database");
  }

  @Post("wallets")
  async addWallet(@Body() body: AddWalletDto) {
    const wallet = await this.userService.addWallet(body);
    return ok(wallet, "database");
  }
}
