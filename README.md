# CareerTrail 🚀

A comprehensive job application management system built with Next.js and Supabase, designed to help job seekers track their applications, manage contacts, and organize their career journey.

## ✨ Features

### 📊 **Job Application Management**
- Track job applications with status updates (Applied, Interviewing, Offer, Rejected)
- Kanban-style status board for visual organization
- Detailed job information including company, role, and application dates
- Notes and follow-up tracking

### 👥 **Contact Management**
- Store and organize recruiter and networking contacts
- Track interaction history with each contact
- Categorize contacts (Recruiter, Hiring Manager, Colleague, etc.)
- Relationship strength tracking

### 📄 **Document Organization**
- Upload and organize resumes, cover letters, and other documents
- Folder-based organization system
- Version control for documents
- Link documents to specific job applications

### 📅 **Interview Management**
- Schedule and track interviews
- Store interview details, feedback, and outcomes
- Multiple interview types (Phone, Video, Onsite, Technical, etc.)
- Preparation notes and follow-up tracking

### 📈 **Analytics Dashboard**
- Visual metrics and insights
- Application success rates
- Interview performance tracking
- Company and role analytics

### 🔐 **Authentication & Security**
- Secure user authentication with Supabase
- Google OAuth integration
- Protected routes and user-specific data
- Real-time data synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **UI Components**: Custom components with Apple-inspired design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kvshw/careertrail.git
   cd careertrail
   ```

2. **Install dependencies**
   ```bash
   cd careertrail
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application uses Supabase with the following main tables:

- **user_profiles**: User information and preferences
- **jobs**: Job application tracking
- **companies**: Company information
- **contacts**: Networking and recruiter contacts
- **contact_interactions**: Interaction history
- **documents**: File storage and organization
- **folders**: Document organization
- **interviews**: Interview scheduling and tracking

Run the migrations in the `supabase/migrations/` directory to set up your database schema.

## 🎨 Design System

CareerTrail features a modern, cheerful design with:
- **Color Scheme**: Orange to pink gradients with warm, engaging colors
- **Typography**: Clean, readable fonts optimized for professional use
- **Components**: Apple-inspired design patterns for intuitive UX
- **Responsive**: Mobile-first design that works on all devices

## 🔧 Configuration

### Google OAuth Setup

1. Create a project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)
5. Run the configuration script:
   ```bash
   SUPABASE_ACCESS_TOKEN=your_token \
   GOOGLE_CLIENT_ID=your_client_id \
   GOOGLE_CLIENT_SECRET=your_secret \
   node scripts/configure-google-oauth.js
   ```

### Supabase Configuration

1. Create a new Supabase project
2. Run the database migrations
3. Configure Row Level Security (RLS) policies
4. Set up storage buckets for document uploads
5. Configure real-time subscriptions

## 📱 Usage

### Getting Started

1. **Sign up** with your Google account or email
2. **Complete your profile** with basic information
3. **Add your first job application** to start tracking
4. **Organize documents** in folders for easy access
5. **Track interviews** and follow-ups systematically

### Best Practices

- **Regular Updates**: Keep job statuses current
- **Contact Management**: Log all interactions with contacts
- **Document Organization**: Use folders to organize by company or role
- **Interview Preparation**: Use the notes feature for preparation
- **Follow-up Tracking**: Set reminders for important follow-ups

## 🚀 Deployment

### Vercel Deployment

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

### Environment Variables

Set these in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Reach out to the maintainers

---

**CareerTrail** - Your journey to career success starts here! 🎯
