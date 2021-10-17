import { method } from "@core/decorators/method";
import { Request, Response, Router } from "express";
import { Service } from "typedi";

@Service()
class ControllerAction {
  @method({ method: "get", route: "/hola" })
  action(req: Request, res: Response) {
    res.json({ message: "hola" });
  }
}

export default new ControllerAction();
