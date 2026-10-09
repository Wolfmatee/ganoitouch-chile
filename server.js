import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Asegurar que la carpeta de persistencia de datos exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// 1. Middlewares de Seguridad y Encabezados Básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 2. Middlewares de Parseo de Solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Catálogo de Productos Oficial (API de datos)
const PRODUCTS_CATALOG = [
  {
    id: 'classirico-truffle',
    title: 'ClassiRico Truffle',
    subtitle: 'Café negro tostado intenso con trufa negra y Ganoderma',
    format: 'Caja · 30 Sobres (90g neto)',
    origin: 'Kedah, Malasia · Plantaciones Orgánicas',
    keyIngredients: 'Café Tostado Clásico, Ganoderma Lucidum & Trufa Negra',
    mainBenefit: 'Energía Pura, Concentración & Cero Acidez Gástrica',
    image: '/src/assets/images/product_cafe_trufa_negra_1791228197245.jpg',
    video: '/src/assets/videos/classirico_video.mp4',
    inStock: true
  },
  {
    id: 'latterico-truffle',
    title: 'LatteRico Truffle',
    subtitle: 'Café latte cremoso & suave con trufa y crema vegetal',
    format: 'Caja · 20 Sobres (300g neto)',
    origin: 'Kedah, Malasia · Plantaciones Orgánicas',
    keyIngredients: 'Café Selecto, Crema Sedosa, Ganoderma & Trufa',
    mainBenefit: 'Textura Cremosa, Digestión Suave & Bienestar Diario',
    image: '/src/assets/images/product_latterico_truffle.jpg',
    video: '/src/assets/videos/latterico_video.mp4',
    inStock: true
  },
  {
    id: 'shokorico-truffle',
    title: 'ShokoRico Truffle',
    subtitle: 'Cacao fino & chocolate gourmet con Ganoderma y trufa',
    format: 'Caja · 20 Sobres (400g neto)',
    origin: 'Kedah, Malasia · Cacao Fino Seleccionado',
    keyIngredients: 'Cacao Puro Gourmet, Ganoderma & Trufa Negra',
    mainBenefit: 'Poder Antioxidante, Vitalidad & Placer Saludable',
    image: '/src/assets/images/product_mocha_premium_1791228217124.jpg',
    video: '/src/assets/videos/shokorico_video.mp4',
    inStock: true
  },
  {
    id: 'shampoo-ganoderma',
    title: 'Shampoo Piel&Brillo',
    subtitle: 'Cuidado capilar orgánico & fortalecimiento con Ganoderma',
    format: 'Frasco Dosificador · 300ml',
    origin: 'Gano Excel · Cuidado Capilar Botánico',
    keyIngredients: 'Extracto Estandarizado de Ganoderma Lucidum, Pantenol & Agentes Suavizantes',
    mainBenefit: 'Fortalecimiento de Raíz, Estimulación del Crecimiento & Brillo Natural',
    image: './src/assets/images/product_shampoo_ganoderma.jpg',
    inStock: true
  },
  {
    id: 'conditioner-ganoderma',
    title: 'Acondicionador Piel&Brillo',
    subtitle: 'Nutrición profunda, desenredo & brillo sedoso con Ganoderma',
    format: 'Frasco Dosificador · 300ml',
    origin: 'Gano Excel · Cuidado Capilar Botánico',
    keyIngredients: 'Extracto de Ganoderma Lucidum, Aceite Nutritivo & Vitamina E',
    mainBenefit: 'Desenredo Instantáneo, Suavidad Extrema & Protección Térmica',
    image: './src/assets/images/product_conditioner_ganoderma.jpg',
    inStock: true
  },
  {
    id: 'scrub-ganoderma',
    title: 'Shower Scrub Piel&Brillo',
    subtitle: 'Exfoliación corporal botánica & renovación dérmica',
    format: 'Frasco Dosificador · 300ml',
    origin: 'Gano Excel · Cuidado Corporal de Spa',
    keyIngredients: 'Ganoderma Lucidum, Micropartículas Exfoliantes & Complejo Botánico',
    mainBenefit: 'Renovación Dérmica, Exfoliación Suave & Hidratación Satinada',
    image: './src/assets/images/product_scrub_ganoderma.jpg',
    inStock: true
  },
  {
    id: 'pasta-dental-ganoderma',
    title: 'Pasta Dental Gano Fresh',
    subtitle: 'Protección dental botánica con menta fresca & cero flúor',
    format: 'Tubo · 150g',
    origin: 'Fórmula Natural · Kedah, Malasia',
    keyIngredients: 'Ganoderma Lucidum Puro, Menta Silvestre Orgánica & Alginato',
    mainBenefit: '100% Libre de Flúor Químico, Encías Fuertes & Aliento Fresco',
    image: './src/assets/images/product_toothpaste_ganoderma.jpg',
    inStock: true
  },
  {
    id: 'jabon-ganoderma',
    title: 'Jabón Transparente Ganozhi',
    subtitle: 'Barra ámbar botánica con Ganoderma Lucidum & Aloe Vera',
    format: 'Barra Artesanal · 100g',
    origin: 'Elaboración Botánica · Gano Excel',
    keyIngredients: 'Ganoderma Lucidum Estandarizado, Aloe Vera Puro & Humectantes Botánicos',
    mainBenefit: 'Regeneración Celular, Hidratación Profunda & Cuidado Anti-edad Dérmico',
    image: './src/assets/images/product_soap_ganoderma.jpg',
    inStock: true
  }
];

// 4. Endpoints de API REST
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Gano Itouch Chile API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    count: PRODUCTS_CATALOG.length,
    data: PRODUCTS_CATALOG
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = PRODUCTS_CATALOG.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado' });
  }
  res.json({ success: true, data: product });
});

// Endpoint de Contacto y Cotización con validación estricta
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, message, product } = req.body;

    // Validación básica de campos
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje o consulta es obligatorio (mínimo 5 caracteres).'
      });
    }

    const hasEmail = email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const hasPhone = phone && typeof phone === 'string' && phone.trim().length >= 8;

    if (!hasEmail && !hasPhone) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar al menos un correo electrónico o teléfono válido de contacto.'
      });
    }

    const newContact = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      message: message.trim(),
      product: product ? String(product).trim() : 'Consulta General',
      ip: req.ip || req.headers['x-forwarded-for'] || 'local',
      createdAt: new Date().toISOString()
    };

    let contacts = [];
    try {
      const fileData = fs.readFileSync(CONTACTS_FILE, 'utf-8');
      contacts = JSON.parse(fileData);
    } catch {
      contacts = [];
    }

    contacts.unshift(newContact);
    // Limitar historial a los últimos 500 mensajes para evitar crecimiento infinito
    if (contacts.length > 500) contacts = contacts.slice(0, 500);

    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');

    return res.status(201).json({
      success: true,
      message: 'Tu mensaje fue recibido con éxito. Nos pondremos en contacto a la brevedad.',
      id: newContact.id
    });
  } catch (error) {
    console.error('Error al procesar contacto:', error);
    return res.status(500).json({
      success: false,
      error: 'Ocurrió un error interno al registrar tu consulta.'
    });
  }
});

// 5. Servir archivos estáticos
app.use(express.static(__dirname, {
  dotfiles: 'ignore',
  index: false // Evita que express.static sirva index.html de forma automática en rutas intermedias
}));

// 6. Manejo Inteligente de Rutas: Solo peticiones de navegación reciben index.html
app.get('*', (req, res) => {
  // Si la ruta solicitada tiene extensión de archivo (ej. .png, .js, .css, .ico, .map), devolver 404 real
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    return res.status(404).type('text/plain').send(`Archivo estático no encontrado: ${req.path}`);
  }

  // Rutas de navegación estándar devuelven la aplicación web (SPA)
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 7. Middleware centralizado de errores 500
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Gano Itouch Server] Activo en http://0.0.0.0:${PORT}`);
  console.log(`[Gano Itouch Server] Healthcheck disponible en http://0.0.0.0:${PORT}/api/health`);
});
