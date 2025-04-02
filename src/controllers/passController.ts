import type { Request, Response } from 'express';
import { PassService } from '../services/passService.js';

const passService = new PassService();

export async function generatePass(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const passBuffer = await passService.generatePass(username);
    
    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename=kasbu-${username}.pkpass`
    });
    
    res.send(passBuffer);
  } catch (error) {
    console.error('Error en el controlador:', error);
    res.status(500).json({ error: 'No se pudo generar el pase' });
  }
} 