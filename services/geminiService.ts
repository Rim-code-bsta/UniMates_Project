import { GoogleGenAI } from "@google/genai";
import { User, MatchPurpose } from '../types';

// NOTE: In a real app, calls would go through a backend proxy to hide the key.
// Since we are simulating, we assume the environment variable is available.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- LOCAL FALLBACK LOGIC ---
// This ensures the app looks intelligent even if the API quota is hit (429 Error)

const getFallbackMatchReason = (user1: User, user2: User, purpose: MatchPurpose): string => {
  const commonInterests = user1.interests.filter(i => user2.interests.includes(i));
  
  if (commonInterests.length > 0) {
    const interest = commonInterests[Math.floor(Math.random() * commonInterests.length)];
    return `You both love ${interest} and represent a great match for ${purpose}!`;
  }
  
  if (user1.major === user2.major) {
     return `You are both ${user1.major} majors looking for a ${purpose} buddy.`;
  }

  if (user1.yearOfStudy === user2.yearOfStudy) {
      return `You are both ${user1.yearOfStudy}s with compatible goals.`;
  }

  return `Perfect match for ${purpose} based on your shared availability and profile compatibility.`;
};

const getFallbackIcebreaker = (interests: string[]): string => {
   const templates = [
     "Hey! I saw we matched. How's your semester going?",
     "Hi! Found any good spots on campus lately?",
     "Hey! I see you're into similar things. Want to chat?",
     "Hello! Up for meeting up sometime?",
     "Hi! Quick question: what's your favorite thing about AUI?"
   ];
   
   if (interests.length > 0) {
       const interest = interests[Math.floor(Math.random() * interests.length)];
       return `Hey! I saw you're into ${interest}. Me too!`;
   }
   
   return templates[Math.floor(Math.random() * templates.length)];
};

// --- API FUNCTIONS ---

export const generateMatchReason = async (user1: User, user2: User, purpose: MatchPurpose): Promise<string> => {
  if (!API_KEY) {
    return getFallbackMatchReason(user1, user2, purpose);
  }

  try {
    const prompt = `
      Analyze these two university students and explain in one short, exciting sentence why they are a good match for "${purpose}".
      
      User 1: ${user1.fullName}, Major: ${user1.major}, Interests: ${user1.interests.join(', ')}.
      User 2: ${user2.fullName}, Major: ${user2.major}, Interests: ${user2.interests.join(', ')}.
      
      Output only the sentence. No quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error: any) {
    // Handle Quota Limits (429) gracefully without crashing or alarming the user
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
        console.warn("Gemini API Quota Exceeded - Switching to local fallback logic.");
    } else {
        console.error("Gemini API Error:", error);
    }
    return getFallbackMatchReason(user1, user2, purpose);
  }
};

export const generateIcebreaker = async (interests: string[]): Promise<string> => {
  if (!API_KEY) return getFallbackIcebreaker(interests);

  try {
    const prompt = `Generate a short, friendly, and casual conversation starter for a student interested in: ${interests.join(', ')}. Don't use quotes.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error: any) {
    // Silent fallback for icebreakers
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
        // Quota exceeded, ignore
    } else {
        console.error("Gemini API Error (Icebreaker):", error);
    }
    return getFallbackIcebreaker(interests);
  }
};