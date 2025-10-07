import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Connect Gmail</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #4285f4;
    }
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
      font-weight: 500;
    }
    button:hover {
      background: #357ae8;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info-box p {
      margin: 5px 0;
      color: #1565c0;
      font-size: 14px;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .warning p {
      margin: 5px 0;
      color: #856404;
      font-size: 14px;
    }
    .steps {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .steps ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .steps li {
      margin: 8px 0;
      color: #555;
      font-size: 14px;
    }
    .error {
      color: #d32f2f;
      margin-top: 10px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔐 Connect Your Gmail</h1>
    <p class="subtitle">Securely connect your Gmail account to send emails</p>

    <div class="warning">
      <p><strong>⚠️ Important:</strong> Use an App Password, not your regular Gmail password!</p>
    </div>

    <div class="steps">
      <p><strong>How to get an App Password:</strong></p>
      <ol>
        <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank">Google App Passwords</a></li>
        <li>Sign in to your Google Account</li>
        <li>Create a new app password for "Mail"</li>
        <li>Copy the 16-character password</li>
        <li>Paste it below (no spaces)</li>
      </ol>
    </div>

    <form id="gmailForm">
      <div class="form-group">
        <label for="email">Gmail Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="your.email@gmail.com" 
          required
        />
      </div>

      <div class="form-group">
        <label for="appPassword">App Password (16 characters)</label>
        <input 
          type="password" 
          id="appPassword" 
          name="appPassword" 
          placeholder="xxxx xxxx xxxx xxxx"
          required
          minlength="16"
          maxlength="16"
        />
      </div>

      <div class="info-box">
        <p><strong>✓ Secure:</strong> Your credentials are encrypted and stored safely</p>
        <p><strong>✓ Limit:</strong> Gmail allows up to 500 emails per day</p>
        <p><strong>✓ Easy:</strong> Send emails directly from your Gmail address</p>
      </div>

      <button type="submit" id="submitBtn">Connect Gmail</button>
      <p class="error" id="error"></p>
    </form>
  </div>

  <script>
    const form = document.getElementById('gmailForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorEl = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connecting...';
      errorEl.style.display = 'none';

      const email = document.getElementById('email').value;
      const appPassword = document.getElementById('appPassword').value.replace(/\\s/g, '');

      try {
        const response = await fetch('/api/gmail/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: '${userId}',
            email,
            appPassword
          })
        });

        const data = await response.json();

        if (data.success) {
          alert('Gmail connected successfully! You can close this window.');
          window.close();
        } else {
          throw new Error(data.error || 'Failed to connect Gmail');
        }
      } catch (error) {
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Connect Gmail';
      }
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

