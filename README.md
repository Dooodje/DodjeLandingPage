# 🌳 Dodje Landing Page

Une landing page moderne et interactive pour l'application Dodje - l'éducation financière révolutionnaire.

## 🚀 Aperçu

Cette landing page présente Dodje, l'application qui révolutionne l'éducation financière en la rendant accessible, ludique et engageante. Conçue pour captiver les utilisateurs et les inciter à rejoindre la révolution Dodje.

## ✨ Fonctionnalités

- **Design moderne et responsive** : Optimisé pour tous les appareils
- **Animations fluides** : Expérience utilisateur immersive
- **Compte à rebours en temps réel** : Crée l'anticipation pour le lancement
- **Formulaire d'inscription** : Collecte les emails pour la bêta
- **Navigation smooth** : Défilement fluide entre les sections
- **Mockup d'application** : Aperçu visuel de l'app mobile
- **Easter egg** : Surprise cachée pour les utilisateurs curieux

## 📁 Structure du projet

```
DodjeLandingPage/
├── index.html          # Page principale
├── styles.css          # Styles et animations
├── script.js           # Interactions et fonctionnalités
└── README.md          # Documentation
```

## 🎯 Sections de la landing page

1. **Hero Section** : Titre accrocheur avec CTA principal
2. **À propos** : Placeholder pour vidéo de présentation
3. **3 Piliers** : Les valeurs fondamentales de Dodje
4. **Features** : Aperçu des fonctionnalités de l'app
5. **Communauté** : Formulaire d'inscription et avantages
6. **Compte à rebours** : Timer jusqu'au lancement
7. **Footer** : Liens sociaux et informations légales

## 🎨 Design et couleurs

- **Palette principale** : Verts naturels (#2d5a27, #4CAF50)
- **Accents** : Gradients colorés (oranges, bleus, turquoise)
- **Typographie** : Poppins pour une lisibilité optimale
- **Style** : Moderne, fun et accessible

## 🛠️ Utilisation

### Développement avec hot reload
1. **Installer les dépendances** : `npm install`
2. **Lancer le serveur de développement** : `npm run dev`
3. **Ouvrir** : http://localhost:5173 (s'ouvre automatiquement)
4. **Personnaliser** : Modifiez les fichiers - les changements se reflètent instantanément !

### Utilisation simple
1. **Ouvrir la page** : Double-cliquez sur `index.html`
2. **Personnaliser** : Modifiez les textes, couleurs et images selon vos besoins
3. **Déployer** : Uploadez les fichiers sur votre hébergeur web

## 📦 Commandes npm

- `npm run dev` : Lance le serveur de développement avec hot reload
- `npm run build` : Crée une version optimisée pour la production
- `npm run preview` : Prévisualise la version de production

## 🔧 Personnalisation

### Modifier la date de lancement
```javascript
// Dans script.js, ligne 13
const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + 14); // Changez le nombre de jours
```

### Ajouter votre vidéo
```html
<!-- Remplacez le placeholder dans index.html -->
<div class="video-container">
    <video controls>
        <source src="votre-video.mp4" type="video/mp4">
    </video>
</div>
```

### Connecter le formulaire
```javascript
// Modifiez handleFormSubmission dans script.js pour connecter à votre backend
```

## 🎮 Easter Egg

Tapez le code Konami (↑↑↓↓←→←→BA) pour une surprise ! 🎉

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ Responsive design (mobile, tablet, desktop)

## 🚀 Prochaines étapes

1. Ajouter la vraie vidéo de présentation
2. Connecter le formulaire à un backend
3. Ajouter des vraies captures d'écran de l'app
4. Intégrer des analytics (Google Analytics, etc.)
5. Optimiser pour le SEO

## 🎯 Optimisations SEO à considérer

- Ajouter des balises meta (description, keywords)
- Optimiser les images avec des alt texts
- Ajouter un sitemap.xml
- Implémenter les données structurées
- Optimiser la vitesse de chargement

---

**Made with ❤️ for the Dodje revolution** 