import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let jwtSecret: string;

function generateSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getJwtSecret(): string {
  if (jwtSecret) return jwtSecret;

  // If set in env, use it
  if (process.env.JWT_SECRET) {
    jwtSecret = process.env.JWT_SECRET;
    return jwtSecret;
  }

  // Try to load from file (persistent across restarts)
  const dataDir = process.env.DATA_DIR || process.cwd();
  const secretFile = path.join(dataDir, '.jwt-secret');

  try {
    if (fs.existsSync(secretFile)) {
      jwtSecret = fs.readFileSync(secretFile, 'utf-8').trim();
      console.log('JWT secret loaded from file');
      return jwtSecret;
    }
  } catch {
    // ignore read errors
  }

  // Generate new secret
  jwtSecret = generateSecret();

  try {
    fs.writeFileSync(secretFile, jwtSecret);
    console.log('JWT secret generated and saved');
  } catch {
    console.log('JWT secret generated (not persisted)');
  }

  return jwtSecret;
}
