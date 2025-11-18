import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentRecipe, availableIngredients } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context-aware system prompt
    const systemPrompt = `You are an expert cooking assistant helping users modify recipes in real-time. 

Current Recipe: "${currentRecipe.title}"
Cook Time: ${currentRecipe.cookTime} minutes
Difficulty: ${currentRecipe.difficulty}
Ingredients Needed: ${currentRecipe.ingredientsNeeded.join(', ')}
Available Ingredients: ${availableIngredients.map((i: any) => i.name).join(', ')}

Your role:
- Help users when they're missing ingredients by suggesting substitutions
- Adapt recipes for dietary restrictions, portion sizes, time constraints, or skill levels
- Provide clear, concise cooking advice
- When suggesting recipe changes, be specific about what to modify

Keep responses conversational and helpful. Focus on practical cooking solutions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        tools: [{
          type: 'function',
          function: {
            name: 'update_recipe',
            description: 'Update the recipe with modifications based on user requests',
            parameters: {
              type: 'object',
              properties: {
                ingredientsNeeded: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Updated list of ingredients needed'
                },
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      stepNumber: { type: 'number' },
                      instruction: { type: 'string' },
                      estimatedTime: { type: 'string' }
                    }
                  },
                  description: 'Updated cooking steps'
                },
                cookTime: {
                  type: 'number',
                  description: 'Updated total cook time in minutes'
                },
                description: {
                  type: 'string',
                  description: 'Updated recipe description'
                },
                explanation: {
                  type: 'string',
                  description: 'Explanation of why these changes work'
                }
              },
              required: ['explanation']
            }
          }
        }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Recipe chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
