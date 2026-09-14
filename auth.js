// Customer Login
const customerForm = document.getElementById("customerLoginForm");
if (customerForm) {
  customerForm.addEventListener("submit", function(e){
    e.preventDefault();
    let email = document.getElementById("custEmail").value.trim();
    let password = document.getElementById("custPassword").value.trim();

    fetch("http://localhost:3000/customers")
      .then(res => res.json())
      .then(customers => {
        const customer = customers.find(c => c.email === email && c.password === password);

        if (customer) {
          localStorage.setItem("customerId", customer.id);
          localStorage.setItem("customerName", customer.name || customer.email);
          window.location.href = "customer.html";
        } else {
          alert("Invalid credentials!");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Login failed. Please try again.");
      });
  });
}

// Admin Login
const adminForm = document.getElementById("adminLoginForm");
if (adminForm) {
  adminForm.addEventListener("submit", function(e){
    e.preventDefault();
    let user = document.getElementById("adminUser").value.trim();
    let pass = document.getElementById("adminPass").value.trim();

    if(user === "admin" && pass === "123"){
      window.location.href = "admin.html";
    } else {
      alert("Invalid admin credentials!");
    }
  });
}