# Mastercard TSE 配置项 与 Visa Global L3 测试用例

> 本文深挖两件实操细节：① Mastercard M-TIP 中 TSE 如何按终端配置裁剪测试计划；② Visa L3 的具体测试用例构成（ADVT 接触 29 例 + CDET 非接）。
> 关联：[Visa 与 Mastercard L3 认证深度解析](../03-各卡组织L3认证/Visa与Mastercard-L3认证深度解析.md)

---

# 一、Mastercard TSE 配置项详解

## 1.1 TSE 的作用回顾

TSE（Test Selection Engine）让收单机构/VAR **描述其终端配置**，据此从 M-TIP Test Set 规则中**裁剪出适用的测试计划**并生成**唯一 M-TIP 参考号**。关键原则：

> TSE 中填写的配置答案**必须与终端的 EMVCo L2 内核能力一致**（Terminal Profile、Reader Capabilities 等）。填错会导致测试计划不匹配，认证失效。

## 1.2 M-TIP 2.0 的项目类型

M-TIP 2.0 的 TSE 支持**单一测试计划认证双界面终端**，提供三种认证项目选项：

| 项目类型 | 说明 |
|----------|------|
| **Contact** | 仅接触式 |
| **Contactless** | 仅非接（需先有 VPLA） |
| **Dual interface** | 双界面，一份测试计划覆盖 |

TSE 还提供 **常见美国终端配置预设列表**，便于快速选型。

## 1.3 主要配置项（TSE 会询问的内容）

| 配置类别 | 具体项 |
|----------|--------|
| **终端基础** | 终端类型（Terminal Type）、操作系统（Android / Linux 等）、内核配置文件（Terminal Profile、Reader Capabilities） |
| **受理界面** | 接触 / 非接 / 双界面 |
| **CVM（持卡人验证）** | No CVM、chip-and-signature（签名）、chip-and-PIN（在线/离线 PIN）、**CDCVM**（设备端 CVM） |
| **非接专项** | **PPSE** 处理（非接 AID 发现与选择）、**CDCVM 与非接 CVM 限额**（验证品牌阈值的免 CVM/强制 CVM 执行） |
| **应用/卡品** | 需加载终端拟支持的全部 **AID**（如 M/Chip、Maestro、Mastercard 非接等）及对应应用版本 |
| **密钥** | 需加载全部 **CAPK（CA 公钥）** |
| **交易能力** | 在线/离线能力、交易类型等 |
| **国家/币种** | 地域与货币配置 |

> 实操要点：**AID + CAPK 的完整加载**是常见疏漏点——终端实际支持的每个 AID 都要在 TSE 配置中声明，否则测试计划与现场行为不符。

## 1.4 输出

- 一份匹配配置的 **M-TIP 测试计划**；
- 一个 **唯一 M-TIP 参考号**（贯穿执行→提交→LoA 全程的追溯主键）。

---

# 二、Visa L3 测试用例构成

> 自 2022-07-16 起统一为 **Global L3 Test Set Files**；其测试内容沿袭 ADVT（接触）与 CDET（非接）两套体系。Visa 现以 **EMVCo L3 Testing Group 定义的标准化 XML 格式** 向 L3 工具厂商提供测试卡镜像（供 EMVCo 认证的卡模拟器使用）。

## 2.1 ADVT（接触）—— 29 个测试用例

每个用例对应一张测试卡（Test Case N ↔ Card N）。**22 个强制 + 7 个条件性**。

### 强制用例（所有设备）

| TC | 名称 | 验证内容 |
|----|------|----------|
| 1 | Basic VSDC | 标准 VSDC 卡常规特性;在线交易须成功完成发卡行认证 |
| 2 | 19-Digit PAN | 接受 19 位 PAN,不打印填充字符 |
| 3 | T=1, DDA, OEP, Issuer Auth | T=1 协议 + DDA + 离线密文 PIN（OEP）+ 发卡行认证 |
| 4* | Terminal Risk Management | 即使卡未请求也执行限额检查（*仅支持时） |
| 5 | Application Selection | 多应用卡（5 个应用）、非 ASCII 首选名、**部分 AID 选择** |
| 6 | Dual Interface | 接触/非接双界面卡、扩展 PDOL、语言偏好 |
| 7 | TACs | 终端行为代码（Terminal Action Code）配置正确性 |
| 9 | "RFU" CVM | 处理无法识别的 CVM |
| 10 | CDA | 联合数据认证（Combined DDA/AC Generation）|
| 11 | Multiple Applications | 双界面卡含未知 AID、被锁应用、非接变体 |
| 12 | Geographic Restrictions | 仅限境内交易的地域限制执行 |
| 13 | Proprietary Data & 6-Digit PIN | 专有标签与非标 PIN 长度 |
| 14 | Long PDOL & Unrecognized Tag | 扩展数据请求 + 未知标签处理 |
| 15 | 2-Byte Length Field | 变长数据元素处理 |
| 16 | Two Apps & Cardholder Confirmation | 特定应用的持卡人确认要求 |
| 17 | Magnetic Stripe Image | 最小 VSDC 数据元素 + 专有密文版本 |
| 18 | T=1 & DDA with 1984 Certificate | T=1 + 更大的发卡行公钥证书（1984 位） |
| 21 | PIN Try Limit Exceeded (1) | 离线 PIN 超限时的 CVM 回退 |
| 22 | PIN Try Limit Exceeded (2) | 无 CVM 回退时超限即拒绝 |
| 23 | Combination CVM & Visa Fleet | 签名+PIN 组合 CVM 与车队卡特性 |
| 24 | PAN with Padded Fs | PAN 填充 F 至最大长度的处理 |
| 25 | No PAN Sequence Number | 缺失 PAN 序列号时的处理 |
| 26 | PAN Sequence Number of 11 | 最大序列号值处理 |
| 28 | Multiple Features | PSE、发卡行 URL、附加应用数据、密文版本 18 |
| 29 | Blocked Card | 拒绝被锁卡 |

### 条件性用例（按终端能力）

| TC | 名称 | 触发条件 |
|----|------|----------|
| 8 | Fallback | 支持磁条回退时;验证芯片失败检测与磁条回退流程 |
| 19 | Plus & Visa Interlink | 支持这些 Visa 专有应用时 |
| 20 | Visa Electron | 支持 Visa Electron 时 |
| 27 | 1144-Bit Issuer Public Key | 支持 **SDA** 时;非标密钥长度处理 |

> 注:TC4、21、22 也带条件性(分别取决于风险管理/离线 PIN 支持)。

### 在线测试组件

TC **1、2、3、13、17、19、24、25、26、28** 含 "ADVT Online Testing":在线/纯在线设备需连接 **VCMS/VMTS** 或认可的测试主机模拟器,完成在线卡认证（Field 44.8 = 2 表示成功）。

### ODA 三种离线数据认证（贯穿多个用例）

- **SDA（静态）**:卡提供 SSAD——发卡行对 PAN/有效期/AIP 等静态数据的签名;最弱,可被克隆。
- **DDA（动态）**:卡用私钥对终端不可预测数（UN）+ 卡数据生成一次性动态签名,终端用卡内 ICC 公钥验证。
- **CDA（联合）**:动态签名与应用密文（AC）生成**联合**,确保密文确实来自合法卡;最强。

## 2.2 CDET（非接）

- **CDET（Contactless Device Evaluation Toolkit）**:验证 Visa payWave / NFC 受理的端到端正确性,覆盖各类非接场景(qVSDC、MSD 等)。
- Visa 以 **EMVCo L3 标准 XML 格式** 提供 CDET 测试卡镜像给 L3 工具厂商,配合 EMVCo 认证卡模拟器使用。
- 另有 **qVSDC DM**(条件性)针对特定 qVSDC 数据管理场景。

---

# 三、对照与实操要点

| 维度 | Mastercard（TSE 驱动） | Visa（测试集驱动） |
|------|------------------------|---------------------|
| 计划生成方式 | TSE 按填写的终端配置**动态裁剪** | 按设备能力**勾选适用用例**（ADVT 29 例 + CDET） |
| 配置一致性要求 | 答案须与 L2 内核能力一致 | 须在 EMVCo 批准终端上跑、用现行内核 |
| 用例-卡对应 | Test Set 规则映射 | **每用例一张测试卡**（TC N ↔ Card N） |
| 卡镜像格式 | —— | **EMVCo L3 标准 XML** 卡镜像 |
| 条件性逻辑 | 接触/非接/双界面项目类型 | 7 个条件用例按能力触发 |

**两个共性陷阱：**
1. **能力声明必须与现场一致**——TSE 填错配置、或 Visa 漏跑某条件用例,都会让认证与真实终端行为脱节。
2. **配置变体全覆盖**——每个硬件/软件/参数变体都要单独跑,是自动化(BTT 自动化模块)的主要价值所在。

---

**参考来源：**
- [Acquirer Device Validation Toolkit (ADVT) User Guide v6.1.1 — 29 测试用例](https://usermanual.wiki/Document/Acquirer20Device20Validation20Toolkit20ADVT20User20Guide2020v6112020Mar202015.1803688168/help)
- [Mastercard Tap on Phone Implementation Guide（M-TIP/TSE 配置参考）](https://www.mastercard.com/content/dam/public/mastercardcom/na/global-site/documents/tap-on-phone-implementation-guide-apr2022.pdf)
- [Fime terminal integration tools updated to Mastercard M-TIP 2.0 — Finextra](https://www.finextra.com/pressarticle/59480/fime-terminal-integration-tools-updated-to-mastercard-m-tip-20)
- [Visa Global Level 3 (L3) Testing Guidelines and FAQ](https://digitalpartnerservices.visaonline.com/Document/Download/865)
- [Visa Contactless Test Cases（CDET 参考）](https://www.scribd.com/document/561681120/visa-contactless-test-cases)
- [SDA vs DDA vs CDA in EMV Certification — EazyPay Tech](https://eazypaytech.com/sda-vs-dda-vs-cda-in-emv-certification/)
