import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import IngredientList from '@/components/IngredientList';
import RecipeCard from '@/components/RecipeCard';
import SubstitutionPanel from '@/components/SubstitutionPanel';
import HeroSection from '@/components/HeroSection';
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
      <header className="glass-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <img 
                src={logo} 
                alt="Recipe Remix" 
                className="w-14 h-14 transition-transform group-hover:scale-110" 
              />
              <h1 className="text-2xl font-display font-semibold text-foreground">
                Recipe Remix
              </h1>
            </div>
            {state !== 'upload' && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Start Over
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {state === 'upload' && <HeroSection />}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 pb-24">
        <div className="space-y-12">
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
              <div className="flex justify-center animate-slide-up">
                <Button
                  onClick={handleFindRecipes}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-12 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
                >
                  Find My Perfect Recipes
                </Button>
              </div>
            </>
          )}

          {state === 'recipes' && (
            <>
              {isLoadingRecipes ? (
                <div className="text-center py-20">
                  <div className="relative inline-block">
                    <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    Finding perfect recipes for you...
                  </p>
                  <p className="text-base text-muted-foreground">
                    Analyzing your ingredients with AI
                  </p>
                </div>
              ) : (
                <div className="space-y-10 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-5xl font-display font-bold gradient-text mb-4">
                      Your Perfect Matches
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      We found {recipes.length} delicious recipes you can make
                    </p>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="text-center py-20">
                  <div className="relative inline-block">
                    <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-secondary/20 rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    Analyzing substitutions with flavor science...
                  </p>
                  <p className="text-base text-muted-foreground">
                    Finding creative alternatives backed by chemistry
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
      <footer className="border-t border-border/50 mt-24 py-12 bg-gradient-to-t from-muted/20 to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Recipe Remix" className="w-10 h-10 opacity-80" />
              <span className="font-display font-semibold text-lg text-foreground">
                Recipe Remix
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by AI • Built with flavor science • Made with love for home cooks
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
