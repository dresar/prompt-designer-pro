const fs = require('fs');
const jwt = require('jsonwebtoken');

async function check() {
  const env = fs.readFileSync('.env', 'utf8');
  const tokenMatch = env.match(/JWT_ACCESS_SECRET="([^"]+)"/);
  if (!tokenMatch) return console.log('No token');
  
  const token = jwt.sign({ id: 'cmqxv1zm90001wfn2wpbukkaf', role: 'admin' }, tokenMatch[1], { issuer: 'promptstudio.ai' });
  const res = await fetch('http://localhost:3001/api/prompts/history?page=1', {
    headers: { Authorization: 'Bearer ' + token }
  });
  console.log(res.status);
  const data = await res.json();
  console.log(data);
}
check();
