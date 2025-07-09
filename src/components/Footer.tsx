export default function Footer() {
  return (
    <footer className="border-t border-purple-300/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-purple-200/80">
            <span>
              Made with ❤️ by{' '}
              <a 
                href="https://dimillian.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 transition-colors duration-200 glow-text font-medium"
              >
                @Dimillian
              </a>
            </span>
            <span className="text-purple-300">•</span>
            <a 
              href="https://github.com/Dimillian/HyperYapper" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 transition-colors duration-200 glow-text font-medium"
            >
              View Source
            </a>
            <span className="text-purple-300">•</span>
            <a 
              href="https://github.com/Dimillian/HyperYapper/blob/main/PRIVACY.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 transition-colors duration-200 glow-text font-medium"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}