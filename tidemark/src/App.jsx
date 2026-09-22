import { useState, useEffect, useRef, useCallback } from "react";

// ── COLOURS & FONTS ──────────────────────────────────────────────────────────
// Bimodal palette: warm cream/coral for hero/landing ↔ deep ocean teal for data
const C = {
  // Deep ocean (data sections)
  bg:"#081C28",
  surf:"#0C2535",
  surfHi:"#0F2E40",
  b:"rgba(255,255,255,0.07)",
  bHi:"rgba(43,181,165,0.38)",
  // Warm cream (landing/hero)
  cream:"#F5EDE0",
  creamD:"#EDE1CE",
  creamSurf:"rgba(245,237,224,0.92)",
  bCream:"rgba(14,42,58,0.10)",
  // Brand accents
  teal:"#2BB5A5",       // rich actionable teal
  tealD:"rgba(43,181,165,0.10)",
  tealG:"rgba(43,181,165,0.20)",
  coral:"#E06B42",      // Moshun-style warm coral CTA
  coralD:"rgba(224,107,66,0.12)",
  coralHi:"rgba(224,107,66,0.22)",
  // Text
  ink:"#0E2232",        // dark ink on cream backgrounds
  inkMut:"rgba(14,34,50,0.50)",
  inkFaint:"rgba(14,34,50,0.28)",
  sand:"rgba(245,237,224,0.82)",
  sandD:"rgba(245,237,224,0.48)",
  white:"#F5EDE0",
  mut:"rgba(245,237,224,0.38)",
  mutD:"rgba(245,237,224,0.18)",
  // Status
  red:"#E05050",
  amber:"#E09A30",
  green:"#28C47A",
  blue:"#4AA8E5",
  purple:"#9B7AE8",
  gold:"#C9A040",
};
const F = {
  display:"'Space Grotesk','Outfit','DM Sans',system-ui,sans-serif",
  sans:"'Inter','DM Sans',system-ui,sans-serif",
  mono:"'JetBrains Mono','Courier New',monospace",
  // Keep a serif only for italic accents/taglines
  serif:"'Lora','Georgia',serif",
};
const risk = v => v>=80?{l:"Critical",c:C.red}:v>=65?{l:"High",c:C.amber}:v>=50?{l:"Elevated",c:"#c8b840"}:{l:"Moderate",c:C.green};
const avg = obj => Math.round(Object.values(obj).reduce((a,b)=>a+b,0)/Object.values(obj).length);

// ── PERSONAS ─────────────────────────────────────────────────────────────────
const PERSONAS = [
  { id:"insurer",    icon:"🛡️", label:"Insurance & Reinsurance",    color:C.blue,
    tag:"Underwriting exposure, catastrophe modelling, and nature-related liability",
    kpis:["Probable Maximum Loss (PML)","Annual Average Loss (AAL)","Combined Ratio Impact","NatCat Reserve Adequacy"],
    cta:"View Underwriting Exposure", lang:"underwriting" },
  { id:"dfi",        icon:"🏦", label:"Development Finance",         color:C.purple,
    tag:"Blended finance structures, concessional capital, and SDG-aligned portfolio risk",
    kpis:["Portfolio at Risk (PaR)","Blended Finance Readiness","SDG Additionality Score","First-Loss Tranche Sizing"],
    cta:"View Portfolio Risk", lang:"investment" },
  { id:"foundation", icon:"🌱", label:"Philanthropic Foundation",    color:C.green,
    tag:"Grant due diligence, framework alignment, and resilience investment strategy",
    kpis:["Theory of Change Robustness","GBF Target Alignment","Co-funding Leverage Ratio","Impact Permanence Score"],
    cta:"View Funding Landscape", lang:"grantmaking" },
  { id:"port",       icon:"⚓", label:"Port & Infrastructure",       color:C.amber,
    tag:"Asset vulnerability, operational continuity, and coastal infrastructure resilience",
    kpis:["Days Disrupted per Year","Asset Stranding Risk","Adaptation CAPEX Estimate","Critical Threshold Exceedance"],
    cta:"View Asset Exposure", lang:"operations" },
  { id:"corporate",  icon:"🏢", label:"Corporate Sustainability",    color:C.teal,
    tag:"CSRD/TNFD disclosure, nature dependency mapping, and value chain risk",
    kpis:["TNFD LEAP Exposure Score","CSRD ESRS E3/E4 Gap","Scope 3 Nature Dependency","Biodiversity Footprint Index"],
    cta:"View Disclosure Exposure", lang:"disclosure" },
  { id:"government", icon:"🏛️", label:"Policy & Government",         color:"#e06090",
    tag:"Coastal adaptation planning, ecosystem service valuation, and regulatory design",
    kpis:["Ecosystem Service Value at Risk","Coastal Population Exposed","Adaptation Finance Gap","Policy Alignment Score"],
    cta:"View Policy Risk Landscape", lang:"policy" },
];

// ── RISK DIMENSIONS ───────────────────────────────────────────────────────────
const DIMS = {
  cf:{ name:"Coastal Flood Risk", icon:"🌊",
    def:"Exposure to sea-level rise, storm surge, and extreme coastal flooding events that inundate assets, displace populations, and damage infrastructure.",
    drivers:[
      "Sea-level rise: IPCC AR6 projects 0.44–0.76m median rise by 2100 under SSP2-4.5, with low-probability scenarios exceeding 1m.",
      "Tropical cyclone intensification: Peak intensity strengthening 1–10% per degree of warming (Knutson et al., 2020).",
      "Land subsidence: Coastal cities sinking 2–10cm/year from groundwater extraction, compounding flood exposure.",
      "Surge nonlinearity: A 10cm sea-level rise can 2–3× the frequency of extreme surge events above historical thresholds.",
    ],
    frameworks:[
      {n:"IPCC AR6 WG2 Ch.15",t:"Science",d:"Authoritative sea-level rise projections and coastal flood risk assessment"},
      {n:"TNFD LEAP v1.1",t:"Disclosure",d:"Physical risk identification for nature-related financial disclosures"},
      {n:"WorldRiskIndex 2023",t:"Index",d:"UNU-EHS composite exposure and vulnerability index for 193 countries"},
      {n:"NOAA Sea Level Rise Technical Report 2022",t:"Data",d:"U.S. interagency SLR scenarios, widely applied globally for infrastructure planning"},
    ],
    sources:["NASA/CNES Jason satellite altimetry (1993–present)","NOAA CO-OPS tidal gauge network (200+ stations)","EU Copernicus Land Monitoring Service (CLMS)","GEBCO 2025 bathymetry — UNESCO/IHO/Seabed 2030"],
    persona:{
      insurer:"Drives PML in coastal property lines. Flood zones repricing 10–15% annually. Parametric triggers tied to sea-level thresholds are growing fastest.",
      dfi:"First-loss tranche sizing for coastal infrastructure must account for 20+ year asset life where SLR exposure is material. IFC PS6 requires physical climate risk disclosure.",
      foundation:"Most fundable: nature-based coastal protection (mangroves, oyster reefs) delivering 50–70% wave energy reduction at <10% cost of hard infrastructure. GBF Target 11 leverage.",
      port:"Infrastructure designed to 1-in-100 year return periods will face 1-in-10 year events by 2050 under SSP2-4.5. Site-specific storm surge scenarios are essential.",
      corporate:"CSRD ESRS E1-7 requires disclosure of physical climate risks to own operations and Scope 3 supplier coastal geography mapping.",
      government:"Adaptation financing gap: $50–100B/year globally (GCA 2023). Nature-based solutions deliver 2–10x higher benefit-cost ratios than engineered alternatives.",
    }},
  bio:{ name:"Biodiversity Loss Risk", icon:"🐠",
    def:"Exposure to ecosystem degradation, species loss, and decline in marine natural capital underpinning fisheries, coastal protection, pharmaceuticals, and tourism.",
    drivers:[
      "Ocean warming: SST increases bleaching 50–70% of surveyed coral reefs globally (GCRMN, 2022).",
      "Ocean acidification: pH dropped 0.1 units since industrialisation — 26% increase in acidity — disrupting marine food webs.",
      "Overfishing: 35.4% of global fish stocks at biologically unsustainable levels (FAO, 2022).",
      "Habitat loss: Mangroves lost at 0.3–0.6%/year; seagrass declining at 7%/year — critical carbon sinks and nursery habitats.",
    ],
    frameworks:[
      {n:"Kunming-Montreal GBF (2022)",t:"Policy",d:"30×30 target, ecosystem restoration, and biodiversity impact disclosure"},
      {n:"IPBES Global Assessment 2019",t:"Science",d:"IPCC-equivalent for biodiversity; planetary boundary thresholds"},
      {n:"TNFD LEAP v1.1",t:"Disclosure",d:"Nature-related financial disclosure — dependencies, impacts, risks, opportunities"},
      {n:"ENCORE Tool (UNEP-WCMC/NHB)",t:"Analytics",d:"Sector-ecosystem dependency and natural capital exposure mapping"},
    ],
    sources:["IUCN Red List (157,000+ species assessed)","UNEP-WCMC Ocean+ (MPAs, mangroves, coral reefs, seagrass)","Global Coral Reef Monitoring Network (12,000+ sites)","GBIF Ocean — 100M+ marine species occurrence records"],
    persona:{
      insurer:"Coral reef loss removes $4B/year in coastal protection value (Beck et al., 2018). Nature-related liability is an emerging but fast-growing line.",
      dfi:"Nature dependency is a material IFC/World Bank risk category. High biodiversity footprint requires mitigation hierarchy compliance under IFC PS6 and EBRD PR6.",
      foundation:"Core grant territory: GBF Target 3 (30×30), Target 14 (ecosystem services), Target 2 (restoration). Marine grants are underfunded relative to terrestrial.",
      port:"Dredging, vessel strikes, antifouling biocides, and ballast water invasives are key port-specific pressures. EU Biodiversity Strategy 2030 mandates habitat restoration.",
      corporate:"CSRD ESRS E4 mandates biodiversity impact and dependency disclosure. TNFD LEAP Evaluate step requires ENCORE or equivalent sector-ecosystem assessment.",
      government:"Blue carbon valuation ($120–280/tonne CO₂ for mangroves) and SEEA Ocean accounting provide tools for regulatory incentive design.",
    }},
  reg:{ name:"Regulatory & Transition Risk", icon:"⚖️",
    def:"Exposure to policy shifts, mandatory disclosure requirements, legal liability, and market repricing driven by ocean and biodiversity regulation.",
    drivers:[
      "EU CSRD & ESRS E3/E4: Mandatory nature disclosure for 50,000+ EU companies from 2024–2028 — largest disclosure expansion in history.",
      "TNFD adoption: 400+ financial institutions (>$4T AUM) committed to TNFD-aligned disclosures as of 2024.",
      "GBF implementation: 196 nations committed to 30×30 ocean protection by 2030, triggering marine spatial planning and use restrictions.",
      "Litigation risk: 230+ climate and nature-related legal cases filed against governments and companies in 2023 (Sabin Center).",
    ],
    frameworks:[
      {n:"EU CSRD / ESRS E3-E4 (2024)",t:"Regulation",d:"Corporate Sustainability Reporting Directive — mandatory nature and water disclosure"},
      {n:"TNFD Final Recommendations v1.1",t:"Disclosure",d:"Taskforce on Nature-related Financial Disclosures — TCFD-equivalent for nature"},
      {n:"GBF Global Biodiversity Framework",t:"Policy",d:"Kunming-Montreal 2022 — 23 targets including 30×30 and harmful subsidy reform"},
      {n:"EU Taxonomy / DNSH Criteria",t:"Regulation",d:"Do No Significant Harm criteria include marine ecosystem impact thresholds"},
    ],
    sources:["Sabin Center Climate Litigation Database","UNEP FI Principles for Responsible Banking — nature modules","Ocean Health Index (OHI) — annual country-level governance scores","World Bank RISE regulatory indicators"],
    persona:{
      insurer:"D&O exposure growing as boards face liability for inadequate nature disclosure. Lloyd's Market Association has issued biodiversity risk model guidance. Regulatory capital treatment under review at PRA/ECB.",
      dfi:"MDB Environmental and Social Standards increasingly require TNFD-aligned assessment. Green bond frameworks adding biodiversity covenants. MDB joint paper (2023) commits to nature mainstreaming.",
      foundation:"Regulatory tailwinds make funded interventions viable at scale. Grantmaking on TNFD/CSRD capacity building in high-exposure sectors can leverage 10–100x private capital.",
      port:"IMO 2030/2050 targets, ballast water conventions, and EU maritime spatial planning create material compliance CAPEX. Early regulator engagement reduces stranded asset risk.",
      corporate:"Companies with >500 employees in EU or listed on EU markets face mandatory ESRS E3/E4 reporting by 2026. Non-compliance carries financial penalties and reputational exposure.",
      government:"Reforming harmful ocean subsidies ($22B/year, OECD) and establishing blue carbon credit frameworks can unlock $50–100B/year in private conservation finance.",
    }},
  sc:{ name:"Supply Chain & Dependency Risk", icon:"🔗",
    def:"Exposure arising from dependence on ocean ecosystems and marine services — including fisheries, shipping lanes, coastal processing, and marine ingredient sourcing.",
    drivers:[
      "Fisheries collapse: 1.2 billion people depend on seafood as primary protein; stock collapse affects $150B+ in annual fish trade.",
      "Shipping concentration: 80% of global trade by volume moves by sea; 15% transits straits with material flood or cyclone exposure.",
      "Climate range shifts: Fish stocks moving poleward at 70km/decade (Poloczanska et al., 2016), destabilising supply contracts.",
      "Marine ingredient dependencies: Pharma, cosmetics, food, and aquaculture sectors have unquantified wild marine species dependencies.",
    ],
    frameworks:[
      {n:"TNFD LEAP v1.1 — Locate & Evaluate",t:"Disclosure",d:"Value chain mapping against biomes and nature-sensitive area identification"},
      {n:"ENCORE Tool (UNEP-WCMC)",t:"Analytics",d:"Industry-level natural capital dependency and ecosystem service mapping"},
      {n:"FAO FishStat Database",t:"Data",d:"Global capture and aquaculture production statistics — 1950 to present"},
      {n:"UNCTAD Maritime Transport Review",t:"Research",d:"Annual seaborne trade, port performance, and climate exposure assessment"},
    ],
    sources:["FAO FishStat — global fisheries production and trade","Global Fishing Watch — AIS fishing vessel tracking (2012–present)","Copernicus Marine Service — ocean productivity and chlorophyll-a","UN Comtrade — marine product trade flows by HS code"],
    persona:{
      insurer:"Marine cargo and trade credit exposed to fisheries disruption, shipping lane volatility, and port flood events. Catch variability increasing commodity price volatility in food underwriting.",
      dfi:"Coastal processing, aquaculture, and blue economy projects require supply chain resilience assessment. EU Blue Economy Report identifies circular diversification opportunities.",
      foundation:"Funding sustainable fisheries governance, community rights, and marine spatial planning protects $150B+ in seafood trade while delivering SDG 14.4 (currently off-track).",
      port:"Operational continuity depends on fishing and aquaculture throughput beyond container volumes. Cold chain, ice supply, and fish landing infrastructure disruptions are undermodelled.",
      corporate:"ESRS E3 requires supply chain marine dependency disclosure. Seafood sector exposure is highest; pharma and cosmetics face emerging marine ingredient sourcing obligations.",
      government:"WTO Agreement on Fisheries Subsidies (2022) creates just transition risk for fishing communities. Alternative livelihood programmes are a policy design priority.",
    }},
  pc:{ name:"Physical Climate Risk", icon:"🌡️",
    def:"Acute and chronic physical risks from climate change impacting marine systems — ocean warming, marine heatwaves, deoxygenation, and extreme weather intensification.",
    drivers:[
      "Ocean heat content: Ocean absorbed 90% of excess warming heat. OHC reached a new record in 2023 (Cheng et al., 2024).",
      "Marine heatwaves: Frequency increased 50% since 1925, projected to double again by 2041–2060 under SSP2-4.5.",
      "Deoxygenation: Oxygen minimum zones expanded ~4.5M km² since 1960 (IPCC SROCC), threatening deep-sea fisheries.",
      "Compound events: Simultaneous marine heatwave, low oxygen, and high acidity is increasing — stressing species beyond single thresholds.",
    ],
    frameworks:[
      {n:"IPCC SROCC 2019",t:"Science",d:"Special Report on Ocean and Cryosphere — definitive physical risk baseline"},
      {n:"IPCC AR6 WG1 Ch.9 (2021)",t:"Science",d:"Ocean, cryosphere and sea level — updated projections under SSP scenarios"},
      {n:"TCFD Physical Risk Framework",t:"Disclosure",d:"Acute and chronic physical risk categories for ocean-dependent sectors"},
      {n:"NOAA Coral Reef Watch DHW",t:"Monitoring",d:"Real-time Degree Heating Week satellite monitoring — bleaching risk tool"},
    ],
    sources:["NOAA ERSSTv5 sea surface temperature record","Copernicus C3S ERA5 ocean reanalysis (1940–present)","CMIP6 climate model ensemble (SSP1-1.9 to SSP5-8.5)","Argo Float Programme — 4,000 autonomous profiling floats globally"],
    persona:{
      insurer:"1.5°C commits 70–90% of coral reefs to annual severe bleaching; 2°C commits >99%. NatCat models require marine heatwave peril integration.",
      dfi:"CMIP6 scenario analysis now required for MDB climate risk screening. Projects with 20+ year horizons must be stress-tested under SSP2-4.5 and SSP3-7.0.",
      foundation:"Marine climate resilience is the most undercapitalised area of ocean philanthropy. Thermal tolerance research, assisted evolution, and deep-water refuge identification are high-leverage.",
      port:"Ocean warming affects port infrastructure through thermal expansion, increased storm closures, and desalination plant disruption from algal blooms.",
      corporate:"TCFD physical risk disclosure requires acute and chronic scenario analysis. Ocean-dependent sectors must include SST trends, MHW frequency, and cyclone intensity projections.",
      government:"Many national adaptation plans still use IPCC AR5 (2013) baselines — a material planning gap. ICZM frameworks must be updated to AR6 projections.",
    }},
};

// ── STATIC RISK DATA ──────────────────────────────────────────────────────────
const SECTORS = [
  {id:"shipping",    label:"Shipping & Logistics",       icon:"🚢"},
  {id:"insurance",   label:"Insurance & Reinsurance",    icon:"🛡️"},
  {id:"aquaculture", label:"Aquaculture & Fisheries",    icon:"🐟"},
  {id:"coastal_re",  label:"Coastal Real Estate",        icon:"🏗️"},
  {id:"tourism",     label:"Coastal Tourism",            icon:"🏖️"},
  {id:"finance",     label:"Investment & Finance",       icon:"📈"},
];
const REGIONS = [
  {id:"sea",          label:"Southeast Asia"},
  {id:"pacific",      label:"Pacific Islands"},
  {id:"caribbean",    label:"Caribbean"},
  {id:"indian",       label:"Indian Ocean Coast"},
  {id:"west_africa",  label:"West Africa"},
  {id:"north_atlantic",label:"North Atlantic"},
];
const RISK_DATA = {
  shipping:    {sea:{cf:72,bio:68,reg:55,sc:81,pc:76},pacific:{cf:85,bio:74,reg:42,sc:63,pc:88},caribbean:{cf:78,bio:71,reg:60,sc:59,pc:82},indian:{cf:69,bio:65,reg:48,sc:74,pc:71},west_africa:{cf:61,bio:58,reg:38,sc:66,pc:65},north_atlantic:{cf:44,bio:52,reg:78,sc:48,pc:51}},
  insurance:   {sea:{cf:83,bio:61,reg:66,sc:55,pc:79},pacific:{cf:91,bio:77,reg:52,sc:44,pc:93},caribbean:{cf:88,bio:69,reg:71,sc:41,pc:90},indian:{cf:75,bio:63,reg:57,sc:48,pc:78},west_africa:{cf:67,bio:55,reg:44,sc:37,pc:68},north_atlantic:{cf:58,bio:60,reg:85,sc:35,pc:55}},
  aquaculture: {sea:{cf:65,bio:89,reg:58,sc:71,pc:74},pacific:{cf:77,bio:91,reg:46,sc:65,pc:82},caribbean:{cf:71,bio:85,reg:64,sc:60,pc:78},indian:{cf:68,bio:80,reg:51,sc:69,pc:72},west_africa:{cf:59,bio:74,reg:41,sc:61,pc:63},north_atlantic:{cf:42,bio:66,reg:79,sc:44,pc:47}},
  coastal_re:  {sea:{cf:88,bio:62,reg:49,sc:38,pc:85},pacific:{cf:94,bio:71,reg:38,sc:31,pc:96},caribbean:{cf:91,bio:67,reg:66,sc:34,pc:92},indian:{cf:82,bio:59,reg:44,sc:36,pc:80},west_africa:{cf:73,bio:51,reg:37,sc:28,pc:70},north_atlantic:{cf:55,bio:58,reg:82,sc:26,pc:52}},
  tourism:     {sea:{cf:70,bio:83,reg:52,sc:47,pc:73},pacific:{cf:82,bio:88,reg:43,sc:39,pc:86},caribbean:{cf:79,bio:84,reg:68,sc:42,pc:83},indian:{cf:67,bio:78,reg:48,sc:44,pc:70},west_africa:{cf:58,bio:69,reg:39,sc:35,pc:60},north_atlantic:{cf:46,bio:63,reg:77,sc:30,pc:48}},
  finance:     {sea:{cf:77,bio:74,reg:71,sc:68,pc:79},pacific:{cf:86,bio:80,reg:60,sc:55,pc:89},caribbean:{cf:82,bio:76,reg:76,sc:52,pc:85},indian:{cf:73,bio:70,reg:65,sc:62,pc:75},west_africa:{cf:62,bio:62,reg:55,sc:54,pc:64},north_atlantic:{cf:50,bio:65,reg:88,sc:42,pc:53}},
};

const ECOSYSTEMS   = ["Coral Reef","Mangrove","Seagrass Meadow","Kelp Forest","Salt Marsh","Open Ocean","Coastal Wetland","Estuary"];
const INTERVENTIONS= ["Restoration & Rehabilitation","Conservation & Protection","Sustainable Use","Research & Monitoring","Community Stewardship","Policy & Governance","Finance & Investment Mobilisation"];
const BUDGETS      = ["< $250K","$250K – $1M","$1M – $5M","$5M – $25M","$25M+"];
const DURATIONS    = ["1–2 years","3–5 years","6–10 years","10+ years"];

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const S = {
  card:{ background:C.surf, border:`1px solid ${C.b}`, borderRadius:16, padding:24 },
  cardWarm:{ background:"rgba(245,237,224,0.07)", border:`1px solid rgba(245,237,224,0.1)`, borderRadius:16, padding:24 },
};

function Pill({children, color=C.teal}){
  return <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,fontWeight:700,
    background:`${color}15`,color,border:`1px solid ${color}25`}}>{children}</span>;
}

function AnimNum({to}){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let cur=0; const step=to/40;
    const id=setInterval(()=>{ cur+=step; if(cur>=to){setV(to);clearInterval(id);}else setV(Math.floor(cur)); },20);
    return ()=>clearInterval(id);
  },[to]);
  return <>{v}</>;
}

function Gauge({score, label}){
  const {l,c}=risk(score);
  const r=36, circ=2*Math.PI*r, off=circ-(score/100)*circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
      <div style={{position:"relative",width:90,height:90}}>
        <svg width="90" height="90" style={{transform:"rotate(-90deg)"}}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
          <circle cx="45" cy="45" r={r} fill="none" stroke={c} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
              filter:`drop-shadow(0 0 6px ${c}) drop-shadow(0 0 12px ${c}60)`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:19,fontWeight:700,fontFamily:F.mono,color:C.white,lineHeight:1}}><AnimNum to={score}/></span>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:9.5,color:C.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2,maxWidth:80,lineHeight:1.3}}>{label}</div>
        <div style={{fontSize:9.5,fontWeight:700,color:c,letterSpacing:"0.08em",textTransform:"uppercase"}}>{l}</div>
      </div>
    </div>
  );
}

function Sel({label,value,onChange,options,placeholder="Select…"}){
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>{label}</div>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"10px 13px",background:C.surfHi,border:`1px solid ${C.b}`,
          borderRadius:8,color:value?C.white:C.mut,fontSize:13,outline:"none",fontFamily:F.sans,
          cursor:"pointer"}}>
        <option value="">{placeholder}</option>
        {options.map(o=>{
          const label=typeof o==="string"?o:o.label;
          const val=typeof o==="string"?o:(o.id||o.value||o.label);
          return <option key={val} value={val}>{label}</option>;
        })}
      </select>
    </div>
  );
}

function Inp({label,value,onChange,placeholder,multiline=false}){
  const style={width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.04)",
    border:`1px solid ${C.b}`,borderRadius:8,color:C.white,fontSize:13,
    outline:"none",fontFamily:F.sans,boxSizing:"border-box"};
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>{label}</div>
      {multiline
        ? <textarea rows={3} value={value} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder} style={{...style,resize:"vertical"}}/>
        : <input value={value} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder} style={style}/>}
    </div>
  );
}

function Btn({children,onClick,disabled,variant="primary",small=false}){
  const styles = {
    primary:{
      background: disabled?"rgba(255,255,255,0.06)":`linear-gradient(135deg,${C.coral},#c85530)`,
      color: disabled?C.mutD:"white",
      border:"none",
      boxShadow: disabled?"none":`0 4px 18px rgba(224,107,66,0.35)`,
    },
    outline:{
      background:"transparent",
      color:C.teal,
      border:`1.5px solid ${C.bHi}`,
      boxShadow:"none",
    },
    ghost:{
      background:"transparent",
      color:C.mut,
      border:`1px solid ${C.b}`,
      boxShadow:"none",
    },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{padding:small?"7px 16px":"12px 26px",borderRadius:50,
        ...s, fontSize:small?10:12,fontWeight:700,fontFamily:F.display,
        cursor:disabled?"default":"pointer",letterSpacing:"0.09em",textTransform:"uppercase",
        opacity:disabled?0.45:1,transition:"all .15s"}}>
      {children}
    </button>
  );
}

// ── DIMENSION CARD ────────────────────────────────────────────────────────────
function DimCard({dimKey, score, personaId}){
  const [open,setOpen]=useState(false);
  const {l,c}=risk(score);
  const d=DIMS[dimKey];
  const ptext=d.persona[personaId]||d.persona.foundation;
  const typeCol={Science:C.blue,Disclosure:C.purple,Policy:C.green,Data:C.teal,Analytics:C.amber,Regulation:C.red,Monitoring:C.green,Index:C.blue,Research:C.sand};
  return (
    <div style={{border:`1px solid ${open?C.bHi:C.b}`,borderRadius:12,overflow:"hidden",background:C.surf}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",padding:"15px 18px",background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
        <span style={{fontSize:20,flexShrink:0}}>{d.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:2}}>{d.name}</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.def.slice(0,85)}…</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.mono,color:c}}>{score}</div>
            <div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div>
          </div>
          <div style={{color:C.mut,fontSize:12}}>{open?"▲":"▼"}</div>
        </div>
      </button>
      <div style={{height:3,background:"rgba(255,255,255,0.04)"}}>
        <div style={{height:"100%",width:`${score}%`,background:c,boxShadow:`0 0 5px ${c}40`,transition:"width 1s"}}/>
      </div>
      {open && (
        <div style={{padding:"18px 20px",borderTop:`1px solid ${C.b}`}}>
          <p style={{fontSize:13,color:C.sand,lineHeight:1.75,marginBottom:16}}>{d.def}</p>
          {/* Persona lens */}
          <div style={{padding:"13px 15px",background:C.tealD,borderRadius:9,border:`1px solid ${C.bHi}`,marginBottom:16}}>
            <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:6,fontWeight:700}}>
              What this means for {PERSONAS.find(p=>p.id===personaId)?.label}
            </div>
            <div style={{fontSize:13,color:C.sand,lineHeight:1.7}}>{ptext}</div>
          </div>
          {/* Drivers */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:10,fontWeight:700}}>Key Risk Drivers</div>
            {d.drivers.map((dr,i)=>(
              <div key={i} style={{display:"flex",gap:9,marginBottom:9,alignItems:"flex-start"}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:c,marginTop:6,flexShrink:0}}/>
                <div style={{fontSize:12,color:C.sandD,lineHeight:1.65}}>{dr}</div>
              </div>
            ))}
          </div>
          {/* Frameworks */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:10,fontWeight:700}}>Scientific & Regulatory Basis</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {d.frameworks.map((f,i)=>(
                <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start",padding:"9px 11px",background:C.surfHi,borderRadius:7}}>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:`${typeCol[f.t]||C.mut}18`,color:typeCol[f.t]||C.mut,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{f.t}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.white,marginBottom:1}}>{f.n}</div>
                    <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Sources */}
          <div>
            <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.13em",marginBottom:8,fontWeight:700}}>Data Sources</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {d.sources.map((s,i)=>(
                <span key={i} style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:C.surfHi,color:C.mut,border:`1px solid ${C.b}`}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({page, setPage, pipeCount, persona, resetPersona}){
  const p=PERSONAS.find(x=>x.id===persona);
  const tabs=[{id:"live",label:"Live Intelligence"},{id:"screen",label:"Risk Screener"},{id:"score",label:"Project Scorer"},{id:"pipe",label:"Pipeline"}];
  return (
    <nav style={{position:"sticky",top:0,zIndex:200,
      background:"rgba(8,28,40,0.96)",
      backdropFilter:"blur(20px) saturate(160%)",
      borderBottom:`1px solid rgba(43,181,165,0.12)`}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",height:56}}>
        {/* Logo */}
        <div style={{paddingRight:22,marginRight:4,borderRight:`1px solid ${C.b}`,flexShrink:0,lineHeight:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{position:"relative",width:7,height:7,flexShrink:0}}>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.teal}}/>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.teal,animation:"ripple 2.5s ease-out infinite"}}/>
            </div>
            <span style={{fontFamily:F.display,fontSize:16,color:C.white,fontWeight:700,letterSpacing:"-0.02em"}}>Tidemark</span>
          </div>
          <div style={{fontSize:8,color:C.mut,letterSpacing:"0.22em",textTransform:"uppercase",marginTop:2,paddingLeft:15}}>Marine Risk Intelligence</div>
        </div>
        {/* Tabs */}
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setPage(t.id)} style={{
            position:"relative",padding:"0 14px",height:56,
            fontFamily:F.display,fontSize:10.5,fontWeight:page===t.id?600:400,
            color:page===t.id?C.teal:C.mut,background:"none",border:"none",
            borderBottom:page===t.id?`2px solid ${C.teal}`:"2px solid transparent",
            cursor:"pointer",letterSpacing:"0.1em",textTransform:"uppercase",flexShrink:0,
            transition:"color .15s"}}>
            {t.label}
            {t.id==="pipe"&&pipeCount>0&&(
              <span style={{position:"absolute",top:11,right:3,minWidth:16,height:16,borderRadius:8,
                background:C.coral,color:"white",fontSize:8,fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{pipeCount}</span>
            )}
          </button>
        ))}
        {/* Persona badge */}
        <div style={{marginLeft:"auto",flexShrink:0}}>
          {p && (
            <button onClick={resetPersona} style={{display:"flex",alignItems:"center",gap:7,
              padding:"6px 14px",borderRadius:24,border:`1px solid ${p.color}40`,
              background:`${p.color}0e`,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${p.color}1c`}
              onMouseLeave={e=>e.currentTarget.style.background=`${p.color}0e`}>
              <span style={{fontSize:12}}>{p.icon}</span>
              <span style={{fontFamily:F.display,fontSize:10.5,color:p.color,fontWeight:600,letterSpacing:"0.04em"}}>{p.label}</span>
              <span style={{fontSize:9,color:C.mutD,marginLeft:2}}>↕</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── PERSONA SVG ICONS ─────────────────────────────────────────────────────────
const PersonaIcons = {
  insurer: ({color="currentColor",size=36})=>(
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3L6 8v10c0 7 5.4 13.5 12 15 6.6-1.5 12-8 12-15V8L18 3z"/>
      <path d="M10 20c1.5 2 4 3.5 8 4 4-0.5 6.5-2 8-4"/>
      <path d="M10 16c1.5 2 4 3 8 3.5 4-0.5 6.5-1.5 8-3.5"/>
    </svg>
  ),
  dfi: ({color="currentColor",size=36})=>(
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="28" width="30" height="3" rx="1"/>
      <rect x="3" y="14" width="30" height="2"/>
      <line x1="8" y1="16" x2="8" y2="28"/><line x1="14" y1="16" x2="14" y2="28"/>
      <line x1="20" y1="16" x2="20" y2="28"/><line x1="26" y1="16" x2="26" y2="28"/>
      <path d="M3 14L18 5l15 9"/>
      <path d="M26 6l3-4" strokeWidth="1.4"/><path d="M26 6l4 1" strokeWidth="1.4"/>
    </svg>
  ),
  foundation: ({color="currentColor",size=36})=>(
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 32C18 32 7 24 7 14a11 11 0 0 1 11-11 11 11 0 0 1 11 11c0 10-11 18-11 18z"/>
      <path d="M18 20V11"/>
      <path d="M14 15l4-4 4 4"/>
      <path d="M13 20h10"/>
    </svg>
  ),
  port: ({color="currentColor",size=36})=>(
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="8" r="3"/>
      <line x1="18" y1="11" x2="18" y2="28"/>
      <line x1="9" y1="17" x2="27" y2="17"/>
      <path d="M9 28c0 0 2-4 9-4s9 4 9 4"/>
      <path d="M5 31c2-1 5-2 13-2s11 1 13 2"/>
    </svg>
  ),
  corporate: ({color="currentColor",size=36})=>(
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6a12 12 0 0 1 12 12"/>
      <path d="M30 18a12 12 0 0 1-12 12"/>
      <path d="M18 30a12 12 0 0 1-12-12"/>
      <path d="M6 18a12 12 0 0 1 12-12"/>
      <path d="M26 10l4-4m0 4h-4"/>
      <path d="M10 26l-4 4m0-4h4"/>
      <circle cx="18" cy="18" r="4"/>
    </svg>
  ),
  government: ({color="currentColor",size=36})=>(
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="30" width="30" height="2.5" rx="1"/>
      <rect x="3" y="15" width="30" height="2"/>
      <line x1="7" y1="17" x2="7" y2="30"/><line x1="12" y1="17" x2="12" y2="30"/>
      <line x1="18" y1="17" x2="18" y2="30"/>
      <line x1="24" y1="17" x2="24" y2="30"/><line x1="29" y1="17" x2="29" y2="30"/>
      <path d="M3 15L18 5l15 10"/>
      <circle cx="18" cy="10" r="2" fill={color} stroke="none"/>
    </svg>
  ),
};

// ── ANIMATED OCEAN CANVAS ─────────────────────────────────────────────────────
function OceanCanvas(){
  const canvasRef = useRef(null);
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const W = ()=>canvas.offsetWidth, H = ()=>canvas.offsetHeight;
    const particles = Array.from({length:55},()=>({
      x: Math.random()*1400, y: Math.random()*400,
      r: Math.random()*2+0.5, vx: (Math.random()-.5)*0.3,
      vy: (Math.random()-.5)*0.2, alpha: Math.random()*0.4+0.1,
    }));

    const draw = () => {
      t += 0.008;
      const w = W(), h = H();
      ctx.clearRect(0,0,w,h);

      // Wave layers — teal hues on cream
      const waves = [
        {amp:18, freq:0.008, phase:0,     speed:0.6,  y:h*0.55, color:"rgba(43,181,165,0.13)", width:3},
        {amp:12, freq:0.012, phase:1.2,   speed:0.9,  y:h*0.62, color:"rgba(43,181,165,0.09)", width:2},
        {amp:22, freq:0.006, phase:2.1,   speed:0.4,  y:h*0.48, color:"rgba(43,181,165,0.07)", width:4},
        {amp:8,  freq:0.018, phase:0.7,   speed:1.2,  y:h*0.70, color:"rgba(224,107,66,0.07)", width:2},
        {amp:30, freq:0.005, phase:3.0,   speed:0.3,  y:h*0.40, color:"rgba(43,181,165,0.05)", width:5},
      ];

      waves.forEach(wv=>{
        ctx.beginPath();
        ctx.moveTo(0, wv.y + Math.sin(wv.phase + t*wv.speed)*wv.amp);
        for(let x=0; x<=w; x+=4){
          const y = wv.y + Math.sin(wv.freq*x + wv.phase + t*wv.speed)*wv.amp
                        + Math.sin(wv.freq*1.7*x + t*wv.speed*0.7)*wv.amp*0.4;
          ctx.lineTo(x,y);
        }
        ctx.strokeStyle = wv.color;
        ctx.lineWidth = wv.width;
        ctx.stroke();
      });

      // Floating particles
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if(p.x<0) p.x=w; if(p.x>w) p.x=0;
        if(p.y<0) p.y=h; if(p.y>h) p.y=0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(43,181,165,${p.alpha})`;
        ctx.fill();
      });

      // Subtle grid lines (north.io-style)
      ctx.strokeStyle = "rgba(43,181,165,0.05)";
      ctx.lineWidth = 1;
      for(let x=0; x<w; x+=80){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
      }
      for(let y=0; y<h; y+=80){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener("resize",resize); };
  },[]);

  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
}

// ── PERSONA SELECTOR ──────────────────────────────────────────────────────────
function PersonaSelect({onSelect}){
  const [hovered, setHovered] = useState(null);
  const iconMap = {
    insurer:PersonaIcons.insurer, dfi:PersonaIcons.dfi, foundation:PersonaIcons.foundation,
    port:PersonaIcons.port, corporate:PersonaIcons.corporate, government:PersonaIcons.government,
  };

  return (
    <div style={{minHeight:"100vh",background:C.cream,display:"flex",flexDirection:"column",
      fontFamily:F.sans,overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Lora:ital,wght@1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(3.5);opacity:0}}
        *{box-sizing:border-box}
        select option{background:#0c2535;color:#f5ede0}
      `}</style>

      {/* ── ANIMATED HERO BANNER ── */}
      <div style={{width:"100%",background:C.cream,borderBottom:`1px solid ${C.bCream}`,
        position:"relative",overflow:"hidden",minHeight:320}}>
        <OceanCanvas/>

        {/* Coral glow accent */}
        <div style={{position:"absolute",top:-80,right:-60,width:440,height:440,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(224,107,66,0.10) 0%,transparent 65%)",pointerEvents:"none"}}/>

        <div style={{maxWidth:1100,margin:"0 auto",padding:"68px 40px 60px",position:"relative",zIndex:2}}>
          {/* Eyebrow */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{position:"relative",width:8,height:8,flexShrink:0}}>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.teal}}/>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.teal,animation:"ripple 2.5s ease-out infinite"}}/>
            </div>
            <span style={{fontFamily:F.display,fontSize:10.5,color:C.teal,textTransform:"uppercase",
              letterSpacing:"0.28em",fontWeight:600}}>Marine Risk Intelligence</span>
          </div>

          {/* Giant wordmark */}
          <h1 style={{fontFamily:F.display,fontSize:"clamp(60px,9vw,112px)",color:C.ink,
            margin:"0 0 4px",lineHeight:0.9,fontWeight:700,letterSpacing:"-0.035em"}}>
            Tide<span style={{color:C.teal}}>mark</span>
          </h1>

          {/* Italic tagline */}
          <p style={{fontFamily:"Lora,Georgia,serif",fontStyle:"italic",fontWeight:300,
            fontSize:"clamp(15px,2vw,20px)",color:C.inkMut,margin:"16px 0 24px",letterSpacing:"0.01em"}}>
            Ocean & coastal risk intelligence for capital that moves.
          </p>

          <p style={{fontFamily:F.sans,fontSize:13.5,color:C.inkMut,lineHeight:1.85,
            maxWidth:500,margin:"0 0 32px",fontWeight:400}}>
            Quantified exposure across five ocean risk dimensions — for underwriters, DFIs,
            philanthropies, and marine decision-makers worldwide.
          </p>

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{height:1.5,width:28,background:C.coral,borderRadius:1}}/>
            <span style={{fontFamily:F.display,fontSize:10,color:C.coral,
              textTransform:"uppercase",letterSpacing:"0.22em",fontWeight:700}}>Select your role to begin</span>
          </div>
        </div>
      </div>

      {/* ── PERSONA CARD GRID ── */}
      <div style={{width:"100%",background:C.creamD,flex:1}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 40px 56px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:32}}>
            {PERSONAS.map((p,i)=>{
              const Icon = iconMap[p.id];
              const isHov = hovered===p.id;
              return (
                <button key={p.id} onClick={()=>onSelect(p.id)}
                  onMouseEnter={()=>setHovered(p.id)}
                  onMouseLeave={()=>setHovered(null)}
                  style={{
                    padding:"22px 20px 20px",borderRadius:14,cursor:"pointer",textAlign:"left",
                    border:`1.5px solid ${isHov?p.color+"55":C.bCream}`,
                    background:isHov?"white":"rgba(255,255,255,0.6)",
                    transition:"all .18s ease",
                    boxShadow:isHov?`0 10px 36px rgba(14,34,50,0.13)`:`0 1px 4px rgba(14,34,50,0.05)`,
                    transform:isHov?"translateY(-3px)":"none",
                    animation:`fadeUp .42s ease ${i*0.06}s both`}}>

                  {/* Number + SVG icon */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                    <span style={{fontFamily:F.display,fontSize:12,color:C.coral,fontWeight:700,letterSpacing:"0.1em"}}>
                      {String(i+1).padStart(2,"0")}
                    </span>
                    <div style={{color:isHov?p.color:C.inkMut,transition:"color .18s"}}>
                      <Icon color={isHov?p.color:C.inkMut} size={34}/>
                    </div>
                  </div>

                  <div style={{fontFamily:F.display,fontSize:13.5,fontWeight:600,color:C.ink,
                    marginBottom:6,letterSpacing:"-0.01em"}}>{p.label}</div>
                  <div style={{fontFamily:F.sans,fontSize:11.5,color:C.inkMut,lineHeight:1.68,
                    marginBottom:16,fontWeight:400}}>{p.tag}</div>

                  {/* CTA line */}
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:isHov?24:14,height:1.5,background:p.color,borderRadius:1,transition:"width .2s"}}/>
                    <span style={{fontFamily:F.display,fontSize:9,color:p.color,fontWeight:700,
                      letterSpacing:"0.14em",textTransform:"uppercase"}}>{p.cta}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Science lineage */}
          <div style={{borderTop:`1px solid ${C.bCream}`,paddingTop:18,
            display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <span style={{fontFamily:F.display,fontSize:9,color:C.inkFaint,
              letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>Scientific basis</span>
            <span style={{fontFamily:F.sans,fontSize:9.5,color:C.inkFaint}}>
              IPCC AR6 · IPBES · GBF · TNFD LEAP v1.1 · WorldRiskIndex 2023 · NOAA · Copernicus · GEBCO 2025 · FAO · UNEP-WCMC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



// ── SVG WORLD MAP ─────────────────────────────────────────────────────────────
function WorldMap({ lat, lon, name }) {
  const W = 800, H = 380;
  const toX = ln => ((ln + 180) / 360) * W;
  const toY = lt => ((90 - lt) / 180) * H;
  const px = lon != null ? toX(lon) : null;
  const py = lat != null ? toY(lat) : null;

  // Simplified land polygons (equirectangular)
  const lands = [
    // North America
    "M 85,55 L 105,45 L 145,48 L 175,62 L 190,95 L 192,130 L 180,160 L 160,185 L 138,205 L 115,245 L 100,255 L 80,228 L 68,195 L 70,155 L 72,115 L 78,80 Z",
    // South America
    "M 138,265 L 172,258 L 200,272 L 212,308 L 208,355 L 192,385 L 162,390 L 135,372 L 122,338 L 126,296 Z",
    // Europe
    "M 363,52 L 395,46 L 425,52 L 442,65 L 438,88 L 415,98 L 390,96 L 368,82 Z",
    // Africa
    "M 362,108 L 408,100 L 448,120 L 460,168 L 456,228 L 440,278 L 412,306 L 382,302 L 356,270 L 344,225 L 346,168 L 352,130 Z",
    // Middle East / Arabia
    "M 445,105 L 490,100 L 510,118 L 508,148 L 488,162 L 462,155 L 445,135 Z",
    // Russia / North Asia
    "M 440,28 L 560,22 L 660,35 L 710,55 L 720,80 L 680,90 L 620,85 L 555,70 L 490,55 L 450,42 Z",
    // Central/South Asia
    "M 468,95 L 530,88 L 590,95 L 620,118 L 615,148 L 585,162 L 545,160 L 510,145 L 480,125 Z",
    // SE Asia peninsula
    "M 560,152 L 595,148 L 618,168 L 620,198 L 600,215 L 572,210 L 552,188 Z",
    // SE Asia islands (rough)
    "M 605,185 L 648,178 L 672,192 L 668,218 L 640,228 L 610,215 Z",
    // Australia
    "M 580,258 L 648,248 L 688,266 L 695,312 L 672,340 L 635,345 L 596,326 L 572,295 Z",
    // New Zealand
    "M 700,318 L 715,310 L 722,328 L 712,345 L 698,338 Z",
    // Japan
    "M 648,88 L 665,82 L 678,90 L 672,108 L 655,112 L 644,100 Z",
    // Greenland
    "M 182,22 L 220,18 L 245,28 L 248,48 L 228,58 L 195,55 L 175,42 Z",
    // UK / Ireland
    "M 352,65 L 365,60 L 372,70 L 365,80 L 350,78 Z",
    // Madagascar
    "M 445,278 L 458,268 L 468,285 L 465,315 L 448,322 L 438,308 Z",
  ];

  return (
    <div style={{position:"relative",background:"#08161f",borderRadius:10,overflow:"hidden",border:`1px solid ${C.b}`}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block"}}>
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0d2535"/>
            <stop offset="100%" stopColor="#060f18"/>
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#oceanGrad)"/>
        {/* Grid */}
        {[-60,-30,0,30,60].map(lt=>(
          <line key={`lat${lt}`} x1="0" y1={toY(lt)} x2={W} y2={toY(lt)} stroke="rgba(255,255,255,0.035)" strokeWidth="1"/>
        ))}
        {[-120,-60,0,60,120].map(ln=>(
          <line key={`lon${ln}`} x1={toX(ln)} y1="0" x2={toX(ln)} y2={H} stroke="rgba(255,255,255,0.035)" strokeWidth="1"/>
        ))}
        {/* Equator highlight */}
        <line x1="0" y1={toY(0)} x2={W} y2={toY(0)} stroke="rgba(52,183,152,0.12)" strokeWidth="1" strokeDasharray="6,6"/>
        {/* Land masses */}
        {lands.map((d,i)=>(
          <path key={i} d={d} fill="#0e2233" stroke="#1d3a50" strokeWidth="0.8"/>
        ))}
        {/* Tropics */}
        <line x1="0" y1={toY(23.5)} x2={W} y2={toY(23.5)} stroke="rgba(223,158,58,0.07)" strokeWidth="1" strokeDasharray="3,8"/>
        <line x1="0" y1={toY(-23.5)} x2={W} y2={toY(-23.5)} stroke="rgba(223,158,58,0.07)" strokeWidth="1" strokeDasharray="3,8"/>
        {/* Selected marker */}
        {px != null && py != null && (
          <g>
            <circle cx={px} cy={py} r="18" fill="rgba(52,183,152,0.08)"/>
            <circle cx={px} cy={py} r="7" fill={C.teal} opacity="0.9"/>
            <circle cx={px} cy={py} r="7" fill="none" stroke={C.teal} strokeWidth="1.5">
              <animate attributeName="r" values="7;20;7" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
        )}
      </svg>
      <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",justifyContent:"space-between",alignItems:"center",pointerEvents:"none"}}>
        {px != null
          ? <span style={{fontSize:11,color:C.teal,fontFamily:F.mono,background:"rgba(6,13,18,0.85)",padding:"3px 9px",borderRadius:5}}>{name} · {lat.toFixed(2)}°, {lon.toFixed(2)}°</span>
          : <span style={{fontSize:12,color:C.mutD}}>Search a location above to view live ocean conditions</span>}
        <span style={{fontSize:9,color:C.mutD,background:"rgba(6,13,18,0.7)",padding:"2px 7px",borderRadius:4}}>Equirectangular · GEBCO reference</span>
      </div>
    </div>
  );
}

// ── LIVE INTELLIGENCE ─────────────────────────────────────────────────────────
function LiveIntel() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selLoc,  setSelLoc]  = useState(null);
  const [marine,  setMarine]  = useState(null);
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState(null);
  const [showDrop, setShowDrop] = useState(false);
  const searchRef = useRef(null);

  // Geocode search via Open-Meteo — has CORS enabled, works in browser
  useEffect(() => {
    if (query.length < 2) { setResults([]); setShowDrop(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
        );
        const d = await r.json();
        const res = (d.results || []).filter(x => x.latitude != null && x.longitude != null);
        setResults(res);
        setShowDrop(res.length > 0);
      } catch {
        // Fallback: if geocoding API is blocked, show helpful message
        setResults([]);
        setShowDrop(false);
      }
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = async (loc) => {
    const label = [loc.name, loc.admin1, loc.country].filter(Boolean).join(", ");
    setQuery(label);
    setShowDrop(false);
    setResults([]);
    setSelLoc({ ...loc, label });
    setMarine(null);
    setErr(null);
    setBusy(true);
    try {
      const url =
        `https://marine-api.open-meteo.com/v1/marine` +
        `?latitude=${loc.latitude}&longitude=${loc.longitude}` +
        `&hourly=wave_height,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,sea_surface_temperature` +
        `&daily=wave_height_max,sea_surface_temperature_max,sea_surface_temperature_min,time` +
        `&timezone=auto&forecast_days=7`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const d = await resp.json();
      if (d.error) throw new Error(d.reason || "Marine API error");
      const h = d.hourly || {}, dl = d.daily || {};
      const fv = a => { if (!a) return null; const v = a.find(x => x != null && !isNaN(x)); return v !== undefined ? v : null; };
      setMarine({
        sst:      fv(h.sea_surface_temperature),
        sstMax:   dl.sea_surface_temperature_max?.[0] ?? null,
        sstMin:   dl.sea_surface_temperature_min?.[0] ?? null,
        wave:     fv(h.wave_height),
        waveMax:  dl.wave_height_max?.[0] ?? null,
        period:   fv(h.wave_period),
        swell:    fv(h.swell_wave_height),
        wind:     fv(h.wind_wave_height),
        current:  fv(h.ocean_current_velocity),
        forecast: dl.wave_height_max?.slice(0, 7) || [],
        dates:    dl.time?.slice(0, 7) || [],
      });
    } catch (e) {
      setErr("Marine data unavailable for this location. The Open-Meteo model covers open ocean and coastal coordinates — inland or polar locations may return no data.");
    }
    setBusy(false);
  };

  const wc = v => v == null ? C.mut : v > 4 ? C.red : v > 2 ? C.amber : C.green;
  const sc = t => t == null ? C.mut : t > 30 ? C.red : t > 28 ? C.amber : t > 25 ? C.green : C.blue;

  const MetCard = ({ label, val, unit, sub, col = C.teal }) => val != null ? (
    <div style={{ padding: 14, background: C.surfHi, borderRadius: 10, border: `1px solid ${C.b}` }}>
      <div style={{ fontSize: 10, color: C.mut, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 800, fontFamily: F.mono, color: col }}>
        {typeof val === "number" ? val.toFixed(1) : val}
        <span style={{ fontSize: 11, fontWeight: 400, color: C.mut, marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 10, color: C.mut, marginTop: 3 }}>{sub}</div>}
    </div>
  ) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <div style={{height:1,width:28,background:`linear-gradient(90deg,transparent,${C.teal})`}}/>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, animation: "pulse 2s infinite", boxShadow: `0 0 10px ${C.teal}` }} />
          <span style={{ fontSize: 9.5, color: C.teal, textTransform: "uppercase", letterSpacing: "0.24em", fontWeight: 600 }}>Live Data</span>
        </div>
        <h2 style={{ fontFamily: F.display, fontSize: "clamp(28px,4vw,42px)", color: C.white, margin: "0 0 8px", fontWeight:700, lineHeight:1.1 }}>Ocean Intelligence Dashboard</h2>
        <p style={{ color: C.sandD, fontSize: 14, lineHeight: 1.75, margin: 0, fontWeight:300, maxWidth:600 }}>
          Search any coastal or ocean location worldwide to retrieve live marine conditions from the Open-Meteo / Copernicus network.
        </p>
      </div>

      {/* Search */}
      <div ref={searchRef} style={{ position: "relative", marginBottom: 14 }}>
        <div style={{ position: "relative" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowDrop(true)}
            placeholder="Search any location — Maldives, Dakar, Great Barrier Reef, Manila Bay, Barbados…"
            style={{
              width: "100%", padding: "13px 48px 13px 18px",
              background: C.surfHi, border: `1px solid ${C.bHi}`,
              borderRadius: 10, color: C.white, fontSize: 14,
              outline: "none", fontFamily: F.sans, boxSizing: "border-box"
            }}
          />
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.mut }}>
            {searching ? "…" : "🔍"}
          </div>
        </div>
        {showDrop && results.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 500,
            background: C.surf, border: `1px solid ${C.b}`, borderRadius: 9,
            marginTop: 4, overflow: "hidden", boxShadow: "0 10px 32px rgba(0,0,0,0.6)"
          }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => pick(r)}
                style={{
                  padding: "11px 16px", cursor: "pointer", fontSize: 13,
                  color: C.sandD, borderBottom: i < results.length - 1 ? `1px solid ${C.b}` : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.surfHi}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div>
                  <strong style={{ color: C.white }}>{r.name}</strong>
                  {r.admin1 && <span style={{ color: C.mut }}> · {r.admin1}</span>}
                  {r.country && <span style={{ color: C.mut }}> · {r.country}</span>}
                </div>
                <span style={{ fontSize: 11, color: C.mutD, flexShrink: 0, marginLeft: 12 }}>
                  {r.latitude?.toFixed(2)}°, {r.longitude?.toFixed(2)}°
                </span>
              </div>
            ))}
          </div>
        )}
        {query.length >= 2 && !searching && results.length === 0 && !showDrop && (
          <div style={{ marginTop: 6, fontSize: 12, color: C.mut, paddingLeft: 4 }}>
            No results found — try a different spelling or a nearby city name.
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ marginBottom: 14 }}>
        <WorldMap lat={selLoc?.latitude ?? null} lon={selLoc?.longitude ?? null} name={selLoc?.label || ""} />
      </div>

      {/* Loading */}
      {busy && (
        <div style={{ ...S.card, textAlign: "center", padding: 28, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: C.mut }}>Fetching live marine data from Open-Meteo / DWD ICON-Wave…</div>
        </div>
      )}

      {/* Error */}
      {err && !busy && (
        <div style={{ ...S.card, borderColor: "rgba(223,92,92,.3)", background: "rgba(223,92,92,.05)", marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: C.red }}>⚠ {err}</div>
        </div>
      )}

      {/* Marine data cards */}
      {marine && !busy && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: C.mut, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Live Conditions · {selLoc?.label}</div>
              <div style={{ fontSize: 10, color: C.mutD }}>Open-Meteo Marine API · DWD ICON-Wave · Copernicus MFWAM</div>
            </div>
            <span style={{ fontSize: 10, color: C.teal, padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.bHi}`, background: C.tealD }}>
              {selLoc?.latitude?.toFixed(2)}°N, {selLoc?.longitude?.toFixed(2)}°E
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 8 }}>
            <MetCard label="Sea Surface Temperature" val={marine.sst} unit="°C"
              sub={marine.sstMax != null ? `Today max ${marine.sstMax?.toFixed(1)}° / min ${marine.sstMin?.toFixed(1)}°` : null}
              col={sc(marine.sst)} />
            <MetCard label="Significant Wave Height" val={marine.wave} unit="m"
              sub={marine.waveMax != null ? `7-day max ${marine.waveMax?.toFixed(1)}m` : null}
              col={wc(marine.wave)} />
            <MetCard label="Wave Period" val={marine.period} unit="s" sub="Time between successive wave crests" col={C.sandD} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
            <MetCard label="Swell Height" val={marine.swell} unit="m" sub="Long-period oceanic swell" col={C.blue} />
            <MetCard label="Wind Wave Height" val={marine.wind} unit="m" sub="Locally generated wind-driven waves" col={C.mut} />
            <MetCard label="Ocean Current Speed" val={marine.current} unit="m/s" sub="Surface current velocity" col={C.green} />
          </div>

          {marine.forecast.length > 0 && (
            <div style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.mut, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                7-Day Wave Height Forecast · DWD ICON-Wave + Copernicus MFWAM
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 70 }}>
                {marine.forecast.map((v, i) => {
                  const mx = Math.max(...marine.forecast.filter(x => x != null && !isNaN(x)), 0.5);
                  const h = v != null ? Math.max(6, (v / mx) * 62) : 6;
                  const col = wc(v);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ fontSize: 9, color: C.mut }}>{v != null ? v.toFixed(1) + "m" : "—"}</div>
                      <div style={{ width: "100%", height: h, borderRadius: "2px 2px 0 0", background: col, opacity: .85 }} />
                      <div style={{ fontSize: 9, color: C.mut }}>{marine.dates[i]?.slice(5) || ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ ...S.card, background: C.tealD, borderColor: C.bHi }}>
            <div style={{ fontSize: 10, color: C.teal, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              NOAA Coral Reef Watch Interpretation · SST Bleaching Threshold 28°C
            </div>
            <div style={{ fontSize: 13, color: C.sand, lineHeight: 1.75 }}>
              {marine.sst != null
                ? marine.sst > 28
                  ? `⚠ SST of ${marine.sst.toFixed(1)}°C exceeds the NOAA CRW bleaching watch threshold of 28°C. Elevated thermal stress and coral bleaching risk. Cross-reference Degree Heating Weeks (DHW) — bleaching likely when DHW > 4°C-weeks, mass bleaching when DHW > 8°C-weeks.`
                  : `SST of ${marine.sst.toFixed(1)}°C is below the NOAA CRW bleaching watch threshold (28°C). No acute thermal stress indicated. Monitor for marine heatwave accumulation — sustained anomalies of +1°C above climatological mean define a marine heatwave event (Hobday et al., 2016).`
                : "Sea surface temperature data not available at this coordinate. The Open-Meteo marine model covers open ocean and coastal points — try a location closer to open water."}
            </div>
          </div>
        </div>
      )}

      {/* Data sources */}
      <div style={{ ...S.card, marginTop: 14 }}>
        <div style={{ fontSize: 10, color: C.mut, textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 11 }}>Open Scientific Data Sources</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {[
            { src: "Open-Meteo Marine API",    desc: "DWD ICON-Wave + Copernicus MFWAM · wave, SST, currents · 28km global / 5km European", col: C.green },
            { src: "Open-Meteo Geocoding",     desc: "Global location search powered by Geonames database · 5M+ named places worldwide",     col: C.teal  },
            { src: "NOAA Coral Reef Watch",    desc: "SST bleaching thresholds & Degree Heating Week products · 5km global satellite",        col: C.amber },
            { src: "Copernicus Marine Service",desc: "CMEMS physical & biogeochemical models · European Space Agency open data",              col: C.blue  },
          ].map((d, i) => (
            <div key={i} style={{ padding: "9px 11px", borderRadius: 7, background: C.surfHi, border: `1px solid ${C.b}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: d.col, marginBottom: 3 }}>{d.src}</div>
              <div style={{ fontSize: 10, color: C.mut, lineHeight: 1.5 }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Screener({onAdd, persona}){
  const [sector,setSector]=useState("");
  const [region,setRegion]=useState("");
  const [results,setResults]=useState(null);
  const [tab,setTab]=useState("overview");
  const p=PERSONAS.find(x=>x.id===persona);

  const run=()=>{
    if(sector&&region){ setResults(RISK_DATA[sector][region]); setTab("overview"); }
  };
  const reset=()=>{ setSector(""); setRegion(""); setResults(null); };
  const total=results?avg(results):0;
  const {l:rl,c:rc}=risk(total);

  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <div style={{height:1,width:28,background:`linear-gradient(90deg,transparent,${C.teal})`}}/>
          <span style={{fontSize:9.5,color:C.teal,textTransform:"uppercase",letterSpacing:"0.24em",fontWeight:600}}>Five-Dimension Assessment</span>
        </div>
        <h2 style={{fontFamily:F.display,fontSize:"clamp(28px,4vw,42px)",color:C.white,margin:"0 0 8px",fontWeight:400,lineHeight:1.1}}>Ocean Risk Screener</h2>
        <p style={{color:C.sandD,fontSize:14,lineHeight:1.75,margin:"0 0 14px",fontWeight:300,maxWidth:640}}>
          Five-dimension marine risk assessment calibrated against WorldRiskIndex 2023, IPCC AR6 WG2 regional projections, TNFD sector materiality weighting, and ENCORE ecosystem-sector dependency mapping.
        </p>
        {p&&<Pill color={p.color}>{p.icon} Viewing as: {p.label} · {p.kpis[0]}</Pill>}
      </div>

      {/* Methodology transparency card */}
      <div style={{...S.card,marginBottom:20,borderColor:"rgba(201,168,76,0.2)",background:"linear-gradient(135deg,rgba(201,168,76,0.05),rgba(6,21,32,0.9))"}}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{fontSize:18,flexShrink:0,marginTop:1}}>🔬</div>
          <div>
            <div style={{fontSize:11,color:C.gold,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:7}}>Scoring Methodology — Transparency Note</div>
            <div style={{fontSize:12,color:C.sandD,lineHeight:1.75,fontWeight:300}}>
              Risk scores (0–100) are <strong style={{color:C.sand}}>expert-calibrated indicative values</strong>, not live computed indices. Each dimension score is derived from cross-referencing four published frameworks:
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
              {[
                {n:"WorldRiskIndex 2023 (UNU-EHS/UNDRR)",d:"Exposure × vulnerability weighting by region and hazard type"},
                {n:"IPCC AR6 WG2 — Regional Risk Chapters",d:"Physical risk projections under SSP2-4.5 by ocean region and sector"},
                {n:"TNFD LEAP Sector Materiality Table v1.1",d:"Relative priority of nature-related risks by sector and biome"},
                {n:"ENCORE Tool (UNEP-WCMC / NHB)",d:"Sector dependency scores on specific marine ecosystem services"},
              ].map((m,i)=>(
                <div key={i} style={{padding:"8px 11px",background:"rgba(255,255,255,0.03)",borderRadius:7,border:`1px solid ${C.b}`}}>
                  <div style={{fontSize:10.5,fontWeight:600,color:C.gold,marginBottom:2}}>{m.n}</div>
                  <div style={{fontSize:10,color:C.mut,lineHeight:1.5}}>{m.d}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.mutD,marginTop:9,fontStyle:"italic"}}>
              The Project Scorer uses AI-generated assessment (Claude Sonnet) and is disclosed as such. For live quantitative indices, see: WorldRiskIndex, INFORM, or country-level IPCC AR6 national assessments.
            </div>
          </div>
        </div>
      </div>

      {!results ? (
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={S.card}>
            <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:F.mono,color:C.teal}}>01</span> Select Sector
              <div style={{flex:1,height:1,background:C.b}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
              {SECTORS.map(s=>(
                <button key={s.id} onClick={()=>setSector(s.id)}
                  style={{padding:"13px 10px",borderRadius:9,cursor:"pointer",textAlign:"center",
                    border:`1px solid ${sector===s.id?C.bHi:C.b}`,
                    background:sector===s.id?C.tealD:"rgba(255,255,255,0.02)",
                    color:sector===s.id?C.teal:C.sandD,fontSize:12,fontWeight:sector===s.id?700:400}}>
                  <div style={{fontSize:22,marginBottom:5}}>{s.icon}</div>{s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={S.card}>
            <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:F.mono,color:C.teal}}>02</span> Select Region
              <div style={{flex:1,height:1,background:C.b}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {REGIONS.map(r=>(
                <button key={r.id} onClick={()=>setRegion(r.id)}
                  style={{padding:"11px 8px",borderRadius:8,cursor:"pointer",textAlign:"center",
                    border:`1px solid ${region===r.id?C.bHi:C.b}`,
                    background:region===r.id?C.tealD:"rgba(255,255,255,0.02)",
                    color:region===r.id?C.teal:C.sandD,fontSize:12,fontWeight:region===r.id?700:400}}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={run} disabled={!sector||!region}>
            {sector&&region?`${p?.cta||"Generate Risk Profile"} →`:"Select sector & region to continue"}
          </Btn>
        </div>
      ) : (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
            <div>
              <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>
                {SECTORS.find(s=>s.id===sector)?.label} · {REGIONS.find(r=>r.id===region)?.label}
              </div>
              <h3 style={{fontFamily:F.display,fontSize:22,color:C.white,margin:0}}>Risk Assessment</h3>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:38,fontWeight:900,fontFamily:F.mono,color:rc,textShadow:`0 0 16px ${rc}`}}>
                <AnimNum to={total}/><span style={{fontSize:13}}>/100</span>
              </div>
              <div style={{fontSize:11,color:rc,fontWeight:700}}>{rl} Exposure</div>
            </div>
          </div>

          <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:`1px solid ${C.b}`}}>
            {["overview","intelligence"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{padding:"9px 16px",fontSize:11,fontWeight:tab===t?700:400,
                  color:tab===t?C.teal:C.mut,background:"none",border:"none",
                  borderBottom:tab===t?`2px solid ${C.teal}`:"2px solid transparent",
                  cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.09em"}}>
                {t==="overview"?"Overview":"Deep Intelligence"}
              </button>
            ))}
          </div>

          {tab==="overview"&&(
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:18,paddingTop:4,marginBottom:22}}>
                {Object.entries(results).map(([k,v])=><Gauge key={k} score={v} label={DIMS[k]?.name||k}/>)}
              </div>
              {p&&(
                <div style={{padding:"13px 15px",background:C.surfHi,borderRadius:9,border:`1px solid ${C.b}`,marginBottom:14}}>
                  <div style={{fontSize:10,color:p.color,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:700}}>Key Metrics for {p.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {p.kpis.map((k,i)=><Pill key={i} color={p.color}>{k}</Pill>)}
                  </div>
                </div>
              )}
              <div style={{padding:"13px 15px",background:C.tealD,borderRadius:9,border:`1px solid ${C.bHi}`,marginBottom:14}}>
                <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Key Finding</div>
                <div style={{fontSize:13,color:C.sand,lineHeight:1.7}}>
                  {(()=>{
                    const top=Object.entries(results).sort((a,b)=>b[1]-a[1])[0];
                    const dim=DIMS[top[0]];
                    return `Highest exposure: ${dim?.name} (${top[1]}/100 — ${risk(top[1]).l}). ${dim?.persona[persona]?.split(".")[0]}.`;
                  })()}
                </div>
              </div>
              <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                <Btn onClick={()=>setTab("intelligence")} variant="outline">View Deep Intelligence →</Btn>
                <Btn onClick={()=>onAdd({type:"risk",id:Date.now(),sector:SECTORS.find(s=>s.id===sector)?.label,region:REGIONS.find(r=>r.id===region)?.label,score:total,rating:rl})} variant="ghost">+ Add to Pipeline</Btn>
                <Btn onClick={reset} variant="ghost">← New</Btn>
              </div>
            </div>
          )}

          {tab==="intelligence"&&(
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div style={{padding:"11px 15px",background:C.tealD,borderRadius:9,border:`1px solid ${C.bHi}`,marginBottom:4}}>
                <div style={{fontSize:12,color:C.sand,lineHeight:1.6}}>
                  <span style={{color:C.teal,fontWeight:700}}>Expand each dimension</span> to see risk drivers, scientific & regulatory frameworks, data sources, and what this means for <strong style={{color:C.white}}>{p?.label}</strong>.
                </div>
              </div>
              {Object.entries(results).map(([k,v])=><DimCard key={k} dimKey={k} score={v} personaId={persona}/>)}
              <div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:4}}>
                <Btn onClick={()=>onAdd({type:"risk",id:Date.now(),sector:SECTORS.find(s=>s.id===sector)?.label,region:REGIONS.find(r=>r.id===region)?.label,score:total,rating:rl})} variant="outline">+ Add to Pipeline</Btn>
                <Btn onClick={reset} variant="ghost">← New Screening</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PROJECT SCORER ────────────────────────────────────────────────────────────
function Scorer({onAdd, persona}){
  const init={name:"",location:"",ecosystem:"",intervention:"",budget:"",duration:"",org:"",partners:"",notes:""};
  const [form,setForm]=useState(init);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState(null);
  const [err,setErr]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const ready=form.name&&form.location&&form.ecosystem&&form.intervention&&form.budget;
  const p=PERSONAS.find(x=>x.id===persona);

  const generate=async()=>{
    setBusy(true); setErr(null); setResult(null);
    const prompt=`You are a senior marine finance expert. Evaluate this project from the perspective of a ${p?.label} professional.

Project details:
- Name: ${form.name}
- Location: ${form.location}
- Ecosystem: ${form.ecosystem}
- Intervention type: ${form.intervention}
- Budget: ${form.budget}
- Duration: ${form.duration||"Not specified"}
- Organisation: ${form.org||"Not specified"}
- Partners: ${form.partners||"Not specified"}
- Additional context: ${form.notes||"None"}

Evaluator perspective: ${p?.label} — focused on ${p?.kpis?.join(", ")}
Language register: ${p?.lang}

Respond ONLY with valid JSON — no markdown fences, no preamble:
{"score":<integer 0-100>,"rating":"Strong|Promising|Conditional|Weak","headline":"<one sentence recommendation in ${p?.lang} language, under 20 words>","gbf_targets":["Target 2","Target 3"],"sdg_indicators":["SDG 14.2","SDG 14.4"],"tnfd_alignment":"High|Medium|Low","blended_finance_readiness":<integer 0-100>,"recommended_mechanisms":["mechanism 1","mechanism 2","mechanism 3"],"strengths":["strength 1","strength 2","strength 3"],"risk_flags":["flag 1","flag 2","flag 3"],"memo":"<Two paragraphs, ~130 words total. Written for a ${p?.label} decision-maker using ${p?.lang} terminology. Paragraph 1: assess the project. Paragraph 2: recommendation and next steps. Separate paragraphs with a blank line.>"}`;

    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
      });
      const d=await r.json();
      const raw=(d.content||[]).map(b=>b.text||"").join("").trim().replace(/^```json\s*/,"").replace(/```\s*$/,"").trim();
      setResult(JSON.parse(raw));
    }catch(e){
      setErr("Scoring failed. Please try again.");
      console.error(e);
    }
    setBusy(false);
  };

  const reset=()=>{ setForm(init); setResult(null); setErr(null); };

  if(result){
    const sc=result.score>=75?C.green:result.score>=55?C.teal:result.score>=40?C.amber:C.red;
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>Due Diligence · {p?.label}</div>
            <h3 style={{fontFamily:F.display,fontSize:22,color:C.white,margin:"0 0 4px"}}>{form.name}</h3>
            <div style={{fontSize:12,color:C.mut}}>{form.ecosystem} · {form.location}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:38,fontWeight:900,fontFamily:F.mono,color:sc,textShadow:`0 0 16px ${sc}60`}}><AnimNum to={result.score}/><span style={{fontSize:13}}>/100</span></div>
            <div style={{fontSize:12,color:sc,fontWeight:700}}>{result.rating}</div>
          </div>
        </div>

        <div style={{...S.card,background:C.tealD,borderColor:C.bHi,marginBottom:11}}>
          <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Recommendation · {p?.label}</div>
          <div style={{fontSize:15,color:C.white,fontFamily:F.serif,lineHeight:1.5,fontStyle:"italic"}}>"{result.headline}"</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
          <div style={S.card}>
            <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:11}}>Framework Alignment · GBF · SDG 14 · TNFD</div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:C.mut,marginBottom:5}}>Kunming-Montreal GBF (2022)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {result.gbf_targets?.map(t=><Pill key={t} color={C.teal}>{t}</Pill>)}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:C.mut,marginBottom:5}}>SDG 14 — Life Below Water</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {result.sdg_indicators?.map(t=><Pill key={t} color={C.green}>{t}</Pill>)}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${C.b}`}}>
              <span style={{fontSize:11,color:C.mut}}>TNFD LEAP Alignment</span>
              <span style={{fontSize:11,fontWeight:700,color:result.tnfd_alignment==="High"?C.green:result.tnfd_alignment==="Medium"?C.amber:C.mut}}>{result.tnfd_alignment}</span>
            </div>
          </div>
          <div style={S.card}>
            <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:11}}>Blended Finance Pathway</div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:C.mut}}>Readiness Score</span>
                <span style={{fontSize:13,fontWeight:800,fontFamily:F.mono,color:C.teal}}>{result.blended_finance_readiness}/100</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${result.blended_finance_readiness}%`,background:`linear-gradient(90deg,${C.teal},#267a68)`,borderRadius:3}}/>
              </div>
            </div>
            {result.recommended_mechanisms?.map((m,i)=>(
              <div key={i} style={{fontSize:11,color:C.sandD,padding:"5px 0",borderBottom:`1px solid ${C.b}`,display:"flex",gap:7,alignItems:"center"}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.teal,flexShrink:0}}/>{m}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
          <div style={S.card}>
            <div style={{fontSize:10,color:C.green,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:9}}>Strengths</div>
            {result.strengths?.map((s,i)=>(
              <div key={i} style={{fontSize:12,color:C.sandD,padding:"5px 0",borderBottom:`1px solid ${C.b}`,display:"flex",gap:8}}>
                <span style={{color:C.green,flexShrink:0}}>✓</span>{s}
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{fontSize:10,color:C.amber,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:9}}>Risk Flags</div>
            {result.risk_flags?.map((r,i)=>(
              <div key={i} style={{fontSize:12,color:C.sandD,padding:"5px 0",borderBottom:`1px solid ${C.b}`,display:"flex",gap:8}}>
                <span style={{color:C.amber,flexShrink:0}}>⚠</span>{r}
              </div>
            ))}
          </div>
        </div>

        <div style={{...S.card,marginBottom:11}}>
          <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:11}}>Assessment Memo · {p?.label} · AI-Assisted</div>
          {result.memo?.split(/\n\n+/).filter(Boolean).map((para,i)=>(
            <p key={i} style={{fontSize:13,color:C.sandD,lineHeight:1.8,margin:"0 0 12px"}}>{para}</p>
          ))}
        </div>
        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
          <Btn onClick={()=>onAdd({type:"project",id:Date.now(),name:form.name,location:form.location,ecosystem:form.ecosystem,score:result.score,rating:result.rating,tnfd:result.tnfd_alignment,bf:result.blended_finance_readiness})} variant="outline">+ Add to Pipeline</Btn>
          <Btn onClick={reset} variant="ghost">← Score Another</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <div style={{height:1,width:28,background:`linear-gradient(90deg,transparent,${C.teal})`}}/>
          <span style={{fontSize:9.5,color:C.teal,textTransform:"uppercase",letterSpacing:"0.24em",fontWeight:600}}>AI-Assisted Due Diligence</span>
        </div>
        <h2 style={{fontFamily:F.display,fontSize:"clamp(28px,4vw,42px)",color:C.white,margin:"0 0 8px",fontWeight:400,lineHeight:1.1}}>Project Due Diligence Scorer</h2>
        <p style={{color:C.sandD,fontSize:14,lineHeight:1.75,margin:"0 0 14px",fontWeight:300,maxWidth:640}}>
          AI-assisted assessment outputs GBF alignment, TNFD LEAP scoring, blended finance readiness, and a decision memo in your role's language.
        </p>
        {p&&<Pill color={p.color}>{p.icon} Memo framed for: {p.label}</Pill>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={S.card}>
          <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:F.mono,color:C.teal}}>01</span> Project Identity
            <div style={{flex:1,height:1,background:C.b}}/>
          </div>
          <Inp label="Project Name" value={form.name} onChange={v=>set("name",v)} placeholder="e.g. Coral Reef Restoration — Bali"/>
          <Inp label="Location / Geography" value={form.location} onChange={v=>set("location",v)} placeholder="Country, region, or specific site"/>
          <Inp label="Implementing Organisation" value={form.org} onChange={v=>set("org",v)} placeholder="Lead NGO, enterprise, or institution"/>
          <Inp label="Key Partners" value={form.partners} onChange={v=>set("partners",v)} placeholder="Co-funders, scientific partners, government"/>
        </div>
        <div style={S.card}>
          <div style={{fontSize:11,color:C.mut,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:F.mono,color:C.teal}}>02</span> Project Design
            <div style={{flex:1,height:1,background:C.b}}/>
          </div>
          <Sel label="Ecosystem Type" value={form.ecosystem} onChange={v=>set("ecosystem",v)} options={ECOSYSTEMS}/>
          <Sel label="Intervention Type" value={form.intervention} onChange={v=>set("intervention",v)} options={INTERVENTIONS}/>
          <Sel label="Total Budget" value={form.budget} onChange={v=>set("budget",v)} options={BUDGETS}/>
          <Sel label="Project Duration" value={form.duration} onChange={v=>set("duration",v)} options={DURATIONS}/>
          <Inp label="Additional Context" value={form.notes} onChange={v=>set("notes",v)} placeholder="Theory of change, monitoring approach, co-benefits…" multiline/>
        </div>
      </div>
      {err&&<div style={{padding:"12px 16px",background:"rgba(223,92,92,.08)",border:"1px solid rgba(223,92,92,.3)",borderRadius:8,color:C.red,fontSize:13,marginBottom:12}}>{err}</div>}
      <Btn onClick={generate} disabled={!ready||busy}>
        {busy?"Generating Assessment…":ready?"Generate Due Diligence Report →":"Complete required fields to continue"}
      </Btn>
    </div>
  );
}

// ── PIPELINE ──────────────────────────────────────────────────────────────────
function Pipeline({items, onClear}){
  if(!items.length) return (
    <div>
      <h2 style={{fontFamily:F.display,fontSize:27,color:C.white,margin:"0 0 8px"}}>Project Pipeline</h2>
      <p style={{color:C.mut,fontSize:14,lineHeight:1.6,marginBottom:32}}>Add risk screenings and project assessments to track and compare across your portfolio.</p>
      <div style={{...S.card,textAlign:"center",padding:56}}>
        <div style={{fontSize:36,marginBottom:12}}>🌊</div>
        <div style={{fontSize:14,color:C.mut}}>No items yet — run a risk screening or score a project to get started.</div>
      </div>
    </div>
  );
  const sorted=[...items].sort((a,b)=>b.score-a.score);
  const avgScore=Math.round(items.reduce((a,b)=>a+b.score,0)/items.length);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <h2 style={{fontFamily:F.display,fontSize:27,color:C.white,margin:"0 0 5px"}}>Project Pipeline</h2>
          <p style={{color:C.mut,fontSize:14,margin:0}}>{items.length} item{items.length!==1?"s":""} tracked</p>
        </div>
        <Btn onClick={onClear} variant="ghost" small>Clear All</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:16}}>
        {[{l:"Avg Score",v:`${avgScore}/100`},{l:"Projects",v:items.filter(i=>i.type==="project").length},{l:"Screenings",v:items.filter(i=>i.type==="risk").length}].map(s=>(
          <div key={s.l} style={{...S.card,textAlign:"center",padding:"13px 10px"}}>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.mono,color:C.teal,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:10,color:C.mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sorted.map((item,idx)=>{
          const {c}=risk(item.score);
          return (
            <div key={item.id} style={{...S.card,display:"flex",alignItems:"center",gap:13,padding:"13px 18px"}}>
              <div style={{fontSize:11,fontFamily:F.mono,color:C.mutD,width:18,textAlign:"center"}}>{idx+1}</div>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${c}15`,display:"flex",
                alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${c}35`}}>
                <span style={{fontSize:13,fontWeight:800,fontFamily:F.mono,color:c}}>{item.score}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:C.white,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {item.type==="project"?item.name:`${item.sector} — ${item.region}`}
                </div>
                <div style={{fontSize:11,color:C.mut}}>
                  {item.type==="project"?`${item.ecosystem} · ${item.location}`:"Sector Risk Screening"}
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <Pill color={c}>{item.rating}</Pill>
                <Pill color={C.mut}>{item.type==="project"?"Project":"Risk Screen"}</Pill>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App(){
  const [persona,setPersona]=useState(null);
  const [page,setPage]=useState("live");
  const [pipe,setPipe]=useState([]);
  const addToPipe=useCallback(item=>setPipe(p=>[...p,item]),[]);

  if(!persona) return <PersonaSelect onSelect={setPersona}/>;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.sans,color:C.white}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Lora:ital,wght@1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(3.5);opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        body{background:#081C28}
        input,textarea,select{font-family:'Inter',system-ui,sans-serif}
        input::placeholder,textarea::placeholder{color:rgba(245,237,224,.18)}
        select option{background:#0c2535;color:#f5ede0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(43,181,165,.22);border-radius:2px}
      `}</style>
      {/* Ocean background for data pages */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse 65% 50% at 5% 10%,rgba(0,70,100,.5) 0%,transparent 60%)," +
          "radial-gradient(ellipse 50% 40% at 95% 88%,rgba(0,90,70,.28) 0%,transparent 55%)"}}/>
      <Nav page={page} setPage={setPage} pipeCount={pipe.length} persona={persona} resetPersona={()=>setPersona(null)}/>
      <main style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"44px 32px 100px"}}>
        {page==="live"  && <LiveIntel/>}
        {page==="screen"&& <Screener onAdd={addToPipe} persona={persona}/>}
        {page==="score" && <Scorer   onAdd={addToPipe} persona={persona}/>}
        {page==="pipe"  && <Pipeline items={pipe} onClear={()=>setPipe([])}/>}
      </main>
      <footer style={{position:"relative",zIndex:1,borderTop:`1px solid ${C.b}`,padding:"20px 32px",
        maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:F.display,fontSize:12,fontStyle:"normal",color:C.mutD,letterSpacing:"-0.01em",fontWeight:600}}>Tidemark</span>
        <span style={{fontFamily:F.sans,fontSize:9,color:C.mutD,letterSpacing:"0.1em",textTransform:"uppercase"}}>IPCC · IPBES · GBF · TNFD · NOAA · Copernicus · GEBCO · FAO · UNEP-WCMC</span>
      </footer>
    </div>
  );
}
