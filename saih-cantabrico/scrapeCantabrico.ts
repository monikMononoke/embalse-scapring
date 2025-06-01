import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Cargar la web
  await page.goto('https://visor.saichcantabrico.es/', {
    waitUntil: 'networkidle0',
  });

  // 2. Hacer clic en el icono de embalses
  await page.waitForSelector(
    'div#menu-embalses a#embalses div.icono-lateral-nivel img.iconos-menu-cambio'
  );
  await page.click(
    'div#menu-embalses a#embalses div.icono-lateral-nivel img.iconos-menu-cambio'
  );

  // 3. Hacer clic en "Ver tabla de datos"
  await page.waitForSelector(' a.texto-mostrar-tabla');
  await page.click(' a.texto-mostrar-tabla');

  // 4. Esperar a que cargue la tabla
  await page.waitForSelector('div.contenedor-tabla > table#tabla-datos tbody');

  // 5. Extraer datos de la tabla
  const data = await page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll('table tbody tr.es_fila_embalse')
    );
    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map((cell) => cell.innerText.trim());
    });
  });

  // 6. Guardar como JSON
  fs.writeFileSync('tabla_embalses.json', JSON.stringify(data, null, 2));

  console.log('Datos guardados en tabla_embalses.json');
})();
