We want to create a web app analyzing street workout figures by users uploading their pictures, after that analyzing it with MediaPipe and Python scripts and then return feedback and exercises to improve.

The stack's technology is as follows:

A MERN base (MongoDB, Express, ReactJS, Node.js)

MediaPipe: Integrated into the front-end for posture estimation directly in the browser.
React JS
MongoDB: Used as a NoSQL database to store user accounts, performance scores, and analysis history. MongoDB Atlas propose un niveau gratuit adapté au développement.
Amazon S3 (or a service equivalent to Google Cloud Storage): For scalable and secure storage of images and videos uploaded by users.
Express.js: Will serve as the framework for building the backend API that handles client requests.
JavaScript or Python scripts (executed on the backend) to:
- Analyze the key points detected by MediaPipe.
- Calculate custom posture quality indicators.
- Generate detailed feedback for the user.

## Comptes utilisateurs

L’app permet de créer un compte (e-mail + mot de passe) et de se connecter. Le JWT est stocké dans un cookie HttpOnly (défini par l’API). Après connexion, le tableau de bord affiche le niveau global, les dernières analyses et une vue de la progression. Les analyses effectuées en étant connecté sont enregistrées dans l’historique utilisateur (MongoDB).

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
