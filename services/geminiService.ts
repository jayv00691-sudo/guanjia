
import { GoogleGenAI } from "@google/genai";
import { PokerHand, CardData, Language } from "../types";

const formatCards = (cards: CardData[]) => {
  if (!cards || cards.length === 0) return "None";
  return cards.map(c => `${c.rank}${c.suit}`).join(" ");
};

export const analyzeHand = async (hand: PokerHand, lang: Language, apiKey?: string, context: string = ""): Promise<string> => {
  const key = apiKey || process.env.API_KEY;

  if (!key) {
    console.warn("Gemini API Key missing");
    return lang === 'zh' ? "AI 分析不可用: 请在设置中配置 API Key。" : "AI Analysis unavailable: Please set API Key in Settings.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });

    const langInstruction = lang === 'zh' ? "请用中文回答。" : "Please answer in English.";

    const villainsText = hand.villains && hand.villains.length > 0 
      ? hand.villains.map(v => `Villain (${v.name}) Cards: ${formatCards(v.cards)}`).join('\n')
      : "Villain Cards: Unknown";

    const prompt = `
      You are a world-class poker assistant and strategist.
      Please analyze this poker hand played by Hero.
      ${langInstruction}
      
      Hand Details:
      - Hero Hole Cards: ${formatCards(hand.holeCards)}
      - Community Board: ${formatCards(hand.communityCards)}
      - ${villainsText}
      - Profit/Loss: ${hand.profit}
      - Action History/Line: ${hand.streetActions || 'Not provided'}
      - User Notes: ${hand.note || 'None'}
      - Context: ${context}

      Provide a concise strategy analysis (approx 200 words).
      Focus on the action line and key decision points.
      Highlight mistakes, good plays, and alternative lines based on GTO or exploit principles.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || (lang === 'zh' ? "无法生成分析。" : "Could not generate analysis.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return lang === 'zh' ? "连接 AI 助手时出错，请检查 API Key 是否正确。" : "Error connecting to AI Assistant, please check your API Key.";
  }
};

export const chatWithPokerCoach = async (history: { role: string, parts: { text: string }[] }[], message: string, lang: Language, apiKey?: string): Promise<string> => {
  const key = apiKey || process.env.API_KEY;

  if (!key) {
    return lang === 'zh' ? "AI 服务不可用: 请在设置中配置 API Key。" : "AI Service unavailable: Please set API Key in Settings.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: lang === 'zh' 
          ? "你是一位专业的德州扑克教练和助手，名叫 HAO。你精通 GTO 策略和剥削打法。你的回答应该简洁、专业且具有建设性。如果用户问非扑克相关的问题，请礼貌地将话题引回扑克。"
          : "You are a professional poker coach and assistant named HAO. You are an expert in GTO strategy and exploitative play. Your answers should be concise, professional, and constructive."
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || (lang === 'zh' ? "无法生成回复。" : "No response generated.");
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return lang === 'zh' ? "AI 暂时掉线了，请检查 API Key 是否正确。" : "AI is currently offline, please check your API Key.";
  }
};
