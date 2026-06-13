# web-docs — 来源清单 / 恢复清单（SOURCES）

> 本目录存放"从 web 拉取的原始 PDF"。PDF 体积大/含第三方版权,**经 `.gitignore` 排除不入库**(仅本清单 `SOURCES.md` 跟踪进 git)。
> 已于 **2026-06-13** 按下表 URL 重新下载,**6 份中 5 份已物理恢复**;Worldpay PRODUCTION 因来源 SSL 证书链异常(自签名)未拉取,保留 URL 待手动获取。

> ⚠️ 部分细节源自较早版本文档(如 TIP TSE 2015、ADVT v6.1.1、CDET v2.3)。**精确用例编号、限额、版本号以各卡组织门户最新版为准。**

---

## 一、原 web-docs PDF 清单（恢复用)

| 状态 | 文件名 | 文档 | 公开来源 URL | 引用于 |
|------|--------|------|--------------|--------|
| ✅ | `emv-chip-terminal-testing-feb2019.pdf` | Visa U.S. EMV Chip Terminal Testing Requirements v2.1 | https://usa.visa.com/dam/VCOM/regional/na/us/run-your-business/documents/emv-chip-terminal-testing-feb2019.pdf | [Visa Global L3 Test Set 与 qVSDC-DM](../Visa-Global-L3-Test-Set与qVSDC-DM.md) |
| ✅ | `Mastercard-TIP-Test-Selection-Engine-User-Guide-Feb2015.pdf` | TIP Test Selection Engine User Guide (Feb 2015) | https://usermanual.wiki/Document/TIP20Test20Selection20Engine20User20Guide2020Feb202015.1891829501.pdf | [M-TIP TSE 配置详解](../M-TIP-TSE配置详解.md)、[M-TIP TSE 问卷与终端配置参数](../M-TIP-TSE问卷与终端配置参数.md) |
| ✅ | `Worldpay-EMV-Network-Keys-TEST.pdf`（图片型） | EMV Network Keys: Test — Worldpay | https://docs.worldpay.com/assets/pdf/EMVNetworkKeysTest.pdf | [AID 与 CAPK 全卡组织参考表](../AID与CAPK全卡组织参考表.md) |
| ❌ 待取 | `Worldpay-EMV-Network-Keys-PRODUCTION.pdf`（图片型） | EMV Network Keys: Production — Worldpay | https://docs.worldpay.com/assets/pdf/emvnetworkkeys1.pdf（SSL 证书链自签名,curl 拒绝;需手动下载) | [AID 与 CAPK 全卡组织参考表](../AID与CAPK全卡组织参考表.md) |
| ✅ | `US-Payments-Forum-Contactless-Limits-2020.pdf` | Contactless Limits and EMV Transaction Processing (Oct 2020) | https://www.uspaymentsforum.org/wp-content/uploads/2020/10/Contactless-Limits-WP-FINAL-October-2020.pdf | [接触与非接 CVM 详解](../接触与非接CVM详解.md)、[Mastercard 非接 CVM 机制与 FFI](../Mastercard非接CVM机制与FFI.md) |
| ✅ | `US-Payments-Forum-Host-and-L3-Requirements-2023.pdf` | Payment Network Host and Level 3 Requirements (Final 2023-09-29) | https://www.uspaymentsforum.org/wp-content/uploads/2024/04/Payment-Network-Host-and-Level-3-Requirements-Final-09292023.pdf | [Amex 与 Discover L3 认证深度解析](../Amex与Discover-L3认证深度解析.md) |

> 注:Worldpay 两份为**图片型 PDF**,本机无 PDF 文本提取工具(pdftotext / mutool / python-pdf 均缺),内容靠人工/HTML 旁证;相关 CAPK 索引仅作"业界常用"参考,实际配置以官方测试密钥文件为准。

## 二、权威规范门户（核对最新编号）

- **EMVCo**:https://www.emvco.com/ —— Contactless Book A–D、Kernel 1–7(见 [EMV Contactless Kernel Deep Dive](../emv-contactless-kernel-deep-dive.md));EMV ICC Book 1–4(TVR/TAC/IAC、ODA、ARQC/ARPC 框架,见 [ARQC/ARPC 联机授权](../ARQC-ARPC联机授权.md))
- 各卡组织 L3 门户:Visa Technology Partner、Mastercard Connect、Amex Global Network、Discover Global Network、JCB International、UnionPay International
- **银联国内**:中国银联 / BCTC(国密 SM2/SM3/SM4、PBOC 3.0),见 [银联国内：PBOC 3.0 与国密算法](../银联国内-PBOC3.0与国密算法.md)
- **FIME**:https://www.fime.com/ —— BTT / ASTREX 等(见 [FIME L3 测试工具深度解析](../FIME-L3测试工具深度解析.md))
- **ISO 8583**:报文标准(见 [ISO 8583 与 Field 55 报文层](../ISO8583与Field55报文层.md))

---

> 如需物理恢复:从上表 URL 重新下载,以"原文件名"列存入本目录,并补记下载日期即可。
