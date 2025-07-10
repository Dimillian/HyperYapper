# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
HyperYapper is a beautiful, cyberpunk-styled social media posting app that lets users create, edit, and cross-post content to X, Threads, Mastodon, and BlueSky. The app features a sleek dark theme with neon purple accents and will expand to include AI-powered post improvement tools and media editing capabilities.

## Development Rules

### TODO Management
**IMPORTANT**: Always update the [TODO.md](./TODO.md) file when:
- Starting work on a new feature
- Completing a feature or subtask
- Discovering new requirements or edge cases
- Changing feature priorities
- Finding bugs that need to be tracked

The TODO.md file is the single source of truth for all pending work.

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run linter
npm run typecheck  # Run TypeScript type checking
```

## Environment Setup

### Required Dependencies
- Next.js 15+ with TypeScript
- Tailwind CSS for styling  
- Lucide React for icons
- Framer Motion for animations
- Lexical/Slate for rich text editing
- Social Media API SDKs

### Local Storage Keys
- `hyperyapper_drafts` - Draft posts storage
- `hyperyapper_accounts` - Connected social accounts
- `hyperyapper_preferences` - User preferences and settings
- `hyperyapper_media_cache` - Temporary media storage

## Architecture

### Core Components
- `PostEditor` - Rich text editor with formatting and media support
- `AccountManager` - Social media account connection and management
- `CrossPostInterface` - Multi-platform posting interface
- `MediaStudio` - Image/video/GIF editing tools
- `AIAssistant` - Post improvement and feedback features
- `DraftManager` - Auto-save and draft management
- `ScheduleManager` - Post scheduling system

### Social Media Integration
- OAuth flows for each platform (X, Threads, Mastodon, BlueSky)
- Platform-specific post formatting and limitations
- Cross-posting queue management
- Analytics and engagement tracking

### AI Features
- Post improvement suggestions
- Engagement prediction
- Hashtag recommendations
- Content moderation warnings
- Viral potential analysis

## Important Development Guidelines

### Code Development Rules
```
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
ALWAYS update TODO.md when making progress on features, finding bugs, or discovering new requirements.
```

### TODO Management
The [TODO.md](./TODO.md) file must be kept up to date as the single source of truth for all pending work. Update it whenever you:
- Start or complete work on any feature
- Discover new requirements or edge cases
- Find bugs that need tracking
- Change priorities based on user feedback

### Build and Development Reminders
- Always run `npm run build` and `npm run typecheck` after modifications to:
  - Catch and fix potential build errors
  - Ensure production-ready code
  - Verify all changes compile correctly
- Only run npm run typecheck to check the build as I'm running dev server to avoid stealing my current build

### Component Architecture Guidelines
Following HyperGit's successful patterns:
- Extract complex components into modular structures
- Create shared UI components to reduce duplication
- Use custom hooks for state management
- Implement mobile-first design with 44px minimum touch targets
- Organize components into logical folders with ui/ and components/ subfolders

### Design System
- Dark theme with black background (#000)
- Neon purple accents (#8B5CF6, #A855F7)
- Glass morphism effects with backdrop-blur
- Interactive shine effects on hover
- Consistent card-based UI patterns
- Smooth animations with Framer Motion

### Platform-Specific Considerations
- **X (Twitter)**: 280 character limit, image/video support, thread creation
- **Threads**: 500 character limit, Instagram integration, hashtag support
- **Mastodon**: 500 character default (instance-specific), federation support
- **BlueSky**: AT Protocol, 300 character limit, decentralized features

### Security Guidelines
- Never store API keys or tokens in code
- Use secure OAuth flows for authentication
- Implement proper CORS handling
- Sanitize user input for XSS prevention
- Rate limit API calls to prevent abuse

### Performance Optimization
- Lazy load media editing tools
- Implement virtual scrolling for feed views
- Cache social media API responses
- Use optimistic UI updates for posting
- Compress media before uploading