// 菜品图片解析：本地实拍图 -> 相对路径；远程菜品 -> AI 文生图接口；失败回退到分类色块。

const TRAE_IMG_API = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

// 食材类型 -> 主题色 + emoji（回退占位用）
const INGREDIENT_THEME = {
  meat: { color: '#b03a2e', emoji: '🍖' },
  poultry: { color: '#c0576b', emoji: '🍗' },
  seafood: { color: '#1f6f8b', emoji: '🦐' },
  fish: { color: '#2e86c1', emoji: '🐟' },
  vegetable: { color: '#27ae60', emoji: '🥬' },
  egg_tofu: { color: '#d4ac0d', emoji: '🥚' },
  soup: { color: '#a04000', emoji: '🍜' },
  staple: { color: '#7d6608', emoji: '🍙' }
}

export function getIngredientTheme(ingredient) {
  return INGREDIENT_THEME[ingredient] || INGREDIENT_THEME.meat
}

// 解析菜品的图片地址
export function resolveDishImage(dish) {
  if (!dish) return ''
  // 本地实拍图：img 形如 "images/红烧肉.jpg"
  if (dish.img && dish.img.startsWith('images/')) {
    return `${import.meta.env.BASE_URL}${dish.img}`
  }
  // 远程菜品：按菜名生成高质量菜品图（AI 文生图）
  if (dish.name) {
    const prompt = `专业美食摄影，中国家常菜「${dish.name}」，俯拍，盛于瓷盘，光线自然，诱人，高清`
    return `${TRAE_IMG_API}?prompt=${encodeURIComponent(prompt)}&image_size=square`
  }
  return ''
}

// 失败回退：生成一个带菜名+食材emoji的 SVG data URI
export function fallbackDishImage(dish) {
  if (!dish) return ''
  const theme = getIngredientTheme(dish.ingredient)
  const name = (dish.name || '私家菜').slice(0, 6)
  const emoji = theme.emoji
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${theme.color}"/><stop offset="1" stop-color="#2c3e50"/>` +
    `</linearGradient></defs>` +
    `<rect width="600" height="600" fill="url(#g)"/>` +
    `<text x="300" y="270" text-anchor="middle" font-size="150">${emoji}</text>` +
    `<text x="300" y="370" text-anchor="middle" font-size="56" fill="#ffffff" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-weight="700">${name}</text>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
