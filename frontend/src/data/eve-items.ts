/**
 * EVE Frontier Item Data
 *
 * Real EVE item types organized by category for the marketplace.
 * Used for item selection, search, and metadata display.
 */

export interface EveItem {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number; // Estimated base price in SUI
  rarity: 'common' | 'uncommon' | 'rare' | 'precious';
  icon: string; // Emoji fallback for missing icons
}

export interface ItemCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: EveItem[];
}

export const EVE_CATEGORIES: ItemCategory[] = [
  {
    id: 'minerals',
    name: 'Minerals',
    description: 'Refined materials used in manufacturing',
    icon: '💎',
    items: [
      { id: 'TRIT_001', name: 'Tritanium', category: 'minerals', description: 'Most common mineral, used in nearly all manufacturing', basePrice: 0.5, rarity: 'common', icon: '⚪' },
      { id: 'PYER_001', name: 'Pyerite', category: 'minerals', description: 'Common mineral for ship construction', basePrice: 1.2, rarity: 'common', icon: '🟡' },
      { id: 'MEXA_001', name: 'Mexallon', category: 'minerals', description: 'Mid-tier mineral for advanced components', basePrice: 2.5, rarity: 'common', icon: '🟠' },
      { id: 'ISO_001', name: 'Isogen', category: 'minerals', description: 'Uncommon mineral for electronics', basePrice: 5.0, rarity: 'uncommon', icon: '🔵' },
      { id: 'NOCX_001', name: 'Nocxium', category: 'minerals', description: 'Rare mineral for advanced tech', basePrice: 10.0, rarity: 'uncommon', icon: '🟣' },
      { id: 'ZYDR_001', name: 'Zydrine', category: 'minerals', description: 'Precious mineral for high-tech manufacturing', basePrice: 25.0, rarity: 'rare', icon: '🔴' },
      { id: 'MEGA_001', name: 'Megacyte', category: 'minerals', description: 'Extremely rare mineral', basePrice: 50.0, rarity: 'rare', icon: '💎' },
      { id: 'MORP_001', name: 'Morphite', category: 'minerals', description: 'Rarest mineral, essential for T2 production', basePrice: 100.0, rarity: 'precious', icon: '✨' },
    ],
  },
  {
    id: 'ore',
    name: 'Ore',
    description: 'Raw materials mined from asteroids',
    icon: '🪨',
    items: [
      { id: 'VESP_001', name: 'Veldspar', category: 'ore', description: 'Most common asteroid ore', basePrice: 0.2, rarity: 'common', icon: '🪨' },
      { id: 'SCOR_001', name: 'Scordite', category: 'ore', description: 'Common ore with better mineral ratios', basePrice: 0.3, rarity: 'common', icon: '🪨' },
      { id: 'PLAG_001', name: 'Plagioclase', category: 'ore', description: 'Mid-tier ore with pyerite', basePrice: 0.5, rarity: 'common', icon: '🪨' },
      { id: 'OMBE_001', name: 'Omber', category: 'ore', description: 'Uncommon ore with isogen', basePrice: 1.0, rarity: 'uncommon', icon: '🪨' },
      { id: 'KERN_001', name: 'Kernite', category: 'ore', description: 'Uncommon ore for nocxium', basePrice: 1.5, rarity: 'uncommon', icon: '🪨' },
      { id: 'HEDB_001', name: 'Hedbergite', category: 'ore', description: 'Rare ore with nocxium and isogen', basePrice: 3.0, rarity: 'rare', icon: '🪨' },
      { id: 'JASP_001', name: 'Jaspet', category: 'ore', description: 'Rare ore with zydrine', basePrice: 5.0, rarity: 'rare', icon: '🪨' },
      { id: 'ARKO_001', name: 'Arkonor', category: 'ore', description: 'Precious ore with megacyte', basePrice: 15.0, rarity: 'precious', icon: '🪨' },
    ],
  },
  {
    id: 'ships',
    name: 'Ships',
    description: 'Spacecraft of all classes',
    icon: '🚀',
    items: [
      { id: 'SHIP_RIFTER', name: 'Rifter', category: 'ships', description: 'Fast Minmatar frigate', basePrice: 50.0, rarity: 'common', icon: '🚀' },
      { id: 'SHIP_MERLIN', name: 'Merlin', category: 'ships', description: 'Caldari combat frigate', basePrice: 55.0, rarity: 'common', icon: '🚀' },
      { id: 'SHIP_PUNISHER', name: 'Punisher', category: 'ships', description: 'Amarr assault frigate', basePrice: 60.0, rarity: 'common', icon: '🚀' },
      { id: 'SHIP_INCURSUS', name: 'Incursus', category: 'ships', description: 'Gallente armor tanked frigate', basePrice: 52.0, rarity: 'common', icon: '🚀' },
      { id: 'SHIP_CARACAL', name: 'Caracal', category: 'ships', description: 'Caldari missile cruiser', basePrice: 200.0, rarity: 'uncommon', icon: '🚀' },
      { id: 'SHIP_VEXOR', name: 'Vexor', category: 'ships', description: 'Gallente drone cruiser', basePrice: 180.0, rarity: 'uncommon', icon: '🚀' },
      { id: 'SHIP_DRAGON', name: 'Stabber', category: 'ships', description: 'Minmatar fast attack cruiser', basePrice: 190.0, rarity: 'uncommon', icon: '🚀' },
      { id: 'SHIP_DRAKE', name: 'Drake', category: 'ships', description: 'Caldari battlecruiser - iconic shield tank', basePrice: 500.0, rarity: 'rare', icon: '🚀' },
    ],
  },
  {
    id: 'modules',
    name: 'Modules',
    description: 'Ship equipment and modifications',
    icon: '⚙️',
    items: [
      { id: 'MOD_100MN', name: '100MN Afterburner', category: 'modules', description: 'High-speed propulsion module', basePrice: 15.0, rarity: 'common', icon: '⚙️' },
      { id: 'MOD_MWD', name: '50MN Microwarpdrive', category: 'modules', description: 'Burst speed propulsion', basePrice: 25.0, rarity: 'uncommon', icon: '⚙️' },
      { id: 'MOD_SHIELD_EXT', name: 'Large Shield Extender', category: 'modules', description: 'Increases shield capacity', basePrice: 10.0, rarity: 'common', icon: '🛡️' },
      { id: 'MOD_ARMOR_REP', name: 'Medium Armor Repairer', category: 'modules', description: 'Repairs armor over time', basePrice: 20.0, rarity: 'common', icon: '🔧' },
      { id: 'MOD_WEB', name: 'Stasis Webifier', category: 'modules', description: 'Slows target ships', basePrice: 30.0, rarity: 'uncommon', icon: '🕸️' },
      { id: 'MOD_POINT', name: 'Warp Disruptor', category: 'modules', description: 'Prevents target warp', basePrice: 35.0, rarity: 'uncommon', icon: '🎯' },
      { id: 'MOD_RAILGUN', name: '150mm Railgun I', category: 'modules', description: 'Long-range hybrid weapon', basePrice: 12.0, rarity: 'common', icon: '💥' },
      { id: 'MOD_LAUNCHER', name: ' missile Launcher', category: 'modules', description: 'Standard missile launcher', basePrice: 18.0, rarity: 'common', icon: '🚀' },
    ],
  },
  {
    id: 'consumables',
    name: 'Consumables',
    description: 'Ammunition, charges, and supplies',
    icon: '🔋',
    items: [
      { id: 'CON_ANTIMATTER', name: 'Antimatter Charge S', category: 'consumables', description: 'High-damage hybrid ammo', basePrice: 2.0, rarity: 'common', icon: '⚡' },
      { id: 'CON_IRON', name: 'Iron Charge S', category: 'consumables', description: 'Long-range hybrid ammo', basePrice: 1.0, rarity: 'common', icon: '⚡' },
      { id: 'CON_MISSILE_EXP', name: 'Mjolnir Light Missile', category: 'consumables', description: 'EM damage missiles', basePrice: 3.0, rarity: 'common', icon: '🚀' },
      { id: 'CON_CAP_BOOST', name: 'Cap Booster 400', category: 'consumables', description: 'Emergency capacitor charge', basePrice: 8.0, rarity: 'uncommon', icon: '🔋' },
      { id: 'CON_BOOSTER_CRASH', name: 'Crash Booster', category: 'consumables', description: 'Combat booster - missile precision', basePrice: 50.0, rarity: 'rare', icon: '💉' },
      { id: 'CON_STRONG_BLUE_PILL', name: 'Strong Blue Pill', category: 'consumables', description: 'Advanced shield booster', basePrice: 80.0, rarity: 'rare', icon: '💊' },
      { id: 'CON_NANITE_REPAIR', name: 'Nanite Repair Paste', category: 'consumables', description: 'In-flight module repair', basePrice: 15.0, rarity: 'uncommon', icon: '🔧' },
      { id: 'CON_STRONG_EXILE', name: 'Strong Exile', category: 'consumables', description: 'Advanced armor repair booster', basePrice: 100.0, rarity: 'precious', icon: '💉' },
    ],
  },
];

/**
 * Get all items flattened into a single array
 */
export function getAllItems(): EveItem[] {
  return EVE_CATEGORIES.flatMap((cat) => cat.items);
}

/**
 * Get items by category
 */
export function getItemsByCategory(categoryId: string): EveItem[] {
  const category = EVE_CATEGORIES.find((c) => c.id === categoryId);
  return category?.items || [];
}

/**
 * Search items by name or ID
 */
export function searchItems(query: string): EveItem[] {
  const lowerQuery = query.toLowerCase();
  return getAllItems().filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.id.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get item by ID
 */
export function getItemById(itemId: string): EveItem | undefined {
  return getAllItems().find((item) => item.id === itemId);
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): ItemCategory | undefined {
  return EVE_CATEGORIES.find((c) => c.id === categoryId);
}

/**
 * Get rarity color class for UI
 */
export function getRarityColor(rarity: EveItem['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-300';
    case 'uncommon':
      return 'text-neon-green';
    case 'rare':
      return 'text-cyber-400';
    case 'precious':
      return 'text-neon-purple';
    default:
      return 'text-gray-300';
  }
}

/**
 * Get rarity badge class
 */
export function getRarityBadge(rarity: EveItem['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'badge bg-gray-600/20 text-gray-300 border border-gray-600/30';
    case 'uncommon':
      return 'badge bg-neon-green/20 text-neon-green border border-neon-green/30';
    case 'rare':
      return 'badge bg-cyber-400/20 text-cyber-400 border border-cyber-400/30';
    case 'precious':
      return 'badge bg-neon-purple/20 text-neon-purple border border-neon-purple/30';
    default:
      return 'badge bg-gray-600/20 text-gray-300 border border-gray-600/30';
  }
}
