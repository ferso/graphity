import { ServiceDi } from "@application/di/service";
import { method } from "@core/decorators/method";
import { IControllerAction } from "@core/interfaces/IControllerAction";
import { Request, Response, Router } from "express";

@ServiceDi()
class ControllerAction implements IControllerAction {
  @method({ method: "post", route: "/hola" })
  action(req: Request, res: Response) {
    res.json({ message: "hola" });
  }
}
export default new ControllerAction();
