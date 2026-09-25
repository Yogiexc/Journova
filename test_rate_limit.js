const http = require('http');

async function testRateLimit() {
  let successCount = 0;
  let rateLimitedCount = 0;

  console.log('Sending 12 rapid login requests...');
  
  const requests = Array.from({ length: 12 }).map((_, i) => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 429) {
          rateLimitedCount++;
        } else if (res.statusCode === 200 || res.statusCode === 401) {
          // 401 means login failed (empty body), but request passed through rate limit
          successCount++;
        }
        res.on('data', () => {}); // Consume body
        res.on('end', () => resolve(res.statusCode));
      });

      req.on('error', (e) => {
        console.error(`Problem with request ${i}: ${e.message}`);
        resolve(null);
      });

      req.write(JSON.stringify({ email: 'fake@example.com', password: 'fake' }));
      req.end();
    });
  });

  const results = await Promise.all(requests);
  
  console.log(`Passed Throttler: ${successCount}`);
  console.log(`Rate Limited (429): ${rateLimitedCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('[PASS] Throttler is working and blocking excess requests.');
  } else {
    console.log('[FAIL] Throttler did not block any requests!');
  }
}

testRateLimit();
