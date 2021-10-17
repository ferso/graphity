import { method } from "@core/decorators/method";
import { AControllerAction } from "@core/interfaces/IControllerAction";
import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
class ControllerAction extends AControllerAction {
  @method({ method: "get", route: "/test" })
  action(req: Request, res: Response) {
    res.json({ message: "ok" });
  }
}

export default new ControllerAction();
