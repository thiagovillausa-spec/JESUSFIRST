(()=> {
const products=window.JF_ENGLISH_PRODUCTS||[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>'$'+Number(n||0).toFixed(2);
const PAGE_SIZE=40;
let category='all',query='',sort='featured',page=1,selected=null,selectedOption='';
const validSlugs=new Set(products.map(p=>p.slug));
const rawCart=JSON.parse(localStorage.getItem('jf-en-cart')||'[]');
const cart=rawCart.filter(x=>validSlugs.has(x.slug)&&Number(x.qty)>0).map(x=>({...x,qty:Number(x.qty)||1}));
if(cart.length!==rawCart.length)localStorage.setItem('jf-en-cart',JSON.stringify(cart));
const categories=[...new Set(products.map(p=>p.category).filter(Boolean))];

function persist(){
  localStorage.setItem('jf-en-cart',JSON.stringify(cart));
  $('#cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);
}
function subtotal(){return cart.reduce((s,x)=>{const p=products.find(z=>z.slug===x.slug);return s+(p?.price||0)*x.qty},0)}
function shipping(){return subtotal()>=109.90?0:7}
function total(){return subtotal()+shipping()}
function filtered(){
  let a=products.filter(p=>category==='all'||p.category===category);
  if(query)a=a.filter(p=>(p.title+' '+(p.description||'')+' '+(p.source||'')).toLowerCase().includes(query));
  if(sort==='az')a.sort((a,b)=>a.title.localeCompare(b.title));
  else if(sort==='low')a.sort((a,b)=>(a.price??9999)-(b.price??9999));
  else if(sort==='high')a.sort((a,b)=>(b.price??-1)-(a.price??-1));
  return a;
}
function renderCategories(){
  const box=$('#categoryNav');
  box.innerHTML=['all',...categories].map(c=>`<button class="category-btn ${c===category?'active':''}" data-cat="${c}">${c==='all'?'SHOP ALL':c.toUpperCase()}</button>`).join('');
  $$('[data-cat]').forEach(b=>b.onclick=()=>{category=b.dataset.cat;page=1;render()});
}
function renderPagination(total){
  const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
  if(page>pages)page=pages;
  const box=$('#pagination');
  if(pages<=1){box.innerHTML='';return}
  let nums=[];
  for(let i=1;i<=pages;i++)if(i===1||i===pages||Math.abs(i-page)<=2)nums.push(i);
  let html=`<button class="page-btn" data-page="${page-1}" ${page===1?'disabled':''}>‹</button>`;
  let prev=0;
  for(const n of nums){
    if(prev&&n-prev>1)html+='<span>…</span>';
    html+=`<button class="page-btn ${n===page?'active':''}" data-page="${n}">${n}</button>`;
    prev=n;
  }
  html+=`<button class="page-btn" data-page="${page+1}" ${page===pages?'disabled':''}>›</button>`;
  box.innerHTML=html;
  $$('[data-page]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.page);if(n<1||n>pages||n===page)return;page=n;render();$('#shop').scrollIntoView({behavior:'smooth',block:'start'})});
}
function render(){
  const all=filtered();
  $('#count').textContent=all.length+' products';
  $('#emptyState').hidden=all.length>0;
  const start=(page-1)*PAGE_SIZE;
  const a=all.slice(start,start+PAGE_SIZE);
  $('#productGrid').innerHTML=a.map(p=>`
    <article class="product-card">
      <div class="product-img-wrap" data-open="${p.slug}">
        <img class="product-img" src="${p.images?.[0]||''}" alt="${p.title}" loading="lazy">
      </div>
      <div class="product-source">${p.source||p.category||''}</div>
      <h3 data-open="${p.slug}">${p.title}</h3>
      <p>${money(p.price)}</p>
    </article>`).join('');
  $$('[data-open]').forEach(x=>x.onclick=()=>openProduct(x.dataset.open));
  renderPagination(all.length);
  renderCategories();
}
function openDrawer(el){
  $('#backdrop').hidden=false;
  el.classList.add('open');
  el.setAttribute('aria-hidden','false');
}
function closeDrawers(){
  $$('.drawer').forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true')});
  $('#backdrop').hidden=true;
}
function renderGallery(p){
  const imgs=p.images||[];
  return `
    <div class="detail-gallery">
      <div class="detail-image"><img id="detailMainImage" src="${imgs[0]||''}" alt="${p.title}"></div>
      ${imgs.length>1?`<div class="detail-thumbs">${imgs.map((im,i)=>`<button class="detail-thumb ${i===0?'active':''}" data-img="${im}" aria-label="View image ${i+1}"><img src="${im}" alt=""></button>`).join('')}</div>`:''}
    </div>`;
}
function openProduct(slug){
  selected=products.find(p=>p.slug===slug);
  if(!selected)return;
  const opts=(selected.options||[]).filter(Boolean);
  selectedOption=opts[0]||'';
  $('#productDetail').innerHTML=`
    <div class="product-detail-grid">
      ${renderGallery(selected)}
      <div>
        <div class="product-source">${selected.source||selected.category||'JESUSFIRST'}</div>
        <h2 class="product-detail-title">${selected.title}</h2>
        <div class="detail-price">${money(selected.price)}</div>
        <p class="product-detail-desc">${selected.description||'Christian apparel with faith-inspired artwork.'}</p>
        <p class="product-detail-desc"><strong>Shipping across the United States.</strong><br>Free shipping over $109.90.</p>
        ${opts.length?`
          <label class="option-label">SELECT OPTION</label>
          <div class="size-row">${opts.map((o,i)=>`<button class="size-btn ${i===0?'active':''}" data-option="${o}">${o}</button>`).join('')}</div>
        `:''}
        <div class="detail-actions">
          <button class="primary" id="addCartDetail">ADD TO BAG</button>
        </div>
      </div>
    </div>`;
  $$('[data-img]').forEach(b=>b.onclick=()=>{
    $('#detailMainImage').src=b.dataset.img;
    $$('[data-img]').forEach(x=>x.classList.toggle('active',x===b));
  });
  $$('[data-option]').forEach(b=>b.onclick=()=>{
    selectedOption=b.dataset.option;
    $$('[data-option]').forEach(x=>x.classList.toggle('active',x===b));
  });
  $('#addCartDetail').onclick=()=>addToCart(selected,selectedOption);
  openDrawer($('#productDrawer'));
}
function addToCart(p,option=''){
  const f=cart.find(x=>x.slug===p.slug&&(x.option||'')===option);
  f?f.qty++:cart.push({slug:p.slug,option,qty:1});
  persist();
  renderCart();
  closeDrawers();
  openDrawer($('#cartDrawer'));
}
function renderCart(){
  if(!cart.length){
    $('#cartItems').innerHTML='<p class="note">Your bag is empty.</p>';
    $('#cartTotal').textContent='$0.00';
    return;
  }
  $('#cartItems').innerHTML=cart.map((x,i)=>{
    const p=products.find(z=>z.slug===x.slug);
    if(!p)return'';
    return `<div class="cart-row">
      <img src="${p.images?.[0]||''}" alt="">
      <div><strong>${p.title}</strong><p>${x.option?x.option+' · ':''}Qty. ${x.qty}</p><span>${money((p.price||0)*x.qty)}</span></div>
      <button class="remove" data-rm="${i}">Remove</button>
    </div>`;
  }).join('');
  $('#cartTotal').innerHTML=`<span style="display:block;font-size:11px;font-weight:400;color:#777">Products: ${money(subtotal())} · Shipping: ${shipping()===0?'FREE':money(shipping())}</span>${money(total())}`;
  $$('[data-rm]').forEach(b=>b.onclick=()=>{cart.splice(Number(b.dataset.rm),1);persist();renderCart()});
}
async function checkout(){
  if(!cart.length)return alert('Your bag is empty.');
  const btn=$('#checkoutBtn'),old=btn.textContent;
  btn.disabled=true;btn.textContent='OPENING STRIPE…';
  try{
    const items=cart.filter(x=>validSlugs.has(x.slug)).map(x=>({slug:x.slug,size:x.option||'',lang:'en',qty:Number(x.qty)||1}));
    if(!items.length)throw new Error('Your bag does not contain valid products.');
    const res=await fetch('https://tjeiyvgyhngztgnxtjaq.supabase.co/functions/v1/jesusfirst-create-checkout',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({store:'english',items})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.url)throw new Error(data.error||'Checkout is unavailable.');
    location.href=data.url;
  }catch(e){
    alert(e.message);
    btn.disabled=false;btn.textContent=old;
  }
}

$('#searchInput').oninput=e=>{query=e.target.value.trim().toLowerCase();page=1;render()};
$('#sortSelect').onchange=e=>{sort=e.target.value;page=1;render()};
$('#cartBtn').onclick=()=>{renderCart();openDrawer($('#cartDrawer'))};
$('#checkoutBtn').onclick=checkout;
$$('[data-close]').forEach(b=>b.onclick=closeDrawers);
$('#backdrop').onclick=closeDrawers;
persist();
render();
})();