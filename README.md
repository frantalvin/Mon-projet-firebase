r# PatientWise - Système de Gestion de Patients

Ce projet est une application web construite avec Next.js, TypeScript, et Firebase, conçue pour la gestion de patients en milieu médical.

## Comment Déployer sur GitHub Pages

Votre projet est pré-configuré pour un déploiement automatisé sur GitHub Pages. Voici les étapes pour mettre votre application en ligne.

### Prérequis

- Un compte GitHub.
- [Git](https://git-scm.com/downloads) installé sur votre machine.
- Le [GitHub CLI (gh)](https://cli.github.com/) installé et authentifié. Si ce n'est pas fait, exécutez :
  ```bash
  gh auth login
  ```

### Étapes de Déploiement

1.  **Initialiser le dépôt Git local**
    Si votre projet n'est pas encore un dépôt Git, ouvrez un terminal à la racine de votre projet et exécutez :
    ```bash
    git init
    git branch -M main
    ```

2.  **Créer un dépôt sur GitHub**
    Vous pouvez le faire directement depuis votre terminal avec le GitHub CLI :
    ```bash
    gh repo create NOM_DE_VOTRE_DEPOT --public --source=. --remote=origin
    ```
    Remplacez `NOM_DE_VOTRE_DEPOT` par le nom que vous souhaitez (par exemple, `patientwise-app`).

3.  **Ajouter, "Commiter" et "Pousser" votre code**
    C'est l'étape du "dépôt" à proprement parler. Elle envoie votre code sur GitHub.
    ```bash
    git add .
    git commit -m "Premier commit du projet PatientWise"
    git push -u origin main
    ```

4.  **Vérifier le déploiement**
    *   Après avoir "poussé" votre code, rendez-vous sur votre dépôt GitHub.
    *   Allez dans l'onglet **"Actions"**. Vous verrez un workflow (processus automatisé) nommé "Deploy Next.js site to Pages" en cours d'exécution.
    *   Patientez quelques minutes jusqu'à ce que le workflow se termine avec une icône verte.
    *   Une fois terminé, allez dans l'onglet **"Settings"**, puis dans la section **"Pages"**. Vous y trouverez l'URL de votre site déployé (ex: `https://VOTRE_NOM_UTILISATEUR.github.io/NOM_DE_VOTRE_DEPOT/`).

Votre application est maintenant en ligne ! Chaque fois que vous ferez un `git push` sur la branche `main`, le site se mettra à jour automatiquement.
