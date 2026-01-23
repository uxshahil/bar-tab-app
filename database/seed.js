/* eslint-env node */
import { execSync } from 'child_process';
import { fakerAF_ZA as faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify';

const toSlug = (text) => {
  return slugify(text, {
    lower: true, // convert to lower case (defaults to false in this specific library, true for others)
    strict: true, // strip special characters except replacement
    remove: /[*+~.()'"!:@]/g,
    replacement: '-'
  })
}

// Run the bash script before seeding
console.log('📥 Fetching cocktail data from API...');
try {
  execSync('bash database/prefetch-api-data.sh', { stdio: 'inherit' });
  console.log('✅ Cocktail data fetched successfully!');
} catch (error) {
  console.error('❌ Failed to fetch cocktail data:', error.message);
  process.exit(1);
}

// Now proceed with your existing seed logic
console.log('🌱 Starting database seed...');

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
)

const logErrorAndExit = (tableName, error) => {
  console.error(
    `An error occurred in table '${tableName}' with code ${error.code}: ${error.message}`
  )
  process.exit(1)
}

const logStep = (stepMessage) => {
  console.log(stepMessage)
}

const seedBars = async (barNames, menuNames) => {
  const bars = barNames.map((name) => {
    return { name: name, slug: toSlug(name), menus: faker.helpers.arrayElements(menuNames) }
  })

  bars.push({ name: 'VueSchools', slug: toSlug('VueSchools'), menus: ['Drinks'] })

  const { data, error } = await supabase.from('bar').insert(bars).select('id')

  if (error) return logErrorAndExit('Bars', error)

  logStep('Bars seeded successfully.')

  return data
}

const seedMenus = async (menuNames) => {
  const menus = menuNames.map((name) => {
    return { name: name, slug: toSlug(name), active: true }
  })

  const { data, error } = await supabase.from('menu').insert(menus).select('id')

  if (error) return logErrorAndExit('Menus', error)

  logStep('Menus seeded successfully.')

  return data
}

const seedDrinksCategories = async (drinkCategoryNames) => {
  const menuItemCategories = drinkCategoryNames.map(
    (name) => ({
      name: name,
      slug: toSlug(name),
      menu: 'Drinks',
      active: true,
    }))

  const { data, error } = await supabase.from('menu_item_category').insert(menuItemCategories).select('name')

  if (error) return logErrorAndExit('Drinks Category', error)

  logStep('Drinks Categories seeded successfully.')

  return data
}

const seedDrinksGlasses = async (glassNames) => {
  const menuItemGlasses = glassNames.map(
    (name) => ({
      name: name,
      slug: toSlug(name),
      active: true
    }))

  const { data, error } = await supabase.from('drinks_glass').insert(menuItemGlasses).select('name')

  if (error) return logErrorAndExit('Drinks Glasses', error)

  logStep('Drinks Glasses seeded successfully.')

  return data
}

const seedDrinksIngredients = async (ingredientNames) => {
  const menuItemIngredients = ingredientNames.map(
    (name) => ({
      name: name,
      slug: toSlug(name),
      active: true
    }))

  const { data, error } = await supabase.from('menu_item_ingredient').insert(menuItemIngredients).select('name')

  if (error) return logErrorAndExit('Drink Ingredients', error)

  logStep('Drink Ingredients seeded successfully.')

  return data
}

const seedDrinks = async (drinks) => {
  const menuItems = drinks.map(
    (drink) => ({
      id: drink.idDrink,
      name: drink.strDrink,
      slug: toSlug(drink.strDrink),
      thumb_url: drink.strDrinkThumb,
      category: drink.strCategory,
      active: true,
      price: faker.number.float({ multipleOf: 0.25, min: 25, max: 75 })
    }))

  const { data, error } = await supabase.from('menu_item').insert(menuItems).select('id')

  if (error) return logErrorAndExit('Drinks', error)

  logStep('Drinks seeded successfully.')

  return data
}

const seedDatabase = async () => {
  const bars = ['Doppio Zero', 'Orez Oippod'];
  const menuNames = ['Drinks', 'Food'];
  const barIds = await seedBars(bars, menuNames);
  await seedMenus(menuNames, barIds);

  const apiGlasses = await import('../api_data/glass.json', { with: { type: 'json' } });
  const apiCategories = await import('../api_data/menu_category.json', { with: { type: 'json' } });
  const apiIngredients = await import('../api_data/ingredient.json', { with: { type: 'json' } });
  const apiDrinks = await import('../api_data/all_drinks.json', { with: { type: 'json' } });

  const drinksCategoryNames = apiCategories.default.drinks.map(c => c.strCategory);
  await seedDrinksCategories(drinksCategoryNames)

  const drinksGlassNames = apiGlasses.default.drinks.map(g => g.strGlass);
  await seedDrinksGlasses(drinksGlassNames)

  const drinksIngredientNames = apiIngredients.default.drinks.map(i => i.strIngredient1);
  await seedDrinksIngredients(drinksIngredientNames)

  const { drinks } = apiDrinks.default;
  await seedDrinks(drinks);
}

await seedDatabase();