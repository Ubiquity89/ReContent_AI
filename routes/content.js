const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create content
router.post('/', auth, async (req, res) => {
  try {
    const { originalContent, contentType } = req.body;
    
    // Create content document
    const content = new Content({
      user: req.user.id,
      originalContent,
      contentType
    });
    
    await content.save();
    
    // Process content with AI
    await processContentWithAI(content);
    
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's content
router.get('/', auth, async (req, res) => {
  try {
    const content = await Content.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Process content with AI
async function processContentWithAI(content) {
  try {
    // Update status to processing
    content.status = 'processing';
    await content.save();

    // Generate different content formats using OpenAI
    const formats = await Promise.all([
      generateTwitterContent(content.originalContent),
      generateLinkedInContent(content.originalContent),
      generateInstagramContent(content.originalContent),
      generateNewsletterContent(content.originalContent)
    ]);

    // Update content with generated formats
    content.repurposedContent = {
      twitter: formats[0],
      linkedin: formats[1],
      instagram: formats[2],
      newsletter: formats[3]
    };
    content.status = 'completed';
    await content.save();
  } catch (error) {
    console.error('Error processing content:', error);
    content.status = 'error';
    await content.save();
  }
}

// Helper functions for AI content generation
async function generateTwitterContent(content) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a content repurposer. Generate a Twitter thread from the given content. Keep each tweet under 280 characters."
      },
      {
        role: "user",
        content: content
      }
    ]
  });
  return response.choices[0].message.content;
}

async function generateLinkedInContent(content) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a content repurposer. Generate a professional LinkedIn post from the given content. Keep it under 1300 characters."
      },
      {
        role: "user",
        content: content
      }
    ]
  });
  return response.choices[0].message.content;
}

async function generateInstagramContent(content) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a content repurposer. Generate an Instagram caption from the given content. Keep it under 2200 characters."
      },
      {
        role: "user",
        content: content
      }
    ]
  });
  return response.choices[0].message.content;
}

async function generateNewsletterContent(content) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a content repurposer. Generate an email newsletter from the given content. Include a compelling subject line and introduction."
      },
      {
        role: "user",
        content: content
      }
    ]
  });
  return response.choices[0].message.content;
}

module.exports = router;
