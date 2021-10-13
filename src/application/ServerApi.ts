import { Express } from "express";
import Http from "http";
import { HttpServer } from "@application/HttpServer";
import { GraphServer } from "@application/GraphServer";
import { ApolloServer } from "apollo-server-express";

export interface ServerApiConfig {
  http?: boolean;
  graph?: boolean;
  sockets?: boolean;
  tcp?: boolean;
  controllers?: boolean;
}

export class ServerApi {
  private static instance: ServerApi;
  private server: Http.Server;
  private app: Express;
  private graphServer: ApolloServer;
  private init: ServerApiConfig;

  private getInitConfig(config?: ServerApiConfig): ServerApiConfig {
    const init: ServerApiConfig = {
      http: true,
      graph: false,
      sockets: false,
      tcp: false,
      controllers: false,
    };
    return { ...init, ...config };
  }

  public async start(config?: ServerApiConfig) {
    this.init = this.getInitConfig(config);
    if (this.init.http) {
      await this.startHTTP();
    }
    if (this.init.graph) {
      await this.startGraph();
    }
  }

  public async stop() {
    if (this.init.http) {
      this.server.close();
    }
  }

  public getHTTPServer(): Http.Server {
    return this.server;
  }
  public getGraphServer(): ApolloServer {
    return this.graphServer;
  }
  public setHTTPServer(server: Http.Server) {
    this.server = server;
  }
  public setExpressApp(app: Express) {
    this.app = app;
  }
  public setGraphServer(graphServer: ApolloServer) {
    this.graphServer = graphServer;
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
    this.setGraphServer(GraphApp.getServerInstance());
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
