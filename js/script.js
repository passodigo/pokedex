const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon__image');



const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let searchPokemon = 1 ;

const fetchPokemon = async (pokemon) => {

   const APIresponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    
   if (APIresponse.status === 200){
   const data = await APIresponse.json();
    return data;
   }
}



const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Loading. . . ';
    pokemonNumber.innerHTML = '';

    const data = await fetchPokemon(pokemon);

    if(data){
    pokemonImage.style.display = 'block';
    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src =
        data.sprites.versions['generation-v']['black-white'].animated.front_default ||
        data.sprites.front_default ||
        data.sprites.other['official-artwork'].front_default || 'fallback.png';

    input.value = '';
    searchPokemon = data.id;
    renderPokemonInfo(data.id);
    } else{
        pokemonImage.style.display = 'none';
        pokemonName.innerHTML = 'Not found :(';
        pokemonNumber.innerHTML = '';
    }
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const query = input.value.toLowerCase();
  const data = await fetchPokemon(query);

  if (data) {
    searchPokemon = data.id; // agora atualiza o id global
    renderPokemonInfo(query);
    renderPokemon(searchPokemon);
    renderPokemonExtras(searchPokemon);
  } else {
    pokemonName.innerHTML = 'Não encontrado';
    pokemonNumber.innerHTML = '';
    pokemonImage.style.display = 'none';
  }
});

    

buttonPrev.addEventListener('click', () => {
   if (searchPokemon > 1){
    searchPokemon -= 1;
   renderPokemon(searchPokemon);
   renderPokemonInfo(searchPokemon);
   renderPokemon(searchPokemon);
   renderPokemonExtras(searchPokemon);
}});

buttonNext.addEventListener('click', () => {
   searchPokemon += 1;
   renderPokemon(searchPokemon);
   renderPokemonInfo(searchPokemon);
   renderPokemon(searchPokemon);
   renderPokemonExtras(searchPokemon);
});

(function () {
  
  function getOrCreateFlavorEl() {
    let el = document.querySelector('.pokemon_flavor');
    if (el) return el;

    const container = document.querySelector('.pokemon') || document.body;
    const wrapper = document.createElement('div');
    wrapper.className = 'pokemon-extra';
    wrapper.innerHTML = '<h3>Curiosidade</h3><p class="pokemon_flavor">Carregando...</p>';

    if (container && container.parentNode) {
      container.parentNode.insertBefore(wrapper, container.nextSibling);
    } else {
      document.body.appendChild(wrapper);
    }
    return wrapper.querySelector('.pokemon_flavor');
  }

  async function fetchPokemonSpecies(idOrName) {
    try {
      const url = `https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(idOrName)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('PokéAPI species returned', res.status, res.statusText, url);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar pokemon-species:', err);
      return null;
    }
  }

 
  window.renderPokemonInfo = async function (pokemon) {
    const el = getOrCreateFlavorEl();
    el.innerText = 'Loading . . .';

   
    let idOrName = pokemon;
    if (typeof pokemon === 'object' && pokemon !== null) {
      idOrName = pokemon.id ?? pokemon.name;
    }
    if (idOrName == null) {
      el.innerText = 'Identificador inválido para curiosidade.';
      return null;
    }

    const species = await fetchPokemonSpecies(idOrName);
    if (!species) {
      el.innerText = 'Não foi possível obter as curiosidades (ver console).';
      return null;
    }

   
    const preferred = ['pt-br', 'pt', 'en'];
    let entry = null;
    for (const p of preferred) {
      entry = species.flavor_text_entries.find(e => e.language && e.language.name && e.language.name.toLowerCase() === p);
      if (entry) break;
    }
    if (!entry) entry = species.flavor_text_entries[0] || null;

    const text = entry ? entry.flavor_text.replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim() : 'Nenhuma curiosidade encontrada.';
    el.innerText = text;
   
    return { text, species };
  };
})();
(function () {
  // cria ou retorna o elemento
  function getOrCreateEl(className, title) {
    let el = document.querySelector(`.${className}`);
    if (el) return el;

    const container = document.querySelector('.pokemon') || document.body;
    const wrapper = document.createElement('div');
    wrapper.className = 'pokemon-extra-details';
    wrapper.innerHTML = `
      <h3>${title}</h3>
      <p class="${className}">Carregando...</p>
    `;

    if (container && container.parentNode) {
      container.parentNode.insertBefore(wrapper, container.nextSibling);
    } else {
      document.body.appendChild(wrapper);
    }

    return wrapper.querySelector(`.${className}`);
  }

  async function fetchSpecies(pokemon) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(pokemon)}`);
      if (!res.ok) throw new Error('Erro na requisição species');
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar species:', err);
      return null;
    }
  }

  async function fetchEvolutionChain(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro na requisição evolution');
      return await res.json();
    } catch (err) {
      console.error('Erro ao buscar evolution chain:', err);
      return null;
    }
  }

  window.renderPokemonExtras = async function (pokemon) {
    const habitatEl = getOrCreateEl('pokemon_habitat', 'Habitat');
    const shapeEl = getOrCreateEl('pokemon_shape', 'Forma');
    const evolutionEl = getOrCreateEl('pokemon_evolution', 'Evolução');

    habitatEl.innerText = "Carregando...";
    shapeEl.innerText = "Carregando...";
    evolutionEl.innerText = "Carregando...";

    // normaliza parâmetro
    let idOrName = pokemon;
    if (typeof pokemon === 'object' && pokemon !== null) {
      idOrName = pokemon.id ?? pokemon.name;
    }
    if (!idOrName) {
      habitatEl.innerText = "Inválido"; shapeEl.innerText = "Inválido"; evolutionEl.innerText = "Inválido";
      return;
    }

    const species = await fetchSpecies(idOrName);
    if (!species) {
      habitatEl.innerText = "Erro"; shapeEl.innerText = "Erro"; evolutionEl.innerText = "Erro";
      return;
    }

    // Habitat e Forma
    habitatEl.innerText = species.habitat?.name || "Desconhecido";
    shapeEl.innerText = species.shape?.name || "Desconhecida";

    // Evolução
    if (species.evolution_chain?.url) {
      const evoData = await fetchEvolutionChain(species.evolution_chain.url);
      if (evoData) {
        const chain = [];
        let current = evoData.chain;
        while (current) {
          chain.push(current.species.name);
          current = current.evolves_to[0];
        }
        evolutionEl.innerText = chain.join(" → ");
      } else {
        evolutionEl.innerText = "Não disponível";
      }
    } else {
      evolutionEl.innerText = "Não disponível";
    }
  };
})();


renderPokemon(searchPokemon);
renderPokemonInfo(searchPokemon);
renderPokemon(searchPokemon);
renderPokemonExtras(searchPokemon);

