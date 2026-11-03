import { env } from "cloudflare:workers";
const reply=(x:any,status=200)=>Response.json(x,{status,headers:{"Cache-Control":"no-store"}});
function validate(d:any,id?:string){
 if(!d||typeof d!=="object"||Array.isArray(d))throw Error("현장 데이터가 올바르지 않습니다.");
 if(!["빗물재이용","우수유출저감"].includes(d.type)||typeof d.name!=="string"||!d.name.trim()||typeof d.company!=="string"||!d.company.trim())throw Error("현장명, 시공사, 종류를 확인하세요.");
 d.id=id||d.id;
 if(typeof d.id!=="string"||!d.id.length||d.id.length>90||d.id.includes("/")||JSON.stringify(d).length>50000)throw Error("현장 데이터 형식을 확인하세요.");return d;
}
async function handle(req:Request){try{
 const db=env.DB!;const path=new URL(req.url).pathname;const method=req.method;
 if(path==="/api/me")return reply({admin:true});
 if(path==="/api/sites"&&method==="GET"){const r=await db.prepare("SELECT data FROM sites ORDER BY updated_at DESC").all();return reply({sites:r.results.map((r:any)=>JSON.parse(r.data))});}
 if(Number(req.headers.get("content-length"))>2097152)return reply({error:"파일 크기가 너무 큽니다."},413);
 const id=path.startsWith("/api/sites/")?decodeURIComponent(path.slice(11)):null;
 const stmt=(d:any)=>db.prepare("INSERT INTO sites (id,data,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at").bind(d.id,JSON.stringify(d),new Date().toISOString());
 if(id&&method==="PUT"){const d=validate(await req.json(),id);await stmt(d).run();return reply({ok:true});}
 if(id&&method==="DELETE"){await db.prepare("DELETE FROM sites WHERE id=?").bind(id).run();return reply({ok:true});}
 if(path==="/api/import"&&method==="POST"){const body:any=await req.json();if(!Array.isArray(body.sites)||body.sites.length>1000)throw Error("최대 1,000개 현장을 가져올 수 있습니다.");const rows=body.sites.map((x:any)=>validate(x));for(let i=0;i<rows.length;i+=50)await db.batch(rows.slice(i,i+50).map(stmt));return reply({ok:true,count:rows.length});}
 return reply({error:"요청을 찾을 수 없습니다."},404);
 }catch(e){return reply({error:e instanceof Error?e.message:"저장 실패"},400)}}
export const GET=handle;export const PUT=handle;export const DELETE=handle;export const POST=handle;
