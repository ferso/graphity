import { Request, Response } from "express";
export interface IControllerAction {
  action(req: Request, res: Response): any;
}

export abstract class AControllerAction {
  abstract action(req: Request, res: Response): any;
}
