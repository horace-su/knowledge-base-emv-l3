# ODA 证书链字节级（SDA / DDA / CDA）

> 深入离线数据认证（Offline Data Authentication）的**证书链与恢复格式**。承接 [终端配置：AID 与 CAPK](./终端配置-AID与CAPK.md)（CAPK 是链的根）与 [接触与非接 CVM 详解](./接触与非接CVM详解.md)。国密版本见 [银联国内 PBOC 3.0 与国密](./银联国内-PBOC3.0与国密算法.md)。

---

## 一、信任链总览

```
CA Public Key（CAPK，终端内，按 RID + Index[8F] 选取）
  │  恢复/验签
  ▼
Issuer Public Key Certificate（Tag 90）  ──► 恢复出 发卡行公钥
  │  恢复/验签
  ▼
ICC Public Key Certificate（Tag 9F46）   ──► 恢复出 IC 卡公钥
  │  用于
  ▼
动态签名（SDD/DDA/CDA）/ 静态数据签名（SDA）
```

> 每一层都是"上层公钥验证下层证书"，根是终端预置的 CAPK。任一层失败 → ODA 失败 → TVR 置位（见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md) Byte1）。

---

## 二、关键标签清单

| 标签 | 名称 | 说明 |
|------|------|------|
| `8F` | CA Public Key Index | 指定用哪把 CAPK（配合 RID） |
| `90` | Issuer Public Key Certificate | 发卡行公钥证书（CA 私钥签发） |
| `92` | Issuer Public Key Remainder | 发卡行公钥模数放不下证书时的余数 |
| `9F32` | Issuer Public Key Exponent | 发卡行公钥指数（通常 3 或 65537） |
| `9F46` | ICC Public Key Certificate | IC 卡公钥证书（发卡行私钥签发） |
| `9F47` | ICC Public Key Exponent | IC 卡公钥指数 |
| `9F48` | ICC Public Key Remainder | IC 卡公钥模数余数 |
| `9F4A` | SDA Tag List | 参与 SDA 哈希的数据元清单 |
| `93` | Signed Static Application Data（SSAD） | SDA 用的静态数据签名 |
| `9F4B` | Signed Dynamic Application Data（SDAD） | DDA/CDA 用的动态数据签名 |
| `9F4C` | ICC Dynamic Number | 卡产生的动态数 |

---

## 三、Issuer PK Certificate（Tag 90）恢复格式

终端用 **CAPK（模数+指数）** 对 `90` 做 RSA（或 SM2）恢复，得到下列结构（EMV Book 2 Table 6）：

| 字段 | 长度 | 说明 |
|------|------|------|
| Recovered Data Header | 1 | 固定 `6A` |
| Certificate Format | 1 | `02`（发卡行证书） |
| Issuer Identifier | 4 | 发卡行标识（PAN 前若干位，补 F） |
| Certificate Expiration Date | 2 | MMYY |
| Certificate Serial Number | 3 | 证书序列号 |
| Hash Algorithm Indicator | 1 | 哈希算法（01=SHA-1） |
| Issuer PK Algorithm Indicator | 1 | 公钥算法 |
| Issuer PK Length | 1 | 发卡行公钥模数长度 |
| Issuer PK Exponent Length | 1 | 指数长度 |
| Issuer PK or leftmost digits | N | 发卡行公钥（或其左侧部分，余数在 `92`） |
| Hash Result | 20 | 对上述字段的哈希（SHA-1=20 字节） |
| Recovered Data Trailer | 1 | 固定 `BC` |

**校验**：
1. 头 `6A`、尾 `BC` 正确。
2. 重算哈希 = 恢复出的 Hash Result。
3. 证书未过期；Issuer Identifier 与 PAN 匹配。

---

## 四、ICC PK Certificate（Tag 9F46）恢复格式

用上一步恢复出的 **发卡行公钥** 对 `9F46` 恢复：

| 字段 | 长度 | 说明 |
|------|------|------|
| Header | 1 | `6A` |
| Certificate Format | 1 | `04`（ICC 证书） |
| Application PAN | 10 | 卡号（补 F） |
| Certificate Expiration Date | 2 | MMYY |
| Certificate Serial Number | 3 | —— |
| Hash Algorithm Indicator | 1 | —— |
| ICC PK Algorithm Indicator | 1 | —— |
| ICC PK Length | 1 | IC 卡公钥模数长度 |
| ICC PK Exponent Length | 1 | —— |
| ICC PK or leftmost digits | N | IC 卡公钥（余数在 `9F48`，指数在 `9F47`） |
| Hash Result | 20 | —— |
| Trailer | 1 | `BC` |

**校验**：同上（头尾、哈希、过期、PAN 匹配）。

---

## 五、三种 ODA 对比

| 方式 | 用到的链 | 验什么 | 抗克隆/抗伪 |
|------|----------|--------|-------------|
| **SDA** | CAPK → Issuer PK | 验 **SSAD（93）** 静态签名；只证"数据由发卡行签过" | ❌ 可被克隆（静态数据可复制） |
| **DDA** | CAPK → Issuer PK → **ICC PK** | 卡用 ICC 私钥对**终端不可预测数（UN，9F37）+ 卡数据**签 **SDAD（9F4B）**，终端用 ICC 公钥验 | ✅ 抗克隆（动态签名一次性） |
| **CDA** | 同 DDA | DDA 的动态签名 **与应用密文（AC）生成联合**，确保 AC 来自合法卡 | ✅✅ 最强（签名绑定 AC） |

> SDA 用 `9F4A`（SDA Tag List）确定哈希范围；DDA/CDA 用 `DDOL`（9F49）确定卡签名时纳入的终端数据（含 UN）。

---

## 六、典型失败点（→ TVR Byte 1）

| 现象 | TVR 位 | 常见原因 |
|------|--------|----------|
| SDA 失败 | B1 b7 | CAPK 错/过期、SSAD 篡改、Issuer 证书无效 |
| DDA 失败 | B1 b4 | ICC 证书链断、UN 不匹配、SDAD 验签失败 |
| CDA 失败 | B1 b3 | AC 与签名不一致、链验签失败 |
| ICC 数据缺失 | B1 b6 | 卡未给齐 90/9F46/9F47 等 |
| ODA 未执行 | B1 b8 | 终端无对应 CAPK 或不支持该 ODA |

> ODA 失败如何处置由 **TAC/IAC** 决定（[决策逻辑](./TAC-IAC-TVR决策逻辑.md)）：可能转联机或离线拒绝。

---

## 七、实操与测试要点

- **链的根是 CAPK**：(RID+8F) 选错/过期/装错(测试 vs 生产) → 第一层就断;见 [AID 与 CAPK 全卡组织参考表](./AID与CAPK全卡组织参考表.md)。
- **头 6A / 尾 BC** 是恢复正确性的快速自检点;抓包(Card Spy/SmartSpy+)看恢复数据先核这两字节。
- **PAN/Issuer ID 一致性**:证书内 PAN 必须与卡 PAN 匹配,否则即使签名对也判失败(防证书移植)。
- **余数标签**:模数放不下证书时,Issuer 余数在 `92`、ICC 余数在 `9F48`——拼接时别漏。
- **UN(9F37)是 DDA/CDA 抗重放关键**:终端每次给不同 UN,卡签进 SDAD;测试需验证 UN 确实随机且被纳入。
- **CDA 绑定 AC**:CDA 用例要验证动态签名确实覆盖了应用密文;这是比 DDA 更强的防替换保证。
- **国密版**:PBOC 3.0 国密 ODA 用 SM2 验签 + SM3 哈希,标签沿用但算法不同(见 [银联国内 PBOC](./银联国内-PBOC3.0与国密算法.md))。

---

**参考来源：**
- [EMV Application Specification :: ODA Part I — LinkedIn](https://www.linkedin.com/pulse/emv-application-specification-offline-data-oda-part-farghaly)
- [EMV Application Specification :: ODA Part II — LinkedIn](https://www.linkedin.com/pulse/emv-application-specification-offline-data-oda-part-farghaly-1f)
- [EMV Functional Flow — Offline Data Authentication — LinkedIn](https://www.linkedin.com/pulse/emv-functional-flow-offline-data-authentication-chetan-kumar)
- [6.4 Off-line data authentication — Implementing Electronic Card Payment Systems (Flylib)](https://flylib.com/books/en/4.365.1.48/1/)
- [EMV tag 90 (Issuer Public Key Certificate) — emvlab.org](https://emvlab.org/emvtags/show/t90/)
- EMV 4.3 Book 2（Security and Key Management）Tables 6/7/14/15/17/18（证书与签名恢复格式权威定义）
