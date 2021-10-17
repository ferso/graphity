import { method } from "@core/decorators/method";
import { AControllerAction } from "@core/interfaces/IControllerAction";
import { Request, Response, Router } from "express";
import { Service } from "typedi";
@Service()
class ControllerAction extends AControllerAction {
  @method({ method: "get", route: "/hola/:id" })
  action(req: Request, res: Response) {
    console.log();
    res.json({ message: `Hola ${req.params["id"]}` });
  }
}

export default new ControllerAction();
