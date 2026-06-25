# 终端配置：各内核数据元参考（D-PAS L2 / Sunmi SDK 提取）

> 一份**跨内核**的终端侧配置数据元清单：同一终端 SDK 为 EMV 接触、Visa(PayWave)、Mastercard(Paypass)、银联(qPBOC)、Amex(AE)、Discover(DPAS)、JCB、MIR、Interac(FLASH) 等内核分别定义的标准 + 专有(DF81xx)配置标签。补充 [终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md)、[M-TIP TSE 问卷与终端配置参数](../05-mastercard专题/M-TIP-TSE问卷与终端配置参数.md)、[EMVCo Kernel 2 V2.11 要点](./EMVCo-Kernel2-V2.11规范要点.md)。
>
> 来源：*EMVL2 Data Elements V1.0.7*（终端内核 SDK 数据元手册，归档于 [`web-docs/`](../web-docs)）。标准 EMV 标签为通用知识；`DF81xx` 为内核/厂商**专有配置标签**，不同 L2 内核实现取值可能不同，精确语义以对应内核规范为准。

---

## 一、接触 EMV 公共能力

### Terminal Capabilities `9F33`（3 字节）

| 字节 | 位级含义 |
|------|----------|
| **Byte 1** Card Data Input | b8 手输 / b7 磁条 / b6 IC 接触；b5–b1 RFU |
| **Byte 2** CVM Capability | b8 明文 PIN(联机前 ICC 验) / b7 联机密文 PIN / b6 签名(纸) / b5 离线密文 PIN / b4 No CVM；b3–b1 RFU |
| **Byte 3** Security Capability | b8 SDA / b7 DDA / b6 Card capture / b4 **CDA**；其余 RFU |

### Additional Terminal Capabilities `9F40`（5 字节）

| 字节 | 含义 |
|------|------|
| **Byte 1** Transaction Type Capability | Cash / Goods / Services / Cashback / Inquiry / Transfer / Payment / Administrative（各 1 位） |
| **Byte 2** | Cash Deposit … |
| Byte 3–5 | 数据输入/输出能力等 |

> 这两个标签正是 [Sunmi T6F10 报告](../07-实测案例/L3认证实例-Sunmi-T6F10终端配置剖析.md) 里 `9F33 Byte1/2/3` 报备值的定义来源。

---

## 二、各内核专有配置标签（DF81xx + 标准）

### Mastercard（Paypass / Kernel 2）
对应 [Kernel 2 V2.11 要点](./EMVCo-Kernel2-V2.11规范要点.md) 的数据元，SDK 侧专有标签：

| 标签 | 名称 |
|------|------|
| `DF8117` | Card Data Input Capability |
| `DF8118` / `DF8119` | CVM Capability – CVM Required / No CVM Required |
| `DF811E` / `DF812C` | Mag-stripe CVM Capability – CVM Required / No CVM Required |
| `DF811F` | Security Capability |
| `DF8120/21/22` | TAC – Default / Denial / Online |
| `DF8123` | Reader Contactless **Floor** Limit |
| `DF8124` | Reader Contactless Transaction Limit (**No** On-device CVM) |
| `DF8125` | Reader Contactless Transaction Limit (On-device CVM) |
| `DF8126` | Reader **CVM Required** Limit |
| `DF811B` | Kernel Configuration |
| `DF811D` | Max Number of Torn Transaction Log Records |
| — | RRR（Relay Resistance 相关）、Terminal Risk Management Data |

### Visa（PayWave / qVSDC）
- `9F66` **TTQ**（4 字节；byte2 b8–b7 为瞬态值，交易开始清零，其余为静态值）—— 位级见 [Visa TTQ/CTQ](../04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示.md)。
- `DF8167` Application Usage Control configuration。

### 银联（qPBOC）
- `9F66` TTQ（银联 QuickPass 复用 TTQ 对象，配置见 [银联国际 QuickPass](../03-各卡组织L3认证/银联国际-QuickPass-L3配置与HK-SG特殊CVM.md)）。

### Amex（AE / Expresspay）
- `9F6D` Contactless Reader Capabilities、`9F6E` **Enhanced Contactless Reader Capabilities**（FFI 相关，见 [Mastercard 非接 CVM 与 FFI](../05-mastercard专题/Mastercard非接CVM机制与FFI.md) 对 `9F6E` 的品牌差异说明）。
- `DF8167` DRL Sets、`DF8168` 支持延迟授权标志、`DF8169` 无法联机标志、`DF8170` UN range。

### Discover（DPAS）
- `9F66` TTQ、`DF816E` **GLOBAL FLAG**；接触侧另有 DPAS Contact 功能位（支持 Extended Logging / Data Storage / CDCVM、Container Identifiers / Data Store List）。

### JCB
- `DF8161` Combination Options、`9F53` **Terminal Interchange Profile**(static)。

### MIR（俄罗斯）
- `DF55` Terminal TPM Capabilities、`DF56` Transaction Recovery Limit；限额 `DF51` Floor / `DF52` No CVM / `DF53` Contactless(Non CD-CVM) / `DF54` Contactless(CD-CVM)；`DF04` Data Exchange Tag List。

### 其它内核
- **FLASH/Interac**：`9F58` Merchant Type Indicator、`9F59` TTI、`9F5A` TTT、`9F5D` Receipt Required limit、`9F5E` Terminal Option Status、`DF8176` Interac Retry Limit。
- **PURE**：`DF7F` Terminal AID supported、`DF8134` POS Implementation Options、`DF8133` Application/Kernel Capabilities、`DF8129` Outcome。
- **RuPay**：`DF4D` Terminal CVM Limit。
- **CPACE**：CDCVM 有/无的 Contactless Transaction Limit、上下 CVM Limit 的 CVM Capabilities、Reader CVM Required Limit、Relay Resistance 时间参数族。

---

## 三、使用要点

- **配置入口**：SDK 中多数标签经 `EmvTermParamV2`（如 `capability`=9F33、`addCapability`=9F40、`TTQ`=9F66）或 `setTlv` 设置；注意 `initEmvProcess` 会清空已设 TLV，须在其后再 `setTlv`。
- **按 AID 配置**：支持"为不同 AID 设置对应 TLV"，与多 AID 终端的逐组合配置对应（见 [AID 与 CAPK](./终端配置-AID与CAPK.md)）。
- **专有标签可增删**：SDK 提供向内核增/删 proprietary tag 的能力（如 `DF816E` global flag、kernelID 功能）。
- 跨内核同义不同标签：四大限额、CVM Capability、TAC 等概念在各内核以不同 `DF81xx` 编号出现，移植配置时须按内核映射，**勿跨内核照搬标签号**。
