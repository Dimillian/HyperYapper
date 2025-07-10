interface SyntaxHighlighterProps {
  content: string
  className?: string
}

export function SyntaxHighlighter({ content, className = '' }: SyntaxHighlighterProps) {
  const highlightSyntax = (text: string) => {
    return text
      // First, highlight emoji shortcodes: :emoji:
      .replace(/:[\w\-_.]+:/g, (match) => {
        return `<span class="text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.6)]">${match}</span>`
      })
      // Then, highlight Mastodon mentions: @username@instance.domain
      .replace(/@[\w\-_.]+@[\w\-_.]+\.[a-zA-Z]{2,}/g, (match) => {
        return `<span class="cyberpunk-text">${match}</span>`
      })
      // Then, highlight regular mentions: @username
      .replace(/@[\w\-_.]+/g, (match) => {
        return `<span class="cyberpunk-text">${match}</span>`
      })
      // Finally, highlight hashtags: #hashtag
      .replace(/#[\w\-_.]+/g, (match) => {
        return `<span class="cyberpunk-text">${match}</span>`
      })
  }

  return (
    <div
      className={`whitespace-pre-wrap break-words pointer-events-none ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightSyntax(content) }}
    />
  )
}