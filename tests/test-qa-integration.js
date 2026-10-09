import http from 'http';
import assert from 'assert';
import fs from 'fs';

process.env.PORT = '3002';
await import('../server.js');

function req(path, options = {}) {
  return new Promise((resolve, reject) => {
    const r = http.request(`http://localhost:3002${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    r.on('error', reject);
    if (options.body) r.write(options.body);
    r.end();
  });
}

console.log('==================================================');
console.log('   QA AUDIT & INTEGRATION TEST SUITE');
console.log('==================================================');

// 1. Healthcheck Endpoint
const health = await req('/api/health');
assert.strictEqual(health.status, 200, 'Healthcheck falló');
console.log('✓ QA 1: Endpoint /api/health responde 200 OK');

// 2. Products API
const prod = await req('/api/products');
assert.strictEqual(prod.status, 200, 'Catálogo falló');
const prodBody = JSON.parse(prod.data);
assert.strictEqual(prodBody.count, 6, 'Catálogo debe tener los 6 productos oficiales (3 café + 3 botánicos)');
console.log('✓ QA 2: Endpoint /api/products retorna los 6 productos oficiales (Café & Cuidado Personal)');

// 3. Contact Form Submission API
const contactSubmission = await req('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Cliente QA Automatizado',
    email: 'qa@ganoitouch.cl',
    phone: '+56987654321',
    product: 'LatteRico Truffle',
    message: 'Solicitud de prueba automatizada QA para verificar persistencia'
  })
});
assert.strictEqual(contactSubmission.status, 201, 'Envío de contacto falló');
const contactResp = JSON.parse(contactSubmission.data);
assert.strictEqual(contactResp.success, true);
console.log('✓ QA 3: Endpoint /api/contact procesa y persiste solicitudes (201 Created)');

// 4. Verificación de persistencia física en data/contacts.json
const contactsFile = fs.readFileSync('data/contacts.json', 'utf8');
const contactsList = JSON.parse(contactsFile);
assert.ok(contactsList.some(c => c.name === 'Cliente QA Automatizado'), 'Contacto debe estar persistido en archivo');
console.log('✓ QA 4: Archivo data/contacts.json contiene la información registrada');

// 5. Favicon y Assets Estáticos
const favicon = await req('/src/assets/favicon.svg');
assert.strictEqual(favicon.status, 200, 'Favicon no responde 200');
assert.ok(favicon.data.includes('<svg'), 'Favicon debe ser un archivo SVG válido');
console.log('✓ QA 5: Favicon oficial /src/assets/favicon.svg cargado con éxito');

// 6. Nuevas Imágenes de Galería, Ángulos y Cuidado Personal
const latteTopdown = await req('/src/assets/images/latterico_angle_topdown.jpg');
assert.strictEqual(latteTopdown.status, 200, 'Imagen cenital de LatteRico debe responder 200');
const latteClosing = await req('/src/assets/images/latterico_wide_closing.jpg');
assert.strictEqual(latteClosing.status, 200, 'Imagen de cierre latte auténtico debe responder 200');
const shokoDetail = await req('/src/assets/images/shokorico_angle_detail.jpg');
assert.strictEqual(shokoDetail.status, 200, 'Imagen detallada de ShokoRico debe responder 200');
const shampooImg = await req('/src/assets/images/product_shampoo_ganoderma.jpg');
assert.strictEqual(shampooImg.status, 200, 'Imagen de Shampoo debe responder 200');
const toothpasteImg = await req('/src/assets/images/product_toothpaste_ganoderma.jpg');
assert.strictEqual(toothpasteImg.status, 200, 'Imagen de Pasta Dental debe responder 200');
const soapImg = await req('/src/assets/images/product_soap_ganoderma.jpg');
assert.strictEqual(soapImg.status, 200, 'Imagen de Jabón debe responder 200');
console.log('✓ QA 6: Fotos de catálogo y línea de cuidado personal disponibles (200 OK)');

// 7. Prueba del Bug 404 (archivos estáticos inexistentes NO deben devolver HTML)
const ghostFile = await req('/archivo-que-no-existe.png');
assert.strictEqual(ghostFile.status, 404, 'Archivo no encontrado debe ser 404');
assert.ok(!ghostFile.data.includes('<!DOCTYPE html>'), '404 no debe contener HTML de index.html');
console.log('✓ QA 7: Bug 404 resuelto: Archivos inexistentes responden 404 real, sin HTML');

// 8. Entrega del documento principal HTML y botón Otros
const indexHtml = await req('/');
assert.strictEqual(indexHtml.status, 200, 'Index HTML debe responder 200');
assert.ok(indexHtml.data.includes('contactForm'), 'index.html debe contener el formulario de contacto');
assert.ok(!indexHtml.data.includes('data-product-card="te-oolong-ganoderma"'), 'index.html no debe contener Té Oolong en la grilla');
assert.ok(indexHtml.data.includes('id="btnOtrosProductos"'), 'index.html debe contener el botón/enlace Otros');
assert.ok(indexHtml.data.includes('id="otros-productos"'), 'index.html debe contener la sección de Otros Productos');
console.log('✓ QA 8: index.html renderiza botón "Otros →" y sección de cuidado personal');

// 9. Cara Principal con Video Hero (LatteRico, ClassiRico y ShokoRico)
assert.ok(indexHtml.data.includes('id="detailHeroVideo"'), 'index.html debe contener detailHeroVideo en el Hero principal');
assert.ok(indexHtml.data.includes('/src/assets/videos/latterico_video.mp4'), 'index.html debe referenciar latterico_video.mp4');
assert.ok(indexHtml.data.includes('/src/assets/videos/classirico_video.mp4'), 'index.html debe referenciar classirico_video.mp4');
assert.ok(indexHtml.data.includes('/src/assets/videos/shokorico_video.mp4'), 'index.html debe referenciar shokorico_video.mp4');

const classiricoVideoReq = await req('/src/assets/videos/classirico_video.mp4');
assert.strictEqual(classiricoVideoReq.status, 200, 'Video de ClassiRico debe responder 200 OK');
const shokoricoVideoReq = await req('/src/assets/videos/shokorico_video.mp4');
assert.strictEqual(shokoricoVideoReq.status, 200, 'Video de ShokoRico debe responder 200 OK');
console.log('✓ QA 9: Video 3D en la cara principal (Hero) de LatteRico, ClassiRico y ShokoRico configurado y verificado');

console.log('==================================================');
console.log('   VEREDICTO FINAL DE QA: APROBADO (9/9 PRUEBAS)');
console.log('==================================================');
process.exit(0);

