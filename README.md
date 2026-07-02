# EMV L3 知识库

围绕 **EMV Level 3（终端集成/部署）测试与认证** 的中文知识库，覆盖 FIME 测试工具、各国际卡组织的 L3 认证程序及其测试用例与配置细节。

## 目录导航

### 一、基础概念
- [EMV Contactless Kernel Deep Dive](./01-基础概念/emv-contactless-kernel-deep-dive.md) —— 非接内核（Kernel 2/3/6…）与支付品牌映射
- [接触与非接 CVM 详解](./01-基础概念/接触与非接CVM详解.md) —— CVM List(8E)、CVM Results(9F34)、非接三大限额、CDCVM、Visa/MC 内核差异
- [EMV 免密免签判断流程（No CVM 最大化）](./01-基础概念/EMV免密免签判断流程.md) —— 免密免签三条路径(低额No CVM/CDCVM/联机)、接触8E与非接限额判定链、**分卡组(Visa TTQ-CTQ / MC 四限额 / Amex / Discover / JCB / 银联)免密入口对照** + 在合规边界内最大化免密的五个杠杆 + 决策流程图
- [终端配置：AID 与 CAPK](./01-基础概念/终端配置-AID与CAPK.md) —— AID(RID+PIX)/应用选择/部分匹配/TAC；CAPK(RID+Index)/ODA 证书链/测试vs生产密钥
- [AID 与 CAPK 全卡组织参考表](./01-基础概念/AID与CAPK全卡组织参考表.md) —— 全卡组织 AID 速查 + 生产/测试 CAPK 索引表（明确标记 测试 vs 真实）
- [TAC / IAC / TVR 决策逻辑](./01-基础概念/TAC-IAC-TVR决策逻辑.md) —— TVR(95) 位含义、Denial/Online/Default 判定、AAC/ARQC/TC、两次 GENERATE AC
- [ODA 证书链字节级](./01-基础概念/ODA证书链字节级.md) —— CAPK→Issuer(90)→ICC(9F46) 恢复格式、SDA/DDA/CDA、失败点→TVR
- [EMVCo Kernel 2 V2.11 规范要点](./01-基础概念/EMVCo-Kernel2-V2.11规范要点.md) —— Mastercard 非接内核：进程模型、Data Exchange(ACT/DET/DEK/OUT)、Outcome、Data Record、四大限额、RRP、v2.11 变更
- [终端配置：各内核数据元参考（D-PAS L2）](./01-基础概念/终端配置-各内核数据元参考-DPAS-L2.md) —— 跨内核(EMV/Visa/MC/银联/Amex/Discover/JCB/MIR…)的标准+专有(DF81xx)配置标签速查
- [EMVCo L3 测试框架与标准化文件格式（伪函数 / 联机响应语法）](./01-基础概念/EMVCo-L3测试框架与标准化文件格式.md) —— EMVCo 官方框架本体：组成交付物(L3FIG/测试卡映像 XML/TSE/日志)、L3 PSI、**测试卡映像伪函数 `emvcard.*`**（CID/SDAD/ATC/密文，含 C8+XDA v1.6 增补）、**联机响应 XML 语法 + `emvsim.*`**（ARQC 校验/ARPC 生成/Issuer Script/超时延迟）——支撑各卡组织 L3 程序与 FIME 工具的通用地基
- 关键层级：L1 物理层 → L2 内核/应用 → **L3 端到端集成**（各卡组织自定义，EMVCo 仅认证框架/工具）

### 二、FIME 测试工具
- [FIME L3 测试工具深度解析](./02-fime测试工具/FIME-L3测试工具深度解析.md) —— 10 个工具总览（ASTREX / BTT / STP / Card Simulator / Card Spy / SmartSpy+ / EMV PVT 等）
- [FIME-BTT 品牌测试工具深度解析](./02-fime测试工具/FIME-BTT-品牌测试工具深度解析.md) —— 旗舰 L3 产品 BTT 的能力、卡组织覆盖、软硬件组成
- [FIME BTT `.tpp` 项目文件格式与各卡组织 L3 测试计划](./02-fime测试工具/FIME-BTT-TPP项目文件与L3测试计划.md) —— `.tpp`(ZIP) 工程包结构 + Amex/Discover/Mastercard/Visa 真实测试计划名/版本/用例编号体系（BTT 5.8.0）

### 三、各卡组织 L3 认证要求
- [各卡组织 L3 认证测试要求一览](./03-各卡组织L3认证/各卡组织L3认证测试要求一览.md) —— Visa / Mastercard / Amex / Discover / JCB / 银联 对照总表
- [Visa 与 Mastercard L3 认证深度解析](./03-各卡组织L3认证/Visa与Mastercard-L3认证深度解析.md) —— 两大组织流程、工具、提交机制对比
- [Amex 与 Discover L3 认证深度解析](./03-各卡组织L3认证/Amex与Discover-L3认证深度解析.md) —— AEIPS/Expresspay(AFD/Transit/Fleet) + D-PAS E2E(ZIP/Fallback/Cross Testing)
- [JCB 与银联 L3 认证深度解析](./03-各卡组织L3认证/JCB与银联-L3认证深度解析.md) —— JCB TCI/TCI-CL(J/Smart·J/Speedy) + 银联国内(PBOC/国密)vs 国际(UPI·UAC/QuickPass)
- [JCB TCI 测试用例分组与编号体系](./03-各卡组织L3认证/JCB-TCI测试用例与编号体系.md) —— TCI(J/Smart)/TCI-CL(J/Speedy) 用例分组(应用选择/ODA/CVM/联机/脚本)、编号体系结构、JCB 专有数据元(9F53 TIP)；精确编号需 JCB 测试包核对
- [银联国内：PBOC 3.0 与国密算法](./03-各卡组织L3认证/银联国内-PBOC3.0与国密算法.md) —— PBOC 2.0/3.0 沿革、SM2/SM3/SM4、DF69 算法切换、qPBOC、BCTC 认证
- [银联国际 QuickPass L3 配置与 HK/SG 特殊 CVM](./03-各卡组织L3认证/银联国际-QuickPass-L3配置与HK-SG特殊CVM.md) —— UPI AID/测试 CAPK/TAC/9F66(TTQ) 配置 + 港(344)新(702)非接借记/贷记特殊 CVM 规则

### 三之二、实测案例
- [L3 认证实例：Sunmi T6F10 终端配置剖析](./07-实测案例/L3认证实例-Sunmi-T6F10终端配置剖析.md) —— 同一终端在 Amex/Discover/Mastercard 三程序下的真实 L3 报告：L1/L2 LoA 链、各接口 TAC/9F33/9F1D、CVM 限额、多 AID 取舍（PII 已剥离）
- [实测失败案例：M-TIP02 技术回退（DE22=90 应为 80）](./06-报文层/ISO8583-报文域全景与POS录入方式.md) —— FIME BTT 抓取的 Mastercard M-TIP02.Test.01.Scenario.01 失败截图逐字段拆解、根因（fallback 录入方式标错）、修复与重测（收录于报文外层篇 §七）
- [实测案例：Visa 非接 59「卡片校验错误」→ 从 55 域 `91` 反解 ARC 定位发卡行拒绝](./07-实测案例/实测案例-Visa非接59拒绝-ARC反解.md) —— 拍卡 qVSDC 返回 DE39=59，请求 55 域齐备自洽排除终端侧；拆响应 `91`=ARPC+ARC，`ARC`=`3539`=ASCII"59" 确证发卡行 Suspected Fraud 拒绝；沉淀"ARC 反解 + 有 ARPC 即密文链正常"诊断套路 + **CNP/跨境侧 decline recovery 延伸**（3DS 无感/有感核身、网络令牌、Account Updater、智能重试）

### 四、Visa 专题
- [Visa-Global-L3-Test-Set 与 qVSDC-DM](./04-visa专题/Visa-Global-L3-Test-Set与qVSDC-DM.md) —— 2022 年取代 ADVT/CDET 的标准测试集 + 条件性工具 qVSDC DM
- [Visa-CDET 非接测试用例细分](./04-visa专题/Visa-CDET非接测试用例细分.md) —— CDET 17 个非接用例逐卡细分
- [Visa TTQ/CTQ 与 CDCVM Token 化指示](./04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示.md) —— TTQ(9F66)/CTQ(9F6C) 位级解析 + Apple Pay/Google Pay 的 CDCVM 指示机制
- [MC-TSE 配置项与 Visa-L3 测试用例](./04-visa专题/MC-TSE配置项与Visa-L3测试用例.md) —— ADVT 接触 29 用例清单 + TSE 配置项概览

### 五、Mastercard 专题
- [M-TIP TSE 配置详解](./05-mastercard专题/M-TIP-TSE配置详解.md) —— TSE 操作流程、问卷结构、动态裁剪、结果判定层级
- [M-TIP TSE 问卷与终端配置参数](./05-mastercard专题/M-TIP-TSE问卷与终端配置参数.md) —— 问卷字段→EMV 对象映射（9F35/9F33/9F40）、动态裁剪逻辑、终端配置参数位级详解
- [Mastercard 非接 CVM 机制与 FFI](./05-mastercard专题/Mastercard非接CVM机制与FFI.md) —— Kernel 2 四大限额 + CVM Capability + On-device CVM；FFI(9F6E) 品牌差异与位级

### 五之二、报文层（主机侧）
- [ISO 8583 报文域全景与 POS 录入方式（DE22）/ 技术回退](./06-报文层/ISO8583-报文域全景与POS录入方式.md) —— DE55 **之外**的 ISO 8583 报文域：MTI/Bitmap/DE 结构 + L3 关键域(DE2/3/4/22/35/45/61/39…)速查 + **DE22 录入方式码值(05/07/80/90/91)深入** + **技术回退(80 vs 90)触发链与报文形态** + 服务码自洽 + **实测案例 M-TIP02 回退失败逐字段拆解**【报文外层篇】
- [ISO 8583 报文差异对照：磁条 / 接触芯片 / 非接芯片](./06-报文层/ISO8583-磁条-接触-非接报文差异对照.md) —— 同一笔卡支付在**磁条 swipe / 接触 contact / 非接 contactless** 三路径下的报文差异：总览对照表 + 三点实质区别(DE55 分水岭 / 接触 vs 非接专有标签 / 两类降级 80·91) + 逐域详解 + **DE23↔`5F34` 卡序列号专节** + 三路径报文骨架 + 按路径的 L3 校验清单【路径对照篇】
- [ISO 8583 字段 55（DE55）与各卡组织 EMV 数据要求](./06-报文层/ISO8583-字段55-跨卡组织要求.md) —— DE55 的来源(内核 Data Record)、通用必备 EMV 标签、Visa/MC/Amex/Discover/JCB/银联 的 DE55 差异、L3 主机测试关注点【框架篇】
- [DE55 逐标签实现清单（字节级）](./06-报文层/ISO8583-DE55-逐标签实现清单.md) —— 以真实收单主机(Cardnow V2.13)Appendix C 为底本，逐标签 ID/长度/数据字节拆分 + 必选随交易路径变化 + 9F53/9F6E 标签复用陷阱【实现篇】
- [APDU/TLV 实测交易流程解读（字节级走读）](./06-报文层/APDU-TLV实测交易流程解读.md) —— 一笔非接交易 PPSE→SELECT→GPO→READ RECORD→GENERATE AC 的逐条 C/R-APDU 与 TLV 字节解析（合成示例教方法）+ §八**真实实证**：FIME BTT 抓取的同一笔 M-TIP06 接触 M/Chip 交易，卡侧 APDU 与主机 DE55 逐字节对应（SGD/新加坡，离线 DDA+PIN，ARQC 联机）
- [收单主机认证（Host Certification）与 L3 重测触发条件](./06-报文层/收单主机认证与L3重测触发条件.md) —— 主机认证 vs 终端 L3 的位置与先后；Mastercard NIV(TAN)/Visa Acquirer Host/Discover D-PAS Online+Clearing/Amex 流程；"改了什么才需要重做 L3" 的变更触发矩阵
- [在线报文与 TLV 解析工具速查](./06-报文层/在线报文与TLV解析工具速查.md) —— 整合公开的 **EMV BER-TLV 解析器**(emvdecoder/paymentcardtools/emvlab/goto327) + **ISO 8583 外层报文解析器**(goto327/neaPay) + **单标签位级解码器**(DE22/TVR/TTQ/CTQ/AIP/9F33…) + **密文/密钥计算器**(ARQC/MAC/UDK/Key Block) 四类工具，含 **PII/密钥安全红线**与客户端/离线优先建议
- [ISO 8583 DE39 应答码全表、软/硬拒绝与拒绝治理](./06-报文层/ISO8583-DE39应答码与拒绝治理.md) —— **一手来源**：Visa Developer 官方 Action Code 完整码表（含 `59`/`63`/`82`/`Q1` 等"卡校验"相关码辨析）+ Mastercard 拒绝三分组(79/82/83)与 **完整 Merchant Advice Code(01–05/21/22/24–30/40/41，含官方重试计时)**+30 天重试收费红线 + 软/硬拒绝重试边界 + decline recovery 一手规范出处(EMV 3-D Secure v2.3.1.1 / EMVCo 支付令牌化 / Account Updater)【应答码篇】
- [EMV 3-D Secure：AReq/ARes 报文字段与认证结果](./06-报文层/EMV-3DS-AReq-ARes报文字段与认证结果.md) —— CNP 风险类拒绝的挽回载体：四对报文(AReq/ARes·CReq/CRes·RReq/RRes·PReq/PRes)+三域模型 + **AReq/ARes 全量数据元**(threeDSServerTransID/deviceChannel/purchaseAmount/browser*·authenticationValue/eci/acsURL…) + **transStatus(Y/N/U/A/C/R/D)** + **transStatusReason(01 卡认证失败/11 疑似欺诈…)与授权侧 DE39 一一对应**【3DS 认证篇】

### 六、原始来源文档
- [`web-docs/`](./web-docs) —— 原始来源文件（公开规范 PDF + 项目实测资料；来源清单见 [`web-docs/SOURCES.md`](./web-docs/SOURCES.md)）。⚠️ 实测资料含 PII / 第三方机密，纳入版本控制前请阅读 SOURCES.md 的敏感性提示。

## 关键速记

| 卡组织 | 程序 | 接触 | 非接 | 提交/产出 |
|--------|------|------|------|-----------|
| Visa | Global L3 Test Set | ADVT 范畴 | CDET 范畴(+qVSDC DM 条件性) | CCRT 合规上报 |
| Mastercard | M-TIP | ✅ | ✅(需 VPLA) | TSE 文件 → 服务商签 LoA |
| Amex | AEIPS+Expresspay | AEIPS | Expresspay | Amex 代表评审 + 工具测试 → LoA |
| Discover/Diners/PULSE | DPAS L3 | ✅ | ✅(+ZIP) | 经认证 E2E 服务商 → 正式验证 |
| JCB | TCI | TCI(J/Smart) | TCI-CL(J/Speedy) | JCB International 验证 |
| 银联国际 | 终端集成 | UAC | QuickPass | Integration+Functional → UPI |
| 银联国内 | PBOC 终端检测 | UICS(国密) | QuickPass(国密) | CUP/BCTC 检测认证 |

## 覆盖状态
✅ 六大国际卡组织 L3 认证已全部覆盖（Visa / Mastercard / Amex / Discover / JCB / 银联，银联含国内+国际）。

## 可进一步深入（备选）
- JCB TCI 逐用例**框架与编号体系已补**（见 [JCB TCI 测试用例与编号体系](./03-各卡组织L3认证/JCB-TCI测试用例与编号体系.md)）；**精确用例号/数量**仍需申领 JCB 测试包核对
- 报文层 DE55 **框架篇 + 实现篇（逐标签字节级）已补**（见 [DE55 逐标签实现清单](./06-报文层/ISO8583-DE55-逐标签实现清单.md)）；可再按所对接卡组织主机接口规范逐条复核必选/可选
- 实测抓包**方法与字节级走读已补**（见 [APDU/TLV 实测交易流程解读](./06-报文层/APDU-TLV实测交易流程解读.md)，含合成示例）；下一步可用 Card Spy / SmartSpy+ 把**真实抓包数据**替换示例字节
- 各卡组织 L3 测试计划的逐用例语义（编号体系已补，见 [FIME BTT .tpp 与 L3 测试计划](./02-fime测试工具/FIME-BTT-TPP项目文件与L3测试计划.md)）

## 一致性核查（2026-06-25 复核）

**2026-06-25（目录重组 + 新增 EMVCo L3 框架篇）**：
- 新增 [EMVCo L3 测试框架与标准化文件格式](./01-基础概念/EMVCo-L3测试框架与标准化文件格式.md)（伪函数 `emvcard.*` / 联机响应 `emvsim.*`），素材为新拉取的 EMVCo 公开规范（见 [`web-docs/SOURCES.md`](./web-docs/SOURCES.md) A 组）。
- **将根目录平铺的 33 篇内容文档按 README 章节重组为分类子目录**：`01-基础概念/`、`02-fime测试工具/`、`03-各卡组织L3认证/`、`04-visa专题/`、`05-mastercard专题/`、`06-报文层/`、`07-实测案例/`；根目录仅保留 `README.md`/`index.md`/`CLAUDE.md` 与站点工程文件。`assets/`、`web-docs/`、`public/` 维持原位。
- 文档间 210 处相对链接、README/SOURCES 链接、VitePress `nav`/`sidebar`/`index.md` 共 66 处路由链接随之改写。
- 核查：脚本扫描 **278 处本地链接全部有效**；`vitepress build` **零死链通过**（`web-docs` 档案链接经 `ignoreDeadLinks` 跳过）。

| 检查项 | 结果 |
|--------|------|
| 内部链接（重组后全部 .md 交叉链 + 图片 + web-docs 档案链） | ✅ 278 链接全有效（脚本）+ VitePress build 零死链 |
| README 文档覆盖 | ✅ 全部 tracked 文档已索引，无孤儿 |
| VitePress 站点（nav/sidebar/index 路由 + GitHub Pages） | ✅ 路由全部指向新路径，构建通过 |

---

### 历史核查（2026-06-17 复核）
2026-06-15 全库系统通读后，2026-06-17 新增三篇（DE55 逐标签实现清单 / APDU-TLV 实测走读 / JCB TCI 用例编号），并对新文档做链接与不变量复核，结论：

| 检查项 | 结果 |
|--------|------|
| 内部链接（含新增 3 篇的全部 .md 交叉链与锚点） | ✅ 全部有效，零失效（脚本扫描） |
| README 文档覆盖 | ✅ 全部 tracked 文档已索引，无孤儿（未跟踪的 Chat.md/Help.md 等临时文件不计） |
| ADVT/CDET 弃用日期（2022-07-16） | ✅ 多处一致 |
| 用例数（ADVT 29=22+7、CDET 17=13+4） | ✅ 跨文档一致 |
| Visa RID（A000000003）/ 内核编号（K2=MC、K3=Visa、K6=Discover） | ✅ 全库一致 |
| UPI RID/AID（A000000333 + PIX 01..08） | ✅ 4 篇文档一致 |
| JCB RID（A000000065） | ✅ 与 AID/CAPK 参考表、终端配置一致 |
| `9F53` 标签复用（通用 TCC vs JCB TIP） | ✅ DE55 实现篇与 JCB 用例篇交叉标注一致 |
| 术语 M-TIP / D-PAS | ✅ 自洽（裸写 MTIP 仅见于参考号格式） |

**2026-06-17（二次新增 · 报文外层篇 + 实测失败案例）**：
- 新增 [ISO 8583 报文域全景与 POS 录入方式（DE22）/ 技术回退](./06-报文层/ISO8583-报文域全景与POS录入方式.md)，补齐 DE55 **之外**的报文层：MTI/Bitmap/DE 结构、L3 关键域速查、**DE22 录入方式码值（05 芯片 / 07 非接 / 80 回退 / 90 磁条 / 91 非接磁条）**、技术回退触发链与报文形态、Track 服务码自洽。
- 收录首个**实测失败案例**：FIME BTT 抓取的 `M-TIP02.Test.01.Scenario.01`（技术回退），终端误送 **DE22=90 应为 80**，逐字段拆解 + 根因（fallback 录入方式映射 bug）+ 修复 + 重测；截图存 `assets/mc-case-1-M-TIP02技术回退.png`（测试卡 BIN，非真实 PII）。
- 新增 `assets/` 目录用于存放实测截图。

**2026-06-17 新增**：
- DE55 由单篇拆为【框架篇】+【实现篇】，实现篇以 Cardnow POS Spec V2.13 的 Appendix C 为底本，给出每个标签 ID/Len/Data 字节拆分与定长约束。
- 新增 APDU/TLV 字节级走读（合成示例），把 PPSE→GPO→GENERATE AC 全流程与 DE55 打包打通。
- JCB TCI 补用例分组与编号体系结构（精确编号仍待测试包）；同步标注 `9F53` 在通用/JCB 下的标签复用冲突。

**2026-06-15 本轮修正**：
- UPI AID 表补 `…0108`（Common AID，仅美国），并将 `…0106` 从「电子现金/QuickPass」更正为「ECash 电子现金（仅港澳）」——QuickPass 是闪付品牌，非 ECash 产品名。
- UPI 测试 CAPK 索引由「随测试包」具体化为实测 `08/09/0B`（见 [AID 与 CAPK 全卡组织参考表](./01-基础概念/AID与CAPK全卡组织参考表.md)），并交叉链接 UPI QuickPass 文档。
- 全库「无 PDF 提取工具」说明已更正（本机已装 `pdftotext`/`textutil`）。

**历史修正（保留）**：通用"三大非接限额"与 Mastercard"四大限额"补加交叉说明（[接触与非接 CVM 详解](./01-基础概念/接触与非接CVM详解.md)）。

**已核查为非冲突（保留）**：
- AEIPS 版本 6.4 与 4.5/6.4 —— 终端工具支持 vs 卡型式批准，语境不同，不矛盾。
- `D-PAS`（规范名）与 `DPAS L3`（程序简称）—— 业界两种写法并存，各文档用法自洽。

> 说明：本机已安装 `pdftotext`（Poppler），文本型 PDF 可直接抽取（`.docx` 用 `textutil`）；少数图片型 PDF（如 Worldpay 密钥表）仅页眉可抽取。部分细节源自较早版本文档（如 TSE 2015、ADVT v6.1.1、CDET v2.3），框架准确，精确编号请以各卡组织门户最新版为准。
