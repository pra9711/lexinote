# 🚀 Lexinote - AI-Powered PDF Intelligence Platform

<div align="center">

![Lexinote Logo](https://img.shields.io/badge/Lexinote-AI%20PDF%20Platform-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-lexinote.tech-4285f4?style=for-the-badge)](https://www.lexinote.tech/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/pra9711/lexinote)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**Transform your PDFs into intelligent conversations with cutting-edge AI technology**

[🎯 Features](#-features) • [🚀 Quick Start](#-quick-start) • [🛠️ Tech Stack](#️-tech-stack) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ What is Lexinote?

Lexinote is a revolutionary AI-powered platform that transforms static PDF documents into interactive, intelligent conversations. Upload any PDF and instantly unlock the power to chat with your documents, extract insights, generate summaries, and discover hidden knowledge through advanced AI analysis.

### 🎬 See It In Action

<div align="center">

![Lexinote Demo](https://img.shields.io/badge/📹_Watch_Demo-Coming_Soon-ff6b6b?style=for-the-badge)

*Experience the magic of AI-powered document analysis*

</div>

---

## 🌟 Key Features

### 🤖 **AI-Powered Chat Interface**
- **Intelligent Conversations**: Chat naturally with your PDFs using advanced language models
- **Context-Aware Responses**: Get accurate answers based on document content
- **Multi-Language Support**: Works with documents in various languages
- **Real-Time Processing**: Instant responses with streaming AI technology

### 📄 **Advanced PDF Management**
- **Smart Upload System**: Drag-and-drop interface with progress tracking
- **Document Organization**: Custom icons, colors, and categorization
- **Version Control**: Track document changes and updates
- **Batch Processing**: Handle multiple documents simultaneously

### 🎨 **Rich User Experience**
- **Interactive PDF Viewer**: Advanced rendering with zoom, rotation, and navigation
- **Highlighting & Annotations**: Mark important sections with color-coded highlights
- **Bookmarking System**: Save and organize important pages
- **Dark/Light Mode**: Customizable themes for comfortable reading

### 🔒 **Enterprise-Grade Security**
- **Secure Authentication**: Powered by Kinde Auth with OAuth support
- **Data Encryption**: End-to-end encryption for document security
- **Privacy First**: Your documents are never shared or stored insecurely
- **GDPR Compliant**: Full compliance with data protection regulations

### 💎 **Premium Features**
- **Unlimited Uploads**: No restrictions on document quantity (Pro plan)
- **Large File Support**: Handle documents up to 16MB (Pro plan)
- **Priority Processing**: Faster AI analysis and responses
- **Advanced Analytics**: Detailed insights and usage statistics

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database
- **Google AI API** key
- **Pinecone** vector database account
- **Stripe** account (for payments)
- **Kinde** authentication setup

### 1. Clone the Repository

```bash
git clone https://github.com/pra9711/lexinote.git
cd lexinote
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lexinote"

# Authentication (Kinde)
KINDE_CLIENT_ID="your_kinde_client_id"
KINDE_CLIENT_SECRET="your_kinde_client_secret"
KINDE_ISSUER_URL="https://your-domain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/dashboard"

# AI & Vector Database
GOOGLE_API_KEY="your_google_ai_api_key"
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_ENVIRONMENT="your_pinecone_environment"

# File Upload
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"

# Payments (Stripe)
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[React PDF](https://react-pdf.org/)** - PDF rendering in React

### **Backend**
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Pinecone](https://www.pinecone.io/)** - Vector database for AI embeddings

### **AI & ML**
- **[LangChain](https://langchain.com/)** - AI application framework
- **[Google Generative AI](https://ai.google.dev/)** - Advanced language models
- **[OpenAI](https://openai.com/)** - GPT models for chat functionality
- **[Vector Embeddings](https://platform.openai.com/docs/guides/embeddings)** - Semantic search capabilities

### **Authentication & Payments**
- **[Kinde Auth](https://kinde.com/)** - Modern authentication platform
- **[Stripe](https://stripe.com/)** - Payment processing and subscriptions

### **Infrastructure**
- **[UploadThing](https://uploadthing.com/)** - File upload service
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform

---

## 📁 Project Structure

```
lexinote/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 api/               # API routes
│   │   ├── 📁 dashboard/         # Dashboard pages
│   │   ├── 📁 pricing/           # Pricing page
│   │   └── 📄 layout.tsx         # Root layout
│   ├── 📁 components/            # React components
│   │   ├── 📁 ui/               # Reusable UI components
│   │   ├── 📁 chat/             # Chat interface
│   │   ├── 📄 Dashboard.tsx     # Main dashboard
│   │   ├── 📄 PdfRenderer.tsx   # PDF viewer
│   │   └── 📄 UploadButton.tsx  # File upload
│   ├── 📁 lib/                   # Utility libraries
│   │   ├── 📄 pinecone.ts       # Vector database config
│   │   ├── 📄 stripe.ts         # Payment processing
│   │   └── 📄 utils.ts          # Helper functions
│   ├── 📁 trpc/                  # tRPC configuration
│   └── 📁 types/                 # TypeScript definitions
├── 📁 prisma/                    # Database schema
├── 📄 package.json               # Dependencies
├── 📄 tailwind.config.ts         # Tailwind configuration
└── 📄 next.config.mjs           # Next.js configuration
```

---

## 🎯 Core Features Deep Dive

### 🤖 AI Chat System

The heart of Lexinote is its sophisticated AI chat system that enables natural conversations with PDF documents:

- **Vector Search**: Documents are processed into embeddings using Google's Generative AI
- **Semantic Understanding**: Advanced NLP for context-aware responses
- **Streaming Responses**: Real-time AI responses with typing indicators
- **Memory Management**: Conversation history and context retention

### 📄 PDF Processing Pipeline

1. **Upload**: Secure file upload with progress tracking
2. **Processing**: PDF parsing and text extraction using LangChain
3. **Vectorization**: Content conversion to vector embeddings
4. **Indexing**: Storage in Pinecone vector database
5. **Ready**: Document available for AI-powered interactions

### 🎨 Advanced PDF Viewer

- **Multi-format Support**: Optimized PDF rendering
- **Interactive Controls**: Zoom, rotate, navigate with keyboard shortcuts
- **Annotation Tools**: Highlighting with customizable colors
- **Bookmark System**: Save and organize important sections
- **Responsive Design**: Works seamlessly on desktop and mobile

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `KINDE_CLIENT_ID` | Kinde authentication client ID | ✅ |
| `GOOGLE_API_KEY` | Google AI API key | ✅ |
| `PINECONE_API_KEY` | Pinecone vector database key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe payment processing key | ✅ |
| `UPLOADTHING_SECRET` | File upload service secret | ✅ |

### Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: Authentication and preferences
- **File**: Document metadata and processing status
- **Message**: Chat conversation history

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables
3. **Database**: Set up PostgreSQL (recommended: Neon, Supabase, or PlanetScale)
4. **Deploy**: Automatic deployment on every push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 💡 Feature Requests

Have an idea? We'd love to hear it! Please include:
- Detailed description of the feature
- Use cases and benefits
- Any relevant mockups or examples

### 🔧 Development

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📋 Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📖 Documentation

### API Reference

The application uses tRPC for type-safe API calls. Key endpoints include:

- `getUserFiles` - Retrieve user's uploaded documents
- `getFile` - Get specific file details
- `deleteFile` - Remove a document
- `getFileMessages` - Retrieve chat history

### Component Documentation

- **Dashboard**: Main file management interface
- **PdfRenderer**: Advanced PDF viewing component
- **ChatWrapper**: AI chat interface
- **UploadButton**: File upload with progress tracking

---

## 🔒 Security

### Data Protection

- **Encryption**: All data encrypted in transit and at rest
- **Authentication**: Secure OAuth-based authentication
- **Authorization**: Role-based access control
- **Privacy**: Documents are never shared without permission

### Best Practices

- Regular security audits
- Dependency vulnerability scanning
- Secure API endpoints
- Input validation and sanitization

---

## 📊 Performance

### Optimization Features

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Intelligent caching strategies
- **CDN**: Global content delivery network

### Monitoring

- Real-time performance monitoring
- Error tracking and reporting
- User analytics and insights
- Uptime monitoring

---

## 🌍 Roadmap

### 🎯 Upcoming Features

- [ ] **Multi-language Support**: Interface localization
- [ ] **Collaborative Features**: Team document sharing
- [ ] **Advanced Analytics**: Document insights and statistics
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **API Access**: Public API for developers
- [ ] **Integrations**: Connect with popular productivity tools

### 🔮 Future Vision

- **AI Summarization**: Automatic document summaries
- **Smart Categorization**: AI-powered document organization
- **Voice Interaction**: Voice-to-text document queries
- **Advanced Search**: Cross-document semantic search

---

## 📞 Support

### 🆘 Getting Help

- **Documentation**: Check our comprehensive docs
- **GitHub Issues**: Report bugs and request features
- **Community**: Join our Discord community
- **Email**: Contact us at support@lexinote.tech

### 💬 Community

- **Discord**: [Join our community](https://discord.gg/lexinote)
- **Twitter**: [@lexinote](https://twitter.com/lexinote)
- **LinkedIn**: [Lexinote Company](https://linkedin.com/company/lexinote)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Special thanks to:

- **Next.js Team** for the amazing React framework
- **Vercel** for seamless deployment platform
- **OpenAI** for revolutionary AI technology
- **Pinecone** for vector database infrastructure
- **All Contributors** who help make Lexinote better

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

[![GitHub stars](https://img.shields.io/github/stars/pra9711/lexinote?style=social)](https://github.com/pra9711/lexinote/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pra9711/lexinote?style=social)](https://github.com/pra9711/lexinote/network/members)

**Made with ❤️ by the Lexinote Team**

[🌐 Website](https://www.lexinote.tech/) • [📧 Contact](mailto:support@lexinote.tech) • [🐦 Twitter](https://twitter.com/lexinote)

</div>