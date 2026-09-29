fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'POST'
  }
}).then(res => {
  console.log('Status:', res.status);
  for (let [key, val] of res.headers.entries()) {
    console.log(key + ':', val);
  }
}).catch(console.error);
