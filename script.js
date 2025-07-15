const container = document.getElementById('recipes');

async function searchRecipes() {
  const query = document.getElementById('query').value.trim();
  if (!query) return alert("Please enter a search term.");

  const apiKey = '4b205dac6d0746e5bac4a9302dcfdc7b'; 
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&apiKey=${apiKey}`;

  try {
    container.innerHTML = '<p>Loading recipes…</p>';
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results.length) {
      container.innerHTML = '<p>No recipes found.</p>';
      return;
    }
    showRecipes(data.results);
  } catch {
    container.innerHTML = '<p>Error fetching recipes.</p>';
  }
}

function showRecipes(list) {
  container.innerHTML = '';
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${r.image}" alt="${r.title}">
      <div class="card-body">
        <h3>${r.title}</h3>
        <a href="https://spoonacular.com/recipes/${r.title.replace(/\s+/g, '-').toLowerCase()}-${r.id}" target="_blank">View Recipe</a>
      </div>`;
    container.appendChild(card);
  });
}
