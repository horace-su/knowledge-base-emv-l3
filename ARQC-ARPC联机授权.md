# ARQC / ARPC 联机授权(两次 GENERATE AC 与发卡行认证)

> 接 [TAC / IAC / TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md):终端判定"转联机"之后会发生什么?本文讲清**应用密文(Application Cryptogram)的完整一来一回**——卡生成 **ARQC** → 经 Field 55 上送发卡行 → 发卡行验证并回 **ARPC** → 卡做发卡行认证 → 第二次 GENERATE AC 出 TC/AAC,以及夹带其中的**发卡行脚本(71/72)**。
> 关联:[ISO 8583 与 Field 55 报文层](./ISO8583与Field55报文层.md)(ARQC/ARPC 的报文载体)·[TAC / IAC / TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md)·[ODA 证书链字节级](./ODA证书链字节级.md)(离线数据认证,与联机密文是两套机制)

---

## 一、三种应用密文(由 CID `9F27` 指示)

终端发 **GENERATE AC** 命令,卡根据自身风险管理与终端请求,返回三种密文之一:

| 密文 | 含义 | 触发 |
|------|------|------|
| **AAC** | Application Authentication Cryptogram | **离线拒绝** |
| **TC** | Transaction Certificate | **离线批准**(交易完成) |
| **ARQC** | Authorization Request Cryptogram | **请求联机授权**(本文主线) |

- 终端在 GENERATE AC 的 P1 参数里**请求**某种密文,但**最终类型由卡决定**(卡可"降级":请求 TC 却返回 ARQC 或 AAC)。
- 返回的 CID(`9F27`)明确标出本次实际是 AAC / TC / ARQC。

---

## 二、第一次 GENERATE AC:卡生成 ARQC

1. 终端依据 **CDOL1**(Card Risk Management Data Object List 1,`8C`)收集卡要求的数据(金额 `9F02`、UN `9F37`、TVR `95`、货币 `5F2A`、日期 `9A`、交易类型 `9C`、AIP/ATC 等)。
2. 终端发 **GENERATE AC**(请求 ARQC),把 CDOL1 数据传给卡。
3. 卡用**应用密文密钥(AC key)**派生的会话密钥,对(CDOL1 数据 + 卡内部数据)做 MAC,得到 **ARQC = `9F26`**。
4. 卡同时返回:
   - **CID `9F27`** = ARQC
   - **ATC `9F36`** = 应用交易计数器(每笔 +1,防重放)
   - **IAD `9F10`** = 发卡行应用数据(含 **CVR** Card Verification Results、密钥派生指示、**CVN** 密码版本号)

> ARQC 是**对称密钥 MAC**,与 ODA(SDA/DDA/CDA 的 RSA 公钥体系)是**两套独立机制**:ODA 在离线阶段验"卡是不是真的",ARQC/ARPC 在联机阶段做"发卡行 ↔ 卡"的双向认证。

---

## 三、上送发卡行:打进 Field 55

终端把 ARQC(`9F26`)、CID(`9F27`)、ATC(`9F36`)、IAD(`9F10`)、UN(`9F37`)、TVR(`95`)、金额、货币、日期…… 打包进 **ISO 8583 的 Field 55**,以 `0100/0200` 授权请求上送(报文结构见 [ISO 8583 与 Field 55 报文层](./ISO8583与Field55报文层.md))。

---

## 四、发卡行侧:验 ARQC,生成 ARPC

1. 发卡行用同源密钥**重算 ARQC** 比对——验证卡的真实性与数据完整性(防重放靠 ATC + UN)。
2. 发卡行结合自身风控(余额、限额、黑名单等)给出授权决定(DE39 响应码)。
3. 发卡行生成 **ARPC(Authorization Response Cryptogram)**,连同 **ARC / CSU**(响应处理结果)组成 **Issuer Authentication Data = `91`**,经 Field 55 回写。
   - **ARPC 两种算法**:① 由 ARQC ⊕ ARC 再加密(传统 CVN10 风格);② 基于 **CSU**(Card Status Update)的方式(CVN18/qVSDC 风格)。具体取决于 **CVN**(写在 IAD `9F10` 里)。

> **CVN(Cryptogram Version Number)** 决定 ARQC/ARPC 的算法细节与参与数据。常见:Visa CVN10 / CVN17 / CVN18,Mastercard M/Chip CVN 等。L3 测试需确保终端按卡声明的 CVN 正确处理。

---

## 五、第二次 GENERATE AC:卡做发卡行认证,出 TC/AAC

1. 终端把 `91`(Issuer Authentication Data)交给卡:
   - 经 **EXTERNAL AUTHENTICATE** 命令,或
   - 直接作为**第二次 GENERATE AC** 的输入(依 AIP 是否声明"支持发卡行认证")。
2. 卡**验证 ARPC**:
   - 通过 → 卡确认"这是我的发卡行授权的",按 **CDOL2**(`8D`)数据返回 **TC**(交易批准完成)。
   - 失败 / 发卡行拒绝 → 返回 **AAC**(拒绝)。
3. 第二次返回新的 CID、可能更新的 ATC/IAD,终端据此完成交易并(若需要)上送结果。

> 若联机不可达(超时/通信失败),终端按 **TAC/IAC-Default** 与 AIP 决定离线默认动作(见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md)):可能本地批准(TC)、拒绝(AAC)或冲正。

---

## 六、发卡行脚本(Issuer Script,`71` / `72`)

发卡行可借授权响应**下发命令给卡**(改 PIN、解锁应用、更新限额、封卡等):

| 模板 | Tag | 执行时机 |
|------|-----|----------|
| Script Template 1 | **`71`** | **第二次 GENERATE AC 之前** |
| Script Template 2 | **`72`** | **第二次 GENERATE AC 之后** |

- 脚本内是一串安全报文命令(常为 `PUT DATA` / `APPLICATION BLOCK` / `PIN CHANGE` 等,带 MAC 与可选加密)。
- 终端执行后,把**脚本结果**上报(脚本标识 `9F18`、Script Results `9F5B`)。L3 测试会校验时序(71 vs 72)与结果回报正确。

---

## 七、端到端时序速记

```
终端                          卡                        发卡行(经收单)
  │  GENERATE AC(req ARQC) →  │
  │                           │ 算 ARQC(9F26)+CID+ATC+IAD
  │  ← 9F26/9F27/9F36/9F10    │
  │  ── 打进 Field 55,0100 授权请求 ──────────────────→ │
  │                                                      │ 验 ARQC、风控
  │  ←──── 0110 响应(DE39 + Field 55: 91=ARPC[,71/72]) ─┤ 生成 ARPC
  │  (执行 71 脚本)→           │
  │  EXTERNAL AUTH / 2nd GEN AC(含 ARPC) → │
  │                           │ 验 ARPC → TC / AAC
  │  ← 9F27(TC|AAC)           │
  │  (执行 72 脚本)→           │
```

---

> 说明:ARQC/ARPC 的精确算法、参与数据与 CDOL 内容随**卡组织 + CVN**变化(EMV Book 2 定义框架,各卡组织在其上裁剪);精确字段与 CVN 行为以各卡组织当前规范为准。
