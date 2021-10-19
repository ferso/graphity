import { method } from "@core/decorators/method";
import { IControllerAction } from "@core/interfaces/IControllerAction";
import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
class ControllerAction implements IControllerAction {
  @method({ method: "get", route: "/test" })
  action(req: Request, res: Response) {
    res.json({ message: "ok" });
  }
}

export default new ControllerAction();
