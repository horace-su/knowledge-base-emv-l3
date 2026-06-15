# L3 认证实例：Sunmi T6F10 终端配置剖析（Amex / Discover / Mastercard）

> 用一台真实终端的 L3 测试配置报告，把本知识库的抽象概念（TAC/IAC/TVR、9F33 终端能力、CVM 限额、ODA、AID/LoA）映射到实际填报值。承接 [各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md)、[TAC/IAC/TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md)、[接触与非接 CVM 详解](./接触与非接CVM详解.md)、[FIME-BTT 品牌测试工具深度解析](./FIME-BTT-品牌测试工具深度解析.md)。
>
> 来源：同一台设备针对三大卡组织的 EMVCo L3 Information Report + L1/L2 LoA 证书（已归档于 [`web-docs/`](./web-docs/)，见 [`SOURCES.md`](./web-docs/SOURCES.md)）。**报告中的收单机构名称、联系人、邮箱、账户号等个人/商业敏感信息已在本文中略去，仅保留终端技术配置。**

---

## 一、被测设备与一次过审的批准链

同一台终端（**Sunmi T6F10**，支付应用 **PayOS v1.0**，非接应用 `T6F10-PCD-SW v001`）同时在 **Amex / Discover / Mastercard** 三条 L3 程序下提交。L3 报告里逐项引用的「批准号」其实就是 L1/L2 阶段产出的 LoA——这正是 [L1 物理层 → L2 内核 → L3 集成](./各卡组织L3认证测试要求一览.md) 层级依赖的实物体现。

| 层级 | 批准/证书 | 编号 | 失效/续期 |
|------|-----------|------|-----------|
| EMVCo Contact **L1** LoA | IFM `T6F10-IFM` | `18598 1123 430 43d 43d BCTS` | 2027-11-07 |
| EMVCo Contactless **L1** LoA | PCD `T6F10-PCD` | `18597 1123 310 31a 31a BCTS` | 2027-11-03 |
| EMVCo Contact **L2** | Kernel | `2-05324-1-1C-BCTS-0124-4.4a` | 2027-12-22 |
| Mastercard 非接 **C-2 LoA** | `Fully Integrated Terminal`，Kernel02 v3.1.4 | `TLOA-SUNM231101-231221(a)` | 2027-12-21 |
| Mastercard **TQM** 合规声明 | IFM/PCD `TQM4477/01`、`TQM4477/02` | — | — |
| D-PAS 非接内核 | D-PAS Connect 2.x | （厂商批准） | 2027-03-11 |
| PCI PTS | PED | `4-40397`（v6.x） | — |

> L3 测试工具：**FIME Brand Test Tool**（见 [FIME-BTT](./FIME-BTT-品牌测试工具深度解析.md)）。报告里 Mastercard 那份明确还要求一套 **Enhanced Professional Mastercard Simulator（MAS/MDFS）25.Q2+** 并导出 **EMVCo L3 Online Message Format** 主机日志——印证 [M-TIP TSE](./M-TIP-TSE配置详解.md) 的「卡模拟器 + 主机报文」双侧要求。

---

## 二、Amex（AEIPS + Expresspay）— Report 01

| 项 | 值 |
|----|----|
| 内核 | EMVCo approval `MF_EMV_KERNEL` V1.4.1 |
| 在线报文 | **GCAG ISO** |
| 接触测试计划 | **AEIPS** |
| 非接测试计划 | **Expresspay**（L2 cert v4.0+） |
| 网络能力 | Online Only |
| ODA | DDA ✅、CDA(Combined DDA) ✅ |
| 接触 CVM | Offline Plaintext/Enciphered PIN、PIN Bypass、Signature(可选)、No CVM |
| 非接 CVM | Online PIN、Signature(可选)、No CVM |

> 注意报告标注：**Offline Plaintext PIN 自 2026-01 起在无人值守终端测试中不再可用**——一个会随门户更新而变化的合规截止点，正是本库反复强调「精确编号以门户最新版为准」的典型。GCAG ISO 报文下**离线/在线退款不支持、商户冲正支持**。

---

## 三、Discover D-PAS（D-PAS Connect 2.x）— Report 02

接触与非接均走 **D-PAS Connect 2.x**，初次认证（Initial Certification），交易终端含 **Transit（MCC-4112）** 场景。

**Terminal Action Code（接触，D-PAS 专有 TAC）：**

| TAC | 值（Hex） |
|-----|-----------|
| Denial | `00 10 00 00 00` |
| Online | `FC E0 9C F8 00` |
| Default | `DC 00 00 20 00` |

- 非接 **CVM 限额 = 交易限额 = 20000**；支持超过 CVM 限额的交易；非接 CDA ✅。
- ODA：SDA/DDA/CDA 均 capable，CDA **Mode 1**。
- **多 AID 取舍**：报告逐项确认 **不**纳入 Discover Common Debit AID(`A0000001524010`)、JCB(`A0000000651010`)、UPI(`A0000003330101 01/02/03/08`)——是 [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md) 里那些 AID 在真实报告中「选/不选」的写法范例。

---

## 四、Mastercard（M-TIP）— Report 04

M/Chip 规范 **MCL 3.1.4**，非接 `MC CL KERNEL v100`，**Relay Resistance Protocol(RRP) 已启用**。TAC 由测试系统按 *M/Chip Requirements* 预填。

**接触 — Terminal Capabilities（`9F33`）与 TAC：**

| 项 | 值 |
|----|----|
| `9F33` Byte1 / Byte2 / Byte3 | `???00000b` / `11111000b` / `11?01000b`（`?` = 测试时按实配置确认位） |
| TAC Denial | `00 00 00 00 00` |
| TAC Online | `FE 50 BC F8 00` |
| TAC Default | `FE 50 BC A0 00` |
| 接触 CVM | Offline PIN、Signature、Online PIN、No CVM |
| 接触 ODA | DDA/SDA/CDA；选项 `SDA Selected TVR bit` + `CDA Mode 1` |
| Floor Limit | 0（零地板限额，零下全部联机） |

**非接（Mastercard）：**

| 项 | 值 |
|----|----|
| `9F1D` Byte1（终端风险管理数据） | `6C` |
| CVM Required Limit | `20000` |
| Floor Limit | `0` |
| 非接 ODA | CDA |
| CDCVM | ✅，交易限额 999999999 |
| 限额上 CVM | Signature、Online PIN |

**非接 TAC（按交易类型区分，体现 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md) 的"两套动作码"）：**

| 交易类型 | Denial | Online | Default |
|----------|--------|--------|---------|
| Purchase（购买） | `00 00 00 00 00` | `F4 50 84 80 0C` | `F4 50 84 80 0C` |
| PAN Retrieval（Refund，退款） | `FF FF FF FF FF` | `00 00 00 00 00` | `00 00 00 00 00` |

> 退款用 `Denial=FF…FF / Online=00…00` 的镜像配置：拒绝码全开、联机码全关，使退款这类 PAN 检索交易**一律走联机、不在本地拒绝**——与购买交易的 `Denial=00…00`（不本地拒绝、按 Online/Default 决策）形成对照，是「TAC 按交易类型分别配置」的真实样例。

---

## 五、附：LoA 长什么样（Mastercard 非接 LoA 样例）

报告 04 引用的 `TLOA-SUNM231101-231221(a)` 即上文 Sunmi 的 Mastercard C-2 LoA。作为格式对照，库中另存了一份**不同厂商**的同类 LoA（`TLOA-SQUR…`，Block/Square「Square Contactless and Chip Reader」，Kernel02 v3.1.4，2026-04-28 失效），可见 LoA 固定包含：LoA 标识、厂商、产品类型、失效日期、产品技术名/注册号、对应的 **EMVCo Contactless L1 LoA** 与 **L2 Test Assessment** 编号、支持选项（PIN Entry Device / Contactless Mag-stripe 等）。

---

## 六、把报告读成知识

| 报告里的字段 | 对应本库 |
|--------------|----------|
| TAC Denial/Online/Default（各接口、各交易类型） | [TAC/IAC/TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md) |
| `9F33` / `9F1D` / 9F40 终端能力位 | [M-TIP TSE 问卷与终端配置参数](./M-TIP-TSE问卷与终端配置参数.md) |
| CVM Required Limit / Floor / 交易限额 / CDCVM | [接触与非接 CVM 详解](./接触与非接CVM详解.md)、[Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md) |
| AEIPS/Expresspay、D-PAS Connect、M-TIP | [Amex 与 Discover L3](./Amex与Discover-L3认证深度解析.md)、[Visa 与 Mastercard L3](./Visa与Mastercard-L3认证深度解析.md) |
| 多 AID 取舍、Common Debit | [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md) |
| ODA SDA/DDA/CDA、CDA Mode 1 | [ODA 证书链字节级](./ODA证书链字节级.md) |
| UPI AID 在本报告中被排除 → UPI 走独立程序 | [银联国际 QuickPass L3 配置](./银联国际-QuickPass-L3配置与HK-SG特殊CVM.md) |
