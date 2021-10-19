import { IAppConfig } from "@core/interfaces/IAppConfig";
const config: IAppConfig = {
  env: process.env.ENV || "develepment",
  appName: process.env.APPNAME || "Boilerplate app",
  appVersion: process.env.APPVERSION || "1.0",
  logLevel: process.env.LOG_LEVEL || "silly",
  http: {
    host: process.env.HTTP_HOST || "localhost",
    port: Number(process.env.HTTP_PORT) || 9992,
    secretCsrf: process.env.SECRET_SESSION || "#$%^&*()",
    uploadLimit: process.env.HTTP_UPLOAD_LIMIT || "500mb",
  },
  graph: {
    endpoint: process.env.GRAPH_ENDPOINT || "/api",
    socketEndpoint: process.env.GRAPH_SOCKET_ENDPOINT || "/sockets",
  },
  redis: {
    host: "localhost",
    port: 6379,
  },
};

export default config;
