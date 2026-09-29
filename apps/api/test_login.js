const data = JSON.stringify({ email: "author@test.com", password: "Password123!" });
fetch("http://localhost:3001/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: data
}).then(res => res.text()).then(text => console.log("RESPONSE:", text));
