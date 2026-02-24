#!/usr/bin/env node

// Test script for AI summarization
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testAISummarization() {
  console.log('🤖 Testing AI Summarization...\n');
  
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GOOGLE_AI_API_KEY not found in environment variables');
    console.log('\n📝 To get a Google AI API key:');
    console.log('1. Go to: https://makersuite.google.com/app/apikey');
    console.log('2. Create a new API key');
    console.log('3. Add it to backend/.env file:');
    console.log('   GOOGLE_AI_API_KEY=your-api-key-here');
    console.log('\n🔄 The system will use fallback summarization without the API key');
    return;
  }
  
  console.log('✅ API key found, testing Google Gemini API...\n');
  
  const testText = "React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta. React allows developers to create reusable UI components and manage application state efficiently. It uses a virtual DOM for optimal performance and supports both functional and class-based components.";
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: `Please provide a concise summary of the following text in 2-3 sentences:\n\n${testText}`
          }]
        }]
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (summary) {
      console.log('✅ AI Summarization working successfully!\n');
      console.log('Original Text:', testText);
      console.log('\nAI Summary:', summary);
      console.log('\n🎉 Your AI summarization feature is ready to use!');
    } else {
      console.log('⚠️  API responded but no summary generated');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ AI API Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    console.log('\n🔄 The system will use fallback summarization');
  }
}

testAISummarization().catch(console.error);
