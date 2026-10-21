(function(){
  var SYM={"+":"+","-":"−","*":"×","/":"÷"};
  var cur="0", prev=null, op=null, fresh=false, err=false;
  var valEl=document.getElementById("val"), exprEl=document.getElementById("expr");

  function fmt(s){
    if(s.indexOf("e")>-1) return s.replace(".",",");
    var neg=s[0]==="-"; if(neg) s=s.slice(1);
    var p=s.split("."), i=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
    return (neg?"−":"")+i+(p.length>1?","+p[1]:"");
  }
  function num(n){ return String(parseFloat(n.toPrecision(12))); }
  function render(extra){
    valEl.classList.toggle("err",err);
    valEl.textContent=err?"Não é possível dividir por zero":fmt(cur);
    if(!err){
      var l=fmt(cur).length; valEl.style.fontSize=l>14?"26px":l>10?"34px":"48px";
    } else valEl.style.fontSize="";
    exprEl.textContent=extra!==undefined?extra:(op!==null?fmt(num(prev))+" "+SYM[op]:"");
    document.querySelectorAll("button.op").forEach(function(b){b.classList.toggle("sel",b.dataset.k===op&&fresh)});
  }
  function calc(a,b,o){
    if(o==="+") return a+b; if(o==="-") return a-b; if(o==="*") return a*b;
    if(o==="/") return b===0?null:a/b; return b;
  }
  function reset(){cur="0";prev=null;op=null;fresh=false;err=false;}
  function digit(d){
    if(err) reset();
    if(fresh){cur="0";fresh=false;}
    if(cur==="0") cur=d; else if(cur.replace(/[-.]/g,"").length<15) cur+=d;
  }
  function dot(){
    if(err) reset();
    if(fresh){cur="0";fresh=false;}
    if(cur.indexOf(".")<0) cur+=".";
  }
  function setOp(o){
    if(err) return;
    if(op!==null&&!fresh){
      var r=calc(prev,parseFloat(cur),op);
      if(r===null){err=true;render("");return;}
      prev=parseFloat(num(r)); cur=num(r);
    } else prev=parseFloat(cur);
    op=o; fresh=true;
  }
  function equals(){
    if(err||op===null) return;
    var b=parseFloat(cur), r=calc(prev,b,op);
    var shown=fmt(num(prev))+" "+SYM[op]+" "+fmt(cur)+" =";
    if(r===null){err=true;op=null;render(shown);return;}
    cur=num(r); prev=null; op=null; fresh=true; render(shown); return "done";
  }
  function percent(){
    if(err) return;
    var v=parseFloat(cur);
    cur=num(op!==null&&prev!==null?prev*v/100:v/100);
  }
  function neg(){
    if(err||cur==="0") return;
    cur=cur[0]==="-"?cur.slice(1):"-"+cur;
  }
  function back(){
    if(err){reset();return;}
    if(fresh) return;
    cur=cur.length>1&&!(cur.length===2&&cur[0]==="-")?cur.slice(0,-1):"0";
  }
  function press(k){
    var done;
    if(/^\d$/.test(k)) digit(k);
    else if(k===".") dot();
    else if(SYM[k]) setOp(k);
    else if(k==="=") done=equals();
    else if(k==="C") reset();
    else if(k==="%") percent();
    else if(k==="neg") neg();
    else if(k==="Backspace") back();
    if(done!=="done"&&!(err&&k==="=")&&!(err&&SYM[k])) render();
  }
  document.getElementById("keys").addEventListener("click",function(e){
    var b=e.target.closest("button"); if(b) press(b.dataset.k);
  });
  document.addEventListener("keydown",function(e){
    var k=e.key;
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    if(k===","||k===".") k=".";
    else if(k==="Enter") k="=";
    else if(k==="Escape"||k==="Delete") k="C";
    else if(!/^[\d+\-*\/%=]$/.test(k)&&k!=="Backspace") return;
    e.preventDefault(); press(k);
  });
  render();
})();