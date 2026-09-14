const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("customerId");
    window.location.href = "login.html";
  });
}

// Add food
const addFoodForm = document.getElementById("addFoodForm");
if (addFoodForm) {
  addFoodForm.addEventListener("submit", function(e){
    e.preventDefault();
    let food = {
      foodName: document.getElementById("foodname").value.trim(),
      price: Number(document.getElementById("price").value),
      image: document.getElementById("foodimage").value.trim()
    };

    fetch("http://localhost:3000/foodItems", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(food)
    }).then(() => {
      addFoodForm.reset();
      loadFoodItems();
    });
  });
}

// View food
function loadFoodItems(){
  fetch("http://localhost:3000/foodItems")
    .then(res => res.json())
    .then(items => {
      let list = document.getElementById("foodList");
      if (!list) return;
      list.innerHTML = "";
      items.forEach(item => {
        list.innerHTML += `
          <div class="food-row">
            <img class="food-list-image" src="${item.image || "images/food-login-right.jpg"}" alt="${item.foodName}" onerror="this.src='images/food-login-right.jpg'">
            <div>
              <strong>${item.foodName}</strong><br>
              <span class="text-muted">₹${item.price}</span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" onclick="updateFood(${item.id})">Update</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteFood(${item.id})">Delete</button>
            </div>
          </div>
        `;
      });
    });
}

// Update food
function updateFood(id){
  let newPrice = prompt("Enter new price:");
  if(newPrice !== null && newPrice !== ""){
    fetch("http://localhost:3000/foodItems/" + id, {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ price: Number(newPrice) })
    }).then(() => loadFoodItems());
  }
}

// Delete food
function deleteFood(id){
  fetch("http://localhost:3000/foodItems/" + id, { method: "DELETE" })
    .then(() => loadFoodItems());
}

let allCustomers = [];

function getCustomerName(customerId) {
  const customer = allCustomers.find(item => String(item.id) === String(customerId));
  return customer ? customer.name : "Unknown Customer";
}

function getDisplayOrderId(order, index) {
  return Number.isFinite(Number(order.id)) ? Number(order.id) : index + 1;
}

function getFoodItemNames(orderItems) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) return "No items";

  const labels = orderItems.map(itemId => {
    const food = foodMenu.find(foodItem => String(foodItem.id) === String(itemId));
    return food ? food.foodName : `Item #${itemId}`;
  });

  return labels.join(", ");
}

// View orders
function loadOrders(){
  fetch("http://localhost:3000/foodItems")
    .then(res => res.json())
    .then(items => {
      foodMenu = items;
      return fetch("http://localhost:3000/customers");
    })
    .then(res => res.json())
    .then(customers => {
      allCustomers = customers;
      return fetch("http://localhost:3000/Orders", { cache: "no-store" });
    })
    .then(res => res.json())
    .then(orders => {
      let list = document.getElementById("orders");
      if (!list) return;
      list.innerHTML = "";
      orders.forEach((order, index) => {
        const displayOrderId = getDisplayOrderId(order, index);
        const customerName = getCustomerName(order.cid);
        const foodNames = getFoodItemNames(order.orderitems);

        list.innerHTML += `
          <li class="order-item">
            <strong>Order #${displayOrderId}</strong><br>
            <span>Customer: ${customerName}</span><br>
            <span>Items: ${foodNames}</span>
          </li>
        `;
      });
    });
}

loadFoodItems();
loadOrders();
setInterval(loadOrders, 3000);