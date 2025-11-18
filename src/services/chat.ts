import { supabase } from '@/integrations/supabase/client';
import { Recipe, Ingredient } from '@/types/recipe';
import { ChatMessage } from '@/types/chat';

export async function streamChatMessage({
  messages,
  currentRecipe,
  availableIngredients,
  onDelta,
  onDone,
  onError,
}: {
  messages: Array<{ role: string; content: string }>;
  currentRecipe: Recipe;
  availableIngredients: Ingredient[];
  onDelta: (text: string) => void;
  onDone: (recipeUpdate?: any) => void;
  onError: (error: string) => void;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('recipe-chat', {
      body: {
        messages,
        currentRecipe,
        availableIngredients,
      },
    });

    if (error) {
      throw error;
    }

    // Handle Claude API response format
    if (data) {
      const response = data as any;
      if (response.error) {
        onError(response.error);
        return;
      }
      
      // Claude returns simple JSON with message and recipeUpdate
      const messageContent = response.message || '';
      const recipeUpdate = response.recipeUpdate || undefined;
      
      onDelta(messageContent);
      onDone(recipeUpdate);
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    onError(error.message || 'Failed to get AI response');
  }
}

export async function sendMessage(
  userMessage: string,
  conversationHistory: ChatMessage[],
  currentRecipe: Recipe,
  availableIngredients: Ingredient[]
): Promise<{ message: string; recipeUpdate?: any }> {
  return new Promise((resolve, reject) => {
    let accumulatedMessage = '';
    let finalRecipeUpdate: any = undefined;

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    streamChatMessage({
      messages,
      currentRecipe,
      availableIngredients,
      onDelta: (text) => {
        accumulatedMessage += text;
      },
      onDone: (recipeUpdate) => {
        finalRecipeUpdate = recipeUpdate;
        resolve({
          message: accumulatedMessage,
          recipeUpdate: finalRecipeUpdate,
        });
      },
      onError: (error) => {
        reject(new Error(error));
      },
    });
  });
}
