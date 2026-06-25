# Mastercard 非接（Kernel 2）CVM 机制 与 FFI（9F6E）

> 续 [Visa TTQ/CTQ 与 CDCVM Token 化指示](../04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示.md)。Visa（Kernel 3）用 TTQ/CTQ 位级协商；**Mastercard（Kernel 2 / PayPass / M/Chip Contactless）不用 TTQ/CTQ，改用一组"读卡器限额 + CVM Capability"驱动**。本文解析该机制，并补充 **FFI（9F6E）** 的品牌差异与位级结构。
> 关联：[接触与非接 CVM 详解](../01-基础概念/接触与非接CVM详解.md)

---

## 一、根本差异：Visa vs Mastercard 非接 CVM

| 维度 | Visa（Kernel 3 / qVSDC） | Mastercard（Kernel 2 / PayPass） |
|------|--------------------------|----------------------------------|
| 协商机制 | **TTQ(9F66) ↔ CTQ(9F6C)** 位级协商 | **读卡器限额 + CVM Capability** 比较 |
| CVM 决策依据 | 卡返回的 CTQ 指示要哪种 CVM | 交易额落在哪个**限额区间** + 终端 CVM 能力 |
| On-device CVM | CTQ 免 CVM + CVR 进密文 | **独立的 On-device CVM 交易限额** |
| 控制粒度 | 单一 CVM Required Limit | **四个限额**，移动场景更细 |

> 一句话：**Visa 靠"卡说了算"（CTQ）；Mastercard 靠"金额落在哪个限额带"。**

---

## 二、Mastercard 四大读卡器限额

| 限额 | 含义 | 超过则… |
|------|------|---------|
| **Reader Contactless Floor Limit**（非接地板限额） | 联机门槛 | 交易须送发卡行**联机授权** |
| **Reader CVM Required Limit**（CVM 限额） | CVM 门槛 | 需要**持卡人验证**（PIN/签名/CDCVM） |
| **Reader Contactless Transaction Limit (No On-device CVM)**（无设备 CVM 交易限额） | 不支持设备验证时的**受理上限** | **拒绝非接**（须插卡/接触） |
| **Reader Contactless Transaction Limit (On-device CVM)**（设备 CVM 交易限额） | 设备支持 CDCVM 时的**受理上限**（更高） | 超过才拒绝非接 |

### CVM 决策带（按金额从低到高）
```
金额 ≤ Floor Limit          → 可离线，No CVM
Floor < 金额 ≤ CVM Limit     → 联机，但 No CVM
金额 > CVM Required Limit     → 联机 + 需 CVM(PIN/签名/CDCVM)
金额 > Txn Limit(No On-dev)   → 普通卡：拒绝非接
金额 > Txn Limit(On-device)   → 连设备 CDCVM 也超限：拒绝非接
```

> 关键设计：**两个交易限额**让"手机钱包（支持 CDCVM）"能受理比"普通非接卡"**更高金额**——因为设备端已做强验证。这是 Mastercard 比 Visa（单一 CVM Required Limit）更细的地方。

---

## 三、CVM Capability：超过 CVM 限额后选哪种

当金额 **> Reader CVM Required Limit**，激活 CVM Capability 机制，终端/读卡器按其能力选择：

| 能力对象 | 适用 | 说明 |
|----------|------|------|
| **M/Chip CVM Capability** | M/Chip（EMV 模式）非接 | 金额 > CVM Required Limit 时适用 |
| **Mag-stripe CVM Capability** | Mag-stripe 模式非接 | 对应磁条路径 |

- **低于 CVM 限额**：仅 No CVM 方法可用（不要 PIN/签名）。
- **高于 CVM 限额**：仅 PIN 和/或签名（及 CDCVM）方法可用。
- **MCL 3.0 读卡器**：要求支持**移动设备支付在 CVM 限额之上**的持卡人验证（即 CDCVM 之上的处理）。

---

## 四、Mastercard 的 CDCVM（On-device CVM）

- 移动实现**必须支持 CDCVM**（Consumer Device Cardholder Verification）。
- 读卡器即便在交易额 < 内核 CVM 限额时**可不要求 CVM**，但**消费设备可基于自身风控（如 CDCVM）主动发起验证**。
- CDCVM 完成后，凭证（密文/IAD/CVR）携带验证证据上送发卡行——机制与 Visa 同理（设备端验证 + 密文绑定），但**触发与限额逻辑走 Mastercard 的四限额体系**，而非 CTQ。
- 实际效果：支持 CDCVM 的设备可用 **On-device CVM 交易限额**（更高额度）受理。

---

## 五、FFI（Form Factor Indicator，9F6E）—— 品牌含义不同！

> ⚠️ **9F6E 是"同标签、异含义"的典型**：解析前必须先判定品牌。

| 品牌 | 9F6E 的身份 | 长度 | 结构要点 |
|------|-------------|------|----------|
| **Visa** | **Form Factor Indicator（FFI）** | 4 字节 | 描述消费设备形态与特性 |
| **Mastercard** | **Third Party Data**（第三方数据） | 不同 | 描述卡的地区归属与形态；**设备类型在 Byte 5–6** |

### 5.1 Visa FFI（4 字节）结构
| 字节 | 位 | 含义 |
|------|----|------|
| Byte 1 | b8–b6 | **FFI 版本号**（=1） |
| Byte 1 | b5–b1 | **Payment Device Form Factor**（设备形态） |
| Byte 2 | b8 | **Passcode capable**（设备可输入密码） |
| Byte 2 | b7 | **Signature panel**（有签名栏） |
| Byte 2 | 其余 | 其他特性位（如全息图/CVM 显示等） |
| Byte 3 | — | 特性/RFU |
| Byte 4 | — | 形态相关（部分实现） |

### 5.2 设备形态枚举（Form Factor 值）
标准卡、迷你卡、非卡形态（key fob 钥匙扣）、手机/智能手机、腕带、手表/可穿戴、移动 tag、其他可穿戴设备等。

### 5.3 用途
- 区分**手机钱包 vs 实体卡 vs 可穿戴**——对风控、CDCVM 判定、受理策略有意义。
- 与 CDCVM 配合：FFI 指示"这是有屏幕/可输密码的设备"，佐证设备具备 CDCVM 能力。

> 由于本机无法稳定抓取 9F6E 完整字节级权威定义（多源超时/证书错误），Byte 3/4 与各特性位的精确含义建议以 **Visa Contactless（VCPS）规范** 或 **paymentcardtools/9F6E 解码器** 实测核对。

---

## 六、Visa vs Mastercard 非接 CVM 总对照

| 项目 | Visa（K3/qVSDC） | Mastercard（K2/PayPass） |
|------|------------------|--------------------------|
| 核心字段 | TTQ 9F66 / CTQ 9F6C | 四大 Reader 限额 + CVM Capability |
| 限额数量 | 1（CVM Required Limit）为主 | **4**（Floor / CVM / Txn-No-OnDev / Txn-OnDev） |
| 选 CVM | CTQ b8/b7（Online PIN/签名） | 金额带 + M/Chip / Mag-stripe CVM Capability |
| CDCVM 受理上限 | 单限额，不单列 | **独立 On-device CVM 交易限额（更高）** |
| 9F6E | **FFI**（4 字节，设备形态） | **Third Party Data**（地区+形态，Byte5-6 设备类型） |
| CDCVM 强制 | 是 | 移动实现是 |

---

## 七、实操与测试要点

- **别把 Visa 那套套到 Mastercard**：MC 非接没有 TTQ/CTQ；调试时抓包看的是**限额配置 + CVM Capability + IAD/CVR**，不是 CTQ。
- **四限额必须分别配置且测试**：尤其 **两个交易限额**（On-device / No On-device）——M-TIP 非接用例会覆盖"普通卡超限拒绝、CDCVM 设备可继续"的差异。
- **9F6E 解析先认品牌**：Visa 当 FFI 解、Mastercard 当 Third Party Data 解；用错结构会得出错误设备类型。
- **CDCVM 提额是关键卖点**：手机钱包靠 On-device CVM 交易限额受理更高金额，测试需验证"设备支持/不支持 CDCVM"两条路径的限额分叉。
- **MCL 3.0 读卡器要求**：验证 CVM 限额之上的移动支付持卡人验证支持。

---

**参考来源：**
- [Contactless Limits of POS Terminals（MC 四限额）— MST](https://mstcompany.net/blog/contactless-limits-of-pos-terminals)
- [Contactless Limits and EMV Transaction Processing — US Payments Forum](https://www.uspaymentsforum.org/wp-content/uploads/2020/10/Contactless-Limits-WP-FINAL-October-2020.pdf)（本地：`web-docs/US-Payments-Forum-Contactless-Limits-2020.pdf`）
- [Contactless Toolkit for Acquirers — Mastercard](https://www.mastercard.com/contactless/doc/MC_Contactless_Toolkit_Acquirers.pdf)
- [Form Factor Indicator (9F6E) — Grokipedia](https://grokipedia.com/page/form-factor-indicator)
- [Form Factor Indicator (Tag 9F6E) decoder — paymentcardtools](https://paymentcardtools.com/emv-tag-decoders/form-factor)
- [FFI - Form Factor Indicator List - Tag 9F6E — Hartley Enterprises](http://hartleyenterprises.com/list9F6E.html)
- [EMV tag 9F6E — emvlab.org](https://emvlab.org/emvtags/show/t9F6E/)
