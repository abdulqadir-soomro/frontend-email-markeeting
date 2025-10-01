# Email Marketing Dashboard - Next.js Version

A modern, web-based email marketing application built with Next.js and AWS SES. This application allows you to send personalized bulk emails with a beautiful frontend interface.

## Features

- 🎨 **Modern Web Interface** - Clean, responsive dashboard built with React
- 📧 **Bulk Email Sending** - Send emails to multiple recipients
- 📊 **Real-time Progress Tracking** - Monitor sending progress
- 📁 **CSV File Upload** - Easy email list management
- 👁️ **Email Preview** - Preview emails before sending
- ⚙️ **Configuration Management** - Save settings locally
- 🔒 **Secure** - Uses AWS SES for reliable email delivery

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# Email Configuration
EMAIL_FROM=your-verified-email@yourdomain.com
```

### 3. Start the Application
```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 4. Open Your Browser
Navigate to `http://localhost:3000`

## Usage

1. **Configure Settings**: Enter your AWS region and verified email address
2. **Upload CSV**: Upload a CSV file with email addresses and names
3. **Preview Email**: Click "Preview Email" to see how your email will look
4. **Send Emails**: Click "Start Sending" to begin the email campaign
5. **Monitor Progress**: Watch real-time progress and logs

## CSV Format

Your CSV file should have the following format:
```csv
email,name
john@example.com,John Doe
jane@example.com,Jane Smith
```

## AWS SES Setup

1. **Create AWS Account**: Sign up for AWS if you don't have an account
2. **Access SES**: Go to the Amazon SES console
3. **Verify Email**: Verify the email address you want to send from
4. **Get Credentials**: Create IAM user with SES permissions
5. **Update .env.local**: Add your credentials to the `.env.local` file

## Project Structure

```
amzonwork-next/
├── pages/
│   ├── api/
│   │   ├── send-email.js
│   │   ├── upload-csv.js
│   │   └── send-bulk.js
│   ├── index.js (dashboard)
│   ├── auth.js (login/signup)
│   └── _app.js (global layout)
├── public/
│   └── styles.css
├── .env.local
└── README.md
```

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Next.js API Routes
- **Email Service**: AWS SES (via `@aws-sdk/client-ses`)
- **File Processing**: csv-parser
- **Styling**: Custom CSS with modern design

## Benefits of Next.js Version

- **Server-Side Rendering**: Better SEO and performance
- **File-Based Routing**: Cleaner project structure
- **API Routes**: Built-in backend endpoints
- **Optimized Performance**: Automatic code splitting and optimization
- **Easy Deployment**: Simple deployment to Vercel or other platforms

## Security Notes

- Never commit your `.env.local` file to version control
- Use IAM roles with minimal required permissions
- Verify all email addresses in AWS SES before sending

## Troubleshooting

### Common Issues

1. **"AWS credentials not configured"**
   - Check your `.env.local` file
   - Verify AWS credentials are correct
   - Ensure IAM user has SES permissions

2. **"Email address not verified"**
   - Verify your sender email in AWS SES console
   - Check if you're in SES sandbox mode

3. **"CSV file not uploading"**
   - Ensure file is in CSV format
   - Check file size limits
   - Verify CSV has proper headers

## License

ISC License - Feel free to use this project for your email marketing needs.

## Support

For support or questions, contact SAYNIN TECH at services@saynintech.com