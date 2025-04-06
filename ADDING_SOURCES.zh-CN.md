# 如何向 NewsNow 添加新的数据源

本文档概述了将新数据源集成到 NewsNow 项目所需的步骤。

## 先决条件

*   对 TypeScript 和异步编程 (`async`/`await`) 有基本了解。
*   熟悉从网页或 API 获取数据。
*   如果直接抓取网站，需要了解 HTML 解析（使用像 `cheerio` 这样的库）。
*   如果集成现有 feed，需要了解 RSS/Atom feed。

## 步骤

### 1. 创建源文件

*   导航到 `server/sources/` 目录。
*   为你的源创建一个新的 TypeScript 文件。使用与源标识符匹配的描述性小写名称（例如 `my-cool-news.ts`）。
*   使用 `defineSource` 工具函数来包装你的数据获取逻辑。

    ```typescript
    // server/sources/my-cool-news.ts
    import type { NewsItem } from "@shared/types"
    import { defineSource } from "../utils/source"
    import { myFetch } from "../utils/fetch"
    // 如果需要抓取网页，导入其他必要的库，例如 cheerio
    // import * as cheerio from "cheerio";

    export default defineSource(async () => {
      // 你的数据获取和处理逻辑放在这里
      const news: NewsItem[] = []

      // 示例：获取和处理逻辑（请替换为实际实现）
      // const response = await myFetch("https://my-cool-news.com/api/latest");
      // const data = await response.json(); // 或者解析 HTML 等
      // news = data.articles.map(article => ({ ... }));

      console.log("正在为 My Cool News 获取数据...") // 可选的日志记录

      // 确保返回一个 NewsItem 对象数组
      return news
    })
    ```

### 2. 实现获取逻辑

有三种主要方法来获取和处理数据：

*   **a) 自定义抓取/API 获取：**
    *   使用 `myFetch` 工具函数（`ofetch` 的包装器）获取 HTML 或 JSON 数据。
    *   如果获取 HTML，使用 `cheerio` 解析内容并提取相关信息（标题、URL、ID、日期）。
    *   如果获取 JSON，直接解析响应。
    *   将提取的数据映射到 `NewsItem` 结构：
        ```typescript
        interface NewsItem {
          title: string // 条目的标题或名称
          url: string // 指向新闻条目/文章的直接 URL
          id: string // 条目的唯一标识符（通常是 URL 或来自源的特定 ID）
          pubDate?: number // 可选：发布时间戳（自纪元以来的毫秒数）
          extra?: {
            info?: string // 可选：额外的简短信息（例如，分数、评论数）
            [key: string]: any // 允许其他潜在字段
          }
        }
        ```
    *   返回 `NewsItem` 对象数组。（请参阅 `server/sources/hackernews.ts` 作为示例）。

*   **b) 标准 RSS/Atom Feed：**
    *   如果源提供标准的 RSS 或 Atom feed，请使用 `defineRSSSource` 辅助函数。
    *   将 feed URL 作为第一个参数提供。
    *   它会自动获取、解析 feed 条目并将其映射到 `NewsItem`。

    ```typescript
    // server/sources/my-rss-source.ts
    import { defineRSSSource } from "../utils/source"

    // 获取并解析 RSS feed
    export default defineRSSSource("https://my-rss-source.com/feed.xml")
    ```

*   **c) RSSHub Feed：**
    *   如果源可以通过 [RSSHub](https://docs.rsshub.app/) 实例获得，请使用 `defineRSSHubSource` 辅助函数。
    *   将 RSSHub *路由路径*（例如 `/github/trending/daily`）作为第一个参数提供。基础 URL 在内部配置。
    *   它会从 RSSHub 获取 JSON feed 并将条目映射到 `NewsItem`。

    ```typescript
    // server/sources/my-rsshub-source.ts
    import { defineRSSHubSource } from "../utils/source"

    // 从配置的 RSSHub 实例 + /my/route 获取
    export default defineRSSHubSource("/my/route")
    ```

### 3. 注册源

*   打开 `shared/sources.json` 文件。
*   为你的源添加一个新条目。条目的键 **必须** 与你在步骤 1 中创建的文件名（不带 `.ts` 扩展名）匹配。

    ```json
    {
      // ... 其他源
      "my-cool-news": {
        "name": "My Cool News", // UI 中显示的名称
        "column": "tech",      // 分类：tech, finance, world, china 等
        "home": "https://my-cool-news.com", // 主页 URL
        "color": "blue",       // 用于主题的 Tailwind CSS 颜色名称（例如 red, blue, green, slate）
        "interval": 600000,    // 刷新间隔（毫秒，例如 600000 = 10 分钟）
        "title": "Latest",     // 可选：如果此源有变体，则指定标题
        "type": "realtime"     // 可选："hottest" 或 "realtime"（影响 UI）
        // "disable": "cf"     // 可选：取消注释以在 Cloudflare 部署中禁用此源
      },
      // ... 其他源
    }
    ```

### 4. 添加图标

*   为源查找或创建一个合适的图标（最好是 PNG 格式）。
*   将图标文件放在 `public/icons/` 目录中。
*   图标文件名 **必须** 与源的键匹配（例如 `my-cool-news.png`）。推荐尺寸约为 64x64 像素。

### 5. 运行预处理脚本 (Pre-source Script)

*   添加源文件并更新 `sources.json` 后，你需要更新内部的源映射。
*   在你的终端中运行以下命令：
    ```bash
    pnpm run presource
    # 或
    npm run presource
    ```
    此脚本会读取 `server/sources/` 目录和 `shared/sources.json` 以生成必要的映射。

### 6. 本地测试

*   启动开发服务器：
    ```bash
    pnpm run dev
    # 或
    npm run dev
    ```
*   在浏览器中打开应用程序。
*   检查你的新源是否出现在正确的栏目中。
*   验证数据是否已正确获取和显示。
*   你也可以通过运行以下命令直接测试刷新逻辑：
    ```bash
    npx tsx scripts/local-refresh.ts my-cool-news
    ```
    （将 `my-cool-news` 替换为你的源键）。

## 最佳实践

*   **错误处理：** 在自定义抓取逻辑中，将获取/解析操作包装在 `try...catch` 块中，以防止错误导致整个源更新过程崩溃。适当地记录错误。
*   **遵守 Robots.txt：** 如果抓取网站，请确保遵守其 `robots.txt` 规则和服务条款。避免过于频繁的抓取。
*   **效率：** 使你的抓取逻辑尽可能高效。选择特定的元素而不是不必要地解析整个 DOM。
*   **唯一 ID：** 确保 `NewsItem` 中的 `id` 字段在该源的所有条目中是真正唯一的。URL 通常是一个不错的选择。
*   **速率限制：** 注意 API 或网站可能存在的速率限制。`sources.json` 中的 `interval` 有助于控制刷新频率。

## 结论

通过遵循这些步骤，你可以成功地将新的数据源集成到 NewsNow 应用程序中，扩展其新闻和信息的覆盖范围。在与外部网站和 API 交互时，请记住进行彻底测试并遵守最佳实践。
