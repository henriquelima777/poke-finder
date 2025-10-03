// Mapeamento de gerações para IDs da PokéAPI e versões de jogos
const GENERATION_CONFIG = {
    1: {
        id: 1,
        name: "Geração I - Red/Green/Blue",
        versions: ["red", "blue", "yellow"]
    },
    2: {
        id: 2,
        name: "Geração II - Gold/Silver/Crystal",
        versions: ["gold", "silver", "crystal"]
    },
    3: {
        id: 3,
        name: "Geração III - Ruby/Sapphire/Emerald",
        versions: ["ruby", "sapphire", "emerald"]
    },
    4: {
        id: 4,
        name: "Geração IV - Diamond/Pearl/Platinum",
        versions: ["diamond", "pearl", "platinum"]
    },
    5: {
        id: 5,
        name: "Geração V - Black/White",
        versions: ["black", "white", "black-2", "white-2"]
    },
    6: {
        id: 6,
        name: "Geração VI - X/Y",
        versions: ["x", "y"]
    },
    7: {
        id: 7,
        name: "Geração VII - Sun/Moon",
        versions: ["sun", "moon", "ultra-sun", "ultra-moon"]
    },
    8: {
        id: 8,
        name: "Geração VIII - Sword/Shield",
        versions: ["sword", "shield"]
    },
    9: {
        id: 9,
        name: "Geração IX - Scarlet/Violet",
        versions: ["scarlet", "violet"]
    }
};

// Estado da aplicação
let currentGeneration = null;
let allPokemons = [];
let currentPokemon = null;

// Elementos do DOM
const generationMenu = document.getElementById('generation-menu');
const pokemonList = document.getElementById('pokemon-list');
const pokemonDetails = document.getElementById('pokemon-details');
const generationTitle = document.getElementById('generation-title');
const pokemonGrid = document.getElementById('pokemon-grid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const backButton = document.getElementById('back-button');
const backToListButton = document.getElementById('back-to-list-button');
const pokemonDetailsContent = document.getElementById('pokemon-details-content');

// Event Listeners
document.querySelectorAll('.generation-card').forEach(card => {
    card.addEventListener('click', () => {
        const generation = card.dataset.generation;
        loadGeneration(generation);
    });
});

backButton.addEventListener('click', () => {
    showGenerationMenu();
});

backToListButton.addEventListener('click', () => {
    showPokemonList();
});

searchInput.addEventListener('input', (e) => {
    filterPokemons(e.target.value);
});

// Funções de navegação
function showGenerationMenu() {
    generationMenu.classList.remove('hidden');
    pokemonList.classList.add('hidden');
    pokemonDetails.classList.add('hidden');
}

function showPokemonList() {
    generationMenu.classList.add('hidden');
    pokemonList.classList.remove('hidden');
    pokemonDetails.classList.add('hidden');
}

function showPokemonDetails() {
    generationMenu.classList.add('hidden');
    pokemonList.classList.add('hidden');
    pokemonDetails.classList.remove('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
    pokemonGrid.innerHTML = '';
}

function hideLoading() {
    loading.classList.add('hidden');
}

// Função para carregar uma geração
async function loadGeneration(generationNumber) {
    currentGeneration = GENERATION_CONFIG[generationNumber];
    generationTitle.textContent = currentGeneration.name;
    searchInput.value = '';
    
    showPokemonList();
    showLoading();
    
    try {
        // Buscar dados da geração
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${currentGeneration.id}/`);
        const data = await response.json();
        
        // Processar lista de Pokémons
        allPokemons = await Promise.all(
            data.pokemon_species.map(async (species) => {
                try {
                    // Obter dados básicos do Pokémon
                    const pokemonId = species.url.split('/').filter(Boolean).pop();
                    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
                    const pokemonData = await pokemonResponse.json();
                    
                    return {
                        id: pokemonData.id,
                        name: pokemonData.name,
                        sprite: pokemonData.sprites.front_default || pokemonData.sprites.other['official-artwork'].front_default,
                        speciesUrl: species.url
                    };
                } catch (error) {
                    console.error(`Erro ao carregar Pokémon ${species.name}:`, error);
                    return null;
                }
            })
        );
        
        // Filtrar Pokémons nulos (erros)
        allPokemons = allPokemons.filter(p => p !== null);
        
        // Ordenar por ID
        allPokemons.sort((a, b) => a.id - b.id);
        
        hideLoading();
        renderPokemons(allPokemons);
    } catch (error) {
        console.error('Erro ao carregar geração:', error);
        hideLoading();
        pokemonGrid.innerHTML = '<p class="no-locations">Erro ao carregar Pokémons. Tente novamente.</p>';
    }
}

// Função para renderizar a lista de Pokémons
function renderPokemons(pokemons) {
    pokemonGrid.innerHTML = '';
    
    if (pokemons.length === 0) {
        pokemonGrid.innerHTML = '<p class="no-locations">Nenhum Pokémon encontrado.</p>';
        return;
    }
    
    pokemons.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <div class="pokemon-sprite">
                <img src="${pokemon.sprite}" alt="${pokemon.name}">
            </div>
            <div class="pokemon-number">#${String(pokemon.id).padStart(3, '0')}</div>
            <div class="pokemon-name">${pokemon.name}</div>
        `;
        card.addEventListener('click', () => loadPokemonDetails(pokemon));
        pokemonGrid.appendChild(card);
    });
}

// Função para filtrar Pokémons
function filterPokemons(searchTerm) {
    const filtered = allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(pokemon.id).includes(searchTerm)
    );
    renderPokemons(filtered);
}

// Função para carregar detalhes de um Pokémon
async function loadPokemonDetails(pokemon) {
    currentPokemon = pokemon;
    showPokemonDetails();
    
    pokemonDetailsContent.innerHTML = `
        <div class="pokemon-header-info">
            <div class="pokemon-header-sprite">
                <img src="${pokemon.sprite}" alt="${pokemon.name}">
            </div>
            <div class="pokemon-header-text">
                <h2>${pokemon.name}</h2>
                <div class="pokemon-number">#${String(pokemon.id).padStart(3, '0')}</div>
            </div>
        </div>
        <div class="locations-section">
            <h3>Localizações</h3>
            <div class="loading">
                <div class="spinner"></div>
                <p>Carregando localizações...</p>
            </div>
        </div>
    `;
    
    try {
        // Buscar localizações
        const encountersResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`);
        const encountersData = await encountersResponse.json();
        
        // Filtrar encontros pela geração atual
        const relevantEncounters = filterEncountersByGeneration(encountersData);
        
        renderPokemonLocations(relevantEncounters);
    } catch (error) {
        console.error('Erro ao carregar localizações:', error);
        document.querySelector('.locations-section').innerHTML = `
            <h3>Localizações</h3>
            <p class="no-locations">Erro ao carregar localizações.</p>
        `;
    }
}

// Função para filtrar encontros pela geração atual
function filterEncountersByGeneration(encounters) {
    const relevantVersions = currentGeneration.versions;
    const filtered = [];
    
    encounters.forEach(encounter => {
        const locationArea = encounter.location_area.name;
        const versionDetails = encounter.version_details.filter(vd => 
            relevantVersions.includes(vd.version.name)
        );
        
        if (versionDetails.length > 0) {
            filtered.push({
                locationArea,
                versionDetails
            });
        }
    });
    
    return filtered;
}

// Função para renderizar as localizações do Pokémon
function renderPokemonLocations(encounters) {
    const locationsSection = document.querySelector('.locations-section');
    
    if (encounters.length === 0) {
        locationsSection.innerHTML = `
            <h3>Localizações</h3>
            <p class="no-locations">Este Pokémon não pode ser encontrado na natureza nesta geração. Pode ser obtido através de evolução, troca ou evento especial.</p>
        `;
        return;
    }
    
    let html = '<h3>Localizações</h3>';
    
    encounters.forEach(encounter => {
        html += `<div class="location-card">`;
        html += `<div class="location-area">${formatLocationName(encounter.locationArea)}</div>`;
        html += `<div class="encounter-details">`;
        
        encounter.versionDetails.forEach(versionDetail => {
            versionDetail.encounter_details.forEach(detail => {
                html += `
                    <div class="encounter-item">
                        <div class="encounter-game">${formatVersionName(versionDetail.version.name)}</div>
                        <div class="encounter-method"><strong>Método:</strong> ${formatMethodName(detail.method.name)}</div>
                        <div class="encounter-chance"><strong>Taxa:</strong> ${detail.chance}%</div>
                        <div class="encounter-levels"><strong>Níveis:</strong> ${detail.min_level}-${detail.max_level}</div>
                    </div>
                `;
            });
        });
        
        html += `</div></div>`;
    });
    
    locationsSection.innerHTML = html;
}

// Funções auxiliares para formatação
function formatLocationName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatVersionName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatMethodName(name) {
    const methodNames = {
        'walk': 'Caminhando na grama',
        'old-rod': 'Vara Velha',
        'good-rod': 'Vara Boa',
        'super-rod': 'Super Vara',
        'surf': 'Surf',
        'rock-smash': 'Quebra-Pedra',
        'headbutt': 'Cabeçada',
        'dark-grass': 'Grama Escura',
        'grass-spots': 'Pontos de Grama',
        'cave-spots': 'Pontos de Caverna',
        'bridge-spots': 'Pontos de Ponte',
        'super-rod-spots': 'Super Vara (Pontos)',
        'surf-spots': 'Surf (Pontos)',
        'yellow-flowers': 'Flores Amarelas',
        'purple-flowers': 'Flores Roxas',
        'red-flowers': 'Flores Vermelhas',
        'rough-terrain': 'Terreno Acidentado',
        'gift': 'Presente/Evento',
        'gift-egg': 'Ovo de Presente',
        'only-one': 'Único (Lendário)',
        'seaweed': 'Algas Marinhas',
        'fishing': 'Pescando',
        'squirt-bottle': 'Frasco de Água',
        'wailmer-pail': 'Regador',
        'Devon-Scope': 'Devon Scope',
        'pokeradar': 'Poké Radar',
        'slot2-ruby': 'Slot 2 Ruby',
        'slot2-sapphire': 'Slot 2 Sapphire',
        'slot2-emerald': 'Slot 2 Emerald',
        'slot2-firered': 'Slot 2 FireRed',
        'slot2-leafgreen': 'Slot 2 LeafGreen',
        'gift-for-pokedex': 'Presente (Pokédex)',
        'gift-for-saving-girl': 'Presente (Resgatar garota)',
        'honey-tree': 'Árvore de Mel'
    };
    
    return methodNames[name] || formatLocationName(name);
}

// Inicialização
console.log('Pokédex carregada e pronta!');
