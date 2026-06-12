# American Express 与 Discover L3 认证深度解析

> 继 [Visa 与 Mastercard L3 认证深度解析](./Visa与Mastercard-L3认证深度解析.md) 之后，本文深入 **American Express（AEIPS/Expresspay）** 与 **Discover Global Network（D-PAS）** 的 L3 认证。
> 关联：[各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md)

---

# 一、American Express L3 认证

## 1.1 两大规范

| 规范 | 界面 | 全称 |
|------|------|------|
| **AEIPS** | 接触 | American Express ICC Payment Specification |
| **Expresspay** | 非接 | Expresspay Contactless Specification |

L3 认证的目标：向 Amex 证明收单方/处理方/商户具备**按 AEIPS + Expresspay 受理芯片卡**的能力。

## 1.2 适用终端范围

L3 测试覆盖**所有接触/非接芯片终端**：
- POS、mPOS、ATM
- **Transit（交通，仅非接）**
- **Tap to Phone（仅非接）**
- **Fleet 2.0**（车队卡）
- 涵盖全球与区域要求（含适用的监管要求）

## 1.3 测试场景（子计划）

| 场景 | 说明 |
|------|------|
| **Global test plan** | AEIPS/Expresspay 接触+非接全球测试计划 |
| **Global AFD** | 自动加油机（Automated Fuel Dispenser） |
| **Transit** | Expresspay 交通场景（仅非接） |
| **Quick Chip** | 加速接触芯片交易（持卡人可提前拔卡） |
| **Pre-Tap** | 非接预触场景 |

> 规范版本参考：AEIPS（如 4.5 / 6.4 等演进）、Expresspay（3.1 / 4.0 / 4.1）、Expresspay Transit 4.0、Amex AFD 1.1。

## 1.4 认证流程

1. **联系 Amex 代表** 启动认证流程。
2. Amex 与收单方/处理方/商户**评审测试计划与报文规范（message specifications）**。
3. 使用 **EMVCo L3 认证测试工具**（必需）执行 L3 测试。
4. **演示合规** —— 证明对相关 AEIPS/Expresspay 规范的符合性。

## 1.5 工具与生态

- **ASP（Approved Solution Provider）Program**：Amex 维护认可的收单测试工具清单。
- 认可工具示例：**EMV_L3_TTS**、ICC Solutions **ICCSimTmat**（支持 AEIPS/Expresspay/Quick Chip/Pre-Tap/Transit/AFD 的卡模拟与测试计划评估）；FIME BTT 亦在列。
- **AMEX Enabled** 程序：覆盖 HCE/云端移动支付与 SE 移动方案。

## 1.6 前提

- POS 设备需 **PCI 批准**。
- 终端须已通过 **EMVCo L1/L2**。
- 卡侧 Type Approval：AEIPS/Expresspay 的卡安全与功能型式批准（实验室如 Applus+ 提供）。

---

# 二、Discover Global Network（D-PAS）L3 认证

## 2.1 D-PAS 与覆盖网络

- **D-PAS（Discover Payment Application Specification）**：Discover Global Network 的 EMV 规范，支持**线上/线下、接触/非接**交易。
- **覆盖网络**：**Discover®、Diners Club International®、PULSE**，以及全球合作网络发卡的卡（共用 RID `A000000152`，靠 PIX 区分）。

## 2.2 DPAS L3 = D-PAS E2E（End-to-End）认证

- **强制流程**：验证接触与非接受理终端正确支持 D-PAS 应用，保证安全互操作。
- **E2E（端到端）**：验证**终端 ↔ 收单主机**集成，含授权请求/响应、在线/离线交易、网络专属规则合规。
- 三阶段：**开发测试 → 测试 → 正式验证（formal validation）**。

## 2.3 ZIP（Discover Zip）

- **ZIP** 是 D-PAS 的**非接磁条数据（MSD / MEG Strip Data）**路径产品——类似 Visa MSD / Mastercard PayPass Mag-Stripe。
- 用于低值/无签名快速非接；卡侧有 **ZIP Card Security Evaluation**（针对使用 MSD 的非接卡）。

## 2.4 测试材料

- **D-PAS L3 测试计划** + 专项测试卡集。
- 例：**FIME SAVVI DGN DPAS L3 Test Plan FallBack Cards**（回退场景测试卡）。
- 非接含 **Cross Testing（交叉测试）**。

## 2.5 前提

- D-PAS 必须实现在 **EMVCo 安全认证的 IC** 上。
- 接触 L1（电气/协议）、非接 L1（模拟/数字）；L2 内核。
- 通过 **认证服务商（accredited E2E provider）** 执行（如 Payhuddle、FIME、Applus+）。

---

# 三、Amex vs Discover 对照（并入 Visa/MC 视角）

| 维度 | American Express | Discover（DGN） |
|------|------------------|------------------|
| 接触规范 | **AEIPS** | **D-PAS**（接触） |
| 非接规范 | **Expresspay** | **D-PAS 非接** + **ZIP（MSD）** |
| L3 程序名 | Global test plan（+AFD/Transit/Quick Chip/Pre-Tap） | **D-PAS E2E** |
| 覆盖网络 | American Express | Discover + Diners + PULSE |
| RID | A000000025 | A000000152（Diners 同 RID） |
| 启动方式 | 联系 Amex 代表，评审测试计划+报文规范 | 经认证 E2E 服务商 |
| 工具 | ASP 认可工具（EMVCo L3 qualified） | EMVCo L3 qualified 工具 + DGN 测试卡 |
| 特色场景 | AFD、Transit、Fleet 2.0、Tap to Phone | ZIP（非接 MSD）、Fallback、Cross Testing |

## 与 Visa/MC 提交机制对比
| 卡组织 | 认证产出/提交 |
|--------|---------------|
| Visa | CCRT 合规上报 |
| Mastercard | TSE 文件 → 服务商签 **LoA** |
| **Amex** | 与 Amex 代表评审 + 工具测试 → 合规演示（LoA） |
| **Discover** | 经认证 E2E 服务商 → 正式验证（LoA） |

> 共性：四家都要求 **EMVCo L3 认证工具**、覆盖所有终端配置变体；差异在**谁来签发/如何提交**（Visa 自助 CCRT；MC/Amex/Discover 多经服务商/品牌评审）。

---

## 四、实操与测试要点

- **Amex 场景子计划多**：AFD（油站）、Transit（交通）、Quick Chip、Pre-Tap、Fleet 2.0——部署对应场景的商户需额外覆盖,别只跑 Global 基线。
- **Amex 走"代表评审"**：流程上需与 Amex 代表对齐测试计划与报文规范,不是纯自助。
- **Discover 一证多网**：D-PAS E2E 一次覆盖 Discover/Diners/PULSE,但 **ZIP（非接 MSD）** 是独立路径,支持则需单独测。
- **ZIP ≈ 非接磁条**:与 Visa MSD/MC Mag-Stripe 同类,逐步式微但仍在用;注意其安全评估单列。
- **Fallback / Cross Testing**:Discover 强调回退与交叉测试——多品牌/多卡场景的互操作验证。
- **前提一致**:L1/L2 + PCI(POS)是各家通用门槛;D-PAS 还强调"必须跑在 EMVCo 安全认证 IC 上"。

---

## 待补充
- JCB TCI / TCI-CL 用例深入
- 银联 UAC / QuickPass（Integration + Functional）用例深入

---

**参考来源：**
- [US Payments Forum — Payment Network Host and Level 3 Requirements (2023)](https://www.uspaymentsforum.org/wp-content/uploads/2024/04/Payment-Network-Host-and-Level-3-Requirements-Final-09292023.pdf)（本地：`web-docs/`）
- [American Express AEIPS & Global ExpressPay (Terminal L3) — FIME](https://www.fime.com/shop/product/trtl307-training-terminal-level-3-american-express-1-day-89)
- [American Express Approved Solution Provider — L3 Test Tool List](https://network.americanexpress.com/globalnetwork/)
- [American Express Certification — Applus+ Laboratories](https://www.appluslaboratories.com/global/en/what-we-do/service-sheet/american-express-certification-)
- [Amex Quick Chip Technical Manual](https://network.americanexpress.com/globalnetwork/dam/jcr:e13ac470-19e7-424d-9531-baf153183bcb/GNW_AmericanExpress-QuickChip-TechnicalManual.pdf)
- [Discover D-PAS E2E — Contact & Contactless — Payhuddle](https://www.payhuddle.com/our-offerings/services/dpas-e2e-certification)
- [Discover Certification — Applus+ Laboratories](https://www.appluslaboratories.com/global/en/what-we-do/service-sheet/discover-certification-)
- [D-PAS Payments Technology — Discover Global Network](https://www.discoverglobalnetwork.com/solutions/technology-payment-platforms/d-pas/)
- [SAVVI — DGN DPAS L3 Test Plan FallBack Cards — FIME](https://www.fime.com/shop/product/savvdgnctpfbc-savvi-discover-global-network-dpas-l3-test-plan-fallback-cards-4-test-cards-4484)
