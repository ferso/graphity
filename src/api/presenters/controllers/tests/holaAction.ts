import { method } from "@core/decorators/method";
import { AControllerAction } from "@core/interfaces/IControllerAction";
import { Request, Response, Router } from "express";
import { Service } from "typedi";

@Service()
class ControllerAction extends AControllerAction {
  @method({ method: "get", route: "/hola" })
  action(req: Request, res: Response) {
    res.json({ message: "hola" });
  }
}

export default new ControllerAction();
