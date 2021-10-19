import "reflect-metadata";
import "module-alias/register";
import "@core/common/loadenv";
import "@core/common/logger";

describe("Logger Tests", () => {
  it("should logger has and enviroment", async () => {
    const logger = global.Logger;
    expect(logger.level).toBe("error");
    expect(logger.isInfoEnabled()).toBe(false);
    expect(logger.isErrorEnabled()).toBe(true);
  });
});
