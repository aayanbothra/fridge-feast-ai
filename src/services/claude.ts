import { Ingredient, Recipe, Substitution } from '@/types/recipe';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }>;
}

async function callClaude(messages: ClaudeMessage[], maxTokens: number = 2048): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function analyzeImage(base64Image: string): Promise<Ingredient[]> {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: `Analyze this image and identify all food ingredients visible. Return a JSON array of ingredients with this exact structure:
[
  {
    "name": "ingredient name (lowercase, singular)",
    "category": "produce|protein|dairy|grain|spice",
    "quantity": "estimated quantity (e.g., '3', '2 cups', '1 lb')"
  }
]

Categories:
- produce: fruits, vegetables
- protein: meat, fish, eggs, tofu, beans
- dairy: milk, cheese, yogurt, butter
- grain: bread, pasta, rice, flour
- spice: herbs, spices, condiments, oils

Return ONLY the JSON array, no other text. Be specific with ingredient names (e.g., "chicken breast" not "chicken").`,
        },
      ],
    },
  ];

  const response = await callClaude(messages, 1024);
  
  // Extract JSON from response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse ingredients from response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function generateRecipes(ingredients: Ingredient[]): Promise<Recipe[]> {
  const ingredientList = ingredients.map(i => i.name).join(', ');
  
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `I have these ingredients: ${ingredientList}

Generate 3 creative recipe suggestions I can make. Return a JSON array with this exact structure:
[
  {
    "title": "Recipe Name",
    "cookTime": 25,
    "difficulty": "easy|medium|hard",
    "ingredientsNeeded": ["ingredient1", "ingredient2", ...],
    "ingredientsMatched": ["ingredient1", "ingredient2", ...],
    "matchPercentage": 75,
    "description": "A compelling 2-3 sentence description highlighting flavors and appeal"
  }
]

Requirements:
- ingredientsNeeded: all ingredients required for the recipe
- ingredientsMatched: only the ingredients from my list that are used (must be subset of ingredientsNeeded)
- matchPercentage: (ingredientsMatched.length / ingredientsNeeded.length) * 100, rounded
- Prioritize recipes with high match percentages (70%+)
- Include at least one recipe under 25 minutes
- Make descriptions appetizing and specific

Return ONLY the JSON array, no other text.`,
    },
  ];

  const response = await callClaude(messages, 2048);
  
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse recipes from response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function generateSubstitutions(
  recipe: Recipe,
  availableIngredients: Ingredient[]
): Promise<Substitution[]> {
  const available = availableIngredients.map(i => i.name).join(', ');
  const needed = recipe.ingredientsNeeded.join(', ');
  const missing = recipe.ingredientsNeeded.filter(
    ingredient => !recipe.ingredientsMatched.includes(ingredient)
  );

  if (missing.length === 0) {
    return [];
  }

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Recipe: ${recipe.title}
Ingredients I have: ${available}
All ingredients needed: ${needed}
Missing ingredients: ${missing.join(', ')}

For each missing ingredient, suggest a creative substitution using what I have. Return a JSON array:
[
  {
    "original": "missing ingredient",
    "substitute": "ingredient from my list to use instead",
    "flavorScience": "2-3 sentences explaining the chemistry/science behind why this substitution works. Include specific compounds, flavors, or cooking properties.",
    "flavorImpact": 1-5,
    "textureImpact": 1-5
  }
]

Requirements:
- Only substitute ingredients I don't have
- Substitutes must come from my available ingredients
- flavorImpact: 1=minimal change, 5=significant change
- textureImpact: 1=minimal change, 5=significant change
- flavorScience must be educational and specific (mention acids, umami, Maillard reaction, etc.)
- Be creative but practical

Return ONLY the JSON array, no other text.`,
    },
  ];

  const response = await callClaude(messages, 2048);
  
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse substitutions from response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

