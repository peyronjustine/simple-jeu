# 🐸 Système de Personnage - Guide d'Intégration

Ce guide explique comment intégrer le personnage amphibien anthropomorphe à peau bleu Neptune dans tous les niveaux du jeu.

## 📋 Caractéristiques du Personnage

- **Apparence** : Anthropomorphe amphibien à peau bleu Neptune
- **Taille** : 1m65 (représenté par 50x60px à l'écran)
- **Capacité** : Peut rester sous l'eau 7 minutes
- **Fonction** : Collecte automatiquement les pépites d'or lorsqu'il s'en approche

## 🚀 Utilisation Rapide

### 1. Dans le HTML, ajoutez le CSS du personnage

```html
<style>
    /* ... vos styles existants ... */
    
    /* Ajoutez le CSS du personnage */
    .character {
        position: absolute;
        width: 50px;
        height: 60px;
        z-index: 45;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    /* ... voir CHARACTER_CSS complet dans character-system.js ... */
</style>
```

### 2. Ajoutez le conteneur du personnage dans le HTML

```html
<div class="island-container" id="gameContainer">
    <!-- ... autres éléments ... -->
    
    <!-- Le personnage sera ajouté ici par JavaScript -->
</div>
```

### 3. Dans le JavaScript du niveau

```javascript
// Option 1 : Import direct (si vous utilisez des modules)
// import { createCharacter, initCharacterSystem } from './character-system.js';

// Option 2 : Copier-colle le code de character-system.js dans votre script

// Créer le personnage
const character = createCharacter('gameContainer', { x: 50, y: 50 });

// Initialiser le système avec callbacks personnalisés
const characterSystem = initCharacterSystem({
    collectDistance: 60,  // Distance de collecte
    speed: 500,           // Vitesse de mouvement (ms)
    inWaterOnly: true,     // Seulement dans l'eau
    onNuggetCollect: (nugget, count, total) => {
        // Mettre à jour l'UI
        document.getElementById('collectedCount').textContent = count;
        const progress = (count / total) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    },
    onAllCollected: () => {
        // Afficher le message de victoire
        document.getElementById('victoryMessage').classList.add('show');
    }
});
```

## 📝 Structure Requise pour Chaque Niveau

Chaque niveau doit avoir :

1. **Un conteneur** avec la classe `island-container` (ou utiliser l'ID spécifié)
2. **Des pépites d'or** avec la classe `gold-nugget`
3. **Un élément pour afficher le compteur** (ex: `collectedCount`)
4. **Un élément pour la barre de progression** (ex: `progressBar`)
5. **Un message de victoire** (ex: `victoryMessage`)

## 🎮 Fonctionnalités

### Déplacement
- **Clic dans l'eau** : Déplace le personnage vers la position cliquée
- **Animation de nage** : Le personnage nage automatiquement pendant le déplacement
- **Restriction** : Ne peut pas aller sur l'île (seulement dans l'eau)

### Collecte
- **Automatique** : Collecte les pépites lorsqu'il s'en approche (< 60px par défaut)
- **Animation** : Animation de joie lors de la collecte
- **Feedback visuel** : La pépite disparaît avec un effet de scale

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

- `character-system.js` : Système réutilisable du personnage
- `CHARACTER_README.md` : Ce guide

## 🎯 Prochaines Étapes

Pour chaque nouveau niveau :
1. Copiez la structure HTML de base
2. Intégrez le CSS du personnage
3. Appelez `createCharacter()` et `initCharacterSystem()`
4. Adaptez les callbacks selon les besoins du niveau

Le personnage sera identique dans tous les niveaux, garantissant une expérience cohérente !

