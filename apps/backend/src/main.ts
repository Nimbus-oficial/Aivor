import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { StructuredLogger } from "./common/logging/structured-logger.service";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ApiExceptionFilter(app.get(StructuredLogger)));
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true
  });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

void bootstrap();
