var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer';
import fs from 'fs';
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch({ headless: true });
    const page = yield browser.newPage();
    // 1. Cargar la web
    yield page.goto('https://visor.saichcantabrico.es/', {
        waitUntil: 'networkidle0',
    });
    // 2. Hacer clic en el icono de embalses
    yield page.waitForSelector('div#menu-embalses a#embalses div.icono-lateral-nivel img.iconos-menu-cambio');
    yield page.click('div#menu-embalses a#embalses div.icono-lateral-nivel img.iconos-menu-cambio');
    // 3. Hacer clic en "Ver tabla de datos"
    yield page.waitForSelector(' a.texto-mostrar-tabla');
    yield page.click(' a.texto-mostrar-tabla');
    // 4. Esperar a que cargue la tabla
    yield page.waitForSelector('div.contenedor-tabla > table#tabla-datos tbody');
    // 5. Extraer datos de la tabla
    const data = yield page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr.es_fila_embalse'));
        return rows.map((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            return cells.map((cell) => cell.innerText.trim());
        });
    });
    // 6. Guardar como JSON
    fs.writeFileSync('tabla_embalses.json', JSON.stringify(data, null, 2));
    console.log('Datos guardados en tabla_embalses.json');
}))();
