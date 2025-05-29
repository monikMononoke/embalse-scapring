"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url = 'https://www.saihduero.es/situacion-embalses';
function scrapeReservoirs() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url);
        const $ = cheerio.load(response.data);
        const reservoirs = {};
        let currentProvince = '';
        $('table tbody tr').each((_, row) => {
            const $row = $(row);
            // Detectar provincia
            const provinceCell = $row.find('td.system');
            if (provinceCell.length) {
                currentProvince = provinceCell.text().trim();
                return; // Saltar a la siguiente fila
            }
            // Ignorar filas de subtotal
            if ($row.hasClass('subtotal'))
                return;
            // Detectar embalse
            const $reservoirName = $row
                .find('td.reservoir > a')
                .map((_, el) => $(el).text().trim())
                .get(0);
            if (!$reservoirName)
                return; // Si no hay nombre de embalse, saltar
            const cols = $row
                .find('td')
                .map((_, el) => $(el).text().trim())
                .get();
            if (cols.length >= 11) {
                const [name = $reservoirName, capacity, current, currentPercentage, lastYear, lastTenYears, volumeVariation, rainfall, averageEntrance, averageExit, rainfallYear,] = cols;
                const reservoir = {
                    province: currentProvince,
                    name: name,
                    capacityHm3: capacity,
                    currentHm3: current,
                    currentPercentage: currentPercentage,
                    lastYearHm3: lastYear,
                    lastTenYearsHm3: lastTenYears,
                    volumeVariation: volumeVariation,
                    rainfallLByM2: rainfall,
                    averageEntrancem3ByS: averageEntrance,
                    averageExitm3ByS: averageExit,
                    rainfallYearLbym2: rainfallYear,
                };
                if (!reservoirs[currentProvince])
                    reservoirs[currentProvince] = [];
                reservoirs[currentProvince].push(reservoir);
            }
        });
        return reservoirs;
    });
}
scrapeReservoirs().then((data) => {
    const filePath = path.join(__dirname, 'saihDuero.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Data saved to: ${filePath}`);
});
