# 行程包 · 安卓 App（Capacitor 封装 + GitHub Actions 云构建）

把「行程包」网页应用打包成安卓 APK。**本机不需要安装任何安卓工具链**，构建全部在 GitHub 云端完成。

## 一、首次出 APK（约 5 分钟）

1. 在 GitHub 上新建一个空仓库（例如 `travel-app`，不要勾选自动生成 README）。
2. 把本文件夹推上去（在本目录打开终端执行）：

   ```bash
   git init
   git add .
   git commit -m "行程包安卓版"
   git branch -M main
   git remote add origin https://github.com/你的用户名/travel-app.git
   git push -u origin main
   ```

3. 打开 GitHub 仓库页面 → 顶部 **Actions** 标签 → 等待「Build Android APK」跑完（约 3~5 分钟，绿勾）。
4. 点进该次构建 → 底部 **Artifacts** → 下载 `travel-app-apk` → 解压得到：
   - `app-debug.apk`（直接安装用这个）
   - `app-release-unsigned.apk`（未签名正式包，需自行签名后才能安装）

5. 把 `app-debug.apk` 传到手机（微信文件传输/数据线均可），点击安装。
   首次安装会提示「未知来源应用」，允许即可。

## 二、以后更新应用

网页有改动后（`travel-app/index.html` 等）：

```bash
npm run sync:web   # 自动复制网页文件进 www/ 并同步到安卓工程
git add . && git commit -m "更新" && git push
```

推送后 Actions 会自动重新出 APK。`npm run sync:web` 会从上级目录的 `travel-app/` 复制网页文件；如果两边分开管理，也可以直接编辑 `www/` 里的文件。

## 三、应用内说明

- 数据仍保存在手机本地（WebView 存储），卸载应用会清空数据，记得定期用「导出备份」。
- 应用内的「导出备份」会显示可复制的文本（安卓 WebView 不支持直接下载文件），复制后粘贴到备忘录/微信收藏即可；「导入备份」选择 .json 文件正常可用。
- 应用图标已按安卓规范生成（自适应图标 + 各密度启动图），应用名「行程包」。

## 四、目录结构

```
├─ .github/workflows/android.yml   # 云构建配置
├─ android/                        # 安卓原生工程（Capacitor 生成）
├─ www/                            # 网页资源（APK 的内容来源）
├─ scripts/sync-web.js             # 从 travel-app/ 同步网页文件
├─ capacitor.config.json           # Capacitor 配置（appId/应用名）
└─ package.json
```

## 五、常见问题

- **Actions 构建失败**：先看报错日志；最常见是网络原因，重新跑一次（Re-run jobs）即可。
- **想改应用名/图标**：应用名在 `android/app/src/main/res/values/strings.xml`；图标替换 `android/app/src/main/res/mipmap-*/` 下的 png。
- **想上架应用商店**：需要签名 release 包（生成 keystore 后配置 `signingConfig`），这是后续可加的步骤。
