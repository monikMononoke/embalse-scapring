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
function scrapeCantabrico() {
    return __awaiter(this, void 0, void 0, function* () {
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
        const zonasHidrologicas = yield page.evaluate(() => {
            const zonasHidrologicas = {};
            const rows = Array.from(document.querySelectorAll('table tbody tr.es_fila_embalse'));
            let currentZonaHidrologica = '';
            rows.forEach((row) => {
                var _a;
                // Buscar la celda de zona hidrológica
                // Si no existe, usar la última zona hidrológica conocida
                const zonaCell = row.querySelector('td.font-sistema');
                let zonaHidrologica = zonaCell
                    ? ((_a = zonaCell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''
                    : currentZonaHidrologica;
                if (zonaCell)
                    currentZonaHidrologica = zonaHidrologica;
                const cols = Array.from(row.querySelectorAll('td'));
                // Saltar la celda de zona si existe (por rowspan puede no estar)
                const posicionInicial = zonaCell ? 1 : 0;
                const [id, rio, embalse, nivel, nivelMaximo, resguardoNivel, volumen, volumenTotalHm3, ResguardoVolumenHm3, porcentajeLLenado, husoMax, husoMin, fechaActualizacion,] = cols
                    .slice(posicionInicial, cols.length + 1)
                    .map((col) => { var _a; return ((_a = col.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ''; });
                function safeParseFloat(value) {
                    if (!value || value === '-')
                        return null;
                    return parseFloat(value.replace(',', '.'));
                }
                function safeParseInt(value) {
                    if (!value || value === '-')
                        return null;
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
        yield browser.close();
        return zonasHidrologicas;
    });
}
scrapeCantabrico()
    .then((data) => {
    fs.writeFileSync('tabla_embalses.json', JSON.stringify(data, null, 2));
    console.log('Datos guardados en tabla_embalses.json');
})
    .catch((error) => {
    console.error('Error al extraer los datos:', error);
});
