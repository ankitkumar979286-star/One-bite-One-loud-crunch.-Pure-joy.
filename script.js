let products=[], cart=JSON.parse(localStorage.getItem("oneBiteCart")||"[]");

async function loadProducts(){
  products=await fetch("/api/products").then(r=>r.json());
  document.getElementById("productsGrid").innerHTML=products.map(p=>`
    <article class="card">
      <div class="pack">${p.name}</div>
      <small>${p.flavour} • ${p.category}</small>
      <h3>${p.name}</h3><p>${p.description}</p>
      <div class="price">₹${p.price}</div>
      <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
    </article>`).join("");
  renderCart();
}
function addToCart(id){
  const found=cart.find(x=>x.productId===id);
  if(found) found.quantity++;
  else cart.push({productId:id,quantity:1});
  save(); renderCart();
}
function save(){localStorage.setItem("oneBiteCart",JSON.stringify(cart))}
function renderCart(){
  const box=document.getElementById("cart");
  if(!cart.length){box.innerHTML="<p>Your cart is empty.</p>";return}
  let total=0;
  box.innerHTML=cart.map(item=>{
    const p=products.find(x=>x.id===item.productId); if(!p)return "";
    total+=p.price*item.quantity;
    return `<div class="cart-row"><span>${p.name} × ${item.quantity}</span>
    <span>₹${p.price*item.quantity}
    <button onclick="changeQty(${p.id},-1)">−</button>
    <button onclick="changeQty(${p.id},1)">+</button>
    </span></div>`;
  }).join("")+`<h3>Total: ₹${total}</h3>`;
}
function changeQty(id,delta){
  const x=cart.find(i=>i.productId===id); if(!x)return;
  x.quantity+=delta; if(x.quantity<=0)cart=cart.filter(i=>i.productId!==id);
  save();renderCart();
}
async function placeOrder(){
  const customerName=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("phone").value.trim();
  const address=document.getElementById("address").value.trim();
  const msg=document.getElementById("orderMsg");
  if(!customerName||!phone||!address||!cart.length){msg.textContent="Please fill all details and add a product.";return}
  const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerName,phone,address,items:cart})});
  const data=await r.json();
  if(!r.ok){msg.textContent=data.error;return}
  msg.textContent=`Order #${data.orderId} placed successfully. Total ₹${data.total}`;
  cart=[];save();renderCart();
}
loadProducts();
