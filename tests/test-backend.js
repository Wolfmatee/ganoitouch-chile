import http from 'http';
import assert from 'assert';

// Importar el servidor en un puerto de prueba
process.env.PORT = '3001';
await import('../server.js');

// Helper para hacer peticiones HTTP en el test
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3001${path}`, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

console.log('--- Iniciando Batería de Pruebas de Backend ---');

// Test 1: Healthcheck
const health = await request('/api/health');
assert.strictEqual(health.status, 200, 'Healthcheck debe retornar 200');
const healthJson = JSON.parse(health.body);
assert.strictEqual(healthJson.status, 'ok', 'Status debe ser "ok"');
console.log('✓ Test 1: Healthcheck OK');

// Test 2: Catálogo de productos
const products = await request('/api/products');
assert.strictEqual(products.status, 200, 'Products debe retornar 200');
const prodJson = JSON.parse(products.body);
assert.strictEqual(prodJson.count, 6, 'El catálogo debe contener 6 productos (3 café + 3 cuidado personal)');
console.log('✓ Test 2: Catálogo de productos OK (6 productos: café y cuidado personal)');

// Test 3: Validación de contacto (Payload inválido)
const badContact = await request('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '' })
});
assert.strictEqual(badContact.status, 400, 'Debe rechazar payload incompleto con 400');
console.log('✓ Test 3: Validación de contacto con payload inválido OK');

// Test 4: Envío exitoso de contacto
const goodContact = await request('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Cliente Prueba',
    email: 'test@ganoitouch.cl',
    phone: '+56912345678',
    message: 'Consulta de cotización para ClassiRico',
    product: 'classirico-truffle'
  })
});
assert.strictEqual(goodContact.status, 201, 'Debe responder con 201 Created');
console.log('✓ Test 4: Registro de consulta de contacto OK');

// Test 5: Comprobación del Bug de 404 (archivos inexistentes deben retornar 404, no HTML)
const missing = await request('/non-existent-image.jpg');
assert.strictEqual(missing.status, 404, 'Archivos estáticos no encontrados deben dar 404');
console.log('✓ Test 5: Corrección de 404 en archivos estáticos inexistentes OK');

// Test 6: Navegación raíz
const home = await request('/');
assert.strictEqual(home.status, 200, 'Ruta raíz debe retornar 200 con la página');
assert.ok(home.headers['content-type'].includes('text/html'), 'Content-type debe ser HTML');
console.log('✓ Test 6: Entrega de HTML en raíz OK');

console.log('\n*** TODAS LAS PRUEBAS DE BACKEND PASARON EXITOSAMENTE (6/6) ***');
process.exit(0);
