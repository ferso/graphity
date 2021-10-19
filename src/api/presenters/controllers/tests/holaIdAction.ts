import { method } from "@core/decorators/method";
import { IControllerAction } from "@core/interfaces/IControllerAction";
import { Request, Response, Router } from "express";
import { Service } from "typedi";
@Service()
class ControllerAction implements IControllerAction {
  @method({ method: "get", route: "/hola/:id" })
  action(req: Request, res: Response) {
    console.log();
    res.json({ message: `Hola ${req.params["id"]}` });
  }
}

export default new ControllerAction();
