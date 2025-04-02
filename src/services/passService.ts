import { PKPass } from 'passkit-generator';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..', '..');

export class PassService {
  private readonly certDir: string;
  private readonly modelPath: string;

  constructor() {
    this.certDir = path.join(ROOT_DIR, 'certificates');
    this.modelPath = path.join(ROOT_DIR, 'pass-model.pass');
  }

  async generatePass(username: string): Promise<Buffer> {
    try {
      // Leer los certificados
      const signerCert = await fs.readFile(path.join(this.certDir, 'signerCert.pem'));
      const signerKey = await fs.readFile(path.join(this.certDir, 'signerKey.pem'));
      const wwdr = await fs.readFile(path.join(this.certDir, 'wwdr.pem'));

      // Leer el modelo base del pase
      const modelJson = JSON.parse(
        await fs.readFile(path.join(this.modelPath, 'pass.json'), 'utf-8')
      );

      // Actualizar los campos dinámicos del modelo
      modelJson.serialNumber = `kasbu-${username}-${Date.now()}`;
      modelJson.description = `Kasbu Card para ${username}`;
      modelJson.generic.primaryFields[0].value = username;
      modelJson.generic.secondaryFields[0].value = `kasbu.com/${username}`;
      modelJson.barcodes[0].message = `kasbu.com/${username}`;

      // Escribir el modelo actualizado temporalmente
      const tempModelPath = path.join(this.modelPath, 'temp.pass');
      await fs.mkdir(tempModelPath, { recursive: true });
      await fs.writeFile(
        path.join(tempModelPath, 'pass.json'),
        JSON.stringify(modelJson, null, 2)
      );

      // Copiar las imágenes al modelo temporal
      const images = ['icon.png', 'icon@2x.png'];
      for (const image of images) {
        await fs.copyFile(
          path.join(this.modelPath, image),
          path.join(tempModelPath, image)
        );
      }

      // Crear el pase
      const pass = await PKPass.from({
        model: tempModelPath,
        certificates: {
          wwdr,
          signerCert,
          signerKey
        }
      });

      // Generar el pase
      const buffer = await pass.getAsBuffer();

      // Limpiar el directorio temporal
      await fs.rm(tempModelPath, { recursive: true, force: true });

      return buffer;
    } catch (error) {
      console.error('Error generando el pase de Apple Wallet:', error);
      throw new Error('No se pudo generar el pase de Apple Wallet');
    }
  }
} 