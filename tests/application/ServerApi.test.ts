import "module-alias/register";
import "@core/common/logger";
import "@core/common/loadenv";
import request from "supertest";

import { ServerApi } from "../../src/application/ServerApi";
import { gql } from "apollo-server-core";

let App: ServerApi;
beforeAll(async () => {
  App = ServerApi.getInstance();
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
    request(App.getHTTPServer()).get("/").expect(200);
  });
  it("should test GraphServer run", async () => {
    let graphServer = App.getGraphServer();
    const result = await graphServer.executeOperation({
      query: "query{test}",
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.test).toBe(true);
  });
});
