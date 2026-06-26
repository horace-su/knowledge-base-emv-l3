# 在线报文与 TLV 解析工具速查（ISO 8583 / EMV BER-TLV / 单标签解码 / 密文计算）

> 调试 L3 报文层时，逐字节手算 [DE55 的 BER-TLV](./ISO8583-DE55-逐标签实现清单.md)、拆 [ISO 8583 外层域（DE22 等）](./ISO8583-报文域全景与POS录入方式.md)、核 [TVR/TTQ/CTQ 位](../04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示.md)既慢又易错。本文整合一批**公开在线/离线解析与计算工具**，按用途分类，配合 [APDU/TLV 实测交易流程解读](./APDU-TLV实测交易流程解读.md) 的字节级走读一起用。
>
> ⚠️ **安全红线（务必先读 §五）**：这些是第三方工具，**不要把真实持卡人 PAN / 完整磁道 / 在线 PIN 块 / 真实 ARQC 等 PII 与敏感密文粘贴到联网服务**。优先用**纯客户端**（浏览器本地计算、不回传）或**离线桌面**工具；测试数据用卡组织测试 BIN/测试卡。本库 [`web-docs/SOURCES.md`](../web-docs/SOURCES.md) 的 PII 提示同样适用。

---

## 一、EMV BER-TLV 解析器（拆 DE55 / 卡片应答）

把一长串 TLV 十六进制（如 GPO/READ RECORD 应答、DE55 内容）拆成「Tag → 长度 → 值 → 含义」。

| 工具 | 地址 | 特点 |
|------|------|------|
| **EMV Decoder — TLV Parser** | https://www.emvdecoder.com/tools/emv-tlv/tlv-parser | 自述**纯客户端本地计算、数据不回传**；逐标签解释，相对最适合贴敏感数据（仍建议用测试数据） |
| **Payment Card Tools — EMV TLV Parser** | https://paymentcardtools.com/emv-tlv-parser | 解析 + 大量单标签深解码（见 §三）；工程师向、覆盖最全 |
| **EMVLab — TLV Utils / EMV Tags** | https://www.emvlab.org/tlvutils/ ・ https://www.emvlab.org/emvtags/ | 老牌；TLV 拆解 + 完整 EMV Tag 字典（本库标签链接多指向此） |
| **goto327 — EMV TLV 解析** | http://i.goto327.top:85/EMV/ParseTlv.aspx | 中文界面，国内常用；⚠️ **HTTP 明文 + 非标端口 85**，仅用测试数据 |
| **giraffai — EMV Tag Decoder** | https://www.giraffai.com/tools/emv-tag-decoder | TLV 拆解 + 标签释义 |

---

## 二、ISO 8583 外层报文解析器（拆 MTI / Bitmap / DE）

把整条 8583 报文（含 MTI、主/辅位图、各 DE）拆开，定位 DE22、DE35/45、DE55 等。

| 工具 | 地址 | 特点 |
|------|------|------|
| **goto327 — 8583 报文解析** | http://i.goto327.top:85/POSServer/Parse8583.aspx | 中文；按位图列出各 DE；国内收单调试常用；⚠️ **HTTP + 端口 85**，仅测试数据 |
| **neaPay — Online ISO 8583 / EMV 工具集** | https://neapay.com/online-tools/index.html | 8583 报文解析 + EMV 标签等综合工具集 |
| **EMV Decoder — POS Data Decoder** | https://www.emvdecoder.com/tools/field-decoders/pos-data | 解码 POS Data（含 DE22/DE61 类受理环境域）；支持 ISO 8583 / EMV / 私有格式；纯客户端 |

> 8583 解析常需先知道你对接主机的**域格式（定长/LLVAR/LLLVAR）与私有域（DE48/DE62…）布局**——通用解析器对私有域只能给原始字节，精确语义仍以收单主机报文规范为准（见 [DE55 跨卡组织要求](./ISO8583-字段55-跨卡组织要求.md)）。

---

## 三、单字段 / 单标签位级解码器（DE22、TVR、TTQ、CTQ、AIP…）

不想拆整条报文，只想把某个位图字段的几个字节翻成「哪几个 bit 置位、什么含义」时最快。

| 字段 / 标签 | 工具 | 地址 |
|------|------|------|
| **DE22 POS Entry Mode** | EMV Decoder | https://www.emvdecoder.com/tools/field-decoders/pos-entry-mode |
| **TVR `95` / TSI `9B`** | Payment Card Tools | https://paymentcardtools.com/ （站内 Tag 95 / 9B 解码器） |
| **AIP `82` / AUC `9F07`** | Payment Card Tools | 同上（Tag 82 / 9F07） |
| **TermCap `9F33` / Add'l TermCap `9F40`** | Payment Card Tools | 同上（Tag 9F33 / 9F40） |
| **CVM List `8E` / CVM Results `9F34`** | Payment Card Tools | 同上（Tag 8E / 9F34） |
| **TTQ `9F66` / CTQ `9F6C` / Form Factor `9F6E`** | Payment Card Tools | 同上；配合本库 [Visa TTQ/CTQ 与 CDCVM 指示](../04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示.md) |
| **IAD `9F10`** | Payment Card Tools | 同上（Tag 9F10，发卡行应用数据，含 CVN） |

> 这些位级含义本库已在多处讲解：DE22 见 [报文域全景 §三](./ISO8583-报文域全景与POS录入方式.md)、TVR/IAC/TAC 见 [TAC-IAC-TVR 决策逻辑](../01-基础概念/TAC-IAC-TVR决策逻辑.md)、9F33/9F40 见 [DE55 逐标签实现清单](./ISO8583-DE55-逐标签实现清单.md)。工具用于**快速复核**，语义理解仍以正文为准。

---

## 四、密文 / 密钥计算器（ARQC、MAC、UDK、Key Block）

复核发卡行模拟器（[emvsim](../01-基础概念/EMVCo-L3测试框架与标准化文件格式.md)）的 ARQC 校验 / ARPC 生成、或离线核对密文时用。**强烈建议离线/客户端，绝不贴真实密钥。**

| 工具 | 地址 | 能力 |
|------|------|------|
| **Payment Card Tools** | https://paymentcardtools.com/ | ARQC 计算（CVN 10 / 18 / 22）、MAC、UDK、DOL 解码、Key Block 解码、Hex↔ASCII、Julian 日期、测试卡生成 |
| **EFTLab BP-Tools（Cryptographic Calculator，离线桌面）** | https://www.eftlab.com/ （工具下载） | 离线 EMV/HSM 密码学计算（ARQC/ARPC/MAC/key block 等），适合敏感数据 |

---

## 五、安全与使用须知

1. **PII / 密钥不上联网工具**：真实 PAN、完整 Track1/2、在线 PIN 块、真实交易密文、生产密钥一律不得粘贴到第三方网站。用**卡组织测试 BIN/测试卡**数据。
2. **优先客户端 / 离线**：EMV Decoder 自述纯客户端本地计算；EFTLab BP-Tools 为离线桌面工具——处理任何接近真实的数据时优先这两类。
3. **`goto327` 工具是 HTTP 明文 + 非标端口 85**：链路不加密，仅可用于无敏感性的测试样例；勿在受限网络/含 PII 场景使用。
4. **工具只是辅助**：精确码集、私有域语义、必选/可选随交易路径变化等，**最终以你对接的卡组织/收单主机报文规范最新版为准**；本库正文给框架与方法，工具用于加速复核。
5. **链接可能漂移**：外部站点改版后路径可能失效；按工具名在站内或搜索引擎再定位即可。

---

## 参考资料

- [EMV Decoder — TLV Parser / Field Decoders](https://www.emvdecoder.com/tools/emv-tlv/tlv-parser)
- [Payment Card Tools — EMV TLV Parser 及标签解码器/计算器集](https://paymentcardtools.com/emv-tlv-parser)
- [EMVLab — EMV Tags / TLV Utils](https://www.emvlab.org/emvtags/)
- [neaPay — Online ISO 8583 & EMV Tools](https://neapay.com/online-tools/index.html)
- [EFTLab — Cryptographic Calculator (BP-Tools) EMV 菜单说明](https://www.eftlab.com/tutorials/cryptographic-calculator-emv-menu)
- goto327 在线工具（中文，HTTP）：[EMV TLV 解析](http://i.goto327.top:85/EMV/ParseTlv.aspx) ・ [8583 报文解析](http://i.goto327.top:85/POSServer/Parse8583.aspx)
