import { Injectable, Logger } from "@nestjs/common";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface StructuredLogInput {
  event: string;
  source: string;
  result: "success" | "failure" | "pending";
  metadata?: Record<string, unknown>;
}

@Injectable()
export class StructuredLogger {
  private readonly logger = new Logger("Aivor");

  info(input: StructuredLogInput) {
    this.write("info", input);
  }

  warn(input: StructuredLogInput) {
    this.write("warn", input);
  }

  error(input: StructuredLogInput) {
    this.write("error", input);
  }

  debug(input: StructuredLogInput) {
    this.write("debug", input);
  }

  private write(level: LogLevel, input: StructuredLogInput) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      event: input.event,
      source: input.source,
      result: input.result,
      metadata: input.metadata ?? {}
    };

    const message = JSON.stringify(payload);

    if (level === "error") {
      this.logger.error(message);
      return;
    }

    if (level === "warn") {
      this.logger.warn(message);
      return;
    }

    if (level === "debug") {
      this.logger.debug(message);
      return;
    }

    this.logger.log(message);
  }
}
