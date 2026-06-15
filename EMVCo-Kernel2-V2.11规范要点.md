# EMVCo Book C-2 Kernel 2 规范要点（V2.11, June 2023）

> 从 EMVCo 权威规范提取 Mastercard 非接内核（Kernel 2）的架构与关键数据结构：进程模型、Data Exchange 信号、Outcome Parameter Set、Data Record、四大读卡器限额、Relay Resistance Protocol(RRP) 与 Kernel Configuration。深化 [EMV Contactless Kernel Deep Dive](./emv-contactless-kernel-deep-dive.md)、[Mastercard 非接 CVM 机制与 FFI](./Mastercard非接CVM机制与FFI.md)，并为 [DE55 跨卡组织要求](./ISO8583-字段55-跨卡组织要求.md) 提供"数据从何而来"。
>
> 来源：EMVCo *Contactless Book C-2, Kernel 2 Specification v2.11*（2023-06，归档于 [`web-docs/`](./web-docs/)，见 [`SOURCES.md`](./web-docs/SOURCES.md)）。Kernel 2 = **支付品牌 Mastercard**（见 [内核映射](./emv-contactless-kernel-deep-dive.md)）。

---

## 一、进程模型（General Architecture）

Reader 侧由若干"进程"协作：

| 进程 | 职责 |
|------|------|
| **Process P** | Pre-processing / 协议激活前处理 |
| **Process D** | 设备/卡片探测与防冲突 |
| **Process C** | 组合选择（Combination Selection，AID + Kernel） |
| **Process K** | **内核本体**：执行交易、读写卡、产出结果 |
| **Process M** | 管理层：调用 K 的服务、解析 Outcome 并执行后续指令 |

**Process K 的服务（Table 2.3/2.4）以"信号"驱动：**

| 信号 | 含义 |
|------|------|
| `ACT(Data)` | 启动内核，返回授权/清算记录；K 回 **`OUT`** 信号 |
| `DET(Data)` | 向内核/卡**写**数据（Data Exchange Terminal→Kernel） |
| `DEK` | 内核请求终端**补充**数据 / 回吐数据（Data Exchange Kernel→Terminal） |
| `OUT` | 交易结束输出：**Outcome Parameter Set + Data Record(if any) + Discretionary Data + User Interface Request Data(if any)** |

> Data Exchange 机制（DET/DEK）让终端在交易过程中按需向内核请求额外标签（`Tags To Read`），或注入配置数据——这是 DE55 里出现"附加标签"的底层通道（见 [DE55](./ISO8583-字段55-跨卡组织要求.md)）。

---

## 二、Outcome Parameter Set（结果参数集）

内核交易完成时输出 Outcome，其 **`Status`** 字段是后续动作的总指挥，取值（EMVCo Kernel 2 标准结果）：

- `APPROVED`（离线批准）
- `DECLINED`（离线拒绝）
- `ONLINE REQUEST`（请求联机授权 → 终端发 DE55 上送）
- `TRY ANOTHER INTERFACE`（改用接触/磁条）
- `TRY AGAIN`（重试拍卡）
- `SELECT NEXT`（选下一个组合）
- `END APPLICATION`（终止）

Outcome 还携带 CVM 指示（如 `'CVM' := ONLINE PIN` 等价于"byte4 bit4-1 = 0010b"）、UI 请求、是否需 receipt 等。Process M 解析 `Status` 并据其它字段执行（Book C-2 §2 步骤 6–7）。

---

## 三、Data Record 与 Discretionary Data

- **Data Record（`FF8105`）**：随 Outcome 返回的 **TLV 列表**——"交易完成时返回的 EMV 数据对象清单"。EMV 模式见 Table 4.6、磁条模式见 Table 4.7。构造逻辑：`FOR every Data Object IF IsPresent(Tag) THEN AddToList`，**只放当前存在的标签**。
- 这就是 DE55 的"原料表"：`9F26/9F27/9F10/9F36/9F37/95/82/5A/9F33/9F34/9F1A/5F2A/9F02/9C/9A…`，v2.11 起新增 **Token Requestor ID `9F19`** 与 **Payment Account Reference `9F24`**（详表见 [DE55 §二](./ISO8583-字段55-跨卡组织要求.md)）。
- **Discretionary Data（`DF8106` 等）**：OUT 中**总会**包含，内容随交易 profile 变化，常用于异常/诊断数据（含 bitmap 表达，Book C-2 §4.5.4）。
- **Data To Send（`FF8104`）**：内核经 DEK 累计发给终端的数据对象。

---

## 四、四大读卡器限额（Reader Limits）

Kernel 2 用四个限额决定交易路径（与 [Mastercard 非接 CVM 与 FFI](./Mastercard非接CVM机制与FFI.md) 的"四大限额"对应）：

| 数据元 | 作用 |
|--------|------|
| **Reader Contactless Floor Limit**（`DF8123`） | 低于则可离线、高于则联机 |
| **Reader Contactless Transaction Limit (No On-device CVM)**（`DF8124`） | 无设备端 CVM 时的交易上限，超过则拒绝/改接口 |
| **Reader Contactless Transaction Limit (On-device CVM)**（`DF8125`） | 有 CDCVM 时的交易上限 |
| **Reader CVM Required Limit**（`DF8126`） | 超过则必须做 CVM |

> 注意：Mastercard 把"交易限额"按 **On-device CVM 有/无**拆成两个（与 Visa 单一 CVM 限额不同）——这是 [接触与非接 CVM 详解](./接触与非接CVM详解.md) 已标注的关键差异。

---

## 五、Relay Resistance Protocol（RRP）

防中继攻击：终端测量 **Exchange Relay Resistance Data** 命令的往返时间，与卡声明的处理时间比对，超出门限则置位 TVR/影响 ODA。相关数据元：

- `Min/Max Time For Processing Relay Resistance APDU`、`Device Estimated Transmission Time`（`DF8132`…）
- `Relay Resistance Accuracy Threshold`、`Transmission Time Mismatch Threshold`、`Min/Max Relay Resistance Grace Period`、`RRP Counter`

> [Sunmi T6F10 报告](./L3认证实例-Sunmi-T6F10终端配置剖析.md) 的 MC 非接配置即标注 **"RRP activated = Yes"**——RRP 已是现行 MCL 终端的常见要求。

---

## 六、Kernel Configuration 与交易模式

- **Kernel Configuration（`DF811B`）**：开关 EMV 模式 / Mag-stripe 模式、On-device CVM 支持、RRP 等。
- 两种交易模式：**EMV mode**（Data Record 含 EMV 类标签）与 **Mag-stripe mode**（仅 MAG Implementation Option 实现，Data Record 见 Table 4.7）。
- 组合选择后内核据 AIP/profile 进入对应模式。

---

## 七、V2.11 相对 V2.10 的变化（Revision Log）

并入 **Specification Bulletin No. 261（2021-10）"Implementation Options for EMV Book C-2 V2.10"**，主要：

- 第 2、3 章简化以反映 SB261 的功能变更。
- **User Interface Request Data** 移除 `Value Qualifier`/`Value`/`Currency Code` 字段，长度改为 **13 字节**。
- 从 GET DATA 可取数据与 Data Dictionary 中**移除 Offline Accumulator Balance**。
- Data Dictionary 与 Data Record **新增 Token Requestor ID（`9F19`）**。

> 实务含义：做 Kernel 2 相关 L3/L2 时，UI Request Data 长度、Token Requestor ID 的出现与否要按 v2.11 校验；引用旧版（v2.10 及更早）的字段定义可能不一致。
