# ISO 8583 与 Field 55（EMV TLV）报文层

> L3 是**端到端集成**测试:前半段是"终端 ↔ 卡"(本库大部分文档),后半段是**"终端/收单 ↔ 发卡行"的报文交互**。后半段的载体就是 **ISO 8583 报文**,而其中承载 EMV 芯片数据的关键域是 **Field 55（DE 55, ICC System-Related Data）**。本文讲清 ISO 8583 骨架、Field 55 里装什么、L3 主机测试在校验什么。
> 关联:[ARQC / ARPC 联机授权](./ARQC-ARPC联机授权.md)(Field 55 里最核心的密文)·[TAC / IAC / TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md)(终端"转联机"之后即进入本文)·[各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md)

---

## 一、ISO 8583 骨架(够用版)

ISO 8583 是银行卡交易报文标准。一条报文 = **MTI + 位图(Bitmap) + 数据元(Data Elements)**。

### 1. MTI(Message Type Indicator,4 位)

| MTI | 含义 | 方向 |
|-----|------|------|
| `0100 / 0110` | 授权请求 / 授权响应(Authorization) | 收单→发卡 / 发卡→收单 |
| `0200 / 0210` | 金融请求 / 响应(Financial,直接记账) | 同上 |
| `0420 / 0430` | 冲正请求 / 响应(Reversal) | 同上 |
| `0800 / 0810` | 网络管理(签到/密钥交换等) | 双向 |

> 联机授权场景下,L3 测试主要围绕 `0100/0110`(或 `0200/0210`)这一来一回。

### 2. Bitmap + Data Elements

- **位图**标记本条报文出现了哪些 DE(64 位主位图,置位则第二位图存在,扩展到 128)。
- 每个 DE 有固定编号与格式。L3 关心的关键 DE:

| DE | 名称 | 说明 |
|----|------|------|
| **DE 2** | PAN / Token | 主账号或网络 Token(DPAN) |
| **DE 3** | Processing Code | 交易类型(消费/取现/退货…),对应 EMV `9C` |
| **DE 4** | Amount, Transaction | 交易金额,对应 EMV `9F02` |
| **DE 11** | STAN | 系统跟踪号(配对请求/响应) |
| **DE 22** | POS Entry Mode | 录入方式(接触/非接/磁条/手输),决定是否带 Field 55 |
| **DE 35/45** | Track 2 / Track 1 | 磁条数据(磁条模式或 fallback) |
| **DE 39** | Response Code | 响应码(00=批准,05=拒绝,01=转人工…) |
| **DE 41/42** | Terminal ID / Merchant ID | 终端与商户标识 |
| **DE 52** | PIN Data | 加密 PIN block(联机 PIN) |
| **DE 55** | **ICC System-Related Data** | **承载 EMV TLV——本文重点** |

---

## 二、Field 55:EMV TLV 的容器

**DE 55 不是单一值,而是一串 EMV `tag-length-value`(TLV)对。** POS Entry Mode(DE 22)指示芯片交易时,终端把交易中产生的 EMV 数据对象打包进 DE 55 上送发卡行;发卡行也通过 DE 55 把响应数据(如 ARPC、发卡行脚本)回写。

### 1. 授权请求(0100)中 Field 55 常见 tag

| Tag | 名称 | 作用 |
|-----|------|------|
| **`9F26`** | Application Cryptogram(**ARQC**) | 卡生成的联机授权密文——发卡行据此验真,见 [ARQC/ARPC](./ARQC-ARPC联机授权.md) |
| **`9F27`** | Cryptogram Information Data(CID) | 指示密文类型(ARQC/TC/AAC) |
| **`9F10`** | Issuer Application Data(IAD) | 发卡行应用数据(含 CVR、密钥派生、CVN) |
| **`9F36`** | ATC | 应用交易计数器(防重放) |
| **`9F37`** | Unpredictable Number(UN) | 终端随机数(进密文计算) |
| **`95`** | TVR | 终端验证结果(见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md)) |
| **`9B`** | Transaction Status Information(TSI) | 交易状态(执行了哪些功能) |
| **`9F1A`** | Terminal Country Code | 终端国家 |
| **`5F2A`** | Transaction Currency Code | 交易货币 |
| **`82`** | AIP | 应用交互特征 |
| **`9A`** | Transaction Date | 交易日期 |
| **`9C`** | Transaction Type | 交易类型 |
| **`9F02`** | Amount, Authorized | 授权金额 |
| **`9F03`** | Amount, Other | 其他金额(如取现) |
| **`9F33`** | Terminal Capabilities | 终端能力 |
| **`9F34`** | CVM Results | CVM 执行结果(见 [接触与非接 CVM 详解](./接触与非接CVM详解.md)) |
| **`9F35`** | Terminal Type | 终端类型 |
| **`9F09`** | Application Version Number | 应用版本 |
| **`84` / `9F06`** | DF Name / AID | 选中的应用标识 |

> 哪些 tag 必须出现,取决于**卡组织 + CVN(密码版本)**。各卡组织对 Field 55 必含 tag 有明确清单(Visa VIS / qVSDC、Mastercard M/Chip、银联 UICS 等),L3 测试会逐项核对。

### 2. 授权响应(0110)中 Field 55 回写的 tag

| Tag | 名称 | 作用 |
|-----|------|------|
| **`91`** | Issuer Authentication Data | **ARPC + ARPC Response Code/CSU**——卡做发卡行认证用,见 [ARQC/ARPC](./ARQC-ARPC联机授权.md) |
| **`71`** | Issuer Script Template 1 | 发卡行脚本(在第二次 GENERATE AC **之前**执行) |
| **`72`** | Issuer Script Template 2 | 发卡行脚本(在第二次 GENERATE AC **之后**执行) |
| **`9F18`** | Issuer Script Identifier | 脚本标识(用于结果上报) |

---

## 三、L3 主机测试在校验什么

报文层 L3 的核心不是"卡逻辑对不对"(那是 L2),而是**终端/收单系统能否正确打包、上送、解析、回写这些数据**:

1. **TLV 编码正确性**:Field 55 的 tag-length-value 结构合法,长度域正确,无多余/缺失 tag。
2. **数据一致性**:Field 55 内的 EMV 对象(金额 `9F02`、货币 `5F2A`、TVR `95`、ATC `9F36` 等)与终端实际交易数据、与其他 DE(如 DE4 金额、DE49 货币)**互相吻合**。
3. **密文链路通畅**:请求中的 ARQC(`9F26`)能被(模拟)发卡行验证,响应中的 ARPC(`91`)能正确回写并被卡接受——这是 [ARQC/ARPC](./ARQC-ARPC联机授权.md) 文档的主题。
4. **发卡行脚本处理**:`71/72` 脚本被终端正确取出、按时序下发给卡,脚本结果(`9F5B`/脚本结果)正确上报。
5. **异常与冲正**:超时、拒绝(DE39)、部分批准、冲正(0420)等路径的报文正确生成。

> 测试工具中,**ASTREX** 等主机/端到端模拟器正是用来在 L3 阶段模拟发卡行,校验 Field 55 与授权报文(见 [FIME L3 测试工具深度解析](./FIME-L3测试工具深度解析.md):"BTT 面向终端的品牌测试;ASTREX 面向主机/端到端模拟")。

---

> 说明:DE 编号沿用 ISO 8583:1987 常见用法(各卡组织/网络的私有规格会有差异,如 Visa BASE I、Mastercard 的 DE 定义略有出入);Field 55 的必含 tag 清单以各卡组织当前接口规范为准。
