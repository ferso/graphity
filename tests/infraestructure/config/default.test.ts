import "reflect-metadata";
import "module-alias/register";
import "@core/common/loadenv";
import config from "@infra/config/default";

describe("Config Tests", () => {
  it("should load config file", async () => {
    expect(config.http.port).toBe(process.env.HTTP_PORT);
  });
});
