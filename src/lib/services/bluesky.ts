'use client'

import { BlueSkyAuth } from '@/lib/auth/bluesky'
import { BlueSkySession } from '@/types/auth'
import { Agent, RichText } from '@atproto/api'

export interface BlueSkyPost {
  text: string
  createdAt?: string
}

export interface BlueSkyPostResponse {
  uri: string
  cid: string
}

export class BlueSkyService {
  private static async getAgent(session: BlueSkySession): Promise<Agent | null> {
    try {
      // Get the OAuth client and restore session
      const client = await BlueSkyAuth.initializeOAuthClient()
      const oauthSession = await client.restore(session.did)
      
      if (!oauthSession) {
        console.error('Failed to restore OAuth session')
        return null
      }

      // Create agent with the OAuth session
      const agent = new Agent(oauthSession)
      
      return agent
    } catch (error) {
      console.error('Error creating BlueSky agent:', error)
      return null
    }
  }

  static async createPost(
    session: BlueSkySession, 
    post: BlueSkyPost
  ): Promise<BlueSkyPostResponse | null> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      // Create rich text to handle mentions, links, etc.
      const rt = new RichText({ text: post.text })
      await rt.detectFacets(agent)

      // Create the post using the Agent
      const response = await agent.post({
        text: rt.text,
        facets: rt.facets,
        createdAt: post.createdAt || new Date().toISOString(),
      })

      return {
        uri: response.uri,
        cid: response.cid,
      }
    } catch (error) {
      console.error('Error creating BlueSky post:', error)
      throw error
    }
  }

  static async deletePost(
    session: BlueSkySession,
    postUri: string
  ): Promise<boolean> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      await agent.deletePost(postUri)
      return true
    } catch (error) {
      console.error('Error deleting BlueSky post:', error)
      return false
    }
  }

  static async getProfile(session: BlueSkySession): Promise<any | null> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      const profile = await agent.getProfile({ actor: session.did })
      return profile.data
    } catch (error) {
      console.error('Error getting BlueSky profile:', error)
      return null
    }
  }

  static async uploadImage(
    session: BlueSkySession,
    imageFile: File
  ): Promise<{ blob: any; aspectRatio: { width: number; height: number } } | null> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      // Get image dimensions
      const aspectRatio = await this.getImageAspectRatio(imageFile)

      // Compress image if it exceeds BlueSky's size limit (976.56KB)
      const maxSizeBytes = 976.56 * 1024 // 976.56KB in bytes
      let processedFile = imageFile

      if (imageFile.size > maxSizeBytes) {
        console.log(`Image size ${(imageFile.size / 1024).toFixed(2)}KB exceeds BlueSky limit, compressing...`)
        processedFile = await this.compressImage(imageFile, maxSizeBytes)
      }

      // Convert File to Uint8Array
      const arrayBuffer = await processedFile.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Upload the image using Agent
      const uploadResponse = await agent.uploadBlob(uint8Array, {
        encoding: processedFile.type,
      })

      return {
        blob: uploadResponse.data.blob,
        aspectRatio
      }
    } catch (error) {
      console.error('Error uploading image to BlueSky:', error)
      return null
    }
  }

  private static async getImageAspectRatio(imageFile: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(imageFile)
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load image'))
      }
      img.src = objectUrl
    })
  }

  private static async compressImage(imageFile: File, maxSizeBytes: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      const objectUrl = URL.createObjectURL(imageFile)

      img.onload = () => {
        // Set canvas dimensions to maintain aspect ratio
        canvas.width = img.width
        canvas.height = img.height

        // Draw image to canvas
        ctx?.drawImage(img, 0, 0, img.width, img.height)

        // Start with high quality and reduce until size is acceptable
        let quality = 0.9
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Check if compressed size is acceptable or quality is too low
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
              const compressedFile = new File([blob], imageFile.name, {
                type: 'image/jpeg', // Convert to JPEG for better compression
                lastModified: Date.now()
              })
              
              console.log(`Compressed from ${(imageFile.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`)
              URL.revokeObjectURL(objectUrl)
              resolve(compressedFile)
            } else {
              // Reduce quality and try again
              quality -= 0.1
              tryCompress()
            }
          }, 'image/jpeg', quality)
        }

        tryCompress()
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load image for compression'))
      }

      img.src = objectUrl
    })
  }

  static async createPostWithImage(
    session: BlueSkySession,
    post: BlueSkyPost,
    imageFile: File,
    altText?: string
  ): Promise<BlueSkyPostResponse | null> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      // Upload the image first
      const imageData = await this.uploadImage(session, imageFile)
      
      if (!imageData) {
        throw new Error('Failed to upload image')
      }

      // Create rich text
      const rt = new RichText({ text: post.text })
      await rt.detectFacets(agent)

      // Create the post with image using Agent
      const response = await agent.post({
        text: rt.text,
        facets: rt.facets,
        createdAt: post.createdAt || new Date().toISOString(),
        embed: {
          $type: 'app.bsky.embed.images',
          images: [{
            image: imageData.blob,
            alt: altText || '',
            aspectRatio: imageData.aspectRatio,
          }],
        },
      })

      return {
        uri: response.uri,
        cid: response.cid,
      }
    } catch (error) {
      console.error('Error creating BlueSky post with image:', error)
      throw error
    }
  }

  static async createThread(
    session: BlueSkySession,
    posts: BlueSkyPost[]
  ): Promise<BlueSkyPostResponse[] | null> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      const responses: BlueSkyPostResponse[] = []
      let parentPost: BlueSkyPostResponse | null = null

      for (const post of posts) {
        // Create rich text
        const rt = new RichText({ text: post.text })
        await rt.detectFacets(agent)

        // Build the post object
        const postData: any = {
          text: rt.text,
          facets: rt.facets,
          createdAt: post.createdAt || new Date().toISOString(),
        }

        // If this is a reply to the previous post in the thread
        if (parentPost) {
          postData.reply = {
            parent: {
              uri: parentPost.uri,
              cid: parentPost.cid,
            },
            root: {
              uri: responses[0].uri, // First post in thread
              cid: responses[0].cid,
            },
          }
        }

        // Create the post using Agent
        const response = await agent.post(postData)
        
        const postResponse = {
          uri: response.uri,
          cid: response.cid,
        }
        
        responses.push(postResponse)
        parentPost = postResponse
      }

      return responses
    } catch (error) {
      console.error('Error creating BlueSky thread:', error)
      throw error
    }
  }

  static async searchProfiles(session: BlueSkySession, query: string): Promise<Array<{
    did: string
    handle: string
    displayName: string
    avatar?: string
    description?: string
  }>> {
    try {
      const agent = await this.getAgent(session)
      
      if (!agent) {
        throw new Error('Failed to create BlueSky agent')
      }

      const response = await agent.searchActors({
        term: query,
        limit: 8
      })

      return response.data.actors.map(actor => ({
        did: actor.did,
        handle: actor.handle,
        displayName: actor.displayName || actor.handle,
        avatar: actor.avatar,
        description: actor.description
      }))
    } catch (error) {
      console.error('Error searching BlueSky profiles:', error)
      return []
    }
  }
}