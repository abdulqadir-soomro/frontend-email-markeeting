# Technical Architecture - Email Marketing Dashboard with AWS SES

## 🏗️ System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[Next.js Frontend]
        B --> C[React Components]
        C --> D1[Dashboard]
        C --> D2[Template Manager]
        C --> D3[Email Scheduler]
        C --> D4[Analytics]
    end

    subgraph "Application Layer - Next.js Server"
        E[Next.js API Routes]
        E --> F1[/api/send-email]
        E --> F2[/api/send-bulk]
        E --> F3[/api/upload-csv]
    end

    subgraph "Authentication & Database"
        G[Firebase Auth]
        H[Firebase Firestore]
        H --> H1[(users)]
        H --> H2[(campaigns)]
        H --> H3[(emailRecords)]
        H --> H4[(emailTemplates)]
        H --> H5[(scheduledEmails)]
    end

    subgraph "AWS Cloud Services"
        I[AWS SES Service]
        I --> I1[Email Sending Queue]
        I --> I2[Bounce & Complaint Handling]
        I --> I3[Email Verification]
        I --> I4[Regional Endpoints]
        I4 --> R1[us-east-1]
        I4 --> R2[eu-west-1]
        I4 --> R3[ap-southeast-1]
    end

    subgraph "External Services"
        J[SMTP Server]
        K[Recipient Email Servers]
    end

    B --> G
    B --> E
    E --> G
    E --> H
    F1 --> I
    F2 --> I
    I --> J
    J --> K

    style A fill:#e1f5ff
    style I fill:#ff9900
    style G fill:#ffca28
    style H fill:#ffca28
```

## 🔄 Email Sending Flow with AWS SES

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js Frontend
    participant API as API Route
    participant FB as Firebase
    participant SES as AWS SES
    participant SMTP as SMTP Server
    participant R as Recipient

    U->>FE: Upload CSV & Compose Email
    FE->>FE: Parse CSV File
    FE->>API: POST /api/send-bulk
    
    Note over API: Validate Request
    API->>FB: Authenticate User
    FB-->>API: User Validated
    
    loop For Each Email
        API->>SES: SendEmailCommand
        Note over SES: Process Email
        SES->>SES: Check Sender Verification
        SES->>SES: Apply Rate Limits
        SES->>SMTP: Send via SMTP
        SMTP->>R: Deliver Email
        R-->>SMTP: Accept/Reject
        SMTP-->>SES: Delivery Status
        SES-->>API: Success/Failure Response
        API->>FB: Save Email Record
        API-->>FE: Progress Update
        FE-->>U: Real-time Status
    end
    
    API->>FB: Save Campaign Summary
    API-->>FE: Campaign Complete
    FE-->>U: Show Results
```

## 📧 AWS SES Integration Architecture

```mermaid
graph LR
    subgraph "Application Server"
        A[Next.js API] --> B[AWS SDK Client]
        B --> C{Email Type}
        C -->|Single| D[SendEmailCommand]
        C -->|Bulk| E[Batch Processing]
    end

    subgraph "AWS SES Components"
        F[SES API Gateway]
        G[Email Processing Engine]
        H[Rate Limiter]
        I[Bounce Handler]
        J[Complaint Handler]
        K[Verification System]
    end

    subgraph "Email Delivery"
        L[SMTP Server]
        M[Delivery Queue]
        N[Retry Logic]
        O[Bounce Queue]
        P[Complaint Queue]
    end

    D --> F
    E --> F
    F --> G
    G --> H
    H --> K
    K --> L
    L --> M
    M --> N
    N --> O
    N --> P
    O --> I
    P --> J

    style F fill:#ff9900
    style G fill:#ff9900
    style A fill:#0066cc
```

## 🔐 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant FA as Firebase Auth
    participant FS as Firestore
    participant API as API Routes
    participant SES as AWS SES

    U->>FE: Login/Signup
    FE->>FA: createUser/signIn
    FA-->>FE: Auth Token
    FE->>FS: Create User Profile
    FS-->>FE: User Data Stored
    
    Note over U,FE: User Authenticated
    
    U->>FE: Configure Sender Email
    FE->>FS: Save Email Config
    
    U->>FE: Send Campaign
    FE->>API: Request with Auth Token
    API->>FA: Verify Token
    FA-->>API: Token Valid
    API->>FS: Get User Config
    FS-->>API: Return AWS Region & Email
    API->>SES: Initialize SES Client
    SES-->>API: Client Ready
    API->>SES: Send Emails
    SES-->>API: Results
    API->>FS: Save Campaign Data
    API-->>FE: Return Results
```

## 🗄️ Data Flow Architecture

```mermaid
graph TB
    subgraph "User Input"
        A[User Actions]
        A --> A1[Upload CSV]
        A --> A2[Configure Email]
        A --> A3[Select Template]
        A --> A4[Schedule Campaign]
    end

    subgraph "Processing Layer"
        B[Frontend Validation]
        C[API Processing]
        D[Data Transformation]
    end

    subgraph "Storage Layer"
        E[Firebase Firestore]
        E --> E1[(User Profiles)]
        E --> E2[(Email Lists)]
        E --> E3[(Templates)]
        E --> E4[(Campaigns)]
        E --> E5[(Email Records)]
        E --> E6[(Scheduled Jobs)]
    end

    subgraph "Delivery Layer"
        F[AWS SES]
        G[Email Queue]
        H[Delivery Status]
    end

    subgraph "Analytics Layer"
        I[Campaign Metrics]
        J[User Analytics]
        K[Performance Data]
    end

    A1 --> B
    A2 --> B
    A3 --> B
    A4 --> B
    B --> C
    C --> D
    D --> E
    D --> F
    F --> G
    G --> H
    H --> E5
    E4 --> I
    E5 --> I
    I --> J
    J --> K

    style F fill:#ff9900
    style E fill:#ffca28
```

## ⚙️ AWS SES Configuration & Setup

```mermaid
graph TB
    subgraph "AWS SES Setup Requirements"
        A[AWS Account]
        A --> B[IAM User Creation]
        B --> C[SES Permissions]
        C --> D[Access Keys]
        D --> E[Environment Variables]
    end

    subgraph "Email Verification Process"
        F[Sender Email]
        F --> G[Verify in SES Console]
        G --> H[Confirmation Email]
        H --> I[Verified Status]
    end

    subgraph "Sandbox vs Production"
        J{SES Mode}
        J -->|Sandbox| K[Limited Recipients]
        J -->|Production| L[Unlimited Recipients]
        K --> M[Request Production Access]
        M --> L
    end

    subgraph "Regional Configuration"
        N[Multi-Region Setup]
        N --> N1[us-east-1]
        N --> N2[eu-west-1]
        N --> N3[ap-southeast-1]
        N --> N4[Other Regions]
    end

    I --> J
    L --> N

    style A fill:#ff9900
    style I fill:#00ff00
```

## 🔄 Email Campaign Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Campaign
    Draft --> Configured: Add Recipients & Content
    Configured --> Preview: Preview Email
    Preview --> Configured: Edit
    Preview --> Scheduled: Schedule for Later
    Preview --> Sending: Send Now
    
    Scheduled --> Sending: Trigger Time Reached
    
    Sending --> Processing: AWS SES Processing
    Processing --> Delivered: Success
    Processing --> Failed: Error/Bounce
    Processing --> Queued: Rate Limited
    
    Queued --> Processing: Retry
    
    Delivered --> Completed: All Sent
    Failed --> Completed: Max Retries
    
    Completed --> Analytics: Generate Reports
    Analytics --> [*]
```

## 🏗️ Component Architecture

```mermaid
graph TB
    subgraph "Pages Layer"
        A[pages/index.js]
        B[pages/auth.js]
        C[pages/register.js]
        D[pages/status.js]
    end

    subgraph "Components Layer"
        E[AnalyticsDashboard]
        F[TemplateManager]
        G[EmailScheduler]
        H[NotificationSystem]
    end

    subgraph "API Layer"
        I[api/send-email.js]
        J[api/send-bulk.js]
        K[api/upload-csv.js]
    end

    subgraph "Services Layer"
        L[Firebase Service]
        M[AWS SES Service]
        N[CSV Parser]
        O[Email Validator]
    end

    subgraph "Utilities"
        P[Authentication Utils]
        Q[Error Handlers]
        R[Data Transformers]
    end

    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    
    I --> M
    J --> M
    K --> N
    
    B --> L
    C --> L
    
    I --> O
    J --> O
    
    E --> L
    F --> L
    G --> L

    style M fill:#ff9900
    style L fill:#ffca28
```

## 📊 AWS SES Email Processing Pipeline

```mermaid
flowchart TD
    A[Email Request] --> B{Validate Sender}
    B -->|Invalid| C[Reject - Not Verified]
    B -->|Valid| D{Check Rate Limits}
    
    D -->|Exceeded| E[Queue for Later]
    D -->|Within Limits| F{Validate Recipient}
    
    F -->|Invalid| G[Reject - Bad Email]
    F -->|Valid| H{Check Reputation}
    
    H -->|Poor| I[Additional Checks]
    H -->|Good| J[Process Email]
    
    I --> J
    J --> K{Email Content Scan}
    
    K -->|Spam| L[Reject - Spam Content]
    K -->|Clean| M[Send via SMTP]
    
    M --> N{Delivery Attempt}
    
    N -->|Success| O[Delivered]
    N -->|Soft Bounce| P[Retry Queue]
    N -->|Hard Bounce| Q[Bounce Notification]
    N -->|Complaint| R[Complaint Handler]
    
    P --> M
    E --> D
    
    O --> S[Update Metrics]
    Q --> S
    R --> S
    
    S --> T[Store in Firestore]

    style M fill:#ff9900
    style O fill:#00ff00
    style Q fill:#ff0000
    style R fill:#ff6600
```

## 🔌 AWS SDK Integration

```mermaid
graph LR
    subgraph "Application Code"
        A[Next.js API Route]
        B[@aws-sdk/client-ses]
        C[SESClient Instance]
        D[SendEmailCommand]
    end

    subgraph "AWS Configuration"
        E[Environment Variables]
        E --> E1[AWS_ACCESS_KEY_ID]
        E --> E2[AWS_SECRET_ACCESS_KEY]
        E --> E3[AWS_REGION]
    end

    subgraph "SES API"
        F[SES Endpoints]
        F --> F1[SendEmail]
        F --> F2[SendBulkEmail]
        F --> F3[GetSendQuota]
        F --> F4[GetSendStatistics]
    end

    subgraph "Response Handling"
        G[Success Response]
        H[Error Response]
        I[Retry Logic]
    end

    A --> B
    B --> C
    E --> C
    C --> D
    D --> F
    F --> G
    F --> H
    H --> I
    I --> F

    style B fill:#ff9900
    style C fill:#ff9900
    style F fill:#ff9900
```

## 📈 Real-time Progress Tracking

```mermaid
sequenceDiagram
    participant U as User Browser
    participant FE as Frontend State
    participant API as API Endpoint
    participant SES as AWS SES
    participant DB as Firestore

    U->>FE: Start Campaign
    FE->>API: POST /api/send-bulk
    
    loop For Each Email in List
        API->>SES: SendEmailCommand
        SES-->>API: Response
        API->>DB: Save Email Record
        API-->>FE: Progress Update
        FE-->>U: Update UI (X%)
        Note over U,FE: Real-time Progress Bar
    end
    
    API->>DB: Save Campaign Summary
    API-->>FE: Campaign Complete
    FE-->>U: Show Final Results
    U->>FE: View Details
    FE->>DB: Fetch Email Records
    DB-->>FE: Return Details
    FE-->>U: Display Email List
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        A[Firebase Auth]
        B[JWT Tokens]
        C[Local Storage]
    end

    subgraph "API Security"
        D[Token Verification]
        E[Input Validation]
        F[Rate Limiting]
        G[CORS Protection]
    end

    subgraph "AWS Security"
        H[IAM Roles]
        I[Access Keys]
        J[SES Permissions]
        K[Regional Isolation]
    end

    subgraph "Data Security"
        L[Firestore Rules]
        M[User Isolation]
        N[Encrypted Storage]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    
    G --> H
    H --> I
    I --> J
    J --> K
    
    D --> L
    L --> M
    M --> N

    style H fill:#ff9900
    style J fill:#ff9900
    style A fill:#ffca28
    style L fill:#ffca28
```

## 📦 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Dev Server]
        A --> B[npm run dev]
    end

    subgraph "Build Process"
        C[Next.js Build]
        C --> D[Static Generation]
        C --> E[API Routes Bundle]
        C --> F[Asset Optimization]
    end

    subgraph "Deployment Platform - Vercel"
        G[Vercel Edge Network]
        G --> H[CDN Distribution]
        G --> I[Serverless Functions]
        G --> J[Environment Variables]
    end

    subgraph "External Services"
        K[Firebase]
        L[AWS SES]
    end

    subgraph "Monitoring"
        M[Error Tracking]
        N[Performance Metrics]
        O[Usage Analytics]
    end

    B --> C
    C --> G
    I --> K
    I --> L
    G --> M
    G --> N
    G --> O

    style G fill:#0066cc
    style L fill:#ff9900
    style K fill:#ffca28
```

## 🎯 Key Technical Points for Research

### AWS SES Integration:
1. **SDK Usage:** `@aws-sdk/client-ses` v3
2. **Authentication:** IAM Access Keys
3. **Rate Limiting:** Built-in SES rate limits
4. **Regional Support:** Multi-region configuration
5. **Email Verification:** Required for sender addresses

### Architecture Highlights:
1. **Serverless:** Next.js API Routes on Vercel
2. **Real-time:** Firebase Firestore for live updates
3. **Scalable:** AWS SES handles millions of emails
4. **Secure:** Firebase Auth + IAM roles
5. **Modern:** React + Next.js 13+ architecture

### Performance Considerations:
1. **Batch Processing:** Controlled rate limiting
2. **Error Handling:** Comprehensive retry logic
3. **Monitoring:** Real-time progress tracking
4. **Database:** Optimized Firestore queries
5. **Caching:** Next.js built-in caching

This architecture is production-ready and can scale to handle enterprise-level email campaigns.

