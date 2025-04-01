# Kasbu Wallet Backend Service

Servicio backend para generar pases de Apple Wallet para Kasbu.

## Requisitos

- Node.js 18 o superior
- npm o yarn
- Certificados de Apple Wallet
- Modelo de pase configurado

## Estructura del Proyecto

```
.
├── certificates/          # Certificados de Apple Wallet
├── pass-model/           # Archivos del modelo de pase
├── src/                  # Código fuente
└── dist/                 # Código compilado
```

## Configuración

1. Instala las dependencias:
```bash
npm install
```

2. Copia los certificados necesarios en el directorio `certificates/`:
- signerCert.pem
- signerKey.pem
- wwdr.pem

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:
- PORT: Puerto del servidor (por defecto: 3000)
- NODE_ENV: Entorno (development/production)
- FRONTEND_URL: URL del frontend para CORS

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/wallet/pass
Genera un pase de Apple Wallet con los datos proporcionados.

#### Request
```json
{
  "serialNumber": "string",
  "name": "string",
  "eventName": "string",
  "eventDate": "string"
}
```

#### Response
- 200: Archivo .pkpass
- 400: Error de validación
- 500: Error del servidor 