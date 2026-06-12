# FIME Brand Test Tool (BTT) 深度解析

**来源：** [Brand Test Tool (BTT) — Fime](https://www.fime.com/shop/product/brand-test-tool-btt-4946)

> 这是 [FIME L3 测试工具总览](./FIME-L3测试工具深度解析.md) 中旗舰产品 BTT 的专项深入分析。

## 一、产品定位

BTT 用于在支付设备 **接入支付网络之前** 完成验证，确保终端具备 **互操作性，并通过 EMV 合规、卡组织认证**。它是 FIME 面向终端侧 L3 品牌测试的核心工具，覆盖 POS、移动 POS（mPOS）、ATM、自动售货机及其他受理设备的 **强制性品牌测试（mandatory brand testing）**。

核心价值在于"**一个工具覆盖所有主要卡组织**"——无需为每个卡组织部署独立工具链。

## 二、核心能力

- **完整集成的 EMVCo L3 功能**——基于 **官方认证组件 L3 CS、L3 TSE、L3 TT** 构建（即卡模拟器、测试脚本引擎、测试工具三件套均为 EMVCo 合格件）。
- **内置 Card Simulator 与 Card Spy**——既能模拟卡片驱动测试，又能嗅探/分析卡片与终端的通信。
- **三类卡片模拟**：接触式（contact）、非接触式（contactless）、磁条（magstripe）。
- **EMV 交通卡模拟**（EMV-in-transit）——支持交通场景测试。
- **集成测试自动化模块**——支持无人值守（unattended）测试运行。
- **规范持续更新**——卡组织测试方案变更时同步跟进。
- **分步屏幕引导**——每个测试序列提供"易于遵循"的操作指引。
- 与 **M-TIP 和 Visa L3** 流程深度集成。

## 三、各卡组织支持及对应测试方案

| 卡组织 | 测试方案 | 覆盖范围 |
|--------|----------|----------|
| **American Express** | Global test plan + Global AFD + Transit | 接触/非接、加油站（AFD）、交通 |
| **Mastercard** | M-TIP | 接触 + 非接 |
| **Visa** | Visa L3 Testing | —— |
| **JCB** | Terminal Check for Implementation (TCI) | 接触/非接 |
| **Discover / Diners Club / PULSE** | DPAS L3 | —— |
| **UnionPay International（银联国际）** | IC Card + QuickPass（闪付） | Integration 与 Functional 两类测试方案 |
| **本地卡组织** | —— | BankAxept（挪威）、EFTPOS（澳大利亚）、ELO（巴西）、Interac（加拿大）、PayNet（马来西亚） |

> 说明：AFD = Automated Fuel Dispenser（自动加油机/油站无人收银场景），是 Amex/各卡组织单独的子测试方案。

## 四、软硬件组成

BTT 是"**软件 + 专用硬件**"方案：软件运行于 PC，通过专用硬件与被测设备（DUT）对接。

**套件包含：**
- **BTT 软件**
- **硬件加密狗（Hardware key）**——授权许可
- **SmartConnect**（接触 + 非接，可选）
- **SmartLink Box**（接触式，可选）
- **SmartWave Box**（非接式，可选）
- **SmartStripe**（磁条，可选）

> 这些 Smart* 硬件即卡模拟器的物理接口模块：按需选配，决定你能测试哪类卡片介质（接触/非接/磁条）。

## 五、测试工作方式

1. BTT 软件在 PC 上运行，通过专用硬件连接被测设备。
2. 工具按卡组织测试方案提供 **分步骤屏幕指引**，逐条执行测试序列。
3. **Card Simulator** 模拟卡片行为驱动交易；**Card Spy** 同步捕获并分析卡↔终端通信。
4. **测试自动化模块** 可将测试用例编排为无人值守运行，适合回归测试。

## 六、要点与评估提示

- **"一个工具覆盖所有品牌"是 BTT 最大卖点**——相较于为每个卡组织维护独立工具，BTT 在多品牌终端认证场景下能显著降低工具与培训成本。
- **基于 EMVCo 合格组件 ≠ 自动获得认证**——BTT 用的是 *合格件*（CS/TSE/TT），但每个卡组织的认证仍需按各自品牌测试方案分别完成与提交。
- **硬件选配决定测试介质范围**——只测接触式可只配 SmartLink Box；要覆盖非接/磁条需相应加配 SmartWave/SmartStripe，或用 SmartConnect 一体覆盖接触+非接。采购前需明确目标设备的卡片受理类型。
- **自动化模块是规模化关键**——大批量/频繁回归场景下，自动化模块（及第三方如 PaytestLab/PaytestProbe 的封装方案）能把人工逐步操作转为无人值守批量执行。FIME 官网未披露具体自动化机械/吞吐细节，需向 FIME 或集成商进一步确认。
- **官网未公开的信息**——系统要求（OS/硬件配置）、许可模式、价格、具体吞吐指标等均未在产品页列出，评估时需直接向 FIME 索取规格书（datasheet/flyer）。

## 七、与组合中其他工具的关系

- **BTT vs ASTREX**：BTT 面向 **终端侧** 品牌测试（终端厂商视角）；ASTREX 面向 **主机/端到端** 模拟（收单机构/处理方视角）。完整 L3 认证通常两者配合使用。
- **STP（Self Test Platform）**：BTT 负责执行测试，STP 提供 Web 化的认证项目管理与流程编排——可视为 BTT 的"管理门户"层。
- **Card Simulator / Card Spy**：已内置于 BTT，但也作为独立产品提供。

---

**参考来源：**
- [Brand Test Tool (BTT) — Fime](https://www.fime.com/shop/product/brand-test-tool-btt-4946)
- [Level 3 Test Tools — Fime](https://www.fime.com/level3-test-tools)
- [Webinar: Automation of Fime BTT EMV L3 Certification — PaytestLab](https://paytestlab.com/webinar-automation-of-fime-btt-emv-l3-certification/)
