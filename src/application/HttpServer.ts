import express, { Express } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import csrf from "csurf";

declare module "http" {
  interface IncomingMessage {
    rawBody: any;
    orm: any;
  }
}

export class HttpServer {
  private static instance: HttpServer;
  private readonly port?: number = Number(process.env.HTTP_PORT);
  private readonly upload_limit?: string = process.env.HTTP_UPLOAD_LIMIT;
  private readonly env?: string = process.env.NODE_ENV;
  private app: Express;
  private server: http.Server;

  private setExpressApp() {
    this.app = express();
  }
  private setHTTPServer() {
    this.server = http.createServer(this.app);
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
    this.app.use(csrf({ cookie: true }));
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
    await this.server.listen(this.port);
  }
  async run() {
    this.setExpressApp();
    this.setHTTPServer();
    this.cors();
    this.encode();
    this.parser();
    this.secure();
    this.listen();
    this.log();
  }

  private log(): void {
    globalThis.Logger.warn(`Server started at http://localhost:${this.port}`);
  }
  public static getInstance(): HttpServer {
    if (!HttpServer.instance) {
      HttpServer.instance = new HttpServer();
    }
    return HttpServer.instance;
  }
}
