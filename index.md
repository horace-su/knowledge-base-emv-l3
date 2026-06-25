---
layout: home

hero:
  name: EMV L3 知识库
  text: 终端集成与认证的字节级实战手册
  tagline: 覆盖 FIME 测试工具与 Visa / Mastercard / Amex / Discover / JCB / 银联 六大卡组织的 L3 认证程序、测试用例与配置细节 —— 从 AID/CAPK、TLV、CVM 到 ISO 8583 报文与真实抓包。
  image:
    src: /logo.svg
    alt: EMV L3
  actions:
    - theme: brand
      text: 开始阅读 →
      link: /01-基础概念/emv-contactless-kernel-deep-dive
    - theme: alt
      text: 各卡组织认证一览
      link: /03-各卡组织L3认证/各卡组织L3认证测试要求一览
    - theme: alt
      text: GitHub
      link: https://github.com/horace-su/knowledge-base-emv-l3

features:
  - icon: 🧩
    title: 基础概念
    details: 非接内核（K2/K3/K6…）、CVM List(8E) / TVR(95)、AID/CAPK、ODA 证书链(90/9F46)、TAC/IAC 决策逻辑 —— 把 L1→L2→L3 的链路讲透。
    link: /01-基础概念/emv-contactless-kernel-deep-dive
    linkText: 进入基础概念
  - icon: 🛠️
    title: FIME 测试工具
    details: 旗舰 L3 产品 BTT 的能力矩阵、卡组织覆盖、.tpp 工程包结构，以及 Amex/Discover/Mastercard/Visa 真实测试计划的版本与用例编号体系。
    link: /02-fime测试工具/FIME-L3测试工具深度解析
    linkText: 了解 FIME 工具链
  - icon: 🏦
    title: 六大卡组织 L3 认证
    details: Visa Global L3 Test Set、Mastercard M-TIP、Amex AEIPS/Expresspay、Discover D-PAS、JCB TCI、银联国内(国密)+国际 QuickPass 全覆盖。
    link: /03-各卡组织L3认证/各卡组织L3认证测试要求一览
    linkText: 查看认证要求总表
  - icon: 💳
    title: Visa 专题
    details: 取代 ADVT/CDET 的 Global L3 Test Set、CDET 17 个非接用例细分、TTQ(9F66)/CTQ(9F6C) 位级解析与 Apple Pay/Google Pay 的 CDCVM 指示。
    link: /04-visa专题/Visa-Global-L3-Test-Set与qVSDC-DM
    linkText: 进入 Visa 专题
  - icon: 🔴
    title: Mastercard 专题
    details: M-TIP TSE 操作流程与问卷动态裁剪、问卷字段→EMV 对象映射(9F35/9F33/9F40)、Kernel 2 四大限额与 FFI(9F6E) 品牌差异。
    link: /05-mastercard专题/M-TIP-TSE配置详解
    linkText: 进入 Mastercard 专题
  - icon: 📡
    title: 报文层（主机侧）
    details: ISO 8583 报文域全景 + DE22 录入方式 / 技术回退、DE55 逐标签字节级实现清单、APDU/TLV 实测走读，以及主机认证与 L3 重测触发矩阵。
    link: /06-报文层/ISO8583-报文域全景与POS录入方式
    linkText: 进入报文层
---

<div class="emv-quickref">

## 卡组织 L3 认证 · 速记总表

<p class="sub">一眼看清六大卡组织的认证程序、接触/非接范畴与提交产出</p>

<div class="emv-cards">
  <div class="emv-card">
    <div class="scheme">Visa</div>
    <div class="prog">Global L3 Test Set</div>
    <div class="tags"><span class="tag">ADVT 范畴</span><span class="tag">CDET 范畴</span><span class="tag">+qVSDC DM</span><span class="tag">CCRT 上报</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">Mastercard</div>
    <div class="prog">M-TIP</div>
    <div class="tags"><span class="tag">接触</span><span class="tag">非接(需 VPLA)</span><span class="tag">TSE 文件</span><span class="tag">LoA</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">Amex</div>
    <div class="prog">AEIPS + Expresspay</div>
    <div class="tags"><span class="tag">AEIPS 接触</span><span class="tag">Expresspay 非接</span><span class="tag">代表评审</span><span class="tag">LoA</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">Discover</div>
    <div class="prog">D-PAS L3</div>
    <div class="tags"><span class="tag">接触</span><span class="tag">非接(+ZIP)</span><span class="tag">E2E 服务商</span><span class="tag">正式验证</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">JCB</div>
    <div class="prog">TCI</div>
    <div class="tags"><span class="tag">TCI(J/Smart)</span><span class="tag">TCI-CL(J/Speedy)</span><span class="tag">JCB Int'l 验证</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">银联 国际</div>
    <div class="prog">终端集成</div>
    <div class="tags"><span class="tag">UAC 接触</span><span class="tag">QuickPass 非接</span><span class="tag">Integration+Functional</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">银联 国内</div>
    <div class="prog">PBOC 终端检测</div>
    <div class="tags"><span class="tag">UICS(国密)</span><span class="tag">QuickPass(国密)</span><span class="tag">CUP/BCTC</span></div>
  </div>
  <div class="emv-card">
    <div class="scheme">EMVCo</div>
    <div class="prog">L1 / L2 型式批准</div>
    <div class="tags"><span class="tag">K2=MC</span><span class="tag">K3=Visa</span><span class="tag">K6=Discover</span></div>
  </div>
</div>

</div>
