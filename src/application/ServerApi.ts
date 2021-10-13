import { Express } from "express";
import Http from "http";
import { HttpServer } from "@application/HttpServer";
import { GraphServer } from "@application/GraphServer";
export class ServerApi {
  private static instance: ServerApi;
  private server: Http.Server;
  private app: Express;
  public async start() {
    await this.startHTTP();
    await this.startGraph();
  }

  public setHTTPServer(server: Http.Server) {
    this.server = server;
  }
  public setExpressApp(app: Express) {
    this.app = app;
  }
  //Start HTTP SERVER
  private async startHTTP() {
    const HttpApp: HttpServer = HttpServer.getInstance();
    await HttpApp.run();

    this.setExpressApp(HttpApp.getApp());
    this.setHTTPServer(HttpApp.getServer());
  }

  //Start GRAPH SERVER
  async startGraph() {
    const GraphApp: GraphServer = GraphServer.getInstance();
    GraphApp.setExpressApp(this.app);
    GraphApp.setHTTPServer(this.server);
    await GraphApp.run();
  }
  startORM() {}
  startSockets() {}
  startTCP() {}
  startControllers() {}

  public static getInstance(): ServerApi {
    if (!ServerApi.instance) {
      ServerApi.instance = new ServerApi();
    }
    return ServerApi.instance;
  }
}
