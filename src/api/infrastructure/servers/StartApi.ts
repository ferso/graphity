import { HttpServer } from "@infra/servers/HttpServer";
import { GraphServer } from "@infra/servers/GraphServer";
import { Container, Service } from "typedi";

export interface StartApiConfig {
  http?: boolean;
  graph?: boolean;
  sockets?: boolean;
  tcp?: boolean;
  controllers?: boolean;
}
@Service()
export class StartApi {
  private static instance: StartApi;
  private HttpApp: HttpServer;
  private GraphApp: GraphServer;
  private init: StartApiConfig;

  private getInitConfig(config?: StartApiConfig): StartApiConfig {
    const init: StartApiConfig = {
      http: true,
      graph: false,
      sockets: false,
      tcp: false,
      controllers: false,
    };
    return { ...init, ...config };
  }
  public async start(config?: StartApiConfig) {
    this.init = this.getInitConfig(config);
    try {
      if (this.init.http) {
        await this.startHTTP();
      }
      if (this.init.graph) {
        await this.startGraph();
      }
    } catch (error: any) {
      global.Logger.error(error.message);
    }
  }
  public async stop() {
    if (this.init.http) {
      this.HttpApp.getServer().close();
    }
  }
  getHTTPServerInstance() {
    return this.HttpApp.getServer();
  }
  getGraphServerInstance() {
    return this.GraphApp.getServer();
  }
  //Start HTTP SERVER
  private async startHTTP() {
    this.HttpApp = Container.get(HttpServer);
    await this.HttpApp.run();
  }
  //Start GRAPH SERVER
  async startGraph() {
    this.GraphApp = Container.get(GraphServer);
    await this.GraphApp.run();
  }
  startORM() {}
  startSockets() {}
  startTCP() {}
  startControllers() {}
}
