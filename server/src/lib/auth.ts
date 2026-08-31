import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET: string = (process.env.JWT_SECRET as string) || 'habits-dev-secret-change-in-production';
const JWT_EXPIRES_IN: string = (process.env.JWT_EXPIRES_IN as string) || '7d';

export interface JwtPayload {
  userId: number;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload as object | string, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;
  } catch {
    return null;
  }
};
