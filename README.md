# EMV L3 知识库

围绕 **EMV Level 3（终端集成/部署）测试与认证** 的中文知识库，覆盖 FIME 测试工具、各国际卡组织的 L3 认证程序及其测试用例与配置细节。

## 目录导航

### 一、基础概念
- [EMV Contactless Kernel Deep Dive](./emv-contactless-kernel-deep-dive.md) —— 非接内核（Kernel 2/3/6…）与支付品牌映射
- [接触与非接 CVM 详解](./接触与非接CVM详解.md) —— CVM List(8E)、CVM Results(9F34)、非接三大限额、CDCVM、Visa/MC 内核差异
- [终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md) —— AID(RID+PIX)/应用选择/部分匹配/TAC；CAPK(RID+Index)/ODA 证书链/测试vs生产密钥
- [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md) —— 全卡组织 AID 速查 + 生产/测试 CAPK 索引表（明确标记 测试 vs 真实）
- [TAC / IAC / TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md) —— TVR(95) 位含义、Denial/Online/Default 判定、AAC/ARQC/TC、两次 GENERATE AC
- [ODA 证书链字节级](./ODA证书链字节级.md) —— CAPK→Issuer(90)→ICC(9F46) 恢复格式、SDA/DDA/CDA、失败点→TVR
- [EMVCo Kernel 2 V2.11 规范要点](./EMVCo-Kernel2-V2.11规范要点.md) —— Mastercard 非接内核：进程模型、Data Exchange(ACT/DET/DEK/OUT)、Outcome、Data Record、四大限额、RRP、v2.11 变更
- [终端配置：各内核数据元参考（D-PAS L2）](./终端配置-各内核数据元参考-DPAS-L2.md) —— 跨内核(EMV/Visa/MC/银联/Amex/Discover/JCB/MIR…)的标准+专有(DF81xx)配置标签速查
- 关键层级：L1 物理层 → L2 内核/应用 → **L3 端到端集成**（各卡组织自定义，EMVCo 仅认证框架/工具）

### 二、FIME 测试工具
- [FIME L3 测试工具深度解析](./FIME-L3测试工具深度解析.md) —— 10 个工具总览（ASTREX / BTT / STP / Card Simulator / Card Spy / SmartSpy+ / EMV PVT 等）
- [FIME-BTT 品牌测试工具深度解析](./FIME-BTT-品牌测试工具深度解析.md) —— 旗舰 L3 产品 BTT 的能力、卡组织覆盖、软硬件组成
- [FIME BTT `.tpp` 项目文件格式与各卡组织 L3 测试计划](./FIME-BTT-TPP项目文件与L3测试计划.md) —— `.tpp`(ZIP) 工程包结构 + Amex/Discover/Mastercard/Visa 真实测试计划名/版本/用例编号体系（BTT 5.8.0）

### 三、各卡组织 L3 认证要求
- [各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md) —— Visa / Mastercard / Amex / Discover / JCB / 银联 对照总表
- [Visa 与 Mastercard L3 认证深度解析](./Visa与Mastercard-L3认证深度解析.md) —— 两大组织流程、工具、提交机制对比
- [Amex 与 Discover L3 认证深度解析](./Amex与Discover-L3认证深度解析.md) —— AEIPS/Expresspay(AFD/Transit/Fleet) + D-PAS E2E(ZIP/Fallback/Cross Testing)
- [JCB 与银联 L3 认证深度解析](./JCB与银联-L3认证深度解析.md) —— JCB TCI/TCI-CL(J/Smart·J/Speedy) + 银联国内(PBOC/国密)vs 国际(UPI·UAC/QuickPass)
- [JCB TCI 测试用例分组与编号体系](./JCB-TCI测试用例与编号体系.md) —— TCI(J/Smart)/TCI-CL(J/Speedy) 用例分组(应用选择/ODA/CVM/联机/脚本)、编号体系结构、JCB 专有数据元(9F53 TIP)；精确编号需 JCB 测试包核对
- [银联国内：PBOC 3.0 与国密算法](./银联国内-PBOC3.0与国密算法.md) —— PBOC 2.0/3.0 沿革、SM2/SM3/SM4、DF69 算法切换、qPBOC、BCTC 认证
- [银联国际 QuickPass L3 配置与 HK/SG 特殊 CVM](./银联国际-QuickPass-L3配置与HK-SG特殊CVM.md) —— UPI AID/测试 CAPK/TAC/9F66(TTQ) 配置 + 港(344)新(702)非接借记/贷记特殊 CVM 规则

### 三之二、实测案例
- [L3 认证实例：Sunmi T6F10 终端配置剖析](./L3认证实例-Sunmi-T6F10终端配置剖析.md) —— 同一终端在 Amex/Discover/Mastercard 三程序下的真实 L3 报告：L1/L2 LoA 链、各接口 TAC/9F33/9F1D、CVM 限额、多 AID 取舍（PII 已剥离）

### 四、Visa 专题
- [Visa-Global-L3-Test-Set 与 qVSDC-DM](./Visa-Global-L3-Test-Set与qVSDC-DM.md) —— 2022 年取代 ADVT/CDET 的标准测试集 + 条件性工具 qVSDC DM
- [Visa-CDET 非接测试用例细分](./Visa-CDET非接测试用例细分.md) —— CDET 17 个非接用例逐卡细分
- [Visa TTQ/CTQ 与 CDCVM Token 化指示](./Visa-TTQ-CTQ与CDCVM-Token化指示.md) —— TTQ(9F66)/CTQ(9F6C) 位级解析 + Apple Pay/Google Pay 的 CDCVM 指示机制
- [MC-TSE 配置项与 Visa-L3 测试用例](./MC-TSE配置项与Visa-L3测试用例.md) —— ADVT 接触 29 用例清单 + TSE 配置项概览

### 五、Mastercard 专题
- [M-TIP TSE 配置详解](./M-TIP-TSE配置详解.md) —— TSE 操作流程、问卷结构、动态裁剪、结果判定层级
- [M-TIP TSE 问卷与终端配置参数](./M-TIP-TSE问卷与终端配置参数.md) —— 问卷字段→EMV 对象映射（9F35/9F33/9F40）、动态裁剪逻辑、终端配置参数位级详解
- [Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md) —— Kernel 2 四大限额 + CVM Capability + On-device CVM；FFI(9F6E) 品牌差异与位级

### 五之二、报文层（主机侧）
- [ISO 8583 字段 55（DE55）与各卡组织 EMV 数据要求](./ISO8583-字段55-跨卡组织要求.md) —— DE55 的来源(内核 Data Record)、通用必备 EMV 标签、Visa/MC/Amex/Discover/JCB/银联 的 DE55 差异、L3 主机测试关注点【框架篇】
- [DE55 逐标签实现清单（字节级）](./ISO8583-DE55-逐标签实现清单.md) —— 以真实收单主机(Cardnow V2.13)Appendix C 为底本，逐标签 ID/长度/数据字节拆分 + 必选随交易路径变化 + 9F53/9F6E 标签复用陷阱【实现篇】
- [APDU/TLV 实测交易流程解读（字节级走读）](./APDU-TLV实测交易流程解读.md) —— 一笔非接交易 PPSE→SELECT→GPO→READ RECORD→GENERATE AC 的逐条 C/R-APDU 与关键 TLV 字节解析，汇成 DE55（合成示例，讲解解析方法）
- [收单主机认证（Host Certification）与 L3 重测触发条件](./收单主机认证与L3重测触发条件.md) —— 主机认证 vs 终端 L3 的位置与先后；Mastercard NIV(TAN)/Visa Acquirer Host/Discover D-PAS Online+Clearing/Amex 流程；"改了什么才需要重做 L3" 的变更触发矩阵

### 六、原始来源文档
- [`web-docs/`](./web-docs/) —— 原始来源文件（公开规范 PDF + 项目实测资料；来源清单见 [`web-docs/SOURCES.md`](./web-docs/SOURCES.md)）。⚠️ 实测资料含 PII / 第三方机密，纳入版本控制前请阅读 SOURCES.md 的敏感性提示。

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
- JCB TCI 逐用例**框架与编号体系已补**（见 [JCB TCI 测试用例与编号体系](./JCB-TCI测试用例与编号体系.md)）；**精确用例号/数量**仍需申领 JCB 测试包核对
- 报文层 DE55 **框架篇 + 实现篇（逐标签字节级）已补**（见 [DE55 逐标签实现清单](./ISO8583-DE55-逐标签实现清单.md)）；可再按所对接卡组织主机接口规范逐条复核必选/可选
- 实测抓包**方法与字节级走读已补**（见 [APDU/TLV 实测交易流程解读](./APDU-TLV实测交易流程解读.md)，含合成示例）；下一步可用 Card Spy / SmartSpy+ 把**真实抓包数据**替换示例字节
- 各卡组织 L3 测试计划的逐用例语义（编号体系已补，见 [FIME BTT .tpp 与 L3 测试计划](./FIME-BTT-TPP项目文件与L3测试计划.md)）

## 一致性核查（2026-06-17 复核）
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

**2026-06-17 新增**：
- DE55 由单篇拆为【框架篇】+【实现篇】，实现篇以 Cardnow POS Spec V2.13 的 Appendix C 为底本，给出每个标签 ID/Len/Data 字节拆分与定长约束。
- 新增 APDU/TLV 字节级走读（合成示例），把 PPSE→GPO→GENERATE AC 全流程与 DE55 打包打通。
- JCB TCI 补用例分组与编号体系结构（精确编号仍待测试包）；同步标注 `9F53` 在通用/JCB 下的标签复用冲突。

**2026-06-15 本轮修正**：
- UPI AID 表补 `…0108`（Common AID，仅美国），并将 `…0106` 从「电子现金/QuickPass」更正为「ECash 电子现金（仅港澳）」——QuickPass 是闪付品牌，非 ECash 产品名。
- UPI 测试 CAPK 索引由「随测试包」具体化为实测 `08/09/0B`（见 [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md)），并交叉链接 UPI QuickPass 文档。
- 全库「无 PDF 提取工具」说明已更正（本机已装 `pdftotext`/`textutil`）。

**历史修正（保留）**：通用"三大非接限额"与 Mastercard"四大限额"补加交叉说明（[接触与非接 CVM 详解](./接触与非接CVM详解.md)）。

**已核查为非冲突（保留）**：
- AEIPS 版本 6.4 与 4.5/6.4 —— 终端工具支持 vs 卡型式批准，语境不同，不矛盾。
- `D-PAS`（规范名）与 `DPAS L3`（程序简称）—— 业界两种写法并存，各文档用法自洽。

> 说明：本机已安装 `pdftotext`（Poppler），文本型 PDF 可直接抽取（`.docx` 用 `textutil`）；少数图片型 PDF（如 Worldpay 密钥表）仅页眉可抽取。部分细节源自较早版本文档（如 TSE 2015、ADVT v6.1.1、CDET v2.3），框架准确，精确编号请以各卡组织门户最新版为准。
