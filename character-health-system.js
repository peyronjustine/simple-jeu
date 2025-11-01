/**
 * Système de santé et de survie pour le personnage amphibien
 * - Apnée : 7 minutes maximum sous l'eau
 * - Vie : Une seule vie (permadeath)
 * - Restauration : Repos ou antidote
 */

const HEALTH_CONFIG = {
    maxApnea: 7 * 60 * 1000, // 7 minutes en millisecondes
    maxHealth: 100,
    healthRestoreRest: 1, // Points de vie restaurés par seconde de repos
    healthRestoreAntidote: 50, // Points restaurés par antidote
    poisoningDamage: 2, // Dégâts par seconde en cas d'empoisonnement
    deathOnApneaExpired: true,
    deathOnHealthZero: true
};

/**
 * Système de santé pour le personnage
 */
class CharacterHealthSystem {
    constructor(config = {}) {
        this.config = { ...HEALTH_CONFIG, ...config };
        this.health = this.config.maxHealth;
        this.apnea = this.config.maxApnea; // Temps restant sous l'eau
        this.isUnderwater = false;
        this.isPoisoned = false;
        this.isResting = false;
        this.isDead = false;
        
        // Callbacks
        this.onHealthChange = config.onHealthChange || (() => {});
        this.onApneaChange = config.onApneaChange || (() => {});
        this.onDeath = config.onDeath || (() => {});
        this.onPoisonStatusChange = config.onPoisonStatusChange || (() => {});
        
        // Intervalles
        this.healthInterval = null;
        this.apneaInterval = null;
        this.restInterval = null;
        
        this.init();
    }

    init() {
        // Démarrer la surveillance de la santé
        this.startHealthMonitoring();
    }

    /**
     * Démarre la surveillance continue de la santé
     */
    startHealthMonitoring() {
        // Surveillance de l'apnée
        this.apneaInterval = setInterval(() => {
            if (this.isUnderwater && !this.isDead && !this.isResting) {
                this.apnea -= 1000; // Décrémenter d'1 seconde
                if (this.apnea < 0) this.apnea = 0;
                
                this.onApneaChange(this.apnea, this.config.maxApnea);
                
                // Si l'apnée est épuisée, subir des dégâts
                if (this.apnea <= 0 && this.config.deathOnApneaExpired) {
                    this.takeDamage(5); // Dégâts sévères
                }
            } else if (!this.isUnderwater && this.apnea < this.config.maxApnea) {
                // Restaurer l'apnée progressivement hors de l'eau
                this.apnea += 2000; // Restauration plus rapide
                if (this.apnea > this.config.maxApnea) {
                    this.apnea = this.config.maxApnea;
                }
                this.onApneaChange(this.apnea, this.config.maxApnea);
            }
        }, 1000);

        // Surveillance de l'empoisonnement
        this.healthInterval = setInterval(() => {
            if (this.isPoisoned && !this.isDead && !this.isResting) {
                this.takeDamage(this.config.poisoningDamage);
            }
        }, 1000);

        // Surveillance du repos (restauration)
        this.restInterval = setInterval(() => {
            if (this.isResting && !this.isDead) {
                this.restoreHealth(this.config.healthRestoreRest);
                // Restaurer aussi l'apnée plus rapidement au repos
                if (this.apnea < this.config.maxApnea) {
                    this.apnea += 3000;
                    if (this.apnea > this.config.maxApnea) {
                        this.apnea = this.config.maxApnea;
                    }
                    this.onApneaChange(this.apnea, this.config.maxApnea);
                }
            }
        }, 1000);
    }

    /**
     * Indique que le personnage est sous l'eau
     */
    setUnderwater(underwater) {
        if (this.isDead) return;
        this.isUnderwater = underwater;
        
        if (underwater && this.apnea <= 0) {
            // Si l'apnée est épuisée, prendre des dégâts immédiatement
            this.takeDamage(10);
        }
    }

    /**
     * Inflige des dégâts au personnage
     */
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        this.onHealthChange(this.health, this.config.maxHealth);
        
        // Vérifier la mort
        if (this.health <= 0 && this.config.deathOnHealthZero) {
            this.die();
        }
    }

    /**
     * Restaure de la santé
     */
    restoreHealth(amount) {
        if (this.isDead) return;
        
        this.health += amount;
        if (this.health > this.config.maxHealth) {
            this.health = this.config.maxHealth;
        }
        
        this.onHealthChange(this.health, this.config.maxHealth);
    }

    /**
     * Utilise un antidote (guérit l'empoisonnement et restaure la santé)
     */
    useAntidote() {
        if (this.isDead) return false;
        
        if (this.isPoisoned) {
            this.isPoisoned = false;
            this.onPoisonStatusChange(false);
        }
        
        this.restoreHealth(this.config.healthRestoreAntidote);
        return true;
    }

    /**
     * Empoisonne le personnage
     */
    setPoisoned(poisoned) {
        if (this.isDead) return;
        
        this.isPoisoned = poisoned;
        this.onPoisonStatusChange(poisoned);
    }

    /**
     * Démarre le repos (sur la plateforme)
     */
    startRest() {
        if (this.isDead) return;
        
        this.isResting = true;
        // La restauration se fait automatiquement via restInterval
    }

    /**
     * Arrête le repos
     */
    stopRest() {
        this.isResting = false;
    }

    /**
     * Tue le personnage (permadeath)
     */
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.isResting = false;
        this.isUnderwater = false;
        
        // Arrêter tous les intervalles
        if (this.healthInterval) clearInterval(this.healthInterval);
        if (this.apneaInterval) clearInterval(this.apneaInterval);
        if (this.restInterval) clearInterval(this.restInterval);
        
        this.onDeath();
    }

    /**
     * Réinitialise complètement (pour recommencer depuis le début)
     */
    reset() {
        this.health = this.config.maxHealth;
        this.apnea = this.config.maxApnea;
        this.isUnderwater = false;
        this.isPoisoned = false;
        this.isResting = false;
        this.isDead = false;
        
        // Redémarrer la surveillance
        this.startHealthMonitoring();
        
        this.onHealthChange(this.health, this.config.maxHealth);
        this.onApneaChange(this.apnea, this.config.maxApnea);
        this.onPoisonStatusChange(false);
    }

    /**
     * Nettoie le système (à appeler lors de la destruction)
     */
    destroy() {
        if (this.healthInterval) clearInterval(this.healthInterval);
        if (this.apneaInterval) clearInterval(this.apneaInterval);
        if (this.restInterval) clearInterval(this.restInterval);
    }

    // Getters
    getHealth() { return this.health; }
    getApnea() { return this.apnea; }
    getApneaPercent() { return (this.apnea / this.config.maxApnea) * 100; }
    getHealthPercent() { return (this.health / this.config.maxHealth) * 100; }
    isAlive() { return !this.isDead; }
    getIsPoisoned() { return this.isPoisoned; }
    getIsResting() { return this.isResting; }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CharacterHealthSystem, HEALTH_CONFIG };
}

