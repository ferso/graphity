import fs from "fs";
import http from "http";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import csrf from "csurf";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { Service } from "typedi";
import { IControllerAction } from "@core/interfaces/iControllerAction";

declare module "http" {
  interface IncomingMessage {
    rawBody: any;
    orm: any;
  }
}
@Service()
export class HttpServer {
  private readonly port?: number = Number(process.env.HTTP_PORT);
  private readonly upload_limit?: string = process.env.HTTP_UPLOAD_LIMIT;
  private readonly env?: string = process.env.NODE_ENV;
  private readonly secret: string = process.env.SECRET_SESSION || "secret";
  private app: Express;
  private server: http.Server;

  private controllersPath: string = path.resolve(
    "src/api/presenters/controllers"
  );

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
  }
  private secure() {
    this.app.use(
      session({
        secret: this.secret,
        resave: false,
        saveUninitialized: false,
      })
    );
    this.app.use(cookieParser());
    // this.app.use(csrf());
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
      global.Logger.info(
        "Controllers path does not exist in the directory tree"
      );
    }
  }
  async run() {
    this.setExpressApp();
    this.cors();
    this.encode();
    this.parser();
    this.secure();
    this.listen();
    this.controllers();
    this.log();
  }
  private log(): void {
    globalThis.Logger.info(`Server started at http://localhost:${this.port}`);
  }
}
