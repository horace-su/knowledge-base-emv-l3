# AID 与 CAPK 全卡组织参考表（含 测试/真实 标记）

> 配合 [终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md) 使用。本文给出**全卡组织**的 AID 与 CAPK 速查，并明确标注 **测试（TEST）vs 真实/生产（PRODUCTION）**。

---

## ⚠️ 首要澄清：AID 与 CAPK 的"测试/真实"含义不同

| | 测试 vs 真实 是否区分？ | 说明 |
|--|------------------------|------|
| **AID** | **基本不区分** | 卡组织测试卡携带的是**与生产相同的 AID**（如 Visa 测试卡也用 `A0000000031010`）。应用选择逻辑测试/生产一致。**故下表 AID 均视为"真实/通用"。**（个别私有测试环境会自定义测试 AID，属例外） |
| **CAPK** | **严格区分** | 这是真正的分界：**生产 CAPK** 签发真实发卡卡；**测试 CAPK** 签发 L3 测试卡。两套密钥的 **Index 不同、模数不同**，互不通用。装错 → ODA 失败。 |

> 一句话：**"测试还是真实"主要看 CAPK，不看 AID。**

---

## 一、全卡组织 AID 速查（生产/通用，测试卡同用）

| 卡组织 | RID | 常见 AID（RID+PIX） | 产品 |
|--------|-----|---------------------|------|
| **Visa** | `A000000003` | A0000000031010 | Visa Credit/Debit |
| | | A0000000032010 | Visa Electron |
| | | A0000000032020 | V PAY |
| | | A0000000038010 | Visa Plus |
| | | A0000000033010 | Visa Interlink |
| **Mastercard** | `A000000004` | A0000000041010 | Mastercard Credit/Debit |
| | | A0000000043060 | Maestro |
| | | A0000000046000 | Cirrus |
| | `A000000005`(美区域) | A00000000501 | Mastercard US Debit |
| **American Express** | `A000000025` | A00000002501 | Amex（AEIPS/Expresspay） |
| **Discover** | `A000000152` | A0000001523010 | Discover（D-PAS/ZIP） |
| **Diners Club** | `A000000152` | A0000001524010 | Diners Club（DGN，与 Discover 同 RID） |
| **JCB** | `A000000065` | A0000000651010 | JCB（J/Smart, J/Speedy） |
| **UnionPay（银联）** | `A000000333` | A000000333010101 | 借记 Debit |
| | | A000000333010102 | 贷记 Credit |
| | | A000000333010103 | 准贷记 Quasi-credit |
| | | A000000333010106 | ECash 电子现金（仅港澳） |
| | | A000000333010108 | Common AID（仅美国） |
| **Interac** | `A000000277` | A0000002771010 | Interac（加拿大） |
| **RuPay** | `A000000524` | A0000005241010 | RuPay（印度） |
| **ELO** | `A000000504` | A0000005040000 | ELO（巴西） |
| **Mir** | `A000000658` | A0000006581010 | Mir（俄罗斯） |
| **mada** | `A000000228` | A0000002281010 | mada（沙特） |
| **EFTPOS** | `A000000384` | A0000003840000 | eftpos（澳大利亚） |
| **BankAxept** | `A000000359` | A0000003590010 | BankAxept（挪威） |
| **PayNet（MyDebit）** | `A000000042` | A0000000042203 | PayNet（马来西亚） |

> 备注：Discover 与 Diners Club 同属 Discover Global Network，共用 RID `A000000152`，靠 PIX 区分。

---

## 二、生产 CAPK 清单（PRODUCTION / 真实）

> 来源：EFTLab CA Public Keys 公开清单。这些是**真实发卡卡**使用的 CA 公钥（按 RID + Index 定位）。

### Visa（A000000003）
| Index | 长度(bit) | 指数 | 过期 |
|-------|-----------|------|------|
| 01 | 1024 | 03 | 2009-12-31（已过期） |
| 07 | 1152 | 03 | 2017-12-31（已过期） |
| 08 | 1408 | 03 | 2024-12-31 |
| 09 | 1984 | 03 | 2028-12-31 |
| 50 | 1024 | 010001 | — |
| 53 | 1408 | 03 | — |
| 58 | 1600 | 010001 | — |

### Mastercard（A000000004）
| Index | 长度 | 指数 | 过期 |
|-------|------|------|------|
| 03 | 768 | 03 | 2009-12-31（已过期） |
| 04 | 1152 | 03 | 2017-12-31（已过期） |
| 05 | 1408 | 03 | 2024-12-31 |
| 06 | 1984 | 03 | 2028-12-31（部分延至 2033） |

### American Express（A000000025）
| Index | 长度 | 指数 | 过期 |
|-------|------|------|------|
| 03 | 1024 | 03 | Live |
| 10 | 1984 | 03 | Live |
| 67 | 1408 | 03 | 2022-12-31（已过期） |
| 68 | 1984 | 03 | — |

### JCB（A000000065）
| Index | 长度 | 指数 | 过期 |
|-------|------|------|------|
| 07 | 1024 | 010001 | — |
| 10 | 1152 | 03 | Live |

### UnionPay 银联（A000000333）
| Index | 长度 | 指数 | 过期 |
|-------|------|------|------|
| 03 | 1408 | 03 | 2024-12-31 |
| 04 | 1984 | 03 | 2024-12-31 |
| 80 | 1024 | 010001 | — |
| 85 | 1984 | 03 | — |

### Interac（A000000277）
| Index | 长度 | 指数 | 过期 |
|-------|------|------|------|
| 02 | 1152 | 010001 | — |
| 03 | 1408 | 010001 | — |
| 07 | 1984 | 010001 | — |

> Discover（A000000152）等生产密钥结构同理，索引随各组织发布。完整模数（modulus）值见 EFTLab/各卡组织密钥公告，本表只列定位信息（模数为 256+ 位十六进制，故不在此转录以免出错）。

---

## 三、测试 CAPK（TEST / L3 认证用）

> ⚠️ **重要**：测试 CAPK 由各卡组织通过测试工具包/门户分发（Visa→DPS 门户、Mastercard→Connect），**Index 与生产不同**。下表区分"已核实"与"业界常用待核实"两类。

### 已核实
| 卡组织 | RID | Index | 长度 | 指数 | 说明 |
|--------|-----|-------|------|------|------|
| **Visa** | A000000003 | **94** | 1984 | 03 | Visa 测试 1984 位公钥（已确认） |

### 业界常用（⚠️ 需以官方测试工具包核对）
| 卡组织 | RID | 常用测试 Index | 备注 |
|--------|-----|----------------|------|
| Visa | A000000003 | 92 / 95 / 99（多为 1408/1984，指数 03） | Visa 测试密钥族 |
| Mastercard | A000000004 | F1 / F3 / F5 / FA / FE / EF | M/Chip 测试密钥（多指数 03） |
| American Express | A000000025 | 0A 等 | Amex 测试密钥 |
| Discover/Diners | A000000152 | 测试索引随 DGN 测试包 | —— |
| JCB | A000000065 | 测试索引随 JCB 测试包 | —— |
| UnionPay | A000000333 | 08 / 09 / 0B（1152/1408/1984，指数 03） | 实测某 UPI 测试配置（见 [银联国际 QuickPass L3 配置](../03-各卡组织L3认证/银联国际-QuickPass-L3配置与HK-SG特殊CVM.md)） |
| Interac | A000000277 | 测试索引随 Interac 测试包 | —— |

> 以上"业界常用"索引来自 EMV 测试社区经验，**未在本次会话独立核实到官方文档**。权威来源应为各卡组织测试工具包内附的 CAPK，或 Worldpay《EMV Network Keys: Test》（已归档于 `web-docs/`，但为图片型 PDF，本机无法文本解析）。**实际配置务必以官方测试密钥文件为准。**

---

## 四、识别"测试 or 真实"的实操方法

1. **看 CAPK Index**：生产用上表第二节的索引（如 Visa 08/09）；测试用第三节索引（如 Visa 94）。卡通过 **9F22** 告诉终端用哪个 → 由此即可判断这是测试卡还是真实卡。
2. **看密钥来源**：从卡组织**生产密钥公告**取得的 = 生产；从**测试工具包/门户**取得的 = 测试。
3. **环境隔离**：L3 测试终端只装测试 CAPK，上线前**替换为生产 CAPK**——切勿混装。
4. **AID 不能用来区分**：测试卡与真实卡 AID 相同，别靠 AID 判断测试/生产。

---

## 五、实操要点

- **测试/真实分界在 CAPK，不在 AID**——这是本表第一原则。
- **生产密钥会过期/轮换**：Visa 08(2024)/09(2028)、MC 05(2024)/06(2028~2033) 等，关注过期日及时更新。
- **测试索引以官方为准**：本表第三节"常用"仅供识别参考，配置必须用卡组织测试包内的真实测试密钥文件。
- **模数完整值不在此表**：256+ 位十六进制，手抄易错；需要时从 EFTLab / 卡组织公告 / 测试包取原文件导入。
- **同 RID 多产品**：Discover/Diners 共用 A000000152，靠 PIX 区分；银联多 PIX 对应借记/贷记/QuickPass。

---

**参考来源：**
- [List of CA Public Keys（生产 CAPK）— EFTLab](https://www.eftlab.com/knowledge-base/list-of-ca-public-keys)
- [EMV Network Keys: Test — Worldpay](https://docs.worldpay.com/assets/pdf/EMVNetworkKeysTest.pdf)（本地：`web-docs/Worldpay-EMV-Network-Keys-TEST.pdf`，图片型）
- [EMV Network Keys: Production — Worldpay](https://docs.worldpay.com/assets/pdf/emvnetworkkeys1.pdf)（本地：`web-docs/Worldpay-EMV-Network-Keys-PRODUCTION.pdf`，图片型）
- [How do I set CAPKs (L3 certification purposes) — ID TECH](https://atlassian.idtechproducts.com/confluence/pages/viewpage.action?pageId=34706262)
- [EMV Application Identifiers (AID) — EMV Functional Flow](http://emvfunctionalflow.blogspot.com/2018/05/visa-inc.html)
- [EMV Series #2: Application Identifier (AID) — LinkedIn](https://www.linkedin.com/pulse/emv-series-little-guy-2-application-identifier-aid-john-mcmahon)
- [Don't get locked out with the wrong EMV CAP keys — Deltec Consulting](https://www.deltecconsulting.com/capkeys/)
