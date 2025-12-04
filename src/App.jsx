import React, { useState } from 'react';
import { Plus, Trash2, Search, X, ChefHat, Clock, Users, Utensils } from 'lucide-react';
import './App.css';

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [currentFood, setCurrentFood] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);

  const addFood = () => {
    if (currentFood.trim() === '') return;
    
    if (!inventory.includes(currentFood.trim().toLowerCase())) {
      setInventory([...inventory, currentFood.trim().toLowerCase()]);
      setCurrentFood('');
    } else {
      alert('This item is already in your inventory!');
    }
  };

  const removeFood = (food) => {
    setInventory(inventory.filter(item => item !== food));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addFood();
    }
  };

  const findRecipes = async () => {
    if (inventory.length === 0) {
      setError('Please add at least one ingredient to your inventory!');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your Spoonacular API key!');
      setShowApiInput(true);
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);

    try {
      const ingredientString = inventory.join(',');
      const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${encodeURIComponent(ingredientString)}&number=12&ranking=1&ignorePantry=false`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Spoonacular API key.');
        } else if (response.status === 402) {
          throw new Error('API quota exceeded. Please check your Spoonacular account.');
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      setRecipes(data);

      if (data.length === 0) {
        setError('No recipes found with these ingredients. Try adding more items!');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewRecipeDetails = async (recipeId) => {
    try {
      const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load recipe details');
      }

      const data = await response.json();
      setSelectedRecipe(data);
    } catch (err) {
      alert('Error loading recipe details: ' + err.message);
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      setShowApiInput(false);
      setError('');
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="icon-badge">
            <ChefHat size={40} className="icon-white" />
          </div>
          <h1 className="title-main">USE IT UP</h1>
          <h2 className="title-sub">turn your food inventory into recipes that save you time and money</h2>
          <p className="subtitle">Add your ingredients and discover recipes!</p>
        </div>

        {/* API Key Input */}
        {showApiInput && (
          <div className="card">
            <h3 className="card-title">
              Enter Your Spoonacular API Key
            </h3>
            <p className="card-text">
              Get your free API key from <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="link">spoonacular.com/food-api</a>
            </p>
            <div className="input-group">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
                className="input"
              />
              <button onClick={saveApiKey} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        )}

        {!showApiInput && (
          <button onClick={() => setShowApiInput(true)} className="link-btn">
            Change API Key
          </button>
        )}

        {/* Food Inventory */}
        <div className="card">
          <h2 className="card-title">
            Your Food Inventory
          </h2>
          
          <div className="input-group">
            <input
              type="text"
              value={currentFood}
              onChange={(e) => setCurrentFood(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter food item (e.g., chicken, tomatoes, rice)"
              className="input"
            />
            <button onClick={addFood} className="btn btn-success">
              <Plus size={20} />
              Add
            </button>
          </div>

          {/* Inventory Grid */}
          {inventory.length === 0 ? (
            <p className="empty-state">No items yet. Add some ingredients to get started!</p>
          ) : (
            <div>
              <div className="inventory-grid">
                {inventory.map((food, index) => (
                  <div key={index} className="inventory-item">
                    <span className="item-name">{food}</span>
                    <button onClick={() => removeFood(food)} className="btn-delete">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card stat-save">
                  <p className="stat-number">{inventory.length}</p>
                  <p className="stat-label">Ingredients</p>
                </div>
                <div className="stat-card stat-add">
                  <p className="stat-number">{recipes.length}</p>
                  <p className="stat-label">Recipes Found</p>
                </div>
              </div>
            </div>
          )}

          {/* Find Button */}
          {inventory.length > 0 && (
            <button onClick={findRecipes} disabled={loading} className="btn btn-search">
              <Search size={20} />
              {loading ? 'Searching...' : 'Find Recipes'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* Recipes */}
        {recipes.length > 0 && (
          <div className="card">
            <h2 className="card-title">
              <ChefHat className="icon-save" />
              Found {recipes.length} Recipes
            </h2>
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-img-wrap">
                    <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                    <div className="match-badge">
                      {recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Match
                    </div>
                  </div>
                  <div className="recipe-body">
                    <h3 className="recipe-title">{recipe.title}</h3>
                    
                    <div className="match-grid">
                      <div className="match-box match-have">
                        <p className="match-label">You Have</p>
                        <p className="match-number">{recipe.usedIngredientCount}</p>
                      </div>
                      <div className="match-box match-need">
                        <p className="match-label">You Need</p>
                        <p className="match-number">{recipe.missedIngredientCount}</p>
                      </div>
                    </div>
                    
                    <button onClick={() => viewRecipeDetails(recipe.id)} className="btn btn-view">
                      View Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {selectedRecipe && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">{selectedRecipe.title}</h2>
                <button onClick={() => setSelectedRecipe(null)} className="btn-close">
                  <X size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                <img src={selectedRecipe.image} alt={selectedRecipe.title} className="modal-img" />

                <div className="info-grid">
                  <div className="info-box info-blue">
                    <Clock size={28} className="info-icon" />
                    <p className="info-number">{selectedRecipe.readyInMinutes}</p>
                    <p className="info-label">Minutes</p>
                  </div>
                  <div className="info-box info-add">
                    <Users size={28} className="info-icon" />
                    <p className="info-number">{selectedRecipe.servings}</p>
                    <p className="info-label">Servings</p>
                  </div>
                  <div className="info-box info-purple">
                    <Utensils size={28} className="info-icon" />
                    <p className="info-number">{selectedRecipe.extendedIngredients?.length || 0}</p>
                    <p className="info-label">Ingredients</p>
                  </div>
                  <div className="info-box info-save">
                    <ChefHat size={28} className="info-icon" />
                    <p className="info-number">Easy</p>
                    <p className="info-label">Level</p>
                  </div>
                </div>

                <div className="section">
                  <h3 className="section-title">Ingredients</h3>
                  <div className="ingredients-grid">
                    {selectedRecipe.extendedIngredients?.map((ing, index) => (
                      <div key={index} className="ingredient-item">
                        <div className="bullet"></div>
                        <span className="ingredient-text">{ing.original}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <h3 className="section-title">Instructions</h3>
                  <div className="instructions" dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions || '<p>Instructions not available.</p>' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}