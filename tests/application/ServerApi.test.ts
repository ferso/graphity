import "module-alias/register";
import "@core/common/logger";
import "@core/common/loadenv";
import request from "supertest";
import { ServerApi } from "../../src/application/ServerApi";

let App: ServerApi;
beforeAll(async () => {
  App = ServerApi.create();
  await App.start({
    http: true,
    graph: true,
  });
});

afterAll(async () => {
  await App.stop();
});

describe("ServerApi tests", () => {
  it("should test ServerApi run", async () => {
    request(App.getHTTPServerInstance()).get("/").expect(200);
  });
  it("should test GraphServer run", async () => {
    let graphServer = App.getGraphServerInstance();
    const result = await graphServer.executeOperation({
      query: "query{test}",
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.test).toBe(true);
  });
});
