import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Simple ressources embarquées pour commencer. On pourra les
// extraire dans des fichiers JSON dédiés plus tard si besoin.
const resources = {
  fr: {
    translation: {
      header: {
        brand: "Calisthenics AI",
        menu_open: "Ouvrir le menu",
        home: "Accueil",
        dashboard: "Tableau de bord",
        analyze: "Analyser une figure",
        blog: "Blog",
        logout: "Déconnexion",
        login: "Connexion",
        register: "Créer un compte",
      },
      metrics: {
        global: "Score global",
        body_line: "Alignement corporel",
        symmetry: "Symétrie",
        lockout_extension: "Extension des membres",
      },
      common: {
        loading: "Chargement...",
        analyze_cta: "Analyser ma figure",
        create_account: "Créer un compte",
        new_analysis: "Nouvelle analyse",
      },
      landing: {
        hero_title:
          "Découvre exactement quoi corriger sur tes figures de calisthénie et progresse plus vite",
        hero_desc:
          "Importe une photo, obtiens un score technique clair et 3 corrections immédiatement applicables.",
        figures_section_title: "Figures détectables par notre algorithme",
        figures_section_subtitle:
          "Nous commençons avec les figures les plus emblématiques de la calisthénie. D’autres seront ajoutées au fur et à mesure.",
        figures_lsit: "L-Sit",
        figures_handstand: "Handstand",
        figures_planche: "Full Planche",
        figures_front_lever: "Front Lever",
        figures_back_lever: "Back Lever",
        figures_elbow_lever: "Elbow Lever",
        figures_human_flag: "Human Flag",
        feature_diagnostic_title: "Diagnostic immédiat",
        feature_diagnostic_desc:
          "Importe ta photo et obtiens instantanément une analyse claire de ta figure, comme avec un coach personnel.",
        feature_understand_title: "Comprends exactement ce qui te bloque",
        feature_understand_desc:
          "Un score global et des métriques détaillées pour voir en un coup d’œil ce qui freine ta posture.",
        feature_progress_title: "Mesure ta progression dans le temps",
        feature_progress_desc:
          "Compare tes analyses, vois ce qui s’améliore réellement et valide objectivement tes progrès sur chaque figure.",
        demo_detected_figure: "Figure détectée ",
        demo_improvements_title: "Points d'amélioration",
        demo_improvement_1:
          "Remonte légèrement le bassin — gagne quelques centimètres pour obtenir une horizontale vraiment parfaite.",
        demo_improvement_2:
          "Verrouille davantage le bras du haut — tends complètement le coude pour renforcer la ligne et rendre la position plus propre.",
        demo_improvement_3:
          "Serre davantage les jambes — garde-les complètement collées pour créer une ligne plus nette et plus élégante.",
      },
      home: {
        welcome_title: "Bienvenue",
        welcome_desc:
          "Vous êtes connecté. Accédez à votre tableau de bord ou lancez une analyse.",
        dashboard_btn: "Tableau de bord",
      },
      dashboard: {
        greeting: "Bonjour {{name}}",
        greeting_no_name: "Bonjour",
        level_title: "Votre niveau",
        level_empty: "Effectuez une analyse pour voir votre niveau global.",
        average_score: "Score moyen : {{score}}/100",
        history_title: "Dernières analyses",
        history_empty:
          "Aucune analyse pour le moment. Lancez une analyse pour enregistrer votre progression.",
        history_show_all: "Tout voir",
        history_show_less: "Voir moins",
        history_view: "Voir",
        history_detail_title: "Détail de l'analyse",
        history_back_to_dashboard: "Retour au tableau de bord",
        progression_title: "Progression par figure",
        progression_empty:
          "Aucune analyse pour le moment. Lancez une analyse pour voir votre progression par figure.",
        progression_one_analysis: "1 analyse : {{score}}/100",
        progression_need_two:
          "Au moins deux analyses pour voir la tendance.",
        delete_account_button: "Supprimer mon compte et mes données",
        delete_account_confirm: "Êtes-vous sûr de vouloir supprimer votre compte et toutes vos données ? Cette action est irréversible.",
        delete_account_error: "Impossible de supprimer le compte pour le moment.",
      },
      analyze: {
        step_import: "Importer l'image",
        step_confirm: "Confirmer la figure détectée",
        step_score: "Voir le score",
        step_save: "Sauvegarder l'analyse",
        aria_steps: "Étapes de l'analyse",
        reset: "Réinitialiser",
        upload_title: "Cliquez pour uploader votre image",
        upload_hint:
          "Choisissez une photo prise parfaitement de profil, avec le corps entier visible.",
        error_prefix: "Erreur: {{message}}",
      },
      score: {
        excellent: "Excellent",
        very_good: "Très bien",
        good: "Bien",
        fair: "Correct",
        fragile: "Fragile",
        to_improve: "À retravailler",
      },
      auth: {
        login_title: "Connexion",
        login_subtitle:
          "Connectez-vous pour accéder à votre tableau de bord et votre historique.",
        login_submit: "Se connecter",
        login_submitting: "Connexion...",
        login_error_default: "Connexion impossible.",
        register_title: "Inscription",
        register_subtitle:
          "Créez un compte pour enregistrer vos analyses et suivre votre progression.",
        register_submit: "Créer mon compte",
        register_submitting: "Création...",
        register_error_default: "Inscription impossible.",
        email_label: "E-mail",
        password_label: "Mot de passe",
        name_label: "Nom ou pseudo",
        password_placeholder:
          "8+ caractères, majuscule, minuscule, chiffre",
        have_account: "Déjà un compte ?",
        no_account: "Pas encore de compte ?",
        show_password: "Afficher le mot de passe",
        hide_password: "Masquer le mot de passe",
      },
      poseResult: {
        flow_error: "Flow erreur: {{message}}",
        detected_figure: "Figure détectée : {{pose}}",
        modifier_option: "Modifier",
        confirm_button: "Confirmer",
        confirming: "Confirmation...",
        confirm_error: "Confirm erreur: {{message}}",
        analysis_result_title: "Résultat d'analyse",
        improvements_title: "Points d'amélioration",
        saved_to_dashboard: "Analyse enregistrée dans votre tableau de bord.",
        save_button: "Sauvegarder l'analyse",
        saving: "Enregistrement...",
        save_and_create_button: "Créer un compte et sauvegarder mon analyse",
      },
    },
  },
  en: {
    translation: {
      header: {
        brand: "Calisthenics AI",
        menu_open: "Open menu",
        home: "Home",
        dashboard: "Dashboard",
        analyze: "Analyze a move",
        blog: "Blog",
        logout: "Log out",
        login: "Log in",
        register: "Sign up",
      },
      metrics: {
        global: "Global score",
        body_line: "Body line",
        symmetry: "Symmetry",
        lockout_extension: "Lockout & extension",
      },
      common: {
        loading: "Loading...",
        analyze_cta: "Analyze my move",
        create_account: "Create an account",
        new_analysis: "New analysis",
      },
      landing: {
        hero_title:
          "See exactly what to fix on your calisthenics skills and progress faster",
        hero_desc:
          "Upload a picture, get a clear technical score and 3 immediately actionable corrections.",
        figures_section_title: "Figures detectable by our algorithm",
        figures_section_subtitle:
          "We start with the most iconic calisthenics skills, and will add more over time.",
        figures_lsit: "L-Sit",
        figures_handstand: "Handstand",
        figures_planche: "Full Planche",
        figures_front_lever: "Front Lever",
        figures_back_lever: "Back Lever",
        figures_elbow_lever: "Elbow Lever",
        figures_human_flag: "Human Flag",
        feature_diagnostic_title: "Instant diagnostic",
        feature_diagnostic_desc:
          "Upload your picture and instantly get a clear analysis, like having a personal coach.",
        feature_understand_title: "Understand exactly what holds you back",
        feature_understand_desc:
          "A global score and detailed metrics to see at a glance what limits your posture.",
        feature_progress_title: "Measure your progress over time",
        feature_progress_desc:
          "Compare your analyses, see what truly improves and validate your progress on each skill.",
        demo_detected_figure: "Detected figure",
        demo_improvements_title: "Improvement points",
        demo_improvement_1:
          "Slightly lift your hips — gain a few centimeters to reach a truly horizontal line.",
        demo_improvement_2:
          "Lock the top arm harder — fully extend the elbow to strengthen the line and make the position cleaner.",
        demo_improvement_3:
          "Squeeze your legs together — keep them fully glued to create a cleaner, more elegant line.",
      },
      home: {
        welcome_title: "Welcome",
        welcome_desc:
          "You are logged in. Go to your dashboard or start an analysis.",
        dashboard_btn: "Dashboard",
      },
      dashboard: {
        greeting: "Hi {{name}}",
        greeting_no_name: "Hi",
        level_title: "Your level",
        level_empty: "Run an analysis to see your global level.",
        average_score: "Average score: {{score}}/100",
        history_title: "Latest analyses",
        history_empty:
          "No analysis yet. Run one to start tracking your progress.",
        history_show_all: "Show all",
        history_show_less: "Show less",
        history_view: "View",
        history_detail_title: "Analysis detail",
        history_back_to_dashboard: "Back to dashboard",
        progression_title: "Progress by figure",
        progression_empty:
          "No analysis yet. Run one to see your progress by figure.",
        progression_one_analysis: "1 analysis: {{score}}/100",
        progression_need_two:
          "At least two analyses are required to show a trend.",
        delete_account_button: "Delete my account and data",
        delete_account_confirm: "Are you sure you want to delete your account and all associated data? This action cannot be undone.",
        delete_account_error: "Could not delete the account at the moment.",
      },
      analyze: {
        step_import: "Upload the picture",
        step_confirm: "Confirm the detected figure",
        step_score: "See the score",
        step_save: "Save the analysis",
        aria_steps: "Analysis steps",
        reset: "Reset",
        upload_title: "Click to upload your picture",
        upload_hint:
          "Choose a perfectly profile view photo where your whole body is visible.",
        error_prefix: "Error: {{message}}",
      },
      score: {
        excellent: "Excellent",
        very_good: "Very good",
        good: "Good",
        fair: "Fair",
        fragile: "Fragile",
        to_improve: "Needs work",
      },
      auth: {
        login_title: "Log in",
        login_subtitle:
          "Log in to access your dashboard and history.",
        login_submit: "Log in",
        login_submitting: "Logging in...",
        login_error_default: "Unable to log in.",
        register_title: "Sign up",
        register_subtitle:
          "Create an account to save your analyses and track your progress.",
        register_submit: "Create my account",
        register_submitting: "Creating...",
        register_error_default: "Unable to sign up.",
        email_label: "Email",
        password_label: "Password",
        name_label: "Name or pseudo",
        password_placeholder:
          "8+ characters, uppercase, lowercase, number",
        have_account: "Already have an account?",
        no_account: "No account yet?",
        show_password: "Show password",
        hide_password: "Hide password",
      },
      poseResult: {
        flow_error: "Flow error: {{message}}",
        detected_figure: "Detected figure: {{pose}}",
        modifier_option: "Edit",
        confirm_button: "Confirm",
        confirming: "Confirming...",
        confirm_error: "Confirm error: {{message}}",
        analysis_result_title: "Analysis result",
        improvements_title: "Improvement points",
        saved_to_dashboard: "Analysis saved to your dashboard.",
        save_button: "Save analysis",
        saving: "Saving...",
        save_and_create_button: "Create an account and save my analysis",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Par défaut on bascule en anglais si aucune langue supportée n'est trouvée.
    fallbackLng: "en",
    supportedLngs: ["fr", "en"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Détection simple : préférence stockée, puis navigateur, puis tag <html>.
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

