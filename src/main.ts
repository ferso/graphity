import "reflect-metadata";
import "module-alias/register";
import "@core/common/loadenv";
import "@core/common/logger";
import { StartApi } from "@infra/servers/StartApi";
import Container from "typedi";

(async (): Promise<void> => {
  global.Logger.info(`==================================================`);
  global.Logger.info(`GRAPHIS v${process.env.APPVERSION}`);
  global.Logger.info(`${process.env.APPNAME}`);
  global.Logger.info(`==================================================`);
  await runApplication();
})();
async function runApplication(): Promise<void> {
  const App: StartApi = Container.get(StartApi);
  await App.start({
    http: true,
    graph: true,
  });
}
