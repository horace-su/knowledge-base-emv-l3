# 终端配置：AID 与 CAPK

> 这是 L3/TSE 配置中**最常见的疏漏点**（见 [M-TIP-TSE 问卷与终端配置参数](./M-TIP-TSE问卷与终端配置参数.md)："AID + CAPK 必须完整声明"）。本文系统讲清：终端如何配置 **AID（应用标识符）** 与 **CAPK（CA 公钥）**，以及它们在应用选择与离线认证（ODA）中的作用。
> 关联：[接触与非接 CVM 详解](./接触与非接CVM详解.md)（ODA 即 SDA/DDA/CDA）

---

# 一、AID（Application Identifier）

## 1.1 结构：RID + PIX

```
AID = RID (5 字节 / 10 hex) + PIX (可选, 至多 11 字节)
```
- **RID（Registered Application Provider Identifier）**：EMVCo 分配给各卡组织的全球唯一 5 字节标识。
- **PIX（Proprietary Application Identifier Extension）**：卡组织自定义后缀，用于区分同组织下的多个产品。

## 1.2 主要卡组织 RID

| 卡组织 | RID | 常见完整 AID 示例 |
|--------|-----|-------------------|
| **Visa** | `A000000003` | A0000000031010（Visa Credit/Debit） |
| **Mastercard** | `A000000004` | A0000000041010（MC Credit/Debit）；A0000000043060（Maestro） |
| **American Express** | `A000000025` | A00000002501 |
| **Discover** | `A000000152` | A0000001523010 |
| **JCB** | `A000000065` | A0000000651010 |
| **UnionPay（银联）** | `A000000333` | A000000333010101 |
| **Interac** | `A000000277` | —— |

## 1.3 终端如何用 AID 选应用

两种应用选择方式：
1. **PSE / PPSE 法**：接触读 PSE（`1PAY.SYS.DDF01`），非接读 PPSE（`2PAY.SYS.DDF01`），由卡返回可用 AID 目录。
2. **AID 列表法**（PSE 失败时）：终端遍历**自身配置的支持 AID 列表**，逐个 SELECT 直到匹配或列表耗尽。

> 若卡的 AID 不在终端配置列表中 → 无候选应用 → 交易终止。**这就是"AID 必须配齐"的根本原因。**

## 1.4 终端 AID 配置项（每个 AID 一套）

| 配置项 | 说明 |
|--------|------|
| **AID 值**（RID+PIX） | 终端支持的应用标识 |
| **ASI / Partial Name（部分匹配）** | 是否允许"扩展 AID"部分匹配——**所有卡组织强制要求支持** |
| **Application Version Number（9F09）** | 终端侧应用版本，与卡比对 |
| **Application Priority Indicator** | 候选列表优先级（值越小越优先，01 优于 02） |
| **TAC（Terminal Action Codes）** | 终端行为代码：**TAC-Denial / TAC-Online / TAC-Default**，与卡的 IAC 共同决定批准/拒绝/转联机 |
| **Terminal Floor Limit（9F1B）** | 地板限额 |
| **Target % / Threshold / Max Target %** | 随机/偏置联机选择参数 |
| **DDOL / TDOL** | 动态/交易认证数据对象列表（DDA/TC 用） |
| **TACs、币种、国家代码** | 见 [9F33/9F40/9F1A 等终端数据](./M-TIP-TSE问卷与终端配置参数.md) |

## 1.5 全匹配 vs 部分匹配（Partial Selection）

| 方式 | 含义 |
|------|------|
| **Full match** | 终端配置 AID 与卡 AID **完全相等** |
| **Partial match** | 卡 AID 在终端配置 AID 基础上**有额外字节**仍可选中（"扩展 AID"）；**所有支付系统强制支持** |

> 例（openscdp 配置）：
> ```
> { aid:"A00000002501",   partial:true,  name:"AMEX" }
> { aid:"A0000000031010", partial:false, name:"VISA" }
> { aid:"A0000000041010", partial:false, name:"MC"   }
> ```

---

# 二、CAPK（Certification Authority Public Key）

## 2.1 作用：ODA 信任链的根

CAPK 是终端侧存放的**卡组织 CA 根公钥**，用于离线数据认证（SDA/DDA/CDA）验证卡上证书链：

```
CAPK（终端内，按 RID+Index 选取）
  └─验证→ Issuer Public Key Certificate（标签 90，卡上）
            └─验证→ ICC Public Key Certificate（标签 9F46，卡上）
                      └─用于→ SDA / DDA / CDA 的签名验证
```

> 终端用 CAPK 验发卡行公钥证书，再用发卡行公钥验 ICC 公钥证书，最终验卡的动态签名/静态数据。**没有正确 CAPK → ODA 失败 → 离线交易降级或拒绝。**

## 2.2 CAPK 的组成

| 字段 | 说明 |
|------|------|
| **RID** | 该密钥所属卡组织（AID 前 5 字节） |
| **CA Public Key Index（CAPKI）** | 与 RID 一起唯一定位一把密钥；卡通过**标签 9F22** 告诉终端用哪个 index |
| **Modulus（模数）** | 公钥主体 |
| **Exponent（指数）** | 通常为 **3** 或 **65537（0x010001）** |
| **Key Length（密钥长度）** | 1024 / 1152 / 1408 / 1536 / 1984 / 2048 位等 |
| **Expiry Date（过期日）** | ddmmyy 格式 |
| **Checksum（校验和）** | **SHA-1**( RID ‖ CA Index ‖ Modulus ‖ Exponent )，用于校验密钥完整性 |

> 当前主流：Amex、Discover、JCB、Mastercard、Visa、WEX 均使用 **1408 位** 密钥（也并存其他长度）。

## 2.3 终端如何选 CAPK

1. 应用选择后，从 AID 得到 **RID**。
2. 读卡上 **CA Public Key Index（9F22）**。
3. 用 **(RID + Index)** 在 CAPK 表中定位唯一密钥。
4. 校验该 CAPK 的 checksum 与是否过期，再用其验证发卡行证书。

> 若 (RID+Index) 在终端 CAPK 表中缺失或过期 → 该卡 ODA 无法完成。

## 2.4 测试密钥 vs 生产密钥

- **L3 测试**：加载卡组织提供的**测试 CA 公钥**（如 Visa 1408/1536 位测试 CAPK，见 [CDET 用例](./Visa-CDET非接测试用例细分.md)）。
- **生产部署**：加载**生产 CAPK**。
- ⚠️ 两者不可混用：测试卡用测试密钥签名，生产卡用生产密钥；装错则 ODA 失败。

---

# 三、AID 与 CAPK 在 L3/TSE 配置中的关系

| 项 | 在 TSE / L3 工具里要做什么 |
|----|---------------------------|
| **AID** | 声明终端支持的**每一个** AID（RID+PIX）及其 ASI、版本号、TAC、Floor Limit 等——决定生成哪些卡品的测试用例 |
| **CAPK** | 加载对应卡组织的**全部测试 CAPK**（按 RID+Index）——否则离线认证类用例（SDA/DDA/CDA）无法通过 |

> 二者是 TSE 动态裁剪的输入：**声明了哪些 AID → 生成哪些卡品用例；装了哪些 CAPK → ODA 用例能否跑通。** 漏配是"测试计划与现场不符"和"ODA 莫名失败"的头号原因。

---

## 四、实操与排错要点

- **AID 要"应配尽配"**：终端现场支持的每个卡品 AID 都要进配置;漏一个 → 该卡品无候选应用 → 交易终止。
- **部分匹配必须开对**:扩展 AID 场景(如某些 Amex/域内卡)需 `partial=true`;全匹配卡用 `partial=false`。配错导致选不中或误选。
- **CAPK 按 (RID+Index) 唯一**:同一卡组织有多把密钥(不同 index/长度);卡用 9F22 指定,终端必须有对应那把。
- **测试/生产 CAPK 不混用**:L3 用测试密钥,上线换生产密钥;这是 ODA 失败的高频原因。
- **关注过期与轮换**:CAPK 有过期日,卡组织定期轮换/新增更长密钥(如 1984/2048 位);终端需及时更新密钥表,否则新卡 ODA 失败。
- **TAC 与 IAC 配合**:TAC-Denial/Online/Default 与卡的 IAC 按位"或/与"决定 AAC/ARQC/TC——风险管理类用例(如 ADVT TC4/TC7)依赖正确 TAC 配置。

---

**参考来源：**
- [EMV Transaction Flow Part 2: PSE and AID, Application Selection — MST](https://mstcompany.net/blog/acquiring-emv-transaction-flow-part-2-pse-and-aid-candidate-list-and-application-selection)
- [EMV — Application Selection（终端 AID 列表、partial）— OpenSCDP](https://www.openscdp.org/scripts/tutorial/emv/applicationselection.html)
- [EMV Series #3: Application Identifiers — RID and PIX — LinkedIn](https://www.linkedin.com/pulse/emv-little-guy-series-3-card-schemes-rid-pix-john-mcmahon)
- [What's CAPK — CloudPOS SDK](https://smartpossdk.gitbook.io/cloudpossdk/faq/emv/whats-capk)
- [EMV Public Cap Keys, Parameters, and Reports — Elavon Fusebox](https://developer.elavon.com/products/fusebox/v1/emv-public-cap-keys-parameters-reports)
- [How do I set CAPKs (L3 certification) — ID TECH](https://atlassian.idtechproducts.com/confluence/pages/viewpage.action?pageId=34706262)
- [EMV tag 8F (CA Public Key Index) — emvlab.org](https://emvlab.org/emvtags/show/t8F/)
- [EMV ODA Part II — LinkedIn (证书链)](https://www.linkedin.com/pulse/emv-application-specification-offline-data-oda-part-farghaly-1f)
