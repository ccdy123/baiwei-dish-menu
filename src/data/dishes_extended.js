// 扩展菜品数据集（模拟「服务器端」菜谱库，由客户端通过同步服务拉取并缓存）
// 这些菜品无本地实拍图，运行时通过 AI 文生图接口按菜名生成高质量菜品图，
// 并在加载失败时回退到带菜名的分类色块占位（保证离线/断网可用）。
// 字段与 dishes.js 一致，desc/tips 较为精简。

import { TYPE_TO_INGREDIENT } from './dishes.js'

const ext = [
  // —— 川菜 ——
  { name: '蒜泥白肉', cuisine: 'sichuan', method: 'cold', ingredient: 'meat', taste: ['spicy','salty'], scene: ['dinner','latenight'], difficulty: 'medium', time: 30, calories: 270, rating: 4.4, ingredients: ['五花肉','蒜泥','红油'], desc: '五花肉煮熟切薄片，淋蒜泥红油汁，肥而不腻、蒜香浓烈。', tips: '肉片越薄越入味，煮好后过冰水更弹。' },
  { name: '灯影牛肉', cuisine: 'sichuan', method: 'roast', ingredient: 'meat', taste: ['spicy','sweet'], scene: ['latenight','banquet'], difficulty: 'hard', time: 90, calories: 250, rating: 4.5, ingredients: ['牛肉','芝麻','红油'], desc: '牛肉切薄片腌制烘干，加油红油炒至酥香，薄如蝉翼、麻辣回甜。', tips: '牛肉要顺着纹理切极薄，烘干是关键。' },
  { name: '盐煎肉', cuisine: 'sichuan', method: 'stir_fry', ingredient: 'meat', taste: ['spicy','salty'], scene: ['lunch','dinner'], difficulty: 'medium', time: 20, calories: 400, rating: 4.4, ingredients: ['五花肉','青蒜','豆瓣酱'], desc: '五花肉片煸出油，加豆瓣酱豆豉炒香，下青蒜快炒，干香下饭。', tips: '肉要煸到微卷吐油，青蒜最后下保持脆嫩。' },
  { name: '蚂蚁上树', cuisine: 'sichuan', method: 'stir_fry', ingredient: 'egg_tofu', taste: ['spicy','salty'], scene: ['lunch','dinner'], difficulty: 'easy', time: 18, calories: 280, rating: 4.5, ingredients: ['粉丝','肉末','豆瓣酱'], desc: '粉丝泡发，肉末加豆瓣酱炒香，加汤焖煮收汁，粉丝吸味、肉末如蚁附枝。', tips: '粉丝别煮太久避免烂糊，汤汁要基本收干。' },
  { name: '樟茶鸭', cuisine: 'sichuan', method: 'roast', ingredient: 'poultry', taste: ['salty'], scene: ['banquet','dinner'], difficulty: 'hard', time: 120, calories: 440, rating: 4.6, ingredients: ['鸭','樟木屑','茶叶'], desc: '鸭腌后用樟木茶叶熏制再蒸炸，皮酥肉嫩、樟木茶香独特。', tips: '熏制火候要小，避免焦苦；炸前要蒸熟。' },

  // —— 粤菜 ——
  { name: '白切鸡', cuisine: 'cantonese', method: 'boil', ingredient: 'poultry', taste: ['fresh','light'], scene: ['dinner','banquet'], difficulty: 'medium', time: 35, calories: 230, rating: 4.7, ingredients: ['三黄鸡','姜葱'], desc: '整鸡浸煮后过冰水，皮黄肉白骨带红，蘸姜葱茸，原汁原味。', tips: '三提三放让鸡腔内外受热均匀，冰水激冷皮脆。' },
  { name: '煲仔饭', cuisine: 'cantonese', method: 'braise', ingredient: 'staple', taste: ['salty','sweet'], scene: ['lunch','dinner'], difficulty: 'medium', time: 40, calories: 520, rating: 4.7, ingredients: ['大米','腊味','青菜','酱油'], desc: '砂锅抹油焖饭，饭将熟铺腊味，锅巴焦香、酱汁浇淋。', tips: '米要泡透，焖时转锅让受热均匀形成锅巴。' },
  { name: '叉烧', cuisine: 'cantonese', method: 'roast', ingredient: 'meat', taste: ['sweet','salty'], scene: ['dinner','banquet'], difficulty: 'medium', time: 60, calories: 380, rating: 4.7, ingredients: ['猪梅肉','叉烧酱','蜜糖'], desc: '梅肉腌叉烧酱烤制，中途刷蜜糖，色泽红亮、甜香多汁。', tips: '高温烤定色后转中火，出炉前刷蜜糖增亮。' },
  { name: '虾饺', cuisine: 'cantonese', method: 'steam', ingredient: 'staple', taste: ['fresh'], scene: ['breakfast','banquet'], difficulty: 'hard', time: 50, calories: 220, rating: 4.6, ingredients: ['澄面','虾仁','笋丁'], desc: '澄面烫水面皮包鲜虾馅，蒸熟皮晶莹透虾、脆嫩鲜甜。', tips: '澄面要用沸水烫，皮才透亮；虾馅加猪油更润。' },
  { name: '干炒牛河', cuisine: 'cantonese', method: 'stir_fry', ingredient: 'staple', taste: ['salty'], scene: ['lunch','dinner','latenight'], difficulty: 'hard', time: 15, calories: 480, rating: 4.6, ingredients: ['河粉','牛肉','芽菜','韭黄'], desc: '大火猛锅滑熟牛肉，下河粉快炒，色亮味浓、河粉不断不碎。', tips: '锅要够热、动作要快，河粉提前抓散。' },

  // —— 鲁菜 ——
  { name: '九转大肠', cuisine: 'shandong', method: 'braise', ingredient: 'meat', taste: ['sour','sweet','spicy'], scene: ['banquet','dinner'], difficulty: 'hard', time: 70, calories: 360, rating: 4.5, ingredients: ['猪大肠','糖醋','胡椒'], desc: '大肠煮软炸制后入五味汁烧透，酸甜苦辣咸五味俱全。', tips: '大肠要反复洗净去异味，烧制要收汁裹味。' },
  { name: '糖醋鲤鱼', cuisine: 'shandong', method: 'deep_fry', ingredient: 'fish', taste: ['sour','sweet'], scene: ['dinner','banquet'], difficulty: 'hard', time: 45, calories: 320, rating: 4.5, ingredients: ['鲤鱼','糖醋汁'], desc: '鲤鱼打花刀炸成跃龙门状，浇糖醋汁，外酥里嫩、酸甜挂汁。', tips: '花刀要深且匀，炸时提尾定型更美观。' },
  { name: '葱烧海参', cuisine: 'shandong', method: 'braise', ingredient: 'seafood', taste: ['fresh','salty'], scene: ['banquet','dinner'], difficulty: 'hard', time: 60, calories: 180, rating: 4.6, ingredients: ['海参','大葱','高汤'], desc: '海参用葱油烧制收汁，葱香浓、海参软糯、汤汁醇厚。', tips: '海参要发透，葱段炸金黄再烧才出香。' },
  { name: '四喜丸子', cuisine: 'shandong', method: 'braise', ingredient: 'meat', taste: ['salty'], scene: ['banquet','dinner'], difficulty: 'medium', time: 60, calories: 380, rating: 4.4, ingredients: ['猪肉','马蹄','鸡蛋'], desc: '肉馅加马蹄团大丸炸定型，红烧收汁，软糯咸香、寓意团圆。', tips: '肉馅要顺一个方向打上劲，炸定型再炖。' },

  // —— 湘菜 ——
  { name: '辣椒炒肉', cuisine: 'hunan', method: 'stir_fry', ingredient: 'meat', taste: ['spicy','salty'], scene: ['lunch','dinner'], difficulty: 'easy', time: 15, calories: 300, rating: 4.7, ingredients: ['五花肉','螺丝椒'], desc: '五花肉煸香，下螺丝椒同炒，青椒微软、油润下饭，湘菜灵魂家常菜。', tips: '用螺丝椒更香辣，肉煸吐油再下椒。' },
  { name: '小炒黄牛肉', cuisine: 'hunan', method: 'stir_fry', ingredient: 'meat', taste: ['spicy'], scene: ['dinner'], difficulty: 'medium', time: 18, calories: 280, rating: 4.6, ingredients: ['黄牛肉','小米辣','芹菜'], desc: '牛肉滑油，下小米辣泡椒芹菜大火爆炒，香辣嫩滑、锅气十足。', tips: '牛肉逆纹切薄、滑油断生即出，全程大火。' },
  { name: '腊味合蒸', cuisine: 'hunan', method: 'steam', ingredient: 'meat', taste: ['salty'], scene: ['dinner','banquet'], difficulty: 'easy', time: 30, calories: 420, rating: 4.5, ingredients: ['腊肉','腊鱼','腊鸡'], desc: '腊味切件码盘蒸透，腊香浓郁、咸鲜回甘。', tips: '腊味先泡水去咸，蒸时铺底姜葱去腥。' },
  { name: '血粑鸭', cuisine: 'hunan', method: 'braise', ingredient: 'poultry', taste: ['spicy'], scene: ['dinner'], difficulty: 'hard', time: 70, calories: 400, rating: 4.4, ingredients: ['鸭','血粑','辣椒'], desc: '鸭块煸香焖煮，下血粑同烧，香辣软糯、湘西风味。', tips: '血粑后下防碎，焖煮入味更佳。' },

  // —— 苏菜 ——
  { name: '松鼠鳜鱼', cuisine: 'jiangsu', method: 'deep_fry', ingredient: 'fish', taste: ['sour','sweet'], scene: ['banquet','dinner'], difficulty: 'hard', time: 45, calories: 360, rating: 4.7, ingredients: ['鳜鱼','番茄酱','松子'], desc: '鱼去骨打花刀炸成松鼠状，浇茄汁，外酥里嫩、酸甜形似。', tips: '花刀深而不穿，炸时抖散呈蓬松状。' },
  { name: '狮子头', cuisine: 'jiangsu', method: 'braise', ingredient: 'meat', taste: ['fresh','light'], scene: ['dinner','banquet'], difficulty: 'medium', time: 60, calories: 360, rating: 4.6, ingredients: ['猪肉','马蹄','白菜'], desc: '粗切细斩成大肉丸，红烧或清炖，入口即化、肥瘦相宜。', tips: '肉要切不要剁，加马蹄增脆，小火慢炖。' },
  { name: '盐水鸭', cuisine: 'jiangsu', method: 'boil', ingredient: 'poultry', taste: ['salty'], scene: ['dinner','banquet'], difficulty: 'medium', time: 90, calories: 250, rating: 4.6, ingredients: ['鸭','花椒','盐'], desc: '鸭腌后低温浸煮，皮白肉嫩、咸鲜清香，南京名菜。', tips: '炒盐加花椒抹腌，浸煮保持微沸不断水。' },
  { name: '大煮干丝', cuisine: 'jiangsu', method: 'boil', ingredient: 'egg_tofu', taste: ['fresh'], scene: ['dinner','banquet'], difficulty: 'medium', time: 30, calories: 160, rating: 4.5, ingredients: ['白干','鸡丝','虾仁'], desc: '豆腐干切细丝，配鸡丝虾仁煨煮，刀工精湛、清鲜醇和。', tips: '干丝要切极细并多次焯水去豆腥。' },

  // —— 浙菜 ——
  { name: '西湖醋鱼', cuisine: 'zhejiang', method: 'boil', ingredient: 'fish', taste: ['sour','sweet'], scene: ['dinner','banquet'], difficulty: 'medium', time: 25, calories: 220, rating: 4.4, ingredients: ['草鱼','糖醋'], desc: '草鱼氽熟装盘，浇糖醋芡，鱼肉嫩滑、酸甜似蟹。', tips: '鱼分两片氽水三四分钟即熟，火候要准。' },
  { name: '东坡肉', cuisine: 'zhejiang', method: 'braise', ingredient: 'meat', taste: ['sweet','salty'], scene: ['dinner','banquet'], difficulty: 'medium', time: 120, calories: 460, rating: 4.7, ingredients: ['五花肉','黄酒','冰糖'], desc: '方块肉加酒糖焖酥，红亮如玛瑙、酥而不烂，杭帮名菜。', tips: '酒代水、小火慢焖，密封焖足时间。' },
  { name: '龙井虾仁', cuisine: 'zhejiang', method: 'stir_fry', ingredient: 'seafood', taste: ['fresh'], scene: ['dinner','banquet'], difficulty: 'medium', time: 12, calories: 160, rating: 4.5, ingredients: ['河虾','龙井茶'], desc: '虾仁滑炒，下泡开的龙井茶，茶香清鲜、虾白玉绿。', tips: '虾仁上浆滑油，茶只取一芽一叶。' },

  // —— 闽菜 ——
  { name: '佛跳墙', cuisine: 'fujian', method: 'steam', ingredient: 'soup', taste: ['fresh'], scene: ['banquet'], difficulty: 'hard', time: 240, calories: 480, rating: 4.8, ingredients: ['海参','鲍鱼','花胶','鸽蛋'], desc: '山珍海味分处理再汇入坛，加酒坛封炭火煨，醇厚荤香。', tips: '各料分别预熟，小火慢煨数小时。' },
  { name: '海蛎煎', cuisine: 'fujian', method: 'pan_fry', ingredient: 'seafood', taste: ['salty'], scene: ['lunch','dinner','latenight'], difficulty: 'easy', time: 15, calories: 220, rating: 4.5, ingredients: ['海蛎','地瓜粉','鸡蛋'], desc: '海蛎加地瓜粉蛋液煎至边缘焦脆，外酥内嫩、鲜香可口。', tips: '地瓜粉调稀，热油煎出焦边更香。' },
  { name: '荔枝肉', cuisine: 'fujian', method: 'deep_fry', ingredient: 'meat', taste: ['sour','sweet'], scene: ['dinner','banquet'], difficulty: 'medium', time: 30, calories: 340, rating: 4.4, ingredients: ['猪肉','番茄酱','土豆'], desc: '肉切花刀裹粉炸成荔枝形，浇茄汁，形似荔枝、酸甜酥脆。', tips: '花刀要匀，炸时定形再裹汁。' },

  // —— 徽菜 ——
  { name: '臭鳜鱼', cuisine: 'anhui', method: 'braise', ingredient: 'fish', taste: ['spicy','salty'], scene: ['dinner','banquet'], difficulty: 'hard', time: 50, calories: 280, rating: 4.5, ingredients: ['鳜鱼','臭卤','笋丁'], desc: '鳜鱼轻发酵后红烧，闻臭食香、蒜瓣肉质。', tips: '腌制时间看气温，闻有异香即可，烧时多放姜蒜。' },
  { name: '毛豆腐', cuisine: 'anhui', method: 'pan_fry', ingredient: 'egg_tofu', taste: ['spicy','salty'], scene: ['latenight'], difficulty: 'medium', time: 25, calories: 160, rating: 4.3, ingredients: ['毛豆腐','辣椒酱'], desc: '毛豆腐煎至两面金黄，淋辣酱，外焦内绵似腐乳。', tips: '少油慢煎，表皮起壳再翻面。' },

  // —— 东北/京菜/本帮/家常 ——
  { name: '锅包肉', cuisine: 'northeast', method: 'deep_fry', ingredient: 'meat', taste: ['sour','sweet'], scene: ['dinner','banquet'], difficulty: 'medium', time: 30, calories: 380, rating: 4.8, ingredients: ['里脊','糖醋','胡萝卜'], desc: '肉片挂糊炸酥，回锅裹糖醋汁，外酥里嫩、酸甜开胃。', tips: '复炸定型出酥，汁要快裹出锅。' },
  { name: '地三鲜(素)', cuisine: 'northeast', method: 'deep_fry', ingredient: 'vegetable', taste: ['salty'], scene: ['dinner'], difficulty: 'medium', time: 20, calories: 260, rating: 4.5, ingredients: ['土豆','茄子','青椒'], desc: '三样过油后合烧，咸鲜软糯、东北经典素菜。', tips: '茄子易吸油，炸好先沥油再烧。' },
  { name: '猪肉炖粉条', cuisine: 'northeast', method: 'braise', ingredient: 'meat', taste: ['salty'], scene: ['dinner'], difficulty: 'easy', time: 50, calories: 420, rating: 4.5, ingredients: ['五花肉','粉条','酸菜'], desc: '五花肉炖酸菜下粉条，吸饱汤汁、咸香软烂。', tips: '粉条后下，炖到透明入味。' },
  { name: '北京烤鸭', cuisine: 'beijing', method: 'roast', ingredient: 'poultry', taste: ['salty'], scene: ['banquet','dinner'], difficulty: 'hard', time: 120, calories: 420, rating: 4.8, ingredients: ['填鸭','甜面酱','葱丝','荷叶饼'], desc: '果木炉烤填鸭，皮酥肉嫩，配薄饼葱丝甜面酱卷食。', tips: '烫皮打糖色晾干再烤，皮才酥脆。' },
  { name: '炒肝', cuisine: 'beijing', method: 'boil', ingredient: 'meat', taste: ['salty'], scene: ['breakfast','latenight'], difficulty: 'medium', time: 40, calories: 240, rating: 4.3, ingredients: ['猪肝','大肠','蒜','芡粉'], desc: '肠肝加蒜勾浓芡，浓稠蒜香、京味早点了。', tips: '肝肠最后下保持嫩，蒜要足量。' },
  { name: '本帮红烧肉', cuisine: 'shanghai', method: 'braise', ingredient: 'meat', taste: ['sweet','salty'], scene: ['dinner','banquet'], difficulty: 'medium', time: 90, calories: 440, rating: 4.6, ingredients: ['五花肉','冰糖','黄酒'], desc: '本帮做法重糖色浓油赤酱，肉酥烂、甜咸适口。', tips: '糖色炒到位、黄酒代水焖。' },
  { name: '腌笃鲜', cuisine: 'shanghai', method: 'boil', ingredient: 'soup', taste: ['fresh'], scene: ['dinner'], difficulty: 'medium', time: 90, calories: 280, rating: 4.7, ingredients: ['咸肉','鲜猪肉','春笋'], desc: '咸鲜同煮春笋，汤白汁浓、咸鲜交融。', tips: '大火煮白转小火笃，咸肉先泡去咸。' },
  { name: '生煎包', cuisine: 'shanghai', method: 'pan_fry', ingredient: 'staple', taste: ['salty'], scene: ['breakfast','latenight'], difficulty: 'medium', time: 50, calories: 280, rating: 4.6, ingredients: ['发面','肉馅','芝麻'], desc: '小包水煎，底酥顶白、咬开一包汤。', tips: '水煎到底金黄，撒葱芝麻。' },

  // —— 更多家常/小吃/汤品 ——
  { name: '西红柿牛腩', cuisine: 'home', method: 'braise', ingredient: 'meat', taste: ['sour','salty'], scene: ['dinner'], difficulty: 'medium', time: 90, calories: 360, rating: 4.6, ingredients: ['牛腩','番茄','土豆'], desc: '牛腩与番茄炖烂，土豆绵软，酸甜浓汤下饭。', tips: '番茄分两次下，部分炖化增浓。' },
  { name: '木须肉', cuisine: 'home', method: 'stir_fry', ingredient: 'meat', taste: ['salty'], scene: ['lunch','dinner'], difficulty: 'easy', time: 18, calories: 280, rating: 4.5, ingredients: ['猪肉','鸡蛋','木耳','黄瓜'], desc: '肉片滑炒，加鸡蛋木耳黄瓜，咸鲜丰富、家常经典。', tips: '蛋液先炒成型盛出，最后合炒。' },
  { name: '肉末茄子', cuisine: 'home', method: 'stir_fry', ingredient: 'vegetable', taste: ['salty'], scene: ['dinner'], difficulty: 'easy', time: 20, calories: 230, rating: 4.5, ingredients: ['茄子','肉末','蒜末'], desc: '茄子煸软，加肉末蒜末烧入味，软糯咸香。', tips: '茄子先盐腌挤水，少油更易软。' },
  { name: '醋溜白菜', cuisine: 'home', method: 'stir_fry', ingredient: 'vegetable', taste: ['sour'], scene: ['lunch','dinner'], difficulty: 'easy', time: 10, calories: 90, rating: 4.4, ingredients: ['大白菜','干辣椒','醋'], desc: '白菜帮大火快炒，淋米醋，酸脆爽口、开胃下饭。', tips: '只用菜帮更脆，全程大火、醋最后沿锅边淋。' },
  { name: '肉末蒸蛋', cuisine: 'home', method: 'steam', ingredient: 'egg_tofu', taste: ['fresh','light'], scene: ['breakfast','dinner'], difficulty: 'easy', time: 15, calories: 200, rating: 4.6, ingredients: ['鸡蛋','肉末','葱花'], desc: '蛋液加温水蒸熟，铺炒香肉末，滑嫩鲜香。', tips: '蛋液过筛去泡，温水1:1.5，中火蒸。' },
  { name: '上汤娃娃菜', cuisine: 'home', method: 'boil', ingredient: 'vegetable', taste: ['fresh','light'], scene: ['dinner'], difficulty: 'easy', time: 15, calories: 90, rating: 4.4, ingredients: ['娃娃菜','皮蛋','火腿','高汤'], desc: '娃娃菜用上汤煨煮，配皮蛋火腿，清鲜软糯。', tips: '高汤要浓，菜帮朝下码入更入味。' },
  { name: '紫苏煎黄瓜', cuisine: 'home', method: 'pan_fry', ingredient: 'vegetable', taste: ['salty','spicy'], scene: ['dinner','latenight'], difficulty: 'easy', time: 12, calories: 100, rating: 4.2, ingredients: ['黄瓜','紫苏','小米辣'], desc: '黄瓜拍块煎至微焦，加紫苏辣椒，清香微辣、湖南家常。', tips: '黄瓜煎出虎皮再下紫苏。' },
  { name: '香菇酿肉', cuisine: 'home', method: 'steam', ingredient: 'meat', taste: ['fresh','salty'], scene: ['dinner','banquet'], difficulty: 'medium', time: 25, calories: 260, rating: 4.5, ingredients: ['香菇','肉馅','蚝油'], desc: '香菇去蒂酿肉馅，蒸后浇蚝油汁，鲜香软嫩。', tips: '肉馅顺向打上劲，蒸好后勾薄芡浇淋。' },
  { name: '番茄龙利鱼', cuisine: 'home', method: 'boil', ingredient: 'fish', taste: ['sour','sweet'], scene: ['lunch','dinner'], difficulty: 'easy', time: 20, calories: 180, rating: 4.6, ingredients: ['龙利鱼','番茄','番茄酱'], desc: '无刺鱼片配番茄汤汁，酸甜滑嫩、老少皆宜。', tips: '鱼片腌制后滑入，番茄炒出沙再加水。' },
  { name: '鸡蛋羹', cuisine: 'home', method: 'steam', ingredient: 'egg_tofu', taste: ['light'], scene: ['breakfast','dinner'], difficulty: 'easy', time: 12, calories: 130, rating: 4.5, ingredients: ['鸡蛋','温水','酱油'], desc: '蛋液加温水蒸至凝固，淋酱油香油，滑嫩如布丁。', tips: '温水1:1.5、过筛、中火、扎孔排气。' },
  { name: '皮蛋瘦肉粥', cuisine: 'home', method: 'boil', ingredient: 'staple', taste: ['salty','fresh'], scene: ['breakfast','latenight'], difficulty: 'medium', time: 50, calories: 240, rating: 4.6, ingredients: ['大米','皮蛋','瘦肉'], desc: '米熬至绵滑，下皮蛋瘦肉，咸鲜稠糯、暖胃。', tips: '米冷冻后再煮更易开花，瘦肉腌后下。' },
  { name: '红枣银耳羹', cuisine: 'home', method: 'boil', ingredient: 'soup', taste: ['sweet'], scene: ['dinner','latenight'], difficulty: 'easy', time: 70, calories: 120, rating: 4.4, ingredients: ['银耳','红枣','枸杞','冰糖'], desc: '银耳慢炖出胶，加红枣枸杞冰糖，甜润养颜。', tips: '银耳撕小朵、小火慢炖才出胶。' },
  { name: '小米粥', cuisine: 'home', method: 'boil', ingredient: 'staple', taste: ['light'], scene: ['breakfast','dinner'], difficulty: 'easy', time: 40, calories: 140, rating: 4.3, ingredients: ['小米','水'], desc: '小米慢熬至浓稠米油，养胃易消化。', tips: '水开下米，小火慢熬出米油。' },
  { name: '馄饨', cuisine: 'home', method: 'boil', ingredient: 'staple', taste: ['salty','fresh'], scene: ['breakfast','latenight'], difficulty: 'medium', time: 40, calories: 320, rating: 4.6, ingredients: ['馄饨皮','肉馅','紫菜','虾皮'], desc: '薄皮包肉馅，煮熟连汤，撒紫菜虾皮葱花，鲜香暖胃。', tips: '肉馅加水打上劲更嫩，汤底加少许猪油增香。' },
  { name: '牛肉面', cuisine: 'home', method: 'boil', ingredient: 'staple', taste: ['salty','spicy'], scene: ['lunch','dinner'], difficulty: 'medium', time: 90, calories: 520, rating: 4.7, ingredients: ['面条','牛腩','萝卜','辣油'], desc: '牛骨牛肉炖汤下面，配萝卜辣油，汤浓肉烂、筋道。', tips: '汤要清则小火、要浓则大火，萝卜去腥。' },
  { name: '葱油拌面', cuisine: 'shanghai', method: 'boil', ingredient: 'staple', taste: ['salty'], scene: ['lunch','dinner','latenight'], difficulty: 'easy', time: 25, calories: 420, rating: 4.6, ingredients: ['面条','葱油','生抽'], desc: '小葱慢炸出葱油，面条拌入酱汁，葱香浓郁、简而不凡。', tips: '葱分葱白葱叶下，炸焦不炸糊，酱汁比例要好。' }
]

// 为扩展数据生成稳定 id（core 已占 1..100，扩展从 101 起）
export const EXTENDED_DISHES = ext.map((d, i) => ({
  id: 101 + i,
  img: '', // 无本地图，运行时按菜名生成
  rating: d.rating ?? 4.3,
  ...d
}))

// 提供给远程同步「快照」使用的合并数据（core + extended）
export function getRemoteCatalog() {
  return EXTENDED_DISHES
}
