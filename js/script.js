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
    
   if (APIresponse.status==200){
   const data = await APIresponse.json();
    return data;
   }
}



const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Loading. . . ';
    
    const data = await fetchPokemon(pokemon);

    if(data){

    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src =
        data.sprites.versions['generation-v']['black-white'].animated.front_default ||
        data.sprites.front_default ||
        data.sprites.other['official-artwork'].front_default;

    input.value = '';
    searchPokemon = data.id;
    renderPokemonInfo(data.id);
    } else{
        pokemonName.innerHTML = 'Not found :(';
        pokemonNumber.innerHTML = '';
    }
}
form.addEventListener('submit', (event) => {

    event.preventDefault();
    renderPokemon (input.value.toLowerCase())
    input.value = '';
    renderPokemonInfo(input.value.toLowerCase());
});
buttonPrev.addEventListener('click', () => {
   if (searchPokemon > 1){
    searchPokemon -= 1;
   renderPokemon(searchPokemon);
   renderPokemonInfo(searchPokemon);
}});

buttonNext.addEventListener('click', () => {
   searchPokemon += 1;
   renderPokemon(searchPokemon);
   renderPokemonInfo(searchPokemon);
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

renderPokemon(searchPokemon);
renderPokemonInfo(searchPokemon);


