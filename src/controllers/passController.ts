import type { Request, Response } from 'express';
import { PassService } from '../services/passService.js';

const passService = new PassService();

export async function generatePass(req: Request, res: Response) {
  console.log('🚀 Iniciando generación de pase para:', req.params.username);
  console.log('📱 User Agent:', req.headers['user-agent']);
  
  try {
    const { username } = req.params;
    
    if (!username) {
      console.log('❌ Error: Username no proporcionado');
      return res.status(400).json({ error: 'Username is required' });
    }

    console.log('⏳ Generando pass buffer...');
    const passBuffer = await passService.generatePass(username);
    console.log('✅ Pass buffer generado, tamaño:', passBuffer.length, 'bytes');
    
    // Headers críticos para Safari
    const headers = {
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Length': passBuffer.length,
      'Content-Disposition': 'inline',
      'Cache-Control': 'no-cache'
    };
    
    console.log('📤 Enviando respuesta con headers:', headers);
    res.set(headers);
    
    return res.send(passBuffer);
  } catch (error) {
    console.error('❌ Error detallado en el controlador:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return res.status(500).json({ error: 'No se pudo generar el pase' });
  }
} 