# JCB 与 UnionPay（银联）L3 认证深度解析（区分国际/国内）

> 完成六大卡组织最后两家。**银联尤其需要区分"国内（中国，PBOC 体系）"与"国际（UnionPay International / UPI）"**——这是两套不同的标准与认证机构。
> 关联：[各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md) · [Amex 与 Discover L3 认证深度解析](./Amex与Discover-L3认证深度解析.md)

---

# 一、JCB L3 认证

## 1.1 TCI（Terminal Check for Implementation）

- **TCI** 是 JCB 的 L3 终端检查程序：**JCB 收单方在 JCB 商户部署 IC 终端前必须完成**。
- 定位：JCB 自有的**终端验证/质量保证（QA）服务**，避免互操作问题，保护收单方/商户/持卡人。
- 由 **JCB International** 统一运营与认可测试工具。

## 1.2 接触 vs 非接

| 程序 | 界面 | 对应产品 |
|------|------|----------|
| **TCI** | 接触 | **J/Smart**（JCB 接触 EMV） |
| **TCI-CL** | 非接 | **J/Speedy**（JCB 非接） |

- JCB International 对 **TCI 接触与非接** 分别认可测试工具。
- 覆盖终端：传统 POS、**Tap on Mobile（ToM）**、**Transit（交通）**。
- JCB Contactless 规范有版本演进（如 **1.6** 等）。

## 1.3 国际 vs 国内（日本）

- JCB 源自日本，**全球由 JCB International 运营 TCI**；日本本土与国际**基本沿用同一套 JCB 规范与 TCI 程序**（不像银联有独立国内标准体系）。
- 市场分布：日本、中国、南亚、韩国、中东，并扩展至北美、欧洲、非洲。
- 非接需申请 **JCB Contactless IC Terminal Type Approval** 初始文档（向 JCB 提交所需信息，通常 3 个工作日内响应）。

## 1.4 前提

- 终端须已通过 **EMVCo L1/L2**。
- JCB 另发布自有 JCB Contactless（L2）IC 终端规范。

---

# 二、UnionPay（银联）L3 认证 —— 国内 vs 国际两套体系

> ⚠️ **核心区分**：银联存在**两套并行体系**。"国内"受中国人民银行（PBOC）监管、用国密算法、由银联/BCTC 认证；"国际"由 UnionPay International（UPI）运营、对齐 EMVCo、用 RSA。

## 2.1 国内（中国）体系

| 维度 | 内容 |
|------|------|
| **标准** | **PBOC 规范**（中国金融集成电路卡规范）：**PBOC 2.0 / 3.0** |
| **卡规范** | **UICS**（UnionPay IC Card Spec，对齐 EMV 但含银联/PBOC 扩展） |
| **密码算法** | **国密 SM 系列（SM2/SM3/SM4）** —— 国内强制，区别于国际 RSA |
| **非接产品** | **QuickPass（闪付）** |
| **监管/认证** | 中国人民银行（PBOC）监管；**China UnionPay（CUP）/ BCTC（银行卡检测中心 / 国家金融科技测评中心）** 执行检测认证 |
| **BCTC** | 经 PBOC、EMVCo、UnionPay、Mastercard 认可，亦为 PCI 认可实验室 |

> 国内体系的特殊性：**国密算法**与 PBOC 监管是关键差异点；认证走银联/BCTC 的国内门户（cert.unionpay.com）。

## 2.2 国际（UnionPay International / UPI）体系

| 维度 | 内容 |
|------|------|
| **标准** | **UICS**（国际版，银联已加入 EMVCo，与 EMV 标准互通） |
| **密码算法** | 主用 **RSA**（EMV 体系） |
| **L3 测试** | **UAC（UnionPay contact IC card，接触）** + **QuickPass（非接）** |
| **测试计划** | **Integration（集成）+ Functional（功能）** 两类均需完成 |
| **测试卡** | QuickPass Test Card Set = **7 张双界面卡**（UICS Credit + Debit 混合，不同 PAN）；非接限额 300 |
| **工具** | UPI 认可的 EMVCo L3 工具：**FIME Savvi**、Payhuddle Tecto、ICC Solutions QuickPass Test Suite 等 |
| **认证** | 经 UPI 认可实验室/服务商；BCTC 亦提供 UPI 测试服务（如交通终端、二维码识别） |

## 2.3 国内 vs 国际 对照

| 维度 | 国内（PBOC） | 国际（UPI） |
|------|--------------|-------------|
| 主管 | 中国人民银行（PBOC） | UnionPay International |
| 标准 | PBOC 2.0/3.0 + UICS | UICS（对齐 EMVCo） |
| 密码 | **国密 SM2/SM3/SM4** | **RSA**（EMV） |
| L3 程序 | 国内终端检测（银联/BCTC） | **UAC + QuickPass（Integration + Functional）** |
| 认证机构 | CUP / BCTC | UPI 认可实验室/服务商 |
| 门户 | cert.unionpay.com（国内） | UPI 认证门户（国际） |

> 实务提醒：**面向中国大陆受理 → 走国内 PBOC/银联体系（国密）；面向境外受理银联卡 → 走 UPI 国际体系（RSA + UAC/QuickPass）。** 两者不可互相替代。

---

# 三、六大卡组织 L3 程序总表（完整版）

| 卡组织 | L3 程序 | 接触 | 非接 | 提交/产出 |
|--------|---------|------|------|-----------|
| **Visa** | Global L3 Test Set（原 ADVT/CDET） | ADVT 范畴 | CDET 范畴(+qVSDC DM) | **CCRT** 自助上报 |
| **Mastercard** | M-TIP | ✅ | ✅(需 VPLA) | **TSE 文件 → 服务商签 LoA** |
| **American Express** | Global test plan | AEIPS | Expresspay | 代表评审 + 工具测试 → LoA |
| **Discover/Diners/PULSE** | D-PAS E2E | ✅ | ✅(+ZIP) | 认证 E2E 服务商 → 正式验证 |
| **JCB** | TCI | TCI（J/Smart） | TCI-CL（J/Speedy） | JCB International 验证 |
| **UnionPay 国际** | 终端集成 | **UAC** | **QuickPass** | Integration+Functional → UPI |
| **UnionPay 国内** | PBOC 终端检测 | UICS（国密） | QuickPass（国密） | CUP/BCTC 检测认证 |

---

## 四、实操与测试要点

- **JCB TCI 是"品牌自有 QA"**：与 EMVCo L1/L2 解耦,部署前强制;接触 J/Smart、非接 J/Speedy 分别测,非接还需 Type Approval。
- **银联务必先分清国内/国际**:这是本篇最关键提醒。国密 SM 算法是国内体系的硬性差异,国际走 RSA。
- **银联国际两类计划都要跑**:UAC（接触）与 QuickPass（非接）各需 **Integration + Functional**,缺一不可。
- **QuickPass 7 张测试卡**:双界面 UICS Credit/Debit,覆盖功能/离线/在线,非接限额 300。
- **BCTC 双重角色**:既做国内 PBOC 检测,也承接 UPI 国际测试服务——同一机构、两套体系。
- **工具一致性**:FIME BTT/Savvi、Payhuddle Tecto 等多被 JCB International 与 UPI 同时认可,可一套工具覆盖多品牌。

---

**参考来源：**
- [About IC Terminals（JCB TCI / TCI-CL）— JCB Global](https://www.global.jcb/en/products/security/icterminals/index.html)
- [JCB Terminal Check for Implementation — iso8583.info](https://iso8583.info/lib/JCB/tests/TCI/)
- [Tecto qualified for UnionPay & JCB International — Payhuddle](https://www.payhuddle.com/news/tecto-qualified-for-unionpay-jcb-international)
- [IC Card — UnionPay International](https://www.unionpayintl.com/en/servicesProducts/products/innovativeProducts/iCCard/)
- [UPI QuickPass Testing Guide for Acquirers (V201905)](https://www.scribd.com/document/673390740/UPI-QuickPass-Testing-Guide-for-Acquirers-V201905)
- [China Financial IC Card Specification (PBOC 3.0)](https://www.icoilne.com/blog/china-financial-integrated-circuit-ic-card-specification-pboc3-0-71090.html)
- [BCTC / National FinTech Evaluation Center](https://en.bctest.com/)
- [认证门户 — 中国银联](https://cert.unionpay.com/cert-portal/authenticate/empower/index.html)
- [FIME's Savvi Test Tools: UnionPay Integration Support](https://www.globalbankingandfinance.com/fime-supports-acquirers-globally-to-achieve-unionpay-certification)
