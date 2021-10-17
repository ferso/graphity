import { method } from "@core/decorators/method";
import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
class ControllerAction {
  @method({ method: "get", route: "/test" })
  action(req: Request, res: Response) {
    res.json({ message: "ok" });
  }
}

export default new ControllerAction();
