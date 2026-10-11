const axios = require('axios');

async function lookup(target) {
  let out = '=== OSINT LOOKUP ===\n';
  out += 'Target: ' + target + '\n\n';

  try {
    const geo = await axios.get('http://ip-api.com/json/' + target);
    const d = geo.data;
    out += 'IP: ' + d.query + '\n';
    out += 'Country: ' + d.country + ' (' + d.countryCode + ')\n';
    out += 'Region: ' + d.regionName + '\n';
    out += 'City: ' + d.city + '\n';
    out += 'ISP: ' + d.isp + '\n';
    out += 'Org: ' + d.org + '\n';
    out += 'AS: ' + d.as + '\n';
    out += 'Lat/Lon: ' + d.lat + ', ' + d.lon + '\n';
    out += 'Timezone: ' + d.timezone + '\n';
  } catch (e) {
    out += 'Geo error: ' + e.message + '\n';
  }

  return out;
}

module.exports = { lookup };
