
document.addEventListener("DOMContentLoaded", function () {
  const fridgeForm = document.getElementById("fridgeForm");
  const favoritesContainer = document.getElementById("favoritesContainer");

  // חיפוש מתכונים
  if (fridgeForm) {
    fridgeForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const input = document.getElementById("ingredientInput").value.trim();

      if (!input) return alert("Please enter ingredients.");

      try {
        const response = await fetch(`/api/fridge?ingredients=${encodeURIComponent(input)}`);
        const recipes = await response.json();
        displayRecipes(recipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        alert("Failed to load recipes.");
      }
    });
  }

  async function displayRecipes(recipes) {
    const resultsSection = document.getElementById("results");
    resultsSection.innerHTML = "";

    const container = document.createElement("div");
    container.className = "container4";

    recipes.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "card";

      const image = document.createElement("div");
      image.className = "card-image";
      image.innerHTML = `<img src="${recipe.image}" alt="${recipe.title}">`;

      const title = document.createElement("div");
      title.className = "card-title";
      title.innerHTML = `<h2>${recipe.title}</h2>`;

      const buttonWrap = document.createElement("div");
      buttonWrap.className = "price-text";
      buttonWrap.innerHTML = `<button>Save</button>`;

      buttonWrap.querySelector("button").addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;
        if (!user || !userId) {
          alert("Please log in to save recipes.");
          return;
        }

        const body = {
          userId,
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          sourceUrl: recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, "-")}-${recipe.id}`,
          ingredients: recipe.usedIngredients?.map(i => i.name) || []
        };

        try {
          const res = await fetch(`/api/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });

          const data = await res.json();
          alert(data.message);
        } catch (err) {
          console.error("Save error:", err);
          alert("Failed to save recipe.");
        }
      });

      card.appendChild(image);
      card.appendChild(title);
      card.appendChild(buttonWrap);
      container.appendChild(card);
    });

    resultsSection.appendChild(container);
  }

  // הצגת המועדפים
  if (favoritesContainer) {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) return;

    fetch(`/api/favorites/${userId}`)
      .then(res => res.json())
      .then(data => {
        favoritesContainer.innerHTML = "";
        if (!data.length) {
          favoritesContainer.innerHTML = "<p>No favorites found.</p>";
          return;
        }

      data.forEach(recipe => {
  const card = document.createElement("section");
  card.className = "card";

  const recipeUrl = recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, "-")}-${recipe.recipeId}`;

  card.innerHTML = `
    <section class="card-image">
      <img src="${recipe.image}" alt="${recipe.title}">
    </section>
    <section class="price-text">
      <a href="${recipeUrl}" target="_blank">
        <button>VIEW RECIPE</button>
      </a>
    </section>
    <section class="card-title">
      <h2>${recipe.title}</h2>
    </section>
    <section class="heart">
      <img 
        src="images/heart.png" 
        alt="Heart icon" 
        class="heart-icon active"
        data-recipe-id="${recipe.recipeId}"
        data-title="${recipe.title}"
        data-image="${recipe.image}"
        data-sourceurl="${recipeUrl}"
      >
    </section>
  `;

  favoritesContainer.appendChild(card);
});

      })
      .catch(err => {
        console.error("Error loading favorites:", err);
        favoritesContainer.innerHTML = "<p>Error loading favorites.</p>";
      });
  }
});


function displayRecipes(recipes) {
  const resultsSection = document.getElementById("results");
  resultsSection.innerHTML = ""; // ניקוי תוצאות קודמות

  if (!recipes.length) {
    resultsSection.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  const container = document.createElement("div");
  container.className = "container4";

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "card";

    const image = document.createElement("div");
    image.className = "card-image";
    image.innerHTML = `<img src="${recipe.image}" alt="${recipe.title}">`;

    const title = document.createElement("div");
    title.className = "card-title";
    title.innerHTML = `<h2>${recipe.title}</h2>`;

    const buttonWrap = document.createElement("div");
    buttonWrap.className = "price-text";
    buttonWrap.innerHTML = `
      <a href="https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, "-")}-${recipe.id}" target="_blank">
        <button>VIEW RECIPE</button>
      </a>`;

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(buttonWrap);

    container.appendChild(card);
  });

  resultsSection.appendChild(container);
}


// חיפוש מתכונים ב-recipebook
const recipeBookForm = document.getElementById("recipeBookForm");

if (recipeBookForm) {
  recipeBookForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("recipeInput").value.trim();

    if (!input) return alert("Please enter an ingredient.");

    try {
      const response = await fetch(`/api/fridge?ingredients=${encodeURIComponent(input)}`);
      const recipes = await response.json();
      console.log("Response from /api/fridge:", recipes);
      displayRecipes(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to load recipes.");
    }
  });
}

// Top Recipes --> index.html
// Top Recipes --> index.html
if (!window.location.pathname.includes("profile.html")) {
document.addEventListener("DOMContentLoaded", async () => {
  const topRecipesSection = document.querySelector(".container");

  try {
    const response = await fetch(
  `https://api.spoonacular.com/recipes/random?number=4&apiKey=c71dde573eb84f41a6cd0a89bac48bd0`
);

    const data = await response.json();

    data.recipes.forEach((recipe) => {
      const recipeCard = document.createElement("section");
      recipeCard.className = "card";
      const recipeUrl = `https://spoonacular.com/recipes/${recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${recipe.id}`;

      recipeCard.innerHTML = `
        <section class="card-image">
          <img src="${recipe.image}" alt="${recipe.title}">
        </section>
        <section class="price-text">
          <a href="${recipeUrl}" target="_blank">
            <button>VIEW RECIPE</button>
          </a>
        </section>
        <section class="card-title">
          <h2>${recipe.title}</h2>
        </section>
        <section class="heart">
          <img 
            src="images/heart.png" 
            alt="Heart icon" 
            class="heart-icon"
            data-recipe-id="${recipe.id}"
            data-title="${recipe.title}"
            data-image="${recipe.image}"
            data-sourceurl="${recipeUrl}"
          >
        </section>
      `;
      topRecipesSection.appendChild(recipeCard);
    });
  } catch (err) {
    console.error("Failed to load top recipes:", err);
  }
});
}

async function toggleSubscription(userId, button) {
  const statusCell = button.parentElement.previousElementSibling;
  const currentStatus = statusCell.textContent.toLowerCase();
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const res = await fetch(`/api/users/${userId}/subscription`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Failed to update subscription.");
      return;
    }

    statusCell.textContent =
      result.subscriptionStatus.charAt(0).toUpperCase() +
      result.subscriptionStatus.slice(1);
    statusCell.className = result.subscriptionStatus;
    button.textContent =
      result.subscriptionStatus === "active" ? "Deactivate" : "Activate";
  } catch (err) {
    console.error("Toggle error:", err);
    alert("Error updating subscription.");
  }
}

// טעינת המשתמשים לדף admin
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.location.pathname.includes("admin.html")) return;

  try {
    const res = await fetch("/api/admin/users");
    const users = await res.json();
    const tbody = document.getElementById("userTableBody");

    users.forEach(user => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.firstName} ${user.lastName}</td>
        <td>${user.username}</td>
        <td>${new Date(user.createdAt).toISOString().split('T')[0]}</td>
        <td class="${user.subscriptionStatus === 'active' ? 'active' : 'inactive'}">
          ${user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
        </td>
        <td><button onclick="toggleSubscription('${user._id}', this)">
          ${user.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
        </button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load admin users:", err);
  }
});

// ניהול סימון מתכונים כמועדפים icon love 

// ניהול כפתור הלב (שמירה/הסרה מועדפים)

document.addEventListener("click", async (e) => {
  const heart = e.target.closest(".heart-icon");
  if (!heart) return;

  const recipeId = heart.dataset.recipeId;
  const title = heart.dataset.title;
  const image = heart.dataset.image;
  const sourceUrl = heart.dataset.sourceurl;

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  if (!userId || !recipeId) {
    alert("You must be logged in to save favorites.");
    return;
  }

  const isSaved = heart.classList.toggle("active");

  console.log("Sending favorite with data:", {
    userId,
    recipeId,
    title,
    image,
    sourceUrl,
  });

  try {
    if (isSaved) {
      heart.classList.add("active");
      heart.src = "images/heart-filled.png";

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          recipeId,
          title,
          image,
          sourceUrl,
          ingredients: [],
        }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response body:", data);

      if (res.ok) {
        alert("Recipe saved to favorites!");
      } else {
        throw new Error(data.message || "Failed to save");
      }

    } else {
      heart.classList.remove("active");
      heart.src = "images/heart.png";

      const res = await fetch(`/api/favorites/${recipeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      console.log("🗑️ Delete status:", res.status);
      console.log("🗑️ Delete response:", data);

      if (res.ok) {
        alert("Recipe removed from favorites!");
        if (window.location.pathname.includes("profile.html")) {
          heart.closest(".card").remove();
        }
      } else {
        throw new Error(data.message || "Failed to remove");
      }
    }
  } catch (err) {
    console.error("Favorite error:", err);
    alert("Error updating favorites.");
  }
});


// הצגת מתכונים רנדומליים בדף recipebook.html
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.location.pathname.includes("recipebook.html")) return;

  const resultsSection = document.getElementById("results");

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/random?number=1&apiKey=c71dde573eb84f41a6cd0a89bac48bd0`
    );
    const data = await response.json();

    if (!data || !Array.isArray(data.recipes)) {
      console.error("Invalid data from Spoonacular:", data);
      return;
    }

    const container = document.createElement("div");
    container.className = "container4";

    data.recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "card";

      const image = document.createElement("div");
      image.className = "card-image";
      image.innerHTML = `<img src="${recipe.image}" alt="${recipe.title}">`;

      const title = document.createElement("div");
      title.className = "card-title";
      title.innerHTML = `<h2>${recipe.title}</h2>`;

      const buttonWrap = document.createElement("div");
      buttonWrap.className = "price-text";
      const recipeUrl = `https://spoonacular.com/recipes/${recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${recipe.id}`;

      buttonWrap.innerHTML = `
        <a href="${recipeUrl}" target="_blank">
          <button>VIEW RECIPE</button>
        </a>`;

      card.appendChild(image);
      card.appendChild(title);
      card.appendChild(buttonWrap);

      container.appendChild(card);
    });

    resultsSection.appendChild(container);

  } catch (err) {
    console.error("Failed to load random recipes:", err);
  }
});



/*Admin page */



























document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("signin.html")) {
    const form = document.getElementById("signupForm");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();

      if (!firstName || !lastName || !username || !password || !confirmPassword) {
        return alert("Please fill all fields.");
      }

      if (password !== confirmPassword) {
        return alert("Passwords do not match.");
      }

      try {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Signup successful! You can now log in.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Signup failed.");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Error during signup.");
      }
    });
  }
});






// addEventListener to protect admin.html
// This code checks if the user is an admin before allowing access to admin.html
// If the user is not an admin, it displays an access denied message and redirects them to index.html
document.addEventListener("DOMContentLoaded", () => {
  // הגנה על דף admin.html
  const path = window.location.pathname;
  if (path.includes("admin.html")) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      document.body.innerHTML = `
        <h1 style="text-align:center; margin-top: 100px; color: red;">⛔ Access Denied</h1>
        <p style="text-align:center;">This page is for admins only.</p>
        <a href="index.html" style="display:block; text-align:center; margin-top:20px;">Go back to homepage</a>
      `;
    }
  }
});


// ניהול כפתורי הפעלה/כיבוי בטבלה
// This code toggles the status of items in a table between "Active" and "Inactive
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("activate-btn") || e.target.classList.contains("deactivate-btn")) {
    const btn = e.target;
    const row = btn.closest("tr");
    const statusCell = row.querySelector("td:nth-child(4)");

    const isActive = statusCell.classList.contains("active");

    if (isActive) {
      // להפוך ל-Inactive
      statusCell.textContent = "Inactive";
      statusCell.classList.remove("active");
      statusCell.classList.add("inactive");
      btn.textContent = "Activate";
      btn.classList.remove("deactivate-btn");
      btn.classList.add("activate-btn");
    } else {
      // להפוך ל-Active
      statusCell.textContent = "Active";
      statusCell.classList.remove("inactive");
      statusCell.classList.add("active");
      btn.textContent = "Deactivate";
      btn.classList.remove("activate-btn");
      btn.classList.add("deactivate-btn");
    }
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      const target = this.getAttribute("data-tab");

      // Retirer tous les "active"
      buttons.forEach(btn => btn.classList.remove("active"));
      contents.forEach(content => content.classList.remove("active"));

      // Ajouter la classe active au bouton cliqué et au contenu correspondant
      this.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });
});





// eli 

function toggleMenu() {
  const nav = document.getElementById('topbar');
  const burger = document.getElementById('hamburger');
  const icon = document.getElementById('burger-icon');

  nav.classList.toggle('active');
  burger.classList.toggle('active');

  // change l'icône
  icon.textContent = nav.classList.contains('active') ? '✖' : '☰';
}



function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  const isProfile = window.location.pathname.includes("profile.html");
  const recommendedContainer = document.getElementById("recommendedContainer");

  if (!isProfile || !recommendedContainer) return;

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/random?number=5&apiKey=c71dde573eb84f41a6cd0a89bac48bd0`
    );
    const data = await response.json();

    data.recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "card";

      const recipeUrl = `https://spoonacular.com/recipes/${recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${recipe.id}`;

      card.innerHTML = `
        <section class="card-image">
          <img src="${recipe.image}" alt="${recipe.title}">
        </section>
        <section class="price-text">
          <a href="${recipeUrl}" target="_blank">
            <button>VIEW RECIPE</button>
          </a>
        </section>
        <section class="card-title">
          <h2>${recipe.title}</h2>
        </section>
      `;

      recommendedContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load recommended recipes:", err);
    recommendedContainer.innerHTML = "<p>Error loading recommendations.</p>";
  }
});


// הצגת גרפים בעמוד admin.html
// This code fetches user registration stats and displays them in a bar chart
//last visit left side of the admin page

document.addEventListener('DOMContentLoaded', async () => {
  const ctxBar = document.getElementById('barChart')?.getContext('2d');
  if (!ctxBar) return;

  try {
    const res = await fetch('/api/stats/registrations-per-month');
    const data = await res.json(); // 12 ערכים, אחד לכל חודש

    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Registrations',
          data: data,
          backgroundColor: '#BAD6DA',
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 20, // הגבלה ידנית ל־20
            ticks: {
              stepSize: 2,
              precision: 0,
              callback: function(value) {
                return Number.isInteger(value) ? value : null;
              }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Chart error:", err);
  }
});



/*
document.addEventListener('DOMContentLoaded', () => {
 Graphique en barres
  const ctxBar = document.getElementById('barChart').getContext('2d');
  const barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
      datasets: [{
        label: 'Visites',
        data: [150, 200, 180, 220, 170],
        backgroundColor: '#BAD6DA',
        borderRadius: 5,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Camembert (Pie Chart)
const categories = [
  { label: "Gluten Free", param: "gluten free", type: "diet" },
  { label: "Italian", param: "italian", type: "cuisine" },
  { label: "Dessert", param: "dessert", type: "type" },
  { label: "Summer Drink", param: "drink", type: "type" }
];

const fetchCounts = async () => {
  const counts = [];

  for (const cat of categories) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?${cat.type}=${cat.param}&apiKey=46696a68671d4eb2af50a5a34baa6942&number=1`;
    
    const res = await fetch(url);
    const data = await res.json();
    counts.push(data.totalResults);
  }

  // Générer le graphique avec les vraies données
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: categories.map(c => c.label),
      datasets: [{
        label: 'Catégories',
        data: counts,
        backgroundColor: ['#FFC98B', '#FFB284', '#E79796', '#C6C09C'],
        hoverOffset: 30
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#333',
            font: {
              size: 18,
              family: 'DM Serif Text'
            }
          }
        }
      }
    }
  });
};

fetchCounts();
});

*/

// Show "View Stats" button only for admin users
// This code checks the user's role and displays the button if they are an admin
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const viewStatsBtn = document.getElementById("viewStatsBtn");

  if (user && user.role === "admin") {
    viewStatsBtn.style.display = "inline-block";
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // מונע מעבר מיידי
      localStorage.removeItem("user"); // מוחק את המידע על המשתמש
      window.location.href = "login.html"; // מחזיר לעמוד התחברות
    });
  }
});
