# M-TIP TSE 问卷、动态裁剪 与 终端配置参数

> 续 [M-TIP-TSE 配置详解](./M-TIP-TSE配置详解.md)。本文回答两个更深的问题：
> ① TSE 问卷的**动态裁剪**到底依据什么逻辑；② 问卷背后的**终端配置参数**实质是哪些 EMV 终端数据对象（9F35 / 9F33 / 9F40 等）。

---

## 一、核心认知：TSE 问卷 = EMV 终端数据对象的"人话化"

TSE 反复强调"答案必须与 **EMVCo L2 内核终端能力**一致"。原因在于：**问卷收集的终端配置，本质就是终端在交易中对外声明的 EMV 数据对象**。三个根：

| EMV 标签 | 名称 | 作用 |
|----------|------|------|
| **9F35** | Terminal Type（终端类型） | 环境(有人/无人) + 通信(在线/离线) + 操作控制方 |
| **9F33** | Terminal Capabilities（终端能力） | 卡数据输入 + CVM + 安全(ODA) 能力 |
| **9F40** | Additional Terminal Capabilities（附加能力） | 交易类型 + 技术能力(打印/显示/键盘) + 码页 |

> TSE 问卷问的"是 ATM 还是 POS""支不支持离线 PIN""能不能 cashback",最终都落到这三个对象的某几位（bit）上。理解这三个对象 = 理解问卷与裁剪逻辑。

---

## 二、Terminal Type（9F35）—— 决定裁剪的第一变量

1 字节，两位十进制数：**十位 = 操作控制方，个位 = 环境+通信**。

### 操作控制方（十位）
- **1x** = 金融机构（银行）
- **2x** = 商户
- **3x** = 持卡人

### 环境 + 通信（个位）
| 值 | 有人/无人 | 在线能力 |
|----|-----------|----------|
| 1 | 有人值守 | 仅在线 |
| 2 | 有人值守 | 离线为主，可在线 |
| 3 | 有人值守 | 仅离线 |
| 4 | 无人值守 | 仅在线 |
| 5 | 无人值守 | 离线为主，可在线 |
| 6 | 无人值守 | 仅离线 |

### 常见组合
| 9F35 | 含义 |
|------|------|
| **11** | 银行有人值守、仅在线（如银行柜面现金机） |
| **14** | 银行无人值守、仅在线 = **ATM** |
| **21** | 商户有人值守、仅在线（典型 POS） |
| **22** | 商户有人值守、离线可在线 |
| **24** | 商户无人值守、仅在线（无人 POS / CAT） |
| **25** | 商户无人值守、离线可在线 |
| **34/35/36** | 持卡人操作（无人值守自助场景） |

> **无人值守(CAT，Cardholder Activated Terminal)** 例子：售票机、自动售货机、加油机(AFD)、收费站、自助 kiosk、停车计时器。

---

## 三、Terminal Capabilities（9F33）—— 3 字节位级定义

### Byte 1：卡数据输入能力
| bit | 含义 |
|-----|------|
| b8 | 手工键入（Manual key entry） |
| b7 | 磁条（Magnetic stripe） |
| b6 | 接触芯片（IC with contacts） |
| b5–b1 | RFU（payment system 保留） |

### Byte 2：CVM 能力（持卡人验证）
| bit | 含义 |
|-----|------|
| b8 | **离线明文 PIN**（plaintext offline PIN） |
| b7 | **在线加密 PIN**（enciphered online PIN，3DES，发卡行校验） |
| b6 | **签名**（signature） |
| b5 | **离线加密 PIN**（enciphered offline PIN，RSA，卡内校验） |
| b4 | **No CVM Required**（特定条件免验证） |
| b3–b1 | RFU |

### Byte 3：安全能力（ODA 离线数据认证）
| bit | 含义 |
|-----|------|
| b8 | **SDA**（静态，最弱） |
| b7 | **DDA**（动态，用 ICC 私钥） |
| b6 | **Card Capture**（吞卡能力） |
| b4 | **CDA**（联合，首选，用 ICC 私钥） |
| b5/b3/b2/b1 | RFU |

> 支持离线授权的终端必须支持 **ODA**（SDA/DDA/CDA 之一）并加载 RSA 公钥（CAPK）。

---

## 四、Additional Terminal Capabilities（9F40）—— 5 字节

| Byte | 类别 | 内容 |
|------|------|------|
| 1–2 | **金融/管理交易类型** | 现金支取(cash)、商品支付(goods)、服务支付(services)、**cashback**、转账/付款(transfer/payment)、查询(inquiry)、管理(admin) 等 |
| 3–4 | **技术能力** | 打印(printer)、显示(display)、键盘(keyboard) |
| 5 | **码页** | ISO-8859 字符编码支持 |

> 问卷里"是否支持 cashback / refund / 查询"等，落到的就是 9F40 Byte 1–2 的对应位。

---

## 五、动态裁剪逻辑（Dynamic Tailoring）

TSE 依据 **M/Chip Requirements** **实时预判**：当某配置在规范下唯一确定或互斥时，相关问题被**自动加/删**，避免误填。

### 已证实的规则示例
> **接触式 ATM（9F35=14）→ 永远不问 CVM**。因为规范强制接触 ATM **只能用 Online PIN**(9F33 Byte2 b7)。

### 裁剪逻辑的推演（基于 9F35→9F33/9F40 的约束关系）
| 你的选择 | 被裁剪/约束的问题 |
|----------|-------------------|
| 终端类型 = ATM（无人值守银行） | CVM 锁定 Online PIN，不再问其他 CVM |
| 仅在线（9F35 个位=1/4） | 离线相关(ODA 离线授权、离线 PIN)问题收起 |
| 选择"接触" | 非接专项(PPSE、非接 CVM 限额、CDCVM)收起 |
| 选择"非接" | 接触芯片输入、接触 ODA 等相应调整 |
| 不支持某 AID/卡品 | 该卡品对应用例及其配置问题不出现 |

> 本质：**9F35 收窄 → 9F33/9F40 的合法取值收窄 → 问卷与测试计划随之收窄**。这是"答案必须一致"的根本原因——填了矛盾组合，裁剪逻辑会拒绝或生成不匹配现场的计划。

---

## 六、问卷字段 → EMV 对象 映射速查

| 问卷问什么 | 落到哪个对象/位 |
|------------|-----------------|
| 有人/无人值守、在线/离线、谁操作 | **9F35** Terminal Type |
| 支持手工/磁条/接触芯片输入 | **9F33** Byte 1 |
| 支持哪些 CVM（在线/离线 PIN、签名、No CVM、CDCVM） | **9F33** Byte 2（CDCVM 走非接路径） |
| 支持 SDA/DDA/CDA、是否吞卡 | **9F33** Byte 3 |
| 支持 cash/goods/services/cashback/转账/查询 | **9F40** Byte 1–2 |
| 打印/显示/键盘、码页 | **9F40** Byte 3–5 |
| 支持哪些 AID/应用版本、加载哪些 CAPK | 应用选择 + CAPK 列表 |
| 国家代码、币种 | Terminal Country Code(9F1A) / Transaction Currency(5F2A) |
| 非接 PPSE、非接 CVM 限额 | 非接 Reader 配置 |

---

## 七、实操要点

- **先定 9F35,后面自动收窄**:终端类型选对,大量无关问题会被裁掉;选错则计划全错。
- **CVM 组合受类型强约束**:ATM=仅 Online PIN;无人值守(CAT)按是否允许 PIN 分化(类似 EMV Config 3C 含 PIN / 4C 不含 PIN)。
- **AID + CAPK 仍需主动配齐**:裁剪能减负,但"支持哪些卡品、加载哪些公钥"必须人工如实声明,这是最常见的现场不一致来源。
- **答案 = 现场真实配置**:TSE 答案要与终端实际下发的 9F33/9F40/9F35 完全吻合;否则即使测试通过,现场行为也会与认证脱节。
- **参考权威定义**:US Payments Forum《Intake Form Terminology for EMV L3 POS Certification》专门解释这些问卷术语,可作填表对照。

---

**参考来源：**
- [Acquiring: Terminal Capabilities（9F33/9F40 位级）— MST](https://mstcompany.net/blog/acquiring-terminal-capabilities)
- [Acquiring: Types of POS-terminals（9F35 分类）— MST](https://mstcompany.net/blog/acquiring-types-of-pos-terminals-classification-of-emvco-and-payment-systems)
- [EMV tag 9F35 (Terminal Type) — emvlab.org](https://emvlab.org/emvtags/show/t9F35/)
- [Understanding Terminal Types — ID TECH](https://idtechproducts.com/technical-post/understanding-terminal-types/)
- [Intake Form Terminology for EMV Level 3 POS Certification — US Payments Forum](https://www.uspaymentsforum.org/wp-content/uploads/2021/01/Intake-Form-Terminology-WP-Final-Jan-2021.pdf)
- [TIP Test Selection Engine User Guide (Feb 2015)](https://usermanual.wiki/Document/TIP20Test20Selection20Engine20User20Guide2020Feb202015.1891829501/help)（本地：`web-docs/Mastercard-TIP-Test-Selection-Engine-User-Guide-Feb2015.pdf`）
- [EMV v4.3 Book 4 — EMVCo](https://mvallim.github.io/emv-qrcode/docs/EMV_v4.3_Book_4_Other_Interfaces_20120607062305603.pdf)
