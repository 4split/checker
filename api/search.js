// api/search.js — Vercel Serverless Function (Node 18+)
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELDS = [
  "places.id","places.displayName","places.formattedAddress",
  "places.nationalPhoneNumber","places.internationalPhoneNumber",
  "places.websiteUri","places.googleMapsUri","places.rating",
  "places.userRatingCount","places.primaryTypeDisplayName","places.businessStatus",
  "nextPageToken"
].join(",");

function classify(url){
  if(!url) return null;
  let u=String(url).trim();
  if(!/^https?:\/\//i.test(u)) u="https://"+u;
  let host="";
  try{ host=new URL(u).hostname.toLowerCase().replace(/^www\./,""); }catch{ return null; }
  const rules=[
    ["tiktok",["tiktok.com"]],
    ["instagram",["instagram.com","instagr.am"]],
    ["twitter",["twitter.com","x.com"]],
    ["facebook",["facebook.com","fb.com","fb.me"]],
    ["snapchat",["snapchat.com"]],
    ["youtube",["youtube.com","youtu.be"]],
    ["linkedin",["linkedin.com"]],
    ["whatsapp",["wa.me","whatsapp.com"]],
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
  if(!key) return res.status(500).json({error:"مفتاح GOOGLE_MAPS_API_KEY غير مضبوط في Vercel."});
  const q=req.query||{};
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
      "Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":FIELDS
    },body:JSON.stringify(body)});
    const data=await r.json();
    if(!r.ok){
      const msg=data?.error?.message||"فشل الاتصال بقوقل.";
      let hint="";
      if(r.status===403) hint="تأكد أن Places API (New) مفعّل وأن المفتاح مسموح له بها وأن الفوترة مرتبطة بالمشروع.";
      return res.status(r.status).json({error:msg+(hint?" — "+hint:"")});
    }
    const places=(data.places||[]).map(p=>{
      const link=classify(p.websiteUri);
      return {
        id:p.id,
        name:p.displayName?.text||"",
        address:p.formattedAddress||"",
        phone:p.nationalPhoneNumber||p.internationalPhoneNumber||"",
        tel:(p.internationalPhoneNumber||p.nationalPhoneNumber||"").replace(/[^\d+]/g,""),
        rating:p.rating??null,
        reviews:p.userRatingCount??null,
        category:p.primaryTypeDisplayName?.text||type,
        status:p.businessStatus||"OPERATIONAL",
        maps:p.googleMapsUri||"",
        link:link?link.kind:null,
        url:link?link.url:""
      };
    });
    return res.status(200).json({places,nextPageToken:data.nextPageToken||null,query:textQuery});
  }catch(e){
    return res.status(502).json({error:"تعذر الوصول إلى خدمة قوقل: "+(e?.message||"خطأ شبكة")});
  }
}
