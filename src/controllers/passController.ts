import type { Request, Response } from 'express';
import { PassService } from '../services/passService.js';

const passService = new PassService();

export async function generatePass(req: Request, res: Response) {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const passBuffer = await passService.generatePass(username);
    
    // Headers críticos para Safari
    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Length': passBuffer.length,
      'Content-Disposition': 'inline',
      'Cache-Control': 'no-cache'
    });
    
    return res.send(passBuffer);
  } catch (error) {
    console.error('Error en el controlador:', error);
    return res.status(500).json({ error: 'No se pudo generar el pase' });
  }
} 