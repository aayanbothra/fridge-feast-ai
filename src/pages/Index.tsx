import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import IngredientList from '@/components/IngredientList';
import RecipeCard from '@/components/RecipeCard';
import SubstitutionPanel from '@/components/SubstitutionPanel';
import { Ingredient, Recipe, Substitution } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';

type AppState = 'upload' | 'ingredients' | 'recipes' | 'substitutions';

const Index = () => {
  const [state, setState] = useState<AppState>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isLoadingSubstitutions, setIsLoadingSubstitutions] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);

  const handleImageAnalyzed = (detectedIngredients: Ingredient[]) => {
    setIngredients(detectedIngredients);
    setState('ingredients');
    setIsAnalyzing(false);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleFindRecipes = async () => {
    setIsLoadingRecipes(true);
    setState('recipes');
    
    // TODO: Call Claude API to get recipes
    // For now, use mock data
    setTimeout(() => {
      const mockRecipes: Recipe[] = [
        {
          title: 'Mediterranean Chicken Bowl',
          cookTime: 25,
          difficulty: 'easy',
          ingredientsNeeded: ['chicken breast', 'tomatoes', 'onion', 'garlic', 'olive oil', 'lemon', 'oregano'],
          ingredientsMatched: ['chicken breast', 'tomatoes', 'onion', 'garlic', 'olive oil'],
          matchPercentage: 71,
          description: 'A fresh and flavorful bowl featuring juicy chicken with Mediterranean spices, roasted tomatoes, and aromatic herbs. Perfect for a quick weeknight dinner.',
        },
        {
          title: 'Simple Chicken Stir-Fry',
          cookTime: 20,
          difficulty: 'easy',
          ingredientsNeeded: ['chicken breast', 'onion', 'garlic', 'olive oil', 'soy sauce'],
          ingredientsMatched: ['chicken breast', 'onion', 'garlic', 'olive oil'],
          matchPercentage: 80,
          description: 'Quick and easy stir-fry with tender chicken and caramelized onions. A versatile base that works with whatever vegetables you have on hand.',
        },
        {
          title: 'Rustic Tomato Chicken',
          cookTime: 35,
          difficulty: 'medium',
          ingredientsNeeded: ['chicken breast', 'tomatoes', 'onion', 'garlic', 'olive oil', 'basil', 'white wine'],
          ingredientsMatched: ['chicken breast', 'tomatoes', 'onion', 'garlic', 'olive oil'],
          matchPercentage: 71,
          description: 'A comforting one-pan dish with chicken simmered in rich tomato sauce. The garlic and onions create a deeply savory foundation.',
        },
      ];
      setRecipes(mockRecipes);
      setIsLoadingRecipes(false);
    }, 1500);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsLoadingSubstitutions(true);
    setState('substitutions');

    // TODO: Call Claude API to get substitutions
    // For now, use mock data
    setTimeout(() => {
      const mockSubstitutions: Substitution[] = [
        {
          original: 'lemon',
          substitute: 'tomatoes (extra)',
          flavorScience: "Tomatoes contain citric acid and glutamic acid, providing the brightness you'd get from lemon. While less tart, their umami depth adds complexity. The acidity helps tenderize the chicken similarly to lemon juice.",
          flavorImpact: 4,
          textureImpact: 2,
        },
        {
          original: 'oregano',
          substitute: 'garlic (roasted)',
          flavorScience: 'Roasting garlic until golden creates Maillard compounds that mimic oregano\'s earthy, slightly bitter notes. Both share sulfur compounds that add depth to Mediterranean dishes.',
          flavorImpact: 3,
          textureImpact: 1,
        },
      ];
      setSubstitutions(mockSubstitutions);
      setIsLoadingSubstitutions(false);
    }, 1500);
  };

  const handleReset = () => {
    setState('upload');
    setIngredients([]);
    setRecipes([]);
    setSelectedRecipe(null);
    setSubstitutions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Recipe Remix" className="w-12 h-12" />
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Recipe Remix
            </h1>
          </div>
          {state !== 'upload' && (
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {state === 'upload' && (
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-5xl font-display font-semibold mb-4 text-foreground">
              Turn Your Ingredients Into
              <span className="text-primary"> Delicious Recipes</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Snap a photo, get AI-powered recipe suggestions, and discover creative ingredient substitutions backed by flavor science.
            </p>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="space-y-8">
          {state === 'upload' && (
            <ImageUpload
              onImageAnalyzed={handleImageAnalyzed}
              isAnalyzing={isAnalyzing}
            />
          )}

          {state === 'ingredients' && (
            <>
              <IngredientList
                ingredients={ingredients}
                onRemove={handleRemoveIngredient}
              />
              <div className="flex justify-center">
                <Button
                  onClick={handleFindRecipes}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8"
                >
                  Find Recipes
                </Button>
              </div>
            </>
          )}

          {state === 'recipes' && (
            <>
              {isLoadingRecipes ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    Finding perfect recipes for you...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-center text-foreground mb-8">
                    Suggested Recipes
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe, index) => (
                      <RecipeCard
                        key={index}
                        recipe={recipe}
                        onSelect={() => handleSelectRecipe(recipe)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {state === 'substitutions' && (
            <>
              {isLoadingSubstitutions ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    Analyzing substitutions with flavor science...
                  </p>
                </div>
              ) : (
                <SubstitutionPanel
                  recipeName={selectedRecipe?.title || ''}
                  substitutions={substitutions}
                  onBack={() => setState('recipes')}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by AI • Built with flavor science</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
