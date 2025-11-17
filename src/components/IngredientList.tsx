import { X } from 'lucide-react';
import { Ingredient } from '@/types/recipe';

interface IngredientListProps {
  ingredients: Ingredient[];
  onRemove: (index: number) => void;
}

const IngredientList = ({ ingredients, onRemove }: IngredientListProps) => {
  if (ingredients.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto animate-scale-in">
      <div className="glass-card rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold text-foreground font-display">
            Your Ingredients
          </h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            <span className="text-sm font-semibold text-primary">
              {ingredients.length} items detected
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className={`ingredient-chip ${ingredient.category} group hover:scale-105 transition-transform shadow-sm hover:shadow-md`}
            >
              <span className="font-medium">
                {ingredient.name}
                {ingredient.quantity && (
                  <span className="opacity-90 ml-1.5 font-normal">• {ingredient.quantity}</span>
                )}
              </span>
              <button
                onClick={() => onRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-all hover:rotate-90 duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-6 text-center">
          Click the × to remove any incorrect items
        </p>
      </div>
    </div>
  );
};

export default IngredientList;
