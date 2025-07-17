// Dashboard JavaScript pour Dodje

document.addEventListener('DOMContentLoaded', function() {
    // ==================== FIREBASE CONFIGURATION ====================
    const firebaseConfig = {
        apiKey: "AIzaSyDgDWiRJuwuG6jnqwKyIVlNEAiNTTu6jdQ",
        authDomain: "doodje-455f9.firebaseapp.com",
        projectId: "doodje-455f9",
        storageBucket: "doodje-455f9.firebasestorage.app",
        messagingSenderId: "612838674498",
        appId: "1:612838674498:web:ba9f10dd9aa0d0a3d01ddb",
        measurementId: "G-PTCZR9N93R"
    };
    
    // Initialiser Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    // ==================== GESTION DU CACHE ====================
    function getUserFromCache() {
        const userData = localStorage.getItem('dodje_user');
        return userData ? JSON.parse(userData) : null;
    }
    
    function saveUserToCache(userData) {
        localStorage.setItem('dodje_user', JSON.stringify(userData));
    }
    
    function clearUserCache() {
        localStorage.removeItem('dodje_user');
        // Nettoyer aussi le cache du jeu
        localStorage.removeItem('dodje_bird_best_score');
    }
    
    // ==================== REDIRECTION ET AUTHENTIFICATION ====================
    function checkUserAuth() {
        try {
            const user = getUserFromCache();
            console.log('Vérification auth dashboard:', user);
            
            if (!user || !user.email || !user.username || !user.founderCode) {
                console.log('Données utilisateur manquantes ou invalides, redirection vers landing page');
                clearUserCache();
                window.location.href = 'index.html';
                return false;
            }
            
            // Mettre à jour la date de dernière connexion
            user.lastLogin = new Date().toISOString();
            saveUserToCache(user);
            
            return user;
        } catch (error) {
            console.error('Erreur lors de la vérification auth:', error);
            clearUserCache();
            window.location.href = 'index.html';
            return false;
        }
    }
    
    // ==================== FONCTIONS UTILITAIRES ====================
    function formatDate(timestamp) {
        if (!timestamp) return '--';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    function updateCountdown() {
        const countdownElements = {
            days: document.querySelector('#days-mini'),
            hours: document.querySelector('#hours-mini'),
            minutes: document.querySelector('#minutes-mini')
        };

        const launchDate = new Date('2025-09-08T16:00:00');
        const now = new Date().getTime();
        const distance = launchDate.getTime() - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            if (countdownElements.days) countdownElements.days.textContent = days.toString().padStart(2, '0');
            if (countdownElements.hours) countdownElements.hours.textContent = hours.toString().padStart(2, '0');
            if (countdownElements.minutes) countdownElements.minutes.textContent = minutes.toString().padStart(2, '0');
        }
    }
    
    // ==================== SYSTÈME DE NIVEAUX ====================
    const BATTLE_PASS_LEVELS = [
        { level: 1, requirement: 1, title: "Graine de Fondateur", icon: "seedling", color: "#22c55e" },
        { level: 2, requirement: 5, title: "Étoile Montante", icon: "star", color: "#3b82f6" },
        { level: 3, requirement: 15, title: "Flamme du Succès", icon: "fire", color: "#f59e0b" },
        { level: 4, requirement: 30, title: "Diamant Fondateur", icon: "gem", color: "#8b5cf6" },
        { level: 5, requirement: 50, title: "Roi des Fondateurs", icon: "crown", color: "#ef4444" },
        { level: 6, requirement: 100, title: "Légende Éternelle", icon: "dragon", color: "#06d001" }
    ];
    
    function getCurrentLevel(referralsCount) {
        let currentLevel = BATTLE_PASS_LEVELS[0];
        
        for (let i = BATTLE_PASS_LEVELS.length - 1; i >= 0; i--) {
            if (referralsCount >= BATTLE_PASS_LEVELS[i].requirement) {
                currentLevel = BATTLE_PASS_LEVELS[i];
                break;
            }
        }
        
        return currentLevel;
    }
    
    function getNextLevel(currentLevel) {
        const currentIndex = BATTLE_PASS_LEVELS.findIndex(level => level.level === currentLevel.level);
        return currentIndex < BATTLE_PASS_LEVELS.length - 1 ? BATTLE_PASS_LEVELS[currentIndex + 1] : null;
    }
    
    function calculateProgress(referralsCount, currentLevel, nextLevel) {
        if (referralsCount === 0) return 0; // Si 0 parrainage, progression à 0%
        if (!nextLevel) return 100; // Niveau max atteint
        
        const currentLevelReq = currentLevel.requirement;
        const nextLevelReq = nextLevel.requirement;
        const progressInLevel = referralsCount - currentLevelReq;
        const totalRequiredForLevel = nextLevelReq - currentLevelReq;
        
        return Math.min(100, (progressInLevel / totalRequiredForLevel) * 100);
    }
    
    function updateBattlePass(referralsCount) {
        const currentLevel = getCurrentLevel(referralsCount);
        const nextLevel = getNextLevel(currentLevel);
        const progress = calculateProgress(referralsCount, currentLevel, nextLevel);
        
        // Mise à jour du niveau actuel
        document.getElementById('current-level').textContent = currentLevel.level;
        
        // Mise à jour du score d'avancement
        const referralsCountElement = document.getElementById('referrals-count');
        if (referralsCountElement) {
            referralsCountElement.textContent = referralsCount;
        }
        
        // Mise à jour de la barre de progression
        const battlePassFill = document.getElementById('battle-pass-fill');
        battlePassFill.style.width = `${progress}%`;
        battlePassFill.style.backgroundColor = currentLevel.color;
        
        // Mise à jour des récompenses
        updateRewardItems(currentLevel.level);
        
        // Mise à jour du badge utilisateur
        updateUserBadge(currentLevel);
        
        console.log(`Niveau actuel: ${currentLevel.level} (${currentLevel.title})`);
        console.log(`Progression: ${progress.toFixed(1)}%`);
    }
    
    function updateRewardItems(currentLevel) {
        const rewardItems = document.querySelectorAll('.reward-item');
        
        rewardItems.forEach(item => {
            const itemLevel = parseInt(item.dataset.level);
            const rewardIcon = item.querySelector('.reward-icon');
            const rewardInfo = item.querySelector('.reward-info');
            
            if (itemLevel <= currentLevel) {
                // Récompense débloquée
                item.classList.add('unlocked');
                item.classList.remove('locked');
                rewardIcon.style.color = BATTLE_PASS_LEVELS[itemLevel - 1].color;
                
                // Animation pour les nouvelles récompenses
                if (itemLevel === currentLevel) {
                    item.classList.add('newly-unlocked');
                    setTimeout(() => {
                        item.classList.remove('newly-unlocked');
                    }, 2000);
                }
            } else {
                // Récompense verrouillée
                item.classList.add('locked');
                item.classList.remove('unlocked');
                rewardIcon.style.color = '#6b7280';
            }
        });
    }
    
    function updateUserBadge(currentLevel) {
        const statusBadge = document.getElementById('user-status');
        if (statusBadge) {
            statusBadge.textContent = currentLevel.title;
            statusBadge.style.background = currentLevel.color;
            statusBadge.style.color = '#000';
        }
    }

    // ==================== GESTION DES STATISTIQUES ====================
    async function getReferralsCount(founderCode) {
        try {
            // Méthode 1: Utiliser le compteur stocké (plus rapide)
            const ownerQuery = await db.collection('preinscription')
                .where('generatedFounderCode', '==', founderCode)
                .get();
            
            if (!ownerQuery.empty) {
                const ownerData = ownerQuery.docs[0].data();
                const storedCount = ownerData.referralsCount || 0;
                console.log(`Compteur stocké pour ${founderCode}: ${storedCount}`);
                return storedCount;
            }
            
            // Méthode 2: Fallback - compter manuellement (au cas où)
            const query = await db.collection('preinscription')
                .where('founderCodeUsed', '==', founderCode)
                .get();
            
            console.log(`Comptage manuel pour ${founderCode}: ${query.size}`);
            return query.size;
        } catch (error) {
            console.error('Erreur lors de la récupération des parrainages:', error);
            return 0;
        }
    }
    
    async function getTotalUsers() {
        try {
            const query = await db.collection('preinscription').get();
            return query.size;
        } catch (error) {
            console.error('Erreur lors de la récupération du total des utilisateurs:', error);
            return 1;
        }
    }
    
    async function getUserRank(referralsCount) {
        try {
            // Obtenir tous les utilisateurs avec leurs compteurs stockés
            const allUsers = await db.collection('preinscription').get();
            const referralCounts = [];
            
            // Utiliser les compteurs stockés (plus rapide)
            allUsers.forEach(doc => {
                const userData = doc.data();
                if (userData.generatedFounderCode) {
                    const userReferrals = userData.referralsCount || 0;
                    referralCounts.push(userReferrals);
                }
            });
            
            // Calculer le rang
            const betterThanCount = referralCounts.filter(count => count < referralsCount).length;
            const totalUsers = referralCounts.length;
            
            if (totalUsers === 0) return 100;
            
            const rankPercentage = Math.round((betterThanCount / totalUsers) * 100);
            console.log(`Rang calculé: ${rankPercentage}% (${betterThanCount}/${totalUsers} utilisateurs dépassés)`);
            return Math.max(rankPercentage, 1); // Minimum 1%
        } catch (error) {
            console.error('Erreur lors du calcul du rang:', error);
            return 50; // Valeur par défaut
        }
    }
    
    // ==================== MISE À JOUR DE L'INTERFACE ====================
    async function updateUserInfo(user) {
        try {
            // Récupérer les données directement depuis Firestore
            const userDoc = await db.collection('preinscription')
                .where('email', '==', user.email)
                .get();

            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                
                // Informations de base
                document.getElementById('user-email').textContent = userData.email || '--';
                document.getElementById('user-username').textContent = userData.username || '--';
                document.getElementById('user-founder-code').textContent = userData.generatedFounderCode || '--';
                document.getElementById('user-founder-code-popup').textContent = userData.generatedFounderCode || '--';
                document.getElementById('user-registration-date').textContent = formatDate(userData.timestamp);
                
                // Statistiques
                const referralsCount = userData.referralsCount || 0;
                document.getElementById('referrals-count').innerHTML = `<span class="count-number">${referralsCount}</span>`;
                
                // Mise à jour de la passe de combat
                updateBattlePassProgress(referralsCount);
                
                // Rang
                const rank = await getUserRank(referralsCount);
                document.getElementById('rank-percentage').textContent = rank;
                
                // Barre de progression (basée sur le rang)
                const progressFill = document.getElementById('progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${rank}%`;
                    
                    // Couleur de la barre selon le rang
                    if (rank >= 80) {
                        progressFill.style.backgroundColor = 'var(--secondary-green)';
                    } else if (rank >= 50) {
                        progressFill.style.backgroundColor = 'var(--accent-light-green)';
                    } else {
                        progressFill.style.backgroundColor = 'var(--accent-yellow)';
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des informations utilisateur:', error);
        }
    }

    // Supprimer la fonction updateUserStats car elle est maintenant intégrée dans updateUserInfo
    
    function updateBattlePassProgress(referralsCount) {
        console.log('Mise à jour de la progression -', referralsCount, 'parrainages');
        
        // Mettre à jour le score d'avancement
        const referralsCountElement = document.getElementById('referrals-count');
        if (referralsCountElement) {
            referralsCountElement.textContent = referralsCount;
        }
        
        const requirements = [1, 5, 10, 25, 50, 100];
        let currentLevel = 1;
        let nextRequirement = 5;
        let progress = 0;

        // Si 0 parrainage, forcer la progression à 0
        if (referralsCount === 0) {
            progress = 0;
            currentLevel = 1;
            nextRequirement = 1;
        } else {
            // Trouver le niveau actuel et le prochain palier
            for (let i = 0; i < requirements.length - 1; i++) {
                if (referralsCount >= requirements[i] && referralsCount < requirements[i + 1]) {
                    currentLevel = i + 1;
                    nextRequirement = requirements[i + 1];
                    progress = ((referralsCount - requirements[i]) / (requirements[i + 1] - requirements[i])) * 100;
                    break;
                } else if (referralsCount >= requirements[requirements.length - 1]) {
                    currentLevel = requirements.length;
                    nextRequirement = requirements[requirements.length - 1];
                    progress = 100;
                }
            }
        }

        // Mettre à jour l'affichage du nombre de parrainages et du prochain palier
        const currentReferralsElement = document.getElementById('current-referrals');
        const nextRequirementElement = document.getElementById('next-level-requirement');
        
        if (currentReferralsElement) {
            currentReferralsElement.textContent = referralsCount;
        }
        if (nextRequirementElement) {
            nextRequirementElement.textContent = nextRequirement;
        }

        // Mettre à jour la barre de progression
        const progressBar = document.getElementById('battle-pass-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Mettre à jour l'état des récompenses
        const rewardItems = document.querySelectorAll('.reward-item');
        rewardItems.forEach((item, index) => {
            const currentRequirement = requirements[index];
            
            if (referralsCount === 0 && index === 0) {
                // Premier niveau avec 0 parrainage : non débloqué
                item.classList.add('locked');
                item.classList.remove('unlocked', 'current-level');
            } else if (referralsCount >= currentRequirement) {
                // Niveau complètement débloqué
                item.classList.add('unlocked');
                item.classList.remove('locked', 'current-level');
            } else if (index > 0 && referralsCount >= requirements[index - 1]) {
                // Niveau en cours
                item.classList.add('locked', 'current-level');
                item.classList.remove('unlocked');
            } else {
                // Niveau verrouillé
                item.classList.add('locked');
                item.classList.remove('unlocked', 'current-level');
            }
        });

        console.log(`Progression mise à jour - Niveau ${currentLevel}, Progression: ${progress}%, Prochain palier: ${nextRequirement}`);
    }
    
    // ==================== FONCTIONS D'INTERACTION ====================
    window.copyFounderCode = function() {
        const codeElement = document.getElementById('user-founder-code');
        const code = codeElement.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            const button = document.querySelector('.copy-button');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-check"></i> Copié !';
            button.style.backgroundColor = 'var(--secondary-green)';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
        });
    };
    
    window.logout = function() {
        clearUserCache();
        window.location.href = 'index.html';
    };
    
    // Fonction utilitaire pour déboguer le cache
    window.debugCache = function() {
        const user = getUserFromCache();
        console.log('État du cache:', user);
        console.log('localStorage dodje_user:', localStorage.getItem('dodje_user'));
        return user;
    };
    
    // ==================== GESTION DE LA VIDÉO ====================
    const backgroundVideo = document.getElementById('background-video');
    if (backgroundVideo) {
        backgroundVideo.play().catch(e => {
            console.log('Autoplay bloqué:', e);
        });
        
        backgroundVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }

    function toggleInfoPopup() {
        const popup = document.getElementById('infoPopup');
        popup.classList.toggle('active');
    }

    // Rendre la fonction accessible globalement
    window.toggleInfoPopup = toggleInfoPopup;

    // Fermer la popup en cliquant en dehors
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('infoPopup');
        const infoButton = document.querySelector('.info-button');
        
        if (!popup.contains(e.target) && !infoButton.contains(e.target) && popup.classList.contains('active')) {
            popup.classList.remove('active');
        }
    });
    
    // ==================== INITIALISATION ====================
    async function init() {
        try {
            // Vérifier l'authentification
            const user = checkUserAuth();
            if (!user) return;

            // Recharger le score du jeu pour l'utilisateur actuel
            if (gameState.canvas) {
                gameState.bestScore = 0;
                updateScoreDisplay();
                await loadBestScoreFromFirebase();
            }

            // Récupérer les données utilisateur depuis Firestore
            const userDoc = await db.collection('preinscription')
                .where('email', '==', user.email)
                .get();

            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                
                // Mettre à jour les informations de base
                document.getElementById('user-email').textContent = userData.email || '--';
                document.getElementById('user-username').textContent = userData.username || '--';
                document.getElementById('user-founder-code').textContent = userData.generatedFounderCode || '--';
                document.getElementById('user-founder-code-popup').textContent = userData.generatedFounderCode || '--';
                document.getElementById('user-registration-date').textContent = formatDate(userData.timestamp);

                // Mettre à jour les statistiques et le passe de combat
                const referralsCount = userData.referralsCount || 0;
                console.log('Nombre de parrainages:', referralsCount);

                // Mettre à jour le score d'avancement
                const referralsCountElement = document.getElementById('referrals-count');
                if (referralsCountElement) {
                    referralsCountElement.textContent = referralsCount;
                }

                // Mettre à jour la progression du passe de combat
                updateBattlePassProgress(referralsCount);

                // Mettre à jour le rang
                const rank = await getUserRank(referralsCount);
                const rankElement = document.getElementById('rank-percentage');
                if (rankElement) {
                    rankElement.textContent = rank;
                }

                // Mettre à jour la barre de progression du rang
                const progressFill = document.getElementById('progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${rank}%`;
                    if (rank >= 80) {
                        progressFill.style.backgroundColor = 'var(--secondary-green)';
                    } else if (rank >= 50) {
                        progressFill.style.backgroundColor = 'var(--accent-light-green)';
                    } else {
                        progressFill.style.backgroundColor = 'var(--accent-yellow)';
                    }
                }

                // Configurer un écouteur en temps réel pour les mises à jour
                const docRef = userDoc.docs[0].ref;
                docRef.onSnapshot((doc) => {
                    if (doc.exists) {
                        const updatedData = doc.data();
                        const newReferralsCount = updatedData.referralsCount || 0;
                        console.log('Mise à jour en temps réel - Parrainages:', newReferralsCount);
                        
                        // Mettre à jour l'interface avec les nouvelles données
                        if (referralsElement) {
                            referralsElement.textContent = newReferralsCount;
                        }
                        updateBattlePassProgress(newReferralsCount);
                    }
                });
            }

            // Démarrer le countdown
            updateCountdown();
            setInterval(updateCountdown, 60000); // Mise à jour chaque minute

            console.log('🚀 Dashboard Dodje chargé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    function updateBattlePassProgress(referralsCount) {
        console.log('Mise à jour de la progression -', referralsCount, 'parrainages');
        
        // Mettre à jour le score d'avancement
        const referralsCountElement = document.getElementById('referrals-count');
        if (referralsCountElement) {
            referralsCountElement.textContent = referralsCount;
        }
        
        const requirements = [1, 5, 10, 25, 50, 100];
        let currentLevel = 1;
        let nextRequirement = 5;
        let progress = 0;

        // Si 0 parrainage, forcer la progression à 0
        if (referralsCount === 0) {
            progress = 0;
            currentLevel = 1;
            nextRequirement = 1;
        } else {
            // Trouver le niveau actuel et le prochain palier
            for (let i = 0; i < requirements.length - 1; i++) {
                if (referralsCount >= requirements[i] && referralsCount < requirements[i + 1]) {
                    currentLevel = i + 1;
                    nextRequirement = requirements[i + 1];
                    progress = ((referralsCount - requirements[i]) / (requirements[i + 1] - requirements[i])) * 100;
                    break;
                } else if (referralsCount >= requirements[requirements.length - 1]) {
                    currentLevel = requirements.length;
                    nextRequirement = requirements[requirements.length - 1];
                    progress = 100;
                }
            }
        }

        // Mettre à jour l'affichage du nombre de parrainages et du prochain palier
        const currentReferralsElement = document.getElementById('current-referrals');
        const nextRequirementElement = document.getElementById('next-level-requirement');
        
        if (currentReferralsElement) {
            currentReferralsElement.textContent = referralsCount;
        }
        if (nextRequirementElement) {
            nextRequirementElement.textContent = nextRequirement;
        }

        // Mettre à jour la barre de progression
        const progressBar = document.getElementById('battle-pass-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Mettre à jour l'état des récompenses
        const rewardItems = document.querySelectorAll('.reward-item');
        rewardItems.forEach((item, index) => {
            const currentRequirement = requirements[index];
            
            if (referralsCount === 0 && index === 0) {
                // Premier niveau avec 0 parrainage : non débloqué
                item.classList.add('locked');
                item.classList.remove('unlocked', 'current-level');
            } else if (referralsCount >= currentRequirement) {
                // Niveau complètement débloqué
                item.classList.add('unlocked');
                item.classList.remove('locked', 'current-level');
            } else if (index > 0 && referralsCount >= requirements[index - 1]) {
                // Niveau en cours
                item.classList.add('locked', 'current-level');
                item.classList.remove('unlocked');
            } else {
                // Niveau verrouillé
                item.classList.add('locked');
                item.classList.remove('unlocked', 'current-level');
            }
        });

        console.log(`Progression mise à jour - Niveau ${currentLevel}, Progression: ${progress}%, Prochain palier: ${nextRequirement}`);
    }
    
    // ==================== FLAPPY BIRD GAME ==================== 
    let gameState = {
        isPlaying: false,
        isPaused: false,
        score: 0,
        bestScore: 0,
        bird: {
            x: 80,
            y: 200,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.5,
            jump: -10,
            color: '#06D001'
        },
        pipes: [],
        canvas: null,
        ctx: null,
        gameLoop: null,
        frameCount: 0,
        trunkImage: null,
        backgroundVideo: null,
        lastDeathTime: 0,
        clickDelay: 500
    };

    function initGame() {
        gameState.canvas = document.getElementById('gameCanvas');
        gameState.ctx = gameState.canvas.getContext('2d');
        
        // Charger l'image du tronc
        gameState.trunkImage = new Image();
        gameState.trunkImage.src = 'assets/Tronc.png';
        
        // Créer et configurer la vidéo d'arrière-plan
        gameState.backgroundVideo = document.createElement('video');
        gameState.backgroundVideo.src = 'assets/anime/FondAnime.mp4';
        gameState.backgroundVideo.loop = true;
        gameState.backgroundVideo.muted = true;
        gameState.backgroundVideo.autoplay = true;
        gameState.backgroundVideo.playsinline = true;
        
        // Démarrer la vidéo
        gameState.backgroundVideo.play().catch(e => {
            console.log('Impossible de démarrer la vidéo d\'arrière-plan:', e);
        });
        
        // Réinitialiser le score au démarrage
        gameState.bestScore = 0;
        updateScoreDisplay();
        
        // Toujours charger le meilleur score depuis Firebase en temps réel
        loadBestScoreFromFirebase();
        
        // Événements de contrôle
        gameState.canvas.addEventListener('click', jump);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                
                // Vérifier si le délai après la mort est respecté
                const currentTime = Date.now();
                if (currentTime - gameState.lastDeathTime < gameState.clickDelay) {
                    return;
                }
                
                if (gameState.isPlaying) {
                    jump();
                } else {
                    // Démarrer le jeu si il n'est pas lancé
                    window.startGame();
                }
            }
        });
        
        draw();
    }

    function jump() {
        // Vérifier si le délai après la mort est respecté
        const currentTime = Date.now();
        if (currentTime - gameState.lastDeathTime < gameState.clickDelay) {
            return;
        }
        
        if (!gameState.isPlaying) return;
        gameState.bird.velocity = gameState.bird.jump;
    }

    function createPipe() {
        const gap = 150;
        const minHeight = 50;
        const maxHeight = gameState.canvas.height - gap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        return {
            x: gameState.canvas.width,
            topHeight: height,
            bottomY: height + gap,
            bottomHeight: gameState.canvas.height - (height + gap),
            width: 50,
            passed: false
        };
    }

    function updateGame() {
        if (!gameState.isPlaying) return;
        
        gameState.frameCount++;
        
        // Mise à jour de l'oiseau
        gameState.bird.velocity += gameState.bird.gravity;
        gameState.bird.y += gameState.bird.velocity;
        
        // Générer des tuyaux
        if (gameState.frameCount % 90 === 0) {
            gameState.pipes.push(createPipe());
        }
        
        // Mise à jour des tuyaux
        gameState.pipes = gameState.pipes.filter(pipe => {
            pipe.x -= 3;
            
            // Vérifier le score
            if (!pipe.passed && pipe.x + pipe.width < gameState.bird.x) {
                pipe.passed = true;
                gameState.score++;
                updateScoreDisplay();
            }
            
            return pipe.x + pipe.width > 0;
        });
        
        // Vérifier les collisions
        checkCollisions();
    }

    function checkCollisions() {
        // Collision avec le sol ou le plafond
        if (gameState.bird.y + gameState.bird.height > gameState.canvas.height || 
            gameState.bird.y < 0) {
            gameOver();
            return;
        }
        
        // Collision avec les tuyaux
        gameState.pipes.forEach(pipe => {
            if (gameState.bird.x < pipe.x + pipe.width &&
                gameState.bird.x + gameState.bird.width > pipe.x) {
                
                if (gameState.bird.y < pipe.topHeight ||
                    gameState.bird.y + gameState.bird.height > pipe.bottomY) {
                    gameOver();
                }
            }
        });
    }

    function draw() {
        // Effacer le canvas
        gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
        
        // Dessiner l'arrière-plan vidéo
        if (gameState.backgroundVideo && gameState.backgroundVideo.readyState >= 2) {
            gameState.ctx.drawImage(
                gameState.backgroundVideo,
                0, 0, gameState.canvas.width, gameState.canvas.height
            );
        } else {
            // Fallback : gradient si la vidéo n'est pas prête
            const gradient = gameState.ctx.createLinearGradient(0, 0, 0, gameState.canvas.height);
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#002244');
            gameState.ctx.fillStyle = gradient;
            gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
        }
        
        // Dessiner les étoiles uniquement si la vidéo n'est pas disponible
        if (!gameState.backgroundVideo || gameState.backgroundVideo.readyState < 2) {
            drawStars();
        }
        
        // Dessiner les tuyaux
        gameState.pipes.forEach(pipe => {
            drawPipe(pipe);
        });
        
        // Dessiner l'oiseau
        drawBird();
        
        // Dessiner le score pendant le jeu
        if (gameState.isPlaying) {
            drawScore();
        }
    }

    function drawStars() {
        gameState.ctx.fillStyle = '#9BEC00';
        for (let i = 0; i < 50; i++) {
            const x = (i * 163) % gameState.canvas.width;
            const y = (i * 97) % gameState.canvas.height;
            gameState.ctx.beginPath();
            gameState.ctx.arc(x, y, 1, 0, Math.PI * 2);
            gameState.ctx.fill();
        }
    }

    function drawPipe(pipe) {
        if (!gameState.trunkImage || !gameState.trunkImage.complete) {
            // Fallback : dessiner des rectangles si l'image n'est pas chargée
            const topGradient = gameState.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            topGradient.addColorStop(0, '#06D001');
            topGradient.addColorStop(1, '#9BEC00');
            gameState.ctx.fillStyle = topGradient;
            gameState.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
            
            const bottomGradient = gameState.ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipe.width, pipe.bottomY + pipe.bottomHeight);
            bottomGradient.addColorStop(0, '#06D001');
            bottomGradient.addColorStop(1, '#9BEC00');
            gameState.ctx.fillStyle = bottomGradient;
            gameState.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
            return;
        }
        
        // Tuyau du haut
        gameState.ctx.save();
        gameState.ctx.translate(pipe.x + pipe.width/2, pipe.topHeight/2);
        gameState.ctx.rotate(-Math.PI/2); // Rotation de -90 degrés
        
        // Créer un clipping pour ne pas dépasser
        gameState.ctx.beginPath();
        gameState.ctx.rect(-pipe.topHeight/2, -pipe.width/2, pipe.topHeight, pipe.width);
        gameState.ctx.clip();
        
        // Dessiner l'image du tronc tournée
        gameState.ctx.drawImage(
            gameState.trunkImage,
            -pipe.topHeight/2, -pipe.width/2, pipe.topHeight, pipe.width
        );
        
        gameState.ctx.restore();
        
        // Tuyau du bas
        gameState.ctx.save();
        gameState.ctx.translate(pipe.x + pipe.width/2, pipe.bottomY + pipe.bottomHeight/2);
        gameState.ctx.rotate(-Math.PI/2); // Rotation de -90 degrés
        
        // Créer un clipping pour ne pas dépasser
        gameState.ctx.beginPath();
        gameState.ctx.rect(-pipe.bottomHeight/2, -pipe.width/2, pipe.bottomHeight, pipe.width);
        gameState.ctx.clip();
        
        // Dessiner l'image du tronc tournée
        gameState.ctx.drawImage(
            gameState.trunkImage,
            -pipe.bottomHeight/2, -pipe.width/2, pipe.bottomHeight, pipe.width
        );
        
        gameState.ctx.restore();
    }

    function drawBird() {
        // Corps de l'oiseau
        const birdGradient = gameState.ctx.createRadialGradient(
            gameState.bird.x + gameState.bird.width/2, 
            gameState.bird.y + gameState.bird.height/2, 
            0, 
            gameState.bird.x + gameState.bird.width/2, 
            gameState.bird.y + gameState.bird.height/2, 
            gameState.bird.width/2
        );
        birdGradient.addColorStop(0, '#9BEC00');
        birdGradient.addColorStop(1, '#06D001');
        
        gameState.ctx.fillStyle = birdGradient;
        gameState.ctx.beginPath();
        gameState.ctx.arc(
            gameState.bird.x + gameState.bird.width/2, 
            gameState.bird.y + gameState.bird.height/2, 
            gameState.bird.width/2, 
            0, 
            Math.PI * 2
        );
        gameState.ctx.fill();
        
        // Contour de l'oiseau
        gameState.ctx.strokeStyle = '#F3FF90';
        gameState.ctx.lineWidth = 2;
        gameState.ctx.stroke();
        
        // Oeil
        gameState.ctx.fillStyle = '#000000';
        gameState.ctx.beginPath();
        gameState.ctx.arc(
            gameState.bird.x + gameState.bird.width/2 + 5, 
            gameState.bird.y + gameState.bird.height/2 - 5, 
            3, 
            0, 
            Math.PI * 2
        );
        gameState.ctx.fill();
    }

    function drawScore() {
        gameState.ctx.font = '36px Arboria, Arial, sans-serif';
        gameState.ctx.fillStyle = '#F3FF90';
        gameState.ctx.textAlign = 'center';
        gameState.ctx.fillText(gameState.score, gameState.canvas.width / 2, 50);
    }

    function updateScoreDisplay() {
        document.getElementById('current-score').textContent = gameState.score;
        document.getElementById('best-score').textContent = gameState.bestScore;
        console.log('Score affiché - Current:', gameState.score, 'Best:', gameState.bestScore);
    }

    function gameOver() {
        gameState.isPlaying = false;
        
        // Enregistrer le timestamp de la mort pour le délai
        gameState.lastDeathTime = Date.now();
        
        // Sauvegarder le meilleur score
        if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
            localStorage.setItem('dodje_bird_best_score', gameState.bestScore);
            saveBestScoreToFirebase(gameState.bestScore);
        }
        
        // Afficher l'écran de fin
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('finalBestScore').textContent = gameState.bestScore;
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('gameOverlay').style.display = 'flex';
        
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
        }
    }

    function resetGame() {
        gameState.bird.x = 80;
        gameState.bird.y = 200;
        gameState.bird.velocity = 0;
        gameState.pipes = [];
        gameState.score = 0;
        gameState.frameCount = 0;
        updateScoreDisplay();
    }

    async function saveBestScoreToFirebase(score) {
        try {
            const user = getUserFromCache();
            if (!user || !user.email) return;
            
            const userDoc = await db.collection('preinscription')
                .where('email', '==', user.email)
                .get();
            
            if (!userDoc.empty) {
                const docId = userDoc.docs[0].id;
                await db.collection('preinscription').doc(docId).update({
                    bestFlappyBirdScore: score,
                    lastGamePlayed: new Date().toISOString()
                });
                console.log('Score sauvegardé dans Firebase:', score);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du score:', error);
        }
    }

    async function loadBestScoreFromFirebase() {
        try {
            const user = getUserFromCache();
            if (!user || !user.email) return;
            
            const userDoc = await db.collection('preinscription')
                .where('email', '==', user.email)
                .get();
            
            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                const firebaseScore = userData.bestFlappyBirdScore || 0;
                
                // Toujours mettre à jour avec le score Firebase de l'utilisateur actuel
                gameState.bestScore = firebaseScore;
                localStorage.setItem('dodje_bird_best_score', gameState.bestScore);
                updateScoreDisplay();
                
                console.log('Score Firebase chargé pour', user.email, ':', firebaseScore);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du score:', error);
        }
    }

    // Fonctions globales pour les boutons
    window.startGame = async function() {
        // Vérifier si le délai après la mort est respecté
        const currentTime = Date.now();
        if (currentTime - gameState.lastDeathTime < gameState.clickDelay) {
            return;
        }
        
        // Vérifier l'utilisateur avant de commencer
        await refreshUserScore();
        
        resetGame();
        gameState.isPlaying = true;
        document.getElementById('gameOverlay').style.display = 'none';
        
        gameState.gameLoop = setInterval(() => {
            updateGame();
            draw();
        }, 1000 / 60); // 60 FPS
    };

    window.restartGame = function() {
        // Vérifier si le délai après la mort est respecté
        const currentTime = Date.now();
        if (currentTime - gameState.lastDeathTime < gameState.clickDelay) {
            return;
        }
        
        window.startGame();
    };

    // ==================== LEADERBOARD FUNCTIONS ====================
    async function loadLeaderboard() {
        try {
            const scoresQuery = await db.collection('preinscription')
                .where('bestFlappyBirdScore', '>', 0)
                .orderBy('bestFlappyBirdScore', 'desc')
                .get(); // Récupérer tous les scores sans limite
            
            const scores = [];
            scoresQuery.forEach(doc => {
                const data = doc.data();
                scores.push({
                    username: data.username,
                    score: data.bestFlappyBirdScore,
                    email: data.email
                });
            });
            
            return scores;
        } catch (error) {
            console.error('Erreur lors du chargement du leaderboard:', error);
            return [];
        }
    }

    async function displayLeaderboard() {
        const leaderboardLoading = document.getElementById('leaderboardLoading');
        const leaderboardList = document.getElementById('leaderboardList');
        
        leaderboardLoading.style.display = 'block';
        leaderboardList.innerHTML = '';
        
        try {
            const scores = await loadLeaderboard();
            const currentUser = getUserFromCache();
            
            leaderboardLoading.style.display = 'none';
            
            if (scores.length === 0) {
                leaderboardList.innerHTML = '<div class="leaderboard-empty">Aucun score enregistré</div>';
                return;
            }
            
            scores.forEach((score, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                
                if (currentUser && score.email === currentUser.email) {
                    item.classList.add('current-user');
                }
                
                const rank = index + 1;
                let rankClass = '';
                if (rank === 1) rankClass = 'gold';
                else if (rank === 2) rankClass = 'silver';
                else if (rank === 3) rankClass = 'bronze';
                
                item.innerHTML = `
                    <span class="leaderboard-rank ${rankClass}">${rank}</span>
                    <span class="leaderboard-username">${score.username}</span>
                    <span class="leaderboard-score">${score.score}</span>
                `;
                
                leaderboardList.appendChild(item);
            });
            
        } catch (error) {
            leaderboardLoading.style.display = 'none';
            leaderboardList.innerHTML = '<div class="leaderboard-error">Erreur lors du chargement</div>';
        }
    }



    window.toggleLeaderboard = function() {
        const leaderboardPopup = document.getElementById('leaderboardPopup');
        
        // Afficher la popup
        leaderboardPopup.style.display = 'flex';
        
        // Charger les données
        displayLeaderboard();
    };

    window.closeLeaderboard = function() {
        const leaderboardPopup = document.getElementById('leaderboardPopup');
        
        leaderboardPopup.style.display = 'none';
    };

    // Fermer la popup en cliquant en dehors
    document.addEventListener('click', function(e) {
        const leaderboardPopup = document.getElementById('leaderboardPopup');
        const popupContent = document.querySelector('.leaderboard-popup-content');
        
        if (e.target === leaderboardPopup && !popupContent.contains(e.target)) {
            closeLeaderboard();
        }
    });

    // Fermer la popup avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const leaderboardPopup = document.getElementById('leaderboardPopup');
            if (leaderboardPopup.style.display === 'flex') {
                closeLeaderboard();
            }
        }
    });



    // Variable pour tracker l'utilisateur actuel
    let currentGameUser = null;

    // Fonction pour recharger le meilleur score de l'utilisateur actuel
    async function refreshUserScore() {
        const user = getUserFromCache();
        if (!user || !user.email) return;
        
        // Vérifier si l'utilisateur a changé
        if (currentGameUser !== user.email) {
            console.log('Changement d\'utilisateur détecté:', currentGameUser, '->', user.email);
            currentGameUser = user.email;
            
            // Réinitialiser le score et charger depuis Firebase
            gameState.bestScore = 0;
            updateScoreDisplay();
            await loadBestScoreFromFirebase();
        }
    }

    // Rendre la fonction disponible globalement
    window.refreshUserScore = refreshUserScore;

    // Initialiser le jeu quand la page se charge
    setTimeout(() => {
        initGame();
        refreshUserScore();
        
        // Vérifier périodiquement les changements d'utilisateur
        setInterval(() => {
            refreshUserScore();
        }, 5000); // Vérifier toutes les 5 secondes
    }, 1000);
    
    // Démarrer l'application
    init();
}); 