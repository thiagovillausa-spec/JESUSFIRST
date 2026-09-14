(()=>{
const products=window.JF_PRODUCTS||[];const variants=window.JF_VARIANTS||{};let category='oversized',query='',sort='featured',selected=null,selectedSize='M',selectedLanguage='pt',page=1;const PAGE_SIZE=40;
const favs=new Set(JSON.parse(localStorage.getItem('jf-favs')||'[]'));const rawCart=JSON.parse(localStorage.getItem('jf-cart')||'[]');const validSlugs=new Set(products.map(p=>p.slug));const cart=rawCart.filter(x=>validSlugs.has(x.slug)&&Number.isInteger(Number(x.qty))&&Number(x.qty)>0).map(x=>({...x,qty:Number(x.qty)}));if(cart.length!==rawCart.length)localStorage.setItem('jf-cart',JSON.stringify(cart));
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],money=n=>n==null?'Preço em breve':'$'+n.toFixed(2);
const catName=c=>({lancamentos:'Lançamentos',feminino:'Feminino',oversized:'Oversized Masculina',masculino:'Masculino',infantil:'Infantil'}[c]||c);
const variantFor=(p,lang)=>lang==='en'&&variants[p.slug]?.images?.length?variants[p.slug]:null;
const imagesFor=(p,lang)=>variantFor(p,lang)?.images||p.images||[];
const labelForLang=lang=>lang==='en'?'English':'Português';
function persist(){localStorage.setItem('jf-favs',JSON.stringify([...favs]));localStorage.setItem('jf-cart',JSON.stringify(cart));updateBadges()}
function cartSubtotal(){return cart.reduce((sum,x)=>{const p=products.find(z=>z.slug===x.slug);return sum+(p?.price||0)*x.qty},0)}
function shippingCost(){return cartSubtotal()>=109.90?0:7}
function cartTotal(){return cartSubtotal()+shippingCost()}
function listAll(){let a=products.filter(p=>category==='lancamentos'?p.newArrival:p.category===category);if(query)a=a.filter(p=>(p.title+' '+(p.subcategory||'')+' '+(p.description||'')).toLowerCase().includes(query));if(sort==='az')a.sort((x,y)=>x.title.localeCompare(y.title));else if(sort==='low')a.sort((x,y)=>(x.price??9999)-(y.price??9999));else if(sort==='high')a.sort((x,y)=>(y.price??-1)-(x.price??-1));else a.sort((x,y)=>(y.featured?1:0)-(x.featured?1:0)||x.title.localeCompare(y.title));return a}
function renderPagination(total){const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));if(page>pages)page=pages;const box=$('#pagination');if(pages<=1){box.innerHTML='';return}let nums=[];for(let i=1;i<=pages;i++){if(i===1||i===pages||Math.abs(i-page)<=2)nums.push(i)}let html=`<button class="page-btn" data-page="${page-1}" ${page===1?'disabled':''}>‹</button>`;let prev=0;for(const n of nums){if(prev&&n-prev>1)html+='<span>…</span>';html+=`<button class="page-btn ${n===page?'active':''}" data-page="${n}">${n}</button>`;prev=n}html+=`<button class="page-btn" data-page="${page+1}" ${page===pages?'disabled':''}>›</button>`;box.innerHTML=html;$$('[data-page]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.page);if(n<1||n>pages||n===page)return;page=n;render();document.querySelector('.catalog').scrollIntoView({behavior:'smooth',block:'start'})})}
function render(){const all=listAll();$('#productCount').textContent=all.length+' produtos';$('#emptyState').hidden=all.length>0;const start=(page-1)*PAGE_SIZE,a=all.slice(start,start+PAGE_SIZE);$('#productGrid').innerHTML=a.map(p=>`<article class="product-card"><div class="product-image" data-open="${p.slug}"><img src="${p.images?.[0]||''}" alt="${p.title}" loading="lazy">${p.newArrival?'<span class="new-tag">NOVO</span>':''}</div><button class="heart ${favs.has(p.slug)?'active':''}" data-fav="${p.slug}" aria-label="Favoritar">${favs.has(p.slug)?'♥':'♡'}</button><div class="product-meta"><div class="product-category">${p.subcategory||catName(p.category)}</div><div class="product-name" data-open="${p.slug}">${p.title}</div><div class="product-price ${p.price==null?'pending':''}">${money(p.price)}</div></div></article>`).join('');renderPagination(all.length);$$('[data-open]').forEach(x=>x.onclick=()=>openProduct(x.dataset.open));$$('[data-fav]').forEach(x=>x.onclick=e=>{e.stopPropagation();toggleFav(x.dataset.fav)})}
function setCategory(c){category=c;query='';page=1;$('#searchInput').value='';$('#pageTitle').textContent=catName(c);$('#crumbCurrent').textContent=catName(c);$$('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.category===c));$('#mainNav').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'})}
function toggleFav(slug){favs.has(slug)?favs.delete(slug):favs.add(slug);persist();render();renderFavorites()}
function updateBadges(){$('#favBadge').textContent=favs.size;$('#cartBadge').textContent=cart.reduce((s,x)=>s+x.qty,0)}
function openDrawer(el){$('#drawerBackdrop').hidden=false;el.classList.add('open');el.setAttribute('aria-hidden','false')}function closeDrawers(){$$('.drawer').forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true')});$('#drawerBackdrop').hidden=true}
function openProduct(slug){
selected=products.find(p=>p.slug===slug);if(!selected)return;
selectedSize='M';selectedLanguage='pt';
const sizes=selected.category==='infantil'?['2','4','6','8','10','12']:selected.category==='oversized'?['S','M','L','XL','2XL']:['S','M','L','XL'];
const hasEnglish=!!variants[selected.slug]?.images?.length;
const renderGallery=()=>{
 const imgs=imagesFor(selected,selectedLanguage);const gallery=$('#productGallery');
 gallery.innerHTML=`<div class="detail-image"><img id="detailMainImage" src="${imgs[0]||''}" alt="${selected.title}"></div>${imgs.length>1?`<div class="detail-thumbs">${imgs.map((im,i)=>`<button class="detail-thumb ${i===0?'active':''}" data-img="${im}"><img src="${im}" alt=""></button>`).join('')}</div>`:''}`;
 $$('[data-img]').forEach(b=>b.onclick=()=>{$('#detailMainImage').src=b.dataset.img;$$('[data-img]').forEach(x=>x.classList.toggle('active',x===b))});
};
$('#productDetail').innerHTML=`<div class="product-detail-grid"><div id="productGallery"></div><div><div class="detail-category">${selected.subcategory||catName(selected.category)}</div><h2 class="detail-title">${selected.title}</h2><div class="detail-price">${money(selected.price)}</div><p class="detail-desc">${selected.description||'Peça cristã com acabamento premium e estampa de alta durabilidade.'}</p><p class="detail-desc"><strong>Entrega em qualquer lugar dos Estados Unidos.</strong><br>Não existe pedido mínimo.</p>${hasEnglish?`<label class="option-label">Idioma da estampa / Print language</label><div class="language-row"><button class="language-btn active" data-lang="pt">PORTUGUÊS</button><button class="language-btn" data-lang="en">ENGLISH</button></div>`:''}<label class="option-label">Tamanho</label><div class="size-row">${sizes.map(s=>`<button class="size-btn ${s==='M'?'active':''}" data-size="${s}">${s}</button>`).join('')}</div><div class="detail-actions"><button class="primary" id="addCartDetail" ${selected.price==null?'disabled':''}>ADICIONAR À SACOLA</button><button class="secondary" id="favDetail">${favs.has(selected.slug)?'♥ FAVORITO':'♡ FAVORITAR'}</button></div>${selected.price==null?'<p class="checkout-note">Preço ainda não definido para esta categoria.</p>':''}</div></div>`;
renderGallery();
$$('[data-lang]').forEach(b=>b.onclick=()=>{selectedLanguage=b.dataset.lang;$$('[data-lang]').forEach(x=>x.classList.toggle('active',x===b));renderGallery()});
$$('[data-size]').forEach(b=>b.onclick=()=>{selectedSize=b.dataset.size;$$('[data-size]').forEach(x=>x.classList.toggle('active',x===b))});
$('#favDetail').onclick=()=>{toggleFav(selected.slug);$('#favDetail').textContent=favs.has(selected.slug)?'♥ FAVORITO':'♡ FAVORITAR'};
const add=$('#addCartDetail');if(add)add.onclick=()=>addCart(selected,selectedSize,selectedLanguage);
openDrawer($('#productDrawer'));
}
function addCart(p,size,lang='pt'){if(p.price==null)return;const found=cart.find(x=>x.slug===p.slug&&x.size===size&&(x.lang||'pt')===lang);found?found.qty++:cart.push({slug:p.slug,size,qty:1,lang});persist();renderCart();closeDrawers();openDrawer($('#cartDrawer'))}
function renderCart(){if(!cart.length){$('#cartItems').innerHTML='<p class="checkout-note">Sua sacola está vazia.</p>';$('#cartTotal').textContent='$0.00';return}$('#cartItems').innerHTML=cart.map((x,i)=>{const p=products.find(z=>z.slug===x.slug);if(!p)return'';return `<div class="cart-row"><img src="${imagesFor(p,x.lang||'pt')[0]||''}" alt=""><div><strong>${p.title}</strong><p>Tamanho ${x.size} · ${labelForLang(x.lang||'pt')} · Qtd. ${x.qty}</p><p>${money(p.price)}</p></div><button class="remove" data-remove="${i}">Remover</button></div>`}).join('');$('#cartTotal').innerHTML=`<span style="display:block;font-size:12px;font-weight:400;color:#666">Produtos: ${money(cartSubtotal())} · Frete: ${shippingCost()===0?'GRÁTIS':money(shippingCost())}</span>${money(cartTotal())}`;$$('[data-remove]').forEach(b=>b.onclick=()=>{cart.splice(Number(b.dataset.remove),1);persist();renderCart()})}
function renderFavorites(){const a=products.filter(p=>favs.has(p.slug));$('#favoriteItems').innerHTML=a.length?a.map(p=>`<div class="favorite-row"><img src="${p.images?.[0]||''}" alt=""><div><strong>${p.title}</strong><p>${money(p.price)}</p></div><button class="remove" data-unfav="${p.slug}">Remover</button></div>`).join(''):'<p class="checkout-note">Você ainda não favoritou nenhum produto.</p>';$$('[data-unfav]').forEach(b=>b.onclick=()=>toggleFav(b.dataset.unfav))}
function orderText(method){const lines=cart.map(x=>{const p=products.find(z=>z.slug===x.slug);return p?`• ${p.title} | Tam. ${x.size} | Idioma: ${labelForLang(x.lang||'pt')} | Qtd. ${x.qty} | ${money((p.price||0)*x.qty)}`:''}).filter(Boolean);return ['Olá! Quero finalizar meu pedido na JESUSFIRST.','',...lines,'',`Subtotal: ${money(cartSubtotal())}`,`Frete: ${shippingCost()===0?'GRÁTIS':money(shippingCost())}`,`Total: ${money(cartTotal())}`,`Forma de pagamento: ${method}`,'Entrega: Estados Unidos'].join('\n')}
function whatsappOrder(method){window.open('https://wa.me/15082154196?text='+encodeURIComponent(orderText(method)),'_blank')}
function renderCheckout(){const qty=cart.reduce((s,x)=>s+x.qty,0);const sub=cartSubtotal(),ship=shippingCost();$('#checkoutSummary').innerHTML=`<strong>${qty} item(ns)</strong><br>Subtotal dos produtos: <strong>${money(sub)}</strong><br>Frete: <strong>${ship===0?'GRÁTIS':money(ship)}</strong>${sub<109.90?`<br><small>Faltam ${money(109.90-sub)} para ganhar frete grátis.</small>`:'<br><small>Você ganhou frete grátis.</small>'}<br><br>Total: <strong>${money(sub+ship)}</strong><br>Entrega em qualquer lugar dos Estados Unidos<br>Sem pedido mínimo<br><br><div class="coupon-note"><strong>Tem cupom?</strong><br>O código promocional poderá ser digitado no checkout seguro do Stripe.</div>`;$('#paymentInstructions').hidden=true;$('#paymentInstructions').innerHTML=''}
function showPayment(type){const box=$('#paymentInstructions');box.hidden=false;if(type==='stripe')box.innerHTML='<strong>Cartão / Stripe</strong>O pagamento será feito no checkout seguro do Stripe. O cliente poderá inserir um <b>código promocional/cupom</b> antes de pagar. O total incluirá o frete de $7 quando aplicável e frete grátis acima de $109,90.';if(type==='zelle')box.innerHTML='<strong>Pagar com Zelle</strong>Envie o pagamento para <b>978 310-9700</b>. Depois, envie o pedido e o comprovante pelo WhatsApp.<br><button class="primary" id="sendWhatsZelle">ENVIAR PEDIDO NO WHATSAPP</button>';if(type==='venmo')box.innerHTML='<strong>Pagar com Venmo</strong>Envie para <b>@blckboston</b>. Depois, envie o pedido e o comprovante pelo WhatsApp.<br><button class="primary" id="sendWhatsVenmo">ENVIAR PEDIDO NO WHATSAPP</button>';const z=$('#sendWhatsZelle'),v=$('#sendWhatsVenmo');if(z)z.onclick=()=>whatsappOrder('Zelle');if(v)v.onclick=()=>whatsappOrder('Venmo')}
$$('.nav-link').forEach(b=>b.onclick=()=>setCategory(b.dataset.category));$('[data-route]').onclick=e=>{e.preventDefault();setCategory('oversized')};$('#searchForm').onsubmit=e=>{e.preventDefault();query=$('#searchInput').value.trim().toLowerCase();page=1;render()};$('#searchMobileBtn').onclick=()=>{const q=prompt('O que você procura?');if(q!==null){query=q.trim().toLowerCase();page=1;render()}};$('#sortSelect').onchange=e=>{sort=e.target.value;page=1;render()};$('#mobileMenuBtn').onclick=()=>$('#mainNav').classList.toggle('open');$('#cartBtn').onclick=()=>{renderCart();openDrawer($('#cartDrawer'))};$('#favoritesBtn').onclick=()=>{renderFavorites();openDrawer($('#favoritesDrawer'))};$$('[data-close]').forEach(b=>b.onclick=closeDrawers);$('#drawerBackdrop').onclick=closeDrawers;
$('#checkoutBtn').onclick=()=>{if(!cart.length)return alert('Sua sacola está vazia.');renderCheckout();closeDrawers();openDrawer($('#checkoutDrawer'))};
async function startStripeCheckout(){
  if(!cart.length)return alert('Sua sacola está vazia.');
  const btn=$('#stripePay'),box=$('#paymentInstructions');
  const original=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML='<strong>Abrindo Stripe…</strong><span>Aguarde um instante</span>';
  box.hidden=false;
  box.innerHTML='<strong>Checkout seguro</strong>Estamos preparando seu pedido no Stripe.';
  try{
    const items=cart.filter(x=>products.some(p=>p.slug===x.slug)).map(x=>({slug:x.slug,size:x.size,lang:x.lang||'pt',qty:Number(x.qty)||1}));
    if(!items.length)throw new Error('Sua sacola não contém produtos válidos. Atualize a página e adicione os produtos novamente.');
    const res=await fetch('https://tjeiyvgyhngztgnxtjaq.supabase.co/functions/v1/jesusfirst-create-checkout',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({items})
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.url)throw new Error(data.error||'Não foi possível abrir o Stripe Checkout.');
    window.location.href=data.url;
  }catch(err){
    box.hidden=false;
    box.innerHTML='<strong>Não foi possível abrir o Stripe</strong>'+(err?.message||'Tente novamente em instantes.');
    btn.disabled=false;
    btn.innerHTML=original;
  }
}
$('#stripePay').onclick=startStripeCheckout;$('#zellePay').onclick=()=>showPayment('zelle');$('#venmoPay').onclick=()=>showPayment('venmo');
updateBadges();render();
})();

(()=> {
  const slider=document.getElementById('heroSlider');
  if(!slider)return;
  const slides=[...slider.querySelectorAll('.hero-slide')];
  const dots=[...slider.querySelectorAll('.hero-dot')];
  const prev=slider.querySelector('.hero-prev');
  const next=slider.querySelector('.hero-next');
  let index=0,timer=null,startX=0;
  const show=(n)=>{
    index=(n+slides.length)%slides.length;
    slides.forEach((s,i)=>{
      const on=i===index;
      s.classList.toggle('active',on);
      s.setAttribute('aria-hidden',on?'false':'true');
      s.tabIndex=on?0:-1;
    });
    dots.forEach((d,i)=>d.classList.toggle('active',i===index));
  };
  const stop=()=>{if(timer){clearInterval(timer);timer=null}};
  const start=()=>{stop();timer=setInterval(()=>show(index+1),5000)};
  prev?.addEventListener('click',e=>{e.stopPropagation();show(index-1);start()});
  next?.addEventListener('click',e=>{e.stopPropagation();show(index+1);start()});
  dots.forEach((d,i)=>d.addEventListener('click',e=>{e.stopPropagation();show(i);start()}));
  slides.forEach(s=>s.addEventListener('click',()=>{
    const cat=s.dataset.bannerCategory;
    const target=document.querySelector('.nav-link[data-category="'+cat+'"]');
    if(target){target.click();setTimeout(()=>document.querySelector('.catalog')?.scrollIntoView({behavior:'smooth',block:'start'}),120)}
  }));
  slider.addEventListener('mouseenter',stop);
  slider.addEventListener('mouseleave',start);
  slider.addEventListener('focusin',stop);
  slider.addEventListener('focusout',start);
  slider.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;stop()},{passive:true});
  slider.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)show(index+(dx<0?1:-1));start()},{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  show(0);start();
})();
