# Visa CDET 非接测试用例细分

> 接续 [MC-TSE 配置项与 Visa L3 测试用例](./MC-TSE配置项与Visa-L3测试用例.md)，本文聚焦 CDET（Contactless Device Evaluation Toolkit）非接用例的逐张测试卡细分。
> 数据基于 CDET User Guide v2.3（17 个用例）。注：2022-07-16 起 CDET 已并入 Visa Global L3 Test Set，但其测试卡/场景体系延续，卡镜像以 EMVCo L3 标准 XML 提供。

---

## 一、CDET 是什么

**CDET** 面向实施非接芯片计划的 Visa 收单方/代理，用于测试受理设备的 **Visa payWave / NFC** 接受能力。除验证全球非接受理外，还检验 **用户界面**——提示语、错误消息、应用选择菜单、PIN 输入提示是否正确呈现。

## 二、关键前置概念

### 2.1 两条非接路径（Reader 必须支持其一或全部）

| 路径 | 说明 | 在线/离线 |
|------|------|-----------|
| **MSD**（Magnetic Stripe Data，磁条数据，1.4.2 / 2.x） | 非接"刷卡"模拟磁条 | **仅在线** |
| **qVSDC**（quick Visa Smart Debit/Credit） | 非接芯片 | 可离线 和/或 在线 |
| **VSDC** | （接触芯片场景，双界面卡涉及） | —— |

> 大多数 CDET 测试卡是 **非接芯片（qVSDC）**，仅极少数支持 **非接刷卡（MSD）** 配置。

### 2.2 payWave 仅支持的 CVM

Visa payWave 仅允许：**Online PIN、CDCVM、Signature**（无离线 PIN）。

### 2.3 ODA 类型

- **fDDA**（fast DDA，快速动态数据认证）—— 非接主力离线认证。
- **SDA**（静态）—— 仅个别 Transit（交通）用例使用。

### 2.4 CA 测试公钥

测试期间需加载 Visa CA 测试公钥 **1408 位 与 1536 位** 两种长度。

### 2.5 Reader 配置前提

配置须尽量贴近真实运营：加载 Visa AID、正确的终端国家代码、日期/时间、非接地板限额（Reader Contactless Floor Limit）；离线测试需 ODA 能力。
支持设备：POS、ATM、MPOS、交通终端。

---

## 三、17 个 CDET 测试用例逐卡细分（v2.3）

**13 个强制 + 4 个条件性（TC 7、8、12、13）**

| TC# | 名称 | 路径/Profile | 在线/离线 | CA密钥 | ODA | 验证重点 |
|-----|------|-------------|-----------|--------|-----|----------|
| 1 | VCPS 2.0.2 Baseline | MSD(dCVV/CVN17)、qVSDC(CVN17)、VSDC | 两者 | 1408 | fDDA | 旧版非接互操作基线 |
| 2 | VCPS 2.2 Baseline | qVSDC(CVN22)、VSDC | 两者 | 1408 | fDDA | CVN='22' 及非接手工取现交易 |
| 3 | 16-byte ADF Name | MSD、qVSDC、VSDC | 两者 | 1408 | fDDA | 非标 ADF、TTQ、缺失 PSN |
| 4 | Multi-app w/ GPO Data | MSD(CVN17)、qVSDC(CVN10)、VSDC | 两者 | 1408 | fDDA | 多应用、无持卡人姓名 |
| 5 | Select PPSE Data | MSD(dCVV)、qVSDC(CVN17)、VSDC | 两者 | 1408 | fDDA | 扩展选择、MSD AIP 问题 |
| 6 | qVSDC 19-digit PAN | qVSDC(CVN18)、VSDC | 两者 | 1408 | fDDA | 非标 PAN 长度 |
| **7** | Electron AID Online-only | MSD、qVSDC(CVN10)、VSDC | 仅在线 | 1408 | 无 | **Electron AID 支持（条件性）** |
| **8** | Interlink AID Online-only | MSD、qVSDC(CVN10)、VSDC | 仅在线 | 1408 | 无 | **Interlink AID 支持（条件性）** |
| 9 | VMPA w/ Padding | MSD(dCVV)、qVSDC(CVN10) | 仅在线 | N/A | 无 | VMPA applet 兼容性 |
| 10 | 23-byte IAD/CVN77 | MSD(dCVV)、qVSDC(CVN77)、VSDC | 仅在线 | 1408 | fDDA | 非标 CVN 处理 |
| 11 | VMPA Pre-tap | VMPA(dCVV)、qVSDC(CVN10) | 两者 | N/A | 无 | **Pre-tap 场景**（CDCVM） |
| **12** | CTQ Switch to Contact | MSD、qVSDC(CVN10)、VSDC | 仅离线 | 1408 | fDDA | **ODA 失败回退至接触（条件性）** |
| **13** | Card Declines | MSD、qVSDC(CVN10)、VSDC | 仅离线 | 1408 | fDDA | **卡拒绝且不重试接触（条件性）** |
| 14 | Inconsistent Data | MSD、qVSDC(CVN10)、VSDC | 仅离线 | 1408 | fDDA | 数据校验后终止交易 |
| 15 | qVSDC Online Transit SDA | qVSDC(CVN10) | 仅在线 | 1408 | **SDA** | Transit SDA ODA 认证 |
| 16 | 1536-bit CA Key Online | qVSDC(CVN10) | 仅在线 | **1536** | SDA | 更大密钥长度支持 |
| 17 | qVSDC Online Transit SDA Fail | qVSDC(CVN10) | 仅在线 | 1408 | SDA(失败) | 失败 ODA 的处理 |

> 双界面相关：TC 12-14 涉及接触界面（ODA 失败回退接触等场景）。

---

## 四、按场景归类理解

| 场景类别 | 涉及用例 | 要点 |
|----------|----------|------|
| **基线互操作** | TC 1、2 | VCPS 2.0.2 / 2.2 不同 CVN 版本兼容 |
| **数据/格式健壮性** | TC 3、5、6、10 | 非标 ADF、PAN 长度、CVN77、PPSE 数据 |
| **多应用与 AID** | TC 4、7、8 | 多应用选择、Electron / Interlink 专有 AID（条件性） |
| **CDCVM / 移动** | TC 9、11 | VMPA applet、Pre-tap 场景 |
| **离线异常与回退** | TC 12、13、14 | CTQ 切换接触、卡拒绝、数据不一致终止 |
| **交通 Transit + SDA** | TC 15、16、17 | Transit SDA 认证、1536 位密钥、SDA 失败处理 |

---

## 五、CDET vs ADVT 对照

| 维度 | ADVT（接触） | CDET（非接） |
|------|-------------|--------------|
| 用例总数 | 29（22 强制 + 7 条件） | 17（13 强制 + 4 条件：TC7/8/12/13） |
| 主认证 | SDA/DDA/**CDA** | **fDDA**（个别 SDA 用于 Transit） |
| CVM | 含离线 PIN | **仅 Online PIN / CDCVM / Signature**（无离线 PIN） |
| MSD | —— | MSD 仅在线 |
| 专有 AID | Plus/Interlink/Electron | Electron(TC7)/Interlink(TC8) |
| 额外校验 | —— | **UI 提示/菜单/错误消息** |
| 密钥长度 | 含 1144/1984 位 | 1408 / 1536 位 |

---

## 六、实操要点

- **MSD 正在退场**：MSD 为仅在线的非接刷卡模拟，全球范围逐步弃用；新部署重心在 qVSDC。CDET 中仅个别卡支持 MSD profile。
- **条件性用例取决于 AID/能力**：是否跑 TC7/8 看终端是否支持 Electron/Interlink；TC12/13 取决于离线/回退能力。
- **Transit（交通）是特殊子域**：TC15-17 专门验证交通场景的 SDA 认证（含失败处理）——交通终端必测。
- **UI 验证是 CDET 独有价值**：除交易正确性，还检查提示语/菜单/PIN 输入界面，这是接触 ADVT 不强调的。
- **CVN 版本是关键变量**：CVN10/17/18/22/77 对应不同密文/IAD 格式，是数据健壮性测试的核心维度。

---

**参考来源：**
- [CDET User Guide v2.3 — PDFCoffee](https://pdfcoffee.com/cdet-user-guide-v2-3-pdf-free.html)
- [VISA CDET 2.3 User Guide — Studocu](https://www.studocu.com/row/document/philadelphia-university-jordan/accounting/visa-cdet-23-revision-b-cards/20873709)
- [CDET Test Card Summary — Scribd](https://www.scribd.com/document/405922181/CDET-Test-Card-Summary-1-pdf)
- [Visa Contactless Test Cases — Scribd](https://www.scribd.com/document/561681120/visa-contactless-test-cases)
- [Visa Smart Debit/Credit & payWave US Acquirer Implementation Guide](https://usa.visa.com/dam/VCOM/regional/na/us/partner-with-us/documents/visa-smart-debit-credit-vsdc-visa-paywave-vpw-us-acquirer-implementation-guide.pdf)
- [Visa U.S. EMV Chip Terminal Testing Requirements v2.1](https://usa.visa.com/dam/VCOM/regional/na/us/run-your-business/documents/emv-chip-terminal-testing-feb2019.pdf)
