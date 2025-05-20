import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { ReservoirCollection, ReservoirData } from './interfacesScraperEbro';

const url = 'https://www.saihebro.com/pluviometrias/tabla-pluviometria';

async function scrapeReservoirs(): Promise<ReservoirCollection> {
  const agent = new https.Agent({ rejectUnauthorized: false });
  const response = await axios.get(url, { httpsAgent: agent });
  const $ = cheerio.load(response.data);

  const reservoirs: ReservoirCollection = {};

  const $innerContainer = $('div.table-scroll > table tbody tr');

  $($innerContainer).each((_, row) => {
    const cols = $(row)
      .find('td')
      .map((_, el) => $(el).text().trim())
      .get();

    if (cols.length >= 9) {
      const [
        name,
        lastHour,
        today,
        twentyFourHours,
        yesterday,
        thisMonth,
        thisYear,
        province,
        riverZone,
      ] = cols;

      const reservoir: ReservoirData = {
        name,
        lastHour,
        today,
        twentyFourHours,
        yesterday,
        thisMonth,
        thisYear,
        province,
        riverZone,
      };

      if (!reservoirs[name]) reservoirs[name] = [];
      reservoirs[name].push(reservoir);
    }
  });

  return reservoirs;
}

scrapeReservoirs().then((data) => {
  const filePath = path.join(__dirname, 'reservoirsEbro.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Data saved to: ${filePath}`);
});
