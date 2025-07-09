interface SyntaxHighlighterProps {
  content: string
  className?: string
}

export function SyntaxHighlighter({ content, className = '' }: SyntaxHighlighterProps) {
  const highlightSyntax = (text: string) => {
    return text.replace(/([@#]\w+)/g, (match) => {
      const isHashtag = match.startsWith('#')
      const isMention = match.startsWith('@')
      
      if (isHashtag || isMention) {
        return `<span class="cyberpunk-text">${match}</span>`
      }
      
      return match
    })
  }

  return (
    <div
      className={`whitespace-pre-wrap break-words pointer-events-none ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightSyntax(content) }}
    />
  )
}