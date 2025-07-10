# Privacy Policy

## Overview

HyperYapper is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our social media cross-posting application.

## Information We Collect

### What We DON'T Collect
- **No Personal Data Storage**: We do not store any personal information on our servers
- **No Analytics Tracking**: We do not track your usage or behavior
- **No Third-Party Tracking**: We do not use cookies, pixels, or other tracking technologies
- **No Data Mining**: We do not analyze or process your content for any commercial purposes

### What We DO Store (Locally Only)
- **OAuth Tokens**: Social media platform access tokens are stored locally in your browser's localStorage
- **Account Information**: Basic profile information (username, display name, avatar) stored locally for UI display
- **Draft Posts**: Temporary post drafts are stored locally in your browser
- **App Settings**: User preferences and configuration stored locally

## How We Handle Your Data

### Local Storage Only
All data is stored exclusively in your browser's local storage and never transmitted to our servers. This includes:
- Social media account credentials and tokens
- Profile information from connected accounts
- Post drafts and content
- Application preferences

### Third-Party Platform Access
When you connect social media accounts:
- We use OAuth flows to securely authenticate with platforms (Twitter/X, Threads, Mastodon, BlueSky)
- Access tokens are stored locally and used only to post content on your behalf
- We only request the minimum permissions necessary for posting functionality
- We do not access, store, or process any of your existing social media content

### Data Transmission
- OAuth authentication flows occur directly between your browser and social media platforms
- Posted content is transmitted directly from your browser to the respective social media platforms
- **Media Storage for Threads**: Images posted to Threads are temporarily stored on Cloudflare R2 (our media hosting service) because Threads requires publicly accessible URLs for media attachments. These images are automatically deleted immediately after successful posting and are not accessed, analyzed, or stored permanently by us.
- **Threads Reply Fetching**: Threads reply count requests are proxied through our server to avoid browser CORS restrictions. Your access token is temporarily used server-side to make the API request, but is never stored or logged on our servers.

## Your Rights and Control

### Complete Data Control
- All your data remains on your device
- You can clear all stored data by clearing your browser's localStorage
- Disconnecting accounts removes all associated tokens and data
- Uninstalling the application removes all traces of your data

### Account Management
- You can connect and disconnect social media accounts at any time
- Disconnecting an account immediately removes all stored tokens and profile information
- No data persists after account disconnection

## Security

### Local Security
- All sensitive data (tokens, credentials) is stored in browser localStorage
- No data is transmitted over unencrypted connections
- OAuth flows use industry-standard security protocols

### Media Storage Security
- **Cloudflare R2**: Images for Threads are temporarily stored on Cloudflare R2, a secure cloud storage service
- Images are uploaded with unique, non-guessable filenames to prevent unauthorized access
- Media files are automatically deleted immediately after successful posting to maintain privacy
- All uploads use encrypted connections (HTTPS)

### Platform Security
We rely on the security measures of connected social media platforms for:
- Account authentication
- Content posting
- Token management and expiration

### Server-Side Processing (Minimal)
Our servers only handle:
- **Threads API Proxy**: Proxying Threads reply count requests to avoid CORS restrictions
  - Access tokens are used in-memory for the request duration only
  - No tokens or request data are logged or stored
  - Requests are processed and immediately discarded
- **Media Upload for Threads**: Temporary image hosting as described above

## Contact Information

If you have questions about this Privacy Policy, please:
- Open an issue on our [GitHub repository](https://github.com/Dimillian/HyperYapper)
- Contact us through the repository's issue tracker

## Summary

**HyperYapper is designed with privacy by default:**
- ✅ No server-side data storage (except temporary media for Threads)
- ✅ No tracking or analytics
- ✅ Local-only data storage
- ✅ Direct platform communication (except CORS-restricted Threads API)
- ✅ Full user control over data
- ✅ No data collection or mining
- ✅ Automatic media deletion after posting
- ✅ Minimal server processing (proxy only, no storage)

**Server-Side Exceptions**: 
1. **Threads Media**: Temporary image hosting for Threads posts (automatically deleted after posting)
2. **Threads API Proxy**: Server-side proxy for reply count requests due to CORS restrictions (no data stored, access tokens used in-memory only)

Your privacy is not a feature we added – it's the foundation of how HyperYapper was built.