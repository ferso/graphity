export interface IAppConfig {
  env: string;
  appName: string;
  appVersion: string;
  logLevel: string;
  http: {
    host: string;
    port: number;
    secretCsrf: string;
    uploadLimit: string;
  };
  graph: {
    endpoint: string;
    socketEndpoint: string;
  };
  redis: {
    host: string;
    port: number;
  };
}
