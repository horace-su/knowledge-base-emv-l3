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
- 关键层级：L1 物理层 → L2 内核/应用 → **L3 端到端集成**（各卡组织自定义，EMVCo 仅认证框架/工具）

### 一·五、L3 主机侧：报文与联机授权
- [ISO 8583 与 Field 55 报文层](./ISO8583与Field55报文层.md) —— MTI/位图/关键 DE、Field 55(DE55) 承载的 EMV TLV 清单(请求 vs 响应)、主机侧 L3 校验点
- [ARQC / ARPC 联机授权](./ARQC-ARPC联机授权.md) —— 两次 GENERATE AC、ARQC 生成→发卡行验证→ARPC 回写→发卡行认证、CVN、发卡行脚本(71/72) 时序

### 二、FIME 测试工具
- [FIME L3 测试工具深度解析](./FIME-L3测试工具深度解析.md) —— 10 个工具总览（ASTREX / BTT / STP / Card Simulator / Card Spy / SmartSpy+ / EMV PVT 等）
- [FIME-BTT 品牌测试工具深度解析](./FIME-BTT-品牌测试工具深度解析.md) —— 旗舰 L3 产品 BTT 的能力、卡组织覆盖、软硬件组成

### 三、各卡组织 L3 认证要求
- [各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md) —— Visa / Mastercard / Amex / Discover / JCB / 银联 对照总表
- [Visa 与 Mastercard L3 认证深度解析](./Visa与Mastercard-L3认证深度解析.md) —— 两大组织流程、工具、提交机制对比
- [Amex 与 Discover L3 认证深度解析](./Amex与Discover-L3认证深度解析.md) —— AEIPS/Expresspay(AFD/Transit/Fleet) + D-PAS E2E(ZIP/Fallback/Cross Testing)
- [JCB 与银联 L3 认证深度解析](./JCB与银联-L3认证深度解析.md) —— JCB TCI/TCI-CL(J/Smart·J/Speedy) + 银联国内(PBOC/国密)vs 国际(UPI·UAC/QuickPass)
- [银联国内：PBOC 3.0 与国密算法](./银联国内-PBOC3.0与国密算法.md) —— PBOC 2.0/3.0 沿革、SM2/SM3/SM4、DF69 算法切换、qPBOC、BCTC 认证

### 四、Visa 专题
- [Visa-Global-L3-Test-Set 与 qVSDC-DM](./Visa-Global-L3-Test-Set与qVSDC-DM.md) —— 2022 年取代 ADVT/CDET 的标准测试集 + 条件性工具 qVSDC DM
- [Visa-CDET 非接测试用例细分](./Visa-CDET非接测试用例细分.md) —— CDET 17 个非接用例逐卡细分
- [Visa TTQ/CTQ 与 CDCVM Token 化指示](./Visa-TTQ-CTQ与CDCVM-Token化指示.md) —— TTQ(9F66)/CTQ(9F6C) 位级解析 + Apple Pay/Google Pay 的 CDCVM 指示机制
- [MC-TSE 配置项与 Visa-L3 测试用例](./MC-TSE配置项与Visa-L3测试用例.md) —— ADVT 接触 29 用例清单 + TSE 配置项概览

### 五、Mastercard 专题
- [M-TIP TSE 配置详解](./M-TIP-TSE配置详解.md) —— TSE 操作流程、问卷结构、动态裁剪、结果判定层级
- [M-TIP TSE 问卷与终端配置参数](./M-TIP-TSE问卷与终端配置参数.md) —— 问卷字段→EMV 对象映射（9F35/9F33/9F40）、动态裁剪逻辑、终端配置参数位级详解
- [Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md) —— Kernel 2 四大限额 + CVM Capability + On-device CVM；FFI(9F6E) 品牌差异与位级

### 六、原始来源文档
- [`web-docs/`](./web-docs/) —— 会话中从 web 拉取的原始 PDF（来源清单见 [`web-docs/SOURCES.md`](./web-docs/SOURCES.md)）

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
- JCB TCI / 银联 QuickPass 的逐用例清单（需各卡组织测试包，公开资料有限）
- 实测抓包：用 Card Spy / SmartSpy+ 解读真实交易 APDU 与 TLV
- ~~报文层：ISO 8583 域、字段 55（EMV TLV 数据）在 L3 主机测试中的校验~~ ✅ 已补（见上「一·五」两篇）

## 一致性核查（2026-06-13 通读）
全库已做一次系统通读，结论：

| 检查项 | 结果 |
|--------|------|
| 内部 .md 链接（README 索引 22 篇 + web-docs/SOURCES.md） | ✅ 全部有效，零失效 |
| README 文档覆盖 | ✅ 22 篇全部已索引，无孤儿 |
| web-docs 原始 PDF | ⚠️ 已恢复为来源清单（`web-docs/SOURCES.md`）；原始 PDF 为会话临时下载、未入库，正文中"本地副本"标注仅供回溯，对应**公开 URL 有效** |
| ADVT/CDET 弃用日期（2022-07-16） | ✅ 4 处一致 |
| 用例数（ADVT 29=22+7、CDET 17=13+4） | ✅ 跨文档一致 |
| Visa RID（A000000003）/ 内核编号（K2=MC、K3=Visa、K6=Discover） | ✅ 全库一致（含新增 [Kernel Deep Dive](./emv-contactless-kernel-deep-dive.md) K1–K7 表） |
| 术语 M-TIP / D-PAS | ✅ 自洽（裸写 MTIP 仅见于参考号格式） |
| 新增主机侧两篇（[ISO 8583/Field 55](./ISO8583与Field55报文层.md)、[ARQC/ARPC](./ARQC-ARPC联机授权.md)） | ✅ 已接入 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md)「转联机」出口，互链一致 |

**已修正**：通用"三大非接限额"与 Mastercard"四大限额"之间补加交叉说明（[接触与非接 CVM 详解](./接触与非接CVM详解.md)），指明 MC 将交易限额拆为 On-device/No-On-device，Visa 走单一 CVM 限额。

**已核查为非冲突（保留）**：
- AEIPS 版本 6.4 与 4.5/6.4 —— 终端工具支持 vs 卡型式批准，语境不同，不矛盾。
- `D-PAS`（规范名）与 `DPAS L3`（程序简称）—— 业界两种写法并存，各文档用法自洽。

> 说明：本机无 PDF 提取工具（pdftotext/mutool/python-pdf 均缺），web-docs 中 PDF 仅作存档，内容主要靠 web 检索 + HTML 版获取。部分细节源自较早版本文档（如 TSE 2015、ADVT v6.1.1、CDET v2.3），框架准确，精确编号请以各卡组织门户最新版为准。
