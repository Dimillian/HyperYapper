'use client'

import { useState } from 'react'
import { PostEditor } from '@/components/PostEditor'
import { AccountManager } from '@/components/AccountManager'
import Footer from '@/components/Footer'
import { Zap, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-purple-400" />
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold cyberpunk-text">HyperYapper</h1>
            <div className="ml-auto text-sm text-purple-400/70">
              Ready to yap like a pro? ⚡
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hero and Post Editor */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold cyberpunk-text">
                Cross-Post Like a Legend
              </h2>
              <p className="text-purple-300/80 text-lg">
                Write once, yap everywhere. X, Threads, Mastodon, BlueSky.
              </p>
            </div>

            {/* Post Editor */}
            <PostEditor />
          </div>

          {/* Right Column - Account Manager */}
          <div className="lg:col-span-1">
            <AccountManager />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}