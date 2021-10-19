import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Container, Service } from "typedi";
import { LoggerInstance } from "./logger";

@Service()
export class LoadEnviroment {
  constructor(private readonly LoggerInstance: LoggerInstance) {
    this.LoggerInstance = LoggerInstance;
    //load env file defined at start
    this.setEnviromentValues();
    //update logger level after load file
    this.updateLoggerLevel();
  }
  setEnviromentValues() {
    process.env.ENV = !process.env.ENV ? "dev" : process.env.ENV;
    let envConfig: any = dotenv.config();
    let envFile = path.resolve(`.env.${process.env.ENV}`);
    if (fs.existsSync(envFile)) {
      global.Logger.info(`Enviroment filed loaded: .env.${process.env.ENV}`);
      try {
        envConfig = dotenv.parse(fs.readFileSync(envFile));
        for (const k in envConfig) {
          process.env[k] = envConfig[k];
        }
      } catch (error) {
        global.Logger.error(
          `Error try to read Enviroment file [.env.${process.env.ENV}]`
        );
        throw Error(
          `Error try to read Enviroment file [.env.${process.env.ENV}]`
        );
      }
    }
  }
  private updateLoggerLevel() {
    this.LoggerInstance.setLevel(process.env.LOG_LEVEL);
    this.LoggerInstance.run();
  }
}
Container.get(LoadEnviroment);
