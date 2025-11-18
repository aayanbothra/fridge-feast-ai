export interface Ingredient {
  name: string;
  category: 'produce' | 'protein' | 'dairy' | 'grain' | 'spice';
  quantity?: string;
}

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  estimatedTime?: string;
}

export interface Recipe {
  title: string;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredientsNeeded: string[];
  ingredientsMatched: string[];
  matchPercentage: number;
  description: string;
  steps: CookingStep[];
}

export interface Substitution {
  original: string;
  substitute: string;
  flavorScience: string;
  flavorImpact: number;
  textureImpact: number;
}
