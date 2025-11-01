/**
 * Système de personnage amphibien anthropomorphe à peau bleu Neptune
 * Réutilisable pour tous les niveaux du jeu "Changement"
 */

// Configuration du personnage
const CHARACTER_CONFIG = {
    skinColor: {
        primary: '#4682B4',    // Bleu Neptune
        secondary: '#5F9EA0',  // Bleu turquoise
        accent: '#6B8E23'      // Vert olive pour les nuances
    },
    size: {
        width: 55,      // Proportionnel à 1m65 (environ 55px pour un personnage de 1m65)
        height: 82,     // Hauteur proportionnelle (1m65 ≈ 82px)
        headSize: 40,
        bodySize: 55
    },
    realHeight: 165,    // Taille réelle en cm (1m65)
    speed: 500, // Temps de mouvement en ms
    collectDistance: 60, // Distance de collecte en pixels
    swimAnimation: true,
    maxApnea: 7 * 60 * 1000, // 7 minutes sous l'eau
    permadeath: true    // Une seule vie, recommencer depuis le début si mort
};

/**
 * Crée le personnage dans le conteneur spécifié
 */
function createCharacter(containerId, startPosition = { x: 50, y: 50 }) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur ${containerId} non trouvé`);
        return null;
    }

    const character = document.createElement('div');
    character.className = 'character';
    character.id = 'character';
    character.style.left = startPosition.x + '%';
    character.style.top = startPosition.y + '%';

    character.innerHTML = `
        <div class="character-body">
            <div class="character-head">
                <div class="character-eyes">
                    <div class="character-eye"></div>
                    <div class="character-eye"></div>
                </div>
            </div>
            <div class="character-arms">
                <div class="character-arm left"></div>
                <div class="character-arm right"></div>
            </div>
            <div class="character-legs">
                <div class="character-leg"></div>
                <div class="character-leg"></div>
            </div>
        </div>
    `;

    container.appendChild(character);
    return character;
}

/**
 * Initialise le système de mouvement et de collecte
 */
function initCharacterSystem(config = {}) {
    const character = document.getElementById('character');
    if (!character) {
        console.error('Personnage non trouvé. Appelez createCharacter() d\'abord.');
        return;
    }

    const container = character.closest('.island-container') || character.parentElement;
    const nuggets = document.querySelectorAll('.gold-nugget');
    const collectDistance = config.collectDistance || CHARACTER_CONFIG.collectDistance;
    const moveSpeed = config.speed || CHARACTER_CONFIG.speed;

    let isMoving = false;
    let collectedNuggets = 0;
    const totalNuggets = nuggets.length;
    
    // Récupérer la position initiale du personnage
    const startPos = {
        x: parseFloat(character.style.left) || 50,
        y: parseFloat(character.style.top) || 50
    };

    // Callbacks pour la collecte (peuvent être personnalisés)
    const onNuggetCollect = config.onNuggetCollect || function(nugget, count, total) {
        console.log(`Pépite collectée ! ${count}/${total}`);
    };

    const onAllCollected = config.onAllCollected || function() {
        console.log('Toutes les pépites ont été collectées !');
    };

    /**
     * Collecte une pépite d'or
     */
    function collectNugget(nugget) {
        if (!nugget || nugget.classList.contains('collected')) return false;

        nugget.classList.add('collected');
        collectedNuggets++;

        // Animation de la pépite
        nugget.style.transition = 'all 0.5s';
        nugget.style.transform = 'scale(2)';
        nugget.style.opacity = '0';

        // Animation du personnage (saut de joie)
        character.style.transform = 'scale(1.3)';
        setTimeout(() => {
            character.style.transform = 'scale(1)';
        }, 300);

        // Callback
        onNuggetCollect(nugget, collectedNuggets, totalNuggets);

        // Vérifier si toutes sont collectées
        if (collectedNuggets === totalNuggets) {
            onAllCollected();
        }

        return true;
    }

    /**
     * Vérifie si le personnage est proche d'une pépite et la collecte
     */
    function checkNuggetCollection() {
        if (!character || isMoving) return;

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

    /**
     * Déplace le personnage vers une position (en pourcentage)
     */
    function moveCharacter(x, y, inWaterOnly = true) {
        if (isMoving) return false;

        // Vérifier si on peut se déplacer (dans l'eau seulement si demandé)
        if (inWaterOnly) {
            const centerX = 50;
            const centerY = 50;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            
            // Si trop proche du centre (sur l'île), ne pas se déplacer
            if (distance <= 25) {
                return false;
            }
        }

        // Limiter les coordonnées
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));

        character.classList.add('moving', 'swimming');
        character.style.left = x + '%';
        character.style.top = y + '%';

        isMoving = true;
        const moveDuration = config.speed || CHARACTER_CONFIG.speed;
        setTimeout(() => {
            isMoving = false;
            character.classList.remove('moving');
            checkNuggetCollection();
        }, moveDuration);

        return true;
    }
    
    /**
     * Déplace le personnage avec les flèches du clavier
     */
    const keyboardMoveSpeed = config.moveSpeed || 2; // Pourcentage de déplacement par appui
    let keysPressed = {};
    let currentCharacterX = startPos.x;
    let currentCharacterY = startPos.y;

    function moveCharacterWithKeys(direction) {
        if (isMoving) return;
        
        let newX = currentCharacterX;
        let newY = currentCharacterY;

        switch(direction) {
            case 'ArrowUp':
                newY = Math.max(5, currentCharacterY - keyboardMoveSpeed);
                break;
            case 'ArrowDown':
                newY = Math.min(95, currentCharacterY + keyboardMoveSpeed);
                break;
            case 'ArrowLeft':
                newX = Math.max(5, currentCharacterX - keyboardMoveSpeed);
                break;
            case 'ArrowRight':
                newX = Math.min(95, currentCharacterX + keyboardMoveSpeed);
                break;
        }

        // Vérifier que la nouvelle position est dans l'eau (pas sur l'île)
        const centerX = 50;
        const centerY = 50;
        const distance = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2));
        
        // Ne se déplace que dans l'eau (au-delà de 25% du centre = dans l'eau)
        if (distance > 25) {
            if (moveCharacter(newX, newY, config.inWaterOnly !== false)) {
                currentCharacterX = newX;
                currentCharacterY = newY;
            }
        }
    }

    // Gestion des touches du clavier
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); // Empêcher le scroll de la page
            
            if (!keysPressed[e.key]) {
                keysPressed[e.key] = true;
                moveCharacterWithKeys(e.key);
                
                // Répéter le mouvement si la touche reste enfoncée
                const repeatInterval = setInterval(() => {
                    if (keysPressed[e.key] && !isMoving) {
                        moveCharacterWithKeys(e.key);
                    } else {
                        clearInterval(repeatInterval);
                    }
                }, 150);
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            keysPressed[e.key] = false;
            character.classList.remove('swimming'); // Arrêter l'animation de nage
        }
    });

    // Gestion du contrôle tactile (mobile)
    let touchStartX = null;
    let touchStartY = null;
    let touchStartTime = null;
    let isTouching = false;
    let touchMoveInterval = null;

    function getTouchPosition(e) {
        const touch = e.touches[0] || e.changedTouches[0];
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const x = ((touch.clientX - containerRect.left) / containerWidth) * 100;
        const y = ((touch.clientY - containerRect.top) / containerHeight) * 100;
        
        return { x, y };
    }

    function moveCharacterToTouch(x, y) {
        // Limiter les coordonnées
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));

        // Vérifier que la position est dans l'eau (pas sur l'île)
        const centerX = 50;
        const centerY = 50;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        // Ne se déplace que dans l'eau (au-delà de 25% du centre)
        if (distance > 25) {
            if (moveCharacter(x, y, config.inWaterOnly !== false)) {
                currentCharacterX = x;
                currentCharacterY = y;
            }
        }
    }

    // Détection du début du toucher
    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touchPos = getTouchPosition(e);
        touchStartX = touchPos.x;
        touchStartY = touchPos.y;
        touchStartTime = Date.now();
        isTouching = true;

        // Vérifier si on touche directement une pépite
        const touch = e.touches[0];
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const nugget = elementUnderTouch?.closest('.gold-nugget');
        
        if (nugget && !nugget.classList.contains('collected')) {
            // Collecte tactile directe de la pépite
            collectNugget(nugget);
            return;
        }

        // Déplacer le personnage vers le point touché
        moveCharacterToTouch(touchPos.x, touchPos.y);

        // Continuer à suivre le doigt si l'utilisateur glisse
        touchMoveInterval = setInterval(() => {
            if (isTouching && e.touches.length > 0) {
                const currentPos = getTouchPosition(e);
                moveCharacterToTouch(currentPos.x, currentPos.y);
            }
        }, 100);
    }, { passive: false });

    // Suivre le mouvement du doigt
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isTouching && e.touches.length > 0) {
            const touchPos = getTouchPosition(e);
            moveCharacterToTouch(touchPos.x, touchPos.y);
        }
    }, { passive: false });

    // Fin du toucher
    container.addEventListener('touchend', (e) => {
        e.preventDefault();
        isTouching = false;
        if (touchMoveInterval) {
            clearInterval(touchMoveInterval);
            touchMoveInterval = null;
        }
        character.classList.remove('swimming');
    }, { passive: false });

    container.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        isTouching = false;
        if (touchMoveInterval) {
            clearInterval(touchMoveInterval);
            touchMoveInterval = null;
        }
        character.classList.remove('swimming');
    }, { passive: false });

    // Vérifier la collecte en continu
    setInterval(checkNuggetCollection, 200);

    // Retourner les fonctions publiques
    return {
        moveCharacter,
        moveCharacterWithKeys,
        collectNugget,
        getCollectedCount: () => collectedNuggets,
        getTotalCount: () => totalNuggets,
        isMoving: () => isMoving,
        getPosition: () => ({ x: currentCharacterX, y: currentCharacterY }),
        setPosition: (x, y) => {
            currentCharacterX = x;
            currentCharacterY = y;
            character.style.left = x + '%';
            character.style.top = y + '%';
        }
    };
}

/**
 * Styles CSS pour le personnage (à inclure dans le <style> de chaque niveau)
 */
const CHARACTER_CSS = `
    .character {
        position: absolute;
        width: 55px;
        height: 82px;
        z-index: 45;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .character-body {
        position: relative;
        width: 55px;
        height: 55px;
        background: linear-gradient(135deg, #4682B4 0%, #5F9EA0 50%, #6B8E23 100%);
        border-radius: 50% 50% 45% 45%;
        box-shadow: 
            0 2px 10px rgba(0, 0, 0, 0.3),
            inset 0 -5px 10px rgba(0, 0, 0, 0.2);
    }

    .character-head {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #4682B4 0%, #5F9EA0 100%);
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .character-eyes {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        display: flex;
        justify-content: space-between;
        gap: 8px;
    }

    .character-eye {
        width: 6px;
        height: 6px;
        background: #000;
        border-radius: 50%;
    }

    .character-arms {
        position: absolute;
        top: 15px;
        width: 100%;
        height: 20px;
        display: flex;
        justify-content: space-between;
    }

    .character-arm {
        width: 12px;
        height: 25px;
        background: linear-gradient(135deg, #4682B4 0%, #5F9EA0 100%);
        border-radius: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .character-arm.left {
        left: -5px;
        transform: rotate(-25deg);
    }

    .character-arm.right {
        right: -5px;
        transform: rotate(25deg);
    }

    .character-legs {
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 15px;
        display: flex;
        justify-content: center;
        gap: 5px;
    }

    .character-leg {
        width: 10px;
        height: 15px;
        background: linear-gradient(135deg, #4682B4 0%, #5F9EA0 100%);
        border-radius: 0 0 10px 10px;
    }

    .character.swimming {
        animation: swimAnimation 1s ease-in-out infinite;
    }

    @keyframes swimAnimation {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    .character.moving {
        transition: all 0.5s ease;
    }
`;

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createCharacter,
        initCharacterSystem,
        CHARACTER_CONFIG,
        CHARACTER_CSS
    };
}

