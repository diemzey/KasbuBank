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
    console.log('Directorios configurados:', {
      ROOT_DIR,
      certDir: this.certDir,
      modelPath: this.modelPath
    });
  }

  async generatePass(username: string): Promise<Buffer> {
    try {
      console.log('Iniciando generación de pase para:', username);
      
      // Verificar que los directorios existen
      const certDirExists = await fs.access(this.certDir).then(() => true).catch(() => false);
      const modelPathExists = await fs.access(this.modelPath).then(() => true).catch(() => false);
      console.log('Verificación de directorios:', {
        certDirExists,
        modelPathExists
      });

      // Leer los certificados
      console.log('Intentando leer certificados desde:', this.certDir);
      const signerCert = await fs.readFile(path.join(this.certDir, 'signerCert.pem'));
      console.log('✓ signerCert leído');
      const signerKey = await fs.readFile(path.join(this.certDir, 'signerKey.pem'));
      console.log('✓ signerKey leído');
      const wwdr = await fs.readFile(path.join(this.certDir, 'wwdr.pem'));
      console.log('✓ wwdr leído');

      // Leer el modelo base del pase
      console.log('Intentando leer modelo desde:', path.join(this.modelPath, 'pass.json'));
      const modelJson = JSON.parse(
        await fs.readFile(path.join(this.modelPath, 'pass.json'), 'utf-8')
      );
      console.log('✓ Modelo JSON leído y parseado');

      // Actualizar los campos dinámicos del modelo
      modelJson.serialNumber = `kasbu-${username}-${Date.now()}`;
      modelJson.description = `Kasbu Card para ${username}`;
      modelJson.generic.primaryFields[0].value = username;
      modelJson.generic.secondaryFields[0].value = `kasbu.com/${username}`;
      modelJson.barcodes[0].message = `kasbu.com/${username}`;
      console.log('✓ Campos del modelo actualizados');

      // Escribir el modelo actualizado temporalmente
      const tempModelPath = path.join(this.modelPath, 'temp.pass');
      console.log('Creando directorio temporal en:', tempModelPath);
      await fs.mkdir(tempModelPath, { recursive: true });
      await fs.writeFile(
        path.join(tempModelPath, 'pass.json'),
        JSON.stringify(modelJson, null, 2)
      );
      console.log('✓ Modelo temporal creado');

      // Copiar las imágenes al modelo temporal
      const images = ['icon.png', 'icon@2x.png'];
      console.log('Copiando imágenes al modelo temporal');
      for (const image of images) {
        console.log('Copiando imagen:', image);
        await fs.copyFile(
          path.join(this.modelPath, image),
          path.join(tempModelPath, image)
        );
      }
      console.log('✓ Imágenes copiadas');

      // Crear el pase
      console.log('Iniciando creación del pase con PKPass');
      const pass = await PKPass.from({
        model: tempModelPath,
        certificates: {
          wwdr,
          signerCert,
          signerKey
        }
      });
      console.log('✓ PKPass creado');

      // Generar el pase
      console.log('Generando buffer del pase');
      const buffer = await pass.getAsBuffer();
      console.log('✓ Buffer del pase generado');

      // Limpiar el directorio temporal
      console.log('Limpiando directorio temporal');
      await fs.rm(tempModelPath, { recursive: true, force: true });
      console.log('✓ Directorio temporal limpiado');

      return buffer;
    } catch (error: any) {
      console.error('Error detallado generando el pase de Apple Wallet:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('No se pudo generar el pase de Apple Wallet');
    }
  }
} 