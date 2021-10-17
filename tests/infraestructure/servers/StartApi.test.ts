import "reflect-metadata";
import "module-alias/register";
import "@core/common/loadenv";
import "@core/common/logger";
import request from "supertest";
import { StartApi } from "@infra/servers/StartApi";
import Container from "typedi";
let App: StartApi;
beforeAll(async () => {
  App = Container.get(StartApi);
  await App.start({
    http: true,
    graph: true,
  });
});
afterAll(async () => {
  await App.stop();
});

describe("ServerApi tests", () => {
  it("should test HTTP Server run", async () => {
    request(App.getHTTPServerInstance()).get("/").expect(200);
  });
  it("should test Graph Server run", async () => {
    let graphServer = App.getGraphServerInstance();
    const result = await graphServer.executeOperation({
      query: "query{test}",
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.test).toBe(true);
  });
});
