import { X } from 'lucide-react';
import { Ingredient } from '@/types/recipe';

interface IngredientListProps {
  ingredients: Ingredient[];
  onRemove: (index: number) => void;
}

const IngredientList = ({ ingredients, onRemove }: IngredientListProps) => {
  if (ingredients.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-foreground">
          Detected Ingredients ({ingredients.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className={`ingredient-chip ${ingredient.category} group`}
            >
              <span>
                {ingredient.name}
                {ingredient.quantity && (
                  <span className="opacity-75 ml-1">• {ingredient.quantity}</span>
                )}
              </span>
              <button
                onClick={() => onRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IngredientList;
