import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { ReservoirsByProvince, ReservoirData } from './interfaceSegura';

const url =
  'https://chsegura.es/es/cuenca/redes-de-control/estadisticas-hidrologicas/estado-de-embalses/';

async function scrapeReservoirs(): Promise<ReservoirsByProvince> {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const reservoirs: ReservoirsByProvince = {};

  $('table#n0 tbody tr').each((_, row) => {
    const cols = $(row)
      .find('td')
      .map((_, el) => $(el).text().trim())
      .get();

    if (cols.length >= 4) {
      const [name, capacity, current, percentage] = cols;

      const reservoir: ReservoirData = {
        embalse: name,
        capacidadHm3: parseFloat(capacity.replace(',', '.')),
        almacenadoHm3: parseFloat(current.replace(',', '.')),
        porcentaje: parseFloat(percentage.replace(',', '.')),
      };

      if (!reservoirs['Murcia']) reservoirs['Murcia'] = [];
      reservoirs['Murcia'].push(reservoir);
    }
  });

  return reservoirs;
}

scrapeReservoirs().then((data) => {
  const filePath = path.join(__dirname, 'scraperSegura.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Data saved to: ${filePath}`);
});
