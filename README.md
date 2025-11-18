# Piol Web - Version Locataire

Application web pour les locataires de Piol, développée avec React + TypeScript + Vite.

## 🚀 Fonctionnalités

- ✅ **Accueil** : Découvrir les propriétés en vedette
- ✅ **Recherche** : Rechercher des propriétés avec filtres avancés
- ✅ **Favoris** : Sauvegarder vos propriétés favorites
- ✅ **Messages** : Communiquer avec les agents
- ✅ **Profil** : Gérer votre profil et vos préférences
- ✅ **Réservations** : Gérer vos réservations (pour hôtels)

## 📦 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 🧪 Preview

```bash
npm run preview
```

## 📁 Structure du projet

```
src/
├── api/           # Service API
├── components/    # Composants réutilisables
├── contexts/      # Contextes React (Auth, Toast, etc.)
├── pages/         # Pages de l'application
├── hooks/         # Hooks personnalisés
├── utils/         # Utilitaires
└── types/         # Types TypeScript
```

## 🔗 API

L'application se connecte à l'API backend Piol :
- **Développement** : `http://192.168.1.140:3001/api`
- **Production** : `https://piol.onrender.com/api`

## 🎨 Design

- **Couleur principale** : `#F10505` (Rouge Piol)
- **Police** : Poppins
- **Framework CSS** : Tailwind CSS
