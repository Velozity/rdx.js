import type { Logger } from "pino";
import pino from "pino";

const logger: Logger =
  process.env.NODE_ENV === "production"
    ? pino({ level: "warn" })
    : pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: "debug",
      });

export const createLogger = (name: string) => logger.child({ name });
