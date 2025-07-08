export default function Footer() {
  return (
    <footer className="border-t border-purple-500/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-purple-300/70">
            <span>
              Made with ❤️ by{' '}
              <a 
                href="https://dimillian.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                @Dimillian
              </a>
            </span>
            <span>•</span>
            <a 
              href="https://github.com/Dimillian/HyperYapper" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              View Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}