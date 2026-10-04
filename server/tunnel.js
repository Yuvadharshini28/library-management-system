const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
const http = require('http');

(async () => {
  try {
    console.log('Starting public tunnel for port 5000...');
    const tunnel = await localtunnel({ port: 5000 });

    const info = `
======================================================
🌐 Public Shareable URL: ${tunnel.url}
======================================================
`;
    console.log(info);
    fs.writeFileSync(path.join(__dirname, 'tunnel-url.txt'), tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel has closed.');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err);
  }
})();
