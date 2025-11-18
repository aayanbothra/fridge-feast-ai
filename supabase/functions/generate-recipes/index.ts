import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Ingredient {
  name: string;
  category: string;
  quantity?: string;
}

interface CookingStep {
  stepNumber: number;
  instruction: string;
  estimatedTime?: string;
}

interface Recipe {
  title: string;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredientsNeeded: string[];
  ingredientsMatched: string[];
  matchPercentage: number;
  description: string;
  steps: CookingStep[];
  cuisine?: string;
}

interface CuisineGroup {
  name: string;
  description: string;
  recipes: Recipe[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return new Response(
        JSON.stringify({ error: 'Ingredients array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ingredientList = ingredients.map((i: Ingredient) => i.name).join(', ');
    
    console.log('Generating recipes for ingredients:', ingredientList);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `I have these ingredients: ${ingredientList}

Generate 3 DIFFERENT cuisine styles, each with 3 recipe suggestions. Return a JSON array with this exact structure:
[
  {
    "name": "Mediterranean",
    "description": "Fresh, healthy dishes with olive oil and herbs",
    "recipes": [
      {
        "title": "Recipe Name",
        "cookTime": 25,
        "difficulty": "easy|medium|hard",
        "ingredientsNeeded": ["ingredient1", "ingredient2", ...],
        "ingredientsMatched": ["ingredient1", "ingredient2", ...],
        "matchPercentage": 75,
        "description": "A compelling 2-3 sentence description",
        "cuisine": "Mediterranean",
        "steps": [
          {
            "stepNumber": 1,
            "instruction": "Clear, actionable instruction",
            "estimatedTime": "5 min"
          }
        ]
      }
    ]
  }
]

Requirements:
- Choose 3 distinct, diverse cuisines (e.g., Mediterranean, Asian, Mexican, Italian, Indian, American)
- Each cuisine should have exactly 3 recipes
- Each recipe should have 5-8 clear cooking steps
- ingredientsMatched: only ingredients from my list that are used
- matchPercentage: (ingredientsMatched.length / ingredientsNeeded.length) * 100
- Prioritize recipes with high match percentages (60%+)
- Vary difficulty and cook times across recipes
- Make descriptions appetizing and specific
- cuisine field should match the cuisine group name

Return ONLY the JSON array of cuisine groups, no other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', response.status, error);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${error}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    console.log('Claude response:', responseText);

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse recipes from response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cuisines: CuisineGroup[] = JSON.parse(jsonMatch[0]);
    
    return new Response(
      JSON.stringify({ cuisines }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recipes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
