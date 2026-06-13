# EMV Contactless Kernel Deep Dive（非接内核与支付品牌映射）

> EMV 非接的底层骨架：一台读卡器内可同时存在**多个内核（Kernel）**，每个内核对应一套支付品牌规范。本文讲清 EMVCo Contactless Book A–D 的分工、**Entry Point（Book B）如何在一笔交易里选中正确的 AID + Kernel 组合**，以及 7 个内核与卡组织的映射。
> 关联：[接触与非接 CVM 详解](./接触与非接CVM详解.md)（CVM 由"限额 + 内核"驱动）·[终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md)（PPSE/AID 选择）·[Visa TTQ/CTQ 与 CDCVM Token 化指示](./Visa-TTQ-CTQ与CDCVM-Token化指示.md)·[Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md)·[各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md)

---

## 一、为什么非接需要"内核"这个概念

接触式 EMV 全行业基本共用一套交易流程（EMV Book 1–4）；**非接则不然**：各卡组织在 EMVCo 框架下各自定义了**独立的非接交易处理逻辑（内核）**。同一台支持多品牌的读卡器，里面实际并存 Visa qVSDC、Mastercard PayPass、Amex Expresspay…… 多套内核。交易开始时，终端必须先**判断这张卡/Token 属于哪个品牌**，再**激活对应的内核**走该品牌的流程。

> 这正是非接必须**按品牌分别测试**的根本原因——Visa 走 CDET、Mastercard 走 M-TIP 非接，互不通用（见 [接触与非接 CVM 详解](./接触与非接CVM详解.md)）。

---

## 二、EMVCo Contactless Specifications 结构（Book A–D）

EMVCo 把"非接支付系统规范"拆成四类 Book：

| Book | 名称 | 作用 |
|------|------|------|
| **Book A** | Architecture and General Requirements | 总体架构、读卡器/内核职责划分、配置数据模型 |
| **Book B** | **Entry Point Specification** | **品牌识别与内核选择的统一前置流程**（见第三节） |
| **Book C-1 … C-7** | Kernel Specifications | 每个内核一册，定义该品牌的非接交易逻辑 |
| **Book D** | Contactless Communication Protocol | L1 之上的非接通信协议（基于 ISO/IEC 14443） |

- **Book B（Entry Point）是各品牌共用的**：先用统一逻辑选出"这笔交易用哪个 AID + 哪个内核"，再把控制权交给对应的 **Book C-x 内核**。
- L3 集成测试的前提是终端已取得 **EMVCo L1/L2 批准**，其中 L2 即"内核 + 支付应用"层（见 [各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md)）。

---

## 三、Entry Point（Book B）：一笔非接交易如何选内核

1. **建场 + 防冲突**：读卡器上电激活非接场，按 ISO 14443 完成卡片选择（Book D）。
2. **读 PPSE**：选择 `2PAY.SYS.DDF01`（非接 PSE，对应接触式的 `1PAY.SYS.DDF01`），卡返回 **FCI**，其中列出卡上每个可用应用的 **AID** 及其 **Kernel Identifier**。
   - 对应接触式的 PSE/PPSE 法见 [终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md)。
3. **生成候选组合（Combinations）**：终端把"卡声明的 (AID, Kernel ID)"与"终端自身配置支持的 (AID, Kernel ID)"做交集，得到候选 **Combination** 列表。
4. **按优先级选定一个 Combination**：依据 PPSE 返回的应用优先级指示器与终端策略，挑出最终的 **AID + Kernel ID**。
5. **激活对应内核（Book C-x）**：把选中的内核拉起，由它发起 `SELECT AID` 之后的全部交易步骤（GPO、读记录、CVM、风险管理、生成 AC……）。
   - 对 Visa（Kernel 3），终端在此阶段通过 **TTQ（`9F66`）** 向卡声明能力，卡用 **CTQ（`9F6C`）** 回应——见 [Visa TTQ/CTQ 与 CDCVM Token 化指示](./Visa-TTQ-CTQ与CDCVM-Token化指示.md)。
   - 对 Mastercard（Kernel 2），不走 TTQ/CTQ，改用"读卡器限额 + CVM Capability"驱动——见 [Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md)。

> 关键点：**Kernel Identifier 是选内核的依据**。终端配置里"支持哪些内核"必须与 L2 批准一致——这也是 TSE/问卷反复强调"答案须与 EMVCo L2 内核能力一致"的来由（见 [M-TIP TSE 配置详解](./M-TIP-TSE配置详解.md)）。

---

## 四、内核 ↔ 卡组织映射（K1–K7）

| 内核 | Book | 卡组织 / 品牌规范 | 备注 |
|------|------|------------------|------|
| **Kernel 1** | C-1 | JCB（及早期 Visa MSD / Amex 共用的 legacy "common" 内核） | 历史最早的通用非接内核 |
| **Kernel 2** | C-2 | **Mastercard**（PayPass / M/Chip Contactless） | 四大限额 + CVM Capability 驱动 CVM |
| **Kernel 3** | C-3 | **Visa**（payWave / qVSDC，含 MSD） | TTQ(`9F66`)/CTQ(`9F6C`) 位级协商 |
| **Kernel 4** | C-4 | American Express（Expresspay） | AEIPS 体系；AFD/Transit/Fleet 场景 |
| **Kernel 5** | C-5 | JCB | JCB 自有非接内核（J/Speedy 等） |
| **Kernel 6** | C-6 | **Discover**（D-PAS，含 ZIP） | Discover/Diners/PULSE L3 走此内核 |
| **Kernel 7** | C-7 | UnionPay 银联（QuickPass / qPBOC 国际侧） | 国内侧走 PBOC/国密，见下 |

> 记忆锚点（与本库一致性核查项一致）：**K2 = Mastercard、K3 = Visa、K6 = Discover**。

- **JCB 出现两次（K1 与 K5）**：Kernel 1 是行业早期的"通用内核"，JCB 沿用；Kernel 5 是 JCB 自有内核。具体一笔交易用哪个，取决于卡上 AID 声明的 Kernel ID 与终端配置。
- **银联国内不在 EMVCo 内核体系内**：国内 QuickPass 走 **PBOC 3.0 + 国密 SM2/SM3/SM4**，由 CUP/BCTC 检测认证，与 EMVCo Kernel 7（国际侧）是两套体系——见 [银联国内：PBOC 3.0 与国密算法](./银联国内-PBOC3.0与国密算法.md) 与 [JCB 与银联 L3 认证深度解析](./JCB与银联-L3认证深度解析.md)。

---

## 五、各内核的交易"风味"（flavors）

同一内核内部往往支持多种交易模式，L3 用例会分别覆盖：

| 内核 | 主要交易模式 |
|------|------------|
| **Kernel 2（MC）** | M/Chip（完整 EMV 非接，生成 ARQC/TC）、Mag-stripe（PayPass Magstripe，dCVC1） |
| **Kernel 3（Visa）** | qVSDC（完整非接，CVN17 等）、MSD（Magstripe Mode，dCVV）；用例细分见 [Visa-CDET 非接测试用例细分](./Visa-CDET非接测试用例细分.md) |
| **Kernel 4（Amex）** | Expresspay 完整模式 / Magstripe 模式；自动售货(AFD)、交通(Transit)、车队(Fleet) |
| **Kernel 6（Discover）** | D-PAS EMV 模式、ZIP（低值免签）、Fallback / Cross-testing（见 [Amex 与 Discover L3 认证深度解析](./Amex与Discover-L3认证深度解析.md)） |

> 非接 CVM 的判定**以各内核规范为准**：Visa 用 TTQ/CTQ，Mastercard 用读卡器限额 + CVM Capability + On-device CVM（CDCVM）。三大非接限额（Floor / CVM Required / Transaction）与各内核的具体阈值映射见 [接触与非接 CVM 详解](./接触与非接CVM详解.md)。

---

## 六、与 L3 测试的关系（速记）

- **内核属于 L2**：内核逻辑本身由 EMVCo（及各卡组织型式批准）在 **L2** 认证；**L3 不重测内核**，而是测"终端在真实内核之上、与收单主机/支付网络的端到端集成"。
- **L3 前提**：终端须已具备**当前有效的 EMVCo L1/L2 批准**（含对应内核/IFM），否则 L3 不可执行（见 [各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md)）。
- **配置一致性是命门**：终端声明支持的内核与能力，必须与 L2 批准、与 TSE/问卷答案三方一致，否则测试计划不匹配、认证失效。

---

> 说明：内核与品牌的映射框架稳定可靠；Kernel 1/5（JCB legacy vs JCB 自有）的历史归属在不同资料中表述略有出入，精确的 Book C-x 版本号与归属请以 **EMVCo Contactless Specifications** 门户最新版为准。
