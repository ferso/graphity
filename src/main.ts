import "reflect-metadata";
import "module-alias/register";
import "@core/common/loadenv";
import "@core/common/logger";
import config from "@infra/config/default";
import { StartApi } from "@infra/servers/StartApi";
import { ContainerDi } from "@application/di/container";

(async (): Promise<void> => {
  global.Logger.warn(`==================================================`);
  global.Logger.warn(`GRAPHIS v${process.env.APPVERSION}`);
  global.Logger.warn(`${process.env.APPNAME}`);
  global.Logger.warn(`==================================================`);
  ContainerDi.set("config", config);
  await runApplication();
})();
async function runApplication(): Promise<void> {
  const App: StartApi = ContainerDi.get(StartApi);
  await App.start({
    http: true,
    graph: true,
  });
}
