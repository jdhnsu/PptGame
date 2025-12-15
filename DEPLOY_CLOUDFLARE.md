# 部署方式
本项目是一个纯静态网站（HTML/CSS/JS），非常适合使用 **[Cloudflare Pages](#部署到-cloudflare-pages-指南)** 和 **[GitHub pages](#部署到-github-pages)** 进行免费、高速的全球部署。


# **1**.部署到 Cloudflare Pages 指南


## 方法一：Git 集成（推荐 - 自动化部署）

由于本项目已经是一个 Git 仓库，这是最简单的方法。

1.  **Fork本项目 并 推送到远程仓库**：
    *   将你的代码推送到 GitHub 或 GitLab。
2.  **创建 Cloudflare Pages 项目**：
    *   登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
    *   进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
    *   选择你的仓库 (`PptGame`)。
3.  **配置构建设置**：
    *   **Project name**: `team-memories` (或你喜欢的名字)
    *   **Production branch**: `main`
    *   **Framework preset**: `None` (因为是纯静态 HTML)
    *   **Build command**: (留空)
    *   **Build output directory**: `.` (或者 `/`，表示根目录)
4.  **部署**：
    *   点击 **Save and Deploy**。

以后每次你 `git push` 更新代码，Cloudflare Pages 会自动重新部署。

---

## 方法二：直接上传（最快 - 无需代码操作）

如果你不想使用 Git，可以直接手动上传文件夹。

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Upload assets**。
3.  输入项目名称（如 `team-memories`）。
4.  将本地的 `PptGame` 文件夹直接拖入上传区域。
5.  点击 **Deploy Site**。

---

## 方法三：使用 Wrangler CLI (开发者方式)

如果你安装了 Node.js，可以使用命令行部署。

1.  安装 Wrangler：
    ```powershell
    npm install -g wrangler
    ```
2.  登录 Cloudflare：
    ```powershell
    wrangler login
    ```
3.  在项目根目录运行部署命令：
    ```powershell
    wrangler pages deploy . --project-name team-memories
    ```

## 额外优化

我已经创建了 `_headers` 文件。当部署到 Cloudflare Pages 时，它会自动生效：
*   **缓存优化**：图片、CSS、JS 会被浏览器缓存 1 年，加快二次访问速度。
*   **安全增强**：添加了基本的安全响应头。

# **2**.部署到 Github Pages

# Github Pages 指南

这是一个纯静态网站（HTML/CSS/JS），非常适合使用 **Github Pages** 进行免费、高速的全球部署。
首先把项目**fork**，然后打开 Github 仓库，进入 Settings -> Pages -> Source -> Deploy from a branch，选择一个合适的分支，并点击 Save，等待构建完成。