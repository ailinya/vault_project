# 移除 NestJS Observe 实施方案

目标：移除当前项目的 Observe 采集和上报，应用继续正常启动并提供现有接口。

依据：用户要求“先把监控去掉”。已确认源代码中的 Observe 引用仅位于 src/app.module.ts 和 src/main.ts；依赖声明位于 package.json 和 package-lock.json。

## 改动与影响

- src/app.module.ts：删除 createObserveModule 导入、ObserveModule/ObserveInstrument 导出、ObserveModule.forRoot 注册及其说明注释；保留 imports: []、controllers 和 providers。
- src/main.ts：只导入 AppModule，将初始化改为 `NestFactory.create(AppModule)`，移除 instrument 配置。这里是 ObserveInstrument 唯一已发现的调用方。
- package.json、package-lock.json：使用 `npm uninstall @nestjs/observe --ignore-scripts` 同步移除依赖及其不再使用的传递依赖，不引入新依赖。
- 移除后不再向 Observe 上报数据。现有 HTTP 接口、日志和端口配置保持现有行为。TLS 环境变量警告属于独立问题，本次不调整环境变量。

## 执行与验证

- [x] 用户回复 GO 后执行上述修改。
- [x] 运行 `npm run build`、`npm run lint`、`npm test`、`npm run test:e2e`，全部通过；单元测试和端到端测试各通过 1 项。首次测试因沙箱 spawn EPERM 未能启动，授权在沙箱外重跑后通过。
- [x] rg 确认 src、test、package.json、package-lock.json 无 Observe 引用；npm 卸载 2 个包。项目文件原为 untracked，Git diff 无法提供文件基线，已按读取的原文件核对源码改动。
- [x] 汇报结果并提醒重启现有应用进程以应用改动。本任务不主动提交或推送 Git；若后续要求提交，按项目规则同步更新 process.txt。

这是已有接入的移除任务，使用现有单元测试和端到端接口测试验证，无需增加仅检查代码形态的测试。
