import { useState, useEffect, useCallback, useRef } from "react";

// ─── LEAFLET LOADER ───────────────────────────────────────────────────────────
const loadLeaflet = () => new Promise((res) => {
  if (window.L) return res(window.L);
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
  document.head.appendChild(css);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
  s.onload = () => res(window.L);
  document.head.appendChild(s);
});

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:"#060d12", surface:"#0b1720", surfaceHi:"#101e2a",
  border:"rgba(255,255,255,0.07)", borderHi:"rgba(52,183,152,0.42)",
  teal:"#34b798", tealDim:"rgba(52,183,152,0.11)", tealGlow:"rgba(52,183,152,0.22)",
  sand:"#e8dfc8", sandDim:"rgba(232,223,200,0.62)",
  white:"#eeeae2", muted:"rgba(238,234,226,0.38)", mutedSm:"rgba(238,234,226,0.18)",
  red:"#df5c5c", amber:"#df9e3a", green:"#3fbe77", blue:"#5a9fe0",
  purple:"#9b7ee8",
};
const F = {
  display:"'Georgia','Times New Roman',serif",
  body:"'DM Sans','Segoe UI',sans-serif",
  mono:"'JetBrains Mono','Courier New',monospace",
};

// ─── PERSONA DEFINITIONS ──────────────────────────────────────────────────────
const PERSONAS = [
  {
    id:"insurer", label:"Insurance & Reinsurance",
    icon:"🛡️", color:C.blue,
    tagline:"Underwriting exposure, catastrophe modelling, and nature-related liability",
    emphasis:["Coastal Flood","Physical Climate","Regulatory"],
    kpis:["Probable Maximum Loss (PML)","Annual Average Loss (AAL)","Combined Ratio Impact","NatCat Reserve Adequacy"],
    language:"underwriting",
    cta:"View Underwriting Exposure",
  },
  {
    id:"dfi", label:"Development Finance",
    icon:"🏦", color:C.purple,
    tagline:"Blended finance structures, concessional capital, and SDG-aligned portfolio risk",
    emphasis:["Supply Chain","Regulatory","Physical Climate"],
    kpis:["Portfolio at Risk (PaR)","Blended Finance Readiness","SDG Additionality Score","First-Loss Tranche Sizing"],
    language:"investment",
    cta:"View Portfolio Risk",
  },
  {
    id:"foundation", label:"Philanthropic Foundation",
    icon:"🌱", color:C.green,
    tagline:"Grant due diligence, framework alignment, and resilience investment strategy",
    emphasis:["Biodiversity","Coastal Flood","Regulatory"],
    kpis:["Theory of Change Robustness","GBF Target Alignment","Co-funding Leverage Ratio","Impact Permanence Score"],
    language:"grantmaking",
    cta:"View Funding Landscape",
  },
  {
    id:"port", label:"Port & Infrastructure",
    icon:"⚓", color:C.amber,
    tagline:"Asset vulnerability, operational continuity, and coastal infrastructure resilience",
    emphasis:["Coastal Flood","Physical Climate","Supply Chain"],
    kpis:["Days Disrupted per Year","Asset Stranding Risk","Adaptation CAPEX Estimate","Critical Threshold Exceedance"],
    language:"operations",
    cta:"View Asset Exposure",
  },
  {
    id:"corporate", label:"Corporate Sustainability",
    icon:"🏢", color:C.teal,
    tagline:"CSRD/TNFD disclosure, nature dependency mapping, and value chain risk",
    emphasis:["Biodiversity","Supply Chain","Regulatory"],
    kpis:["TNFD LEAP Exposure Score","CSRD ESRS E3/E4 Gap","Scope 3 Nature Dependency","Biodiversity Footprint Index"],
    language:"disclosure",
    cta:"View Disclosure Exposure",
  },
  {
    id:"government", label:"Policy & Government",
    icon:"🏛️", color:"#e06090",
    tagline:"Coastal adaptation planning, ecosystem service valuation, and regulatory design",
    emphasis:["Biodiversity","Coastal Flood","Physical Climate"],
    kpis:["Ecosystem Service Value at Risk","Coastal Population Exposed","Adaptation Finance Gap","Policy Alignment Score"],
    language:"policy",
    cta:"View Policy Risk Landscape",
  },
];

// ─── RISK DIMENSION INTELLIGENCE ──────────────────────────────────────────────
const DIMENSION_INTEL = {
  cf: {
    name:"Coastal Flood Risk",
    icon:"🌊",
    definition:"Exposure to sea-level rise, storm surge, and extreme coastal flooding events that inundate assets, displace populations, and damage infrastructure.",
    drivers:[
      "Sea-level rise acceleration: IPCC AR6 projects a median of 0.44–0.76m rise by 2100 under SSP2-4.5, with low-probability high-impact scenarios exceeding 1m.",
      "Tropical cyclone intensification: Warming oceans are strengthening peak cyclone intensity by 1–10% per degree of warming (Knutson et al., 2020).",
      "Land subsidence compounding: Many delta and coastal cities are sinking at 2–10cm/year due to groundwater extraction, amplifying flood exposure beyond climate projections.",
      "Storm surge nonlinearity: A 10cm rise in mean sea level can translate into 2–3× greater frequency of extreme surge events exceeding historical thresholds.",
    ],
    frameworks:[
      {name:"IPCC AR6 WG2 Ch.15", type:"Science", desc:"Authoritative sea-level rise projections and coastal flood risk assessment framework"},
      {name:"TNFD LEAP v1.1", type:"Disclosure", desc:"Locate, Evaluate, Assess, Prepare — physical risk identification for nature-related disclosures"},
      {name:"WorldRiskIndex 2023", type:"Index", desc:"UNU-EHS composite index of exposure and vulnerability for 193 countries"},
      {name:"NOAA Technical Report 2022", type:"Data", desc:"U.S. interagency sea-level rise scenarios; widely applied globally for infrastructure planning"},
    ],
    data_sources:[
      "NASA/CNES TOPEX-Poseidon & Jason satellite altimetry (1993–present)",
      "NOAA CO-OPS tidal gauge network (global, 200+ stations)",
      "EU Copernicus Land Monitoring Service (CLMS) coastal change datasets",
      "GEBCO 2025 bathymetry — UNESCO/IHO/Seabed 2030",
    ],
    by_persona:{
      insurer:"Drives Probable Maximum Loss (PML) in coastal property lines. Flood zones are repricing 10–15% annually in high-exposure markets. Parametric trigger products tied to sea-level thresholds are growing fastest.",
      dfi:"First-loss tranche sizing for coastal infrastructure loans must account for asset life exceeding 20 years, where SLR exposure is material. IFC Performance Standard 6 requires physical climate risk disclosure.",
      foundation:"Most fundable interventions: nature-based coastal protection (mangroves, oyster reefs) delivering 50–70% wave energy reduction at <10% cost of hard infrastructure. GBF Target 11 coverage of coastal ecosystems is key leverage.",
      port:"Port infrastructure designed to 1-in-100 year return periods will experience 1-in-10 year events by 2050 under SSP2-4.5. Operational disruption modelling requires site-specific storm surge scenarios.",
      corporate:"CSRD ESRS E1-7 requires disclosure of physical climate risks to own operations. Value chain flood exposure requires Scope 3 supplier mapping to coastal geographies.",
      government:"Coastal adaptation financing gap estimated at $50–100B/year globally (GCA, 2023). Nature-based solutions deliver 2–10x higher benefit-cost ratios than engineered alternatives at scale.",
    },
  },
  bio: {
    name:"Biodiversity Loss Risk",
    icon:"🐠",
    definition:"Exposure to ecosystem degradation, species loss, and decline in marine natural capital that underpins fisheries, coastal protection, pharmaceuticals, and tourism.",
    drivers:[
      "Ocean warming: SST increases of 1–3°C above pre-industrial levels are bleaching 50–70% of surveyed coral reefs globally (GCRMN, 2022).",
      "Ocean acidification: pH has dropped 0.1 units since industrialisation — a 26% increase in acidity — dissolving calcifier shells and disrupting marine food webs.",
      "Overfishing: 35.4% of global fish stocks are fished at biologically unsustainable levels (FAO, 2022), with cascading ecosystem effects.",
      "Coastal habitat destruction: Mangroves lost at 0.3–0.6%/year; seagrass meadows declining at 7%/year — both critical carbon sinks and nursery habitats.",
      "Marine plastic pollution: 8–12 million metric tons of plastic enter the ocean annually, with microplastics detected in >800 marine species.",
    ],
    frameworks:[
      {name:"Kunming-Montreal GBF (2022)", type:"Policy", desc:"30×30 target, ecosystem restoration targets, and biodiversity impact disclosure requirements"},
      {name:"IPBES Global Assessment 2019", type:"Science", desc:"IPCC-equivalent body for biodiversity; defines key drivers and planetary boundary thresholds"},
      {name:"TNFD LEAP v1.1", type:"Disclosure", desc:"Nature-related financial disclosure framework — dependencies, impacts, risks, and opportunities"},
      {name:"ENCORE Tool (UNEP-WCMC / NHB)", type:"Analytics", desc:"Exploring Natural Capital Opportunities, Risks and Exposure — sector-ecosystem dependency mapping"},
    ],
    data_sources:[
      "IUCN Red List of Threatened Species (global, 157,000+ species assessed)",
      "UNEP-WCMC Ocean+ database (MPAs, mangroves, coral reefs, seagrass)",
      "Global Coral Reef Monitoring Network (GCRMN) — 12,000+ survey sites",
      "Global Fishing Watch (GFW) — AIS vessel tracking and fishing pressure layers",
      "GBIF Ocean — 100M+ marine species occurrence records",
    ],
    by_persona:{
      insurer:"Ecosystem degradation increases insured losses: coral reef loss alone removes $4B/year in coastal protection value (Beck et al., 2018). Liability exposure for nature-related harms is an emerging but fast-growing line.",
      dfi:"Nature dependency is now an IFC/World Bank material risk category. Projects with high biodiversity footprint require impact mitigation hierarchy compliance under IFC PS6 and EBRD PR6.",
      foundation:"Core grant territory. GBF Target 3 (30×30), Target 14 (ecosystem services), and Target 2 (degraded ecosystem restoration) are the primary alignment levers. Marine ecosystem grants are underfunded relative to terrestrial.",
      port:"Dredging, vessel strikes, antifouling biocides, and invasive species from ballast water are key port-specific biodiversity pressures. EU Biodiversity Strategy 2030 requires restoration obligations for degraded marine habitats.",
      corporate:"CSRD ESRS E4 mandates disclosure of biodiversity impacts and dependencies. TNFD LEAP Evaluate step requires sector-specific nature dependency and impact assessment using ENCORE or equivalent.",
      government:"Ocean biodiversity is an unpriced public good. Blue carbon valuation ($120–280/tonne CO₂ for mangroves) and ecosystem service accounting (SEEA Ocean) provide tools for regulatory incentive design.",
    },
  },
  reg: {
    name:"Regulatory & Transition Risk",
    icon:"⚖️",
    definition:"Exposure to policy shifts, mandatory disclosure requirements, legal liability, and market repricing driven by ocean and biodiversity regulation.",
    drivers:[
      "EU CSRD & ESRS E3/E4: Mandatory nature-related disclosure for 50,000+ EU companies from 2024–2028 — the largest disclosure expansion in history.",
      "TNFD adoption acceleration: 400+ financial institutions (>$4T AUM) have committed to TNFD-aligned disclosures as of 2024.",
      "Kunming-Montreal GBF implementation: 196 nations committed to 30×30 ocean protection by 2030, triggering national marine spatial planning and use restrictions.",
      "Carbon border adjustments: EU CBAM and equivalent instruments are beginning to price embedded biodiversity and water impacts, not just carbon.",
      "Litigation risk: Over 230 climate and nature-related legal cases filed against governments and companies in 2023 alone (Sabin Center).",
    ],
    frameworks:[
      {name:"EU CSRD / ESRS E3-E4 (2024)", type:"Regulation", desc:"Corporate Sustainability Reporting Directive — mandatory nature and water disclosure"},
      {name:"TNFD Final Recommendations v1.1", type:"Disclosure", desc:"Taskforce on Nature-related Financial Disclosures — TCFD-equivalent for nature"},
      {name:"GBF Global Biodiversity Framework", type:"Policy", desc:"Kunming-Montreal 2022 — 23 targets including 30×30 and harmful subsidy reform"},
      {name:"EU Taxonomy Regulation", type:"Regulation", desc:"Do No Significant Harm (DNSH) criteria include marine ecosystem impact thresholds"},
    ],
    data_sources:[
      "Sabin Center Climate Litigation Database (global)",
      "UNEP Finance Initiative — Principles for Responsible Banking nature modules",
      "World Bank Regulatory Indicators for Sustainable Energy (RISE) — adapted for ocean",
      "Ocean Health Index (OHI) — annual country-level ocean governance scores",
    ],
    by_persona:{
      insurer:"D&O exposure growing as boards face liability for inadequate nature risk disclosure. Lloyd's Market Association has issued guidance on biodiversity in risk models. Regulatory capital treatment of nature-exposed assets under review at PRA/ECB.",
      dfi:"Multilateral development bank Environmental and Social Standards increasingly require TNFD-aligned nature risk assessment. Green bond frameworks are adding biodiversity covenants. MDB joint paper (2023) commits to nature mainstreaming.",
      foundation:"Regulatory change creates the 'policy tailwind' that makes funded interventions viable at scale. Focus grantmaking on capacity building for TNFD/CSRD compliance in high-exposure sectors can leverage 10–100x private capital.",
      port:"IMO 2030/2050 decarbonisation targets, ballast water conventions, and EU maritime spatial planning directives create material compliance CAPEX. Early engagement with regulators reduces stranded asset risk.",
      corporate:"Disclosure gap is the primary risk. Companies with >500 employees in EU, or listed on EU markets, face mandatory ESRS E3/E4 reporting by 2026. Non-compliance carries financial penalties and reputational exposure.",
      government:"Policy design opportunity: reforming harmful ocean subsidies (estimated $22B/year globally per OECD) and establishing blue carbon credit frameworks can unlock $50–100B/year in private conservation finance.",
    },
  },
  sc: {
    name:"Supply Chain & Dependency Risk",
    icon:"🔗",
    definition:"Exposure arising from dependence on ocean ecosystems and marine services within value chains — including fisheries, shipping lanes, coastal processing, and marine ingredient sourcing.",
    drivers:[
      "Fisheries collapse: 1.2 billion people depend on seafood as their primary protein source; stock collapse risk affects $150B+ in annual fish trade.",
      "Shipping concentration: 80% of global trade by volume moves by sea; 15% transits straits with material coastal flood or cyclone exposure.",
      "Marine ingredient dependencies: Pharma, cosmetics, food, and aquaculture sectors have unquantified dependencies on wild marine species.",
      "Climate-driven range shifts: Fish stocks are moving poleward at 70km/decade (Poloczanska et al., 2016), destabilising established fisheries agreements and supply contracts.",
      "Desalination and cooling water: Coastal industrial sites dependent on ocean water intake face compound risk from warming, algal blooms, and reduced dissolved oxygen.",
    ],
    frameworks:[
      {name:"TNFD LEAP v1.1 — Locate & Evaluate", type:"Disclosure", desc:"Value chain mapping against biomes and identification of nature-sensitive areas"},
      {name:"ENCORE Tool (UNEP-WCMC)", type:"Analytics", desc:"Industry-level mapping of natural capital dependencies and ecosystem service reliance"},
      {name:"FAO FishStat Database", type:"Data", desc:"Global capture and aquaculture production statistics — 1950 to present"},
      {name:"UNCTAD Maritime Transport Review", type:"Research", desc:"Annual assessment of seaborne trade, port performance, and climate exposure"},
    ],
    data_sources:[
      "FAO FishStat — global fisheries production and trade data",
      "Global Fishing Watch — fishing vessel AIS tracking (2012–present)",
      "Copernicus Marine Service — ocean productivity and chlorophyll-a layers",
      "UNCTAD TRAINS / World Bank Logistics Performance Index",
      "UN Comtrade — marine product trade flows by HS code",
    ],
    by_persona:{
      insurer:"Marine cargo and trade credit lines are exposed to fisheries disruption, shipping lane volatility, and port flood events. Climate-driven catch variability is increasing commodity price volatility in agricultural/food underwriting.",
      dfi:"Projects in coastal processing, aquaculture, and blue economy sectors require supply chain resilience assessment. Circular blue economy frameworks (EU Blue Economy Report) identify diversification opportunities.",
      foundation:"Funding sustainable fisheries governance, community fisheries rights, and marine spatial planning can protect $150B+ in annual seafood trade while delivering SDG 14.4 (sustainable fisheries by 2020 — currently off-track).",
      port:"Port operational continuity depends on fishing and aquaculture sector throughput, not just container volumes. Disruptions to ice supply chains, fish landing infrastructure, and cold chain logistics are undermodelled.",
      corporate:"ESRS E3 water and marine resources requires disclosure of supply chain dependencies. Seafood sector exposure is highest; pharmaceutical and cosmetics companies face emerging disclosure obligations on marine ingredient sourcing.",
      government:"Fisheries subsidy reform (WTO Agreement on Fisheries Subsidies, 2022) creates transition risk for fishing communities. Just transition planning and alternative livelihood programmes are a policy design priority.",
    },
  },
  pc: {
    name:"Physical Climate Risk",
    icon:"🌡️",
    definition:"Acute and chronic physical risks from climate change impacting marine systems — including ocean warming, marine heatwaves, deoxygenation, and extreme weather intensification.",
    drivers:[
      "Ocean heat content: The ocean has absorbed 90% of excess heat from global warming. Ocean heat content reached a new record in 2023 (Cheng et al., 2024).",
      "Marine heatwaves: Marine heatwave frequency has increased 50% since 1925 and is projected to double again by 2041–2060 under SSP2-4.5.",
      "Ocean deoxygenation: Oxygen minimum zones have expanded by ~4.5M km² since 1960 (IPCC SROCC), threatening deep-sea fisheries and benthic ecosystems.",
      "Freshwater flux changes: Accelerated glacial and ice sheet melt is disrupting thermohaline circulation patterns, with implications for North Atlantic weather systems and fisheries.",
      "Compound events: Simultaneous occurrence of marine heatwaves, low oxygen, and high acidity is increasing — stressing species beyond any single threshold.",
    ],
    frameworks:[
      {name:"IPCC SROCC 2019", type:"Science", desc:"Special Report on Ocean and Cryosphere in a Changing Climate — definitive physical risk baseline"},
      {name:"IPCC AR6 WG1 Ch.9 (2021)", type:"Science", desc:"Ocean, cryosphere and sea level change — updated projections under SSP scenarios"},
      {name:"TCFD Physical Risk Framework", type:"Disclosure", desc:"Acute and chronic physical risk categories applied to ocean-dependent sectors"},
      {name:"NOAA Coral Reef Watch DHW", type:"Monitoring", desc:"Real-time Degree Heating Week satellite monitoring — bleaching risk threshold tool"},
    ],
    data_sources:[
      "NOAA Extended Reconstructed Sea Surface Temperature (ERSSTv5)",
      "Copernicus Climate Change Service (C3S) — ERA5 ocean reanalysis (1940–present)",
      "CMIP6 climate model ensemble — SSP1-1.9 to SSP5-8.5 projections",
      "Argo Float Programme — 4,000 autonomous ocean profiling floats globally",
      "NOAA Ocean Acidification Programme — pH monitoring network",
    ],
    by_persona:{
      insurer:"Marine heatwaves are the primary driver of coral reef catastrophe loss accumulation. 1.5°C of warming commits 70–90% of coral reefs to severe bleaching annually; 2°C commits >99%. NatCat models require MHW peril integration.",
      dfi:"CMIP6 scenario analysis is now required for MDB climate risk screening. Projects with 20+ year horizons should be stress-tested under SSP2-4.5 and SSP3-7.0 physical risk pathways, not just current conditions.",
      foundation:"Marine climate resilience funding is the most undercapitalised area of ocean philanthropy. Thermal tolerance research, assisted evolution, and deep-water refuge identification are high-leverage grant opportunities.",
      port:"Ocean warming affects port infrastructure through: thermal expansion of berthing infrastructure, increased frequency of operational closures from storm events, and desalination plant intake disruption from algal blooms.",
      corporate:"TCFD physical risk disclosure requires acute (event) and chronic (trend) scenario analysis. Ocean-dependent sectors must include SST trends, marine heatwave frequency, and cyclone intensity projections in materiality assessments.",
      government:"Integrated Coastal Zone Management (ICZM) frameworks must be updated to reflect current IPCC AR6 physical risk projections. Many national adaptation plans still use AR5 (2013) baselines — a material planning gap.",
    },
  },
};

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SECTORS=[
  {id:"shipping",label:"Shipping & Logistics",icon:"🚢"},
  {id:"insurance",label:"Insurance & Reinsurance",icon:"🛡️"},
  {id:"aquaculture",label:"Aquaculture & Fisheries",icon:"🐟"},
  {id:"coastal_re",label:"Coastal Real Estate",icon:"🏗️"},
  {id:"tourism",label:"Coastal Tourism",icon:"🏖️"},
  {id:"finance",label:"Investment & Finance",icon:"📈"},
];
const REGIONS=[
  {id:"sea",label:"Southeast Asia",lat:5,lon:110},
  {id:"pacific",label:"Pacific Islands",lat:-18,lon:178},
  {id:"caribbean",label:"Caribbean",lat:18,lon:-66},
  {id:"indian",label:"Indian Ocean Coast",lat:-4,lon:55},
  {id:"west_africa",label:"West Africa",lat:5,lon:2},
  {id:"north_atlantic",label:"North Atlantic",lat:51,lon:-10},
];
const RISK_DATA={
  shipping:{sea:{cf:72,bio:68,reg:55,sc:81,pc:76},pacific:{cf:85,bio:74,reg:42,sc:63,pc:88},caribbean:{cf:78,bio:71,reg:60,sc:59,pc:82},indian:{cf:69,bio:65,reg:48,sc:74,pc:71},west_africa:{cf:61,bio:58,reg:38,sc:66,pc:65},north_atlantic:{cf:44,bio:52,reg:78,sc:48,pc:51}},
  insurance:{sea:{cf:83,bio:61,reg:66,sc:55,pc:79},pacific:{cf:91,bio:77,reg:52,sc:44,pc:93},caribbean:{cf:88,bio:69,reg:71,sc:41,pc:90},indian:{cf:75,bio:63,reg:57,sc:48,pc:78},west_africa:{cf:67,bio:55,reg:44,sc:37,pc:68},north_atlantic:{cf:58,bio:60,reg:85,sc:35,pc:55}},
  aquaculture:{sea:{cf:65,bio:89,reg:58,sc:71,pc:74},pacific:{cf:77,bio:91,reg:46,sc:65,pc:82},caribbean:{cf:71,bio:85,reg:64,sc:60,pc:78},indian:{cf:68,bio:80,reg:51,sc:69,pc:72},west_africa:{cf:59,bio:74,reg:41,sc:61,pc:63},north_atlantic:{cf:42,bio:66,reg:79,sc:44,pc:47}},
  coastal_re:{sea:{cf:88,bio:62,reg:49,sc:38,pc:85},pacific:{cf:94,bio:71,reg:38,sc:31,pc:96},caribbean:{cf:91,bio:67,reg:66,sc:34,pc:92},indian:{cf:82,bio:59,reg:44,sc:36,pc:80},west_africa:{cf:73,bio:51,reg:37,sc:28,pc:70},north_atlantic:{cf:55,bio:58,reg:82,sc:26,pc:52}},
  tourism:{sea:{cf:70,bio:83,reg:52,sc:47,pc:73},pacific:{cf:82,bio:88,reg:43,sc:39,pc:86},caribbean:{cf:79,bio:84,reg:68,sc:42,pc:83},indian:{cf:67,bio:78,reg:48,sc:44,pc:70},west_africa:{cf:58,bio:69,reg:39,sc:35,pc:60},north_atlantic:{cf:46,bio:63,reg:77,sc:30,pc:48}},
  finance:{sea:{cf:77,bio:74,reg:71,sc:68,pc:79},pacific:{cf:86,bio:80,reg:60,sc:55,pc:89},caribbean:{cf:82,bio:76,reg:76,sc:52,pc:85},indian:{cf:73,bio:70,reg:65,sc:62,pc:75},west_africa:{cf:62,bio:62,reg:55,sc:54,pc:64},north_atlantic:{cf:50,bio:65,reg:88,sc:42,pc:53}},
};

const ECOSYSTEMS=["Coral Reef","Mangrove","Seagrass Meadow","Kelp Forest","Salt Marsh","Open Ocean","Coastal Wetland","Estuary"];
const INTERVENTIONS=["Restoration & Rehabilitation","Conservation & Protection","Sustainable Use","Research & Monitoring","Community Stewardship","Policy & Governance","Finance & Investment Mobilisation"];
const BUDGET_BANDS=["< $250K","$250K – $1M","$1M – $5M","$5M – $25M","$25M+"];
const DURATIONS=["1–2 years","3–5 years","6–10 years","10+ years"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const riskMeta=v=>v>=80?{l:"Critical",c:C.red}:v>=65?{l:"High",c:C.amber}:v>=50?{l:"Elevated",c:"#c8b840"}:{l:"Moderate",c:C.green};
const avg=o=>Math.round(Object.values(o).reduce((a,b)=>a+b,0)/Object.values(o).length);

function Num({to,dur=900}){
  const[v,setV]=useState(0);
  useEffect(()=>{let n=0,s=to/(dur/16);const t=setInterval(()=>{n+=s;if(n>=to){setV(to);clearInterval(t);}else setV(Math.floor(n));},16);return()=>clearInterval(t);},[to]);
  return<>{v}</>;
}
const Card=({children,style={}})=>(
  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:24,...style}}>{children}</div>
);
const SLabel=({n,text})=>(
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
    <span style={{fontSize:11,fontFamily:F.mono,color:C.teal,fontWeight:700}}>{n}</span>
    <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.18em",color:C.muted,fontWeight:600}}>{text}</span>
    <div style={{flex:1,height:1,background:C.border}}/>
  </div>
);
function Gauge({score,label}){
  const{l,c}=riskMeta(score);
  const r=34,circ=2*Math.PI*r,off=circ-(score/100)*circ;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:84,height:84}}>
        <svg width="84" height="84" style={{transform:"rotate(-90deg)"}}>
          <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
          <circle cx="42" cy="42" r={r} fill="none" stroke={c} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1.1s ease",filter:`drop-shadow(0 0 5px ${c})`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:F.mono}}><Num to={score}/></span>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>{label}</div>
        <div style={{fontSize:10,fontWeight:700,color:c}}>{l}</div>
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"intelligence",label:"Live Intelligence"},
  {id:"screener",label:"Risk Screener"},
  {id:"scorer",label:"Project Scorer"},
  {id:"pipeline",label:"Pipeline"},
];
function Nav({active,onChange,pipeCount,persona,onChangePersona}){
  const p=PERSONAS.find(x=>x.id===persona);
  return(
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(6,13,18,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:0}}>
        <div style={{paddingRight:24,paddingTop:14,paddingBottom:14,marginRight:8,borderRight:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.teal,boxShadow:`0 0 10px ${C.teal}`}}/>
            <span style={{fontFamily:F.display,fontSize:14,color:C.white,fontWeight:700}}>Tidemark</span>
          </div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.18em",textTransform:"uppercase",marginTop:1,paddingLeft:15}}>Marine Risk Intelligence</div>
        </div>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>onChange(n.id)} style={{
            padding:"18px 14px",fontSize:11,fontWeight:active===n.id?700:400,
            color:active===n.id?C.teal:C.muted,background:"none",border:"none",
            borderBottom:active===n.id?`2px solid ${C.teal}`:"2px solid transparent",
            cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase",position:"relative",
          }}>
            {n.label}
            {n.id==="pipeline"&&pipeCount>0&&(
              <span style={{position:"absolute",top:12,right:4,width:15,height:15,borderRadius:"50%",
                background:C.teal,color:C.bg,fontSize:8,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center"}}>{pipeCount}</span>
            )}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {p&&(
            <button onClick={onChangePersona} style={{
              display:"flex",alignItems:"center",gap:7,padding:"6px 12px",
              borderRadius:20,border:`1px solid ${p.color}40`,
              background:`${p.color}15`,cursor:"pointer",
            }}>
              <span style={{fontSize:14}}>{p.icon}</span>
              <span style={{fontSize:11,color:p.color,fontWeight:700}}>{p.label}</span>
              <span style={{fontSize:10,color:C.muted}}>↕</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── PERSONA SELECTOR ─────────────────────────────────────────────────────────
function PersonaSelector({onSelect}){
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",fontFamily:F.body}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse 70% 50% at 20% 30%,rgba(0,55,80,0.5) 0%,transparent 60%),
          radial-gradient(ellipse 50% 40% at 85% 75%,rgba(15,75,65,0.3) 0%,transparent 55%)`}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:780,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:20}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite",boxShadow:`0 0 12px ${C.teal}`}}/>
            <span style={{fontSize:11,color:C.teal,textTransform:"uppercase",letterSpacing:"0.25em",fontWeight:700}}>Marine Risk Intelligence</span>
          </div>
          <h1 style={{fontFamily:F.display,fontSize:"clamp(32px,5vw,52px)",color:C.white,margin:"0 0 16px",lineHeight:1.1}}>
            Tidemark
          </h1>
          <p style={{color:C.muted,fontSize:15,lineHeight:1.7,maxWidth:520,margin:"0 auto 8px"}}>
            Ocean and coastal risk intelligence for capital allocators, underwriters, and decision-makers. Powered by open scientific data.
          </p>
          <p style={{color:C.mutedSm,fontSize:13,margin:0}}>Select your role to personalise the risk framing and metrics.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {PERSONAS.map(p=>(
            <button key={p.id} onClick={()=>onSelect(p.id)} style={{
              padding:"20px 16px",borderRadius:12,cursor:"pointer",textAlign:"left",
              border:`1px solid ${C.border}`,
              background:C.surface,
              transition:"all 0.2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=`${p.color}50`;e.currentTarget.style.background=`${p.color}08`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
              <div style={{fontSize:28,marginBottom:10}}>{p.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:5}}>{p.label}</div>
              <div style={{fontSize:11,color:C.muted,lineHeight:1.55,marginBottom:12}}>{p.tagline}</div>
              <div style={{fontSize:10,color:p.color,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{p.cta} →</div>
            </button>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:28,fontSize:11,color:C.mutedSm}}>
          Data: IPCC AR6 · IPBES · GBF · TNFD · NOAA · Copernicus · GEBCO · FAO · UNEP-WCMC · Open-Meteo
        </div>
      </div>
    </div>
  );
}

// ─── RISK DIMENSION DETAIL CARD ───────────────────────────────────────────────
function DimensionCard({dimKey,score,personaId}){
  const[open,setOpen]=useState(false);
  const{l,c}=riskMeta(score);
  const intel=DIMENSION_INTEL[dimKey];
  const personaText=intel.by_persona[personaId]||intel.by_persona.foundation;
  const typeColors={Science:C.blue,Disclosure:C.purple,Policy:C.green,Data:C.teal,Analytics:C.amber,Regulation:C.red,Research:C.sandDim,Monitoring:C.green};

  return(
    <div style={{border:`1px solid ${open?C.borderHi:C.border}`,borderRadius:12,overflow:"hidden",background:C.surface,transition:"all 0.2s"}}>
      {/* Header row */}
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",padding:"16px 20px",background:"none",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",gap:14,textAlign:"left",
      }}>
        <span style={{fontSize:20}}>{intel.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.white}}>{intel.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{intel.definition.slice(0,90)}…</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.mono,color:c}}>{score}</div>
            <div style={{fontSize:10,color:c,fontWeight:700}}>{l}</div>
          </div>
          <div style={{width:24,height:24,borderRadius:"50%",background:C.surfaceHi,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:12,flexShrink:0}}>
            {open?"▲":"▼"}
          </div>
        </div>
      </button>

      {/* Score bar */}
      <div style={{height:3,background:"rgba(255,255,255,0.05)"}}>
        <div style={{height:"100%",width:`${score}%`,background:c,transition:"width 1s ease",boxShadow:`0 0 6px ${c}50`}}/>
      </div>

      {open&&(
        <div style={{padding:"20px",borderTop:`1px solid ${C.border}`}}>
          {/* Full definition */}
          <div style={{fontSize:13,color:C.sandDim,lineHeight:1.75,marginBottom:20}}>{intel.definition}</div>

          {/* Persona-specific lens */}
          <div style={{padding:"14px 16px",background:C.tealDim,borderRadius:10,border:`1px solid ${C.borderHi}`,marginBottom:20}}>
            <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:7,fontWeight:700}}>
              What this means for {PERSONAS.find(p=>p.id===personaId)?.label}
            </div>
            <div style={{fontSize:13,color:C.sandDim,lineHeight:1.7}}>{personaText}</div>
          </div>

          {/* Risk drivers */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontWeight:700}}>Key Risk Drivers</div>
            {intel.drivers.map((d,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:c,marginTop:6,flexShrink:0,boxShadow:`0 0 6px ${c}`}}/>
                <div style={{fontSize:12,color:C.sandDim,lineHeight:1.65}}>{d}</div>
              </div>
            ))}
          </div>

          {/* Frameworks */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:12,fontWeight:700}}>Scientific & Regulatory Basis</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {intel.frameworks.map((f,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",background:C.surfaceHi,borderRadius:8}}>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:`${typeColors[f.type]||C.muted}18`,color:typeColors[f.type]||C.muted,fontWeight:700,whiteSpace:"nowrap",marginTop:1}}>{f.type}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.white,marginBottom:2}}>{f.name}</div>
                    <div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:10,fontWeight:700}}>Data Sources</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {intel.data_sources.map((s,i)=>(
                <span key={i} style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:C.surfaceHi,color:C.muted,border:`1px solid ${C.border}`}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LIVE INTELLIGENCE ────────────────────────────────────────────────────────
function LiveIntelligence(){
  const[query,setQuery]=useState("");
  const[suggestions,setSuggestions]=useState([]);
  const[location,setLocation]=useState(null);
  const[marine,setMarine]=useState(null);
  const[loading,setLoading]=useState(false);
  const[mapLayer,setMapLayer]=useState("gebco");
  const[error,setError]=useState(null);
  const mapRef=useRef(null);
  const leafletMap=useRef(null);
  const tileRef=useRef(null);
  const markerRef=useRef(null);

  useEffect(()=>{
    if(query.length<3)return void setSuggestions([]);
    const t=setTimeout(async()=>{
      try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);const d=await r.json();setSuggestions(d.results||[]);}catch{}
    },400);
    return()=>clearTimeout(t);
  },[query]);

  useEffect(()=>{
    loadLeaflet().then(L=>{
      if(leafletMap.current||!mapRef.current)return;
      const map=L.map(mapRef.current,{center:[10,0],zoom:2,zoomControl:true});
      leafletMap.current=map;
      addLayer(L,map,"gebco");
    });
    return()=>{if(leafletMap.current){leafletMap.current.remove();leafletMap.current=null;}};
  },[]);

  const addLayer=(L,map,type)=>{
    if(tileRef.current){tileRef.current.remove();}
    let layer;
    if(type==="gebco"){
      layer=L.tileLayer.wms("https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv",{layers:"GEBCO_LATEST",format:"image/png",transparent:true,attribution:"GEBCO 2025 · UNESCO/IHO · Seabed 2030",opacity:0.9});
    }else if(type==="satellite"){
      layer=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles © Esri",maxZoom:18});
    }else{
      layer=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19});
    }
    layer.addTo(map);tileRef.current=layer;
  };

  const switchLayer=(type)=>{
    setMapLayer(type);
    if(leafletMap.current&&window.L)addLayer(window.L,leafletMap.current,type);
  };

  const selectLocation=async(loc)=>{
    setQuery(loc.name+", "+(loc.admin1||loc.country||""));
    setSuggestions([]);setLoading(true);setError(null);
    const lat=loc.latitude,lon=loc.longitude;
    setLocation({...loc,lat,lon});
    if(leafletMap.current&&window.L){
      leafletMap.current.flyTo([lat,lon],7,{duration:1.5});
      if(markerRef.current)markerRef.current.remove();
      markerRef.current=window.L.circleMarker([lat,lon],{radius:10,fillColor:C.teal,fillOpacity:0.9,color:"#fff",weight:2}).addTo(leafletMap.current).bindPopup(`<b>${loc.name}</b><br/>${loc.country||""}`).openPopup();
    }
    try{
      const url=`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,sea_surface_temperature&daily=wave_height_max,wave_period_max,sea_surface_temperature_max,sea_surface_temperature_min&timezone=auto&forecast_days=7`;
      const r=await fetch(url);const d=await r.json();
      if(d.error)throw new Error(d.reason);
      const h=d.hourly,daily=d.daily;
      const fv=(arr)=>{if(!arr)return null;const v=arr.find(x=>x!=null);return v!==undefined?v:null;};
      setMarine({sst:fv(h.sea_surface_temperature),sstMax:daily?.sea_surface_temperature_max?.[0],sstMin:daily?.sea_surface_temperature_min?.[0],waveH:fv(h.wave_height),waveHMax:daily?.wave_height_max?.[0],wavePeriod:fv(h.wave_period),swellH:fv(h.swell_wave_height),windWaveH:fv(h.wind_wave_height),currentV:fv(h.ocean_current_velocity),lat,lon,forecast7d:daily?.wave_height_max?.slice(0,7)||[],forecastDates:daily?.time?.slice(0,7)||[],source:"Open-Meteo Marine API · DWD ICON-Wave · Copernicus MFWAM"});
    }catch(e){setError("Marine data unavailable at this location — try an open coastal coordinate.");setMarine(null);}
    setLoading(false);
  };

  const mc=(label,value,unit,sub,color=C.teal)=>value!=null?(
    <div style={{padding:"14px",background:C.surfaceHi,borderRadius:10,border:`1px solid ${C.border}`}}>
      <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{label}</div>
      <div style={{fontSize:24,fontWeight:800,fontFamily:F.mono,color}}>{typeof value==="number"?value.toFixed(1):value}<span style={{fontSize:11,fontWeight:400,color:C.muted,marginLeft:3}}>{unit}</span></div>
      {sub&&<div style={{fontSize:10,color:C.muted,marginTop:3}}>{sub}</div>}
    </div>
  ):null;

  const sstColor=t=>t==null?C.muted:t>30?C.red:t>28?C.amber:t>25?C.green:C.blue;
  const waveColor=w=>w==null?C.muted:w>4?C.red:w>2?C.amber:C.green;

  return(
    <div>
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite",boxShadow:`0 0 8px ${C.teal}`}}/>
          <span style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.2em",fontWeight:700}}>Live Data</span>
        </div>
        <h2 style={{fontFamily:F.display,fontSize:28,color:C.white,margin:"0 0 8px"}}>Ocean Intelligence Dashboard</h2>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.6,margin:0}}>Search any coastal location to retrieve live marine conditions. Data from GEBCO, Open-Meteo, Copernicus, and NOAA scientific networks.</p>
      </div>
      <div style={{position:"relative",marginBottom:14}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search any coastal location — e.g. Great Barrier Reef, Maldives, Dakar, Manila Bay…"
          style={{width:"100%",padding:"13px 18px",background:C.surfaceHi,border:`1px solid ${C.borderHi}`,borderRadius:10,color:C.white,fontSize:14,outline:"none",fontFamily:F.body,boxSizing:"border-box"}}/>
        {suggestions.length>0&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:500,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,marginTop:4,overflow:"hidden"}}>
            {suggestions.map((s,i)=>(
              <div key={i} onClick={()=>selectLocation(s)} style={{padding:"10px 16px",cursor:"pointer",fontSize:13,color:C.sandDim,borderBottom:`1px solid ${C.border}`}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHi} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <strong style={{color:C.white}}>{s.name}</strong>{s.admin1&&` · ${s.admin1}`}{s.country&&` · ${s.country}`}
                <span style={{fontSize:11,color:C.muted,float:"right"}}>{s.latitude?.toFixed(2)}°, {s.longitude?.toFixed(2)}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Card style={{padding:0,overflow:"hidden",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em"}}>Map Layer</div>
          <div style={{display:"flex",gap:5}}>
            {[["gebco","GEBCO Bathymetry"],["satellite","Satellite"],["osm","Street Map"]].map(([id,label])=>(
              <button key={id} onClick={()=>switchLayer(id)} style={{padding:"4px 11px",borderRadius:6,fontSize:11,cursor:"pointer",fontWeight:mapLayer===id?700:400,border:`1px solid ${mapLayer===id?C.borderHi:C.border}`,background:mapLayer===id?C.tealDim:"transparent",color:mapLayer===id?C.teal:C.muted}}>{label}</button>
            ))}
          </div>
          <div style={{fontSize:10,color:C.muted}}>{mapLayer==="gebco"?"GEBCO 2025 · UNESCO/IHO":mapLayer==="satellite"?"Esri World Imagery":"© OpenStreetMap"}</div>
        </div>
        <div ref={mapRef} style={{height:360,background:"#0c1c2a"}}/>
      </Card>
      {loading&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:13,color:C.muted}}>Fetching marine data from Copernicus / DWD ICON-Wave models…</div></Card>}
      {error&&<Card style={{borderColor:"rgba(223,92,92,0.3)",background:"rgba(223,92,92,0.05)",marginBottom:10}}><div style={{fontSize:13,color:C.red}}>⚠ {error}</div></Card>}
      {marine&&!loading&&(
        <div>
          <div style={{marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:2}}>Live Conditions · {location?.name}, {location?.country}</div>
              <div style={{fontSize:10,color:C.mutedSm}}>{marine.source}</div>
            </div>
            <div style={{fontSize:10,color:C.teal,padding:"3px 10px",borderRadius:20,border:`1px solid ${C.borderHi}`,background:C.tealDim}}>{marine.lat.toFixed(2)}°, {marine.lon.toFixed(2)}°</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {mc("Sea Surface Temperature",marine.sst,"°C",marine.sstMax!=null?`Today: max ${marine.sstMax?.toFixed(1)}° / min ${marine.sstMin?.toFixed(1)}°`:null,sstColor(marine.sst))}
            {mc("Significant Wave Height",marine.waveH,"m",marine.waveHMax!=null?`7-day max: ${marine.waveHMax?.toFixed(1)}m`:null,waveColor(marine.waveH))}
            {mc("Wave Period",marine.wavePeriod,"s","Time between successive wave crests",C.sandDim)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {mc("Swell Height",marine.swellH,"m","Long-period oceanic swell component",C.blue)}
            {mc("Wind Wave Height",marine.windWaveH,"m","Locally generated wind-driven waves",C.muted)}
            {mc("Ocean Current Speed",marine.currentV,"m/s","Surface current velocity",C.green)}
          </div>
          {marine.forecast7d.length>0&&(
            <Card style={{marginBottom:10}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:14}}>7-Day Wave Forecast · Open-Meteo / DWD ICON-Wave + Copernicus MFWAM</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:72}}>
                {marine.forecast7d.map((v,i)=>{
                  const max=Math.max(...marine.forecast7d.filter(x=>x!=null),1);
                  const h=v!=null?Math.max(4,(v/max)*64):4;
                  const c=waveColor(v);
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{fontSize:9,color:C.muted}}>{v!=null?v.toFixed(1)+"m":"—"}</div>
                      <div style={{width:"100%",height:h,borderRadius:"2px 2px 0 0",background:c,opacity:0.8,boxShadow:`0 0 5px ${c}50`}}/>
                      <div style={{fontSize:9,color:C.muted}}>{marine.forecastDates[i]?marine.forecastDates[i].slice(5):""}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          <Card style={{background:C.tealDim,borderColor:C.borderHi}}>
            <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>Scientific Interpretation · NOAA Coral Reef Watch SST Thresholds (5km resolution)</div>
            <div style={{fontSize:13,color:C.sandDim,lineHeight:1.7}}>
              {marine.sst!=null?(marine.sst>28?`⚠ SST of ${marine.sst.toFixed(1)}°C exceeds the NOAA CRW bleaching watch threshold of 28°C. Elevated thermal stress and coral bleaching risk. Cross-reference Degree Heating Weeks (DHW) product — bleaching likely when DHW > 4°C-weeks, mass bleaching when DHW > 8°C-weeks.`:`SST of ${marine.sst.toFixed(1)}°C is below the NOAA CRW bleaching watch threshold (28°C). No acute thermal stress indicated. Monitor for marine heatwave accumulation — sustained anomalies of +1°C above climatological mean constitute a marine heatwave event (Hobday et al., 2016 definition).`):"No SST data available at this coordinate."}
            </div>
          </Card>
        </div>
      )}
      <Card style={{marginTop:14}}>
        <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:12}}>Open Scientific Data Sources</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {[
            {src:"GEBCO 2025",desc:"Global ocean bathymetry · UNESCO/IHO · Seabed 2030 · 15 arc-second resolution",type:"Map",color:C.teal},
            {src:"Open-Meteo Marine API",desc:"DWD ICON-Wave + Copernicus MFWAM · Wave, SST, currents · 28km global / 5km European",type:"Conditions",color:C.green},
            {src:"NOAA Coral Reef Watch",desc:"SST bleaching thresholds & Degree Heating Week products · 5km global satellite",type:"Bleach Risk",color:C.amber},
            {src:"Copernicus Marine Service",desc:"CMEMS — physical, biogeochemical, sea ice · European Space Agency open data",type:"Climate",color:C.blue},
          ].map((d,i)=>(
            <div key={i} style={{padding:"9px 11px",borderRadius:7,background:C.surfaceHi,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:11,fontWeight:700,color:d.color}}>{d.src}</span>
                <span style={{fontSize:9,color:C.muted}}>{d.type}</span>
              </div>
              <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>{d.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── RISK SCREENER ────────────────────────────────────────────────────────────
function RiskScreener({onAdd,persona}){
  const[sector,setSector]=useState(null);
  const[region,setRegion]=useState(null);
  const[results,setResults]=useState(null);
  const[tab,setTab]=useState("profile");
  const p=PERSONAS.find(x=>x.id===persona);

  const run=()=>{if(sector&&region){setResults(RISK_DATA[sector][region]);setTab("profile");}};
  const reset=()=>{setSector(null);setRegion(null);setResults(null);};
  const overall=results?avg(results):0;
  const{l:rLabel,c:rColor}=riskMeta(overall);

  return(
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:F.display,fontSize:28,color:C.white,margin:"0 0 8px"}}>Ocean Risk Screener</h2>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.6,margin:"0 0 12px"}}>
          Five-dimension marine risk assessment framework. Scoring informed by IPCC AR6, IPBES, WorldRiskIndex, TNFD LEAP methodology, and UNEP-WCMC marine ecosystem data.
        </p>
        {p&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:20,background:`${p.color}12`,border:`1px solid ${p.color}30`}}>
            <span style={{fontSize:12}}>{p.icon}</span>
            <span style={{fontSize:11,color:p.color,fontWeight:700}}>Viewing as: {p.label}</span>
            <span style={{fontSize:10,color:C.muted}}>— key metrics: {p.kpis.slice(0,2).join(" · ")}</span>
          </div>
        )}
      </div>

      {!results?(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SLabel n="01" text="Select Sector"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {SECTORS.map(s=>(
                <button key={s.id} onClick={()=>setSector(s.id)} style={{padding:"13px 10px",borderRadius:10,cursor:"pointer",textAlign:"center",border:`1px solid ${sector===s.id?C.borderHi:C.border}`,background:sector===s.id?C.tealDim:"rgba(255,255,255,0.02)",color:sector===s.id?C.teal:C.sandDim,fontSize:12,fontWeight:sector===s.id?700:400}}>
                  <div style={{fontSize:22,marginBottom:5}}>{s.icon}</div>{s.label}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <SLabel n="02" text="Select Region"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {REGIONS.map(r=>(
                <button key={r.id} onClick={()=>setRegion(r.id)} style={{padding:"11px 8px",borderRadius:8,cursor:"pointer",textAlign:"center",border:`1px solid ${region===r.id?C.borderHi:C.border}`,background:region===r.id?C.tealDim:"rgba(255,255,255,0.02)",color:region===r.id?C.teal:C.sandDim,fontSize:12,fontWeight:region===r.id?700:400}}>{r.label}</button>
              ))}
            </div>
          </Card>
          <button onClick={run} disabled={!sector||!region} style={{padding:"15px",borderRadius:12,border:"none",cursor:sector&&region?"pointer":"default",background:sector&&region?`linear-gradient(135deg,${C.teal},#267a68)`:"rgba(255,255,255,0.05)",color:sector&&region?C.bg:C.mutedSm,fontSize:13,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",boxShadow:sector&&region?`0 0 28px ${C.tealGlow}`:"none"}}>
            {sector&&region?`${p?.cta||"Generate Risk Profile"} →`:"Select sector & region to continue"}
          </button>
        </div>
      ):(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>
                {SECTORS.find(s=>s.id===sector)?.label} · {REGIONS.find(r=>r.id===region)?.label}
              </div>
              <h3 style={{fontFamily:F.display,fontSize:22,color:C.white,margin:0}}>Risk Assessment</h3>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:36,fontWeight:900,fontFamily:F.mono,color:rColor,textShadow:`0 0 18px ${rColor}`}}>
                <Num to={overall}/><span style={{fontSize:13}}>/100</span>
              </div>
              <div style={{fontSize:11,color:rColor,fontWeight:700}}>{rLabel} Exposure</div>
            </div>
          </div>

          <div style={{display:"flex",gap:0,marginBottom:18,borderBottom:`1px solid ${C.border}`}}>
            {["profile","intelligence"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"9px 16px",fontSize:11,fontWeight:tab===t?700:400,color:tab===t?C.teal:C.muted,background:"none",border:"none",borderBottom:tab===t?`2px solid ${C.teal}`:"2px solid transparent",cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.1em"}}>
                {t==="profile"?"Overview":t==="intelligence"?"Deep Intelligence"}
              </button>
            ))}
          </div>

          {tab==="profile"&&(
            <Card>
              <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:20,paddingTop:4,marginBottom:24}}>
                {Object.entries(results).map(([k,v])=><Gauge key={k} score={v} label={DIMENSION_INTEL[k]?.name||k}/>)}
              </div>
              {/* Persona KPIs */}
              {p&&(
                <div style={{padding:"14px 16px",background:C.surfaceHi,borderRadius:10,border:`1px solid ${C.border}`,marginBottom:16}}>
                  <div style={{fontSize:10,color:p.color,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8,fontWeight:700}}>Key Metrics for {p.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {p.kpis.map((k,i)=>(
                      <span key={i} style={{fontSize:11,padding:"3px 10px",borderRadius:4,background:`${p.color}12`,color:p.color,border:`1px solid ${p.color}25`}}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{padding:"14px 16px",background:C.tealDim,borderRadius:10,border:`1px solid ${C.borderHi}`,marginBottom:16}}>
                <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>Key Finding</div>
                <div style={{fontSize:13,color:C.sandDim,lineHeight:1.7}}>
                  {(()=>{
                    const top=Object.entries(results).sort((a,b)=>b[1]-a[1])[0];
                    const intel=DIMENSION_INTEL[top[0]];
                    return`Highest exposure: ${intel?.name} (${top[1]}/100 — ${riskMeta(top[1]).l}). ${intel?.by_persona[persona]?.split(".")[0]}.`;
                  })()}
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setTab("intelligence")} style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.borderHi}`,background:C.tealDim,color:C.teal,fontSize:12,fontWeight:700,cursor:"pointer"}}>View Deep Intelligence →</button>
                <button onClick={()=>onAdd({type:"risk",id:Date.now(),sector:SECTORS.find(s=>s.id===sector)?.label,region:REGIONS.find(r=>r.id===region)?.label,score:overall,rating:rLabel,scores:results})}
                  style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>+ Add to Pipeline</button>
                <button onClick={reset} style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>← New</button>
              </div>
            </Card>
          )}

          {tab==="intelligence"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{padding:"12px 16px",background:C.tealDim,borderRadius:10,border:`1px solid ${C.borderHi}`,marginBottom:4}}>
                <div style={{fontSize:12,color:C.sandDim,lineHeight:1.6}}>
                  <span style={{color:C.teal,fontWeight:700}}>Expand each dimension</span> to see risk drivers, the scientific and regulatory frameworks behind the score, underlying data sources, and what this means specifically for your role as <strong style={{color:C.white}}>{p?.label}</strong>.
                </div>
              </div>
              {Object.entries(results).map(([k,v])=>(
                <DimensionCard key={k} dimKey={k} score={v} personaId={persona}/>
              ))}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={()=>onAdd({type:"risk",id:Date.now(),sector:SECTORS.find(s=>s.id===sector)?.label,region:REGIONS.find(r=>r.id===region)?.label,score:overall,rating:rLabel})}
                  style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.borderHi}`,background:C.tealDim,color:C.teal,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add to Pipeline</button>
                <button onClick={reset} style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>← New Screening</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT SCORER ────────────────────────────────────────────────────────────
function ProjectScorer({onAdd,persona}){
  const[form,setForm]=useState({name:"",location:"",ecosystem:"",intervention:"",budget:"",duration:"",org:"",partners:"",notes:""});
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(null);
  const[error,setError]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const ready=form.name&&form.location&&form.ecosystem&&form.intervention&&form.budget;
  const p=PERSONAS.find(x=>x.id===persona);

  const score=async()=>{
    setLoading(true);setError(null);setResult(null);
    const prompt=`You are a senior marine finance expert evaluating a project from the perspective of a ${p?.label} professional.

Project:
- Name: ${form.name}
- Location: ${form.location}
- Ecosystem: ${form.ecosystem}
- Intervention: ${form.intervention}
- Budget: ${form.budget}
- Duration: ${form.duration}
- Organisation: ${form.org||"Not specified"}
- Partners: ${form.partners||"Not specified"}
- Notes: ${form.notes||"None"}

Evaluator role: ${p?.label} — focused on ${p?.kpis?.join(", ")}

Respond ONLY with valid JSON (no markdown, no backticks):
{"score":<0-100>,"rating":"Strong|Promising|Conditional|Weak","headline":"<20 word recommendation tailored to ${p?.language} perspective>","gbf_targets":["Target 2","..."],"sdg_indicators":["SDG 14.2","..."],"tnfd_alignment":"High|Medium|Low","blended_finance_readiness":<0-100>,"recommended_mechanisms":["..."],"risk_flags":["..."],"strengths":["..."],"memo":"<2-paragraph ~130 word memo written for a ${p?.label} decision-maker. Use ${p?.language} terminology. Para 1: project assessment. Para 2: recommendation and next steps.>"}`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const d=await r.json();
      const raw=d.content?.map(b=>b.text||"").join("").trim();
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch(e){setError("Scoring failed — check console.");console.error(e);}
    setLoading(false);
  };
  const reset=()=>{setForm({name:"",location:"",ecosystem:"",intervention:"",budget:"",duration:"",org:"",partners:"",notes:""});setResult(null);setError(null);};

  const inp=(label,key,ph,multi=false)=>(
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{label}</label>
      {multi?<textarea value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} rows={3} style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,color:C.white,fontSize:13,outline:"none",resize:"vertical",fontFamily:F.body,boxSizing:"border-box"}}/>
      :<input value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,color:C.white,fontSize:13,outline:"none",fontFamily:F.body,boxSizing:"border-box"}}/>}
    </div>
  );
  const sel=(label,key,opts)=>(
    <div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{label}</label>
      <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:"100%",padding:"10px 13px",background:C.surfaceHi,border:`1px solid ${C.border}`,borderRadius:8,color:form[key]?C.white:C.muted,fontSize:13,outline:"none",fontFamily:F.body}}>
        <option value="">Select…</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if(result){
    const sc=result.score>=75?C.green:result.score>=55?C.teal:result.score>=40?C.amber:C.red;
    const typeColors={Science:C.blue,Disclosure:C.purple,Policy:C.green,Data:C.teal,Analytics:C.amber,Regulation:C.red};
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>Due Diligence · {p?.label} Perspective</div>
            <h3 style={{fontFamily:F.display,fontSize:22,color:C.white,margin:0}}>{form.name}</h3>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>{form.ecosystem} · {form.location}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:36,fontWeight:900,fontFamily:F.mono,color:sc,textShadow:`0 0 18px ${sc}60`}}><Num to={result.score}/><span style={{fontSize:13}}>/100</span></div>
            <div style={{fontSize:12,color:sc,fontWeight:700}}>{result.rating}</div>
          </div>
        </div>
        <Card style={{marginBottom:12,borderColor:C.borderHi,background:C.tealDim}}>
          <div style={{fontSize:10,color:C.teal,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>Recommendation · {p?.label}</div>
          <div style={{fontSize:15,color:C.white,fontFamily:F.display,lineHeight:1.5,fontStyle:"italic"}}>"{result.headline}"</div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <Card>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Framework Alignment · GBF · SDG 14 · TNFD</div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:5}}>Kunming-Montreal GBF (2022)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{result.gbf_targets?.map(t=><span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:C.tealDim,color:C.teal,border:`1px solid ${C.tealGlow}`}}>{t}</span>)}</div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:5}}>SDG 14 — Life Below Water</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{result.sdg_indicators?.map(t=><span key={t} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"rgba(63,190,119,0.1)",color:C.green,border:"1px solid rgba(63,190,119,0.25)"}}>{t}</span>)}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.muted}}>TNFD LEAP Alignment</span>
              <span style={{fontSize:11,fontWeight:700,color:result.tnfd_alignment==="High"?C.green:result.tnfd_alignment==="Medium"?C.amber:C.muted}}>{result.tnfd_alignment}</span>
            </div>
          </Card>
          <Card>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Finance Pathway · Blended Capital</div>
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:C.muted}}>Blended Finance Readiness</span>
                <span style={{fontSize:12,fontWeight:800,fontFamily:F.mono,color:C.teal}}>{result.blended_finance_readiness}</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${result.blended_finance_readiness}%`,background:`linear-gradient(90deg,${C.teal},#267a68)`,borderRadius:3}}/>
              </div>
            </div>
            {result.recommended_mechanisms?.map((m,i)=>(
              <div key={i} style={{fontSize:11,color:C.sandDim,padding:"4px 0",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,alignItems:"center"}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.teal,flexShrink:0}}/>{m}
              </div>
            ))}
          </Card>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <Card>
            <div style={{fontSize:10,color:C.green,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Strengths</div>
            {result.strengths?.map((s,i)=><div key={i} style={{fontSize:12,color:C.sandDim,padding:"5px 0",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8}}><span style={{color:C.green}}>✓</span>{s}</div>)}
          </Card>
          <Card>
            <div style={{fontSize:10,color:C.amber,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Risk Flags</div>
            {result.risk_flags?.map((r,i)=><div key={i} style={{fontSize:12,color:C.sandDim,padding:"5px 0",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8}}><span style={{color:C.amber}}>⚠</span>{r}</div>)}
          </Card>
        </div>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Assessment Memo · {p?.label} · AI-Assisted</div>
          {result.memo?.split("\n\n").filter(Boolean).map((para,i)=><p key={i} style={{fontSize:13,color:C.sandDim,lineHeight:1.8,margin:"0 0 12px"}}>{para}</p>)}
        </Card>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onAdd({type:"project",id:Date.now(),name:form.name,location:form.location,ecosystem:form.ecosystem,score:result.score,rating:result.rating,tnfd:result.tnfd_alignment,bf:result.blended_finance_readiness})}
            style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.borderHi}`,background:C.tealDim,color:C.teal,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add to Pipeline</button>
          <button onClick={reset} style={{padding:"9px 16px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"}}>← Score Another</button>
        </div>
      </div>
    );
  }

  return(
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:F.display,fontSize:28,color:C.white,margin:"0 0 8px"}}>Project Due Diligence Scorer</h2>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.6,margin:"0 0 12px"}}>
          AI-assisted funding and investment memo. Outputs GBF target alignment, TNFD LEAP scoring, and blended finance readiness — framed for your role.
        </p>
        {p&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:20,background:`${p.color}12`,border:`1px solid ${p.color}30`}}>
            <span style={{fontSize:12}}>{p.icon}</span>
            <span style={{fontSize:11,color:p.color,fontWeight:700}}>Memo framed for: {p.label}</span>
          </div>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card><SLabel n="01" text="Project Identity"/>
          {inp("Project Name","name","e.g. Coral Reef Restoration — Bali")}
          {inp("Location / Geography","location","Country, region, or specific site")}
          {inp("Implementing Organisation","org","Lead NGO, enterprise, or institution")}
          {inp("Key Partners","partners","Co-funders, scientific partners, government bodies")}
        </Card>
        <Card><SLabel n="02" text="Project Design"/>
          {sel("Ecosystem Type","ecosystem",ECOSYSTEMS)}
          {sel("Intervention Type","intervention",INTERVENTIONS)}
          {sel("Total Budget","budget",BUDGET_BANDS)}
          {sel("Project Duration","duration",DURATIONS)}
          {inp("Additional Context","notes","Theory of change, monitoring approach, co-benefits…",true)}
        </Card>
      </div>
      {error&&<div style={{marginTop:12,padding:"12px 16px",background:"rgba(223,92,92,0.1)",border:"1px solid rgba(223,92,92,0.3)",borderRadius:8,color:C.red,fontSize:13}}>{error}</div>}
      <button onClick={score} disabled={!ready||loading} style={{width:"100%",marginTop:14,padding:"15px",borderRadius:12,border:"none",cursor:ready&&!loading?"pointer":"default",background:ready&&!loading?`linear-gradient(135deg,${C.teal},#267a68)`:"rgba(255,255,255,0.05)",color:ready&&!loading?C.bg:C.mutedSm,fontSize:13,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",boxShadow:ready&&!loading?`0 0 28px ${C.tealGlow}`:"none"}}>
        {loading?"Generating Assessment…":ready?"Generate Due Diligence Report →":"Complete required fields to continue"}
      </button>
    </div>
  );
}

// ─── PIPELINE ─────────────────────────────────────────────────────────────────
function Pipeline({items,onClear}){
  if(!items.length)return(
    <div>
      <h2 style={{fontFamily:F.display,fontSize:28,color:C.white,margin:"0 0 8px"}}>Project Pipeline</h2>
      <p style={{color:C.muted,fontSize:14,lineHeight:1.6,marginBottom:36}}>Add risk screenings and project assessments to track and compare across your portfolio.</p>
      <Card style={{textAlign:"center",padding:56}}><div style={{fontSize:36,marginBottom:14}}>🌊</div><div style={{fontSize:14,color:C.muted}}>No items yet — run a risk screening or score a project to get started.</div></Card>
    </div>
  );
  const sorted=[...items].sort((a,b)=>b.score-a.score);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div><h2 style={{fontFamily:F.display,fontSize:28,color:C.white,margin:"0 0 6px"}}>Project Pipeline</h2><p style={{color:C.muted,fontSize:14,margin:0}}>{items.length} item{items.length!==1?"s":""} tracked</p></div>
        <button onClick={onClear} style={{padding:"7px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:11,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.08em"}}>Clear All</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        {[{l:"Avg Score",v:Math.round(items.reduce((a,b)=>a+b.score,0)/items.length)+"/100"},{l:"Projects",v:items.filter(i=>i.type==="project").length},{l:"Screenings",v:items.filter(i=>i.type==="risk").length}].map(s=>(
          <Card key={s.l} style={{textAlign:"center",padding:"14px 10px"}}>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.mono,color:C.teal,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.l}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {sorted.map((item,idx)=>{
          const sc=item.score>=75?C.green:item.score>=55?C.teal:item.score>=40?C.amber:C.red;
          return(
            <Card key={item.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px"}}>
              <div style={{fontSize:11,fontFamily:F.mono,color:C.mutedSm,width:18,textAlign:"center"}}>{idx+1}</div>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${sc}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${sc}35`}}>
                <span style={{fontSize:13,fontWeight:800,fontFamily:F.mono,color:sc}}>{item.score}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:C.white,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.type==="project"?item.name:`${item.sector} — ${item.region}`}</div>
                <div style={{fontSize:11,color:C.muted}}>{item.type==="project"?`${item.ecosystem} · ${item.location}`:"Sector Risk Screening"}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,fontWeight:700,background:`${sc}15`,color:sc,border:`1px solid ${sc}25`}}>{item.rating}</span>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"rgba(255,255,255,0.05)",color:C.muted}}>{item.type==="project"?"Project":"Risk Screen"}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[persona,setPersona]=useState(null);
  const[page,setPage]=useState("intelligence");
  const[pipeline,setPipeline]=useState([]);
  const addToPipeline=useCallback(item=>setPipeline(p=>[...p,item]),[]);

  if(!persona)return <PersonaSelector onSelect={setPersona}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.body,color:C.white}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        input::placeholder,textarea::placeholder{color:rgba(238,234,226,0.22)}
        select option{background:#0b1720;color:#eeeae2}
        .leaflet-container{background:#0c1c2a}
        .leaflet-popup-content-wrapper{background:#0b1720;border:1px solid rgba(52,183,152,0.3);color:#eeeae2;border-radius:8px}
        .leaflet-popup-tip{background:#0b1720}
        .leaflet-popup-close-button{color:#eeeae2 !important}
      `}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:`radial-gradient(ellipse 60% 45% at 8% 15%,rgba(0,55,80,0.42) 0%,transparent 60%),radial-gradient(ellipse 45% 35% at 92% 80%,rgba(15,75,65,0.25) 0%,transparent 55%)`}}/>
      <Nav active={page} onChange={setPage} pipeCount={pipeline.length} persona={persona} onChangePersona={()=>setPersona(null)}/>
      <main style={{position:"relative",zIndex:1,maxWidth:1060,margin:"0 auto",padding:"40px 24px 80px"}}>
        {page==="intelligence"&&<LiveIntelligence/>}
        {page==="screener"&&<RiskScreener onAdd={addToPipeline} persona={persona}/>}
        {page==="scorer"&&<ProjectScorer onAdd={addToPipeline} persona={persona}/>}
        {page==="pipeline"&&<Pipeline items={pipeline} onClear={()=>setPipeline([])}/>}
      </main>
      <footer style={{position:"relative",zIndex:1,borderTop:`1px solid ${C.border}`,padding:"18px 24px",maxWidth:1060,margin:"0 auto",display:"flex",justifyContent:"space-between",fontSize:10,color:C.mutedSm}}>
        <span style={{fontFamily:F.display,fontStyle:"italic"}}>Tidemark · Marine Risk Intelligence</span>
        <span>IPCC · IPBES · GBF · TNFD · NOAA · Copernicus · GEBCO · FAO · UNEP-WCMC · WorldRiskIndex · Open-Meteo</span>
      </footer>
    </div>
  );
}
