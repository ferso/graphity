import { Express } from "express";
import Http from "http";
import fs from "fs";
import path from "path";

import { GraphQLSchema, execute, subscribe, DocumentNode } from "graphql";
import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { buildSchema } from "type-graphql";
import { PubSub } from "graphql-subscriptions";
import { HttpServer } from "./HttpServer";
import { ServiceDi } from "@application/di/service";
import { InjectDi } from "@application/di/inject";
import { IAppConfig } from "@core/interfaces/IAppConfig";
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";
// import { graphqlUploadExpress } from "graphql-upload";

@ServiceDi()
export class GraphServer {
  private app: Express;
  private server: Http.Server;
  private readonly env: string;
  private readonly host: string;
  private readonly port: number;
  private readonly socketEndpoint: string;

  private readonly endpoint?: string = process.env.GRAPH_ENDPOINT;
  private graphServer: ApolloServer;
  private schema: GraphQLSchema;
  private subscriptionServer: SubscriptionServer;
  private pubsub: RedisPubSub;
  private redisHost: string;
  private redisPort: number;

  private resolversPath: string = path.resolve("src/api/presenters/resolvers");

  constructor(
    @InjectDi("config") private readonly config: IAppConfig,
    private readonly HttpServer: HttpServer
  ) {
    this.app = this.HttpServer.getApp();
    this.server = this.HttpServer.getServer();
    this.redisHost = config.redis.host;
    this.redisPort = config.redis.port;
    this.env = config.env;
    this.host = config.http.host;
    this.port = config.http.port;
    this.endpoint = config.graph.endpoint;
    this.socketEndpoint = config.graph.socketEndpoint;
  }

  async setPubSub() {
    const options = {
      host: this.redisHost,
      port: this.redisPort,
      retryStrategy: (times: any) => {
        return Math.min(times * 50, 2000);
      },
    };
    this.pubsub = new RedisPubSub({
      publisher: new Redis(options),
      subscriber: new Redis(options),
    });
  }

  public setHTTPServer(server: Http.Server) {
    this.server = server;
  }
  public setExpressApp(app: Express) {
    this.app = app;
  }

  private async loadResolvers() {
    if (fs.existsSync(this.resolversPath)) {
      let allFiles = fs
        .readdirSync(this.resolversPath)
        .map(async (resolver) => {
          if (resolver.includes("resolver")) {
            const directory = path.join(this.resolversPath, resolver);
            if (!fs.lstatSync(directory).isDirectory()) {
              let instance = await import(directory);
              return instance.default;
            }
          }
        });
      return await Promise.all(allFiles);
    }
  }
  private async setSchema() {
    const resolvers: any = await this.loadResolvers();
    this.schema = await buildSchema({
      resolvers: resolvers,
      emitSchemaFile: true,
      pubSub: this.pubsub,
    });
  }

  async initServer() {
    const subscriptionServer = this.subscriptionServer;
    this.graphServer = new ApolloServer({
      schema: this.schema,
      debug: false,
      introspection: this.env === "production" ? false : true,

      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer: this.server }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              },
            };
          },
        },
      ],
    });
    await this.graphServer.start();
  }
  private async attachGraphServer() {
    this.graphServer.applyMiddleware({
      app: this.app,
      path: this.endpoint,
    });
  }
  private async setSuscriptionServer() {
    try {
      this.subscriptionServer = SubscriptionServer.create(
        {
          schema: this.schema,
          execute,
          subscribe,
          onConnect(connectionParams: any, webSocket: any, context: any) {
            // console.log("Connected!");
          },
          onDisconnect(webSocket: any, context: any) {
            // console.log("Disconnected!");
          },
        },
        {
          server: this.server,
          path: this.socketEndpoint,
        }
      );
    } catch (error: any) {
      global.Logger.error(error.message);
      throw Error(
        "Trying to start Graph Socket Server, but something happened"
      );
    }
  }
  public getServer() {
    return this.graphServer;
  }
  public async run() {
    await this.setPubSub();
    await this.setSchema();
    await this.setSuscriptionServer();
    await this.initServer();
    await this.attachGraphServer();
    this.logHTPP();
    this.logSocket();
  }
  private logHTPP(): void {
    globalThis.Logger.warn(
      `Graphql query module initialized at //${this.host}:${this.port}${this.endpoint}`
    );
  }
  private logSocket(): void {
    globalThis.Logger.warn(
      `Graphql web socket suscriptions module initialized at //localhost:${this.port}${this.socketEndpoint}`
    );
  }
  private logError(): void {
    // globalThis.Logger.error(
    //   `Graphql module no initialized, no scheme was found`
    // );
  }
}
