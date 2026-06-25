# 接触与非接 CVM（持卡人验证方法）详解

> CVM（Cardholder Verification Method）用于判断"出示卡的人是否是合法持卡人"。接触与非接的 CVM 机制差异很大——这是 TSE/ADVT/CDET 配置与用例的核心维度之一。
> 关联：[M-TIP-TSE 问卷与终端配置参数](../05-mastercard专题/M-TIP-TSE问卷与终端配置参数.md)（9F33 Byte2 CVM 能力）·[Visa-CDET 非接测试用例细分](../04-visa专题/Visa-CDET非接测试用例细分.md)·[EMV 免密免签判断流程](./EMV免密免签判断流程.md)（把本文机制收敛成"是否免密"的端到端决策链 + 分卡组最大化免密）

---

## 一、CVM 全景

| CVM 方法 | 接触 | 非接 | 说明 |
|----------|------|------|------|
| **离线明文 PIN**（plaintext offline PIN） | ✅ | ❌ | 卡内校验，PIN 明文送卡 |
| **离线加密 PIN**（enciphered offline PIN，RSA） | ✅ | ❌ | 卡内校验，RSA 加密 |
| **在线加密 PIN**（online PIN，3DES） | ✅ | ✅ | 发卡行校验 |
| **签名**（signature） | ✅ | ✅（少用） | 纸质签购单核对 |
| **No CVM** | ✅ | ✅ | 低额免验证 |
| **CDCVM**（消费设备 CVM） | ❌ | ✅ | 设备端(手机指纹/面容/密码)完成验证 |

> 关键差异：**离线 PIN（明文/加密）是接触专有**；**CDCVM 是非接专有**（手机钱包等）。非接的 payWave 只允许 Online PIN / CDCVM / Signature。

---

## 二、接触 CVM：CVM List（标签 8E）驱动

接触交易的 CVM 由**卡内的 CVM List（8E）**决定，终端按规则顺序匹配自身能力（9F33 Byte2）。

### 2.1 CVM List 结构

```
[Amount X: 4字节] [Amount Y: 4字节] [CV Rule 1: 2字节] [CV Rule 2] ... [CV Rule Z]
```
- **X / Y**：应用币种下的两个金额阈值，供条件判断用。
- 后接若干 **2 字节 CV Rule**，按序处理。

### 2.2 每条 CV Rule = 2 字节

**Byte 1 — CVM Code（bit1–6 = 方法）**
| 值 | CVM 方法 |
|----|----------|
| 0 | Fail CVM processing（失败） |
| 1 | 离线明文 PIN |
| 2 | 在线 PIN（恒加密） |
| 3 | 离线明文 PIN + 纸质签名 |
| 4 | 离线加密 PIN |
| 5 | 离线加密 PIN + 纸质签名 |
| 30(0x1E) | 仅纸质签名 |
| 31(0x1F) | Approve CVM processing（通过） |

- **bit 7**：失败处理——`0`=立即失败；`1`=**失败则尝试下一条规则**。

**Byte 2 — CVM Condition Code（何时应用该规则）**
| 值 | 条件 |
|----|------|
| 0x00 | Always（总是） |
| 0x01 | 仅无人值守现金 |
| 0x02 | 非现金/非 cashback 交易 |
| 0x03 | 若终端支持则总是 |
| 0x04/0x05 | 手工现金 / cashback |
| 0x06/0x07 | 金额 < X / > X |
| 0x08/0x09 | 金额 < Y / > Y |

### 2.3 处理逻辑

终端**从上到下顺序读取** CVM List，取**第一条满足条件且双方都支持**的规则执行；若该规则失败且 bit7=1 则继续下一条，直到成功或规则用尽。无 CVM List 时，CVM Results 置为 "No CVM performed"。

### 2.4 CVM Results（标签 9F34，3 字节）

记录最终结果：Byte1=执行的 CVM、Byte2=条件、Byte3=结果（unknown / failed / successful）。L3 用例常校验 9F34 是否符合预期（如 ADVT 的 PIN 超限、组合 CVM 用例）。

---

## 三、非接 CVM：由"限额 + 内核"驱动，而非单纯 CVM List

非接每个规范用**独立内核**（Kernel 2=Mastercard、Kernel 3=Visa…），CVM 选择主要由**三大限额**和内核规则决定。

### 3.1 三大非接限额

| 限额 | 含义 | 低于 | 高于 |
|------|------|------|------|
| **Contactless Floor Limit**（地板限额） | 是否必须联机授权 | 可离线 | 须联机 |
| **Contactless CVM Required Limit**（CVM 限额） | 是否需要持卡人验证 | **No CVM**（仍保留发卡行责任） | 需 CVM（Online PIN / CDCVM / 签名） |
| **Contactless Transaction Limit**（交易限额） | 非接可受理上限 | 可非接 | **拒绝非接**（须改用接触/插卡） |

> 逻辑链：金额 ≤ Floor → 可离线;Floor < 金额 ≤ CVM Limit → 联机但免 CVM;CVM Limit < 金额 ≤ Txn Limit → 联机 + 需 CVM;> Txn Limit → 不能非接。

> 注：此为**通用三限额模型**。**Mastercard 进一步把"交易限额"拆成两个**（No On-device CVM / On-device CVM），即"四限额"——详见 [Mastercard 非接 CVM 机制与 FFI](../05-mastercard专题/Mastercard非接CVM机制与FFI.md)。Visa 则以单一 CVM Required Limit 为主，CVM 判定走 [TTQ/CTQ](../04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示.md)。

### 3.2 CDCVM（Consumer Device CVM）

- **定义**:持卡人在**消费设备**(手机/手表钱包)上以指纹/面容/设备密码完成验证,卡/Token 向终端声明"设备已验证持卡人"。
- **特点**:CDCVM 是**完全有效的 CVM**,**不受 CVM Required Limit 约束**——任意金额都适用(因为验证已在设备端完成)。这与"低额 No CVM"是两回事。
- **Visa 要求**:非接设备**必须支持 CDCVM**。
- 终端如何知道设备做了 CVM:通过卡/Token 在交易数据中的指示(如 Mastercard 的 CVM Results / Visa 的 CTQ、Card Transaction Qualifiers 等内核特定字段)声明。

### 3.3 Visa vs Mastercard 非接 CVM 处理差异

| 维度 | Visa（Kernel 3 / qVSDC） | Mastercard（Kernel 2 / PayPass） |
|------|--------------------------|----------------------------------|
| 控制字段 | **TTQ**(Terminal Transaction Qualifiers)/**CTQ**(Card TQ) | CVM Required Limit + 内核 CVM 判定 |
| CDCVM | 强制支持 | 支持 |
| 低额免 CVM | 由 CVM Required Limit 控制 | 同 |
| 规范 | VCPS / qVSDC | M/Chip Contactless（PayPass） |

> 共性:每个非接规范有自己的内核,CVM 的精确判定以**各内核规范**为准——这正是非接需按品牌分别测试(CDET vs M-TIP 非接)的原因。

---

## 四、美国市场特例

- 美国**非接交易金额无上限**(无 Transaction Limit 概念上的硬封顶)。
- 美国**接触与非接共用同一套 No CVM 限额**。
- (其他地区,如曾经的非接小额免密限额,各国监管/卡组织设定不同。)

---

## 五、与 L3 测试/配置的关联

| 场景 | 接触 | 非接 |
|------|------|------|
| TSE / 9F33 Byte2 配置 | 声明支持哪些 CVM(离线/在线 PIN、签名、No CVM) | 非接 CVM 走 PPSE/限额/CDCVM 配置 |
| ADVT 相关用例 | PIN 超限(TC21/22)、组合 CVM(TC23)、RFU CVM(TC9) | —— |
| CDET 相关用例 | —— | CDCVM(TC11 Pre-tap/VMPA)、CVM 限额场景 |
| 易错点 | CVM List 顺序与 bit7 回退逻辑 | 三大限额配置 + CDCVM 声明 |

---

## 六、实操要点

- **接触看 CVM List(8E)+ 9F33 能力的交集**:终端只会执行"卡列出 且 自己支持"的方法;ATM 强制 Online PIN 即此机制的极端体现。
- **非接看限额 + 内核**:No CVM(低额)≠ CDCVM(设备验证);后者任意金额有效,前者受 CVM Required Limit 约束。
- **CDCVM 必测(尤其 Visa)**:手机钱包场景占比高,非接设备须正确识别 CDCVM 指示。
- **bit7 回退是常见 bug 源**:CVM List 中"失败转下一条"的处理,接触 L3 用例(如组合 CVM)专门验证。
- **跨品牌差异不可忽略**:Visa 用 TTQ/CTQ,Mastercard 用内核 CVM 判定;非接 CVM 必须按品牌分别配置与测试。

---

**参考来源：**
- [EMV tag 8E (CVM List) — emvlab.org](https://emvlab.org/emvtags/show/t8E/)
- [Cardholder Verification in EMV — EFTLab](https://www.eftlab.com/post/cardholder-verification-in-emv)
- [Consumer Device Cardholder Verification Method (CDCVM) Primer](https://prioritycommerce.com/wp-content/uploads/2020/01/CDCVM-Primer.pdf)
- [EMVCo Statement — CDCVM](https://www.emvco.com/resources/emvco-statement-consumer-device-cardholder-verification-method-cdcvm/)
- [Contactless Limits and EMV Transaction Processing — US Payments Forum](https://www.uspaymentsforum.org/wp-content/uploads/2020/10/Contactless-Limits-WP-FINAL-October-2020.pdf)（本地：`web-docs/US-Payments-Forum-Contactless-Limits-2020.pdf`）
- [Cardholder Verification Methods — Adyen Docs](https://docs.adyen.com/point-of-sale/cardholder-verification-methods)
- [VSDC Contact & Contactless US Acquirer Implementation Guide — Visa](https://usa.visa.com/content/dam/VCOM/regional/na/us/partner-with-us/documents/visa-smart-debit-credit-contact-contactless-us-acquirer-implementation-guide.pdf)
