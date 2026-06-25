# Visa TTQ/CTQ 位级解析 与 CDCVM 在 Token 化中的指示机制

> 续 [接触与非接 CVM 详解](../01-基础概念/接触与非接CVM详解.md)。本文聚焦 Visa qVSDC 非接的两个关键控制字段 **TTQ(9F66)/CTQ(9F6C)** 的位级定义，以及 **Apple Pay / Google Pay 等 Token 化钱包如何向终端/发卡行指示 CDCVM 已完成**。

---

## 一、TTQ 与 CTQ 的交互（qVSDC 流程）

非接 qVSDC 交易中，CVM 与联机决策由"**终端能力 ↔ 卡能力**"的位级协商驱动：

1. 终端在 **GET PROCESSING OPTIONS（GPO）** 命令中，把 **TTQ（9F66）** 经 PDOL 送给卡——声明"我支持/要求什么"。
2. 卡在 GPO 响应里返回 **CTQ（9F6C）**——声明"我要求/能做什么"。
3. 终端对 TTQ/CTQ 做**按位比较**，据此决定：是否联机、需要哪种 CVM（Online PIN / Signature / 无）、ODA 失败如何处理等。

> 一句话：**TTQ = 终端的"我能做什么+我要求什么"；CTQ = 卡的"我要求什么+我做了什么"。** 二者位级对齐后得出本次交易的 CVM 与联机路径。

---

## 二、TTQ（9F66）位级定义（4 字节）

> 两个独立来源（EFTLab、javaemvreader 源码）一致。

### Byte 1（受理能力）
| bit | 含义 |
|-----|------|
| b8 | 非接 **MSD** 支持 |
| b7 | 非接 **VSDC** 支持 |
| b6 | 非接 **qVSDC（EMV 模式）** 支持 |
| b5 | **接触 EMV（VSDC）** 支持 |
| b4 | 读卡器**仅离线**（offline-only） |
| b3 | **Online PIN** 支持 |
| b2 | **签名** 支持 |
| b1 | **ODA for Online Authorizations** 支持（联机授权也做离线数据认证） |

### Byte 2（要求项）
| bit | 含义 |
|-----|------|
| b8 | **Online cryptogram required**（要求联机密文 = 强制联机） |
| b7 | **CVM required**（要求持卡人验证） |
| b6 | **接触芯片 Offline PIN** 支持 |
| b5–b1 | RFU |

### Byte 3（增强功能）
| bit | 含义 |
|-----|------|
| b8 | **Issuer Update Processing** 支持（POS 端发卡行脚本更新） |
| b7 | **Mobile / Consumer Device CVM 支持**（即终端认可 CDCVM） |
| b6–b1 | RFU |

### Byte 4
全部 RFU。

> 关键位：**Byte2 b8（强制联机）、b7（要求 CVM）** 与 **Byte3 b7（认可 CDCVM）** 直接决定 CVM/联机走向。

---

## 三、CTQ（9F6C）位级定义（2 字节）

### Byte 1（CVM 与异常处理要求）
| bit | 含义 |
|-----|------|
| b8 | **Online PIN Required**（要求在线 PIN） |
| b7 | **Signature Required**（要求签名） |
| b6 | ODA 失败且读卡器可联机 → **转联机** |
| b5 | ODA 失败且读卡器支持 VIS → **切换界面**（改接触） |
| b4 | 应用过期 → **转联机** |
| b3 | 现金交易切换处理 |
| b2 | cashback 交易切换处理 |
| b1 | RFU |

### Byte 2
| bit | 含义 |
|-----|------|
| b8 | **Consumer Device CVM Performed（CDCVM 已执行）** ← 关键 |
| b7 | 卡支持 POS 端 Issuer Update Processing |
| b6–b1 | RFU |

> ⚠️ 重要细节：来源标注 **CTQ Byte2 b8 "CDCVM Performed" 在标准 Visa 合规卡上"未使用（unused）"**。这意味着 Visa 体系里 CDCVM 的指示**主要不靠这一位**，而是通过下面第四节的机制——这是常见误解点。

---

## 四、CDCVM 在 Token 化（Apple Pay / Google Pay）中的指示机制

### 4.1 核心问题
手机钱包在**设备端**（指纹/面容/设备密码）完成验证后，如何让**终端**知道"无需再做 CVM"、又让**发卡行**确认"持卡人确已被验证"？

### 4.2 两条指示路径

**(A) 给终端的指示 —— 通过 CTQ 让终端"不再要求 CVM"**
- 设备验证已完成时，卡（Token applet）返回的 CTQ **不置位** Byte1 b8（Online PIN Required）/ b7（Signature Required）。
- 终端见 CTQ 未要求 PIN/签名，即认为本笔无需在终端侧再做 CVM → 直接放行。
- 即：对终端而言，CDCVM 的体现是"**CTQ 没有要求额外 CVM**"，而非某个"CDCVM=1"标志位（Visa 合规卡上 CTQ B2 b8 未用，印证此点）。

**(B) 给发卡行的指示 —— 通过密文/IAD 携带 CDCVM 证据**
- CDCVM 信息被编入 **Issuer Application Data（IAD）**，具体在 **CVR（Card Verification Results）** 字段中。
- CVR 记录：所用验证方法、提交的密文类型、ARQC 等。
- 这些数据**参与应用密文（AC/ARQC）的生成**——发卡行验密文时即可确认 CDCVM 确实发生且未被篡改。
- 在非接 EMV 与 DSRP（Digital Secure Remote Payment）方案中，CDCVM 数据用 **2 字节（B1/B2）** 承载，传达：CVM 的性质、是否存在同意、CDCVM 方法强度、持续同意控制强度、同意方式等。

### 4.3 设备形态指示（辅助）
- Visa 另有 **Form Factor Indicator（FFI，9F6E）** 等字段指示受理形态/设备类型，帮助区分手机钱包等。

### 4.4 流程小结
```
设备端验证(指纹/面容)
   ↓
Token applet:
   • CTQ → 不要求 PIN/签名（告诉终端：CVM 已搞定）
   • CVR(in IAD) → 记录 CDCVM 方法 + 进密文(告诉发卡行：确已验证)
   ↓
终端：放行(不再要 CVM) → 联机授权
发卡行：验 ARQC + 读 CVR → 确认 CDCVM 真实
```

> 本质：**CDCVM 是"双向声明"**——对终端用 CTQ"免除后续 CVM"，对发卡行用 CVR/密文"提供可验证证据"。不存在单一明文标志位，安全性来自密文绑定。

---

## 五、CVM 决策示例（qVSDC）

当卡返回 CTQ，终端按**优先级 Online PIN → Signature** 决定：
| CTQ Byte1 | 终端行为 |
|-----------|----------|
| b8=1（Online PIN Required） | 提示输入在线 PIN |
| b7=1（Signature Required） | 走签名 |
| b8=0 且 b7=0 | 无需终端侧 CVM（低额 No CVM，或 CDCVM 已完成） |

> 前提：终端 TTQ 须声明对应能力（Byte1 b3 Online PIN / b2 Signature / Byte3 b7 CDCVM）。卡要求的 CVM 若终端不支持，则按内核规则降级或拒绝。

---

## 六、实操与测试要点

- **TTQ/CTQ 是 qVSDC CVM 的"总线"**：CDET 非接用例大量围绕 TTQ/CTQ 组合验证（如不同 CVM 要求、ODA 失败转联机/切接触）。
- **CDCVM 不是"一个标志位"**：别去找"CDCVM=1"；对终端看 CTQ 是否免 CVM，对发卡行看 CVR/密文。Visa CTQ B2 b8 在合规卡上未用。
- **强制联机位**：TTQ B2 b8 / CTQ B1 b6、b4 共同决定何时必须上送 ARQC。
- **ODA 失败处理分两种**：CTQ B1 b6=转联机、b5=切接触界面——测试需分别覆盖（对应 CDET 的 CTQ 切换接触用例）。
- **跨钱包一致性**：Apple Pay/Google Pay/Samsung Pay 的 CDCVM 指示机制原理一致（CTQ 免 CVM + CVR 进密文），但各自 Token 实现细节（FFI、IAD 编码）略有不同，测试需覆盖主流钱包。

---

**参考来源：**
- [The Use of CTQs and TTQs in NFC Transactions — EFTLab](https://www.eftlab.com/post/the-use-of-ctqs-and-ttqs-in-nfc-transactions)
- [TerminalTransactionQualifiers.java — javaemvreader (GitHub)](https://github.com/sasc999/javaemvreader/blob/master/src/main/java/sasc/emv/TerminalTransactionQualifiers.java)
- [Terminal Transaction Qualifiers (9F66) Decoder — paymentcardtools](https://paymentcardtools.com/emv-tag-decoders/ttq)
- [Card Transaction Qualifiers (9F6C) Decoder — paymentcardtools](https://paymentcardtools.com/emv-tag-decoders/ctq)
- [Card Transaction Qualifiers — Grokipedia](https://grokipedia.com/page/card-transaction-qualifiers)
- [System and process for on-the-fly CVM selection — US20190385160A1（CDCVM/IAD/CVR）](https://patents.google.com/patent/US20190385160A1/en)
- [Solving for SCA with CDCVM — Edgar, Dunn & Company](https://www.edgardunn.com/articles/solving-for-sca-with-consumer-device-cardholder-verification-method-cdcvm)
