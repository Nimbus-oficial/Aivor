import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import {
  DatabaseConfigurationError,
  DatabaseValidationError
} from "../../modules/database/database.errors";
import { StructuredLogger } from "../logging/structured-logger.service";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<{
      status: (status: number) => { json: (body: unknown) => void };
    }>();
    const status = getStatus(exception);
    const code = getCode(exception);

    this.logger.error({
      event: "api.error",
      source: "backend",
      result: "failure",
      metadata: {
        status,
        code,
        message: exception instanceof Error ? exception.message : "Unknown error"
      }
    });

    response.status(status).json({
      ok: false,
      error: {
        code,
        message: getPublicMessage(exception)
      }
    });
  }
}

function getStatus(exception: unknown) {
  if (exception instanceof HttpException) return exception.getStatus();
  if (exception instanceof DatabaseValidationError) return HttpStatus.BAD_REQUEST;
  if (exception instanceof DatabaseConfigurationError) return HttpStatus.SERVICE_UNAVAILABLE;
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function getCode(exception: unknown) {
  if (exception instanceof DatabaseValidationError) return "VALIDATION_ERROR";
  if (exception instanceof DatabaseConfigurationError) return "DATABASE_UNAVAILABLE";
  if (exception instanceof HttpException) return exception.name;
  return "INTERNAL_ERROR";
}

function getPublicMessage(exception: unknown) {
  if (
    exception instanceof DatabaseValidationError ||
    exception instanceof DatabaseConfigurationError ||
    exception instanceof HttpException
  ) {
    return exception.message;
  }

  return "Unexpected backend error";
}
