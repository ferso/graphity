import fs from "fs";
import http from "http";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { ServiceDi } from "@application/di/service";
import { InjectDi } from "@application/di/inject";
import { IAppConfig } from "@core/interfaces/IAppConfig";

declare module "http" {
  interface IncomingMessage {
    rawBody: any;
    orm: any;
  }
}
@ServiceDi()
export class HttpServer {
  private readonly port: number;
  private readonly upload_limit;
  private readonly env: string;
  private readonly secretCsrf;
  private app: Express;
  private server: http.Server;

  private controllersPath: string = path.resolve(
    "src/api/presenters/controllers"
  );

  constructor(@InjectDi("config") private readonly config: IAppConfig) {
    this.env = config.env;
    this.port = config.http.port;
    this.secretCsrf = config.http.secretCsrf;
    this.upload_limit = config.http.uploadLimit;
  }

  private setExpressApp() {
    this.app = express();
  }
  private cors() {
    this.app.use(cors());
  }
  private encode() {
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: this.upload_limit || "500mb",
        parameterLimit: 50000,
      })
    );
  }
  private parser() {
    this.app.use(
      express.json({
        verify: (req, _res, buf) => {
          req.rawBody = buf;
        },
      })
    );
    this.app.use(cookieParser());
  }
  private session() {
    this.app.use(
      session({
        secret: this.secretCsrf,
        resave: false,
        saveUninitialized: false,
      })
    );
  }
  private protection() {
    this.app.use(
      helmet({
        contentSecurityPolicy: this.env === "production" ? undefined : false,
      })
    );
  }
  public getServer() {
    return this.server;
  }
  public getApp() {
    return this.app;
  }
  async listen() {
    this.server = await this.app.listen(this.port);
  }
  controllers() {
    if (fs.existsSync(this.controllersPath)) {
      fs.readdirSync(this.controllersPath).forEach((controller) => {
        const controllerDirectory = path.join(this.controllersPath, controller);
        if (fs.lstatSync(controllerDirectory).isDirectory()) {
          fs.readdirSync(controllerDirectory).forEach(async (action: any) => {
            const actionPath = path.join(controllerDirectory, action);
            const actionFunction = await import(actionPath);
            const defaultAction = actionFunction.default;
            if (defaultAction) {
              action = defaultAction.action;
              if (action instanceof Function) {
                const { method, uri, actionFunction } = action();
                // @ts-ignore
                this.app[method](uri, actionFunction);
              }
            }
          });
        }
      });
    } else {
      global.Logger.warn(
        "Controllers path does not exist in the directory tree"
      );
    }
  }
  async run() {
    this.setExpressApp();
    this.cors();
    this.encode();
    this.parser();
    this.session();
    this.protection();
    this.listen();
    this.controllers();
    this.log();
  }
  private log(): void {
    globalThis.Logger.warn(`Server started at http://localhost:${this.port}`);
  }
}
