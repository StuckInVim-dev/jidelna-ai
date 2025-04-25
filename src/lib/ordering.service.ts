import { prisma } from './prisma';
import { stravaService } from './strava/service';

export async function autoOrderLunch(userId: string) {
  const [preferences, menu] = await Promise.all([
    prisma.userPreferences.findUnique({ where: { userId } }),
    stravaService.getTodaysMenu()
  ]);

  if (!menu || !preferences) return null;

  const selectedItem = findBestMatch(menu, preferences);
  if (!selectedItem) return null;

  return prisma.userSelection.create({
    data: {
      userId,
      date: new Date(),
      menuItemId: selectedItem.id,
      status: 'auto',
      dishData: selectedItem
    }
  });
}

function findBestMatch(menu: any[], preferences: any) {
  // 1. Try to find favorite meals that match dietary needs
  if (preferences.favorites?.length) {
    const favoriteMatch = menu.find(item =>
      preferences.favorites.some((fav: string) =>
        item.name.toLowerCase().includes(fav.toLowerCase())
      ) && passesDietaryCheck(item, preferences)
    );
    if (favoriteMatch) return favoriteMatch;
  }

  // 2. Return first item that matches dietary requirements
  return menu.find(item => passesDietaryCheck(item, preferences)) || menu[0];
}

function passesDietaryCheck(item: any, preferences: any) {
  if (preferences.vegetarian && !isVegetarian(item)) return false;
  if (preferences.vegan && !isVegan(item)) return false;
  if (preferences.allergens?.some((a: string) => 
    item.allergens.some((ia: any) => ia.code === a))
  ) return false;
  return true;
}

function isVegetarian(item: any) {
  return item.description.toLowerCase().includes('vegetarian');
}

function isVegan(item: any) {
  return item.description.toLowerCase().includes('vegan');
}