# Visa Global L3 Test Set 与 qVSDC DM 详解

> 接续 [Visa CDET 非接测试用例细分](./Visa-CDET非接测试用例细分.md)，本文解释两件事：
> ① 2022 年取代 ADVT/CDET 的 **Global L3 Test Set** 究竟是什么、为何变；② 条件性工具 **qVSDC DM** 的具体用途与适用边界。

---

# 一、Visa Global L3 Test Set

## 1.1 变更本质：从"Visa 私有工具包"到"EMVCo 标准测试集"

> **2022-07-16 起**，旧版 **ADVT、CDET、U.S. ADVT/CDET、VpTT** 全部停用，不得再用于任何**新的** L3 测试。全球新 L3 测试一律改用 **Visa EMV-compliant Global L3 Test Set Files**。

这不是简单换名，而是测试**载体和治理模式**的根本转变：

| 维度 | 旧模式（ADVT/CDET 工具包） | 新模式（Global L3 Test Set） |
|------|---------------------------|------------------------------|
| 载体 | Visa 私有的物理测试卡 / 专用工具包 | **EMVCo L3TG 定义的标准化 XML 卡镜像文件** |
| 治理 | Visa 各自维护 | **EMVCo Level 3 Testing Group（L3TG）** 统一框架 |
| 执行 | Visa 专用工具 | **EMVCo 认证的 L3 测试工具 + 认证卡模拟器** |
| 一致性 | 各品牌、各地区分散 | 全球一致、跨品牌标准化 |

## 1.2 XML 卡镜像（Card Images）是核心

- Visa 将原 ADVT/CDET 各测试卡 profile 及**预期行为**，转换为 **EMVCo L3TG 定义的标准 XML 格式**卡镜像文件。
- 这些 XML 镜像供 **EMVCo 认证的卡模拟器**（如 FIME BTT 内置的 Card Simulator）加载使用——不再依赖物理测试卡。
- 测试内容（用例语义）延续 ADVT（接触）/ CDET（非接）体系，但以标准文件分发。

## 1.3 背后的 EMVCo 框架

两份 EMVCo 定义文档共同规范 L3 工具的开发、认证与使用：
- **EMV Level 3 Testing Framework – Process Enhancements**
- **EMV Level 3 Testing Framework – Implementation Guidelines**

即 EMVCo 统一定义"L3 测试工具该怎么做、怎么被认证、怎么用"，各卡组织（不止 Visa）在此框架内提供各自测试集。这就是为什么 BTT 宣传"officially qualified components for L3 CS / L3 TSE / L3 TT"——对应的正是这套 EMVCo L3 框架组件。

## 1.4 对实施方的影响

- **工具必须是 EMVCo 认证的 L3 工具**，且能加载标准 XML 测试集；旧的 Visa 专用工具作废。
- 测试结果仍**通过 CCRT 提交**给 Visa 完成合规上报。
- 测试覆盖逻辑不变：仍需覆盖所有硬件/软件/参数变体，跑全部适用用例。

---

# 二、qVSDC DM（quick VSDC Device Module）

## 2.1 定位：第三个、条件性的工具

Visa 部署前三件套 = **ADVT（接触）+ CDET（非接）+ qVSDC DM（条件性）**。qVSDC DM 是其中**条件性**的一个，并非所有终端都需要。

## 2.2 具体用途

- **全称**：quick Visa Smart Debit Credit **Device Module**（qVSDC 设备模块）。
- **解决什么**：针对 **Visa payWave qVSDC 读卡器以"独立非接读卡器（stand-alone contactless reader）"形态部署** 时的**产品批准自测要求**。
- **检验什么**：在激活/部署独立非接读卡器前，验证其作为独立设备的 qVSDC 行为正确，作为整体**非接读卡器批准流程**的一环。

## 2.3 适用边界（关键）

| 条件 | 是否需要 qVSDC DM |
|------|-------------------|
| 独立非接读卡器，支持 **qVSDC** | ✅ 必须使用并验证通过 |
| 仅支持 **MSD** 非接的读卡器 | ❌ 不适用 |
| 非独立（集成式）终端 | 一般不触发（取决于部署形态） |

> 一句话：**qVSDC DM 只针对"独立式、支持 qVSDC 的非接读卡器"**；只做 MSD 的非接读卡器用不上它。

## 2.4 与 CDET 的关系

- **CDET**：通用的非接受理设备评估（POS/ATM/MPOS/交通等各种形态），覆盖 payWave 全场景与 UI。
- **qVSDC DM**：在 CDET 之外，**额外针对独立 qVSDC 读卡器的产品批准自测**——是对特定部署形态的补充验证，而非替代 CDET。
- 具体测试条目见 Visa 的 **qVSDC Device Module Test Cases** 文档。

---

# 三、三件套关系总览

| 工具 | 界面 | 适用范围 | 强制性 |
|------|------|----------|--------|
| **ADVT** | 接触 | 所有接触芯片受理设备 | 强制（接触能力） |
| **CDET** | 非接 | 所有非接受理设备（payWave 全场景 + UI） | 强制（非接能力） |
| **qVSDC DM** | 非接 | **仅独立式 qVSDC 读卡器** | **条件性** |

> 三者现在都以 **Global L3 Test Set（EMVCo 标准 XML 卡镜像）** 的形式承载，用 EMVCo 认证工具执行，结果统一进 **CCRT**。

---

## 四、实操要点

- **"Global L3 Test Set"是分发形式，不是新用例体系**——ADVT/CDET 的测试语义延续，变的是标准化 XML 载体与 EMVCo 治理。
- **判断是否需要 qVSDC DM**：先看终端是否为"独立非接读卡器 + 支持 qVSDC"。集成式终端或仅 MSD 设备通常不需要。
- **工具合规性是前提**：必须用 EMVCo 认证、支持标准 XML 测试集的 L3 工具；旧 Visa 专用工具已不可用于新测试。
- **CCRT 始终是提交终点**：无论哪个工具，结果都汇入 CCRT 完成 Visa 合规上报。

---

**参考来源：**
- [Visa Global Level 3 (L3) Testing Guidelines and FAQ](https://digitalpartnerservices.visaonline.com/Document/Download/865)
- [EMVCo Qualified and Visa Confirmed L3 Test Tools — Visa DPS](https://digitalpartnerservices.visaonline.com/Document/Download/866)
- [Visa Level 3 Testing Materials — Visa Technology Partner](https://technologypartner.visa.com/Toolkits/Introduction.aspx)
- [Visa U.S. EMV Chip Terminal Testing Requirements v2.1 (本地副本: web-docs/)](https://usa.visa.com/dam/VCOM/regional/na/us/run-your-business/documents/emv-chip-terminal-testing-feb2019.pdf)
- [What is EMV Level 3 Testing? — EMVCo](https://www.emvco.com/knowledge-hub/what-is-level-3-terminal-integration-testing/)
