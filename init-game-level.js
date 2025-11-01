/**
 * Système d'initialisation complète pour tous les niveaux du jeu
 * Inclut : personnage, santé, apnée, permadeath, repos sur plateforme
 * 
 * Utilisation :
 *   <script src="character-system.js"></script>
 *   <script src="character-health-system.js"></script>
 *   <script src="init-game-level.js"></script>
 *   <script>
 *       initGameLevel({
 *           containerId: 'island-container',
 *           characterId: 'character',
 *           totalNuggets: 6,
 *           depth: '15m',
 *           islandSelector: '.island',
 *           onVictory: () => { /* ... */ }
 *       });
 *   </script>
 */

/**
 * Initialise complètement un niveau de jeu avec toutes les fonctionnalités
 */
function initGameLevel(config = {}) {
    const {
        containerId = 'island-container',
        characterId = 'character',
        totalNuggets = 6,
        depth = '15m',
        islandSelector = '.island',
        onNuggetCollect = null,
        onAllCollected = null,
        onVictory = null,
        startPosition = { x: 20, y: 20 }, // Position de départ dans l'eau
        collectDistance = 60,
        moveSpeed = 2,
        healthConfig = {}
    } = config;

    // Vérifier que les éléments nécessaires existent
    const container = document.querySelector(`.${containerId}`) || document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur "${containerId}" non trouvé`);
        return null;
    }

    const character = document.getElementById(characterId);
    if (!character) {
        console.error(`Personnage "${characterId}" non trouvé. Créez d'abord le personnage avec createCharacter().`);
        return null;
    }

    const island = document.querySelector(islandSelector);
    if (!island) {
        console.warn(`Île "${islandSelector}" non trouvée. Le système de repos ne fonctionnera pas.`);
    }

    // Variables d'état
    let collectedNuggets = 0;
    let isMoving = false;
    let isResting = false;
    let characterX = startPosition.x;
    let characterY = startPosition.y;
    const nuggets = document.querySelectorAll('.gold-nugget');

    // Éléments UI
    const collectedCountEl = document.getElementById('collectedCount');
    const progressBar = document.getElementById('progressBar');
    const victoryMessage = document.getElementById('victoryMessage');

    // Initialiser le système de santé
    const healthSystem = new CharacterHealthSystem({
        ...healthConfig,
        onHealthChange: (health, maxHealth) => {
            const percent = (health / maxHealth) * 100;
            const healthBar = document.getElementById('healthBar');
            const healthValue = document.getElementById('healthValue');
            if (healthBar) {
                healthBar.style.width = percent + '%';
                healthBar.textContent = Math.round(percent) + '%';
            }
            if (healthValue) {
                healthValue.textContent = Math.round(percent) + '%';
            }
            
            if (healthBar) {
                healthBar.className = 'health-fill';
                if (percent < 30) {
                    healthBar.classList.add('danger');
                }
            }
        },
        onApneaChange: (apnea, maxApnea) => {
            const percent = (apnea / maxApnea) * 100;
            const apneaBar = document.getElementById('apneaBar');
            const apneaValue = document.getElementById('apneaValue');
            
            const minutes = Math.floor(apnea / 60000);
            const seconds = Math.floor((apnea % 60000) / 1000);
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (apneaValue) {
                apneaValue.textContent = timeStr;
            }
            
            if (apneaBar) {
                apneaBar.style.width = percent + '%';
                apneaBar.textContent = timeStr;
                apneaBar.className = 'apnea-fill';
                if (percent < 20) {
                    apneaBar.classList.add('danger');
                } else if (percent < 50) {
                    apneaBar.classList.add('warning');
                }
            }
        },
        onPoisonStatusChange: (poisoned) => {
            const poisonStatus = document.getElementById('poisonStatus');
            if (poisonStatus) {
                poisonStatus.style.display = poisoned ? 'flex' : 'none';
            }
        },
        onDeath: () => {
            const deathModal = document.getElementById('deathModal');
            if (deathModal) {
                deathModal.classList.add('show');
            }
        }
    });

    // Fonction de réinitialisation (permadeath)
    window.resetGame = function() {
        healthSystem.reset();
        const deathModal = document.getElementById('deathModal');
        if (deathModal) {
            deathModal.classList.remove('show');
        }
        
        // Réinitialiser les pépites
        collectedNuggets = 0;
        nuggets.forEach(nugget => {
            nugget.classList.remove('collected');
            nugget.style.opacity = '1';
            nugget.style.transform = 'scale(1)';
        });
        
        // Réinitialiser le HUD
        if (collectedCountEl) collectedCountEl.textContent = '0';
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }
        
        // Réinitialiser la position
        characterX = startPosition.x;
        characterY = startPosition.y;
        character.style.left = characterX + '%';
        character.style.top = characterY + '%';
        character.classList.remove('resting');
        isResting = false;
        
        // Cacher le message de victoire
        if (victoryMessage) {
            victoryMessage.classList.remove('show');
        }
        
        healthSystem.setUnderwater(true);
    };

    // Fonction de collecte de pépite
    function collectNugget(nugget) {
        if (!nugget || nugget.classList.contains('collected')) return false;

        nugget.classList.add('collected');
        collectedNuggets++;
        
        // Mettre à jour l'UI
        if (collectedCountEl) {
            collectedCountEl.textContent = collectedNuggets;
        }
        if (progressBar) {
            const progress = (collectedNuggets / totalNuggets) * 100;
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.round(progress) + '%';
        }

        // Animation de la pépite
        nugget.style.transition = 'all 0.5s';
        nugget.style.transform = 'scale(2)';
        nugget.style.opacity = '0';

        // Animation du personnage
        character.style.transform = 'scale(1.3)';
        setTimeout(() => {
            character.style.transform = 'scale(1)';
        }, 300);

        // Callbacks
        if (onNuggetCollect) {
            onNuggetCollect(nugget, collectedNuggets, totalNuggets);
        }

        // Vérifier si toutes sont collectées
        if (collectedNuggets === totalNuggets) {
            if (onAllCollected) {
                onAllCollected();
            }
            if (onVictory) {
                onVictory();
            }
            if (victoryMessage) {
                setTimeout(() => {
                    victoryMessage.classList.add('show');
                }, 500);
            }
        }

        return true;
    }

    // Vérifier la collecte de pépites
    function checkNuggetCollection() {
        if (isResting || healthSystem.isDead) return;

        const characterRect = character.getBoundingClientRect();
        const characterCenterX = characterRect.left + characterRect.width / 2;
        const characterCenterY = characterRect.top + characterRect.height / 2;

        nuggets.forEach((nugget) => {
            if (!nugget.classList.contains('collected')) {
                const nuggetRect = nugget.getBoundingClientRect();
                const nuggetCenterX = nuggetRect.left + nuggetRect.width / 2;
                const nuggetCenterY = nuggetRect.top + nuggetRect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(characterCenterX - nuggetCenterX, 2) +
                    Math.pow(characterCenterY - nuggetCenterY, 2)
                );

                if (distance < collectDistance) {
                    collectNugget(nugget);
                }
            }
        });
    }

    // Mettre à jour le statut d'immersion
    function updateUnderwaterStatus() {
        const centerX = 50;
        const centerY = 50;
        const distance = Math.sqrt(Math.pow(characterX - centerX, 2) + Math.pow(characterY - centerY, 2));
        
        if (distance <= 30) {
            healthSystem.setUnderwater(false);
            const restPrompt = document.getElementById('restPrompt');
            if (restPrompt) {
                if (!isResting) {
                    restPrompt.classList.add('show');
                } else {
                    restPrompt.classList.remove('show');
                }
            }
        } else {
            healthSystem.setUnderwater(true);
            const restPrompt = document.getElementById('restPrompt');
            if (restPrompt) {
                restPrompt.classList.remove('show');
            }
        }
    }

    // Fonction pour observer le ciel
    function observeSky() {
        if (isResting || healthSystem.isDead) return;
        
        isResting = true;
        healthSystem.startRest();
        character.classList.add('resting');
        
        characterX = 50;
        characterY = 50;
        character.style.left = '50%';
        character.style.top = '50%';
        
        const nostalgiaModal = document.getElementById('nostalgiaModal');
        const nostalgiaText = document.getElementById('nostalgiaText');
        
        if (nostalgiaModal && nostalgiaText) {
            const thoughts = [
                "Les étoiles filantes traversent le ciel comme autant de souvenirs évanouis...",
                "Dans cette nuit infinie, je me souviens d'un autre temps, d'une autre vie...",
                "Les constellations me rappellent des visages oubliés, des voix lointaines...",
                "Combien de nuits ai-je passées ainsi, à contempler l'immensité du ciel ?",
                "Chaque étoile filante porte avec elle un fragment de mon passé..."
            ];
            
            const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
            nostalgiaText.textContent = randomThought;
            nostalgiaModal.classList.add('show');
            
            function closeNostalgia() {
                nostalgiaModal.classList.remove('show');
                isResting = false;
                healthSystem.stopRest();
                character.classList.remove('resting');
                document.removeEventListener('keydown', handleKeyClose);
                nostalgiaModal.removeEventListener('click', closeNostalgia);
            }
            
            function handleKeyClose(e) {
                if (e.key === ' ' || e.key === 'Escape') {
                    closeNostalgia();
                }
            }
            
            document.addEventListener('keydown', handleKeyClose);
            nostalgiaModal.addEventListener('click', closeNostalgia);
        }
    }

    // Interactions avec l'île
    if (island) {
        island.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isResting && !healthSystem.isDead) {
                observeSky();
            }
        });
    }

    // Gestion du clavier pour le repos
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Escape') {
            const centerX = 50;
            const centerY = 50;
            const distance = Math.sqrt(Math.pow(characterX - centerX, 2) + Math.pow(characterY - centerY, 2));
            
            if (distance <= 30 && !isResting && !healthSystem.isDead) {
                observeSky();
            } else if (isResting) {
                isResting = false;
                healthSystem.stopRest();
                character.classList.remove('resting');
                const nostalgiaModal = document.getElementById('nostalgiaModal');
                if (nostalgiaModal) {
                    nostalgiaModal.classList.remove('show');
                }
            }
        }
    });

    // Collecte tactile directe des pépites
    nuggets.forEach((nugget) => {
        nugget.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!nugget.classList.contains('collected')) {
                collectNugget(nugget);
            }
        }, { passive: false });

        nugget.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!nugget.classList.contains('collected')) {
                collectNugget(nugget);
            }
        });
    });

    // Position initiale
    character.style.left = characterX + '%';
    character.style.top = characterY + '%';
    updateUnderwaterStatus();

    // Vérification continue de la collecte
    setInterval(() => {
        if (!isResting && !healthSystem.isDead) {
            checkNuggetCollection();
        }
    }, 200);

    // Retourner l'API publique
    return {
        healthSystem,
        collectNugget,
        checkNuggetCollection,
        updateUnderwaterStatus,
        observeSky,
        getCollectedCount: () => collectedNuggets,
        getTotalCount: () => totalNuggets,
        isMoving: () => isMoving,
        isResting: () => isResting,
        getPosition: () => ({ x: characterX, y: characterY }),
        setPosition: (x, y) => {
            characterX = x;
            characterY = y;
            character.style.left = x + '%';
            character.style.top = y + '%';
            updateUnderwaterStatus();
        }
    };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGameLevel };
}

