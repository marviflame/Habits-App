import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../lib/auth';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
