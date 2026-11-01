(function(){
async function exportAppealPDF(raw){
const W=1240,H=1754,M=108,TOP=112,BOTTOM=115;
const text=String(raw||"").trim();if(!text)throw Error("Пустое заявление");
const pages=[];let canvas,ctx,y;
function page(){canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;ctx=canvas.getContext("2d",{alpha:false});ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.fillStyle="#111";ctx.textBaseline="top";y=TOP;}
function save(){pages.push(Uint8Array.from(atob(canvas.toDataURL("image/jpeg",0.91).split(",")[1]),c=>c.charCodeAt(0)));}
function font(){ctx.font='30px Georgia, "Times New Roman", serif';}
function line(t){if(y+46>H-BOTTOM){save();page();font();}ctx.fillText(t,M,y);y+=44;}
function wrap(t){const words=t.split(/\s+/).filter(Boolean);if(!words.length){y+=22;return;}let current="";for(const word of words){const test=current?current+" "+word:word;if(ctx.measureText(test).width>W-M*2&&current){line(current);current=word;}else current=test;}if(current)line(current);}
page();ctx.font='bold 38px Georgia, "Times New Roman", serif';ctx.textAlign="center";ctx.fillText("ОБРАЩЕНИЕ",W/2,y);ctx.textAlign="left";y+=102;font();
for(const paragraph of text.replace(/\r\n/g,"\n").split("\n")){if(paragraph.trim())wrap(paragraph.trim());else y+=22;}
save();
const enc=new TextEncoder(),parts=[],offsets=[0];let length=0;
function add(v){const bytes=typeof v==="string"?enc.encode(v):v;parts.push(bytes);length+=bytes.length;}
function obj(id,v){offsets[id]=length;add(id+" 0 obj\n");add(v);add("\nendobj\n");}
add("%PDF-1.4\n");
const refs=pages.map((_,i)=>({page:3+3*i,image:4+3*i,contents:5+3*i}));
obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
obj(2,"<< /Type /Pages /Kids ["+refs.map(r=>r.page+" 0 R").join(" ")+"] /Count "+pages.length+" >>");
for(let i=0;i<pages.length;i++){const r=refs[i],jpg=pages[i];obj(r.page,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Img "+r.image+" 0 R >> >> /Contents "+r.contents+" 0 R >>");offsets[r.image]=length;add(r.image+" 0 obj\n<< /Type /XObject /Subtype /Image /Width "+W+" /Height "+H+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+jpg.length+" >>\nstream\n");add(jpg);add("\nendstream\nendobj\n");const stream="q\n595.28 0 0 841.89 0 0 cm\n/Img Do\nQ\n";obj(r.contents,"<< /Length "+enc.encode(stream).length+" >>\nstream\n"+stream+"endstream");}
const xref=length, count=3+pages.length*3;add("xref\n0 "+count+"\n0000000000 65535 f \n");for(let j=1;j<count;j++)add(String(offsets[j]).padStart(10,"0")+" 00000 n \n");add("trailer\n<< /Size "+count+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF");
const blob=new Blob(parts,{type:"application/pdf"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Заявление — Мой Серпухов.pdf";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
window.exportAppealPDF=exportAppealPDF;
})();
