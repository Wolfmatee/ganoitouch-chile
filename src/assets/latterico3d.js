/**
 * GanoCafé LatteRico Truffle - Authentic Levitating 3D Packaging Engine
 * 100% WebGL / Three.js without video, borders, or buttons.
 * Replicates the exact physical packaging from the reference photo:
 *  - Eye-shaped magenta GanoCafé logo badge with coffee bean contours
 *  - "LatteRico Truffle" with hot magenta 'Rico' and white lettering
 *  - "Premix Coffee with Truffle / Café Premezclado con Trufa"
 *  - "Net weight/Peso neto: 300g (20 sachets/sobres × 15g)"
 *  - Realistic metallic gold ceramic tulip cup with specular highlights & reflections
 *  - White porcelain saucer with fine gold metallic rim
 *  - Rich coffee with latte art milk froth & delicate rising steam wisps
 *  - Subtle roasted coffee bean watermark texture in the dark background
 *  - Generous floating room in seamless pure black space with fluid scroll rotation
 */

window.Latterico3DEngine = (function () {
    let renderer = null;
    let scene = null;
    let camera = null;
    let boxMesh = null;
    let shadowMesh = null;
    let container = null;
    let animationFrameId = null;
    let isInitialized = false;
    let isVisible = false;

    // Rotation & smooth damping interpolation
    let targetRotationY = 0;
    let currentRotationY = 0;
    let targetRotationX = 0.05;
    let currentRotationX = 0.05;
    let isUserDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartRotY = 0;
    let dragStartRotX = 0;

    /**
     * Draws the authentic eye-shaped magenta GanoCafé logo badge from the real box
     */
    function drawAuthenticGanoCafeBadge(ctx, cx, cy, width, height) {
        ctx.save();
        ctx.translate(cx, cy);

        // 1. Pointed oval / eye-cartouche outline in magenta (#c81d59 / #e6246d)
        const halfW = width / 2;
        const halfH = height / 2;

        ctx.beginPath();
        ctx.moveTo(-halfW, 0);
        ctx.bezierCurveTo(-halfW * 0.7, -halfH, halfW * 0.7, -halfH, halfW, 0);
        ctx.bezierCurveTo(halfW * 0.7, halfH, -halfW * 0.7, halfH, -halfW, 0);
        ctx.closePath();

        // Dark plum background
        ctx.fillStyle = '#15090f';
        ctx.fill();

        // Outer magenta border
        ctx.strokeStyle = '#c81d59';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner fine border
        ctx.beginPath();
        ctx.moveTo(-halfW + 8, 0);
        ctx.bezierCurveTo((-halfW + 8) * 0.7, -halfH + 6, (halfW - 8) * 0.7, -halfH + 6, halfW - 8, 0);
        ctx.bezierCurveTo((halfW - 8) * 0.7, halfH - 6, (-halfW + 8) * 0.7, halfH - 6, -halfW + 8, 0);
        ctx.closePath();
        ctx.strokeStyle = '#ea3c78';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2. Stylized coffee bean line drawings inside upper and lower arcs
        ctx.strokeStyle = 'rgba(234, 60, 120, 0.45)';
        ctx.lineWidth = 1.6;

        // Upper beans
        drawMiniBeanOutline(ctx, -65, -18, 14, 8, -0.2);
        drawMiniBeanOutline(ctx, 0, -22, 15, 8.5, 0);
        drawMiniBeanOutline(ctx, 65, -18, 14, 8, 0.2);

        // Lower beans
        drawMiniBeanOutline(ctx, -65, 18, 14, 8, 0.2);
        drawMiniBeanOutline(ctx, 0, 22, 15, 8.5, 0);
        drawMiniBeanOutline(ctx, 65, 18, 14, 8, -0.2);

        // 3. Central horizontal dark magenta banner with "GANOCAFÉ"
        const barW = width * 0.88;
        const barH = height * 0.44;
        ctx.fillStyle = '#9e1444';
        ctx.beginPath();
        ctx.rect(-barW / 2, -barH / 2, barW, barH);
        ctx.fill();

        ctx.strokeStyle = '#e6246d';
        ctx.lineWidth = 2;
        ctx.strokeRect(-barW / 2, -barH / 2, barW, barH);

        // Text "GANOCAFÉ" in crisp white
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 30px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.letterSpacing = '5px';
        ctx.fillText('GANOCAFÉ', 0, 1);

        ctx.restore();
    }

    function drawMiniBeanOutline(ctx, x, y, rx, ry, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-rx * 0.8, 0);
        ctx.bezierCurveTo(-rx * 0.3, -ry * 0.4, rx * 0.3, ry * 0.4, rx * 0.8, 0);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws procedural roasted coffee beans pattern in the dark background
     */
    function drawBackgroundCoffeeBeansPattern(ctx, startX, startY, width, height) {
        ctx.save();
        // Subtle dark translucent roasted beans scattered organically
        const beanCount = 42;
        for (let i = 0; i < beanCount; i++) {
            const bx = startX + (Math.sin(i * 1.7) * 0.5 + 0.5) * width;
            const by = startY + (Math.cos(i * 2.3) * 0.5 + 0.5) * height;
            const angle = (i * 0.8) % (Math.PI * 2);
            const size = 18 + (i % 5) * 6;

            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(angle);

            // Bean body shadow
            ctx.fillStyle = 'rgba(25, 23, 21, 0.45)';
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();

            // Subtle highlight rim on bean
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.9, 0, Math.PI);
            ctx.stroke();

            // Center crease / crack
            ctx.strokeStyle = 'rgba(10, 9, 8, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size * 0.8, 0);
            ctx.bezierCurveTo(-size * 0.2, -size * 0.2, size * 0.2, size * 0.2, size * 0.8, 0);
            ctx.stroke();

            ctx.restore();
        }
        ctx.restore();
    }

    /**
     * Draws the realistic, photorealistic metallic gold cup & saucer from Image 2
     * Features real reflective metallic gradients, saucer rim trim, crema & soft steam wisps.
     */
    function drawPhotorealisticGoldCup(ctx, cx, cy, scale = 1.0) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // 1. Soft Contact Shadow of Saucer onto black packaging
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, 160, 270, 48, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. White Porcelain Saucer with Gold Accent Rim (from Image 2)
        // Outer porcelain rim
        const saucerOuterGrad = ctx.createLinearGradient(0, 100, 0, 165);
        saucerOuterGrad.addColorStop(0, '#fbfaf8');
        saucerOuterGrad.addColorStop(0.4, '#eee9df');
        saucerOuterGrad.addColorStop(0.85, '#cac3b7');
        saucerOuterGrad.addColorStop(1, '#9b9285');

        ctx.fillStyle = saucerOuterGrad;
        ctx.beginPath();
        ctx.ellipse(0, 138, 250, 44, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fine Metallic Gold Trim Line circling the saucer edge
        const saucerGoldTrim = ctx.createLinearGradient(-250, 138, 250, 138);
        saucerGoldTrim.addColorStop(0, '#8e6220');
        saucerGoldTrim.addColorStop(0.25, '#d8aa45');
        saucerGoldTrim.addColorStop(0.5, '#fff6db');
        saucerGoldTrim.addColorStop(0.75, '#c79430');
        saucerGoldTrim.addColorStop(1, '#6b4612');

        ctx.strokeStyle = saucerGoldTrim;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 137, 246, 42, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Saucer inner well shadow
        const saucerInnerGrad = ctx.createRadialGradient(0, 135, 10, 0, 135, 180);
        saucerInnerGrad.addColorStop(0, '#e5ded4');
        saucerInnerGrad.addColorStop(0.65, '#f7f4ee');
        saucerInnerGrad.addColorStop(1, '#ddd6cb');

        ctx.fillStyle = saucerInnerGrad;
        ctx.beginPath();
        ctx.ellipse(0, 135, 180, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow of the gold cup base cast onto the saucer
        ctx.fillStyle = 'rgba(40, 25, 10, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 130, 75, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Golden Handle (Right side of cup)
        ctx.save();
        // Handle outer spine
        ctx.beginPath();
        ctx.moveTo(95, -25);
        ctx.bezierCurveTo(205, -20, 200, 85, 78, 80);
        ctx.lineWidth = 26;
        const handleGrad = ctx.createLinearGradient(80, -25, 205, 80);
        handleGrad.addColorStop(0, '#e2b34a');
        handleGrad.addColorStop(0.28, '#fff3ce');
        handleGrad.addColorStop(0.65, '#b88126');
        handleGrad.addColorStop(1, '#5a380a');
        ctx.strokeStyle = handleGrad;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Handle inner negative cutout
        ctx.beginPath();
        ctx.moveTo(95, -16);
        ctx.bezierCurveTo(168, -12, 165, 70, 82, 68);
        ctx.lineWidth = 11;
        ctx.strokeStyle = '#0e0d0c';
        ctx.stroke();

        // Handle shiny specular glint
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(110, -22);
        ctx.bezierCurveTo(185, -16, 185, 45, 120, 75);
        ctx.stroke();
        ctx.restore();

        // 4. Golden Tulip Cup Body (Authentic ceramic curvature)
        // Flared tulip profile matching Image 2
        ctx.beginPath();
        ctx.moveTo(-130, -50);
        ctx.bezierCurveTo(-125, 30, -85, 95, -45, 126);
        ctx.lineTo(45, 126);
        ctx.bezierCurveTo(85, 95, 125, 30, 130, -50);
        ctx.closePath();

        // Metallic multi-stop gold gradient with true specular highlights
        const cupBodyGrad = ctx.createLinearGradient(-130, 35, 130, 35);
        cupBodyGrad.addColorStop(0.0, '#4a2c07');   // Deep bronze dark shadow (left rim turn)
        cupBodyGrad.addColorStop(0.12, '#875b16');  // Shaded gold
        cupBodyGrad.addColorStop(0.24, '#c69532');  // Mid gold
        cupBodyGrad.addColorStop(0.38, '#f7cd67');  // Warm bright gold
        cupBodyGrad.addColorStop(0.48, '#fffbe6');  // PRIMARY SPECULAR HIGHLIGHT BEAM!
        cupBodyGrad.addColorStop(0.53, '#ffffff');  // Pure specular reflection
        cupBodyGrad.addColorStop(0.58, '#fff7d2');  // Highlight falloff
        cupBodyGrad.addColorStop(0.70, '#dba73f');  // Rich golden sheen
        cupBodyGrad.addColorStop(0.85, '#9a6b1d');  // Shading towards right handle
        cupBodyGrad.addColorStop(0.96, '#563509');  // Deep dark bronze
        cupBodyGrad.addColorStop(1.0, '#361e04');   // Right shadow edge
        ctx.fillStyle = cupBodyGrad;
        ctx.fill();

        // Vertical brushed metallic reflection band
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(-8, -50, 18, 175);

        // Base foot of cup
        ctx.beginPath();
        ctx.ellipse(0, 126, 48, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b88126';
        ctx.fill();

        // 5. Cup Top Flared Rim
        ctx.beginPath();
        ctx.ellipse(0, -50, 130, 38, 0, 0, Math.PI * 2);
        const rimGoldGrad = ctx.createLinearGradient(-130, -50, 130, -50);
        rimGoldGrad.addColorStop(0, '#875b16');
        rimGoldGrad.addColorStop(0.35, '#fff6db');
        rimGoldGrad.addColorStop(0.5, '#ffffff');
        rimGoldGrad.addColorStop(0.7, '#f7cd67');
        rimGoldGrad.addColorStop(1, '#563509');
        ctx.strokeStyle = rimGoldGrad;
        ctx.lineWidth = 4.5;
        ctx.stroke();

        // 6. Coffee Liquid & Froth Inside Cup (Perspective ellipse)
        ctx.beginPath();
        ctx.ellipse(0, -50, 126, 35, 0, 0, Math.PI * 2);
        const coffeeGrad = ctx.createRadialGradient(20, -50, 12, 0, -50, 120);
        coffeeGrad.addColorStop(0.0, '#fefbf5'); // White milk froth center
        coffeeGrad.addColorStop(0.25, '#f4e3c9'); // Soft cream
        coffeeGrad.addColorStop(0.55, '#c99152'); // Golden hazelnut crema
        coffeeGrad.addColorStop(0.82, '#7a451b'); // Dark rich espresso
        coffeeGrad.addColorStop(1.0, '#331908');  // Espresso edge
        ctx.fillStyle = coffeeGrad;
        ctx.fill();

        // Latte art milk heart/oval in center with soft edges
        ctx.save();
        ctx.filter = 'blur(2px)';
        ctx.fillStyle = '#fffdf7';
        ctx.beginPath();
        ctx.ellipse(10, -52, 46, 17, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Inner crema texture swirl
        ctx.strokeStyle = 'rgba(255, 252, 244, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(12, -52, 38, 13, -0.1, 0, Math.PI * 2);
        ctx.stroke();

        // 7. Soft Translucent Steam Wisps (Soft natural vapor)
        drawSoftSteam(ctx, -15, -90, -45, -280, 0.28);
        drawSoftSteam(ctx, 35, -85, 20, -260, 0.22);
        drawSoftSteam(ctx, 10, -110, 50, -310, 0.16);

        ctx.restore();
    }

    /**
     * Draws soft, natural translucent steam wisps
     */
    function drawSoftSteam(ctx, x1, y1, x2, y2, opacity) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 248, 238, ${opacity})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 - 25, y1 - 60, x2 + 35, y2 + 80, x2, y2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 248, 238, ${opacity * 0.5})`;
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * FRONT FACE (2048 x 1440 Ultra HD)
     * Matches the real physical box in Image 2 with 100% photographic accuracy.
     */
    function createFrontTexture() {
        const c = document.createElement('canvas');
        c.width = 2048;
        c.height = 1440;
        const ctx = c.getContext('2d');

        // 1. Deep matte black background
        ctx.fillStyle = '#0a0908';
        ctx.fillRect(0, 0, c.width, c.height);

        // 2. Intricate Roasted Coffee Beans Watermark on the right half (behind cup)
        drawBackgroundCoffeeBeansPattern(ctx, 1100, 150, 880, 1150);

        // 3. Top-Left Eye-shaped Magenta GanoCafé Logo Badge
        drawAuthenticGanoCafeBadge(ctx, 380, 240, 360, 92);

        // 4. Product Title: "LatteRico Truffle"
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // "Latte" in clean crisp white
        ctx.font = '600 68px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.letterSpacing = '1px';
        ctx.fillText('Latte', 180, 420);

        // "Rico" in vibrant hot magenta-pink (#e52668)
        const latteWidth = ctx.measureText('Latte').width;
        ctx.font = '700 68px "Montserrat", sans-serif';
        ctx.fillStyle = '#e52668';
        ctx.fillText('Rico', 180 + latteWidth + 8, 420);

        // "Truffle" in clean white
        const ricoWidth = ctx.measureText('Rico').width;
        ctx.font = '600 68px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Truffle', 180 + latteWidth + ricoWidth + 24, 420);

        // 5. Subtitles in clean light platinum gray
        ctx.font = '400 31px "Montserrat", sans-serif';
        ctx.fillStyle = '#b5afa6';
        ctx.letterSpacing = '0.5px';
        ctx.fillText('Premix Coffee with Truffle', 180, 515);

        ctx.font = '400 31px "Montserrat", sans-serif';
        ctx.fillStyle = '#b5afa6';
        ctx.fillText('Café Premezclado con Trufa', 180, 568);

        // 6. Bottom-Left Net Weight (EXACT text from Image 2: 300g, 20 sachets/sobres × 15g)
        ctx.font = '500 28px "Montserrat", sans-serif';
        ctx.fillStyle = '#e8e4db';
        ctx.letterSpacing = '1px';
        ctx.fillText('Net weight/Peso neto: 300g (20 sachets/sobres × 15g)', 180, 1280);

        // Stylized Gano watermark emblem at bottom
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(640, 1340, 70, 24, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 7. Right Side: Photorealistic Golden Ceramic Cup & Saucer
        drawPhotorealisticGoldCup(ctx, 1460, 750, 1.68);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
    }

    /**
     * BACK FACE (2048 x 1440 Ultra HD)
     * Nutrition table, 3 preparation steps, barcode.
     */
    function createBackTexture() {
        const c = document.createElement('canvas');
        c.width = 2048;
        c.height = 1440;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0a0908';
        ctx.fillRect(0, 0, c.width, c.height);

        // Left Column: Serving suggestion / Modo de Preparación
        ctx.textAlign = 'left';
        ctx.font = '600 32px "Montserrat", sans-serif';
        ctx.fillStyle = '#f2ece4';
        ctx.fillText('Serving suggestion /', 160, 200);
        ctx.fillStyle = '#e52668';
        ctx.fillText('Modo de Preparación', 500, 200);

        // Step 1: Cup + Sachet
        drawPrepStepIcon(ctx, 210, 330, 1);
        ctx.font = '500 24px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('A sachet in a cup.', 310, 320);
        ctx.fillStyle = '#a8a299';
        ctx.fillText('Un sobre en una taza.', 310, 355);

        // Step 2: Kettle pouring hot water
        drawPrepStepIcon(ctx, 210, 540, 2);
        ctx.font = '500 24px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Pour in hot water (150ml) and stir well.', 310, 530);
        ctx.fillStyle = '#a8a299';
        ctx.fillText('Vierta agua caliente (150ml) y revuelva bien.', 310, 565);

        // Step 3: Steaming cup ready
        drawPrepStepIcon(ctx, 210, 750, 3);
        ctx.font = '500 24px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Ready to serve.', 310, 740);
        ctx.fillStyle = '#a8a299';
        ctx.fillText('Listo para servir.', 310, 775);

        // Right Column: Nutrition Information Table (Crisp White Frame)
        const tx = 1140;
        const ty = 180;
        const tw = 760;
        const th = 540;

        ctx.fillStyle = '#141210';
        ctx.fillRect(tx, ty, tw, th);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(tx, ty, tw, th);

        // Table Header
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(tx, ty, tw, 90);
        ctx.textAlign = 'center';
        ctx.font = '700 24px "Montserrat", sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText('NUTRITION INFORMATION /', tx + tw / 2, ty + 38);
        ctx.fillText('INFORMACIÓN NUTRICIONAL', tx + tw / 2, ty + 70);

        // Table Rows
        const rows = [
            ['Serving size / Porción:', '1 sachet / sobre (15g)'],
            ['Energy / Energía:', '65 kcal'],
            ['Protein / Proteína:', '0.8 g'],
            ['Total Fat / Grasa Total:', '2.4 g'],
            ['Carbohydrate / Carbohidratos:', '10.5 g'],
            ['Sodium / Sodio:', '15 mg']
        ];

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        let rowY = ty + 150;
        rows.forEach(([label, val]) => {
            ctx.textAlign = 'left';
            ctx.font = '400 22px "Montserrat", sans-serif';
            ctx.fillStyle = '#eae4da';
            ctx.fillText(label, tx + 32, rowY);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(val, tx + tw - 32, rowY);

            ctx.beginPath();
            ctx.moveTo(tx + 20, rowY + 18);
            ctx.lineTo(tx + tw - 20, rowY + 18);
            ctx.stroke();
            rowY += 64;
        });

        // Barcode in crisp white box
        const bx = tx + tw / 2 - 210;
        const by = 800;
        const bw = 420;
        const bh = 160;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, by, bw, bh);

        // Barcode lines
        ctx.fillStyle = '#000000';
        let curX = bx + 30;
        const code = '101100101011101001010110100110101100101011101001010110100110101';
        const barW = (bw - 60) / code.length;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '1') {
                ctx.fillRect(curX, by + 18, barW * 0.9, 98);
            }
            curX += barW;
        }

        ctx.textAlign = 'center';
        ctx.font = '600 20px monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText('8 655069 7001255', bx + bw / 2, by + 140);

        // Legal info
        ctx.textAlign = 'left';
        ctx.font = '400 20px "Montserrat", sans-serif';
        ctx.fillStyle = '#8f8577';
        ctx.fillText('Gano Excel Industries Sdn Bhd · Kedah, Malaysia', 160, 1240);
        ctx.fillText('Importado y distribuido por Gano Itouch Chile · Viña del Mar, Chile', 160, 1280);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
    }

    function drawPrepStepIcon(ctx, x, y, step) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        if (step === 1) {
            ctx.beginPath();
            ctx.arc(0, 10, 24, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-20, -20);
            ctx.lineTo(-4, -4);
            ctx.stroke();
        } else if (step === 2) {
            ctx.beginPath();
            ctx.arc(0, 5, 22, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(15, -22);
            ctx.lineTo(2, 0);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(0, 10, 24, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-8, -18);
            ctx.lineTo(-2, -8);
            ctx.moveTo(6, -20);
            ctx.lineTo(10, -10);
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * SIDES (Left & Right)
     */
    function createSideTexture() {
        const c = document.createElement('canvas');
        c.width = 800;
        c.height = 1440;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0a0908';
        ctx.fillRect(0, 0, c.width, c.height);

        // Logo badge at top
        drawAuthenticGanoCafeBadge(ctx, 400, 200, 320, 82);

        // Text
        ctx.textAlign = 'center';
        ctx.font = '600 52px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LatteRico', 400, 420);

        ctx.font = '700 46px "Montserrat", sans-serif';
        ctx.fillStyle = '#e52668';
        ctx.fillText('Truffle', 400, 480);

        // Gold cup illustration in center
        drawPhotorealisticGoldCup(ctx, 400, 820, 1.05);

        ctx.font = '400 24px "Montserrat", sans-serif';
        ctx.fillStyle = '#b5afa6';
        ctx.fillText('300g (20 sobres × 15g)', 400, 1260);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
    }

    /**
     * TOP FACE
     */
    function createTopTexture() {
        const c = document.createElement('canvas');
        c.width = 2048;
        c.height = 800;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0a0908';
        ctx.fillRect(0, 0, c.width, c.height);

        drawAuthenticGanoCafeBadge(ctx, 1024, 280, 400, 100);

        ctx.textAlign = 'center';
        ctx.font = '600 56px "Montserrat", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LatteRico Truffle', 1024, 460);

        ctx.font = '400 30px "Montserrat", sans-serif';
        ctx.fillStyle = '#b5afa6';
        ctx.fillText('Premix Coffee with Truffle · 20 Sachets', 1024, 530);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    /**
     * BOTTOM FACE
     */
    function createBottomTexture() {
        const c = document.createElement('canvas');
        c.width = 2048;
        c.height = 800;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#080706';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.textAlign = 'center';
        ctx.font = '500 28px "Montserrat", sans-serif';
        ctx.fillStyle = '#8f8577';
        ctx.fillText('LOT / LOTE: GT-2026-CHL-0914  |  EXP: 12 / 2028', 1024, 320);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(784, 400, 480, 120);
        ctx.fillStyle = '#000000';
        ctx.fillRect(814, 420, 420, 60);
        ctx.font = '600 22px monospace';
        ctx.fillText('8  655069  7001255', 1024, 502);

        const tex = new THREE.CanvasTexture(c);
        return tex;
    }

    /**
     * Initializes the Three.js 3D Scene
     */
    function init(containerEl) {
        if (isInitialized && renderer) {
            resize();
            return;
        }

        container = containerEl;
        if (!container) return;

        const width = container.clientWidth || 960;
        const height = container.clientHeight || 640;

        // 1. Scene
        scene = new THREE.Scene();

        // 2. Camera with cinematic focal length
        camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
        camera.position.set(0, 0.1, 7.2);

        // 3. WebGL Renderer with full alpha transparency (merges with black background)
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        renderer.domElement.className = 'w-full h-full object-contain cursor-grab active:cursor-grabbing select-none';

        // 4. Studio Lighting
        // Ambient illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        // Key spotlight focused on the golden cup
        const keyLight = new THREE.SpotLight(0xfffaec, 2.1);
        keyLight.position.set(4.8, 5.2, 5.8);
        keyLight.angle = Math.PI / 3.4;
        keyLight.penumbra = 0.5;
        scene.add(keyLight);

        // Left soft fill light (ensures typography is crisp and bright)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.75);
        fillLight.position.set(-5, 0.5, 4.5);
        scene.add(fillLight);

        // Warm rim light behind the box
        const rimLight = new THREE.DirectionalLight(0xcfa667, 1.4);
        rimLight.position.set(-4, 3, -4.5);
        scene.add(rimLight);

        // 5. 3D Box Geometry (Authentic horizontal landscape proportions: 3.7 x 2.6 x 1.5)
        const boxGeometry = new THREE.BoxGeometry(3.7, 2.6, 1.5);

        const texFront = createFrontTexture();
        const texBack = createBackTexture();
        const texSide = createSideTexture();
        const texTop = createTopTexture();
        const texBottom = createBottomTexture();

        const materialOpts = {
            roughness: 0.3,
            metalness: 0.12
        };

        const materials = [
            new THREE.MeshStandardMaterial({ map: texSide, ...materialOpts }),   // 0: Right
            new THREE.MeshStandardMaterial({ map: texSide, ...materialOpts }),   // 1: Left
            new THREE.MeshStandardMaterial({ map: texTop, ...materialOpts }),    // 2: Top
            new THREE.MeshStandardMaterial({ map: texBottom, ...materialOpts }), // 3: Bottom
            new THREE.MeshStandardMaterial({ map: texFront, ...materialOpts }),  // 4: Front
            new THREE.MeshStandardMaterial({ map: texBack, ...materialOpts })    // 5: Back
        ];

        boxMesh = new THREE.Mesh(boxGeometry, materials);
        boxMesh.position.set(0, 0, 0);
        scene.add(boxMesh);

        // 6. Subtle soft floating ambient shadow in the void
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const sctx = shadowCanvas.getContext('2d');
        const sgrad = sctx.createRadialGradient(128, 128, 10, 128, 128, 115);
        sgrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        sgrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
        sgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sctx.fillStyle = sgrad;
        sctx.fillRect(0, 0, 256, 256);
        const shadowTex = new THREE.CanvasTexture(shadowCanvas);

        const shadowGeo = new THREE.PlaneGeometry(4.6, 2.5);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTex,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.set(0, -1.8, 0);
        scene.add(shadowMesh);

        // 7. Mouse / Touch Drag listeners
        setupInteractionListeners();

        isInitialized = true;
        isVisible = true;

        if (!animationFrameId) {
            animate();
        }
    }

    /**
     * Free drag rotation
     */
    function setupInteractionListeners() {
        const dom = renderer.domElement;

        dom.addEventListener('mousedown', (e) => {
            isUserDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dragStartRotY = targetRotationY;
            dragStartRotX = targetRotationX;
            dom.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', () => {
            if (isUserDragging) {
                isUserDragging = false;
                if (dom) dom.style.cursor = 'grab';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isUserDragging) return;
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;

            targetRotationY = dragStartRotY + (deltaX * 0.008);
            targetRotationX = Math.max(-0.4, Math.min(0.4, dragStartRotX + (deltaY * 0.005)));
        });

        // Touch support
        dom.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isUserDragging = true;
                dragStartX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                dragStartRotY = targetRotationY;
                dragStartRotX = targetRotationX;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isUserDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isUserDragging || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - dragStartX;
            const deltaY = e.touches[0].clientY - dragStartY;

            targetRotationY = dragStartRotY + (deltaX * 0.008);
            targetRotationX = Math.max(-0.4, Math.min(0.4, dragStartRotX + (deltaY * 0.005)));
        }, { passive: true });

        window.addEventListener('resize', resize);
    }

    /**
     * Fluid Scroll Rotation: Maps scroll position to continuous 360° rotation
     */
    function onScroll(scrollSectionEl) {
        if (!scrollSectionEl || isUserDragging || !isInitialized) return;

        const rect = scrollSectionEl.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const enterPoint = windowHeight;
        const leavePoint = -rect.height;
        const totalDistance = enterPoint - leavePoint;
        const currentPos = enterPoint - rect.top;

        const progress = Math.max(0, Math.min(1, currentPos / totalDistance));

        // Smooth full 360 rotation mapped to scroll progress
        targetRotationY = progress * Math.PI * 2;

        // Subtle perspective depth tilt as it scrolls past
        const tilt = Math.sin(progress * Math.PI) * 0.18;
        targetRotationX = 0.05 + tilt;
    }

    function resize() {
        if (!renderer || !camera || !container) return;
        const w = container.clientWidth || 960;
        const h = container.clientHeight || 640;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    let clock = new THREE.Clock();

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        if (!isVisible || !renderer || !scene || !camera || !boxMesh) return;

        const elapsedTime = clock.getElapsedTime();

        // Buttery damping interpolation (lerp factor 0.075) for pure fluid motion
        const lerpFactor = 0.075;
        currentRotationY += (targetRotationY - currentRotationY) * lerpFactor;
        currentRotationX += (targetRotationX - currentRotationX) * lerpFactor;

        boxMesh.rotation.y = currentRotationY;
        boxMesh.rotation.x = currentRotationX;

        // Gentle floating levitation breathing motion in the void
        const levitateOffset = Math.sin(elapsedTime * 1.5) * 0.06;
        boxMesh.position.y = levitateOffset;

        if (shadowMesh) {
            const shadowScale = 1 - (levitateOffset * 0.5);
            shadowMesh.scale.set(shadowScale, shadowScale, 1);
        }

        renderer.render(scene, camera);
    }

    function setVisible(visible) {
        isVisible = visible;
        if (visible && isInitialized) {
            resize();
        }
    }

    return {
        init,
        onScroll,
        resize,
        setVisible
    };
})();
