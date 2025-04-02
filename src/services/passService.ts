import { PKPass } from 'passkit-generator';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', '..');

export class PassService {
  private readonly modelPath: string;

  constructor() {
    this.modelPath = path.join(ROOT_DIR, 'pass-model');
  }

  async generatePass(username: string): Promise<Buffer> {
    try {
      // Obtener certificados desde variables de entorno
      const signerCert = process.env.SIGNER_CERT;
      const signerKey = process.env.SIGNER_KEY;
      const wwdr = process.env.WWDR_CERT;

      if (!signerCert || !signerKey || !wwdr) {
        throw new Error('Certificados no configurados');
      }

      // Crear el pase
      const pass = new PKPass({
        certificates: {
          wwdr: Buffer.from(wwdr),
          signerCert: Buffer.from(signerCert),
          signerKey: Buffer.from(signerKey)
        },
        passTypeIdentifier: process.env.PASS_TYPE_IDENTIFIER || 'pass.com.kasbu.card',
        teamIdentifier: process.env.TEAM_IDENTIFIER || 'VGYZRF6G9C',
        serialNumber: `kasbu-${username}-${Date.now()}`,
        description: `Kasbu Card para ${username}`,
        organizationName: 'Kasbu'
      });

      // Configurar el código de barras
      pass.setBarcodes({
        message: `kasbu.com/${username}`,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      });

      // Localización en español
      pass.localize('es', {
        'PASS_HEADER': 'Kasbu',
        'PASS_TITLE': `Kasbu de ${username}`,
      });

      // Generar el pase
      return await pass.getAsBuffer();
    } catch (error) {
      console.error('Error generando el pase de Apple Wallet:', error);
      throw new Error('No se pudo generar el pase de Apple Wallet');
    }
  }
} 