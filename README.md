# 行程包 · 安卓 App（Capacitor 封装 + GitHub Actions 云构建）

把「行程包」网页应用打包成安卓 APK。**本机不需要安装任何安卓工具链**，构建全部在 GitHub 云端完成。

## 一、首次出 APK（约 5 分钟）

1. 在 GitHub 上新建一个空仓库（例如 `travel-app`，不要勾选自动生成 README）。
2. 把本文件夹推上去：

   > 本工程**已经**在本地 `git init` 并提交过一次了（分支 `main`，工作树干净），
   > 所以**不要**再执行 `git init` / `git add` / `git commit` / `git branch`，
   > 直接从「添加远程地址并推送」开始即可。

   **命令行方式（在本目录打开终端执行）：**

   ```bash
   git remote add origin https://github.com/你的用户名/travel-app.git
   git push -u origin main
   ```

   > 推送时会要求输入用户名和密码：**密码不是你的 GitHub 登录密码**，而是
   > 要在 GitHub 网页上生成的「Personal Access Token (PAT)」。
   > 生成方法见文末「附录：生成 PAT」。

   **不想敲命令？** 用 GitHub Desktop（见文末「附录：GitHub Desktop」），全程点鼠标。

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

---

## 六、固定签名（让新版能覆盖安装旧版，数据不丢）

默认情况下 CI 每次构建都会重新生成一把调试签名，导致**新版无法覆盖安装旧版**；而卸载会清空应用内的 WebView 存储（=全部行程数据）。
所以本工程改成了「从 GitHub Secrets 取固定 keystore 签名」：

**仓库 Settings → Secrets and variables → Actions** 里需要 4 个 secret：

| Secret | 说明 |
|---|---|
| `KEYSTORE_BASE64` | keystore 文件（PKCS12/JKS）的 base64，单行 |
| `KEYSTORE_PASSWORD` | keystore 口令 |
| `KEY_ALIAS` | key 别名 |
| `KEY_PASSWORD` | key 口令（PKCS12 格式需与 KEYSTORE_PASSWORD 相同） |

CI 会做三件事：① `base64 -d` 还原成 `android/app/travel-release.keystore`；② 生成 `android/key.properties`（已 gitignore）；③ 构建时用 `signingConfigs.release` 给 **debug 和 release 两个包都签名**，并在日志的 `Verify signature` 步骤打印证书 SHA-256 指纹。

- 任何时候这个指纹都应该是同一个值 —— 变了就说明密钥被换过，那一次就会装不上。
- 本机（没有 JDK）生成密钥的方法见项目根目录 `signing-keys/使用说明.md`（openssl 生成 PKCS12）。
- **第一次**从"随机调试签名"切到"固定签名"时，手机上已有的旧包仍需 `导出备份 → 卸载 → 安装 → 导入备份` 一次；之后就能一直覆盖升级。
- 构建日志里若出现 `缺少固定签名密钥` 报错，就是 secret 没配。

---

## 附录一：生成 Personal Access Token（PAT）

GitHub 从 2021 年起**不允许用登录密码推代码**，必须用令牌代替密码。

1. 登录 GitHub → 右上角头像 → **Settings** → 左侧最底部 **Developer settings**
   → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**。
2. Note 随便填（如 `travel-app-push`）。
3. Expiration 选 `90 days` 或更长（以免过期）。
4. 勾选 `repo`（这一项包含推送权限，展开后全勾上即可）。
5. 页面底部点 **Generate token**。
6. **立刻复制**那串 `ghp_xxx` 开头的字符——离开页面后就再也看不到了。

推送时：用户名填你的 GitHub 账号，密码框粘贴这串令牌。

## 附录二：GitHub Desktop（全程点鼠标，不用命令行）

适合第一次用、不想敲命令的情况。

1. 下载安装 [GitHub Desktop](https://desktop.github.com/) 并登录账号。
2. 打开后选 **File → Add Local Repository**，选择本 `travel-app-android` 文件夹。
   （会提示「这不是 git 仓库」——没关系，因为你已 init 过，直接 Add 即可。）
3. 左上角 **Publish repository**（发布仓库）：
   - Name 填 `travel-app`
   - 取消勾选「Keep this code private」可公开，或勾选保持私有
   - 不要勾「Initialize this repository with a README」
   - 点 **Publish**
4. 第一次发布时会让浏览器授权一次，按提示允许即可。
5. 之后网页端打开仓库 → **Actions** 标签等构建完成，下载 APK。

> 注意：GitHub Desktop 只负责「把代码推上去」。构建 APK 是 GitHub 云端自动做的，
> 你推完代码后去网页的 Actions 标签等几分钟就好。
