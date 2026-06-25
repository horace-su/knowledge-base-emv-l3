# EMVCo L3 测试框架与标准化文件格式（伪函数 / 联机响应语法）

> 本文解析 **EMVCo 官方定义的 L3 测试框架（L3 Testing Framework）本体**——即各卡组织把 L3 测试用例、测试卡映像、联机报文响应交付给「EMVCo 合格 L3 测试工具」时所遵循的**标准化文件结构**。其他文档讲的是「各卡组织各自的 L3 程序」与「FIME BTT 这一具体工具」；本文讲的是支撑二者的**通用底层框架**。
>
> 关联文档：[各卡组织 L3 认证测试要求一览](../03-各卡组织L3认证/各卡组织L3认证测试要求一览.md) · [FIME BTT `.tpp` 项目文件与 L3 测试计划](../02-fime测试工具/FIME-BTT-TPP项目文件与L3测试计划.md) · [M-TIP TSE 配置详解](../05-mastercard专题/M-TIP-TSE配置详解.md) · [ISO 8583 报文域全景与 POS 录入方式](../06-报文层/ISO8583-报文域全景与POS录入方式.md) · [ISO 8583 字段 55（DE55）](../06-报文层/ISO8583-字段55-跨卡组织要求.md) · [TAC / IAC / TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md) · [ODA 证书链字节级](./ODA证书链字节级.md)
>
> 来源：EMVCo 官网公开件（Terms-of-Use 同意后可下载，见 [`web-docs/SOURCES.md`](../web-docs/SOURCES.md)）——
> - 《EMV® L3 Testing Framework – Pseudo-function Definitions for Test Card Images》**v1.6（2023-03）**
> - 《EMV® L3 Testing Framework – Common Syntax for Online Message Responses》**v1.0（2023-08）**
> - 《L3 Participant System Identifier (L3 PSI) Registration Request Form》**v3.0（2024-09）**
> - 二者均反复引用的**主文档**《EMV® L3 Testing Framework – Implementation Guidelines》（**L3FIG**，仅成员/门户，本库未持有，标注「以门户最新版为准」）

---

## 一、框架是什么：为什么需要一个「标准化框架」

L3（终端集成测试）发生在 L1/L2 通过 EMVCo 认证**之后**，验证终端 ↔ 收单主机 ↔ 支付网络的端到端集成（见 [各卡组织 L3 认证测试要求一览](../03-各卡组织L3认证/各卡组织L3认证测试要求一览.md) 的「通用前提」）。但每家卡组织（Visa、Mastercard、Amex、Discover、JCB、银联…）的 L3 用例、测试卡、主机报文要求各不相同。

EMVCo 的 L3 测试框架做的事，是定义一套**通用的、机器可读的交付格式**，让流程变成：

1. **EMVCo** 先**合格化（qualify）**第三方 L3 测试工具（如 FIME BTT、Payhuddle Tecto 等），确认其能解析框架定义的标准文件；
2. **各卡组织（Participant System）** 把自己的 L3 测试要求——测试用例、**测试卡映像（Test Card Image）**、联机报文响应规则——用**框架规定的标准格式**交付给已合格的工具厂商；
3. **金融机构客户及其服务商** 用这些合格工具执行 L3 终端集成测试。

> 关键认知（与全库一致）：**EMVCo 只认证「框架」与「工具」，不认证某卡组织的具体 L3 通过结果**——后者由各卡组织自行裁决。本框架就是 EMVCo 所认证的那个「框架」的技术定义。

### 框架的组成交付物（出自 L3FIG / 两份规范的 Executive Summary）

| 组件 | 说明 | 格式 |
|------|------|------|
| **Implementation Guidelines (L3FIG)** | 框架主文档，定义所有技术组件的实现细则；本文两份规范都是它的 *companion document* | 文档（成员/门户） |
| **机器可读 L3 测试卡映像（Test Card Image）** | 描述每套测试卡的预期行为 | **XML** |
| **TSE 测试集文件（Test Set）** | 定义用例选择方法、TSE 问卷问题、异常报错、Pass/Fail 判据等 | TSE 文件 |
| **测试会话文件（Test Session）** | TSE 据用户作答生成，指示测试引擎执行哪些用例 | TSE 生成 |
| **测试报告与日志** | 含 **Card-to-Terminal Log**（卡↔终端）与 **Online Message Log**（联机报文） | 日志格式 |

> 上述 TSE（Test Selection Engine，测试选择引擎）正是 Mastercard M-TIP 与本库 [M-TIP TSE 配置详解](../05-mastercard专题/M-TIP-TSE配置详解.md)、[M-TIP TSE 问卷与终端配置参数](../05-mastercard专题/M-TIP-TSE问卷与终端配置参数.md) 中讲的那个 TSE——它是框架的通用组件，被各卡组织复用。

### L3 参与者系统标识（L3 PSI）

**L3 PSI（Participant System Identifier）** 是 EMVCo 分配、管理的**两位数字码**，每个有意在标准化 L3 结构中定义/管理自己测试用例与测试卡映像的实体（域内/全球支付系统等）各持一个。技术上，PSI 用于在合格 L3 测试工具架构内**标识某参与者系统的 L3 测试文件**。注册经《L3 PSI Registration Request Form》（支持新增 / 续期 / 联系人变更），由 [L3 PSI 注册服务](https://www.emvco.com/processes/l3-participant-system-identifier-registration-programme/) 办理。

> 在下文「联机响应语法」的 XML 里，`<PSI>00</PSI>` 这样的两位码就是它；用例数据项语法 `NET.01?0.DE.022` 中嵌的也是它。

---

## 二、规范一：测试卡映像的伪函数（Pseudo-function Definitions for Test Card Images）

### 2.1 为什么要「伪函数」

测试卡映像用 XML 描述一张测试卡的静态内容。但有些行为**无法仅从静态内容推断**——典型是**密码学结果**（每次交易随 ATC/UN 变化的密文）、依赖终端请求动态决定的 CID、随交易计算的动态签名等。**伪函数（pseudo-function）** 就是嵌在卡映像 XML 里的占位「函数」，告诉工具的卡模拟器（Card Simulator）「这里在运行时按某规则动态生成」，而非写死一个值。

> 注意：有时只要在映像里指定 **CVN（Cryptogram Version Number）** 即可，不必动用伪函数。

### 2.2 伪函数清单（v1.6）

命名空间为 `emvcard.*`（卡侧）与 `simvendor.*`（厂商侧）。每个伪函数对应一个 EMV **TAG**，并规定其 Length/Format/在响应模板中的 Location（如 GenAC 响应模板 Format 1 `ID="80"` / Format 2 `ID="77"`、非接 GPO 响应模板 `ID="77"`、READ RECORD 模板 `ID="70"`）。

| 伪函数 | TAG | 作用 |
|--------|-----|------|
| `simvendor.id()` | `5F50` | 发卡行 Library Server URL（FCI 自定义模板 `BF0C`） |
| `emvcard.arqc()` | `9F27` | CID：终端未要 AAC 且非仅离线→**ARQC**；仅离线→TC；终端要 AAC→AAC。非接 GPO：仅离线→AAC，否则 ARQC |
| `emvcard.aac()` | `9F27` | CID：**恒为 AAC**（GenAC1/GenAC2/GPO 均拒绝） |
| `emvcard.term()` | `9F27` | CID：GenAC2 **跟随终端请求**，不校验发卡行认证结果/是否含 Issuer Auth Data |
| `emvcard.auth()` | `9F27` | CID：跟随终端请求，但若**发卡行认证失败**或缺 Issuer Auth Data（`91`）则拒绝 |
| `emvcard.atc()` | `9F36` | 应用交易计数器（ATC），由 L3 CS 维护，可为任意值 |
| `emvcard.appcrypto()` | `9F26` | 应用密文（AC）——卡对 GENERATE AC / 非接 GPO 恒返回（即便终端要求 CDA） |
| `emvcard.sdad(format)` | `9F4B` | **XDA/DDA/CDA/fDDA 的签名动态应用数据（SDAD）**；按 P1（CDA 请求→SDF `05`、XDA 请求→SDF `15`）或非接 CID/TTQ（TC→`05`、ARQC+ODA→`95`、银联可用 `A5`）选签名数据格式 |
| `emvcard.appcrypto()`/`emvcard.AC()` | `9F26` | 应用密文（C8 新增 `AC()` 形式） |
| `emvcard.iad(length)` | `9F10` | 发卡行应用数据（IAD），按长度 |
| `emvcard.ctq(initvalue)` | `9F6C` | 卡交易限定符（CTQ），带初值计算 |
| `emvcard.cpr(initvalue)` | — | （非接）带初值的动态字段 |
| `emvcard.UN(length)` | `9F37` | 不可预测数（UN） |
| `emvcard.cvc3t1()` / `emvcard.cvc3t2()` | — | 非接磁条（MSD）的 CVC3（Track1/Track2 各一） |
| `emvcard.msd()` | — | 磁条（MSD）相关 |
| `emvcard.track2()` | `57` | Track 2 等价数据 |
| `emvcard.onlineonly()` | — | 标识仅联机场景 |
| `emvcard.cert(fn)` / `emvcard.country(fn,c1,c2)` / `emvcard.currency(fn,c1,c2)` | — | v1.5 新增：证书 / 国家码 / 货币码相关 |

#### v1.6 的 C8 / XDA 增补（§3.1 C8-specific）

为适配 **EMV Book C8** 与 **XDA（eXtended Data Authentication，扩展数据认证，抗量子/新一代 ODA）**，v1.6：
- **新增** `emvcard.CardKeyData()`、`emvcard.EDAMAC()`、`emvcard.AC()`、`emvcard.CVD()`、`emvcard.cardTVR(value)`；
- **修改** `emvcard.atc()`、`emvcard.sdad()`、`emvcard.term()`；
- **移除** `emvcard.dcvv()`。

其中 `emvcard.CVD()` 的取值逻辑见规范 Appendix B；C8 的密钥派生（`KD = AES-CMAC`、SKC、ECC Curve P-256 等）见 Appendix A。这些与本库 [ODA 证书链字节级](./ODA证书链字节级.md) 的 SDA/DDA/CDA 是同一谱系，XDA 为其面向未来的扩展。

> 版本沿革：v1.0（2017-03 首发）→ v1.5（2020-10，补 GenAC/非接 GPO 通用函数）→ **v1.6（2023-03，C8 + XDA）**。

---

## 三、规范二：联机报文响应的通用语法（Common Syntax for Online Message Responses）

### 3.1 解决什么问题

L3 测试要联机时，需要一个**网络模拟器（Network Simulator）** 扮演发卡行/网络，对终端送来的授权请求生成响应。本规范定义一套 **XML 文件语法 + `emvsim.*` 伪函数**，让各参与者系统能把「**对联机报文的响应要求**」标准化地交给网络模拟器。这把本库 [ISO 8583 报文域全景](../06-报文层/ISO8583-报文域全景与POS录入方式.md) 与 [DE55](../06-报文层/ISO8583-字段55-跨卡组织要求.md) 讲的主机侧报文，与 L3 工具的自动化打通。

**范围**：仅定义 XML 文件语法。**不含**：L3 工具合格化、参与者系统的默认响应要求、默认模拟器校验（如是否默认做 ARQC 校验 / ARPC 生成由各参与者系统自定）。

### 3.2 文件结构（XML）

根节点 `<OnlineMessageResponse>`，由 `<Header>` + `<ResponseProfilesList>`（+ 可选 `<SymmetricKeysList>`）组成。模拟器**按 profile 在文件中出现的顺序**逐一尝试匹配来报文，命中即执行该 profile 的动作生成响应；无命中则回落到参与者系统定义的标准响应。

```
<OnlineMessageResponse>
  <Header>
    <PSI>00</PSI>                       两位 L3 PSI
    <SpecVersion>…</SpecVersion>        本规范版本
    <FileVersion>1.0</FileVersion>      PSI 自管版本号 N.N
    <Date-Time>2022-01-31T08:06:18Z</Date-Time>   ISO-8601 UTC
    <Description>…</Description>        可选自由文本
  </Header>
  <ResponseProfilesList>
    <Profile Name="…">
      <MatchingCriteriaList>            ← 全部 Criteria 为真才命中
        <Criteria DataItem="NET.01?0.DE.022" Operator="equals" Value="…"/>
      </MatchingCriteriaList>
      <ResponseList>                     ← 命中后执行的动作
        <Response Action="set"    DataItem="…" Value="…"/>
        <Response Action="remove" DataItem="…"/>
        <Response Action="emvsim.arpcgeneration(AUTO, AC_KEY, AUTO)"/>
      </ResponseList>
    </Profile>
  </ResponseProfilesList>
  <SymmetricKeysList>                    ← 含密码学校验/生成时必填
    <SymmetricKey KeySetName="…">
      <Key KeyType="MDK|UDK" KeyName="AC_KEY">…</Key>
    </SymmetricKey>
  </SymmetricKeysList>
</OnlineMessageResponse>
```

要点：
- **DataItem 语法** `NET.01?0.DE.022` 等，遵循 L3FIG v1.2 Annex B「Tool Pass/Fail Automation Criteria」——`DE.022` 即 ISO 8583 的 **DE22 录入方式**（见本库实测回退案例），`DE.004` 为金额等。
- **Operator**：`equals` / `like` / `exist` / `not exist` …，外加 `InList`（仅限 `NUMBER()` 格式，命中即「在逗号分隔列表中」）。
- **Value 格式**：`STRING(EMVCo)`（不含引号）、`NUMBER(000000000123)` 等。
- **Action**：`set`（给某 DataItem 赋值）/ `remove`（删字段）/ 直接写一个 `emvsim.*` 伪函数。
- **XSD**：EMVCo 另提供 XML Schema（需经 query 系统索取）；工具须对未来新增 tag **向后兼容**（不得因多出数据而拒绝文件）。

### 3.3 `emvsim.*` 网络模拟器伪函数

| 伪函数 | 作用 | 关键参数 |
|--------|------|----------|
| `emvsim.pin_validation(pin)` | 校验被测系统送来的 PIN（PIN 密钥/格式取决于模拟器引擎上下文） | `pin` 期望值（必填） |
| `emvsim.arqc_validation(cvn, key)` | 校验被测系统送来的 **ARQC** | `cvn`（1 字节，可 `AUTO`=用报文中的 CVN）、`key`（KeyName，UDK 或 MDK） |
| `emvsim.arpcgeneration(cvn, key, arc)` | 在模拟器内生成 **发卡行认证数据**（ARPC + CSU/ARC） | `cvn`、`key`、`arc`（2 字节 ARC 或 4 字节 CSU，可 `AUTO`=按系统要求生成默认批准/拒绝） |
| `emvsim.issuerscript(cvn, key, script)` | 生成**发卡行脚本**（Issuer Script，含 MAC） | `key` 的 KeySetName 须含 `AC_KEY`/`MAC_KEY`/`ENC_KEY`；`script` 按 EMV Book 3 脚本格式，加密块（如 PIN block）写明文、MAC 处用 `MM` 占位待回填 |
| `emvsim.do_not_respond()` | 模拟器**不响应**（测超时/无应答路径） | — |
| `emvsim.delay_response(Time)` | **延迟**响应 `Time` 秒（测计时） | `Time`（秒） |

这些把发卡行/网络侧逻辑参数化：ARQC 校验、ARPC/CSU 生成、Issuer Script 下发、超时与延迟，正是 L3 联机测试要覆盖的核心场景（与本库 [TAC/IAC/TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md) 的两次 GENERATE AC、[收单主机认证与 L3 重测触发条件](../06-报文层/收单主机认证与L3重测触发条件.md) 的主机侧呼应）。

> 术语：**ARQC**=授权请求密文、**ARPC**=授权响应密文、**CVN**=密文版本号、**MDK/UDK**=主/唯一派生密钥、**PS/PSI**=参与者系统/其标识、**L3TG**=Level 3 Testing Group。

---

## 四、放进全局：框架与各卡组织/工具的关系

```
            EMVCo L3 Testing Framework（本文）
            ├─ L3FIG（主文档）+ XSD
            ├─ 测试卡映像 XML ──含──▶ emvcard.* 伪函数（规范一）
            ├─ TSE 测试集/会话 ─────▶ M-TIP TSE 等复用（见 TSE 专题）
            ├─ 联机响应 XML ───含──▶ emvsim.* 伪函数（规范二）
            └─ 日志：Card-to-Terminal Log / Online Message Log
                        │
       EMVCo 合格化（qualify）┘
                        ▼
   合格 L3 工具（FIME BTT 的 .tpp / Card Simulator …）
                        ▲
   各卡组织（Participant System，持 L3 PSI）按标准格式交付用例与测试卡
                        ▲
   金融机构客户 + 服务商：用合格工具跑各卡组织 L3 程序
```

一句话：**本文是「地基」，各卡组织 L3 程序与 FIME BTT 是盖在地基上的「楼」**。理解了伪函数与联机响应语法，就能看懂工具里那些动态密文、CID 决策、ARPC/脚本回填到底从哪条规则来。

---

## 五、版本与核对提示

- 两份规范均为 EMVCo **公开件**，但**主文档 L3FIG 及 XSD 属成员/门户**，本库未持有；本文凡引用 L3FIG 章节号（如 §4.5、Annex B、v1.2）均转自两份规范的交叉引用，**精确条款以门户最新版为准**。
- 伪函数集合随 EMV 规范演进（C8 / XDA）持续增删——本文清单截至 **Pseudo-function v1.6（2023-03）**、**Common Syntax v1.0（2023-08）**，使用前请回 [L3 Testing 入口页](https://www.emvco.com/emv-technologies/emv-level-3-testing/) 核对是否有更新版本/slug。
