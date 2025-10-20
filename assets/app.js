/**
 * Application JavaScript pour les exercices Florence
 * Gère uniquement l'interface utilisateur, pas le code des exercices
 */

// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

/**
 * Initialise l'application
 */
function initializeApp() {
  setupSolutionToggles();
  setupSmoothScrolling();
  setupKeyboardNavigation();
  addProgressTracking();
  setupThemeToggle();
}

/**
 * Configure les boutons d'affichage/masquage des solutions
 */
function setupSolutionToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-solution");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const solution = document.getElementById(targetId);
      const isVisible = solution.classList.contains("show");

      if (isVisible) {
        hideSolution(solution, this);
      } else {
        showSolution(solution, this);
      }
    });
  });
}

/**
 * Affiche une solution
 */
function showSolution(solution, button) {
  solution.classList.add("show");
  button.textContent = "Masquer la correction";
  button.classList.add("active");

  // Animation d'entrée
  setTimeout(() => {
    solution.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, 200);

  // Suivi des progrès
  trackProgress(solution.id, "viewed");
}

/**
 * Masque une solution
 */
function hideSolution(solution, button) {
  solution.classList.remove("show");
  button.textContent = "Voir la correction";
  button.classList.remove("active");
}

/**
 * Configure la navigation fluide
 */
function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Mettre à jour l'URL sans déclencher de scroll
        history.pushState(null, null, `#${targetId}`);

        // Marquer le lien comme actif
        setActiveNavLink(this);
      }
    });
  });
}

/**
 * Marque le lien de navigation actif
 */
function setActiveNavLink(activeLink) {
  const navLinks = document.querySelectorAll("nav a");
  navLinks.forEach((link) => link.classList.remove("active"));
  activeLink.classList.add("active");
}

/**
 * Configure la navigation au clavier
 */
function setupKeyboardNavigation() {
  document.addEventListener("keydown", function (e) {
    // Échap pour fermer toutes les solutions
    if (e.key === "Escape") {
      closeAllSolutions();
    }

    // Ctrl/Cmd + H pour masquer/afficher toutes les solutions
    if ((e.ctrlKey || e.metaKey) && e.key === "h") {
      e.preventDefault();
      toggleAllSolutions();
    }
  });
}

/**
 * Ferme toutes les solutions ouvertes
 */
function closeAllSolutions() {
  const openSolutions = document.querySelectorAll(".solution.show");
  const activeButtons = document.querySelectorAll(".toggle-solution.active");

  openSolutions.forEach((solution) => {
    solution.classList.remove("show");
  });

  activeButtons.forEach((button) => {
    button.textContent = "Voir la correction";
    button.classList.remove("active");
  });
}

/**
 * Bascule l'état de toutes les solutions
 */
function toggleAllSolutions() {
  const allSolutions = document.querySelectorAll(".solution");
  const openSolutions = document.querySelectorAll(".solution.show");
  const shouldOpen = openSolutions.length === 0;

  if (shouldOpen) {
    // Ouvrir toutes les solutions
    allSolutions.forEach((solution) => {
      const button = document.querySelector(`[data-target="${solution.id}"]`);
      if (button) {
        showSolution(solution, button);
      }
    });
  } else {
    // Fermer toutes les solutions
    closeAllSolutions();
  }
}

/**
 * Système de suivi des progrès
 */
function addProgressTracking() {
  const exercises = document.querySelectorAll(".exercise");
  let completedExercises =
    JSON.parse(localStorage.getItem("florenceJS_progress")) || [];

  // Marquer les exercices déjà vus
  completedExercises.forEach((exerciseId) => {
    const exercise = document.getElementById(exerciseId);
    if (exercise) {
      markExerciseAsViewed(exercise);
    }
  });

  // Afficher le compteur de progrès
  updateProgressCounter();
}

/**
 * Suit le progrès d'un exercice
 */
function trackProgress(solutionId, action) {
  let progress = JSON.parse(localStorage.getItem("florenceJS_progress")) || [];

  if (action === "viewed" && !progress.includes(solutionId)) {
    progress.push(solutionId);
    localStorage.setItem("florenceJS_progress", JSON.stringify(progress));

    // Marquer visuellement l'exercice
    const solution = document.getElementById(solutionId);
    const exercise = solution.closest(".exercise");
    markExerciseAsViewed(exercise);

    updateProgressCounter();
  }
}

/**
 * Marque un exercice comme vu
 */
function markExerciseAsViewed(exercise) {
  if (!exercise.classList.contains("viewed")) {
    exercise.classList.add("viewed");

    // Ajouter un indicateur visuel
    const indicator = document.createElement("span");
    indicator.className = "progress-indicator";
    indicator.innerHTML = "✅";
    indicator.title = "Exercice consulté";

    const title = exercise.querySelector("h3");
    if (title && !title.querySelector(".progress-indicator")) {
      title.appendChild(indicator);
    }
  }
}

/**
 * Met à jour le compteur de progrès
 */
function updateProgressCounter() {
  const totalExercises = document.querySelectorAll(".exercise").length;
  const viewedExercises = document.querySelectorAll(".exercise.viewed").length;

  let progressBar = document.getElementById("progress-bar");
  if (!progressBar) {
    progressBar = createProgressBar();
  }

  const percentage = Math.round((viewedExercises / totalExercises) * 100);
  updateProgressBar(progressBar, percentage, viewedExercises, totalExercises);
}

/**
 * Crée la barre de progrès
 */
function createProgressBar() {
  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";
  progressContainer.innerHTML = `
        <div class="progress-info">
            <span id="progress-text">Progrès: 0/0 exercices consultés</span>
            <button id="reset-progress" class="reset-btn">Reset</button>
        </div>
        <div class="progress-bar-bg">
            <div id="progress-bar" class="progress-bar"></div>
        </div>
    `;

  // Insérer après le header
  const header = document.querySelector("header");
  header.parentNode.insertBefore(progressContainer, header.nextSibling);

  // Ajouter l'événement de reset
  document
    .getElementById("reset-progress")
    .addEventListener("click", resetProgress);

  return document.getElementById("progress-bar");
}

/**
 * Met à jour la barre de progrès
 */
function updateProgressBar(progressBar, percentage, viewed, total) {
  progressBar.style.width = percentage + "%";
  document.getElementById(
    "progress-text"
  ).textContent = `Progrès: ${viewed}/${total} exercices consultés (${percentage}%)`;

  // Changer la couleur selon le progrès
  if (percentage === 100) {
    progressBar.style.background = "linear-gradient(90deg, #00d4aa, #00d4aa)";
  } else if (percentage >= 75) {
    progressBar.style.background = "linear-gradient(90deg, #667eea, #764ba2)";
  } else if (percentage >= 50) {
    progressBar.style.background = "linear-gradient(90deg, #f093fb, #f5576c)";
  } else {
    progressBar.style.background = "linear-gradient(90deg, #ffeaa7, #fab1a0)";
  }
}

/**
 * Reset le progrès
 */
function resetProgress() {
  if (confirm("Êtes-vous sûr de vouloir réinitialiser votre progrès ?")) {
    localStorage.removeItem("florenceJS_progress");

    // Supprimer les indicateurs visuels
    const indicators = document.querySelectorAll(".progress-indicator");
    indicators.forEach((indicator) => indicator.remove());

    const viewedExercises = document.querySelectorAll(".exercise.viewed");
    viewedExercises.forEach((exercise) => exercise.classList.remove("viewed"));

    updateProgressCounter();
  }
}

/**
 * Bascule le thème sombre/clair
 */
function setupThemeToggle() {
  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = "🌙";
  themeToggle.title = "Basculer le thème";

  document.body.appendChild(themeToggle);

  // Charger le thème sauvegardé
  const savedTheme = localStorage.getItem("florenceJS_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.innerHTML = "☀️";
  }

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");

    this.innerHTML = isDark ? "☀️" : "🌙";
    localStorage.setItem("florenceJS_theme", isDark ? "dark" : "light");
  });
}

/**
 * Gestion du redimensionnement de la fenêtre
 */
window.addEventListener(
  "resize",
  debounce(() => {
    // Réajuster les éléments si nécessaire
    updateProgressCounter();
  }, 250)
);

/**
 * Fonction de debounce pour optimiser les performances
 */
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

/**
 * Gestion des erreurs globales
 */
window.addEventListener("error", function (e) {
  console.error("Erreur dans l'application:", e.error);
});

// Export des fonctions principales pour les tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showSolution,
    hideSolution,
    trackProgress,
    resetProgress,
  };
}
