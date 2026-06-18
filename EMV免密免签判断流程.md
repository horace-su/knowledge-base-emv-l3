# EMV 免密免签判断流程（No CVM 最大化）

> 把分散在各卡组织 CVM 机制中的判定逻辑，收敛成一条**"这笔交易是否免密免签"的端到端决策链**，并给出**在符合 EMVCo / 各卡组织规范前提下最大化免密免签**的配置杠杆与合规边界。
> 关联：[接触与非接 CVM 详解](./接触与非接CVM详解.md)（CVM List 8E / 9F34 / 三大限额）·[Visa TTQ/CTQ 与 CDCVM Token 化指示](./Visa-TTQ-CTQ与CDCVM-Token化指示.md)·[Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md)·[银联国际 QuickPass 与 HK/SG 特殊 CVM](./银联国际-QuickPass-L3配置与HK-SG特殊CVM.md)·[TAC/IAC/TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md)

---

## 一、先厘清概念：什么是"免密免签"

"免密免签"= 终端侧**不要求持卡人输 PIN、也不要求签名**即可完成的 CVM 路径。它在 EMV 里对应的不是单一状态，而是**三条不同来源**的"无需终端 CVM"路径——区分它们是配置与测试的前提：

| 路径 | 机制 | 金额约束 | 欺诈责任倾向 |
|------|------|----------|--------------|
| **(a) 真·No CVM（低额免验）** | 金额 ≤ CVM 限额 → 卡/内核判定 **No CVM required** | 受 **CVM Required Limit** 约束 | 多数卡组：**商户/收单**承担（无持卡人验证）|
| **(b) CDCVM（设备验证）** | 持卡人已在手机/手表上指纹·面容·密码完成验证；卡/Token 声明"已验" | **不受 CVM 限额约束**，任意金额 | 已强验证，责任倾向**发卡行**|
| **(c) 联机免 CVM** | 发卡行联机授权时未要求额外 CVM（部分场景）| 视发卡行/卡组规则 | 发卡行 |

> ⚠️ 两个最易混的区分：
> - **No CVM Required ≠ No CVM Performed**：前者是"规则判定本笔不需要 CVM"，后者是"做过 CVM 流程但结果为未做"。二者在 **CVM Results（`9F34`）** 与 **TVR（`95`）** 上留痕不同，L3 用例会校验。
> - **(a) 低额免验**与**(b) CDCVM**根本不同：低额免验受 CVM 限额封顶；CDCVM 是**完整有效的 CVM**，任意金额都成立——"最大化免密"恰恰要把这两条路都铺好（低额走 a，钱包走 b）。

---

## 二、EMVCo 通用判定链（与品牌无关的骨架）

不论接触还是非接，"是否免密免签"都落在**金额 vs 限额 + 卡/发卡行要求 + 终端能力**的交集上。先看通用骨架，再看分卡组差异。

### 2.1 接触（Contact）：CVM List（`8E`）顺序匹配

接触交易的 CVM 由**卡内 CVM List（`8E`）**驱动，终端按其能力（`9F33` Byte2）从上到下取第一条"条件满足且双方都支持"的规则。**要达成免密免签，需该规则解析为 No CVM**：

- CVM 方法码（Byte1 bit6–1）`0b011111`（`0x1F`）= **No CVM required**（部分文档写作 "Approve/通过"，EMVCo 正式名为 *No CVM required*）。
- 典型免密命中：CVM List 头部放一条 `0x1F` + 条件"金额 < X"（`Byte2=0x06`）→ 小额直接 No CVM。
- 若所有规则都不满足、或卡未提供 CVM List → CVM Results 记 **"No CVM performed"**，TVR 视情况置位（如 `8E` 缺失、ICC 数据缺失）。

> 关键：接触免密**取决于卡的 CVM List**——终端无法单方面"关掉"接触 PIN；若卡把 Offline/Online PIN 排在小额条件之前，终端只能跟随。最大化空间主要在**非接**与 **CDCVM**。

### 2.2 非接（Contactless）：限额 + 内核驱动

```
金额 ≤ Floor Limit          → 可离线，No CVM        ← 免密免签
Floor < 金额 ≤ CVM Limit     → 须联机，但 No CVM      ← 免密免签
金额 > CVM Required Limit     → 联机 + 需 CVM(PIN/签名/CDCVM)   ← 此处靠 CDCVM 续命
金额 > Transaction Limit      → 拒绝非接（须插卡/接触）
```

- **CVM Required Limit 是免密免签的总闸**：金额在其下 → No CVM；其上 → 必须有 CVM，此时**唯一仍"无感"的路径就是 CDCVM**。
- 把"最大化免密"翻译成配置语言 = **① 在合规上限内抬高 CVM Required Limit；② 让 CDCVM 在限额之上仍可受理**。

---

## 三、分卡组判定差异（核心）

同样一笔非接交易，"要不要 CVM"在各内核里由**不同字段**拍板。下表是判定入口 + 免密杠杆：

| 卡组（内核） | 免密判定入口 | 限额模型 | CDCVM | 最大化免密的关键配置 |
|--------------|--------------|----------|-------|----------------------|
| **Visa**（K3 / qVSDC） | **TTQ(`9F66`) ↔ CTQ(`9F6C`)** 位级协商 | 单一 CVM Required Limit 为主 | **强制支持** | 金额 ≤ 限额时 TTQ Byte2 **b7(CVM required)=0**；TTQ Byte3 **b7=1** 认可 CDCVM；CTQ 未要求 PIN/签名即放行 |
| **Mastercard**（K2 / PayPass） | **四大 Reader 限额 + CVM Capability** | **4 个限额**（Floor / CVM / Txn-No-OnDev / Txn-OnDev） | 移动实现须支持 | 抬高 Reader CVM Required Limit；配 **On-device CVM 交易限额（更高）**让钱包受理更高额 |
| **Amex**（Expresspay） | CVM Required Limit + 读卡器能力 | Floor / CVM / Txn 限额 | 支持 | 抬高 CVM Required Limit；AFD/交通/无人值守场景常配 No CVM |
| **Discover**（D-PAS） | Floor / CVM / Txn 限额（与通用模型一致） | 三限额 | 支持 | 同上；ZIP（Zero/低额）场景免 CVM |
| **JCB**（J/Speedy 非接） | 限额 + 内核（含 `9F53` TIP 等专有） | 三限额 | 支持 | 抬高 CVM 限额；`9F53` 注意与通用 TCC 标签复用冲突 |
| **银联**（QuickPass / UPI） | TTQ(`9F66`) + 限额；**港(344)/新(702)有特殊借/贷记 CVM 规则** | 三限额 + 小额免密额度 | 支持 | 遵循区域小额免密额度；HK/SG 借记 vs 贷记 CVM 规则不同——见专文 |

> 一句话记忆：**Visa 靠"卡说了算"（CTQ）；Mastercard 靠"金额落在哪个限额带"；银联还叠加区域监管的小额免密额度。** 同一终端要"对所有品牌都尽量免密"，必须**逐内核分别配限额/能力位**，不能套同一套。

### 3.1 Visa：用 TTQ/CTQ 让终端"不再要 CVM"

- 终端在 GPO 经 PDOL 送 **TTQ**：金额 ≤ CVM Required Limit 时 **不置 Byte2 b7（CVM required）**；Byte3 b7=1 表示认可 CDCVM。
- 卡回 **CTQ**：Byte1 b8(Online PIN Required)/b7(Signature Required) 均为 0 → 终端无需 CVM → 放行。钱包做了 CDCVM 时，正是靠"CTQ 不要求 PIN/签名"来体现（Visa 合规卡 CTQ Byte2 b8 *未使用*，CDCVM 证据走 CVR/密文给发卡行）。
- 详见 [Visa TTQ/CTQ 与 CDCVM Token 化指示](./Visa-TTQ-CTQ与CDCVM-Token化指示.md)。

### 3.2 Mastercard：两个交易限额让钱包提额免密

- 金额 ≤ Reader CVM Required Limit → 仅 No CVM 方法可用（免密免签）。
- 金额 > CVM 限额 → 激活 **CVM Capability**（M/Chip / Mag-stripe）选 PIN/签名/CDCVM。
- 关键提额：**On-device CVM 交易限额 > No On-device CVM 交易限额**——支持 CDCVM 的手机钱包可在更高金额仍"无感免密"，普通卡则更早触顶。详见 [Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md)。

---

## 四、最大化免密免签的配置杠杆 vs 合规边界

"最大程度免密"不是把 CVM 全关——那会违反卡组/监管规则并在 L3 认证中失败。它是**在规则允许的上限内，把每条免密路径都铺满**：

### 4.1 五个杠杆（推高免密占比）

1. **CVM Required Limit 抬到区域/卡组允许的上限**——非接小额免验的总闸。
2. **全面支持 CDCVM**——手机/手表钱包在限额之上仍无感（Visa 强制、MC 移动实现强制）；终端须正确识别并放行（TTQ Byte3 b7 / Kernel 2 On-device 限额）。
3. **声明 No CVM 能力**——读卡器/终端 CVM 能力位（`9F33` / Reader CVM Capability）含 "No CVM"，否则低额也会被迫要 CVM。
4. **Floor Limit 配置得当**——小额走离线 No CVM，减少联机往返。
5. **Quick Chip / 联机免 CVM 场景**——交通、无人值守（AFD/停车）等受理类别按卡组规则配 No CVM。

### 4.2 不可逾越的合规边界（EMVCo 不允许"无脑免密"）

| 边界 | 含义 | 配错的后果 |
|------|------|------------|
| **卡/发卡行可强制 CVM** | 卡 CVM List 把 PIN 排在前、或 CTQ 置 Online PIN Required → 终端**必须跟随**，不能用配置覆盖 | 强行免密 = 偏离规范，L3 用例失败 |
| **区域监管限额** | 各国/区域对非接小额免密设单笔与累计上限（如欧洲 PSD2/SCA 的单笔约 €50、连续免接触累计阈值；各国数值不同且会调整）| 超限仍免密 → 违规、罚则、认证不通过 |
| **责任转移（liability）** | 低额 No CVM 的欺诈责任多数归**商户/收单**；CDCVM 已强验证则倾向发卡行 | 盲目抬高限额 = 自担欺诈风险 |
| **CVM Results / TVR 必须自洽** | `9F34`、`95` 要如实反映本笔 CVM 路径 | 与实际不符 → L3 报告判失败（参见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md)）|

> ⚠️ 区域限额的**精确数值**随监管与卡组政策变化（欧洲、英国、港、新各不相同，且历年调整）。本文给方向，**具体单笔/累计阈值请以对接区域的卡组织门户与监管最新版核对**，勿写死。

---

## 五、决策流程图（伪代码）

```
读卡(PPSE/SELECT) → 取金额 Amt、品牌/内核、终端能力
│
├─ 接触(Contact):
│    解析 CVM List(8E)，按 9F33 能力顺序匹配第一条满足条件的规则
│    ├─ 命中 No CVM required(0x1F) 且条件成立 → 免密免签 ✅
│    ├─ 命中 Offline/Online PIN          → 需 PIN（卡强制，不可越过）
│    └─ 命中 Signature                   → 需签名
│
└─ 非接(Contactless): 按品牌取限额/字段
     ├─ Amt > Transaction Limit                → 拒绝非接（改插卡）
     ├─ CDCVM 已执行(钱包) ?                    → 免密免签 ✅（任意金额）
     │      · Visa: CTQ 未要求 PIN/签名 + TTQ B3b7=1
     │      · MC:   走 On-device CVM 交易限额
     ├─ Amt ≤ CVM Required Limit                → No CVM → 免密免签 ✅
     │      · Visa: TTQ B2b7=0 且 CTQ 未要求
     │      · MC:   落在 ≤CVM 限额带，仅 No CVM 可用
     │      · 银联/HK·SG: 校验区域小额免密额度
     └─ Amt > CVM Required Limit 且 无 CDCVM     → 需 CVM(Online PIN/签名)
            · 卡若强制(CTQ/CVM List) → 跟随，不可免
```

---

## 六、实操与测试要点

- **"最大化免密"= 铺满两条路**：低额 No CVM（抬 CVM 限额）+ CDCVM（钱包无感），而非关闭 CVM。两条路要**分别配、分别测**。
- **接触免密空间有限**：取决于卡的 CVM List，终端不能单方面关 PIN；提升免密率主要靠**非接 + CDCVM**。
- **逐内核配限额**：Visa 看 TTQ/CTQ，MC 看四限额，银联叠加区域额度——同一终端对不同品牌的免密阈值与字段都不同，**不能套同一套**。
- **CDCVM 必测两条路径**：设备支持/不支持 CDCVM 在 MC 下走不同交易限额、在 Visa 下走 CTQ 是否要求 CVM；L3 用例（CDET TC11、M-TIP 非接）专门覆盖。
- **别让 `9F34`/`95` 撒谎**：CVM Results 与 TVR 必须如实反映免密路径，否则 L3 报告判失败（典型：声明 No CVM 但 TVR 置了"CVM 未成功"）。
- **合规优先于免密率**：区域监管限额、卡强制 CVM、责任转移是硬边界；抬限额前先确认对接区域上限与欺诈责任归属。

---

## 七、常见误区

- ❌ "把 CVM Required Limit 设成最大就全免密了" → 卡可强制 CVM（CTQ/CVM List），且超区域监管上限违规。
- ❌ "CDCVM 就是低额免密的一种" → CDCVM 是完整有效 CVM，**任意金额**成立，与低额 No CVM 不同闸。
- ❌ "Visa 那套 TTQ/CTQ 也适用 Mastercard" → MC 非接无 TTQ/CTQ，看四限额 + CVM Capability。
- ❌ "免密交易出了欺诈都是发卡行的事" → 低额 No CVM 的责任多数在商户/收单，CDCVM 才倾向发卡行。
- ❌ "接触也能靠终端配置免 PIN" → 接触 CVM 由卡 CVM List 主导，终端只能在自身能力交集内跟随。

---

**参考来源：**
- [EMV Book 3 — Application Specification（CVM List 8E / CVM Results 9F34）— EMVCo](https://www.emvco.com/specifications/)
- [接触与非接 CVM 详解](./接触与非接CVM详解.md)（本库 · CVM 全景与 8E/9F34/三大限额）
- [Contactless Limits and EMV Transaction Processing — US Payments Forum](https://www.uspaymentsforum.org/wp-content/uploads/2020/10/Contactless-Limits-WP-FINAL-October-2020.pdf)（本地：`web-docs/US-Payments-Forum-Contactless-Limits-2020.pdf`）
- [Consumer Device Cardholder Verification Method (CDCVM) Primer](https://prioritycommerce.com/wp-content/uploads/2020/01/CDCVM-Primer.pdf)
- [EMVCo Statement — CDCVM](https://www.emvco.com/resources/emvco-statement-consumer-device-cardholder-verification-method-cdcvm/)
- [Cardholder Verification Methods — Adyen Docs](https://docs.adyen.com/point-of-sale/cardholder-verification-methods)
- [EMV tag 8E (CVM List) — emvlab.org](https://emvlab.org/emvtags/show/t8E/)
