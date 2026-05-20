import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
  enqueueAccountNotice(userId: string, message: string) {
    return { queued: true, userId, message };
  }
}
