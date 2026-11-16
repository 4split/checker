// api/search.js — Vercel Serverless Function (Node 18+)
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_ENDPOINT = "https://places.googleapis.com/v1/places/";

// حقول Pro فقط للبحث الأساسي (5000 مجاني/شهر)
const SEARCH_FIELDS = [
  "places.id","places.displayName","places.formattedAddress",
  "places.websiteUri","places.googleMapsUri","places.primaryTypeDisplayName",
  "places.businessStatus","nextPageToken"
].join(",");

// حقول Enterprise للتفاصيل (1000 مجاني/شهر) - تُجلب عند الطلب فقط
const DETAIL_FIELDS = [
  "places.nationalPhoneNumber","places.internationalPhoneNumber",
  "places.rating","places.userRatingCount"
].join(",");

function classify(url){
  if(!url) return null;
  let u=String(url).trim();
  if(!/^https?:\/\//i.test(u)) u="https://"+u;
  let host="";
  try{ host=new URL(u).hostname.toLowerCase().replace(/^www\./,""); }catch{ return null; }
  const rules=[
    ["tiktok",["tiktok.com"]],["instagram",["instagram.com","instagr.am"]],
    ["twitter",["twitter.com","x.com"]],["facebook",["facebook.com","fb.com","fb.me"]],
    ["snapchat",["snapchat.com"]],["youtube",["youtube.com","youtu.be"]],
    ["linkedin",["linkedin.com"]],["whatsapp",["wa.me","whatsapp.com"]],
    ["linktree",["linktr.ee","linktree.com","bio.link","tap.bio"]]
  ];
  for(const [kind,domains] of rules)
    if(domains.some(d=>host===d||host.endsWith("."+d))) return {kind,url:u};
  return {kind:"website",url:u};
}

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key) return res.status(500).json({error:"مفتاح GOOGLE_MAPS_API_KEY غير مضبوط."});

  const q=req.query||{};
  const action=q.action||"search"; // search | details | grid

  // --- جلب تفاصيل محل واحد (Enterprise SKU) ---
  if(action==="details"){
    const id=q.id;
    if(!id) return res.status(400).json({error:"معرف المحل مطلوب."});
    try{
      const r=await fetch(DETAILS_ENDPOINT+id+"?fields="+DETAILAIL_FIELDS+"&languageCode=ar", {
        headers:{"X-Goog-Api-Key":key,"X-Goog-FieldMask":DETAIL_FIELDS}
      });
      const data=await r.json();
      if(!r.ok) return res.status(r.status).json({error:data?.error?.message||"فشل جلب التفاصيل."});
      return res.json({
        phone:data.nationalPhoneNumber||data.internationalPhoneNumber||"",
        tel:(data.internationalPhoneNumber||data.nationalPhoneNumber||"").replace(/[^\d+]/g,""),
        rating:data.rating??null, reviews:data.userRatingCount??null
      });
    }catch(e){return res.status(502).json({error:"خطأ شبكة: "+e.message});}
  }

  // --- بحث بشبكة مربعات ---
  if(action==="grid"){
    const region=String(q.region||"").trim();
    const city=String(q.city||"").trim();
    const type=String(q.type||"").trim();
    if(!type) return res.status(400).json({error:"نوع النشاط مطلوب."});
    const place=city||region.replace(/^منطقة\s+/,"");
    const textQuery=`${type} في ${place} السعودية`;

    // إحداثيات تقريبية لمدن السعودية الرئيسية (lat,lng,radius_km)
    const CITIES={
      "الرياض":[24.7136,46.6753,35],"جدة":[21.4858,39.1925,30],"مكة المكرمة":[21.3891,39.8579,20],
      "المدينة المنورة":[24.5247,39.5692,25],"الدمام":[26.4207,50.0888,25],"الخبر":[26.2172,50.1971,20],
      "الطائف":[21.2703,40.4158,20],"تبوك":[28.3835,36.5662,20],"حائل":[27.5114,41.6900,20],
      "أبها":[18.2164,42.5053,15],"جازان":[16.8892,42.5511,15],"نجران":[17.4924,44.1277,15],
      "بريدة":[26.3260,43.9750,20],"ينبع":[24.0896,38.0618,15],"العلا":[26.6175,37.9244,15],
      "الأحساء":[25.3647,49.5856,20],"الهفوف":[25.3647,49.5856,20],"المبرز":[25.4000,49.6000,20],
      "القطيف":[26.5653,50.0089,15],"صفوى":[26.6333,50.0667,10],"سيهات":[26.5500,50.0333,10],
      "الجبيل":[27.0000,49.6500,15],"رأس تنورة":[26.6500,50.3000,10],"الخفجي":[28.4333,48.5000,15],
      "حفر الباطن":[28.3333,45.9667,15],"عنيزة":[26.0833,43.9833,15],"الرس":[25.8667,43.5000,15],
      "البكيرية":[26.2667,43.7333,10],"خميس مشيط":[18.3000,42.7333,15],"بيشة":[19.9833,42.6000,15],
      "سكاكا":[29.9667,40.2000,15],"دومة الجندل":[29.8000,39.8667,10],"القريات":[31.3333,37.2833,15],
      "عرعر":[30.9667,41.0333,15],"رفحاء":[29.6333,43.5000,15],"طريف":[31.6667,38.6667,10],
      "صبيا":[17.3333,42.5667,10],"أبو عريش":[17.1833,42.8333,10],"صامطة":[17.0000,42.9333,10],
      "بلجرشي":[19.9500,42.1833,10],"المندق":[19.9000,41.5000,10],"المخواة":[20.1000,41.3000,10],
      "رابغ":[22.7667,39.0333,10],"القنفذة":[19.1333,41.0833,10],"الليث":[20.3667,39.5833,10],
      "وادي الدواسر":[20.5000,45.0000,15],"الخرج":[24.1500,45.8167,15],"الدوادمي":[24.5000,44.4000,15],
      "المجمعة":[25.9000,45.3667,10],"القويعية":[23.6333,45.2833,10],"شقراء":[25.2667,45.2667,10],
      "حوطة بني تميم":[23.8667,46.7333,10],"ضرما":[24.4333,46.3333,10],"المزاحمية":[24.4000,46.2500,10],
      "ثادق":[25.6000,46.3333,10],"الحريق":[23.1667,46.7000,10],"السليل":[22.1667,45.6667,10],
      "عفيف":[23.9000,42.9000,10],"مرات":[25.1667,45.5000,10],"رمح":[24.6667,46.5000,10],
      "الأفلاج":[22.1000,47.3000,15],"الزلفي":[26.3000,44.8000,10],"بقعاء":[27.9667,41.4333,10],
      "الغزالة":[27.6667,41.2667,10],"الشنان":[27.3333,41.7333,10],"سميراء":[27.5833,42.0833,10],
      "موقق":[27.7333,40.7333,10],"السليمي":[27.8333,42.3333,10],"الوجه":[28.4000,35.8000,10],
      "ضباء":[28.0333,35.7333,10],"أملج":[26.0000,37.2667,10],"حقل":[28.9333,35.1667,10],
      "تيماء":[27.6000,38.5333,10],"بيش":[17.0667,42.1333,10],"الدرب":[17.2667,42.1000,10],
      "فيفاء":[17.1667,43.0000,10],"العارضة":[17.2000,42.7000,10],"الطوال":[17.0000,42.9000,10],
      "أحد المسارحة":[17.2000,42.8000,10],"الريث":[17.1000,42.9000,10],"فرسان":[16.7000,42.1000,10],
      "شرورة":[17.4833,47.1167,10],"حبونا":[17.3333,44.6667,10],"بدر الجنوب":[17.2000,44.3333,10],
      "يدمه":[17.0000,44.5000,10],"ثار":[17.5000,44.0000,10],"قلوة":[20.0000,41.6000,10],
      "العقيق":[20.0500,41.7000,10],"القرى":[20.1000,41.4000,10]
    };

    let coords=CITIES[city]||CITIES[place];
    // إذا لم توجد المدينة في القائمة، نستخدم إحداثيات المنطقة العامة
    if(!coords && region.includes("الرياض")) coords=[24.7136,46.6753,35];
    else if(!coords && region.includes("مكة")) coords=[21.4858,39.1925,30];
    else if(!coords && region.includes("المدينة")) coords=[24.5247,39.5692,25];
    else if(!coords && region.includes("القصيم")) coords=[26.3260,43.9750,20];
    else if(!coords && region.includes("الشرقية")) coords=[26.4207,50.0888,25];
    else if(!coords && region.includes("عسير")) coords=[18.2164,42.5053,15];
    else if(!coords && region.includes("تبوك")) coords=[28.3835,36.5662,20];
    else if(!coords && region.includes("حائل")) coords=[27.5114,41.6900,20];
    else if(!coords && region.includes("الحدود")) coords=[30.9667,41.0333,15];
    else if(!coords && region.includes("جازان")) coords=[16.8892,42.5511,15];
    else if(!coords && region.includes("نجران")) coords=[17.4924,44.1277,15];
    else if(!coords && region.includes("الباحة")) coords=[20.0000,41.5000,15];
    else if(!coords && region.includes("الجوف")) coords=[29.9667,40.2000,15];
    else coords=[24.7136,46.6753,35]; // افتراضي: الرياض

    const [lat,lng,radiusKm]=coords;
    const gridSize=Math.max(3, Math.ceil(radiusKm/8)); // حجم المربع بالكيلومتر
    const halfGrid=gridSize/111; // تحويل km إلى درجات تقريباً
    const steps=Math.ceil(radiusKm/gridSize);
    const allPlaces=[];
    const seen=new Set();
    let totalRequests=0;
    let errors=0;

    for(let i=-steps;i<=steps;i++){
      for(let j=-steps;j<=steps;j++){
        const cLat=lat+i*halfGrid;
        const cLng=lng+j*halfGrid;
        // تحقق أن النقطة داخل دائرة نصف القطر
        const dist=Math.sqrt((i*halfGrid)**2+(j*halfGrid)**2)*111;
        if(dist>radiusKm) continue;

        const body={
          textQuery, languageCode:"ar", regionCode:"SA", pageSize:20,
          locationBias:{circle:{center:{latitude:cLat,longitude:cLng},radius:gridSize*1000}}
        };
        try{
          const r=await fetch(ENDPOINT,{method:"POST",headers:{
            "Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":SEARCH_FIELDS
          },body:JSON.stringify(body)});
          totalRequests++;
          const data=await r.json();
          if(r.ok && data.places){
            data.places.forEach(p=>{
              if(!seen.has(p.id)){seen.add(p.id);allPlaces.push(p);}
            });
          } else { errors++; }
        }catch{errors++;}
        // تأخير بسيط لتجنب rate limit
        if(totalRequests%5===0) await new Promise(r=>setTimeout(r,200));
      }
    }

    const places=allPlaces.map(p=>{
      const link=classify(p.websiteUri);
      return {
        id:p.id, name:p.displayName?.text||"", address:p.formattedAddress||"",
        category:p.primaryTypeDisplayName?.text||type, status:p.businessStatus||"OPERATIONAL",
        maps:p.googleMapsUri||"", link:link?link.kind:null, url:link?link.url:"",
        phone:"",tel:"",rating:null,reviews:null // تُجلب لاحقاً عند الطلب
      };
    });
    return res.json({places,totalRequests,errors,query:textQuery,gridSize,cells:totalRequests});
  }

  // --- بحث عادي (Pro SKU - 5000 مجاني/شهر) ---
  const region=String(q.region||"").trim();
  const city=String(q.city||"").trim();
  const type=String(q.type||"").trim();
  const pageToken=String(q.pageToken||"").trim();
  if(!city&&!region) return res.status(400).json({error:"اختر المنطقة والمدينة أولاً."});
  if(!type) return res.status(400).json({error:"اختر نوع النشاط."});
  const place=city||region.replace(/^منطقة\s+/,"");
  const textQuery=`${type} في ${place} السعودية`;
  const body={textQuery,languageCode:"ar",regionCode:"SA",pageSize:20};
  if(pageToken) body.pageToken=pageToken;
  try{
    const r=await fetch(ENDPOINT,{method:"POST",headers:{
      "Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":SEARCH_FIELDS
    },body:JSON.stringify(body)});
    const data=await r.json();
    if(!r.ok){
      const msg=data?.error?.message||"فشل الاتصال بقوقل.";
      let hint="";
      if(r.status===403) hint="تأكد أن Places API مفعّل وأن المفتاح صالح.";
      return res.status(r.status).json({error:msg+(hint?" — "+hint:"")});
    }
    const places=(data.places||[]).map(p=>{
      const link=classify(p.websiteUri);
      return {
        id:p.id, name:p.displayName?.text||"", address:p.formattedAddress||"",
        category:p.primaryTypeDisplayName?.text||type, status:p.businessStatus||"OPERATIONAL",
        maps:p.googleMapsUri||"", link:link?link.kind:null, url:link?link.url:"",
        phone:"",tel:"",rating:null,reviews:null
      };
    });
    return res.json({places,nextPageToken:data.nextPageToken||null,query:textQuery});
  }catch(e){
    return res.status(502).json({error:"تعذر الوصول إلى خدمة قوقل: "+(e?.message||"خطأ شبكة")});
  }
}
