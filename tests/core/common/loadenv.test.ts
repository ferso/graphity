import "reflect-metadata";
import "module-alias/register";

describe("loadEnv test", () => {
  it("should enviroment loaded as test  ", async () => {
    expect(process.env.ENV).toBe("test");
  });
});
