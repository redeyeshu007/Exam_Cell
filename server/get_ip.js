const http = require('http');

http.get('http://ipecho.net/plain', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('YOUR_SYSTEM_IP:' + data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
  process.exit(1);
});
