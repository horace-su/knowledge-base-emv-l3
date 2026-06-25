# FIME BTT `.tpp` 项目文件格式与各卡组织 L3 测试计划

> 解剖 FIME Brand Test Tool 的项目文件（`.tpp`）结构，并据实测项目整理各卡组织 **真实 L3 测试计划名称、版本与用例编号体系**。承接 [FIME-BTT 品牌测试工具深度解析](./FIME-BTT-品牌测试工具深度解析.md)、[各卡组织 L3 认证测试要求一览](../03-各卡组织L3认证/各卡组织L3认证测试要求一览.md)，并与 [L3 认证实例：Sunmi T6F10](../07-实测案例/L3认证实例-Sunmi-T6F10终端配置剖析.md) 为同一终端的不同侧面。
>
> 数据来源：BTT **5.8.0**、Card Simulator **20251119** 导出的 `.tpp` 工程包。**仅收录测试计划与用例编号等通用技术信息；项目命名中的会话 ID、收单机构标识、卡号、联系人等敏感数据一律不纳入。**

---

## 一、`.tpp` 是什么

`.tpp`（Test Project Package）是 BTT 的**工程包**，本质是一个 **ZIP 归档**，可直接用 `unzip` 解开。典型条目：

| 条目 | 作用 |
|------|------|
| `ProjectInfo.json` | 工程元数据：名称、`createdBy`（BTT 版本）、`cardSimulatorVersion`、`applicableTestPlans`（品牌 + 测试计划名/版本 + 选中的用例清单） |
| `BttFiles/*.profile.xml` | 终端配置 **Profile**（Project Settings + 子 Profile）；大 Profile 内含 `tpl_configuration`，即**每条用例 → 卡片镜像模拟器步骤 XML** 的映射 |
| `*.tsez` | EMVCo/TSE 会话导出（与 [M-TIP TSE](../05-mastercard专题/M-TIP-TSE配置详解.md) 同源格式） |
| `BttFiles/BttTestResults.zip` | 实跑测试结果 |
| `projectFiles.zip` | 打包的测试计划/卡片镜像文件 |
| `Manifest.json` | 文件清单 + 各文件 **SHA-256 签名**（`packageFileVersion: 3`） |

> 关键机制：Profile 把抽象用例绑定到具体**卡片镜像模拟器脚本**。例如 Amex `AXP CT-EMV001 → Contact Chip:L3_AEIPS_01_EP_01_v1.0.2.xml`，多步用例以 `;` 串接（如 `CT-EMV016` 用两次 `L3_AEIPS_02_EP_02`）。同一卡片镜像可被多条用例复用——这就是 BTT「卡模拟器驱动」工作方式（见 [FIME-BTT §五](./FIME-BTT-品牌测试工具深度解析.md)）的落地形态。
>
> 注：若工程由 Self-test Platform(STP) 导入，Profile 中 `imported_from_stp=true`，**本地不可改配置**，须回 STP 改测试会话后重新下载 `.tpp`。

---

## 二、各卡组织真实 L3 测试计划（BTT 5.8.0）

| 卡组织 | 测试计划名 | 版本 | 用例编号体系 |
|--------|-----------|------|--------------|
| American Express | `Global-Contact-Contactless-V1.0` | series 08 build 027 | `AXP CT-EMV###`(接触) / `AXP CT-STP###`(STP) / `AXP CTL-EP###`(非接 Expresspay) |
| Discover | `Discover-DPAS-L3` | series 1 build 210 | `DGN_DPAS_L3_CT_###`(接触) / `DGN_DPAS_L3_CL_###`(非接) |
| Mastercard | `EMVCo L3 - Mastercard M-TIP` | series 0 build 300 | `M-TIP##.Test.##.Scenario.##` / `MCD##.…`(M/Chip) / `MCM##.…`(Magstripe) / `COM##.…`(通用) |
| VISA | `VisaL3Testing` | series 01 build 021/022 | `VISA.TC.0###`(基础) / `VISA.TC.1###a`(扩展) |

> 计划名印证本库的程序映射：Amex = **AEIPS(接触)+Expresspay(非接)**，Discover = **D-PAS L3**，Mastercard = **M-TIP**（EMVCo L3 框架下），Visa = **VisaL3Testing**（即 2022 后的 [Visa Global L3 Test Set](../04-visa专题/Visa-Global-L3-Test-Set与qVSDC-DM.md)，已取代 ADVT/CDET）。

---

## 三、各计划用例细分（实测选取范围）

### American Express — Global-Contact-Contactless-V1.0（28 条选取）
- **接触 EMV** `AXP CT-EMV`：001/004/005/006/007/009/010/011/012/013/016/017/020/021/022/023/031（17 条）
- **STP**（Stand-in / 主机回退）`AXP CT-STP`：001/002/003（3 条）
- **非接 Expresspay** `AXP CTL-EP`：002/003/005/007/016/024/025/026（8 条）
- 卡片镜像走 `L3_AEIPS_*` 与 `L3_EP_*`（含 `L3_EP_MOBILE_*` 移动场景）脚本。

### Discover — Discover-DPAS-L3（33 条选取）
- **接触** `DGN_DPAS_L3_CT_`：001/003/004/005/006/007/008/009/010/012/014/015/020/021/035/093/094/095（18 条）
- **非接** `DGN_DPAS_L3_CL_`：001/003/005/007/009/010/014/015/016/020/021/080/089/092/104（15 条）

### Mastercard — EMVCo L3 - Mastercard M-TIP（38 条选取）
- **M-TIP 用例族** `M-TIP##.Test.##.Scenario.##`：覆盖 02/04/06/08/14/15/32/33/34/50/51/65 等测试号
- **M/Chip** `MCD##`（如 MCD01/02/04/06/12/19/50/65/91/93/94）、`MCM02`（Magstripe）
- **通用** `COM01/02/05`
- 编号体系与 [M-TIP TSE](../05-mastercard专题/M-TIP-TSE配置详解.md) 的「Test/Scenario」分层一致。

### VISA — VisaL3Testing（build 021=49 条 / build 022=42 条选取）
- **基础** `VISA.TC.00##`：0001–0030 区间按需选取
- **扩展** `VISA.TC.1###a`：1002a–1049a 区间（带 `a` 后缀的变体用例）
- 两个 build 的差异主要在基础用例覆盖（27 vs 25）与个别扩展用例增减——体现测试计划随 build 演进的微调。

---

## 四、要点

- **同一终端 = 多个 `.tpp`**：每条卡组织 L3 程序独立成包，与 [实例报告](../07-实测案例/L3认证实例-Sunmi-T6F10终端配置剖析.md) 中「一台设备分别提交三大组织」对应。
- **用例选取是动态的**：同一计划在不同会话中选中的用例数会变（如两份 Visa 工程 42 vs 49），由 STP/问卷裁剪决定（见 [M-TIP TSE 动态裁剪](../05-mastercard专题/M-TIP-TSE配置详解.md)），印证本库「用例数随配置裁剪」的说法。
- **结果与签名**：`BttTestResults.zip` 含实跑结果，`Manifest.json` 以 SHA-256 为每个打包文件签名，保证工程包完整性。
- 本页编号为**实测某次工程的选取快照**，并非各计划的完整用例全集；权威全集以 FIME BTT 内置测试计划与各卡组织门户为准。
