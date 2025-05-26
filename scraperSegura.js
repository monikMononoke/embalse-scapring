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
const url = 'https://chsegura.es/es/cuenca/redes-de-control/estadisticas-hidrologicas/estado-de-embalses/';
function scrapeReservoirs() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url);
        const $ = cheerio.load(response.data);
        const reservoirs = {};
        $('table#n0 tbody tr').each((_, row) => {
            const cols = $(row)
                .find('td')
                .map((_, el) => $(el).text().trim())
                .get();
            if (cols.length >= 4) {
                const [name, capacity, current, percentage] = cols;
                const reservoir = {
                    embalse: name,
                    capacidadHm3: parseFloat(capacity.replace(',', '.')),
                    almacenadoHm3: parseFloat(current.replace(',', '.')),
                    porcentaje: parseFloat(percentage.replace(',', '.')),
                };
                if (!reservoirs[name])
                    reservoirs[name] = [];
                reservoirs[name].push(reservoir);
            }
        });
        return reservoirs;
    });
}
scrapeReservoirs().then((data) => {
    const filePath = path.join(__dirname, 'reservoirs.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Data saved to: ${filePath}`);
});
