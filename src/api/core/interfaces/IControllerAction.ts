import { Request, Response } from "express";
export interface IControllerAction {
  action(req: Request, res: Response): void;
}
