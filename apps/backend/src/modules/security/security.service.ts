import { Injectable } from "@nestjs/common";

@Injectable()
export class SecurityService {
  getRuntimeControls() {
    return {
      backendControlsFunds: false,
      requiresUserAuthorization: true,
      monitorsAnomalies: true
    };
  }
}
