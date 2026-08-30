# 家味点菜 · 在线家常菜谱点菜应用

一个功能完善的在线家常菜点菜网页应用：多级分类、智能组合筛选、数据同步与离线缓存、响应式界面，支持一键部署到 GitHub Pages。

> 在线预览：将本仓库推送到 GitHub 后，启用 Pages 即可访问（详见下文「部署」）。

## ✨ 功能特性

### 1. 菜品数据库
- 内置 **154 道真实家常菜**（其中 100 道配有本地实拍菜品图片，含菜名、食材、做法详解、烹饪小贴士、营养特点、热量、烹饪时间、难度、评分）。
- 数据层按「核心库（内置，离线基线）+ 远程目录（模拟服务器，可同步增量）」组织，**架构支持平滑扩展至 1000+ 道菜**（见「扩展数据」）。

### 2. 多级分类系统
六大维度，支持任意组合筛选（多选叠加）：
- **菜系**：川 / 粤 / 鲁 / 湘 / 苏 / 浙 / 闽 / 徽 / 东北 / 京 / 本帮 / 家常
- **烹饪方式**：炒 / 烧炖焖 / 蒸 / 煮 / 炸 / 煎 / 凉拌 / 烤
- **食材类型**：肉类 / 禽类 / 海鲜 / 鱼类 / 蔬菜 / 蛋豆 / 汤品 / 主食
- **口味**：辣 / 甜 / 酸 / 咸 / 鲜 / 清淡
- **用餐场景**：早餐 / 午餐 / 晚餐 / 夜宵 / 宴请
- **难度**：简单 / 中等 / 较难

外加关键词搜索（菜名 / 食材 / 做法）与多种排序（评分 / 热量 / 用时 / 名称）。

### 3. 数据同步功能
- **增量同步**：远程目录带版本号与每条记录的 `rev`，客户端按版本决定是否拉取、按 `rev` 做增量合并，仅更新变更项。
- **本地缓存**：菜品目录缓存于 **IndexedDB**，收藏 / 购物车 / 自定义菜 / 设置存于 **localStorage**。
- **离线可用**：内置核心库 + IndexedDB 缓存 + Service Worker 运行时缓存，断网仍可浏览已访问菜品与图片。
- **实时更新模拟**：数据中心提供「模拟服务器推送新菜」按钮，演示增量更新能力。
- **备份与恢复**：一键导出整包 JSON（菜品 + 收藏 + 购物车 + 自定义菜 + 设置），跨设备导入恢复。
- **在线/离线感知**：自动监听 `online/offline` 事件，离线时降级使用本地缓存。

### 4. 用户体验与界面
- 响应式布局：桌面端 / 平板 / 移动端自适应，移动端底部 Tab 导航。
- 菜品卡片网格 + 图片**懒加载**（IntersectionObserver）+ 加载失败回退为带菜名的分类色块。
- 美观的菜品详情页：大图、标签、营养/热量/用时统计、食材清单、做法详解、小贴士、同菜系推荐。
- 点菜单（购物车）：份数调整、合计热量/用时统计、下单生成菜单。

### 5. 部署与版本控制
- 完整 Git 仓库；提供 **GitHub Actions** 自动构建并部署到 GitHub Pages（推送到 main 即自动发布）。
- 也支持 `npm run deploy` 通过 gh-pages 手动发布。

## 🛠 技术栈

| 领域 | 选型 |
| --- | --- |
| 框架 | React 18 + Vite 5 |
| 路由 | React Router 6（HashRouter，适配静态托管） |
| 状态 | React Context + Hooks（无需冗余依赖） |
| 离线缓存 | IndexedDB（菜品目录）+ localStorage（用户数据）+ Service Worker（资源/图片） |
| 部署 | GitHub Pages + GitHub Actions |
| PWA | manifest + 可安装到主屏 |

## 📁 项目结构

```
.
├─ index.html                 # Vite 入口 HTML
├─ vite.config.js             # 构建配置（base:'./' 适配子路径部署）
├─ package.json
├─ .github/workflows/deploy.yml  # GH Pages 自动部署
├─ public/
│  ├─ images/                 # 100 道本地实拍菜品图
│  ├─ icons/                  # PWA 图标
│  ├─ manifest.json           # PWA 清单
│  └─ sw.js                   # Service Worker（运行时缓存）
└─ src/
   ├─ main.jsx                # 入口：HashRouter + 全局 Provider + SW 注册
   ├─ App.jsx                 # 布局 + 路由 + 底部导航
   ├─ styles.css             # 全局样式（响应式）
   ├─ data/
   │  ├─ taxonomy.js          # 分类体系（六维）
   │  ├─ dishes.js            # 核心菜品库（100 道，含实拍图）
   │  └─ dishes_extended.js   # 扩展菜品库（模拟远程目录，可同步增量）
   ├─ lib/
   │  ├─ imageSrc.js          # 图片地址解析 + 失败回退
   │  ├─ db.js                # IndexedDB 封装
   │  ├─ sync.js              # 同步服务（增量/备份/恢复/离线降级）
   │  └─ storage.js           # localStorage 封装
   ├─ context/
   │  └─ MenuContext.jsx      # 全局状态：菜品/筛选/搜索/收藏/购物车/同步
   ├─ components/             # Header/DishCard/DishGrid/FilterPanel/SearchBar/LazyImage
   └─ pages/                  # HomePage/CatalogPage/DishDetailPage/FavoritesPage/CartPage/SyncPage
```

## 🚀 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
npm run build     # 生产构建，产物在 dist/
npm run preview   # 本地预览生产构建
```

## 📦 部署到 GitHub Pages

### 方式一：GitHub Actions（推荐，自动部署）
1. 把本仓库推送到 GitHub（`git push origin main`）。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 之后每次推送到 `main`，`.github/workflows/deploy.yml` 会自动构建并用 `deploy-pages` 发布。
4. 访问地址：`https://<你的用户名>.github.io/<仓库名>/`。

> 本项目 `vite.config.js` 中 `base: './'`，使用相对路径，兼容项目站点与用户站点。

### 方式二：手动 gh-pages 分支
```bash
npm run deploy   # = vite build && gh-pages -d dist
```
然后在 Settings → Pages → Source 选择 `gh-pages` 分支。

## 📖 使用说明

- **首页**：查看菜系/食材/场景快捷入口与高分推荐。
- **菜谱**：左侧多维度筛选（可多选）+ 搜索 + 排序；移动端点「筛选」弹出侧栏。
- **菜品详情**：点击任意卡片，查看大图、营养、食材、做法与小贴士，可直接加入点菜单或收藏。
- **收藏**：心形图标收藏，断网可查看。
- **点菜单**：汇总想做的菜，查看合计热量与用时，确认下单生成今日菜单。
- **数据中心**：查看同步状态、手动同步、模拟服务器推送、导出/导入备份、添加自定义私家菜。

## 🧩 扩展菜品数据至 1000+

数据层已为规模化设计，扩展方式：

1. **扩充内置核心库**：在 `src/data/dishes.js` 的 `CORE_DISHES` 中按既有字段追加条目（`id` 唯一、`img` 指向 `public/images/` 下图片）。
2. **扩充远程目录**：在 `src/data/dishes_extended.js` 的 `ext` 中追加条目（无本地图时 `img` 留空，运行时按菜名生成菜品图，失败回退分类色块）。
3. **接入真实后端**：将 `src/lib/sync.js` 中 `fetchRemoteCatalog` / `fetchRemoteVersion` / `pushRemoteUpdate` 替换为真实 RESTful API 调用（返回 `{ rev, updatedAt }` 的记录即可），其余增量合并与缓存逻辑无需改动。

字段约定见 `src/data/dishes.js` 顶部注释。

## 📝 说明

- 菜谱内容来源于公开家常菜做法整理，核心 100 道配有本地实拍图；扩展菜品图由 AI 文生图接口按菜名生成，加载失败时回退为带菜名的分类色块，保证界面不破。
- 本项目仅作学习交流用途。

## 📄 License

MIT
