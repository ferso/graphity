import { Request, Response } from "express";
export interface IControllerAction {
  action(req: Request, res: Response): void;
}

export abstract class AControllerAction implements IControllerAction {
  abstract action(req: Request, res: Response): void;
}
