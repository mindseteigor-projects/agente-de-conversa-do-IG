const stages=['Prospectado','Respondeu','Em atendimento','Interessado','Pediu modelo','Orçamento / negociação','Venda fechada','Não avançou'];
let conversations=JSON.parse(localStorage.getItem('igs_conversations')||'null')||[
{id:1,company:'Oficina Exemplo',phone:'(41) 99999-1111',stage:'Interessado',firstReply:18,updated:'2026-09-25',note:'Demonstrou interesse no site. Acompanhar próximo passo.',history:[
{from:'ig',text:'Olá! Tudo bem? Falo com o responsável pela Oficina Exemplo?',time:'09:10'},
{from:'client',text:'Olá, sim. Pode falar.',time:'09:28'},
{from:'ig',text:'Encontrei vocês no Google e queria apresentar uma ideia de site para o negócio.',time:'09:30'},
{from:'client',text:'Tenho interesse. Como seria?',time:'09:36'}]},
{id:2,company:'Estética Modelo',phone:'(41) 98888-2222',stage:'Pediu modelo',firstReply:7,updated:'2026-09-24',note:'Pediu para ver um exemplo de site.',history:[
{from:'ig',text:'Olá! Tudo bem? Falo com o responsável pela Estética Modelo?',time:'14:02'},
{from:'client',text:'Sim, sou eu.',time:'14:09'},
{from:'ig',text:'Encontrei vocês no Google e tenho uma ideia de apresentação online para o negócio.',time:'14:10'},
{from:'client',text:'Pode me mandar um modelo?',time:'14:12'}]},
{id:3,company:'Mercado Fictício',phone:'(41) 97777-3333',stage:'Respondeu',firstReply:42,updated:'2026-09-23',note:'Respondeu, mas conversa não avançou.',history:[
{from:'ig',text:'Olá! Tudo bem? Falo com o responsável pelo Mercado Fictício?',time:'11:15'},
{from:'client',text:'Sim.',time:'11:57'}]},
{id:4,company:'Studio Demonstração',phone:'(41) 96666-4444',stage:'Orçamento / negociação',firstReply:12,updated:'2026-09-22',note:'Chegou na etapa de negociação.',history:[
{from:'ig',text:'Olá! Tudo bem? Falo com o responsável pelo Studio Demonstração?',time:'10:20'},
{from:'client',text:'Sim, sou responsável.',time:'10:32'},
{from:'client',text:'Quanto fica para fazer um site?',time:'10:34'}]},
{id:5,company:'Café Ilustrativo',phone:'(41) 95555-5555',stage:'Não avançou',firstReply:0,updated:'2026-09-20',note:'Não respondeu à abordagem inicial.',history:[
{from:'ig',text:'Olá! Tudo bem? Falo com o responsável pelo Café Ilustrativo?',time:'16:05'}]},
{id:6,company:'Auto Demo',phone:'(41) 94444-6666',stage:'Venda fechada',firstReply:5,updated:'2026-09-19',note:'Venda marcada como fechada pelo usuário.',history:[
{from:'ig',text:'Olá! Tudo bem? Falo com o responsável pela Auto Demo?',time:'08:40'},
{from:'client',text:'Sim.',time:'08:45'},
{from:'client',text:'Gostei da ideia e quero seguir.',time:'08:52'}]}
];
let selectedId=null;
const $=id=>document.getElementById(id);
const save=()=>localStorage.setItem('igs_conversations',JSON.stringify(conversations));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const countStage=s=>conversations.filter(c=>c.stage===s).length;

function render(){
 const total=conversations.length, answered=conversations.filter(c=>c.stage!=='Prospectado').length;
 const interested=conversations.filter(c=>['Interessado','Pediu modelo','Orçamento / negociação','Venda fechada'].includes(c.stage)).length;
 $('sTotal').textContent=total;$('sAnswered').textContent=answered;$('sInterested').textContent=interested;$('sWon').textContent=countStage('Venda fechada');$('navCount').textContent=total;
 const max=Math.max(...stages.map(countStage),1);
 $('bars').innerHTML=stages.map(s=>`<div class="barline"><div><span>${s}</span><b>${countStage(s)}</b></div><div class="bar"><i style="width:${Math.max(countStage(s)?5:0,countStage(s)/max*100)}%"></i></div></div>`).join('');
 $('recent').innerHTML=conversations.slice().sort((a,b)=>b.id-a.id).slice(0,5).map(c=>`<div class="recent"><b>${esc(c.company)}</b><small>${esc(c.phone)} • ${esc(c.stage)} • ${c.updated}</small></div>`).join('')||'<div class="empty">Nenhuma conversa registrada.</div>';

 const q=($('search').value||'').toLowerCase(), f=$('stageFilter').value;
 const list=conversations.filter(c=>(!q||[c.company,c.phone,c.note].join(' ').toLowerCase().includes(q))&&(!f||c.stage===f));
 $('rows').innerHTML=list.map(c=>`<tr><td><b>${esc(c.company)}</b></td><td>${esc(c.phone)}</td><td><span class="pill">${esc(c.stage)}</span></td><td>${esc(c.updated)}</td><td><button class="secondary" onclick="openConversation(${c.id})">Ver conversa</button></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Nenhum resultado.</td></tr>';

 $('board').innerHTML=stages.map(s=>`<div class="col"><b>${s} (${countStage(s)})</b>${conversations.filter(c=>c.stage===s).map(c=>`<div class="ticket" onclick="openConversation(${c.id})"><b>${esc(c.company)}</b><small>${esc(c.phone)}</small></div>`).join('')||'<p class="empty">Nenhuma conversa.</p>'}</div>`).join('');

 const model=conversations.filter(c=>['Pediu modelo','Orçamento / negociação','Venda fechada'].includes(c.stage)).length;
 $('responseRate').textContent=total?Math.round(answered/total*100)+'%':'0%';
 $('interestRate').textContent=answered?Math.round(interested/answered*100)+'%':'0%';
 $('modelRate').textContent=total?Math.round(model/total*100)+'%':'0%';
 $('saleRate').textContent=total?Math.round(countStage('Venda fechada')/total*100)+'%':'0%';

 $('dropoff').innerHTML=stages.map(s=>`<div class="barline"><div><span>${s}</span><b>${countStage(s)}</b></div><div class="bar"><i style="width:${Math.max(countStage(s)?4:0,countStage(s)/max*100)}%"></i></div></div>`).join('');
 const replies=conversations.map(c=>Number(c.firstReply)).filter(n=>n>0);
 const avg=replies.length?Math.round(replies.reduce((a,b)=>a+b,0)/replies.length):0;
 $('timing').innerHTML=`<p><b>Média até primeira resposta:</b> ${avg} minutos</p><p><b>Mais rápida:</b> ${replies.length?Math.min(...replies):0} minutos</p><p><b>Mais demorada:</b> ${replies.length?Math.max(...replies):0} minutos</p>`;
 $('insight').innerHTML=`<h2>Leitura dos dados</h2><p>Hoje há <b>${answered}</b> conversas que responderam e <b>${interested}</b> que chegaram a interesse, pedido de modelo ou negociação. Use esses números para comparar abordagens e descobrir em qual etapa você mais perde contatos.</p>`;
 $('notesList').innerHTML=conversations.map(c=>`<div class="card notesItem"><h3>${esc(c.company)} <span class="pill">${esc(c.stage)}</span></h3><p>${esc(c.note||'Sem anotação.')}</p><small>${esc(c.phone)}</small></div>`).join('')||'<div class="card empty">Nenhuma anotação.</div>';
}

function show(view){
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===view));
 document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
 $('title').textContent={dashboard:'Visão geral',conversations:'Conversas',funnel:'Funil',analysis:'Análise',notes:'Anotações',settings:'Configurações'}[view];
}
document.querySelectorAll('.nav').forEach(n=>n.onclick=()=>show(n.dataset.view));
stages.forEach(s=>{ $('stageFilter').insertAdjacentHTML('beforeend',`<option>${s}</option>`);$('newStage').insertAdjacentHTML('beforeend',`<option>${s}</option>`); });
$('search').oninput=render;$('stageFilter').onchange=render;
function openNew(){ $('modal').classList.add('show') } $('newConversation').onclick=openNew;$('newConversation2').onclick=openNew;
$('cancel').onclick=()=> $('modal').classList.remove('show');
$('form').onsubmit=e=>{
 e.preventDefault();const f=new FormData(e.target);
 conversations.push({id:Date.now(),company:f.get('company'),phone:f.get('phone'),stage:f.get('stage'),firstReply:Number(f.get('firstReply')||0),updated:new Date().toISOString().slice(0,10),note:f.get('note'),history:[]});
 save();render();e.target.reset();$('modal').classList.remove('show');
};

window.openConversation=id=>{
 selectedId=id;const c=conversations.find(x=>x.id===id);if(!c)return;
 $('detailName').textContent=c.company;$('detailMeta').textContent=`${c.phone} • ${c.stage} • última atividade ${c.updated}`;
 $('detailSummary').innerHTML=`<b>Etapa:</b> ${esc(c.stage)}<br><b>Tempo até primeira resposta:</b> ${c.firstReply?c.firstReply+' minutos':'Não respondeu'}<br><b>Observação:</b> ${esc(c.note||'Nenhuma')}`;
 $('detailNote').value=c.note||'';
 $('history').innerHTML=c.history.length?c.history.map(m=>`<div class="bubble ${m.from==='client'?'client':'ig'}">${esc(m.text)}<small>${m.from==='client'?'Cliente':'IG Sites'} • ${esc(m.time||'')}</small></div>`).join(''):'<div class="empty">Nenhuma mensagem importada/registrada nesta conversa.</div>';
 $('conversationModal').classList.add('show');
};
$('closeDetail').onclick=()=> $('conversationModal').classList.remove('show');
$('saveNote').onclick=()=>{const c=conversations.find(x=>x.id===selectedId);if(c){c.note=$('detailNote').value;save();render();openConversation(c.id)}};

render();