# 🐸 Système de Personnage - Guide d'Intégration

Ce guide explique comment intégrer le personnage amphibien anthropomorphe à peau bleu Neptune dans tous les niveaux du jeu.

## 📋 Caractéristiques du Personnage

- **Apparence** : Anthropomorphe amphibien à peau bleu Neptune
- **Taille** : 1m65 (représenté par 50x60px à l'écran)
- **Capacité** : Peut rester sous l'eau 7 minutes
- **Fonction** : Collecte automatiquement les pépites d'or lorsqu'il s'en approche

## 🚀 Utilisation Rapide (Méthode Recommandée)

### Méthode 1 : Initialisation Complète Automatique (RECOMMANDÉ)

Cette méthode initialise automatiquement **tout** : personnage, santé, apnée, repos, collecte.

#### 1. Ajoutez les scripts dans le HTML

```html
<head>
    <!-- ... autres liens ... -->
    <link rel="stylesheet" href="game-style.css">
    <script src="character-system.js"></script>
    <script src="character-health-system.js"></script>
    <script src="init-game-level.js"></script>
</head>
```

#### 2. Ajoutez la structure HTML de base

```html
<!-- HUD avec santé et apnée -->
<div class="game-hud">
    <h3>📊 Statut</h3>
    <div class="hud-stat">
        <span>Pépites collectées :</span>
        <strong id="collectedCount">0</strong>
    </div>
    <div class="hud-stat">
        <span>Profondeur :</span>
        <strong>15m</strong>
    </div>
    
    <!-- Barre de santé -->
    <div class="hud-stat">
        <span>❤️ Vie :</span>
        <strong id="healthValue">100%</strong>
    </div>
    <div class="health-bar">
        <div class="health-fill" id="healthBar" style="width: 100%;">100%</div>
    </div>

    <!-- Barre d'apnée -->
    <div class="hud-stat">
        <span>🌊 Apnée :</span>
        <strong id="apneaValue">7:00</strong>
    </div>
    <div class="apnea-bar">
        <div class="apnea-fill" id="apneaBar" style="width: 100%;">7:00</div>
    </div>

    <!-- Statut d'empoisonnement -->
    <div class="hud-stat poisoned" id="poisonStatus" style="display: none;">
        <span>⚠️ Empoisonné</span>
    </div>
</div>

<!-- Conteneur de jeu -->
<div class="island-container">
    <!-- Créez le personnage avec createCharacter() d'abord -->
    <!-- ... autres éléments (île, pépites, etc.) ... -->
    
    <!-- Indicateur pour se reposer -->
    <div class="rest-prompt" id="restPrompt">
        Appuyez sur [Espace] pour vous reposer et observer le ciel
    </div>
</div>

<!-- Modal de pensées nostalgiques -->
<div class="nostalgia-modal" id="nostalgiaModal">
    <div class="nostalgia-content">
        <h2>✨ Étoiles Filantes ✨</h2>
        <div class="stars">⭐ 🌟 ⭐ 🌟 ⭐</div>
        <p id="nostalgiaText">...</p>
        <p style="margin-top: 2rem; font-size: 0.9rem;">
            Appuyez sur [Espace] pour continuer
        </p>
    </div>
</div>

<!-- Modal de mort (permadeath) -->
<div class="death-modal" id="deathModal">
    <div class="death-content">
        <h2>💀 Mort</h2>
        <p>Votre personnage est mort. Permadeath : recommencez depuis le début.</p>
        <button onclick="resetGame()">Recommencer depuis le début</button>
    </div>
</div>
```

#### 3. Dans le JavaScript du niveau

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // 1. Créer le personnage
    createCharacter('island-container', { x: 20, y: 20 });
    
    // 2. Initialiser tout le système
    const gameSystem = initGameLevel({
        containerId: 'island-container',
        characterId: 'character',
        totalNuggets: 6,
        depth: '15m',
        islandSelector: '.island',
        onVictory: () => {
            console.log('Niveau terminé !');
        }
    });
    
    // Le système gère automatiquement :
    // - Collecte de pépites
    // - Santé et apnée
    // - Repos sur la plateforme
    // - Pensées nostalgiques
    // - Permadeath
});
```

### Méthode 2 : Initialisation Manuelle (Avancé)

Si vous voulez plus de contrôle, vous pouvez utiliser les systèmes séparés :

```javascript
// 1. Créer le personnage
createCharacter('gameContainer', { x: 50, y: 50 });

// 2. Initialiser le système de santé
const healthSystem = new CharacterHealthSystem({
    onHealthChange: (health, maxHealth) => { /* ... */ },
    onApneaChange: (apnea, maxApnea) => { /* ... */ },
    onDeath: () => { /* ... */ }
});

// 3. Initialiser le système de mouvement (optionnel)
// Voir character-system.js pour les détails
```

## 📝 Structure Requise pour Chaque Niveau

Chaque niveau doit avoir :

1. **Scripts requis** :
   - `character-system.js`
   - `character-health-system.js`
   - `init-game-level.js` (méthode recommandée)
   - `game-style.css` (styles visuels)

2. **Éléments HTML** :
   - Un conteneur avec la classe `island-container`
   - Une île avec la classe `.island` (plateforme ronde)
   - Des pépites d'or avec la classe `gold-nugget`
   - HUD avec `collectedCount`, `healthBar`, `apneaBar`, etc.
   - Modals : `nostalgiaModal`, `deathModal`

3. **CSS** :
   - Styles du personnage (depuis `CHARACTER_CSS` dans `character-system.js`)
   - Styles du HUD (barres de santé, apnée)
   - Styles des modals (repos, mort)

## 🎮 Fonctionnalités

### Déplacement
- **Flèches du clavier** : ↑ ↓ ← → pour déplacer le personnage
- **Tactile (mobile)** : Glisser le doigt pour déplacer, toucher une pépite pour la collecter
- **Animation de nage** : Le personnage nage automatiquement pendant le déplacement
- **Restriction** : Ne peut pas aller sur l'île (seulement dans l'eau), sauf pour se reposer

### Collecte de Pépites
- **Automatique** : Collecte les pépites lorsqu'il s'en approche (< 60px par défaut)
- **Tactile directe** : Toucher une pépite sur mobile pour la collecter immédiatement
- **Animation** : Animation de joie lors de la collecte
- **Feedback visuel** : La pépite disparaît avec un effet de scale

### Système de Santé
- **Barre de vie** : Affiche la santé actuelle (100% au départ)
- **Apnée** : 7 minutes maximum sous l'eau, se restaure progressivement hors de l'eau
- **Permadeath** : Une seule vie - si mort, recommencer depuis le début du jeu
- **Restauration** : 
  - Repos sur la plateforme : restaure 1 point/seconde
  - Antidote : restaure 50 points et guérit l'empoisonnement

### Repos sur la Plateforme
- **Observation du ciel** : S'allonger sur la plateforme ronde pour observer les étoiles
- **Activation** : Cliquer sur l'île ou appuyer sur [Espace] quand proche
- **Pensées nostalgiques** : Affiche des pensées aléatoires sur le passé
- **Restauration** : Restaure la santé et l'apnée plus rapidement

## 🔧 Configuration Personnalisée

Vous pouvez personnaliser le comportement :

```javascript
initCharacterSystem({
    collectDistance: 80,      // Distance de collecte plus grande
    speed: 300,              // Mouvement plus rapide
    inWaterOnly: false,       // Permettre de marcher sur l'île
    onNuggetCollect: (nugget, count, total) => {
        // Votre logique personnalisée
    },
    onAllCollected: () => {
        // Votre logique de fin de niveau
    }
});
```

## 📂 Fichiers

- `character-system.js` : Système réutilisable du personnage (mouvement, collecte)
- `character-health-system.js` : Système de santé (vie, apnée, permadeath, repos)
- `init-game-level.js` : **Initialisation complète automatique (RECOMMANDÉ)**
- `game-style.css` : Styles visuels Subnautica/crayonnés
- `CHARACTER_README.md` : Ce guide

## 🎯 Prochaines Étapes

Pour chaque nouveau niveau :

### Méthode Simple (Recommandée)
1. Copiez la structure HTML de `niveau1-ruisseau.html`
2. Adaptez le nombre de pépites et la profondeur
3. Appelez `createCharacter()` puis `initGameLevel()`
4. Tout est automatique ! 🎉

### Exemple Minimal
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Créer le personnage
    createCharacter('island-container', { x: 20, y: 20 });
    
    // Initialiser tout
    initGameLevel({
        totalNuggets: 6,
        depth: '15m',
        onVictory: () => {
            // Votre logique de fin de niveau
        }
    });
});
```

Le personnage et tous ses systèmes seront identiques dans tous les niveaux, garantissant une expérience cohérente ! 🐸✨

