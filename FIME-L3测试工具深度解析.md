# FIME Level 3 测试工具深度解析

**来源：** [fime.com/level3-test-tools](https://www.fime.com/level3-test-tools)

## 背景：L3 在 EMV 测试体系中的位置

FIME 是主要的 EMVCo 认可测试实验室/厂商之一。本页面是其面向 **EMV Level 3（终端集成）测试** 的工具组合——这是终端正式上线前的最后一道测试环节。理解这些工具存在的原因，先看 [EMVCo 的定义](https://www.emvco.com/knowledge-hub/what-is-level-3-terminal-integration-testing/)：

| 层级 | 测试内容 | 负责方 |
|------|----------|--------|
| **L1** | 物理层——卡片与读卡器之间的机械/电气/射频连接 | EMVCo |
| **L2** | 内核 / 支付应用——设备上的交易处理逻辑 | EMVCo |
| **L3** | **端到端集成**——已通过认证的设备在真实环境中与收单主机 + 支付网络协同工作 | **由各卡组织自行定义要求**；EMVCo 仅认证测试框架/工具 |

关键点：**不存在单一的"EMV L3 认证"**。每个卡组织（Visa、Mastercard、Amex 等）都有各自的品牌测试方案（brand test plan）。EMVCo 的职责仅限于认证 **组件**——L3 Card Simulator（CS，卡模拟器）、Test Script Engine（TSE，测试脚本引擎）和 Test Tool（TT，测试工具），FIME 的产品正是基于这些组件构建的。这也是 FIME 提供 *多个* 工具而非单一产品的原因。

## 产品阵容（共 10 个工具）

页面链接了以下产品，按功能可分为三大类：

### 1. 品牌认证 / 终端侧测试

**Brand Test Tool (BTT)** —— 旗舰 L3 产品
- 为 POS、移动 POS（mPOS）、ATM、自动售货机及其他受理设备执行 **强制性品牌测试方案**。
- 基于 **官方认证的 EMVCo L3 组件：L3 CS、L3 TSE 和 L3 TT** 构建。
- **各卡组织覆盖范围**（这是落地页隐藏的重要细节）：
  - **American Express** —— 全球测试方案（接触/非接、AFD 加油、Transit 交通）
  - **Mastercard** —— M-TIP（接触 + 非接）
  - **Visa** —— Visa L3 Testing
  - **JCB** —— Terminal Check for Implementation
  - **Discover / Diners Club / PULSE** —— DPAS L3
  - **UnionPay International（银联国际）** —— IC Card 和 QuickPass（闪付）
  - **本地/区域卡组织** —— BankAxept、EFTPOS、ELO、Interac、PayNet
- 内置 **Card Simulator** 和 **Card Spy**；可模拟接触、非接及磁条卡，包括 EMV 交通卡（EMV-in-transit）。
- 配备 **集成测试自动化模块**，支持无人值守/回归测试运行。
- 提供分步引导式流程；软件运行于 PC，通过专用硬件与设备对接。

**Self Test Platform (STP)**
- 基于 Web 的全自动化平台，用于支付终端的 **流程管理、功能测试和品牌认证**。
- 这是"自助服务门户"层——让厂商/收单机构能够管理认证项目，而非手动驱动工具。

### 2. 主机 / 收单侧及端到端测试

**ASTREX** —— 企业级端到端平台
- 模拟支付链路中的"多种交易类型和组件"，验证 **完整的 商户 → 收单机构 → 网络 → 发卡机构** 生产环境。
- 支持 **多连接并发交易处理，达到生产级速度**；协议无关的交易构建（无需编写脚本）；支持 **100+ 国际及本地报文协议**。
- **EMV L3 处理内核：** M/Chip、VSDC、AEIPS、DPAS、CCD，以及 UnionPay、JCB、Interac 变体。
- **主机模拟器认证状态**（值得关注——这些是真实的卡组织授权）：
  - 已批准主机模拟器：**Diners、Discover、Pulse、Visa**
  - 合格模拟器：**American Express**
  - 自认证能力：**Mastercard**
  - 测试主机模拟器：**DNA、Interac、UPI**

**Host Testing Solution (HTS)**
- 专用的主机/服务器侧测试（收单机构或处理方端点），与 ASTREX 更宽泛的范围互补。

### 3. 卡级别捕获、分析与个人化

**Card Simulator（卡模拟器）** —— 模拟卡片以测试设备是否正确处理交易（面向收单机构、处理方、商户、终端厂商）。

**Card Spy** —— 捕获并分析卡片↔终端通信，同时测量性能（协议分析仪/嗅探器）。

**SmartSpy+** —— 便携式硬件，可捕获、记录并分析 **接触式与非接触式** 的卡片到读卡器通信。

**EMV PVT（Personalization Validation Tool，个人化验证工具）** —— 依据主要支付组织的强制性个人化规则验证 EMV 卡个人化（发卡侧，非终端侧）。

**PersevalPro Issuer** —— 面向发卡机构的个人化验证（EMV PVT 的配套产品）。

**Fime Test Cards** —— 用于驱动测试方案的物理参考测试卡。

## 各组件如何协同

使用这些工具的典型终端/收单认证流程：

1. **预认证准备** —— 用 **BTT**（配合 Card Simulator / Test Cards）在设备上运行卡组织品牌测试方案，用 **Card Spy / SmartSpy+** 调试协议问题。
2. **管理认证项目** —— 通过 **STP**（Web 门户）运行并跟踪功能测试 + 品牌认证。
3. **主机与端到端** —— 用 **ASTREX** / **HTS** 验证收单主机和完整交易链路，利用其卡组织已批准的主机模拟器进行自认证（尤其是 Mastercard 自认证和 Visa/Discover/Amex 授权）。
4. **发卡侧** —— 用 **EMV PVT / PersevalPro Issuer** 验证卡片个人化。

## 弦外之音 / 需要注意的要点

- **落地页刻意弱化了卡组织支持信息** —— 它只说"主要支付组织"，而实际的各品牌覆盖范围（见上文）只出现在各产品的详情页。若做评估，请查看产品详情页，而非索引页。
- **"EMVCo L3 功能" ≠ 一项认证。** BTT 使用的是 *合格组件*；认证本身仍由各卡组织分别授予。不要混淆二者。
- **ASTREX 与 BTT 的分工：** BTT 面向终端的品牌测试；ASTREX 面向主机/端到端模拟。二者在 EMV 内核上有重叠，但服务于不同角色（终端厂商 vs. 收单机构/处理方）。
- **自认证能力因卡组织而异** —— ASTREX 对 Visa/Discover/Diners/Pulse 是 *已批准*，对 Amex 仅 *合格*，对 Mastercard 提供 *自认证*。这种不对称反映了各卡组织自身的政策，并影响你能在内部自行完成多少、需要多少 FIME 实验室介入。
- **第三方生态** —— 搜索结果中 PaytestLab 和 EazyPay 提供围绕 FIME BTT 的自动化/封装方案。这些工具之上存在一个第三方生态，如需大规模自动化回归测试值得了解。

---

**参考来源：**
- [Level 3 Test Tools — Fime](https://www.fime.com/level3-test-tools)
- [ASTREX — Fime](https://www.fime.com/shop/product/astrex-4945)
- [Brand Test Tool (BTT) — Fime](https://www.fime.com/shop/product/brand-test-tool-btt-4946)
- [What is EMV Level 3 Testing? — EMVCo](https://www.emvco.com/knowledge-hub/what-is-level-3-terminal-integration-testing/)
