import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateIcebreaker = async (user1: User, user2: User): Promise<string> => {
  if (!apiKey) return "Ask them about their major!";

  const prompt = `
    You are a helpful social assistant for university students using an app called UniMates.
    Your goal is to suggest a friendly, casual, and relevant conversation starter (icebreaker) for User A to send to User B.
    
    User A Profile:
    Name: ${user1.name}
    Major: ${user1.major}
    Purpose on App: ${user1.purpose}
    Interests: ${user1.interests.join(', ')}

    User B Profile:
    Name: ${user2.name}
    Major: ${user2.major}
    Purpose on App: ${user2.purpose}
    Interests: ${user2.interests.join(', ')}

    The icebreaker should be short (under 20 words), friendly, and reference a shared interest or purpose if possible. 
    Do not use hashtags. Just the text of the message.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Icebreaker Error:", error);
    return "Hi! I noticed we have similar interests. How is your semester going?";
  }
};
