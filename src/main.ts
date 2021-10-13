import "module-alias/register";
import "@core/common/logger";
import "@core/common/loadenv";
import { ServerApi } from "@application/ServerApi";

(async (): Promise<void> => {
  global.Logger.info(`==================================================`);
  global.Logger.info(`GRAPHIS v${process.env.APPVERSION}`);
  global.Logger.info(`${process.env.APPNAME}`);
  global.Logger.info(`==================================================`);
  await runApplication();
})();

async function runApplication(): Promise<void> {
  const App: ServerApi = ServerApi.getInstance();
  await App.start({
    http: true,
    graph: true,
  });
}
