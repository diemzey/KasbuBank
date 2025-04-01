import type { Request, Response } from 'express';
import { PassService } from '../services/passService.ts';

export class PassController {
  private passService: PassService;

  constructor() {
    this.passService = new PassService();
  }

  generatePass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json({ error: 'Se requiere un nombre de usuario' });
        return;
      }

      const passBuffer = await this.passService.generatePass(username);

      res.set({
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename=kasbu-${username}.pkpass`
      });

      res.send(passBuffer);
    } catch (error) {
      console.error('Error en el controlador de pases:', error);
      res.status(500).json({ error: 'Error al generar el pase' });
    }
  };
} 