const cakes = [
  {id:1,name:"Chocolate Dream",price:85000,img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85",desc:"Kue cokelat lembut dengan krim manis."},
  {id:2,name:"Strawberry Cake",price:90000,img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=85",desc:"Vanila lembut, stroberi segar, creamy."},
  {id:3,name:"Red Velvet",price:95000,img:"https://images.unsplash.com/photo-1614707267537-2b1e7d7a0c2d?auto=format&fit=crop&w=800&q=85",desc:"Red velvet klasik dengan cream cheese."},
  {id:4,name:"Berry Cheesecake",price:88000,img:"https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=85",desc:"Cheesecake creamy dengan buah berry."},
  {id:5,name:"Croissant Sweet",price:55000,img:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85",desc:"Pastry renyah, buttery, dan harum."}
];

let cart = JSON.parse(localStorage.getItem("hafizaCart") || "[]");
let lang = "id";

const text = {
 id:{
  navHome:"Beranda",navCakes:"Kue",navAbout:"Tentang",eyebrow:"Dibuat dengan cinta • Dipanggang setiap hari",
  heroTitle:"Manisnya bikin<br><em>jatuh hati.</em>",heroText:"Kue lembut, rasa hangat, dan momen kecil yang terasa lebih spesial. Temukan favoritmu di Hafiza Bakery.",
  heroButton:"Lihat Menu",menuEyebrow:"Menu pilihan",menuTitle:"Kue untuk setiap <em>momen.</em>",menuDesc:"Pilih kue favoritmu, masukkan ke keranjang, lalu pesan langsung melalui WhatsApp.",
  aboutEyebrow:"Tentang Hafiza Bakery",aboutTitle:"Sedikit manis,<br><em>banyak cerita.</em>",aboutText:"Hafiza Bakery hadir untuk menemani hari-harimu dengan kue yang fresh, lembut, dan dibuat sepenuh hati. Cocok untuk hadiah, kumpul keluarga, atau sekadar memanjakan diri.",
  cartEyebrow:"Pesananmu",cartTitle:"Keranjang <em>kue.</em>",total:"Total",checkoutNote:"Pesanan akan dibuka di WhatsApp dengan format otomatis.",empty:"Kue yang kamu cari belum ditemukan."
 },
 en:{
  navHome:"Home",navCakes:"Cakes",navAbout:"About",eyebrow:"Made with love • Baked every day",
  heroTitle:"Sweet enough to<br><em>fall in love.</em>",heroText:"Soft cakes, warm flavors, and little moments made extra special. Find your favorite at Hafiza Bakery.",
  heroButton:"View Menu",menuEyebrow:"Our picks",menuTitle:"Cakes for every <em>moment.</em>",menuDesc:"Pick your favorite cake, add it to the cart, then order directly through WhatsApp.",
  aboutEyebrow:"About Hafiza Bakery",aboutTitle:"A little sweet,<br><em>a lot of stories.</em>",aboutText:"Hafiza Bakery is here to brighten your days with fresh, soft cakes made with heart. Perfect for gifts, family gatherings, or simply treating yourself.",
  cartEyebrow:"Your order",cartTitle:"Cake <em>cart.</em>",total:"Total",checkoutNote:"Your order will open in WhatsApp with an automatic message.",empty:"No cakes match your search."
 }
};

function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}
function renderCakes(list=cakes){
 const grid=document.getElementById("cakeGrid");
 grid.innerHTML=list.map(c=>`<article class="cake-card">
  <img class="cake-img" src="${c.img}" alt="${c.name}" loading="lazy">
  <div class="cake-info"><h3>${c.name}</h3><p>${c.desc}</p>
  <div class="price-row"><span class="price">${rupiah(c.price)}</span><button class="add-btn" onclick="addToCart(${c.id})" aria-label="Tambah ${c.name}">+</button></div></div>
 </article>`).join("");
 document.getElementById("emptyState").hidden=list.length!==0;
}
function addToCart(id){
 const item=cart.find(x=>x.id===id);
 item?item.qty++:cart.push({id,qty:1});
 save();openCart();
}
function changeQty(id,delta){
 const item=cart.find(x=>x.id===id); if(!item)return;
 item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);save();renderCart();
}
function save(){localStorage.setItem("hafizaCart",JSON.stringify(cart));renderCart()}
function renderCart(){
 document.getElementById("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
 const box=document.getElementById("cartItems");
 box.innerHTML=cart.length?cart.map(x=>{const c=cakes.find(k=>k.id===x.id);return `<div class="cart-item">
 <img src="${c.img}" alt="${c.name}"><div><h4>${c.name}</h4><small>${rupiah(c.price)}</small>
 <div class="qty"><button onclick="changeQty(${c.id},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${c.id},1)">+</button></div></div>
 <strong>${rupiah(c.price*x.qty)}</strong></div>`}).join(""):`<p style="color:#786b64;font-size:14px">Keranjang masih kosong. Yuk pilih kue favoritmu ♡</p>`;
 const total=cart.reduce((a,x)=>a+(cakes.find(c=>c.id===x.id).price*x.qty),0);
 document.getElementById("cartTotal").textContent=rupiah(total);
}
function openCart(){document.getElementById("cartPanel").classList.add("open");document.getElementById("cartPanel").setAttribute("aria-hidden","false")}
function closeCart(){document.getElementById("cartPanel").classList.remove("open");document.getElementById("cartPanel").setAttribute("aria-hidden","true")}
function setLanguage(){
 lang=document.getElementById("language").value;
 document.querySelectorAll("[data-id]").forEach(el=>{const key=el.dataset.id;if(text[lang][key])el.innerHTML=text[lang][key]});
 document.documentElement.lang=lang;
 document.getElementById("searchInput").placeholder=lang==="id"?"Cari kue...":"Search cakes...";
}
document.getElementById("searchInput").addEventListener("input",e=>{
 const q=e.target.value.toLowerCase();renderCakes(cakes.filter(c=>(c.name+" "+c.desc).toLowerCase().includes(q)));
});
document.getElementById("language").addEventListener("change",setLanguage);
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("cartOverlay").addEventListener("click",closeCart);
document.getElementById("checkout").addEventListener("click",()=>{
 if(!cart.length){alert(lang==="id"?"Keranjang masih kosong.":"Your cart is empty.");return;}
 const lines=cart.map(x=>{const c=cakes.find(k=>k.id===x.id);return `• ${c.name} x${x.qty} — ${rupiah(c.price*x.qty)}`});
 const total=cart.reduce((a,x)=>a+cakes.find(c=>c.id===x.id).price*x.qty,0);
 const msg=`Halo Kak Hafiza Bakery! Saya mau pesan kue:%0A%0A${encodeURIComponent(lines.join("\n"))}%0A%0ATotal: ${encodeURIComponent(rupiah(total))}%0A%0AMohon info ketersediaan dan proses pesanannya ya. Terima kasih!`;
 window.open(`https://wa.me/6282148465860?text=${msg}`,"_blank");
});
renderCakes();renderCart();
