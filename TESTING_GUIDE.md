# Recipe Remix - Testing Guide

## ✅ Implementation Complete

All Claude API integrations are live and functional!

## 🚀 How to Test

### Start the App
```bash
npm run dev
```

Visit `http://localhost:5173`

### Test Flow

#### 1. Image Upload & Analysis
- **Upload a fridge photo** (drag & drop or click)
- **What happens:** Claude Vision API analyzes the image
- **Expected:** Ingredient list appears with categories (produce, protein, dairy, grain, spice)
- **Error handling:** Toast notification if analysis fails

#### 2. Review & Edit Ingredients
- **Remove incorrect items** by clicking the × button
- **Verify quantities** are detected correctly
- **Click "Find My Perfect Recipes"**

#### 3. Recipe Generation
- **What happens:** Claude generates 3 recipe suggestions
- **Expected:** 
  - Recipes with match percentages (70%+)
  - Cook times and difficulty levels
  - Descriptions highlighting flavors
- **Each recipe shows:** ingredients you have vs. ingredients needed

#### 4. Smart Substitutions
- **Click "See Substitutions"** on any recipe
- **What happens:** Claude analyzes missing ingredients and suggests substitutions
- **Expected:**
  - Creative substitutions using available ingredients
  - Flavor science explanations (chemistry, compounds, cooking properties)
  - Impact ratings (1-5) for flavor and texture

## 🔍 Key Features to Demo

### AI-Powered Vision
- Real-time ingredient detection
- Automatic categorization
- Quantity estimation

### Contextual Recipes
- High match percentages prioritized
- Quick recipes (under 25 min) included
- Detailed descriptions

### Science-Backed Substitutions
- Educational explanations
- Practical alternatives
- Impact transparency

## 🛠 Technical Details

### API Integration
- **Model:** claude-sonnet-4-20250514
- **Max tokens:** 1024-2048 per call
- **Architecture:** Direct client-side calls (hackathon speed optimization)

### Files Modified
- ✅ `.env` - API key configuration
- ✅ `src/services/claude.ts` - API service layer
- ✅ `src/components/ImageUpload.tsx` - Image analysis integration
- ✅ `src/pages/Index.tsx` - Recipe & substitution generation
- ✅ `.gitignore` - Environment variable protection

### Error Handling
- Toast notifications for all API failures
- Graceful fallbacks (returns to previous state)
- Console logging for debugging

## 🎯 Demo Tips

1. **Use clear photos** - well-lit, visible ingredients
2. **Start with 5-10 items** - better recipe matches
3. **Mix categories** - produce + protein + dairy for variety
4. **Read the science** - substitution explanations are impressive

## 🐛 Troubleshooting

### API Key Issues
- Verify `.env` file exists in root
- Check `VITE_ANTHROPIC_API_KEY` is set correctly
- Restart dev server after env changes

### Image Analysis Fails
- Check image format (JPG, PNG supported)
- Verify image size (< 20MB)
- Try different lighting/angle

### No Recipes Found
- Add more ingredients (minimum 3-4 recommended)
- Include at least one protein + produce
- Check ingredient names are recognized

## ⚡ Performance Notes

- **Image analysis:** ~3-5 seconds
- **Recipe generation:** ~4-6 seconds  
- **Substitutions:** ~3-5 seconds

All within acceptable demo parameters for a hackathon!

