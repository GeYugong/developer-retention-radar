# 开发者留存雷达

面向高校训练营运营的统一签到与实时转化分析平台。学生通过不同任务节点的二维码完成报名、打卡和提交，运营人员在一个后台查看漏斗、阶段转化率和人员明细。

> 从创建活动到报名签到、后台分析、部署维护和答辩演示的全部操作，请查看根目录的 [《完整使用手册》](完整使用手册.md)。

## 功能

- 动态训练营与任务阶段管理，内置报名、账号开通、首次任务、最终提交模板
- 学生免登录签到，按学号或手机号匹配，重复提交不会重复计数
- ECharts 实时漏斗、阶段转化率、总体完成率与参与者列表
- 每阶段独立二维码/链接、CSV 导出、活动关闭与历史数据保留
- 一键生成 `100 → 80 → 50 → 35` 演示数据
- 管理员会话认证、接口限流、输入校验及 Docker Compose 部署

## 本地开发

要求 Node.js 22+、npm 和 PostgreSQL 15+。

```bash
cp .env.example .env
npm install
npm run build
npm run dev
```

API 默认运行在 `http://localhost:3000`，Web 默认运行在 `http://localhost:5173`。开发时可在 `apps/web` 增加 `.env.local`：

```text
VITE_API_URL=http://localhost:3000
```

首次启动 API 会自动建表。演示数据可在后台“活动设置”中生成，也可运行：

```bash
npm run build -w @radar/api
npm run seed -w @radar/api
```

## 测试

```bash
npm test
npm run lint
npm run build
```

测试覆盖漏斗计算、管理员认证、公开签到校验，以及学生端成功签到和活动关闭状态。

## 生产部署

参见 [华为云 ECS 部署指南](docs/DEPLOYMENT.md)。答辩操作顺序参见 [演示指南](docs/DEMO.md)。

## 数据口径

- 阶段转化率 = 当前阶段完成人数 / 前一阶段完成人数
- 整体完成率 = 最终阶段完成人数 / 报名阶段人数
- 重复签到返回成功，但不会增加统计人数
- 非报名阶段必须匹配已有学号或手机号

## 项目结构

```text
apps/api   Express API、PostgreSQL 迁移与演示数据
apps/web   React 学生端和运营后台
deploy     Nginx 生产配置
docs       部署及演示文档
```
