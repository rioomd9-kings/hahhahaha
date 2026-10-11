const axios = require('axios');

async function check(ip) {
  let out = '=== VPS CHECK ===\n\n';
  out += 'IP: ' + ip + '\n\n';

  try {
    const geo = await axios.get('http://ip-api.com/json/' + ip);
    const d = geo.data;
    out += 'Country: ' + d.country + '\n';
    out += 'City: ' + d.city + '\n';
    out += 'ISP: ' + d.isp + '\n';
    out += 'Org: ' + d.org + '\n';
    out += 'AS: ' + d.as + '\n\n';

    try {
      const rev = await axios.get('https://dns.google/resolve?name=' + ip.split('.').reverse().join('.') + '.in-addr.arpa&type=PTR');
      if (rev.data.Answer) {
        out += 'Reverse DNS: ' + rev.data.Answer[0].data + '\n';
      }
    } catch (e) {}

    out += '\n=== PORT CHECK ===\n';
    const ports = [22, 80, 443, 3306, 8080];
    for (const p of ports) {
      try {
        const r = await axios.get('http://' + ip + ':' + p, { timeout: 2000 });
        out += 'Port ' + p + ': OPEN (' + r.status + ')\n';
      } catch (e) {
        if (e.code === 'ECONNREFUSED') out += 'Port ' + p + ': CLOSED\n';
        else out += 'Port ' + p + ': FILTERED\n';
      }
    }
  } catch (e) {
    out += 'Error: ' + e.message + '\n';
  }

  return out;
}

module.exports = { check };
