import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function me(req: Request & { adminId?: string }, res: Response) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, email: true, createdAt: true }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function initAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await prisma.admin.findUnique({ where: { email } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: { email, password: hashedPassword }
    });
    console.log(`Admin created: ${email}`);
  }
}
