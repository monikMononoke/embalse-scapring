import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { InterfaceSaihDuero, ReservoirsByProvince } from './interfaceDuero';

const url = 'https://www.saihduero.es/situacion-embalses';

async function scrapeReservoirs(): Promise<ReservoirsByProvince> {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const reservoirs: ReservoirsByProvince = {};
  let currentProvince = '';

  $('table tbody tr').each((_, row) => {
    const $row = $(row);

    const provinceCell = $row.find('td.system');
    if (provinceCell.length) {
      currentProvince = provinceCell.text().trim();
      return;
    }

    if ($row.hasClass('subtotal')) return;

    const $reservoirName = $row
      .find('td.reservoir > a')
      .map((_, el) => $(el).text().trim())
      .get(0);
    if (!$reservoirName) return;

    const cols = $row
      .find('td')
      .map((_, el) => $(el).text().trim())
      .get();
    if (cols.length >= 11) {
      const [
        name = $reservoirName,
        capacity,
        current,
        currentPercentage,
        lastYear,
        lastTenYears,
        volumeVariation,
        rainfall,
        averageEntrance,
        averageExit,
        rainfallYear,
      ] = cols;

      const reservoir: InterfaceSaihDuero = {
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

      if (!reservoirs[currentProvince]) reservoirs[currentProvince] = [];
      reservoirs[currentProvince].push(reservoir);
    }
  });
  return reservoirs;
}

scrapeReservoirs().then((data) => {
  const filePath = path.join(__dirname, 'scraperDuero.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Data saved to: ${filePath}`);
});
