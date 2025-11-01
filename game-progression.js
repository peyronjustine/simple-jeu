/**
 * Système de progression du jeu
 * Règle fondamentale : Pour passer au niveau suivant, le personnage doit récupérer
 * TOUTES les pépites d'or du niveau actuel.
 * 
 * Objectif final : Collecter les 30 pépites d'or totales à travers toutes les étapes
 */

const PROGRESSION_CONFIG = {
    totalNuggetsRequired: 30, // Objectif final : 30 pépites au total
    storageKey: 'changement-game-progression' // Clé pour localStorage
};

/**
 * Gestion de la progression du jeu
 */
class GameProgression {
    constructor() {
        this.progression = this.loadProgression();
    }

    /**
     * Charge la progression sauvegardée depuis localStorage
     */
    loadProgression() {
        try {
            const saved = localStorage.getItem(PROGRESSION_CONFIG.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Erreur lors du chargement de la progression:', e);
        }
        
        // Progression par défaut
        return {
            totalCollected: 0, // Total de pépites collectées à travers tous les niveaux
            levelsCompleted: {}, // { 'niveau1-ruisseau': true, 'niveau2-ruisseau': false, ... }
            currentLevel: null
        };
    }

    /**
     * Sauvegarde la progression dans localStorage
     */
    saveProgression() {
        try {
            localStorage.setItem(PROGRESSION_CONFIG.storageKey, JSON.stringify(this.progression));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de la progression:', e);
        }
    }

    /**
     * Marque un niveau comme complété
     */
    completeLevel(levelId, nuggetsCollected) {
        if (!this.progression.levelsCompleted[levelId]) {
            this.progression.levelsCompleted[levelId] = true;
            this.progression.totalCollected += nuggetsCollected;
            this.saveProgression();
            
            console.log(`Niveau ${levelId} complété ! Total de pépites : ${this.progression.totalCollected}/${PROGRESSION_CONFIG.totalNuggetsRequired}`);
        }
    }

    /**
     * Vérifie si un niveau est complété
     */
    isLevelCompleted(levelId) {
        return this.progression.levelsCompleted[levelId] === true;
    }

    /**
     * Vérifie si un niveau est débloqué (niveau précédent complété)
     */
    isLevelUnlocked(levelId) {
        // Le niveau 1 est toujours débloqué
        if (levelId.includes('niveau1')) {
            return true;
        }
        
        // Pour les autres niveaux, vérifier le niveau précédent
        const levelNumber = this.extractLevelNumber(levelId);
        if (levelNumber === null) return false;
        
        // Extraire le nom de l'étape (ex: 'ruisseau', 'mare', etc.)
        const stepName = this.extractStepName(levelId);
        if (!stepName) return false;
        
        // Vérifier le niveau précédent de la même étape
        if (levelNumber > 1) {
            const previousLevelId = `niveau${levelNumber - 1}-${stepName}`;
            return this.isLevelCompleted(previousLevelId);
        }
        
        // Si c'est le niveau 1 d'une nouvelle étape, vérifier le dernier niveau de l'étape précédente
        // Exemple : niveau1-mare débloqué si niveau6-ruisseau est complété
        const previousStepName = this.getPreviousStep(stepName);
        if (previousStepName) {
            const lastLevelId = `niveau6-${previousStepName}`;
            return this.isLevelCompleted(lastLevelId);
        }
        
        return false;
    }

    /**
     * Extrait le numéro du niveau depuis l'ID
     */
    extractLevelNumber(levelId) {
        const match = levelId.match(/niveau(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Extrait le nom de l'étape depuis l'ID
     */
    extractStepName(levelId) {
        const match = levelId.match(/niveau\d+-(.+)/);
        return match ? match[1] : null;
    }

    /**
     * Retourne le nom de l'étape précédente
     */
    getPreviousStep(currentStep) {
        const steps = ['ruisseau', 'mare', 'riviere', 'riviere2', 'ocean', 'marecageuse', 'ocean2', 'antarctique', 'bermudes'];
        const currentIndex = steps.indexOf(currentStep);
        return currentIndex > 0 ? steps[currentIndex - 1] : null;
    }

    /**
     * Retourne le total de pépites collectées
     */
    getTotalCollected() {
        return this.progression.totalCollected;
    }

    /**
     * Vérifie si l'objectif final est atteint (30 pépites)
     */
    isFinalObjectiveReached() {
        return this.progression.totalCollected >= PROGRESSION_CONFIG.totalNuggetsRequired;
    }

    /**
     * Retourne le pourcentage de progression vers l'objectif final
     */
    getProgressPercent() {
        return Math.min(100, (this.progression.totalCollected / PROGRESSION_CONFIG.totalNuggetsRequired) * 100);
    }

    /**
     * Définit le niveau actuel
     */
    setCurrentLevel(levelId) {
        this.progression.currentLevel = levelId;
        this.saveProgression();
    }

    /**
     * Réinitialise complètement la progression (permadeath)
     */
    reset() {
        this.progression = {
            totalCollected: 0,
            levelsCompleted: {},
            currentLevel: null
        };
        this.saveProgression();
        console.log('Progression réinitialisée (permadeath)');
    }
}

// Instance globale
let gameProgression = null;

// Initialiser au chargement
if (typeof window !== 'undefined') {
    gameProgression = new GameProgression();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameProgression, PROGRESSION_CONFIG };
}

