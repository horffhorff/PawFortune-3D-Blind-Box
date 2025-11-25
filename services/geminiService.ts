import { GoogleGenAI, Type } from "@google/genai";
import { FortuneData, UserProfile } from '../types';

// 1. Generate the Fortune Text Data (JSON)
export const generateFortuneData = async (userProfile?: UserProfile): Promise<FortuneData> => {
  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  
  // Format birthday string if available
  let birthdayStr = "";
  if (userProfile?.birthdayMonth && userProfile?.birthdayDay) {
    birthdayStr = `生日: ${userProfile.birthdayMonth}月${userProfile.birthdayDay}日.`;
  }

  const userContext = userProfile 
    ? `用户背景: 星座(Western Zodiac): ${userProfile.zodiac}, 生肖(Chinese Zodiac): ${userProfile.chineseZodiac}. ${birthdayStr}` 
    : "用户背景: 未提供 (随机生成).";

  const systemInstruction = `
    你是一个数字盲盒品牌 "PawFortune" (爪爪运势) 的创意总监。
    
    你的任务:
    生成一个独特的每日运势盲盒概念。

    【重要规则】
    1. **语言混合**: 
       - 所有描述、名字、运势语必须用 **简体中文**。
       - **唯一例外**: "baseLabel" (底座上的字) 必须是 **英文 (English)**，且非常短 (1-2个单词)。
    2. **动物选择**: 
       - 必须在 "Cat" (猫) 和 "Dog" (狗) 之间随机选择，概率各 50%。
       - 使用随机的具体品种，例如：柴犬、柯基、哈士奇、加菲猫、无毛猫、布偶猫等。
    3. **【核心要求】动作与道具 (Dynamic Poses & Props)**:
       - **严禁**：不要让动物只是简单的站着 (Just standing) 或坐着 (Just sitting)。这是无聊的。
       - **必须有动作**：例如：正在滑滑板、在做后空翻、正在打碟 (DJ)、正在做瑜伽倒立、在太空漫步、在举重、在吃一大碗拉面、在疯狂敲代码。
       - **必须持有道具**：道具应该比动物的比例稍微夸张一点。例如：抱着巨大的珍珠奶茶、拿着光剑、背着喷气背包、戴着潜水镜和脚蹼、拿着游戏手柄。
       - **表情**：根据动作匹配表情（例如：举重时面部狰狞，吃东西时一脸幸福）。
    4. **运势好坏**:
       - 运势应该有好有坏，或者是提醒。根据用户的星座/生肖/生日特性来决定。
    5. **视觉风格**:
       - 极度追求细节。动物必须穿着独特的服饰。
       - 必须看起来像昂贵的 "3D打印树脂模型" 或 "盲盒玩具"。
    6. **【关键】稀有度概率控制 (Rarity Probability)**:
       - 请严格模拟真实的盲盒抽奖概率，**不要**总是生成稀有款：
       - **Common (普通)**: 60% 概率 (这是最常见的情况，请多生成这个)
       - **Rare (稀有)**: 30% 概率
       - **Ultra Rare (史诗)**: 8% 概率
       - **Secret (隐藏)**: 2% 概率
    
    ${userContext}
    
    输出字段要求:
    - animal: 'cat' 或 'dog'
    - title: 手办的名字 (中文)，例如 "摸鱼大师", "暴富梦", "夜宵之王"。
    - actionDescription: **极度简短** 的中文描述，不超过15个字。重点描述动作和道具。例如："脚踩滑板手拿披萨的缅因猫" 或 "倒立着喝可乐的拉布拉多狗"。
    - fortuneQuote: 每日运势建议 (中文)。
    - baseLabel: **必须是极短的英文** (例如 "LUCKY", "YUMMY", "GYM", "NO WORK")。
    - visualPrompt: 一个极度详细的英文图像生成提示词。
      - **关键**: 必须详细描述动作 (Action) 和 道具 (Prop)。
      - 必须包含: "3D render, octane render, c4d, resin toy texture, studio lighting, cute, blind box style, masterpiece, 8k, dynamic pose, highly detailed".
      - **强制包含**: 描述具体的四肢位置。例如: "paws raised high", "jumping in the air", "one paw holding a [prop]".
      - 不要把 "baseLabel" 的文字包含在 "visualPrompt" 的描述里。
    - rarity: 'Common', 'Rare', 'Ultra Rare', 'Secret'.
  `;

  const prompt = "Generate a new daily fortune blind box concept. Focus on DYNAMIC ACTION and PROPS. No boring poses.";

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 1.2, // Increase temperature slightly to encourage variety and adhere to probability distribution better
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          animal: { type: Type.STRING, enum: ['cat', 'dog'] },
          title: { type: Type.STRING },
          actionDescription: { type: Type.STRING },
          fortuneQuote: { type: Type.STRING },
          baseLabel: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
          rarity: { type: Type.STRING, enum: ['Common', 'Rare', 'Ultra Rare', 'Secret'] }
        },
        required: ['animal', 'title', 'actionDescription', 'fortuneQuote', 'baseLabel', 'visualPrompt', 'rarity']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from Gemini");
  
  return JSON.parse(text) as FortuneData;
};

// 2. Generate the Image based on the prompt
export const generateFortuneImage = async (visualPrompt: string, baseLabel: string): Promise<string> => {
  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";
  
  // Enhance the prompt to ensure specific style consistency
  const enhancedPrompt = `
    Design a high-quality 3D collectible blind box figurine.
    
    STYLE KEYWORDS: 3D render, Cinema 4D, Octane Render, Redshift, Resin Toy Texture, Subsurface Scattering, Soft Studio Lighting, High Fidelity, 8k resolution, Chibi style.
    
    SUBJECT: ${visualPrompt}
    
    IMPORTANT:
    - **ACTION**: The character must be DOING something. Do NOT generate a static standing pose. 
    - **PROPS**: Ensure the props described are clearly visible and interacting with the character.
    - **VIEW**: Use a dynamic camera angle (slightly low angle or 3/4 view) to enhance the action.
    
    BASE: The figurine stands on a simple, plain circular platform.
    BACKGROUND: A soft, solid pastel color gradient (studio backdrop).
    DETAILS: Make it look like a physical high-end toy. High quality plastic/vinyl material. Vivid colors.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: enhancedPrompt,
    config: {
      // Defaults are fine for this model
    }
  });

  if (response.candidates && response.candidates.length > 0) {
    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated");
};