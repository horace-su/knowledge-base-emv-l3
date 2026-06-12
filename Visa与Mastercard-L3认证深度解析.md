# Visa 与 Mastercard L3 认证深度解析

> 本文深入两大国际卡组织的 L3（终端集成/部署）认证流程、工具与提交机制。
> 关联：[各卡组织 L3 认证测试要求一览](./各卡组织L3认证测试要求一览.md) · [FIME-BTT 深度解析](./FIME-BTT-品牌测试工具深度解析.md)

---

# 一、Visa L3 Testing

## 1.1 工具演进：ADVT/CDET → Global L3 Test Set（关键变更）

> ⚠️ **重要时间点**：自 **2022 年 7 月 16 日** 起，旧版工具包 **ADVT、CDET、U.S. ADVT/CDET、VpTT 全部停用**，不得再用于任何新的 L3 测试活动。此后全球所有新 L3 测试必须使用 **Visa EMV-compliant Global L3 Test Set Files**（统一的全球 L3 测试集文件）。

这意味着 BTT 等工具中"Visa L3 Testing"如今对应的是 **Global L3 Test Set**，而非传统的 ADVT/CDET 物理卡工具包。但理解原工具包仍有助于把握测试内容：

| 工具包 | 全称 | 测试对象 |
|--------|------|----------|
| **ADVT** | Acquirer Device Validation Toolkit | **接触式芯片**受理（POS + ATM） |
| **CDET** | Contactless Device Evaluation Toolkit | **非接（NFC）**支付流程 |
| **qVSDC DM** | qVSDC Data Management（条件性） | 特定 qVSDC 数据管理场景 |

- ADVT/CDET 由一组 **测试卡（或卡模拟器）** 组成，每张卡经特定参数个人化，**每张卡 = 一个必须执行的测试用例**，用于识别编码或配置错误的受理设备。
- 接触 + 非接合计测试交易量级达数十万笔（自动化执行）。

## 1.2 强制性与合规

- **强制使用**：收单机构在终端**首次部署前**，必须对**所有硬件/软件/参数配置变体**运行适用的全部测试用例。
- **罚则**：未使用而引发互操作问题者，依 **Visa Chip Interoperability Compliance Program** 可被处罚款。
- **前提**：仅可在 **EMVCo 批准** 的终端上执行;新部署须包含当前有效 EMVCo 批准的 **IFM/内核**。

## 1.3 提交与报告：CCRT

- **CCRT（Chip Compliance Reporting Tool）**：Visa 的集中式、服务器端报告工具。
- 收单机构/合作方将 ADVT/CDET/qVSDC DM（如适用）的测试结果 **通过 CCRT 提交**，由其统一管理合规上报流程。

## 1.4 资料获取

- **Visa Technology Partner（VTP）/ Digital Partner Services** 门户提供 L3 测试材料、工具包与卡片镜像（Card Images）。
- 权威文档：**Visa Global Level 3 (L3) Testing Guidelines and FAQ**（如 v1.16 等版本）。

## 1.5 Visa L3 流程概览

1. 确认终端已通过 EMVCo L1/L2 且具备有效批准的内核/IFM；POS 需 PCI 批准。
2. 从 VTP/DPS 门户获取 **Global L3 Test Set Files** 及相应测试材料。
3. 用 EMVCo 认证的 L3 工具（如 FIME BTT）对终端**每个配置变体**执行全部适用测试用例（接触 ADVT 范畴 + 非接 CDET 范畴 + qVSDC DM 条件性）。
4. 记录测试结果与交易日志。
5. 通过 **CCRT** 提交结果完成合规上报。

---

# 二、Mastercard M-TIP

## 2.1 概念

**M-TIP（Mastercard Terminal Integration Process）** 是 Mastercard 的终端集成测试程序，覆盖**接触 + 非接**。其核心是用一套规则引擎按终端实际配置**裁剪出适用测试计划**，并通过认证服务商签发批准函。

## 2.2 核心组件：TSE（Test Selection Engine）

- **TSE** 是 Mastercard 自有的 **Windows 应用**（连同 TSE 配置文件，从 **Mastercard Connect** 下载）。
- 收单机构/VAR 在 TSE 中**描述其终端配置**（受理能力、卡品、场景等）。
- TSE 依据 **M-TIP Test Set** 定义的测试规则，生成：
  - 一份**适用的 M-TIP 测试计划**；
  - 一个**唯一的 M-TIP 参考号（reference number）**——贯穿整个认证、用于结果追溯。
- **L3 Test Sets**：M-TIP 测试场景按需求变更/互操作发现不定期更新，以"L3 Test Set"形式由测试工具厂商或 Mastercard Connect 提供。当前已演进至 **M-TIP 2.0**。

## 2.3 M-TIP 流程（5 步）

1. **选定服务商**：收单机构向其选择的 **Mastercard 认证 M-TIP 服务商（Formal Approval Service Provider）** 订购 M-TIP 服务。
2. **配置 TSE**：从 Mastercard Connect 下载最新 TSE 软件及配置文件，录入解决方案/终端配置细节，**生成测试计划 + M-TIP 参考号**。
3. **执行测试**：用 M-TIP 测试工具（EMVCo 认证 L3 工具，如 FIME BTT）执行测试计划，在 TSE 或测试工具中记录测试结果与交易日志。
4. **提交结果**：将测试结果（**TSE 文件**）发送给 M-TIP 服务商进行验证。
5. **签发 LoA**：测试成功后，服务商代表 Mastercard 签发 **M-TIP Letter of Approval（LoA，批准函）**。

## 2.4 非接的额外前提

- 非接 M-TIP 测试需先取得 **Mastercard Contactless Vendor Product Letter of Approval（VPLA）**——即终端的非接产品须已获 Mastercard 非接批准函,方可进行非接 M-TIP。

## 2.5 角色分工

| 角色 | 职责 |
|------|------|
| 收单机构 / VAR | 配置 TSE、执行测试、提交 TSE 文件 |
| M-TIP 测试工具厂商 | 提供 EMVCo 认证 L3 工具与 L3 Test Set |
| Mastercard 认证服务商（FASP） | 验证结果、代表 Mastercard 签发 LoA |
| Mastercard | 提供 TSE/Test Set,定义规则,授权服务商 |

---

# 三、Visa vs Mastercard 对照

| 维度 | Visa | Mastercard |
|------|------|------------|
| 程序名 | Visa L3 Testing（Global L3 Test Set） | M-TIP |
| 测试集来源 | VTP/DPS 门户的 Global L3 Test Set Files | Mastercard Connect 的 L3 Test Set + TSE |
| 配置/裁剪工具 | 工具包按配置选用例 | **TSE** 按配置生成计划 + 唯一参考号 |
| 接触 | ADVT 范畴 | M-TIP（contact） |
| 非接 | CDET 范畴（+ qVSDC DM 条件性） | M-TIP（contactless），需先有 **VPLA** |
| 结果提交 | **CCRT**（自助上报，无单独 LoA 概念） | 提交 **TSE 文件** 给认证服务商 |
| 认证产出 | CCRT 合规记录 | **M-TIP LoA（批准函）** |
| 合规约束 | Chip Interoperability Compliance Program（可罚款） | 服务商验证 + LoA |
| 关键里程碑 | 2022-07-16 起强制用 Global L3 Test Set | 已演进至 M-TIP 2.0 |

**实操差异要点：**
- **Visa 更"自助上报"**：跑完测试，结果进 CCRT，合规由 Visa 体系核验;**Mastercard 更"服务商签发"**：必须经认证服务商验证 TSE 文件并签发 LoA。
- **唯一参考号机制不同**：Mastercard 的 M-TIP 参考号在 TSE 生成阶段即绑定终端配置,是全程追溯主键;Visa 侧以 CCRT 的提交记录为准。
- **配置变体覆盖**:两家都要求覆盖**所有硬件/软件/参数变体**——这往往是工作量与自动化收益的主要来源。

---

**参考来源：**
- [Visa Global Level 3 (L3) Testing Guidelines and FAQ](https://digitalpartnerservices.visaonline.com/Document/Download/865)
- [Visa Level 3 Testing Materials — Visa Technology Partner](https://technologypartner.visa.com/Toolkits/Introduction.aspx)
- [Visa U.S. EMV Chip Terminal Testing Requirements v2.1](https://usa.visa.com/dam/VCOM/regional/na/us/run-your-business/documents/emv-chip-terminal-testing-feb2019.pdf)
- [VISA Global Level 3 Testing — iso8583.info](https://iso8583.info/lib/EMV/L3/VISA/)
- [MasterCard TSE — ICC Solutions HelpDesk](https://helpdesk.iccsolutions.com/hc/en-us/sections/201599259-MasterCard-TSE)
- [TIP Test Selection Engine User Guide](https://usermanual.wiki/Document/TIP20Test20Selection20Engine20User20Guide2020Feb202015.1891829501.pdf)
- [Mastercard M-TIP Letter of Approval 示例](https://www.c9pg.com/cert/EMV/Global/PORT0861%20-%20LMP_HPS_1908_004.pdf)
- [Fime terminal integration tools updated to Mastercard M-TIP 2.0 — Finextra](https://www.finextra.com/pressarticle/59480/fime-terminal-integration-tools-updated-to-mastercard-m-tip-20)
- [US Payments Forum — Payment Network Host and Level 3 Requirements (2023)](https://www.uspaymentsforum.org/wp-content/uploads/2024/04/Payment-Network-Host-and-Level-3-Requirements-Final-09292023.pdf)
