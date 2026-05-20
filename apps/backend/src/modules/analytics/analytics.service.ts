import { Injectable } from "@nestjs/common";

@Injectable()
export class AnalyticsService {
  track(eventName: string, metadata: Record<string, unknown>) {
    return { accepted: true, eventName, metadata };
  }
}
