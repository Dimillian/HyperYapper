import React from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { SiThreads, SiMastodon, SiBluesky } from 'react-icons/si'

export const getPlatformIcon = (platformId: string) => {
  const iconProps = { className: "w-4 h-4" }
  
  switch (platformId) {
    case 'twitter':
      return React.createElement(FaXTwitter, iconProps)
    case 'threads':
      return React.createElement(SiThreads, iconProps)
    case 'mastodon':
      return React.createElement(SiMastodon, iconProps)
    case 'bluesky':
      return React.createElement(SiBluesky, iconProps)
    default:
      return null
  }
}