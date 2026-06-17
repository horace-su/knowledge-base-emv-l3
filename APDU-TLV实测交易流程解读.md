# APDU / TLV 实测交易流程解读（字节级走读）

> 把分散在各篇里的字节级知识，落到**一笔完整非接交易的 APDU 命令/响应序列**上逐条走读：每个 C-APDU（命令）、R-APDU（响应）、关键 TLV 的字节含义，以及它们最终如何汇成 [DE55](./ISO8583-DE55-逐标签实现清单.md) 上送发卡行。承接 [EMVCo Kernel 2 V2.11 规范要点](./EMVCo-Kernel2-V2.11规范要点.md)、[非接内核深潜](./emv-contactless-kernel-deep-dive.md)、[ODA 证书链字节级](./ODA证书链字节级.md)、[TAC/IAC/TVR 决策逻辑](./TAC-IAC-TVR决策逻辑.md)。
>
> ⚠️ **本文 APDU 字节为依据 EMV Book 1/3 + Book C-2 构造的代表性「合成」示例**，用于讲解结构与解析方法，**非某次真实抓包的原始数据**（PAN/密文/证书等均为占位）。真实抓包请用 Card Spy / SmartSpy+（见 [FIME-BTT](./FIME-BTT-品牌测试工具深度解析.md)）对照本文方法解读。

---

## 〇、APDU 基础：怎么读一行命令/响应

**命令 C-APDU**：`CLA INS P1 P2 [Lc Data] [Le]`

| 字段 | 含义 |
|------|------|
| CLA | 命令类 (`00`=ISO, `80`=专有) |
| INS | 指令 (`A4`=SELECT, `B2`=READ RECORD, `A8`=GET PROCESSING OPTIONS, `AE`=GENERATE AC) |
| P1 P2 | 参数 |
| Lc | 后续 Data 字节数 |
| Le | 期望响应数据长度（`00`=最多 256） |

**响应 R-APDU**：`[Data] SW1 SW2`，其中 `90 00`=成功，`61 XX`=还有 XX 字节可取（GET RESPONSE），`6A 83`=记录不存在等。

**TLV** 解析规则见 [DE55 逐标签清单 §一](./ISO8583-DE55-逐标签实现清单.md#一de55-在报文里的物理结构)。

---

## 一、第 1 步：SELECT PPSE（建立候选应用列表）

非接交易先选 **PPSE = `2PAY.SYS.DDF01`**（接触为 `1PAY.SYS.DDF01`）。

**C-APDU**
```
00 A4 04 00 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 00
└┬┘└┬┘ └┬──┘ └┬┘ └────────────── "2PAY.SYS.DDF01" ──────────┘ └Le
CLA INS P1 P2  Lc=0E(14)        ASCII of 2PAY.SYS.DDF01
```
- `P1=04`：按 DF name 选择；`P2=00`：首个或唯一匹配。

**R-APDU**（FCI，含候选 AID 与 kernel 指示）
```
6F xx                          FCI Template
  84 0E 325041592E5359532E4444463031   DF Name = 2PAY.SYS.DDF01
  A5 xx                        FCI Proprietary Template
    BF0C xx                    FCI Issuer Discretionary Data
      61 xx                    Directory Entry (每个候选应用一个)
        4F 07 A0000000041010   ADF Name (AID) = Mastercard
        87 01 01               Application Priority Indicator
        9F2A 01 02             Kernel Identifier = 02 (K2=Mastercard)
90 00
```
- `4F` = 候选 AID；`9F2A` Kernel Identifier 决定走哪个内核（`02`=K2 MC、`03`=K3 Visa、`06`=K6 Discover——见 [各卡组织 L3 要求](./各卡组织L3认证测试要求一览.md)）。
- 终端按 `87` 优先级 + 自身支持列表做**最终选择**。

---

## 二、第 2 步：SELECT AID（选中具体应用）

**C-APDU**
```
00 A4 04 00 07 A0 00 00 00 04 10 10 00
              Lc=07 └── AID = A0000000041010 (MC credit/debit) ──┘
```

**R-APDU**（FCI，关键是 **PDOL**）
```
6F xx
  84 07 A0000000041010          DF Name
  A5 xx
    50 0A 4D6173746572436172 64  Application Label = "MasterCard"
    9F38 xx                       PDOL — 卡片要终端在 GPO 时回传的数据清单
      9F66 04   TTQ?（Visa 用；MC 用 9F66 不同）
      9F02 06   Amount Authorised
      9F03 06   Amount Other
      9F1A 02   Terminal Country Code
      95   05   TVR
      5F2A 02   Transaction Currency Code
      9A   03   Transaction Date
      9C   01   Transaction Type
      9F37 04   Unpredictable Number
90 00
```
- **PDOL (`9F38`)** 是一串 `Tag+Length` 对（无值），告诉终端："GPO 命令里请按这个顺序、这些长度把值给我"。这是终端环境数据进卡的入口。

---

## 三、第 3 步：GET PROCESSING OPTIONS（GPO，核心一步）

终端按 PDOL 把环境值打包进 **`83`** 模板送入卡。

**C-APDU**
```
80 A8 00 00 23 83 21 <按 PDOL 顺序拼接的值...> 00
└┬┘└┬┘       Lc   └┬┘└┬┘
80=专有 A8=GPO    83  21=33字节PDOL数据
```
PDOL 数据示例拼接（对应上面的 PDOL 清单）：
```
9F66值(4) 9F02=000000001000 9F03=000000000000 9F1A=0344
95=0000000000 5F2A=0344 9A=260617 9C=00 9F37=A1B2C3D4
       └金额$10.00┘                   └币种344┘└日期260617┘ └UN┘
```

**R-APDU**（Kernel 2 用 **Format 2 `77`** 模板返回 AIP + AFL + 应答数据）
```
77 xx                          Response Message Template Format 2
  82 02 19 80                  AIP = 1980 → 支持 CDA/DDA/持卡人验证
  94 08 08010100 10010301      AFL — 指明随后 READ RECORD 读哪些 SFI/记录
  ...（Kernel 2 也可在此直接返回部分快速路径数据）
90 00
```
- **AIP `82`** 逐位见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md) 与 [ODA 证书链](./ODA证书链字节级.md)：bit 表 SDA/DDA/CDA/CVM/发卡行认证支持。
- **AFL `94`**：每 4 字节一组 = `SFI(5bit)<<3 | 首记录号 | 末记录号 | 参与离线认证的记录数`。

---

## 四、第 4 步：READ RECORD（按 AFL 取记录）

对 AFL 里每条记录发一次 READ RECORD。

**C-APDU**（读 SFI=1 的记录 1）
```
00 B2 01 0C 00
      └┬┘└┬┘
      P1  P2: 高5位=SFI(01)，低3位=100b → 按记录号读
      记录号=1
```
- `P2 = (SFI << 3) | 0b100`：`01<<3 = 08`，`| 04 = 0C`。

**R-APDU**（`70` 模板，含证书链与卡数据）
```
70 xx
  5A 08 1234567890123456    Application PAN (占位)
  5F34 01 00                PAN Sequence Number
  5F24 03 281231            App Expiration Date
  8C xx <CDOL1>             Card Risk Mgmt DOL 1 (供 GENERATE AC)
  8D xx <CDOL2>             CDOL2
  9F46 xx <ICC PK Cert>     ── 证书链，逐字节解析见 ODA 文档 ──
  9F47 01 03                ICC PK Exponent
  9F48 xx <ICC PK Remainder>
  90 xx <Issuer PK Cert>
  8F 01 05                  CA Public Key Index → 定位 CAPK
90 00
```
- `8F` CA Public Key Index → 在终端 [AID 与 CAPK](./终端配置-AID与CAPK.md) 表里定位 CAPK；`90`/`9F46` 等证书逐字节恢复见 [ODA 证书链字节级](./ODA证书链字节级.md)。
- `8C` **CDOL1** 与 PDOL 同理，是 GENERATE AC 命令的数据清单。

---

## 五、第 5 步：GENERATE AC（产出密文，决定联机/离线）

终端完成 TVR 评估（见 [TAC/IAC/TVR](./TAC-IAC-TVR决策逻辑.md)）后，按 CDOL1 拼数据请求密文。

**C-APDU**
```
80 AE 80 00 2B <CDOL1 数据...> 00
      └┬┘
      P1: 80=ARQC(请求联机), 40=TC(离线批准), 00=AAC(拒绝)
          位7=1 表示请求 CDA 签名
```

**R-APDU**（`77` 模板，密文 + IAD）
```
77 xx
  9F27 01 80              CID = 80 → 卡返回 ARQC（同意联机）
  9F36 02 0015           ATC = 21
  9F26 08 A1B2C3D4E5F60718  Application Cryptogram (ARQC, 占位)
  9F10 12 0110A00003220000...  Issuer Application Data (含 CVN/CVR/计数器)
  9F4B xx <SDAD>          Signed Dynamic App Data（CDA 时存在）
90 00
```
- `9F27=80` → ARQC，需联机；`=40`→TC 离线批准；`=00`→AAC 拒绝。
- `9F26` ARQC 是发卡行验证的核心；`9F10` IAD 携带发卡行私有风控（CVN 指明密文版本/算法）。

---

## 六、汇成 DE55 上送（终端 → 收单 → 发卡行）

终端把上面产出的标签按收单接口要求打包进 **DE55**（逐标签见 [DE55 逐标签清单](./ISO8583-DE55-逐标签实现清单.md)）：

```
DE55 = 9F26(ARQC) 9F27(CID) 9F10(IAD) 9F37(UN) 9F36(ATC)
       95(TVR) 9F1A 5F2A 9F02 9C 9A 82 84 9F34 9F33 9F35 ...
```
发卡行验 ARQC → 回 **ARPC**（在响应 DE55 的 `91` Issuer Authentication Data）→ 终端发**第二次 GENERATE AC**（带 `91` + 可选脚本 `71/72`）取最终 TC。

---

## 七、解读速查：常见 SW1SW2 与异常

| SW1SW2 | 含义 | 交易影响 |
|--------|------|----------|
| `90 00` | 成功 | 继续 |
| `61 XX` | 还有 XX 字节 | 发 GET RESPONSE `00 C0 00 00 XX` |
| `6A 83` | 记录不存在 | AFL 配置错/卡数据缺 |
| `6A 81` | 功能不支持 | 选错应用/命令 |
| `69 85` | 条件不满足 | GPO 前置状态错 |
| `6985`(GAC) | 卡拒绝出密文 | 走拒绝/再选 |

> 抓包时优先核对：(1) PPSE 返回的 `9F2A` 是否选对内核；(2) GPO 的 PDOL 拼接顺序/长度是否与 `9F38` 完全一致（最常见 bug）；(3) `82` AIP 与 `95` TVR 是否自洽；(4) 最终 DE55 标签是否齐全、定长标签长度对。
