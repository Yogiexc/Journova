const API_URL = 'http://localhost:3001/api/v1';

async function run() {
  console.log('Logging in as EDITOR...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'editor1@journova.local', password: 'editorpassword' })
  });
  
  if (!loginRes.ok) {
    console.error('Failed to login:', await loginRes.text());
    process.exit(1);
  }
  
  const loginData = await loginRes.json();
  console.log('Login successful!', loginData);
}

run().catch(console.error);
