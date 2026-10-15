let loggedIn=false;

async function adminLogin(){
  const username=document.getElementById("username").value;
  const password=document.getElementById("password").value;
  const msg=document.getElementById("loginMsg");
  const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
  const data=await r.json();
  if(!r.ok){msg.textContent=data.error;return}
  loggedIn=true;document.getElementById("loginBox").hidden=true;document.getElementById("dashboard").hidden=false;
  loadDashboard();
}
async function loadDashboard(){
  const stats=await fetch("/api/admin/stats").then(r=>r.json());
  document.getElementById("statProducts").textContent=stats.products;
  document.getElementById("statOrders").textContent=stats.orders;
  document.getElementById("statPending").textContent=stats.pending;
  document.getElementById("statRevenue").textContent="₹"+Number(stats.revenue).toFixed(0);

  const orders=await fetch("/api/admin/orders").then(r=>r.json());
  document.getElementById("orders").innerHTML=orders.length?orders.map(o=>`
    <div class="order">
      <b>Order #${o.id}</b> — ${o.customer_name}<br>
      <small>${o.phone} | ${o.address}</small>
      <p>${o.items.map(i=>`${i.name} × ${i.quantity} = ₹${i.price*i.quantity}`).join("<br>")}</p>
      <b>Total: ₹${o.total}</b><br>
      <select onchange="updateStatus(${o.id},this.value)">
        ${["Pending","Confirmed","Packed","Shipped","Delivered","Cancelled"].map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}
      </select>
    </div>`).join(""):"<p>No orders yet.</p>";
}
async function updateStatus(id,status){
  await fetch("/api/admin/orders/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
  loadDashboard();
}
