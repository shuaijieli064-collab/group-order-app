# 群下单程序（黑板菜单版）

这是一个可直接本地运行的群下单小程序，已根据你给的黑板菜单初始化菜品和价格。

## 功能

- 菜单初始化（含分类 + 单价）
- 成员下单（可填写联系方式和备注）
- 修改/删除订单
- 自动汇总（总订单、总份数、总金额）
- 菜品排行 + 成员排行
- 导出 CSV 给商家
- 菜品管理（新增菜品、删菜、改价按钮）

## 运行

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

然后打开浏览器访问：

```text
http://127.0.0.1:5000
```

## 直接发给微信朋友使用（公网分享）

### 方式 A：一键脚本（推荐）

在项目目录双击：`start_wechat_share.bat`

它会自动做三件事：

- 安装分享依赖
- 启动本地服务（如未启动）
- 生成公网链接 + 终端二维码（并保存文本文件 `wechat-share-qr.txt`）

把“公网链接”发给微信好友即可访问。

### 方式 B：命令行

```bash
pip install -r requirements.txt
python share_wechat.py
```

### 可选：配置 ngrok token（更稳定）

如果你有 ngrok 账号，可先设置环境变量：

```bash
setx NGROK_AUTHTOKEN 你的token
```

重新打开终端后生效。

## 分享注意事项

- 你电脑必须开机且脚本保持运行，好友才能访问。
- 关闭脚本或断网后，分享链接会失效。
- 公网链接会把你的下单页暴露到外网，建议只在点餐期间临时使用。

## 云端部署（可实时共享，推荐）

推荐用 Render（需可用付费计划），部署后可以得到长期公网地址，大家访问同一个数据库。

### 1) 准备

- 代码仓库：`https://github.com/shuaijieli064-collab/group-order-app`
- 项目已包含 `render.yaml`，并配置了持久化磁盘路径。

### 2) 部署步骤

1. 打开 Render 并登录：`https://render.com`
2. 选择 **New +** -> **Blueprint**
3. 连接 GitHub 仓库 `group-order-app`
4. 确认创建 `group-order-app` 服务
5. 等待构建完成后，访问 Render 给出的 `https://xxx.onrender.com`

### 3) 关键说明

- 持久化数据库路径：`/var/data/group_orders.db`
- 已在 `render.yaml` 里配置，不需要你手动改代码。
- 若蓝图创建失败，通常是账号没有可用付费计划；你可以在 Render 里手动创建 Web Service（见下方）。

### 蓝图失败时的手动创建

1. Render 控制台点 **New +** -> **Web Service**
2. 选择仓库 `group-order-app`
3. 填写：
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Instance Type: `Starter` 或更高
4. 添加环境变量：
   - `GROUP_ORDER_DB_PATH=/var/data/group_orders.db`
   - `PYTHON_VERSION=3.11.9`
5. 在服务里添加磁盘：
   - Name: `group-order-data`
   - Mount Path: `/var/data`
   - Size: `1GB`

## 数据存储

- SQLite 文件：`group_orders.db`
- 首次启动会自动建表并写入菜单

## 接口

- `GET /api/menu` 菜单
- `GET /api/orders` 订单列表
- `POST /api/orders` 新建订单
- `PUT /api/orders/<id>` 更新订单
- `DELETE /api/orders/<id>` 删除订单
- `GET /api/summary` 汇总
- `GET /api/export.csv` 导出 CSV

## 说明

菜单是按图片人工整理录入，个别手写字可能存在识别误差；如果你要，我可以下一步给你加一个“后台菜品管理页”，让你自己在线改菜名/价格。
