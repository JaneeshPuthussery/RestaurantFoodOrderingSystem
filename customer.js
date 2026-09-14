let customerId = localStorage.getItem("customerId");
let foodMenu = [];
let customerOrders = [];
let cartItems = [];

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("customerId");
    window.location.href = "login.html";
  });
}

const welcomeMessage = document.getElementById("welcomeMessage");
if (welcomeMessage) {
  const customerName = localStorage.getItem("customerName");
  welcomeMessage.textContent = customerName ? `Welcome, ${customerName}!` : "Welcome!";
}

function getFoodName(foodId) {
  const item = foodMenu.find(food => String(food.id) === String(foodId));
  return item ? item.foodName : `Item #${foodId}`;
}

function renderOrders() {
  const list = document.getElementById("orders");
  list.innerHTML = "";

  customerOrders.forEach((order, index) => {
    const itemNames = (order.orderitems || []).map(getFoodName).join(", ");
    const displayOrderId = Number.isFinite(Number(order.id)) ? Number(order.id) : index + 1;

    list.innerHTML += `
      <li class="order-item">
        <strong>Order #${displayOrderId}</strong><br>
        <span>Items: ${itemNames}</span>
        <div class="mt-2 d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary" onclick="editOrder('${order.id}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder('${order.id}')">Delete</button>
        </div>
      </li>
    `;
  });
}

function getCartDetails() {
  return cartItems.reduce((details, foodId) => {
    const food = foodMenu.find(item => String(item.id) === String(foodId));
    if (!food) return details;

    const existingItem = details.find(item => String(item.id) === String(food.id));
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      details.push({ ...food, quantity: 1 });
    }
    return details;
  }, []);
}

function renderCart() {
  const cart = document.getElementById("cart");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutButton");
  const cartDetails = getCartDetails();
  const total = cartDetails.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  cartCount.textContent = cartItems.length;
  cartTotal.textContent = `₹${total}`;
  checkoutButton.disabled = cartDetails.length === 0;

  if (cartDetails.length === 0) {
    cart.innerHTML = '<p class="text-muted mb-0">Your cart is empty.</p>';
    return;
  }

  cart.innerHTML = cartDetails.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.foodName}</strong>
        <div class="text-muted">₹${item.price} x ${item.quantity}</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" onclick="removeFromCart('${item.id}')">-</button>
        <span>${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="addToCart('${item.id}')">+</button>
      </div>
    </div>
  `).join("");
}

function loadFoodMenu() {
  return fetch("http://localhost:3000/foodItems")
    .then(res => res.json())
    .then(items => {
      foodMenu = items;
      let menu = document.getElementById("menu");
      menu.innerHTML = "";
      items.forEach(item => {
        menu.innerHTML += `
          <div class="menu-item mb-3">
            <img class="food-image" src="${item.image || "images/food-login-right.jpg"}" alt="${item.foodName}" onerror="this.src='images/food-login-right.jpg'">
            <div>
              <h5 class="mb-1">${item.foodName}</h5>
              <p class="mb-0 text-muted">₹${item.price}</p>
            </div>
            <button class="btn btn-primary" onclick="addToCart('${item.id}')">Add to Cart</button>
          </div>
        `;
      });
      renderCart();
    });
}

function addToCart(foodId) {
  document.getElementById("checkoutMessage").hidden = true;
  cartItems.push(foodId);
  renderCart();
}

function removeFromCart(foodId) {
  const itemIndex = cartItems.findIndex(item => String(item) === String(foodId));
  if (itemIndex !== -1) cartItems.splice(itemIndex, 1);
  renderCart();
}

function checkout() {
  const cartDetails = getCartDetails();
  if (cartDetails.length === 0) return;

  let order = {
    id: Date.now(),
    cid: customerId,
    orderitems: cartItems,
    orderdatetime: new Date().toISOString()
  };

  fetch("http://localhost:3000/Orders", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(order)
  }).then(response => {
    if (!response.ok) throw new Error("Order could not be placed");

    cartItems = [];
    renderCart();
    loadOrders();
    const checkoutMessage = document.getElementById("checkoutMessage");
    checkoutMessage.hidden = false;
    checkoutMessage.textContent = "Order placed successfully!";
  }).catch(error => {
    console.error(error);
    alert("Unable to place the order. Please try again.");
  });
}

function deleteOrder(orderId){
  fetch(`http://localhost:3000/Orders/${orderId}`, {
    method: "DELETE"
  }).then(() => loadOrders());
}

function editOrder(orderId){
  const order = customerOrders.find(item => String(item.id) === String(orderId));
  if (!order) return;

  const currentItemId = order.orderitems && order.orderitems.length ? order.orderitems[0] : "";
  const options = foodMenu.map(item => `${item.id}: ${item.foodName}`).join("\n");
  const selected = prompt(`Choose a new food item:\n${options}`, currentItemId);

  if (selected === null || selected === "") return;

  const updatedOrder = {
    ...order,
    orderitems: [Number(selected)]
  };

  fetch(`http://localhost:3000/Orders/${orderId}`, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(updatedOrder)
  }).then(() => loadOrders());
}

function loadOrders(){
  fetch(`http://localhost:3000/Orders?cid=${customerId}`)
    .then(res => res.json())
    .then(orders => {
      customerOrders = orders;
      renderOrders();
    });
}

loadFoodMenu().then(() => loadOrders());