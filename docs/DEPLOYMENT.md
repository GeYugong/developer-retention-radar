# 华为云 ECS 部署指南

## 1. 准备资源

推荐使用 Ubuntu 24.04、2 核 4 GB 及以上 ECS。安全组至少放行 TCP 22、80；配置 HTTPS 后再放行 443。生产环境不要对公网开放 PostgreSQL 的 5432 端口。

安装 Git、Docker Engine 与 Docker Compose 插件，然后克隆私有仓库。私有仓库可使用 GitHub Deploy Key 或短期访问令牌，不要把令牌写进命令脚本或 `.env`。

## 2. 配置环境

```bash
cp .env.example .env
openssl rand -hex 32
```

编辑 `.env`，替换所有示例密码和 `JWT_SECRET`。`PUBLIC_URL` 填写最终公网地址，例如 `http://123.60.0.1` 或 `https://radar.example.com`。

## 3. 启动与验证

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
curl http://localhost/api/health
```

浏览器访问 `/admin`，使用 `.env` 中的管理员账号登录。新建训练营或在“活动设置”中生成演示数据，再用手机扫描二维码验证公开签到。

## 4. 更新和备份

```bash
git pull --ff-only
docker compose build
docker compose up -d
docker compose exec db pg_dump -U radar radar > radar-backup.sql
```

数据库保存在命名卷 `radar-data`。升级前应先备份；不要用“重置演示数据”处理真实活动，因为该操作会清空所有业务数据。

## 5. HTTPS

生产环境建议在 ECS 前配置华为云 ELB/证书管理服务，或在主机上使用 Caddy、Nginx 与可信证书终止 TLS。启用 HTTPS 后将 `PUBLIC_URL` 改为 HTTPS 地址并重启服务，管理员 Cookie 会自动启用 Secure 属性。

## 故障检查

```bash
docker compose logs --tail=200 api
docker compose logs --tail=200 db
docker compose exec db pg_isready -U radar -d radar
```

若二维码指向内网地址，检查 `.env` 的 `PUBLIC_URL` 与浏览器实际访问域名是否一致，并从公网地址进入后台后重新展示二维码。

