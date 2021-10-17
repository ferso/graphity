import Container, { Service } from "typedi";
import * as winston from "winston";
declare global {
  var Logger: winston.Logger;
}

@Service()
export class LoggerInstance {
  private static instance: LoggerInstance;
  private level: string = "silly";

  public setLevel(level?: string) {
    if (level) {
      this.level = level;
    }
    return this;
  }
  public run() {
    const logger: winston.Logger = winston.createLogger({
      silent: false,
      level: this.level,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple(),
        winston.format.colorize(),
        winston.format.timestamp({
          format: "YYYY-MM-DDTHH:mm:ss",
        }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      transports: [
        new winston.transports.Console({
          level: this.level || "silly",
        }),
      ],
    });
    global.Logger = logger;
    return logger;
  }
}

Container.get(LoggerInstance).run();
