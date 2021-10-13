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

  public getHTTPServerInstance(): Http.Server {
    return this.server;
  }
  public getGraphServerInstance(): ApolloServer {
    return this.graphServer;
  }
  public setHTTPServerInstance(server: Http.Server) {
    this.server = server;
  }
  public setExpressAppInstance(app: Express) {
    this.app = app;
  }
  public setGraphServerInstance(graphServer: ApolloServer) {
    this.graphServer = graphServer;
  }
  //Start HTTP SERVER
  private async startHTTP() {
    const HttpApp: HttpServer = HttpServer.getInstance();
    await HttpApp.run();

    this.setExpressAppInstance(HttpApp.getApp());
    this.setHTTPServerInstance(HttpApp.getServer());
  }

  //Start GRAPH SERVER
  async startGraph() {
    const GraphApp: GraphServer = GraphServer.getInstance();
    GraphApp.setExpressApp(this.app);
    GraphApp.setHTTPServer(this.server);
    await GraphApp.run();
    this.setGraphServerInstance(GraphApp.getServerInstance());
  }
  startORM() {}
  startSockets() {}
  startTCP() {}
  startControllers() {}

  public static create(): ServerApi {
    if (!ServerApi.instance) {
      ServerApi.instance = new ServerApi();
    }
    return ServerApi.instance;
  }
}
