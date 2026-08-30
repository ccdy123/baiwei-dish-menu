// 分类体系（多级分类架构）
// 每个维度定义一组可筛选的取值，菜品数据通过对应字段引用这些 key。
// 维度：菜系 / 烹饪方式 / 食材类型 / 口味 / 用餐场景 / 难度

export const CUISINES = [
  { key: 'sichuan',   label: '川菜', emoji: '🌶' },
  { key: 'cantonese', label: '粤菜', emoji: '🥡' },
  { key: 'shandong',  label: '鲁菜', emoji: '🧅' },
  { key: 'hunan',     label: '湘菜', emoji: '🔥' },
  { key: 'jiangsu',   label: '苏菜', emoji: '🐟' },
  { key: 'zhejiang',  label: '浙菜', emoji: '🍤' },
  { key: 'fujian',    label: '闽菜', emoji: '🦐' },
  { key: 'anhui',     label: '徽菜', emoji: '🥬' },
  { key: 'northeast', label: '东北菜', emoji: '🥘' },
  { key: 'beijing',   label: '京菜', emoji: '🦆' },
  { key: 'shanghai',  label: '本帮菜', emoji: '🍬' },
  { key: 'home',      label: '家常菜', emoji: '🍚' }
]

export const METHODS = [
  { key: 'stir_fry', label: '炒', emoji: '🍳' },
  { key: 'braise',   label: '烧/炖/焖', emoji: '🍲' },
  { key: 'steam',    label: '蒸', emoji: '♨️' },
  { key: 'boil',     label: '煮', emoji: '🫕' },
  { key: 'deep_fry', label: '炸', emoji: '🍟' },
  { key: 'pan_fry',  label: '煎', emoji: '🥞' },
  { key: 'cold',     label: '凉拌', emoji: '🥗' },
  { key: 'roast',    label: '烤', emoji: '🍖' }
]

// 食材类型（与旧版 type 字段兼容映射在 data 层处理）
export const INGREDIENTS = [
  { key: 'meat',      label: '肉类', emoji: '🥩' },
  { key: 'poultry',   label: '禽类', emoji: '🍗' },
  { key: 'seafood',   label: '海鲜', emoji: '🦐' },
  { key: 'fish',      label: '鱼类', emoji: '🐟' },
  { key: 'vegetable', label: '蔬菜', emoji: '🥬' },
  { key: 'egg_tofu',  label: '蛋豆', emoji: '🥚' },
  { key: 'soup',      label: '汤品', emoji: '🍜' },
  { key: 'staple',    label: '主食', emoji: '🍙' }
]

export const TASTES = [
  { key: 'spicy',  label: '辣', emoji: '🌶', color: '#e74c3c' },
  { key: 'sweet',  label: '甜', emoji: '🍬', color: '#f1c40f' },
  { key: 'sour',   label: '酸', emoji: '🍋', color: '#f39c12' },
  { key: 'salty',  label: '咸', emoji: '🧂', color: '#7f8c8d' },
  { key: 'fresh',  label: '鲜', emoji: '🌿', color: '#27ae60' },
  { key: 'light',  label: '清淡', emoji: '💧', color: '#3498db' }
]

export const SCENES = [
  { key: 'breakfast', label: '早餐', emoji: '🌅' },
  { key: 'lunch',     label: '午餐', emoji: '☀️' },
  { key: 'dinner',    label: '晚餐', emoji: '🌙' },
  { key: 'latenight', label: '夜宵', emoji: '🍻' },
  { key: 'banquet',   label: '宴请', emoji: '🎉' }
]

export const DIFFICULTIES = [
  { key: 'easy',   label: '简单',  stars: 1 },
  { key: 'medium', label: '中等',  stars: 2 },
  { key: 'hard',   label: '较难',  stars: 3 }
]

// 把所有维度聚合，供筛选面板与统计使用
export const TAXONOMY = [
  { field: 'cuisine',    label: '菜系',   options: CUISINES },
  { field: 'method',     label: '烹饪方式', options: METHODS },
  { field: 'ingredient', label: '食材类型', options: INGREDIENTS },
  { field: 'taste',      label: '口味',   options: TASTES },
  { field: 'scene',      label: '用餐场景', options: SCENES },
  { field: 'difficulty', label: '难度',   options: DIFFICULTIES }
]

// 工具：根据 key 查 label
export function labelOf(dimension, key) {
  const map = {
    cuisine: CUISINES, method: METHODS, ingredient: INGREDIENTS,
    taste: TASTES, scene: SCENES, difficulty: DIFFICULTIES
  }
  const found = (map[dimension] || []).find(o => o.key === key)
  return found ? found.label : key
}
