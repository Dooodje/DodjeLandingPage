// Simple and clean interactions inspired by Hackathon.dev

document.addEventListener('DOMContentLoaded', function() {
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
    }
    
    // Vérifier si l'utilisateur est déjà connecté
    function checkExistingUser() {
        try {
            const user = getUserFromCache();
            console.log('Vérification du cache utilisateur:', user);
            
            if (user && user.email && user.username && user.founderCode) {
                console.log('Utilisateur trouvé dans le cache, redirection vers dashboard...');
                // Rediriger vers le dashboard
                window.location.href = 'dashboard.html';
                return true;
            }
            
            console.log('Aucun utilisateur valide dans le cache');
            return false;
        } catch (error) {
            console.error('Erreur lors de la vérification du cache:', error);
            // En cas d'erreur, nettoyer le cache
            clearUserCache();
            return false;
        }
    }
    
    // Vérifier au chargement de la page
    console.log('Vérification de l\'utilisateur existant...');
    if (checkExistingUser()) {
        console.log('Redirection en cours...');
        return; // Arrêter l'exécution si redirection
    }
    
    console.log('Aucun utilisateur connecté, chargement normal de la landing page');
    
    // Ajouter une fonction globale pour nettoyer le cache si nécessaire
    window.clearDodjeCache = function() {
        clearUserCache();
        console.log('Cache Dodje nettoyé');
        location.reload();
    };
    
    // Double vérification après un petit délai
    setTimeout(() => {
        const user = getUserFromCache();
        if (user && user.email && user.username && user.founderCode) {
            console.log('Vérification différée: utilisateur trouvé, redirection...');
            window.location.href = 'dashboard.html';
        }
    }, 100);
    
    // ==================== NAVIGATION DYNAMIQUE ====================
    const navbarMinimal = document.getElementById('navbar-minimal');
    const navbarScroll = document.getElementById('navbar-scroll');
    let navScrollTop = 0;
    const scrollThreshold = 100; // Pixels de scroll avant de changer le header
    
    // Fonction pour gérer l'affichage des headers selon le scroll
    function handleScrollNavigation() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > scrollThreshold) {
            // Masquer le header minimal et afficher le header complet
            if (!navbarMinimal.classList.contains('hidden')) {
                navbarMinimal.classList.add('hidden');
            }
            if (!navbarScroll.classList.contains('visible')) {
                navbarScroll.classList.add('visible');
            }
        } else {
            // Afficher le header minimal et masquer le header complet
            if (navbarMinimal.classList.contains('hidden')) {
                navbarMinimal.classList.remove('hidden');
            }
            if (navbarScroll.classList.contains('visible')) {
                navbarScroll.classList.remove('visible');
            }
        }
        
        navScrollTop = scrollTop;
    }
    
    // Event listener pour le scroll
    window.addEventListener('scroll', handleScrollNavigation, { passive: true });
    
    // Initialiser l'état au chargement
    handleScrollNavigation();
    
    // ==================== MENU MOBILE ====================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    
    // Fonction pour ouvrir le menu mobile
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Fonction pour fermer le menu mobile
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Event listeners pour le menu mobile
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Fermer le menu mobile quand on clique sur un lien
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links .nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Fermer le menu mobile sur escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
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
    
    // Fonction pour générer un code fondateur
    function generateFounderCode(username) {
        const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${username}${randomNumbers}`;
    }
    
    // Fonction pour vérifier si un code fondateur existe déjà
    async function checkFounderCodeExists(founderCode) {
        try {
            const preinscriptionQuery = await db.collection('preinscription')
                .where('generatedFounderCode', '==', founderCode)
                .get();
            
            return !preinscriptionQuery.empty;
        } catch (error) {
            console.error('Erreur lors de la vérification du code fondateur:', error);
            return false;
        }
    }
    
    // Fonction pour générer un code fondateur unique
    async function generateUniqueFounderCode(username) {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const founderCode = generateFounderCode(username);
            const exists = await checkFounderCodeExists(founderCode);
            
            if (!exists) {
                return founderCode;
            }
            
            attempts++;
        }
        
        // Si on ne trouve pas de code unique après 10 tentatives, on utilise un timestamp
        const timestamp = Date.now().toString().slice(-3);
        return `${username}${timestamp}`;
    }
    
    // Fonction pour vérifier les doublons d'email
    async function checkEmailExists(email) {
        try {
            // Vérifier dans la collection "preinscription"
            const preinscriptionQuery = await db.collection('preinscription')
                .where('email', '==', email)
                .get();
            
            if (!preinscriptionQuery.empty) {
                return { exists: true, collection: 'preinscription' };
            }
            
            // Vérifier dans la collection "users"
            const usersQuery = await db.collection('users')
                .where('email', '==', email)
                .get();
            
            if (!usersQuery.empty) {
                return { exists: true, collection: 'users' };
            }
            
            return { exists: false };
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
            throw error;
        }
    }
    
    // Fonction pour vérifier les doublons de nom d'utilisateur
    async function checkUsernameExists(username) {
        try {
            // Vérifier dans la collection "preinscription"
            const preinscriptionQuery = await db.collection('preinscription')
                .where('username', '==', username)
                .get();
            
            if (!preinscriptionQuery.empty) {
                return { exists: true, collection: 'preinscription' };
            }
            
            // Vérifier dans la collection "users"
            const usersQuery = await db.collection('users')
                .where('name', '==', username)
                .get();
            
            if (!usersQuery.empty) {
                return { exists: true, collection: 'users' };
            }
            
            return { exists: false };
        } catch (error) {
            console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
            throw error;
        }
    }

    // Fonction pour incrémenter le compteur d'utilisation d'un code fondateur
    async function incrementFounderCodeUsage(founderCode) {
        try {
            // Trouver la personne qui possède ce code fondateur
            const ownerQuery = await db.collection('preinscription')
                .where('generatedFounderCode', '==', founderCode)
                .get();
            
            if (ownerQuery.empty) {
                console.warn('Aucun propriétaire trouvé pour le code fondateur:', founderCode);
                return false;
            }
            
            // Incrémenter le compteur pour chaque propriétaire (normalement un seul)
            const batch = db.batch();
            
            ownerQuery.forEach(doc => {
                const docRef = db.collection('preinscription').doc(doc.id);
                const currentData = doc.data();
                const currentCount = currentData.referralsCount || 0;
                
                batch.update(docRef, {
                    referralsCount: currentCount + 1,
                    lastReferralDate: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`Incrémentation du compteur pour ${currentData.username}: ${currentCount} -> ${currentCount + 1}`);
            });
            
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation du compteur:', error);
            return false;
        }
    }
    
    // Fonction pour récupérer l'adresse IP de l'utilisateur
    async function getCurrentIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'IP:', error);
            // Fallback vers une autre API si la première échoue
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                return data.ip;
            } catch (fallbackError) {
                console.error('Erreur lors de la récupération de l\'IP (fallback):', fallbackError);
                return null;
            }
        }
    }
    
    // Fonction pour enregistrer une tentative de fraude
    async function logFraudAttempt(founderCode, currentIP, creatorIP, additionalInfo = {}) {
        try {
            await db.collection('fraud_attempts').add({
                founderCode: founderCode,
                attemptIP: currentIP,
                creatorIP: creatorIP,
                type: 'same_ip_referral',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                ...additionalInfo
            });
            console.log('Tentative de fraude enregistrée dans Firebase');
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la tentative de fraude:', error);
        }
    }
    
    // Fonction pour vérifier la sécurité IP du code de parrainage
    async function checkReferralIPSecurity(founderCode, currentIP) {
        try {
            if (!currentIP) {
                console.warn('IP non disponible, vérification IP désactivée');
                return { valid: true }; // Si on ne peut pas récupérer l'IP, on autorise
            }
            
            // Trouver le créateur du code fondateur
            const founderQuery = await db.collection('preinscription')
                .where('generatedFounderCode', '==', founderCode)
                .get();
            
            if (founderQuery.empty) {
                return { valid: false, reason: 'Code fondateur inexistant' };
            }
            
            const founderData = founderQuery.docs[0].data();
            const creatorIP = founderData.registrationIP;
            
            if (creatorIP && creatorIP === currentIP) {
                console.warn('Tentative de fraude détectée:', {
                    founderCode: founderCode,
                    currentIP: currentIP,
                    creatorIP: creatorIP,
                    timestamp: new Date().toISOString()
                });
                
                // Enregistrer la tentative de fraude dans Firebase
                await logFraudAttempt(founderCode, currentIP, creatorIP, {
                    founderUsername: founderData.username,
                    founderEmail: founderData.email
                });
                
                return { 
                    valid: false, 
                    reason: 'Vous ne pouvez pas utiliser votre propre code de parrainage' 
                };
            }
            
            return { valid: true };
        } catch (error) {
            console.error('Erreur lors de la vérification IP:', error);
            return { valid: true }; // En cas d'erreur, on autorise pour ne pas bloquer l'utilisateur
        }
    }
    
    // Fonction pour enregistrer une préinscription
    async function savePreinscription(email, username, founderCode) {
        try {
            // Récupérer l'IP actuelle
            const currentIP = await getCurrentIP();
            console.log('IP actuelle:', currentIP);
            
            // Vérifier les doublons d'email
            const emailCheck = await checkEmailExists(email);
            if (emailCheck.exists) {
                return { 
                    success: false, 
                    error: 'duplicate_email',
                    message: 'Cette adresse email est déjà utilisée' 
                };
            }
            
            // Vérifier les doublons de nom d'utilisateur
            const usernameCheck = await checkUsernameExists(username);
            if (usernameCheck.exists) {
                return { 
                    success: false, 
                    error: 'duplicate_username',
                    message: 'Ce nom d\'utilisateur est déjà pris' 
                };
            }
            
            // Vérifier si le code fondateur utilisé existe (si fourni)
            if (founderCode) {
                const founderQuery = await db.collection('preinscription')
                    .where('generatedFounderCode', '==', founderCode)
                    .get();
                
                if (founderQuery.empty) {
                    return {
                        success: false,
                        error: 'invalid_founder_code',
                        message: 'Ce code fondateur n\'existe pas'
                    };
                }
                
                // Vérifier la sécurité IP du code de parrainage
                const ipCheck = await checkReferralIPSecurity(founderCode, currentIP);
                if (!ipCheck.valid) {
                    return {
                        success: false,
                        error: 'ip_security_violation',
                        message: ipCheck.reason
                    };
                }
            }
            
            // Générer le code fondateur automatiquement (unique)
            const generatedFounderCode = await generateUniqueFounderCode(username);
            
            const docRef = await db.collection('preinscription').add({
                email: email,
                username: username,
                founderCodeUsed: founderCode || null, // Code fondateur utilisé (optionnel)
                generatedFounderCode: generatedFounderCode, // Code fondateur généré automatiquement
                referralsCount: 0, // Compteur d'utilisations de son code
                registrationIP: currentIP, // Adresse IP d'inscription
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            
            // Si un code fondateur a été utilisé, incrémenter le compteur du propriétaire
            if (founderCode) {
                console.log('Code fondateur utilisé:', founderCode);
                await incrementFounderCodeUsage(founderCode);
            }
            
            console.log('Préinscription enregistrée avec l\'ID:', docRef.id);
            console.log('Code fondateur généré:', generatedFounderCode);
            console.log('IP enregistrée:', currentIP);
            return { success: true, id: docRef.id, founderCode: generatedFounderCode };
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            return { success: false, error: error.message };
        }
    }
    // ==================== MODAL MANAGEMENT ====================
    const modal = document.getElementById('preinscription-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const preinscriptionForm = document.getElementById('preinscription-form');
    const emailInput = document.getElementById('email-input');
    const usernameInput = document.getElementById('username-input');
    const founderCodeInput = document.getElementById('founder-code-input');
    const successMessage = document.getElementById('success-message');
    
    // Fonction pour ouvrir la modal
    function openModal() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Focus sur l'input email
        setTimeout(() => {
            emailInput.focus();
        }, 100);
    }
    
    // Fonction pour fermer la modal
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Reset des formulaires
        preinscriptionForm.reset();
        if (document.getElementById('login-form')) {
            document.getElementById('login-form').reset();
        }
        successMessage.style.display = 'none';
        
        // Remettre l'onglet inscription par défaut
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Activer l'onglet inscription
        const signupButton = document.querySelector('.tab-button[data-tab="signup"]');
        const signupTab = document.getElementById('signup-tab');
        if (signupButton && signupTab) {
            signupButton.classList.add('active');
            signupTab.classList.add('active');
        }
    }
    
    // Gérer l'ouverture de la modal via les boutons "C'est parti"
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        if (button.textContent.includes('C\'est parti')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        }
    });
    
    // Gérer la fermeture de la modal
    closeModalBtn.addEventListener('click', closeModal);
    
    // Fermer la modal en cliquant sur l'overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fermer la modal avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // ==================== TABS MANAGEMENT ====================
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Gérer le changement d'onglet
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Retirer les classes actives
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton et au contenu
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Focus sur le bon input
            if (targetTab === 'signup') {
                setTimeout(() => emailInput.focus(), 100);
            } else if (targetTab === 'login') {
                setTimeout(() => document.getElementById('login-input').focus(), 100);
            }
        });
    });
    
    // ==================== LOGIN FUNCTIONALITY ====================
    const loginForm = document.getElementById('login-form');
    const loginInput = document.getElementById('login-input');
    
    // Fonction pour vérifier les credentials de connexion
    async function checkLoginCredentials(email) {
        try {
            // Vérifier que c'est bien un email valide
            if (!isValidEmail(email)) {
                return { success: false, error: 'Adresse email invalide' };
            }
            
            // Recherche par email uniquement
            const query = await db.collection('preinscription')
                .where('email', '==', email)
                .get();
            
            if (!query.empty) {
                const userData = query.docs[0].data();
                return {
                    success: true,
                    user: {
                        email: userData.email,
                        username: userData.username,
                        founderCode: userData.generatedFounderCode,
                        registrationDate: userData.timestamp,
                        documentId: query.docs[0].id,
                        isRegistered: true,
                        lastLogin: new Date().toISOString()
                    }
                };
            } else {
                return { success: false, error: 'Aucun compte trouvé avec cette adresse email' };
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des credentials:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    // Gérer la soumission du formulaire de connexion
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = loginInput.value.trim();
        const submitButton = this.querySelector('.submit-login');
        const buttonText = submitButton.querySelector('.button-text');
        const buttonLoader = submitButton.querySelector('.button-loader');
        
        // Validation de l'email
        if (!email) {
            showError(loginInput, 'Veuillez entrer votre adresse email');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError(loginInput, 'Veuillez entrer une adresse email valide');
            return;
        }
        
        // Montrer le loader
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline-block';
        submitButton.disabled = true;
        
        try {
            const result = await checkLoginCredentials(email);
            
            if (result.success) {
                console.log('Connexion réussie:', result.user);
                
                // Sauvegarder les données utilisateur dans le cache
                saveUserToCache(result.user);
                
                // Vérifier que les données ont été sauvegardées
                const savedData = getUserFromCache();
                console.log('Données de connexion sauvegardées:', savedData);
                
                // Redirection vers le dashboard
                console.log('Connexion réussie, redirection vers dashboard...');
                window.location.href = 'dashboard.html';
                
            } else {
                showError(loginInput, result.error || 'Aucun compte trouvé avec cette adresse email');
                resetLoginButton();
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            showError(loginInput, 'Une erreur est survenue. Veuillez réessayer.');
            resetLoginButton();
        }
        
        function resetLoginButton() {
            buttonText.style.display = 'inline-block';
            buttonLoader.style.display = 'none';
            submitButton.disabled = false;
        }
    });
    
    // ==================== FIREBASE INTEGRATION ====================
    // Gérer la soumission du formulaire de préinscription
    preinscriptionForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const founderCode = founderCodeInput.value.trim();
        const submitButton = this.querySelector('.submit-email');
        const buttonText = submitButton.querySelector('.button-text');
        const buttonLoader = submitButton.querySelector('.button-loader');
        
        // Validation email
        if (!isValidEmail(email)) {
            showError(emailInput, 'Veuillez entrer une adresse email valide');
            return;
        }
        
        // Validation nom d'utilisateur
        if (!username || username.length < 3) {
            showError(usernameInput, 'Nom d\'utilisateur requis (min. 3 caractères)');
            return;
        }
        
        // Validation nom d'utilisateur (caractères autorisés)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError(usernameInput, 'Seuls les lettres, chiffres et _ sont autorisés');
            return;
        }
        
        // Montrer le loader
        buttonText.style.display = 'none';
        buttonLoader.style.display = 'inline-block';
        submitButton.disabled = true;
        
        try {
            // Enregistrer dans Firebase
            const result = await savePreinscription(email, username, founderCode);
            
            if (result.success) {
                // Sauvegarder les données utilisateur dans le cache
                const userData = {
                    email: email,
                    username: username,
                    founderCode: result.founderCode,
                    registrationDate: new Date().toISOString(),
                    documentId: result.id,
                    isRegistered: true,
                    lastLogin: new Date().toISOString()
                };
                
                console.log('Sauvegarde des données utilisateur dans le cache:', userData);
                saveUserToCache(userData);
                
                // Vérifier que les données ont été sauvegardées
                const savedData = getUserFromCache();
                console.log('Données sauvegardées vérifiées:', savedData);
                
                // Redirection immédiate vers le dashboard
                console.log('Inscription réussie, redirection vers dashboard...');
                window.location.href = 'dashboard.html';
                
            } else {
                // Gestion des erreurs spécifiques
                if (result.error === 'duplicate_email') {
                    showError(emailInput, result.message);
                } else if (result.error === 'duplicate_username') {
                    showError(usernameInput, result.message);
                } else if (result.error === 'invalid_founder_code' || result.error === 'ip_security_violation') {
                    showError(founderCodeInput, result.message);
                } else {
                    // Erreur générale
                    showError(emailInput, 'Une erreur est survenue. Veuillez réessayer.');
                }
                resetButton();
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            showError(emailInput, 'Une erreur est survenue. Veuillez réessayer.');
            resetButton();
        }
        
        function resetButton() {
            buttonText.style.display = 'inline-block';
            buttonLoader.style.display = 'none';
            submitButton.disabled = false;
        }
    });
    
    // Fonction pour afficher les erreurs
    function showError(input, message) {
        input.style.borderColor = '#ff4444';
        const originalPlaceholder = input.placeholder;
        input.placeholder = message;
        input.value = '';
        
        setTimeout(() => {
            input.style.borderColor = 'var(--border-subtle)';
            input.placeholder = originalPlaceholder;
        }, 3000);
    }
    
    // Fonction pour mettre à jour le message de succès avec le code fondateur
    function updateSuccessMessage(founderCode) {
        const successMessageElement = document.getElementById('success-message');
        successMessageElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>Parfait ! Tu fais maintenant partie de l'aventure Dodje !</p>
            <div class="founder-code-display">
                <h4>Ton code fondateur :</h4>
                <div class="code-value">${founderCode}</div>
                <p class="code-info">Partage ce code avec tes amis pour qu'ils rejoignent l'aventure !</p>
            </div>
            <div class="redirect-info">
                <p><i class="fas fa-arrow-right"></i> Redirection vers ton dashboard...</p>
            </div>
        `;
    }
    
    // ==================== EXISTING FUNCTIONALITY ====================
    // Gestion de la vidéo d'arrière-plan
    const backgroundVideo = document.getElementById('background-video');
    if (backgroundVideo) {
        // S'assurer que la vidéo démarre bien
        backgroundVideo.play().catch(e => {
            console.log('Autoplay bloqué:', e);
        });
        
        // Redémarrer la vidéo quand elle se termine (double sécurité pour la boucle)
        backgroundVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }

    // Gestion de la vidéo feature (Bourse monstre)
    const featureVideo = document.querySelector('.feature-video');
    if (featureVideo) {
        // S'assurer que la vidéo démarre bien
        featureVideo.play().catch(e => {
            console.log('Autoplay bloqué pour la vidéo feature:', e);
        });
        
        // Redémarrer la vidéo quand elle se termine (double sécurité pour la boucle)
        featureVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });

    // Phone mockup tilt effect
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        phoneMockup.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            requestAnimationFrame(() => {
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
        });
        
        phoneMockup.addEventListener('mouseleave', function() {
            requestAnimationFrame(() => {
                this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form interactions
    const formInputs = document.querySelectorAll('input[type="email"], input[type="text"]');
    const allCtaButtons = document.querySelectorAll('.cta-button');

    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.borderColor = 'var(--secondary-green)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
            this.style.borderColor = 'var(--border-subtle)';
        });
    });

    // CTA button hover effects (pour les boutons qui ne sont pas "C'est parti")
    allCtaButtons.forEach(button => {
        if (!button.textContent.includes('C\'est parti')) {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        }
    });

    // Simple countdown timer
    function updateCountdown() {
        const countdownElements = {
            days: document.querySelector('#days'),
            hours: document.querySelector('#hours'),
            minutes: document.querySelector('#minutes'),
            seconds: document.querySelector('#seconds')
        };

        // Set launch date to September 8, 2025 at 4 PM
        const launchDate = new Date('2025-09-08T16:00:00');

        const now = new Date().getTime();
        const distance = launchDate.getTime() - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (countdownElements.days) countdownElements.days.textContent = days.toString().padStart(2, '0');
            if (countdownElements.hours) countdownElements.hours.textContent = hours.toString().padStart(2, '0');
            if (countdownElements.minutes) countdownElements.minutes.textContent = minutes.toString().padStart(2, '0');
            if (countdownElements.seconds) countdownElements.seconds.textContent = seconds.toString().padStart(2, '0');
        }
    }

    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.pillar-card, .feature-card, .benefit, .time-unit');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });

    // Custom video player for About section
    const aboutVideo = document.querySelector('.about-video');
    const customPlayer = document.querySelector('.custom-video-player');
    const playButton = document.querySelector('.custom-play-button');
    const playButtonOverlay = document.querySelector('.play-button-overlay');
    const currentTimeDisplay = document.querySelector('.current-time');
    const totalTimeDisplay = document.querySelector('.total-time');
    const videoTimeDisplay = document.querySelector('.video-time-display');
    
    if (aboutVideo && customPlayer && playButton) {
        // Format time in mm:ss
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Update time display
        function updateTimeDisplay() {
            if (currentTimeDisplay && totalTimeDisplay) {
                currentTimeDisplay.textContent = formatTime(aboutVideo.currentTime);
                totalTimeDisplay.textContent = formatTime(aboutVideo.duration);
            }
        }
        
        // Play button click handler
        playButton.addEventListener('click', function() {
            if (aboutVideo.paused) {
                aboutVideo.play();
                customPlayer.classList.add('playing');
                playButtonOverlay.style.opacity = '0';
                playButtonOverlay.style.pointerEvents = 'none';
                videoTimeDisplay.style.opacity = '1';
            }
        });
        
        // Video click handler (pause/resume)
        aboutVideo.addEventListener('click', function() {
            if (!aboutVideo.paused) {
                aboutVideo.pause();
                customPlayer.classList.remove('playing');
                playButtonOverlay.style.opacity = '1';
                playButtonOverlay.style.pointerEvents = 'auto';
                videoTimeDisplay.style.opacity = '0';
            } else {
                aboutVideo.play();
                customPlayer.classList.add('playing');
                playButtonOverlay.style.opacity = '0';
                playButtonOverlay.style.pointerEvents = 'none';
                videoTimeDisplay.style.opacity = '1';
            }
        });
        
        // Update time display during playback
        aboutVideo.addEventListener('timeupdate', updateTimeDisplay);
        
        // Set total time when metadata loads
        aboutVideo.addEventListener('loadedmetadata', function() {
            console.log('About video loaded successfully');
            updateTimeDisplay();
        });
        
        // Handle video end
        aboutVideo.addEventListener('ended', function() {
            customPlayer.classList.remove('playing');
            playButtonOverlay.style.opacity = '1';
            playButtonOverlay.style.pointerEvents = 'auto';
            videoTimeDisplay.style.opacity = '0';
            aboutVideo.currentTime = 0;
            updateTimeDisplay();
        });
        
        // Error handling
        aboutVideo.addEventListener('error', function() {
            console.error('Error loading about video');
        });
    }

    // Learning path step interactions
    const stepCircles = document.querySelectorAll('.step-circle');
    stepCircles.forEach(circle => {
        circle.addEventListener('mouseenter', function() {
            if (this.classList.contains('completed') || this.classList.contains('current')) {
                this.style.transform = 'scale(1.1)';
            }
        });
        
        circle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Card hover effects
    const cards = document.querySelectorAll('.pillar-card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Simple email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Performance optimization: debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debouncing to scroll events
    const debouncedScrollHandler = debounce(function() {
        // Additional scroll effects can be added here
    }, 16); // ~60fps

    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

    console.log('🌱 Dodje Landing Page with Firebase loaded successfully');
}); 