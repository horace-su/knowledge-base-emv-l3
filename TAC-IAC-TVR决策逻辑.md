# TAC / IAC / TVR 决策逻辑（终端行为分析）

> 这是贯穿**所有卡组织**的 EMV 风险管理核心：终端如何根据交易中检测到的异常（TVR），结合终端策略（TAC）与发卡行策略（IAC），决定**离线批准 / 转联机 / 离线拒绝**。
> 关联：[终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md)（TAC 是 per-AID 配置）·[接触与非接 CVM 详解](./接触与非接CVM详解.md)

---

## 一、三个角色

| 元素 | 标签 | 字节 | 谁定义 | 作用 |
|------|------|------|--------|------|
| **TVR**（Terminal Verification Results） | `95` | 5 | 终端**运行时生成** | 记录本次交易检测到的所有异常/条件 |
| **TAC**（Terminal Action Code） | （配置） | 5 | **收单方/终端**（per-AID） | 终端的风险策略 |
| **IAC**（Issuer Action Code） | `9F0D/9F0E/9F0F` | 5 | **发卡行**（写在卡上） | 发卡行的风险策略 |

- TAC/IAC 各有三种：**Denial（拒绝）、Online（转联机）、Default（离线默认）**。
  - IAC：IAC-Denial `9F0E`、IAC-Online `9F0F`、IAC-Default `9F0D`。

> **TVR 是"病历"，TAC/IAC 是"诊断规则"**。终端把 TVR 分别与 TAC、IAC 按位比对，得出处置。

---

## 二、TVR（95）5 字节位含义

| 字节 | 主要位 | 含义 |
|------|--------|------|
| **Byte 1（ODA）** | b8 | 离线数据认证未执行 |
| | b7 | **SDA 失败** |
| | b6 | ICC 数据缺失 |
| | b5 | 卡在异常文件中 |
| | b4 | **DDA 失败** |
| | b3 | **CDA 失败** |
| | b2 | 选择了 SDA |
| **Byte 2（应用版本/用途）** | b8 | ICC 与终端应用版本不一致 |
| | b7 | 应用已过期 |
| | b6 | 应用尚未生效 |
| | b5 | 请求的服务不允许 |
| | b4 | 新卡 |
| **Byte 3（CVM）** | b8 | 持卡人验证不成功 |
| | b7 | 无法识别的 CVM |
| | b6 | PIN 尝试次数超限 |
| | b5 | PIN pad 缺失/故障 |
| | b4 | 要求 PIN 但未输入 |
| | b3 | 在线 PIN 已输入 |
| **Byte 4（风险管理/限额）** | b8 | **交易超地板限额（floor limit）** |
| | b7 | 低额离线限额超限 |
| | b6 | 高额离线限额超限 |
| | b5 | **随机抽中转联机** |
| | b4 | 商户强制联机 |
| **Byte 5（发卡行认证/脚本）** | b8 | 使用了默认 TDOL |
| | b7 | **发卡行认证失败** |
| | b6 | 最终 GAC 前脚本处理失败 |
| | b5 | 最终 GAC 后脚本处理失败 |

---

## 三、决策流程（Terminal Action Analysis）

终端按 **Denial → Online → Default** 顺序，把 TVR 与（TAC OR IAC）按位"与"判断：

```
1) 拒绝判定：若 (TVR AND (TAC-Denial OR IAC-Denial)) ≠ 0
       → 离线拒绝 → 向卡请求 AAC

2) 联机判定：否则若 (TVR AND (TAC-Online OR IAC-Online)) ≠ 0
       → 转联机 → 向卡请求 ARQC
   （注：离线-only 终端无法联机时，跳到 Default 判定）

3) 默认判定（仅当终端无法联机时）：
       若 (TVR AND (TAC-Default OR IAC-Default)) ≠ 0
           → 离线拒绝 → AAC
       否则 → 离线批准 → 请求 TC
```

### 三种密文（GENERATE AC 的输出）
| 密文 | 含义 | 对应决策 |
|------|------|----------|
| **AAC**（Application Authentication Cryptogram） | 拒绝 | 离线拒绝 |
| **ARQC**（Authorization Request Cryptogram） | 联机请求 | 转发卡行联机 |
| **TC**（Transaction Certificate） | 批准 | 离线批准 |

> 终端通过 **GENERATE AC** 命令把决策下达给卡；**卡有最终否决权**（可降级，如终端要 TC、卡仍可返回 ARQC 或 AAC）。

---

## 四、TAC vs IAC 的配合

- **逻辑或关系**：判定时用 `TAC-X OR IAC-X` ——**任一方认为该条件需拒绝/联机，即生效**。
- **TAC**：收单方按地区/品牌要求配置（卡组织常给推荐值）。
- **IAC**：发卡行写在卡里；若卡无 IAC，则按规范用默认值（IAC-Default 全 1 = 任何异常都拒绝；IAC-Online 全 1 = 任何异常都联机）。
- **TAC-Default 的意义**：仅在**终端无法联机**时作为"最后防线"决定批准还是拒绝（见 [TAC-Default 专题]）。

---

## 五、两次 GENERATE AC（First / Second GAC）

| 阶段 | 时机 | 说明 |
|------|------|------|
| **First GAC** | 终端行为分析后 | 终端请求 TC/ARQC/AAC；离线批准(TC)或拒绝(AAC)在此结束 |
| **联机** | 若 ARQC | 送发卡行，返回 ARPC + 授权响应；终端做发卡行认证 |
| **Second GAC** | 联机返回后 | 终端再请求 TC（批准）或 AAC（拒绝）；处理发卡行脚本 |

---

## 六、与 L3 测试的关联

- **TVR/TAC/IAC 是大量 L3 用例的判定核心**：ODA 失败（TVR B1）、CVM 异常（B3）、超限（B4）、发卡行认证失败（B5 b7）等场景，用例都在验证终端是否生成**正确的密文（AAC/ARQC/TC）**。
- **ADVT 相关**：TC4（终端风险管理/floor limit）、TC7（TACs 配置）、TC21/22（PIN 超限→TVR B3 b6）等直接考察该逻辑。
- **配置正确性**：TAC 配错（如该联机的没联机）= 现场风险敞口；L3 就是要在上线前抓出来。

---

## 七、实操与排错要点

- **记住"或"逻辑**:TAC 或 IAC 任一置位即触发——排错时两边都要看。
- **顺序固定**:Denial 先于 Online 先于 Default;一旦 Denial 命中立即离线拒绝(AAC),不再往下。
- **卡可降级**:终端要 TC,卡可能仍返回 ARQC/AAC;别假设终端决策就是最终结果。
- **floor limit / 随机/强制联机**:TVR Byte4 是联机决策高频位;终端 floor limit、随机选择阈值配置直接影响。
- **发卡行认证失败(B5 b7)**:联机后 ARPC 验证失败会置位,Second GAC 据此可能拒绝。
- **TAC-Default 仅离线兜底**:联机能力正常的终端,Default 基本不触发;纯离线/通信失败时才是关键。

---

**参考来源：**
- [Terminal Verification Results — Grokipedia](https://grokipedia.com/page/Terminal_verification_results)
- [Understanding Terminal Action Code (TAC) in EMV — EazyPay Tech](https://eazypaytech.com/terminal-action-code-in-emv/)
- [TAC–Default: The EMV Terminal's Last Line of Defense — EazyPay Tech](https://eazypaytech.com/tac-default-in-emv/)
- [Terminal Action Analysis — Ambimat](https://ambimat.com/terminal-action-analysis/)
- [Terminal Action Analysis — OpenSCDP](https://www.openscdp.org/scripts/tutorial/emv/terminalactionanalysis.html)
- [EMV tag 95 (TVR) — emvlab.org](https://emvlab.org/emvtags/show/t95/)
