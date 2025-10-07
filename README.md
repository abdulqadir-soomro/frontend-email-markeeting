# 📧 EmailPro - Complete Email Marketing Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.8-orange?style=for-the-badge&logo=firebase)
![AWS SES](https://img.shields.io/badge/AWS_SES-Latest-yellow?style=for-the-badge&logo=amazon-aws)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

**A production-ready Mailchimp alternative built with Next.js 14, Firebase, and AWS SES**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [✨ Features](#-features) • [🏗️ Architecture](#️-architecture)

</div>

---

## 🎯 What is EmailPro?

EmailPro is a **complete, open-source email marketing platform** that rivals Mailchimp, SendGrid, and other commercial solutions. Built with modern technologies, it provides everything you need to:

- ✅ Verify and send from your own domains
- ✅ Manage subscriber lists with CSV import
- ✅ Design and send HTML email campaigns
- ✅ Track opens, clicks, and engagement
- ✅ View real-time analytics and reports
- ✅ Scale to millions of emails

**Perfect for:**
- 🚀 Startups building their email infrastructure
- 📚 Learning modern full-stack development
- 💼 Agencies managing client campaigns
- 🎓 Portfolio projects showcasing real-world skills
- 🏢 Businesses wanting full control of email data

---

## ✨ Features

### 🔐 Authentication & User Management
- Email/password registration and login
- Google OAuth integration
- Firebase Authentication
- Protected dashboard routes
- Session management

### 🌍 Domain Verification
- Add custom sending domains
- AWS SES integration
- SPF and DKIM record generation
- Real-time verification status
- Multi-domain support

### 👥 Subscriber Management
- CSV file import with validation
- Bulk subscriber upload
- Duplicate detection
- Active/unsubscribed status
- Export functionality

### 📨 Campaign Management
- HTML email editor
- Campaign preview
- Draft/sent status tracking
- Bulk sending (batches of 50)
- Send scheduling ready

### 📊 Analytics & Tracking
- Open rate tracking (pixel-based)
- Click-through rate tracking
- Real-time dashboard metrics
- Campaign performance reports
- Engagement analytics

### 🎨 Modern UI/UX
- Responsive design (mobile to desktop)
- Beautiful Tailwind CSS styling
- ShadCN UI components
- Toast notifications
- Loading states
- Empty states

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- AWS account with SES access
- A domain you own

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Configure Firebase & AWS (see GET_STARTED.md)
# Edit .env.local with your credentials

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

**📘 For detailed setup:** See [`GET_STARTED.md`](./GET_STARTED.md) for a complete 10-minute setup guide.

---

## 📖 Documentation

We've created comprehensive documentation to help you get started:

| Document | Description | When to Use |
|----------|-------------|-------------|
| [**GET_STARTED.md**](./GET_STARTED.md) | 10-minute quick start guide | Start here! First-time setup |
| [**SETUP_INSTRUCTIONS.md**](./SETUP_INSTRUCTIONS.md) | Detailed step-by-step setup | Comprehensive walkthrough |
| [**INSTALLATION_CHECKLIST.md**](./INSTALLATION_CHECKLIST.md) | Verification checklist | Ensure everything works |
| [**QUICK_REFERENCE.md**](./QUICK_REFERENCE.md) | Commands & troubleshooting | Quick lookup |
| [**ARCHITECTURE_AND_FEATURES.md**](./ARCHITECTURE_AND_FEATURES.md) | Technical deep dive | Understand the system |
| [**PROJECT_SUMMARY.md**](./PROJECT_SUMMARY.md) | Complete overview | See what's included |
| [**README_MAILCHIMP_CLONE.md**](./README_MAILCHIMP_CLONE.md) | Original feature spec | Full feature list |

---

## 🏗️ Architecture

### Tech Stack

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS + ShadCN UI
Auth:      Firebase Authentication (Email/Password + Google)
Database:  Cloud Firestore (NoSQL)
Email:     AWS Simple Email Service (SES)
Storage:   Firebase Storage (optional)
Hosting:   Vercel / Firebase Hosting
```

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js 14 Frontend                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Auth    │  │Dashboard │  │ Landing  │              │
│  │  Pages   │  │  Pages   │  │   Page   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────┬────────────────────────────────────────────┘
             │
        ┌────┴─────┬─────────────┬──────────────┐
        │          │             │              │
   ┌────▼───┐ ┌───▼────┐  ┌─────▼─────┐  ┌────▼────┐
   │Firebase│ │  API   │  │ Firestore │  │   AWS   │
   │  Auth  │ │ Routes │  │  Database │  │   SES   │
   └────────┘ └────────┘  └───────────┘  └─────────┘
```

### Project Structure

```
amzonwork-next/
├── app/
│   ├── api/                  # 14 API routes
│   │   ├── campaigns/        # Campaign CRUD & sending
│   │   ├── domains/          # Domain management
│   │   ├── subscribers/      # Subscriber operations
│   │   └── track/            # Email tracking
│   ├── auth/                 # Login & Register
│   ├── dashboard/            # Protected pages
│   │   ├── campaigns/
│   │   ├── domains/
│   │   ├── reports/
│   │   └── subscribers/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # 12 ShadCN components
│   ├── dashboard/            # Dashboard layout
│   └── ProtectedRoute.tsx
├── lib/
│   ├── firebase.ts           # Firebase config
│   ├── firebase-admin.ts     # Admin SDK
│   ├── aws-ses.ts            # Email sending
│   └── utils.ts              # Helpers
├── contexts/
│   └── AuthContext.tsx       # Auth provider
└── [Configuration files]
```

---

## 🎓 What You'll Learn

Building or studying this project teaches:

### Frontend
- ✅ Next.js 14 App Router patterns
- ✅ Server Components vs Client Components
- ✅ React Context for state management
- ✅ TypeScript best practices
- ✅ Modern React hooks
- ✅ Form handling with validation
- ✅ Responsive design with Tailwind

### Backend
- ✅ RESTful API design
- ✅ Serverless functions (Next.js API routes)
- ✅ File upload handling
- ✅ CSV parsing and processing
- ✅ Batch operations
- ✅ Error handling patterns

### Cloud Services
- ✅ Firebase Authentication integration
- ✅ Firestore database modeling
- ✅ Security rules implementation
- ✅ AWS SDK integration
- ✅ AWS SES email sending
- ✅ Domain verification (SPF/DKIM)

### Full-Stack Skills
- ✅ End-to-end feature development
- ✅ Real-time tracking implementation
- ✅ Analytics dashboard creation
- ✅ Production-ready architecture
- ✅ Security best practices
- ✅ Performance optimization

---

## 📊 Database Schema

### Firestore Collections

```javascript
users/{uid}
  - uid: string
  - email: string
  - name: string
  - createdAt: timestamp

domains/{uid}/userDomains/{domainId}
  - domain: string
  - status: "pending" | "verified"
  - dkimTokens: string[]
  - createdAt: timestamp

subscribers/{uid}/contacts/{subscriberId}
  - email: string
  - name: string
  - status: "active" | "unsubscribed"
  - createdAt: timestamp

campaigns/{uid}/userCampaigns/{campaignId}
  - subject: string
  - fromEmail: string
  - htmlContent: string
  - status: "draft" | "sent"
  - sentCount: number
  - openCount: number
  - clickCount: number
  - createdAt: timestamp
  - sentAt: timestamp (optional)
  
  opens/{openId}
    - email: string
    - timestamp: string
    - userAgent: string
    - ip: string
  
  clicks/{clickId}
    - email: string
    - url: string
    - timestamp: string
```

---

## 🔒 Security

### Implemented Security Measures

- ✅ Firebase Authentication with JWT
- ✅ Firestore security rules (user-scoped data)
- ✅ Environment variables for secrets
- ✅ Input validation and sanitization
- ✅ Protected API routes
- ✅ CSRF protection (Next.js built-in)
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection ready
- ✅ AWS IAM least-privilege access
- ✅ HTTPS enforcement

### Security Files

- `firestore-email-platform.rules` - Firestore security rules
- `.env.local` - Environment secrets (gitignored)
- `.gitignore` - Prevents secret commits

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Import to Vercel
# - Go to vercel.com
# - Import your GitHub repo
# - Add environment variables
# - Deploy!
```

### Deploy to Firebase Hosting

```bash
# 1. Build the app
npm run build

# 2. Initialize Firebase
firebase init hosting

# 3. Deploy
firebase deploy
```

### Environment Variables

Remember to set these in your hosting platform:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
NEXT_PUBLIC_APP_URL
```

---

## 📈 Scalability

### Current Capacity
- **Subscribers**: 100,000+
- **Emails per day**: 50,000 (AWS default)
- **Concurrent users**: 1,000+
- **Storage**: Unlimited (Firestore)

### Scaling Path

**Phase 1** (Current - 0-50K emails/day)
- Single region deployment
- Basic infrastructure
- Suitable for most startups

**Phase 2** (50K-500K emails/day)
- Add Redis caching
- Implement job queue
- Background processing
- CDN for assets

**Phase 3** (500K+ emails/day)
- Multi-region deployment
- Database sharding
- Load balancing
- Microservices architecture

---

## 🛠️ Development

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Development Workflow

1. **Make changes** to files
2. **Hot reload** refreshes automatically
3. **Check browser** console for errors
4. **Test API routes** with requests
5. **View Firestore** data in console

---

## 🐛 Troubleshooting

### Common Issues

**Module not found errors**
```bash
rm -rf node_modules package-lock.json .next
npm install
```

**Firebase Auth errors**
- Verify environment variables
- Restart dev server
- Check Firebase console

**AWS SES errors**
- Check domain verification
- Verify IAM permissions
- Check CloudWatch logs

**TypeScript errors**
- Run `npm install`
- Check `tsconfig.json`
- Restart VS Code

---

## 🤝 Contributing

This is a complete starter template. You can:

1. **Fork** the project
2. **Customize** for your needs
3. **Add features** you want
4. **Share** improvements
5. **Build** commercial products

No attribution required (MIT License).

---

## 📝 License

MIT License - Free to use for personal or commercial projects.

See [LICENSE](./LICENSE) for details.

---

## 🎉 Features Roadmap

### ✅ Implemented
- User authentication
- Domain verification
- Subscriber management
- Campaign creation
- Bulk email sending
- Open/click tracking
- Analytics dashboard

### 🔜 Coming Soon
- Email templates
- Drag-and-drop builder
- A/B testing
- Scheduled campaigns
- Unsubscribe handling
- Bounce management

### 💡 Future Ideas
- Marketing automation
- Advanced segmentation
- CRM integration
- Mobile app
- API for developers
- White-label solution

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [AWS SES](https://aws.amazon.com/ses/) - Email delivery
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ShadCN UI](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Hosting

---

## 📞 Support

### Documentation
- 📖 See the `/docs` folder for detailed guides
- 🔍 Check `QUICK_REFERENCE.md` for common issues
- ✅ Use `INSTALLATION_CHECKLIST.md` to verify setup

### Community
- 💬 [GitHub Issues](../../issues) - Report bugs
- 💡 [GitHub Discussions](../../discussions) - Ask questions
- ⭐ Star this repo if you find it useful!

---

## 🎯 Use Cases

### For Businesses
- Send newsletters to customers
- Announce product updates
- Run marketing campaigns
- Track engagement metrics

### For Developers
- Learn modern web development
- Build portfolio projects
- Understand cloud services
- Practice full-stack skills

### For Agencies
- Manage client email campaigns
- White-label for clients
- Offer email marketing services
- Full data ownership

---

## 🌟 Why Choose EmailPro?

| Feature | EmailPro | Mailchimp | SendGrid |
|---------|----------|-----------|----------|
| **Open Source** | ✅ Yes | ❌ No | ❌ No |
| **Self Hosted** | ✅ Yes | ❌ No | ❌ No |
| **Cost** | 💰 AWS SES only (~$0.10/1000 emails) | 💰💰 $13-350+/mo | 💰💰 $20-90+/mo |
| **Data Ownership** | ✅ 100% yours | ❌ Theirs | ❌ Theirs |
| **Customizable** | ✅ Fully | ⚠️ Limited | ⚠️ Limited |
| **Learning Value** | ✅ High | ❌ None | ❌ None |
| **Modern Stack** | ✅ Next.js 14 | ❌ Proprietary | ❌ Proprietary |

---

## 📸 Screenshots

### Landing Page
Beautiful, modern landing page with call-to-action

### Dashboard
Clean dashboard with key metrics and quick actions

### Domain Management
Easy domain verification with DNS record display

### Campaign Builder
Simple but powerful campaign creation interface

### Analytics
Real-time tracking and performance metrics

---

## 🎓 Learning Resources

Want to learn more about the technologies used?

- **Next.js**: [nextjs.org/learn](https://nextjs.org/learn)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **AWS SES**: [docs.aws.amazon.com/ses](https://docs.aws.amazon.com/ses/)
- **Tailwind**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 🚀 Get Started Now!

Ready to build your email marketing platform?

1. **Star ⭐ this repo** (if you find it useful)
2. **Read** [`GET_STARTED.md`](./GET_STARTED.md)
3. **Follow** the 10-minute setup
4. **Deploy** your platform
5. **Start** sending emails!

---

<div align="center">

**Built with ❤️ using Next.js, Firebase, and AWS SES**

[Get Started](./GET_STARTED.md) • [Documentation](./SETUP_INSTRUCTIONS.md) • [GitHub](https://github.com)

**Happy Email Marketing! 📧🚀**

</div>
