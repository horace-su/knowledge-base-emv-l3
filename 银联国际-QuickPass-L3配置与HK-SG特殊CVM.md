# 银联国际（UPI）QuickPass L3 配置与 HK/SG 特殊 CVM 规则

> 银联国际终端集成（UAC 接触 / QuickPass 非接）L3 测试前的终端配置要求，以及香港(344)/新加坡(702)两地的非接 CVM 特殊规则。承接 [JCB 与银联 L3 认证深度解析](./JCB与银联-L3认证深度解析.md)、[银联国内 PBOC 3.0 与国密](./银联国内-PBOC3.0与国密算法.md)、[Visa TTQ/CTQ 与 CDCVM](./Visa-TTQ-CTQ与CDCVM-Token化指示.md)、[接触与非接 CVM 详解](./接触与非接CVM详解.md)。
>
> 来源：UPI *IC Card Testing Guide for Acquirers V202409*（§1.4）、*QuickPass Testing Guide for Acquirers V202409*（Ch.4–5），以及一份面向商户的 HK&SG 特殊处理规则说明（归档于 [`web-docs/`](./web-docs/)，见 [`SOURCES.md`](./web-docs/SOURCES.md)）。

---

## 一、UnionPay AID（接触/非接共用）

| AID | 卡类型 | 适用 |
|-----|--------|------|
| `A000000333010101` | UnionPay Debit（借记卡） | 必选 |
| `A000000333010102` | UnionPay Credit（贷记卡） | 必选 |
| `A000000333010103` | UnionPay Quasi Credit（准贷记卡） | 必选 |
| `A000000333010106` | UnionPay ECash（电子现金） | 仅香港/澳门 |
| `A000000333010108` | UnionPay Common AID | 仅美国 |

> RID `A000000333` 与 [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md) 一致。注意上节 [实例报告](./L3认证实例-Sunmi-T6F10终端配置剖析.md) 里 Discover 终端**主动排除**了这些 UPI AID——UPI 走独立 L3 程序。

---

## 二、接触式（IC Card）EMV 内核参数

| 参数 | 值 | 说明 |
|------|----|----|
| Application Priority Indicator | `00` | |
| Application Version Number | `0x0030` | AVN |
| **TAC – Denial** | `00 00 00 00 00` | 见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md) |
| **TAC – Online** | `DC 40 04 F8 00` | |
| **TAC – Default** | `D8 40 00 A8 00` | |
| Terminal Floor Limit | `00000000` | 设 0 → 全部联机 |
| Max/Target % Random Selection | `99` / `99` | |
| Threshold（偏置随机） | `00000000` | |
| DDOL | `9F3704` | 仅含 `9F37` Unpredictable Number 4 字节 |
| Terminal Online PIN Support | `01` | 支持联机 PIN |
| Default TDOL | N/A | 不需配置 |

### UPI **测试环境** CA 公钥（RID `A000000333`）

> ⚠️ **测试密钥，非生产**。生产 CAPK 必须以官方密钥文件为准（参见 [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md) 对测试 vs 真实密钥的强调）。

| Index | 长度 (bits) | Exponent | Hash 前缀 |
|-------|-------------|----------|-----------|
| `0x08` | 1152 | `03` | `EE23B616C95C…E85A` |
| `0x09` | 1408 | `03` | `A075306EAB00…F527` |
| `0x0B` | 1984 | `03` | `BD331F9996A4…F66C` |

（完整 Modulus 见归档 PDF `web-docs/APA-UPI-Terminal-Changes-and-Setting-draft.pdf`。）

---

## 三、QuickPass（非接）附加参数 — TTQ `9F66`

在接触参数基础上，非接还需配置 **Terminal Transaction Qualifier（`9F66`）**（位级解析见 [Visa TTQ/CTQ](./Visa-TTQ-CTQ与CDCVM-Token化指示.md)，UPI QuickPass 复用同一对象）：

| Byte | Bit | POS/CAT/mPOS | 含义 |
|------|-----|--------------|------|
| 1 | 7 | 0 | 不支持 contactless UICC（按字面，UPI 用法） |
| 1 | 6 | 1 | 支持 contactless qUICC |
| 1 | 5 | 按终端类型 | 依实际终端类型设置 |
| 1 | 4 | 0 | 终端具有联机能力 |
| 1 | 3 | 1 | 支持联机 PIN |
| 1 | 2 | 1 | 支持签名 |
| 2 | 8 | 1 | 要求联机密文（online cryptogram） |
| 2 | 7 | 0 | 默认不请求 CVM |

> 另需配置非接交易货币、限额，并满足 **TVR(`95`)/TSI(`9B`) 输出**要求——测试人员需采集 TVR/TSI 提交 UPI 审核，注意 **2nd GENERATE AC** 后的取值。

---

## 四、HK(344) / SG(702) 非接特殊 CVM 规则

UPI 对港新两地的非接交易**覆盖标准 EMV CVM 流程**。判定依据：卡类型（借记 vs 贷记）、金额相对 **CVM Limit（`DF21`）**、国家代码。

### 借记卡（Debit，`A000000333010101`）

| 地区 | 场景 | PIN | 签名 |
|------|------|-----|------|
| **HK (344)** | 任意金额（含 < CVM Limit） | **强制 Online PIN**（Kernel 未请求也须弹 PIN 键盘） | 仅当 ≥ CVM Limit 或 PIN 被跳过时需要 |
| **SG (702)** | — | **无**特殊规则，按标准 EMV | — |

> HK 借记卡：所有非接交易都必须提示 Online PIN，不论金额。在线处理阶段即使 Kernel 没请求 PIN，终端仍应显示 PIN 键盘；**TLV 数据无需与实际 CVM 情况完全匹配**。

### 贷记卡（Credit，`…0102` / `…0103`）— HK 与 SG 规则一致

| 场景 | PIN | 签名 |
|------|-----|------|
| 金额 < CVM Limit | **主动跳过 PIN**（即使 Kernel 请求） | 不需要 → 免密免签 |
| 金额 ≥ CVM Limit 且 CVM = Online PIN | 按标准 EMV | **额外要求签名**（UPI 特殊） |
| 金额 ≥ CVM Limit 且 CVM ≠ Online PIN | 按标准 EMV | 按标准 EMV |
| PIN 被跳过(Bypass) | — | 按标准 EMV |

### 适用边界

- 非银联卡、HK/SG 以外的银联卡、**接触式（插卡）交易** → 全部按标准 EMV 流程，本特殊规则**仅适用于非接/Tap**。
- HK vs SG 差异小结：**借记卡特殊规则仅 HK 有**（强制 Online PIN）；**贷记卡特殊规则 HK/SG 都有且一致**。
