import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BrandMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const brand = req.headers['x-brand'] || 'chemtronics';
    req['brand'] = brand;
    next();
  }
}