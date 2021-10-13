import * as winston from "winston";
declare global {
  var Logger: winston.Logger;
}

class LoggerInstance {
  private static instance: LoggerInstance;
  private level = process.env.LOG_LEVEL;

  public run(): winston.Logger {
    const logger: winston.Logger = winston.createLogger({
      silent: false,
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

  public static getInstance(): LoggerInstance {
    if (!LoggerInstance.instance) {
      LoggerInstance.instance = new LoggerInstance();
    }
    return LoggerInstance.instance;
  }
}
const LoggerCore = LoggerInstance.getInstance();
export const Logger = LoggerCore.run();
export default Logger;
