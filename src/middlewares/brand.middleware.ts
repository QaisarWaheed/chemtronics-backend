/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BrandMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Accept brand from header (normal requests) or query param (window.open PDF)
    const brand = (
      (req.headers['x-brand'] as string) ||
      (req.query?.brand as string) ||
      'chemtronics'
    )
      .toLowerCase()
      .trim();
    req['brand'] = brand;
    console.log(
      'Incoming Header x-brand:',
      req.headers['x-brand'],
      '→ normalized:',
      brand,
    );
    next();
  }
}
