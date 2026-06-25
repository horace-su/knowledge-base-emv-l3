# Mastercard M-TIP TSE 配置详解

> 在 [MC-TSE配置项与Visa-L3测试用例](../04-visa专题/MC-TSE配置项与Visa-L3测试用例.md) 基础上，本文专门细化 TSE（Test Selection Engine）的**操作流程、问卷结构、动态裁剪逻辑与结果判定**。
> 关联：[Visa 与 Mastercard L3 认证深度解析](../03-各卡组织L3认证/Visa与Mastercard-L3认证深度解析.md)

---

## 一、TSE 是什么 / 干什么

TSE 是 Mastercard 自有的 **Windows 应用**（从 Mastercard Connect 下载，含配置文件）。作用：让收单机构/VAR **描述终端配置**，据此**裁剪出适用 M-TIP 测试计划**并生成**唯一参考号**。核心铁律：

> 问卷答案**必须与终端的 EMVCo L2 内核能力一致**（Terminal Profile、Reader Capabilities 等）。答案错→测试计划错→认证无效。

---

## 二、完整操作流程

### 步骤 1：创建会话/项目 → 自动生成参考号

- 会话启动时 TSE 自动生成跟踪号，格式 **`MTIP_YYMMDD-hhmmssmmm`**。
  - 例：`MTIP_141015-093406659` = 2014-10-15 09:34:06.659。
- 会话保存为压缩的 **`.tse` 文件**（存于设定的工作目录）——它即贯穿"执行→提交→LoA"的追溯载体。

### 步骤 2：填写问卷（Questions Form）

字段分**必填（黑色字体）** 与 **可选（灰色字体）**，按阶段组织：

| 阶段 | 内容 |
|------|------|
| **Administrative / Acquirer Info** | 收单环境与受测主体的管理信息 |
| **Terminal Model & Approvals** | 终端型号 + 终端批准文件（通常以 **LoA 附件**形式提供 L1/L2 批准证明） |
| **Interface Selection** | 选择本次测试界面：**Contact / Contactless / both** |
| **Terminal Configuration** | 终端配置细节（动态裁剪，见下） |

### 步骤 3：终端配置（动态裁剪逻辑）

TSE 依据 **M/Chip Requirements** **动态预判**问题——不适用的项不会问出来：

> 例：为**接触式 ATM** 配置时，**永远不会问 CVM**——因为规范强制 ATM 仅用 **Online PIN**。

这意味着问卷长度/内容随你前面的选择实时变化，避免无关项。

### 步骤 4：（可选）使用预设配置

TSE 提供**常见美国终端配置预设列表**，可直接选用以加速配置。

### 步骤 5：生成测试计划

- 检查配置后点 **Continue**，TSE **自动生成 Test Plan**。
- 顶部横幅显示：**测试总数** 与 **已通过（Pass）数**。

### 步骤 6：执行 + 登记结果

- 用 M-TIP 测试工具（EMVCo 认证 L3 工具，如 FIME BTT）逐条执行。
- 在 **Test Results 窗口** 登记每条用例结果，并**附上日志文件**。

---

## 三、结果判定层级（Pass Criteria）

TSE 的通过判定是**分层**的：

```
Test Case
└── Pass Criteria
    └── Check（一个或多个）
        └── Step（一个或多个）
            └── 状态：Pass / Fail
```

- 每个 Check 由若干 Step 组成，每个 Step 各自 Pass/Fail。
- 全部满足才算该用例 Pass；横幅的"已通过数"据此累计。

---

## 四、终端配置参数清单（问卷可能涉及）

> 实际是否被问取决于步骤 3 的动态裁剪。

| 类别 | 具体项 |
|------|--------|
| **终端基础** | 终端类型、OS（Android/Linux 等）、内核配置文件（Terminal Profile、Reader Capabilities） |
| **界面** | 接触 / 非接 / 双界面 |
| **CVM** | No CVM、签名、在线 PIN、离线 PIN、**CDCVM**（ATM 等场景被强制裁剪为仅 Online PIN） |
| **非接专项** | **PPSE** 处理、**CDCVM 与非接 CVM 限额**（品牌阈值的免/强制 CVM 执行） |
| **应用/卡品** | 拟支持的全部 **AID** 及应用版本（M/Chip、Maestro、Mastercard 非接等） |
| **密钥** | 全部 **CAPK（CA 公钥）** |
| **交易能力** | 在线/离线能力、交易类型 |
| **地域** | 国家代码、币种 |

> 常见疏漏：**AID 与 CAPK 必须完整声明**——终端现场支持的每个 AID 都要在 TSE 里配齐，否则测试计划与真实行为不符。

---

## 五、M-TIP 2.0 的项目类型

TSE（M-TIP 2.0）支持**一份测试计划认证双界面终端**，三种项目选项：

| 项目类型 | 适用 |
|----------|------|
| **Contact** | 仅接触 |
| **Contactless** | 仅非接（需先有 **VPLA** 非接产品批准函） |
| **Dual interface** | 双界面，单一测试计划覆盖 |

---

## 六、产出与提交

1. TSE 生成：**`.tse` 会话文件** + **唯一 M-TIP 参考号** + **匹配的测试计划**。
2. 执行测试，结果/日志登记进 `.tse`。
3. 将 **`.tse` 文件** 提交给 **Mastercard 认证服务商（FASP）** 验证。
4. 验证通过 → 服务商代表 Mastercard 签发 **M-TIP Letter of Approval（LoA）**。

---

## 七、实操要点

- **参考号即主键**：`MTIP_YYMMDD-...` 在会话创建时就生成,后续全程引用,不要中途另起会话打乱追溯。
- **配置一致性是命门**:问卷答案须严格对齐 L2 内核能力;动态裁剪能减少误填,但 AID/CAPK 这类"要主动加载"的项仍需人工配齐。
- **预设配置省时但要核对**:美国常见配置预设方便,但务必逐项核对是否与实际终端一致。
- **Pass 是逐 Step 累计**:任一 Step Fail 即该用例不通过;登记结果时必须附准确日志,服务商据此验证。
- **双界面优先用 Dual interface 项目**:M-TIP 2.0 下一份计划即可覆盖,省去分别建接触/非接两个项目。

---

**参考来源：**
- [TIP Test Selection Engine User Guide (Feb 2015) — usermanual.wiki](https://usermanual.wiki/Document/TIP20Test20Selection20Engine20User20Guide2020Feb202015.1891829501/help)（本地副本：`web-docs/Mastercard-TIP-Test-Selection-Engine-User-Guide-Feb2015.pdf`）
- [Fime terminal integration tools updated to Mastercard M-TIP 2.0 — Finextra](https://www.finextra.com/pressarticle/59480/fime-terminal-integration-tools-updated-to-mastercard-m-tip-20)
- [FIME Terminal Integration Services aligned to M-TIP 2.0 — FIME](https://www.fime.com/press-documents/fime-terminal-integration-services-tools-updated-to-align-with-mastercard-mtip2.html)
- [MasterCard TSE — ICC Solutions HelpDesk](https://helpdesk.iccsolutions.com/hc/en-us/sections/201599259-MasterCard-TSE)
