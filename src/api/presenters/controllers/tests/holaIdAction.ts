import { method } from "@core/decorators/method";
import { Request, Response, Router } from "express";
import { Service } from "typedi";
@Service()
class ControllerAction {
  @method({ method: "get", route: "/hola/:id" })
  action(req: Request, res: Response) {
    console.log();
    res.json({ message: `Hola ${req.params["id"]}` });
  }
}

export default new ControllerAction();
