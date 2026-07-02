# EMV 3-D Secure：AReq / ARes 报文字段与认证结果（transStatus / transStatusReason）

> EMV 3-D Secure 2.x 是**卡不在场（CNP）**下把交易风险从商户转移给发卡行的认证协议，也是[拒绝治理](./ISO8583-DE39应答码与拒绝治理.md)里"风险类拒绝（RC 59/63、MAC 83）改用 3DS 重认证"这条路的技术载体。本文梳理认证请求 **AReq** / 响应 **ARes** 的关键数据元，以及最终裁决位 **transStatus** 与 **transStatusReason** 的取值。
>
> 关联：[ISO 8583 DE39 应答码与拒绝治理](./ISO8583-DE39应答码与拒绝治理.md)（3DS 是风险类拒绝的挽回手段）·[实测案例：Visa 非接 59 → ARC 反解](../07-实测案例/实测案例-Visa非接59拒绝-ARC反解.md)（`transStatusReason 01/11` 正对应案例里"卡认证失败 vs 疑似欺诈"之分）。
>
> ⚠️ 本文字段/码值据 EMVCo *EMV® 3-D Secure Protocol and Core Functions Specification*（最新 **v2.3.1.1**）及其字段实现文档整理；EMVCo 规范 PDF 需同意 ToU 下载，字段以门户最新版为准。3DS 属 CNP 领域，与本库 card-present L3 主线**相邻**——录此为拒绝治理链的完整闭环。

---

## 一、四对报文与三域模型

3DS 三域：**Acquirer Domain**（商户/3DS Requestor/3DS Server）— **Interoperability Domain**（Directory Server，卡组织）— **Issuer Domain**（ACS，发卡行/其代理）。核心报文四对：

| 报文对 | 方向 | 作用 |
|--------|------|------|
| **AReq → ARes** | 3DS Server →(DS)→ ACS → 回 | 认证请求/响应；ARes 里 `transStatus` 决定走无感还是有感 |
| **CReq ↔ CRes** | 有感挑战时，SDK/浏览器 ↔ ACS | 承载挑战交互（OTP/生物识别/银行 App）|
| **RReq → RRes** | ACS →(DS)→ 3DS Server | 挑战完成后回传**最终** `transStatus` |
| **PReq/PRes** | 3DS Server ↔ DS | 预备消息，取协议版本与 ACS/DS 能力 |

- **无感流（Frictionless）**：ARes 直接给终局 `transStatus=Y`（或 `A`），无 CReq/CRes。
- **有感流（Challenge）**：ARes 给中间态 `transStatus=C`，走 CReq/CRes 挑战，最终态在 RReq 里回来（`Y` 成功 / `N` 失败）。

---

## 二、AReq 关键数据元（3DS Server → ACS）

| 分组 | 字段 | 含义 |
|------|------|------|
| **标识/路由** | `threeDSServerTransID` | 3DS Server 分配的交易唯一 ID（UUID，36）|
| | `dsTransID` | Directory Server 分配的交易 ID（UUID，36）|
| | `threeDSServerRefNumber` / `dsReferenceNumber` | EMVCo 分配的已认证 3DS Server / DS 标识 |
| **报文属性** | `messageType` / `messageVersion` | 报文类型 / 协议版本 |
| | `messageCategory` | `01`=支付认证(PA)，`02`=非支付认证(NPA) |
| | `deviceChannel` | `01`=App，`02`=浏览器，`03`=3RI（Requestor Initiated）|
| **卡/持卡人** | `acctNumber` | PAN 或令牌（13–19）|
| | `cardExpiryDate` | 有效期 YYMM |
| | `cardholderName` / `email` | 持卡人姓名 / 邮箱 |
| **Requestor** | `threeDSRequestorID` / `threeDSRequestorName` / `threeDSRequestorURL` | DS 分配的商户认证方标识/名称/站点 |
| | `threeDSRequestorAuthenticationInd` | 认证场景 `01`–`06`（如支付、添加卡、分期、续订…）|
| | `threeDSRequestorChallengeInd` | `01`无偏好 `02`不挑战 `03`偏好挑战 `04`强制挑战（mandate）|
| **商户** | `merchantName` / `merchantCountryCode` / `mcc` | 商户名/国家(ISO 3166-1)/类目码 |
| | `acquirerBIN` / `acquirerMerchantID` | 收单机构 BIN / 商户号 |
| **交易金额** | `purchaseAmount` | 最小币种单位、无标点 |
| | `purchaseCurrency` / `purchaseExponent` | 币种(ISO 4217)/小数位 |
| | `purchaseDate` | UTC `YYYYMMDDHHMMSS` |
| | `transType` | `01`商品服务 `03`支票 `10`账户注资 `11`准现金 `28`预付 |
| **地址/风控** | `billAddr*` / `shipAddr*` / `addrMatch` | 账单/收货地址、是否一致 |
| | `merchantRiskIndicator` / `acctInfo` | 商户风险指示对象 / 账户历史对象 |
| | `acctType` | `01`不适用 `02`贷记 `03`借记 |
| **App/SDK** | `sdkAppID` `sdkTransID` `sdkReferenceNumber` `sdkMaxTimeout` `sdkEphemPubKey` `sdkEncData` | App 通道 SDK 会话/密钥/加密数据 |
| **浏览器** | `browserIP` `browserAcceptHeader` `browserUserAgent` `browserLanguage` `browserColorDepth` `browserScreenHeight/Width` `browserTZ` `browserJavaEnabled` | 浏览器通道设备指纹（喂给发卡行做无感风险评估）|
| **续订/分期** | `recurringExpiry` `recurringFrequency` `purchaseInstalData` | 续订截止/最小间隔/分期次数 |
| **其它** | `payTokenInd` / `acctID` | 是否去令牌化 / 附加账户标识 |

> **无感核身的本质**：AReq 把 `browser*`/`deviceInfo`/`merchantRiskIndicator`/`acctInfo` 等**设备+上下文+风险数据**喂给发卡行 ACS，让它无需打扰持卡人即可评估风险——这正是 [DE39 治理文档](./ISO8583-DE39应答码与拒绝治理.md) §五所说"补充数据引导发卡行无感核验"的字段级落地。

---

## 三、ARes 关键数据元（ACS → 3DS Server）

| 分组 | 字段 | 含义 |
|------|------|------|
| **标识** | `acsTransID` | ACS 分配的交易 ID（UUID）|
| | `dsTransID` / `threeDSServerTransID` | 同 AReq |
| | `acsReferenceNumber` / `acsOperatorID` | EMVCo/DS 分配的 ACS 标识 |
| **报文属性** | `messageType`=`ARes` / `messageVersion` / `messageCategory` | |
| **认证结果** | `transStatus` | 认证结果码（见 §四）|
| | `transStatusReason` | 结果原因码（见 §五）|
| | `authenticationValue` | 认证凭证 CAVV/AAV（Base64 20 字节→28 字符）|
| | `eci` | 电子商务指示符（卡组织特定，2 位）|
| | `authenticationType` | `01`静态 `02`动态 `03`带外(OOB) |
| **挑战要求** | `acsChallengeMandated` | `Y`需挑战 / `N`不需 |
| | `acsURL` | 浏览器挑战 POST 的 ACS URL |
| | `acsSignedContent` | App 通道 JWS（含 ACS URL、临时密钥）|
| | `acsRenderingType` | 首屏挑战 UI 模板 |
| **持卡人信息** | `cardholderInfo` | 无感未认证时发卡行给的文字提示（≤128）|

> `transStatus=Y/A` 时，`authenticationValue` 与 `eci` 才会置值——它们随后进授权报文，作为"已认证"的凭据换取责任转移与更优授权率。

---

## 四、transStatus：认证结果码

| 码 | 含义 |
|----|------|
| **Y** | 认证/账户核验**成功** |
| **N** | **未认证/未核验，交易拒绝** |
| **U** | 无法完成认证（技术或其它问题）|
| **A** | 尝试认证（Attempts）——未认证但提供了"已尝试"的证明 |
| **C** | **需挑战**——走 CReq/CRes 补认证 |
| **R** | 认证被**拒绝**——发卡行要求**不要发起授权** |
| **D** | 需挑战，且以 **Decoupled**（解耦）方式认证 |

- **无感成功**：ARes `Y`。
- **需挑战**：ARes `C`（中间态）→ 挑战 → RReq 终态 `Y`/`N`。
- **`R` 与 `N` 的区别**：`N` 是认证没过；`R` 是发卡行直接叫停，**连授权都别发**（比 `N` 更硬）。

---

## 五、transStatusReason：结果原因码（`N`/`R`/`U` 时的理由）

| 码 | 原因 | 与授权侧 DE39 的对应 |
|----|------|----------------------|
| **01** | **Card Authentication Failed** | ≈ 授权侧 `82`/`Q1`（真·卡认证失败）|
| 02 | Unknown Device | |
| 03 | Unsupported Device | |
| 04 | Exceeds Authentication Frequency Limit | ≈ `65` |
| **05** | Expired Card | = `54`（生命周期类）|
| **06** | Invalid Card Number | = `14` |
| 07 | Invalid Transaction | = `12` |
| 08 | No Card Record | |
| **09** | Security Failure | ≈ `63` |
| **10** | Stolen Card | = `43` |
| **11** | **Suspected Fraud** | = 授权侧 **`59`**（风险类）|
| 12 | Transaction Not Permitted to Cardholder | = `57` |
| 13 | Cardholder Not Enrolled in Service | |
| 14 | Transaction Timed Out at ACS | |
| 15–18 | Low / Medium / High / Very High Confidence | 风险置信度分级 |
| 19 | Exceeds ACS Maximum Challenges | |
| 20 | Non-Payment Transaction Not Supported | |
| 21 | 3RI Transaction Not Supported | |
| 22–79 | EMVCo 保留 | |
| 80–99 | DS（卡组织）自用 | |

> **与本库 RC 59 案例的闭环**：授权侧一句"卡片校验错误"盖住了 `59`(疑似欺诈) 与 `82`/`Q1`(卡认证失败) 两类不同问题；3DS 侧同样用 **`transStatusReason 11`(Suspected Fraud)** 与 **`01`(Card Authentication Failed)** 把这两类分得清清楚楚。**认证阶段就区分，比等到授权被拒再回溯更早、更省。**

---

## 六、一句话总览

AReq 把**设备+上下文+风险数据**喂给发卡行 ACS 做无感评估；ARes 用 **`transStatus`** 裁决：`Y` 放行、`C` 转挑战、`N`/`R` 拒绝，并以 **`transStatusReason`** 说明为何拒（`01` 卡认证失败 / `11` 疑似欺诈 …，与授权侧 DE39 一一呼应）。这就是"风险类拒绝改用 3DS 重认证"能挽回交易的机理。

---

**参考来源：**
- **EMVCo** — *EMV® 3-D Secure Protocol and Core Functions Specification* v2.3.1.1（2023-05-30）：`emvco.com` 3-D Secure Documentation（PDF 需同意 ToU 下载）。
- 字段/码值实现参考：Broadcom Arcot *Data Elements for 3D Secure* TechDocs、3DSecure.io Specification v2.2.0（均据 EMVCo 规范实现）。
- transStatus 值另经 EMVCo *Technical Features* 页与多家 3DS Server/ACS 厂商文档交叉核对。
