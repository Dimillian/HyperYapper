# HyperYapper ⚡💬

> The ultimate social media posting app for yapping like a crazy motherfucker

HyperYapper is a beautiful, cyberpunk-styled cross-posting application that lets you craft perfect posts and share them across X, Threads, Mastodon, and BlueSky simultaneously. Built for content creators who want to maximize their reach with style.

## ✨ Features

### 🚀 Current Features
- **Beautiful Post Editor**: Clean, distraction-free writing experience
- **Cross-Platform Posting**: Post to X, Threads, Mastodon, and BlueSky at once
- **Platform Optimization**: Automatic formatting for each platform's requirements
- **Draft Management**: Never lose a post with auto-save functionality
- **Dark Theme**: Sleek black interface with neon purple accents
- **Account Management**: Connect and manage multiple social accounts

### 🤖 AI-Powered Features (Coming Soon)
- **Post Enhancement**: AI suggestions to make your posts more engaging
- **Banger Detection**: Know if your post will be a hit before you send it
- **Tone Adjustment**: Switch between professional, casual, or funny
- **Hashtag Optimization**: Get the perfect hashtags for maximum reach
- **Viral Potential Analysis**: Understand what makes content spread

### 🎨 Media Studio (Coming Soon)
- **Image Editor**: Crop, filter, and enhance images for social media
- **GIF Studio**: Create and optimize GIFs from videos
- **Video Tools**: Trim, caption, and optimize videos for each platform
- **Meme Generator**: Quick meme creation with popular templates
- **Brand Overlays**: Add consistent branding to all your media

## 🎯 Why HyperYapper?

**For Content Creators**
- Post once, reach everywhere
- Never worry about platform-specific formatting
- AI helps you craft better content
- Built-in analytics to track performance

**For Social Media Managers**
- Manage multiple accounts effortlessly
- Schedule posts across all platforms
- Collaborate with team approval workflows
- Comprehensive analytics dashboard

**For Casual Users**
- Simple, beautiful interface
- AI helps improve your posts
- Share moments across all your socials
- No more copy-pasting between apps

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Icons**: Lucide React
- **Rich Text**: Lexical/Slate editor
- **Animations**: Framer Motion
- **AI**: OpenAI API integration
- **Storage**: Local storage with cloud sync
- **Analytics**: Built-in tracking system

## 🚀 Getting Started

```bash
# Clone the repository
git clone [repo-url]
cd HyperYapper

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your social media API keys (see Setup section below)

# Start development server
npm run dev

# Open http://localhost:3000
```

## ⚙️ Platform Setup

### Threads (Meta)

1. **Create a Meta App**:
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app and enable Threads API
   - Add your domain to the app settings

2. **Configure Environment Variables**:
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_META_APP_ID=your_meta_app_id
   META_APP_SECRET=your_meta_app_secret
   ```

3. **Required Permissions**:
   - `threads_basic` (required for all endpoints)
   - `threads_content_publish` (for posting content)

4. **OAuth Flow**:
   - Users will be redirected to Meta's authorization page
   - After approval, they'll be redirected back to `/auth/threads/callback`
   - Access tokens are valid for 60 days and can be refreshed

### Mastodon

1. **No Setup Required**:
   - HyperYapper dynamically registers with any Mastodon instance
   - Users enter their instance URL (e.g., `mastodon.social`)
   - OAuth flow handles app registration automatically

2. **Supported Features**:
   - Public posts up to 500 characters (instance-dependent)
   - Account verification and connection status
   - Automatic token management

### X (Twitter) - Coming Soon

API access restrictions have made integration challenging. We're exploring alternative approaches.

### BlueSky - Coming Soon

AT Protocol integration is in development.
```

## 📱 Platform Support

### X (Twitter)
- 280 character posts
- Thread creation
- Image/video uploads
- Quote tweets

### Threads
- 500 character posts
- Instagram integration
- Multiple images
- Link sharing

### Mastodon
- 500+ characters (instance-dependent)
- Federation support
- Content warnings
- Custom emojis

### BlueSky
- 300 character posts
- AT Protocol support
- Decentralized features
- Custom feeds

## 🎨 Design Philosophy

HyperYapper embraces a cyberpunk aesthetic with:
- Pure black backgrounds for OLED displays
- Neon purple accents (#8B5CF6, #A855F7)
- Glass morphism effects
- Smooth animations
- Mobile-first responsive design
- Accessibility-first approach

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 Design enhancements
- 🌐 Platform integrations

Check out our [TODO.md](./TODO.md) for current priorities and planned features.

## 📄 License

MIT License - feel free to use HyperYapper for your social media domination plans!

## 🙏 Acknowledgments

- Inspired by the need to yap efficiently across all platforms
- Built for creators who refuse to be limited by single platforms
- Powered by the collective energy of social media addicts everywhere

---

**Ready to become a cross-platform yapping legend?** 🚀💬⚡