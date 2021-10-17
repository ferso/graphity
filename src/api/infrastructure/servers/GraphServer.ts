import { Express } from "express";
import Http from "http";
import { GraphQLSchema, execute, subscribe, DocumentNode } from "graphql";
import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PubSub } from "graphql-subscriptions";
import { HttpServer } from "./HttpServer";
import { Container, Service } from "typedi";

// import { graphqlUploadExpress } from "graphql-upload";
// import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
// import { GraphQLSchemaContext } from "apollo-server-types";

@Service()
export class GraphServer {
  private app: Express;
  private server: Http.Server;
  private readonly env?: string = process.env.NODE_ENV;
  private readonly port?: string = process.env.HTTP_PORT;
  private readonly socketEndpoint?: string =
    process.env.GRAPH_SOCKET_ENDPOINT || "/sockets";

  private readonly endpoint?: string = process.env.GRAPH_ENDPOINT;
  private graphServer: ApolloServer;
  private schema: GraphQLSchema;
  private subscriptionServer: SubscriptionServer;
  private pubsub: PubSub;
  currentNumber = 0;

  constructor(private readonly HttpServer: HttpServer) {
    this.app = this.HttpServer.getApp();
    this.server = this.HttpServer.getServer();
  }

  private typeDefs: DocumentNode;
  private resolvers: any;
  setPubSub() {
    this.pubsub = new PubSub();
  }

  public setHTTPServer(server: Http.Server) {
    this.server = server;
  }
  public setExpressApp(app: Express) {
    this.app = app;
  }

  private createDefaultScheme() {
    this.typeDefs = gql`
      type Query {
        test: Boolean
      }
      type Query {
        currentNumber: Int
      }

      type Subscription {
        numberIncremented: Int
      }
    `;
    this.resolvers = {
      Query: {
        test: () => true,
        currentNumber() {
          return this.currentNumber;
        },
      },

      Subscription: {
        numberIncremented: {
          subscribe: () => this.pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
        },
      },
    };
  }
  private async setSchema() {
    this.createDefaultScheme();
    this.schema = makeExecutableSchema({
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
    });
  }

  incrementNumber() {
    this.currentNumber++;
    this.pubsub.publish("NUMBER_INCREMENTED", {
      numberIncremented: this.currentNumber,
    });

    setTimeout(() => {
      this.incrementNumber();
    }, 2000);
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
      path: `${this.endpoint}`,
    });
  }
  private async setSuscriptionServer() {
    this.setPubSub();
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
    await this.setSchema();
    await this.setSuscriptionServer();
    await this.initServer();
    await this.attachGraphServer();
    this.logHTPP();
    this.logSocket();
  }
  private logHTPP(): void {
    globalThis.Logger.info(
      `Graphql query module initialized at http://localhost:${this.port}${this.endpoint}`
    );
  }

  private logSocket(): void {
    globalThis.Logger.info(
      `Graphql suscriptions module initialized at ws://localhost:${this.port}${this.socketEndpoint}`
    );
  }

  private logError(): void {
    // globalThis.Logger.error(
    //   `Graphql module no initialized, no scheme was found`
    // );
  }
}
