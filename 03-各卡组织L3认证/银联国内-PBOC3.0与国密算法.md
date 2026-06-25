# 银联国内：PBOC 3.0 与国密算法

> 深入 [JCB 与银联 L3 认证](./JCB与银联-L3认证深度解析.md) 中"银联国内体系"的技术内核：**PBOC 3.0 规范 + 国密 SM 算法**——这是国内体系区别于国际（UPI/EMV RSA）的根本。

---

## 一、PBOC 标准沿革

| 版本 | 发布 | 要点 |
|------|------|------|
| PBOC 1.0 | 早期 | 电子钱包/电子存折 |
| **PBOC 2.0** | 2005（人行） | 扩展借/贷记应用；初定非接技术路线；对标 EMV 迁移 |
| **PBOC 3.0** | 2013-02（人行） | 在 2.0 基础上**引入国密 SM 算法**、qPBOC 扩展、增强安全机制 |

> PBOC = 《中国金融集成电路（IC）卡规范》，由中国人民银行（PBOC）发布。国内受理银联卡的终端走此体系。

## 二、PBOC 3.0 的核心增强

### 2.1 国密算法支持（Part 17）
- **同时支持**：国密 **SM2 / SM3 / SM4**（及 SM1）与 国际 **RSA / SHA-1 / 3DES**。
- **算法切换**：由 **算法支持指示标签 `DF69`** 控制。
- **切换原则**：终端与卡使用**共同支持**的算法完成交易，**优先使用国密算法**。

| 国密算法 | 对应国际算法 | 用途 |
|----------|--------------|------|
| **SM2** | RSA/ECC | 非对称：证书、数字签名（ODA、发卡行认证） |
| **SM3** | SHA-1/SHA-256 | 哈希：证书校验、MAC |
| **SM4** | 3DES/AES | 对称：数据加密、PIN 加密 |
| SM1 | —（专用） | 对称（早期，需硬件） |

### 2.2 qPBOC 扩展应用（Part 14）
- 增加 **qPBOC 扩展应用**与扩展应用文件，支持金融 IC 卡用于：
- **交通、公交、高速公路收费、停车、铁路（高铁）** 等场景。
- 对应 **QuickPass（闪付）** 非接小额场景。

### 2.3 安全机制增强
- 引入动态验证机制：一次性密码（OTP）、双因子认证等，防欺诈与数据篡改。

## 三、与国际体系的关键差异

| 维度 | 国内（PBOC 3.0） | 国际（UPI / EMV） |
|------|------------------|-------------------|
| 非对称算法 | **SM2**（优先）/ RSA | RSA |
| 哈希 | **SM3** / SHA-1 | SHA-1 |
| 对称/加密 | **SM4** / 3DES | 3DES/AES |
| 算法切换 | **DF69** 指示，优先国密 | 无（纯 RSA 体系） |
| 证书链 | SM2 证书链（见下）或 RSA | RSA 证书链（见 [ODA 证书链](../01-基础概念/ODA证书链字节级.md)） |

> 即同一张 PBOC 3.0 卡可能持有**两套证书/密钥**（国密 + 国际），终端按 DF69 与自身能力协商，**优先国密**。

## 四、SM2 证书链（国密 ODA）

国密 ODA 与 RSA 版结构对应，但用 SM2/SM3：
```
CA SM2 公钥（终端内）
 └─SM2 验签→ 发卡行公钥证书（Tag 90，SM2）
              └─SM2 验签→ IC 卡公钥证书（Tag 9F46，SM2）
                           └─用于→ 动态签名（SM2 + SM3 哈希）
```
- 恢复/验签用 **SM2**，哈希用 **SM3**，替代 RSA + SHA-1。
- 标签沿用 EMV（90/9F32/9F46/9F47/92/9F48 等），但密钥算法为 SM2。

## 五、认证机构与流程

- **监管**：中国人民银行（PBOC）。
- **检测认证**：**China UnionPay（CUP）** / **BCTC（银行卡检测中心 / 国家金融科技测评中心，Beijing UnionPay Card Technology）**。
- **BCTC 资质**：经 PBOC、EMVCo、UnionPay、Mastercard 认可，亦为 **PCI 认可实验室**。
- **检测范围**：PBOC 3.0 借/贷记、非接、qPBOC 双币小额应用——支持 SM2/SM3/SM4 + RSA/SHA1/DES。
- **门户**：cert.unionpay.com（国内认证门户）。

---

## 六、实操与测试要点

- **国密是国内体系硬性差异**：面向中国大陆受理的终端必须支持 SM2/SM3/SM4,并正确实现 **DF69 算法协商（优先国密）**。
- **双算法卡的协商**:PBOC 3.0 卡常同时支持国密与国际算法;测试需覆盖"国密优先"与"回退 RSA"两条路径。
- **qPBOC = 国内闪付内核**:对应交通/小额场景,与国际 QuickPass 同源但走 PBOC 规范。
- **认证走 CUP/BCTC**:不同于国际 UPI 体系;面向国内市场必须经此检测。
- **SM 算法需硬件/HSM 支持**:终端与后台 HSM 都要具备国密能力,否则无法完成 SM2 验签/SM4 加密。

---

**参考来源：**
- [中国金融集成电路（IC）卡规范 PBOC 3.0 简介 — CSDN](https://blog.csdn.net/supergame111/article/details/33730809)
- [PBOC3.0 与 PBOC2.0 标准规范异同分析 — CSDN](https://blog.csdn.net/wangshfa/article/details/9113413)
- [PBOC3.0 SM2 算法各种证书、数字签名的验证 — CSDN](https://blog.csdn.net/wenyangwangw/article/details/50320737)
- [PBOC-恢复发卡行公钥证书 [Tag90] SM2 — CSDN](https://blog.csdn.net/wenyangwangw/article/details/49637177)
- [国密算法体系：SM2/SM3/SM4/SM9 全景解读](https://quant67.com/post/cryptography/47-gm-algorithms/gm-algorithms.html)
- [BCTC / 国家金融科技测评中心](https://en.bctest.com/)
- [认证门户 — 中国银联](https://cert.unionpay.com/cert-portal/authenticate/empower/index.html)
