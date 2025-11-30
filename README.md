# 🎯 Polymarket Hub

Application complète pour analyser, comparer et suivre les marchés de prédiction Polymarket.

## ✨ Fonctionnalités

### 1️⃣ Comparateur de Marchés
- **Meilleurs Marchés** : Classés par volume et liquidité
- **Trending** : Marchés en hausse et populaires
- **Filtrage par Catégories** : Politics, Sports, Crypto, Pop Culture, Science, Business
- **Recherche Avancée** : Trouvez rapidement n'importe quel marché

### 2️⃣ Analyse & Insights
- **Graphiques Interactifs** : Visualisation des prix et volumes sur 7 jours
- **Métriques Détaillées** : Prix, volume, liquidité, volatilité
- **Insights IA** : Analyses automatiques des tendances et niveaux de confiance
- **Historique Complet** : Évolution des probabilités dans le temps

### 3️⃣ Alertes & Notifications
- **Détection Automatique** : Mouvements de prix >10% en temps réel
- **Alertes Volume** : Surges de volume inhabituels
- **Nouveaux Trending** : Notification des marchés émergents
- **Auto-Refresh** : Mise à jour toutes les 30 secondes
- **Filtres Intelligents** : Par sévérité et type d'alerte

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build Production

```bash
# Créer le build optimisé
npm run build

# Lancer en production
npm start
```

## 📁 Structure du Projet

```
polymarket-hub/
├── app/                      # Pages Next.js (App Router)
│   ├── comparator/          # Page comparateur de marchés
│   ├── analysis/            # Pages d'analyse et insights
│   │   └── [id]/           # Page détaillée d'un marché
│   ├── alerts/             # Page alertes et notifications
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Page d'accueil (redirect)
├── components/              # Composants React réutilisables
│   ├── Navigation.tsx      # Barre de navigation
│   ├── MarketCard.tsx      # Carte d'affichage marché
│   ├── AlertCard.tsx       # Carte d'alerte
│   └── PriceChart.tsx      # Graphiques de prix
├── lib/                     # Logique métier et utilitaires
│   ├── polymarket-api.ts   # Client API Polymarket
│   └── alerts.ts           # Système de détection d'alertes
├── types/                   # Types TypeScript
│   └── market.ts           # Types pour les marchés
└── public/                  # Assets statiques
```

## 🛠️ Technologies Utilisées

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Charts** : Recharts
- **State Management** : React Hooks + Zustand (ready)
- **Data Fetching** : Axios + React Query (ready)
- **Icons** : Lucide React
- **Date Handling** : date-fns

## 🔌 API Polymarket

L'application utilise les APIs publiques de Polymarket :
- **Gamma API** : `https://gamma-api.polymarket.com`
- **CLOB API** : `https://clob.polymarket.com`

Aucune clé API n'est nécessaire pour les endpoints publics.

## 📊 Fonctionnalités Détaillées

### Comparateur
- Affichage des 50 meilleurs marchés ou trending
- Tri automatique par volume/liquidité pour "Meilleurs"
- Tri par volatilité et volume pour "Trending"
- Filtrage en temps réel par recherche textuelle
- Catégorisation multi-critères

### Analyse
- Graphiques de prix en temps réel (7 jours)
- Graphiques de volume
- Calcul de volatilité personnalisé
- Insights IA basés sur :
  - Variation de prix 24h
  - Volume de trading
  - Niveau de probabilité
- Métriques clés : spread, liquidité, volume

### Alertes
- **Alertes de Prix** : Hausse/baisse >10%
- **Alertes de Volume** : Surge >100%
- **Alertes Trending** : Nouveaux marchés populaires
- **Niveaux de Sévérité** :
  - 🔴 High : >20% prix ou >300% volume
  - 🟠 Medium : >15% prix ou >200% volume
  - 🟡 Low : >10% prix ou >100% volume
- Auto-refresh optionnel (30s)
- Filtrage par type et sévérité

## 🎨 Design

- **Dark Mode** : Support automatique du thème sombre
- **Responsive** : Optimisé mobile, tablette et desktop
- **Accessible** : Navigation au clavier et lecteurs d'écran
- **Performance** : Optimisations Next.js (lazy loading, code splitting)

## 🔄 Améliorations Futures

- [ ] Watchlist personnalisée avec localStorage
- [ ] Notifications push via Web Push API
- [ ] Graphiques avancés (candlestick, indicators)
- [ ] Export des données (CSV, JSON)
- [ ] Comparaison multi-marchés
- [ ] Intégration wallet pour trading direct
- [ ] Historique >7 jours
- [ ] Prédictions ML personnalisées

## 📝 Licence

MIT

## 👤 Auteur

Créé avec ❤️ pour la communauté Polymarket

---

**Note** : Cette application est un outil d'analyse indépendant et n'est pas affiliée à Polymarket.
