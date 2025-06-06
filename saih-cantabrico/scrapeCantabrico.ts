import puppeteer from 'puppeteer';
import fs from 'fs';
import { ZonaHidrologica } from './interfaceCantabrico';

async function scrapeCantabrico(): Promise<ZonaHidrologica> {
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
  const zonasHidrologicas = await page.evaluate(() => {
    const zonasHidrologicas: { [key: string]: any[] } = {};
    const rows = Array.from(
      document.querySelectorAll('table tbody tr.es_fila_embalse')
    );

    let currentZonaHidrologica = '';

    rows.forEach((row) => {
      // Buscar la celda de zona hidrológica
      // Si no existe, usar la última zona hidrológica conocida
      const zonaCell = row.querySelector('td.font-sistema');
      let zonaHidrologica = zonaCell
        ? zonaCell.textContent?.trim() || ''
        : currentZonaHidrologica;
      if (zonaCell) currentZonaHidrologica = zonaHidrologica;

      const cols = Array.from(row.querySelectorAll('td'));
      // Saltar la celda de zona si existe (por rowspan puede no estar)
      const posicionInicial = zonaCell ? 1 : 0;

      const [
        id,
        rio,
        embalse,
        nivel,
        nivelMaximo,
        resguardoNivel,
        volumen,
        volumenTotalHm3,
        ResguardoVolumenHm3,
        porcentajeLLenado,
        husoMax,
        husoMin,
        fechaActualizacion,
      ] = cols
        .slice(posicionInicial)
        .map((col) => col.textContent?.trim() || '');

      function safeParseFloat(value: string) {
        if (!value || value === '-') return null;
        return parseFloat(value.replace(',', '.'));
      }
      function safeParseInt(value: string) {
        if (!value || value === '-') return null;
        return parseInt(value, 10);
      }

      const reservoir = {
        id: safeParseInt(id),
        rio,
        embalse: embalse,
        nivel: safeParseFloat(nivel),
        nivelMaximo: safeParseFloat(nivelMaximo),
        resguardoNivel: safeParseFloat(resguardoNivel),
        volumen: safeParseFloat(volumen),
        volumenTotalHm3: safeParseFloat(volumenTotalHm3),
        ResguardoVolumenHm3: safeParseFloat(ResguardoVolumenHm3),
        porcentajeLLenado: safeParseFloat(porcentajeLLenado),
        husoMax: safeParseInt(husoMax),
        husoMin: safeParseInt(husoMin),
        fechaActualizacion,
      };
      if (!zonasHidrologicas[zonaHidrologica])
        zonasHidrologicas[zonaHidrologica] = [];
      zonasHidrologicas[zonaHidrologica].push(reservoir);
    });
    return zonasHidrologicas;
  });
  await browser.close();
  return zonasHidrologicas;
}

scrapeCantabrico()
  .then((data) => {
    fs.writeFileSync('tabla_embalses.json', JSON.stringify(data, null, 2));

    console.log('Datos guardados en tabla_embalses.json');
  })
  .catch((error) => {
    console.error('Error al extraer los datos:', error);
  });
