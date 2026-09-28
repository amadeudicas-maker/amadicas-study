/* =========================================================
   AMADICAS STUDY
   ========================================================= */

const STORAGE_KEY = "amadicas-study-v3";
const THEME_STORAGE_KEY = "amadicas-study-theme";
const SIDEBAR_STORAGE_KEY = "amadicas_sidebar_state";


/* =========================================================
   GRANDES ÁREAS
   ========================================================= */

const AREAS = {

  GO: {
    name: "Ginecologia e Obstetrícia",
    emoji: "🩺"
  },

  CM: {
    name: "Clínica Médica",
    emoji: "🫀"
  },

  PREV: {
    name: "Preventiva",
    emoji: "🌎"
  },

  PED: {
    name: "Pediatria",
    emoji: "🧸"
  },

  CIR: {
    name: "Cirurgia Geral",
    emoji: "🔪"
  }

};

const AREA_ORDER = [
  "GO",
  "CM",
  "PREV",
  "PED",
  "CIR"
];


/* =========================================================
   REVISÕES
   ========================================================= */

const STAGES = [
  "d1",
  "d7",
  "d30",
  "d60"
];

const STAGE_LABELS = {
  d1: "D1",
  d7: "D7",
  d30: "D30",
  d60: "D60"
};

const STAGE_INTERVALS = {
  d1: 1,
  d7: 7,
  d30: 30,
  d60: 60
};


/* =========================================================
   DATABASE
   ========================================================= */

let db = {

  subjects: [],
  errors: [],
  tests: []

};


/* =========================================================
   TEMA
   ========================================================= */

function loadTheme() {

  const savedTheme =
    localStorage.getItem(
      THEME_STORAGE_KEY
    );

  const shouldUseDark =
    savedTheme === "dark";

  document.documentElement.classList.toggle(
    "dark",
    shouldUseDark
  );

  updateThemeButtons();

}


function toggleTheme() {

  const isDark =
    document.documentElement.classList.contains(
      "dark"
    );

  const newTheme =
    isDark
      ? "light"
      : "dark";

  document.documentElement.classList.toggle(
    "dark",
    newTheme === "dark"
  );

  localStorage.setItem(
    THEME_STORAGE_KEY,
    newTheme
  );

  updateThemeButtons();

}


function updateThemeButtons() {

  const isDark =
    document.documentElement.classList.contains(
      "dark"
    );

  document
    .querySelectorAll(
      "[data-theme-toggle]"
    )
    .forEach(
      button => {

        const icon =
          button.querySelector(
            ".theme-toggle-icon"
          );

        const text =
          button.querySelector(
            ".theme-toggle-text"
          );

        if (icon) {

          icon.textContent =
            isDark
              ? "☀"
              : "☾";

        }

        if (text) {

          text.textContent =
            isDark
              ? "Modo claro"
              : "Modo escuro";

        }

        button.setAttribute(
          "aria-label",
          isDark
            ? "Ativar modo claro"
            : "Ativar modo escuro"
        );

        button.setAttribute(
          "title",
          isDark
            ? "Ativar modo claro"
            : "Ativar modo escuro"
        );

      }
    );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function setSidebarCollapsed(
  collapsed,
  save = true
) {

  const app =
    document.getElementById(
      "app"
    );

  const button =
    document.getElementById(
      "sidebarToggle"
    );

  if (!app) return;

  app.classList.toggle(
    "sidebar-collapsed",
    collapsed
  );

  if (button) {

    button.textContent = "☰";

    button.setAttribute(
      "aria-expanded",
      String(!collapsed)
    );

    button.setAttribute(
      "aria-label",
      collapsed
        ? "Abrir menu"
        : "Fechar menu"
    );

    button.setAttribute(
      "title",
      collapsed
        ? "Abrir menu"
        : "Fechar menu"
    );

  }

  if (save) {

    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      collapsed
        ? "collapsed"
        : "open"
    );

  }

}


function toggleSidebar() {

  const app =
    document.getElementById(
      "app"
    );

  if (!app) return;

  const collapsed =
    app.classList.contains(
      "sidebar-collapsed"
    );

  setSidebarCollapsed(
    !collapsed
  );

}


function loadSidebarState() {

  const saved =
    localStorage.getItem(
      SIDEBAR_STORAGE_KEY
    );

  /*
   * Se o usuário ainda não escolheu:
   * desktop/tablet começa aberto;
   * celular começa fechado.
   *
   * Depois da primeira escolha,
   * a preferência fica salva.
   */

  const collapsed =
    saved === "collapsed" ||
    (
      saved === null &&
      window.innerWidth <= 800
    );

  setSidebarCollapsed(
    collapsed,
    false
  );

}
document.addEventListener("click", function (event) {
  const app = document.getElementById("app");
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.getElementById("sidebarToggle");

  if (!app || !sidebar || !toggle) return;

  const isCollapsed =
    app.classList.contains("sidebar-collapsed");

  if (isCollapsed) return;

  // Clique no botão ☰
  if (toggle.contains(event.target)) return;

  // Clique dentro da sidebar
  if (sidebar.contains(event.target)) return;

  // Qualquer clique fora da sidebar
  setSidebarCollapsed(true);
});


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadTheme();

    loadSidebarState();

    document
      .querySelectorAll(
        "[data-theme-toggle]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            toggleTheme
          );

        }
      );

    loadDatabase();

    setupNavigation();

    renderPage("dashboard");

  }
);


/* =========================================================
   DATABASE
   ========================================================= */

function loadDatabase() {

  try {

    const current =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (current) {

      db =
        normalizeDatabase(
          JSON.parse(current)
        );

      saveDatabase();

      return;

    }

    const old =
      localStorage.getItem(
        "amadicas-study-v2"
      );

    if (old) {

      db =
        migrateOldDatabase(
          JSON.parse(old)
        );

      db =
        normalizeDatabase(db);

      saveDatabase();

      return;

    }

  } catch (error) {

    console.error(
      "Erro ao carregar banco:",
      error
    );

  }

  db = {

    subjects: [],
    errors: [],
    tests: []

  };

}


function saveDatabase() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(db)
  );

}


function normalizeDatabase(
  database
) {

  if (
    !database ||
    typeof database !== "object"
  ) {

    return {

      subjects: [],
      errors: [],
      tests: []

    };

  }

  database.subjects =
    Array.isArray(
      database.subjects
    )
      ? database.subjects
      : [];

  database.errors =
    Array.isArray(
      database.errors
    )
      ? database.errors
      : [];

  database.tests =
    Array.isArray(
      database.tests
    )
      ? database.tests
      : [];

  database.subjects =
    database.subjects.map(
      subject => {

        if (!subject.reviews) {

          subject.reviews = {};

        }

        /*
         * Migração de D90 → D60.
         * Se existir uma revisão antiga em d90
         * e ainda não houver d60, preserva os dados.
         */

        if (
          subject.reviews.d90 &&
          !subject.reviews.d60
        ) {

          subject.reviews.d60 =
            subject.reviews.d90;

        }

        STAGES.forEach(
          stage => {

            if (
              !subject.reviews[stage]
            ) {

              subject.reviews[stage] = {

                completed: false,
                date: null,
                plannedDate: null

              };

            } else {

              subject.reviews[stage]
                .completed =
                Boolean(
                  subject.reviews[stage]
                    .completed
                );

              subject.reviews[stage]
                .date =
                subject.reviews[stage]
                  .date || null;

              subject.reviews[stage]
                .plannedDate =
                subject.reviews[stage]
                  .plannedDate || null;

            }

          }
        );

        if (
          !Array.isArray(
            subject.history
          )
        ) {

          subject.history = [];

        }

        return subject;

      }
    );

  database.tests =
    database.tests.map(
      test => {

        const total =
          Number.isInteger(
            Number(test.total)
          )
            ? Number(test.total)
            : 0;

        const correct =
          Number.isInteger(
            Number(test.correct)
          )
            ? Number(test.correct)
            : 0;

        const annulled =
          Number.isInteger(
            Number(
              test.annulledQuestions ??
              test.annulled ??
              0
            )
          )
            ? Number(
                test.annulledQuestions ??
                test.annulled ??
                0
              )
            : 0;

        let areaResults =
          test.areaResults;

        if (
          !areaResults ||
          typeof areaResults !== "object" ||
          Array.isArray(areaResults)
        ) {

          areaResults = null;

        } else {

          AREA_ORDER.forEach(
            area => {

              const data =
                areaResults[area];

              if (
                !data ||
                typeof data !== "object"
              ) {

                areaResults[area] = {

                  questions: 0,
                  correct: 0

                };

                return;

              }

              areaResults[area] = {

                questions:
                  Number.isInteger(
                    Number(data.questions)
                  )
                    ? Math.max(
                        0,
                        Number(data.questions)
                      )
                    : 0,

                correct:
                  Number.isInteger(
                    Number(data.correct)
                  )
                    ? Math.max(
                        0,
                        Number(data.correct)
                      )
                    : 0

              };

            }
          );

        }

        return {

          id:
            test.id ||
            generateId(),

          name:
            test.name ||
            "Prova sem nome",

          source:
            test.source ||
            "",

          type:
            test.type ||
            "Outro",

          date:
            test.date ||
            todayISO(),

          total:
            Math.max(
              0,
              total
            ),

          correct:
            Math.max(
              0,
              correct
            ),

          annulledQuestions:
            Math.max(
              0,
              annulled
            ),

          areaResults

        };

      }
    );

  return database;

}


function migrateOldDatabase(
  old
) {

  const migrated = {

    subjects: [],
    errors:
      old.errors || [],
    tests:
      old.tests || []

  };

  (
    old.subjects || []
  ).forEach(
    oldSubject => {

      const firstStudy =
        oldSubject.firstStudy ||
        oldSubject.createdAt ||
        todayISO();

      const subject =
        createEmptySubject(
          oldSubject.name ||
            "Assunto",

          oldSubject.area ||
            "GO",

          firstStudy
        );

      if (
        Array.isArray(
          oldSubject.history
        )
      ) {

        subject.history =
          oldSubject.history;

      }

      const stage =
        oldSubject.stage;

      if (stage === "d1") {

        subject.reviews.d1.plannedDate =
          oldSubject.nextReview ||
          addDays(
            firstStudy,
            1
          );

      }

      if (stage === "d7") {

        subject.reviews.d1.completed =
          true;

        subject.reviews.d1.date =
          oldSubject.lastReview ||
          null;

        subject.reviews.d7.plannedDate =
          oldSubject.nextReview ||
          null;

      }

      if (stage === "d30") {

        subject.reviews.d1.completed =
          true;

        subject.reviews.d7.completed =
          true;

        subject.reviews.d7.date =
          oldSubject.lastReview ||
          null;

        subject.reviews.d30.plannedDate =
          oldSubject.nextReview ||
          null;

      }

      if (stage === "d90") {

        subject.reviews.d1.completed =
          true;

        subject.reviews.d7.completed =
          true;

        subject.reviews.d30.completed =
          true;

        subject.reviews.d30.date =
          oldSubject.lastReview ||
          null;

        subject.reviews.d60.plannedDate =
          oldSubject.nextReview ||
          null;

      }

      migrated.subjects.push(
        subject
      );

    }
  );

  return migrated;

}


/* =========================================================
   SUBJECT FACTORY
   ========================================================= */

function createEmptySubject(
  name,
  area,
  firstStudy
) {

  return {

    id: generateId(),

    name,

    area,

    firstStudy,

    reviews: {

      d1: {

        completed: false,

        date: null,

        plannedDate:
          addDays(
            firstStudy,
            STAGE_INTERVALS.d1
          )

      },

      d7: {

        completed: false,

        date: null,

        plannedDate: null

      },

      d30: {

        completed: false,

        date: null,

        plannedDate: null

      },

      d60: {

        completed: false,

        date: null,

        plannedDate: null

      }

    },

    history: []

  };

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".nav-item"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );

            button.classList.add(
              "active"
            );

            renderPage(
              button.dataset.page
            );

          }
        );

      }
    );

}


function renderPage(page) {

  const container =
    document.getElementById(
      "pageContent"
    );

  if (!container) return;

  switch (page) {

    case "dashboard":

      renderDashboard(
        container
      );

      break;

    case "revisoes":

      renderReviews(
        container
      );

      break;

    case "assuntos":

      renderSubjects(
        container
      );

      break;

    case "simulados":

      renderTests(
        container
      );

      break;

    case "calendario":

      renderCalendar(
        container
      );

      break;

    default:

      renderDashboard(
        container
      );

  }

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function todayISO() {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}


function parseLocalDate(
  iso
) {

  if (!iso) return null;

  const [
    year,
    month,
    day
  ] =
    iso
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );

}


function formatDate(
  iso
) {

  if (!iso) return "—";

  const date =
    parseLocalDate(
      iso
    );

  if (
    !date ||
    isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit"
    }
  );

}


function formatDateLong(
  iso
) {

  if (!iso) return "—";

  const date =
    parseLocalDate(
      iso
    );

  if (
    !date ||
    isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


function addDays(
  iso,
  days
) {

  const date =
    parseLocalDate(
      iso
    );

  if (!date) return null;

  date.setDate(
    date.getDate() +
    days
  );

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}


function dateStatus(
  iso
) {

  if (!iso) return "";

  const today =
    todayISO();

  if (
    iso < today
  ) {

    return "overdue";

  }

  if (
    iso === today
  ) {

    return "today";

  }

  return "future";

}


function daysDifference(
  from,
  to
) {

  const a =
    parseLocalDate(
      from
    );

  const b =
    parseLocalDate(
      to
    );

  return Math.round(
    (
      b - a
    ) / 86400000
  );

}


/* =========================================================
   ID
   ========================================================= */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}


/* =========================================================
   AREA
   ========================================================= */

function areaClass(
  area
) {

  const classes = {

    GO: "go",

    CM: "clinica",

    PREV: "preventiva",

    PED: "pediatria",

    CIR: "cirurgia"

  };

  return (
    classes[area] ||
    "default"
  );

}


function areaHTML(
  area
) {

  const data =
    AREAS[area] ||
    AREAS.GO;

  return `

    <span
      class="area-tag area-badge area-${areaClass(area)}"
    >

      <span class="emoji">
        ${data.emoji}
      </span>

      ${escapeHTML(
        data.name
      )}

    </span>

  `;

}


/* =========================================================
   REVIEWS
   ========================================================= */

function renderReviews(
  container
) {

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="revisoes"
      >

        <h1>
          Revisões
        </h1>

        <p>
          D1 → D7 → D30 → D60.
          A próxima data é calculada a partir
          do dia em que você realmente revisou.
        </p>

      </div>

      <div class="page-actions">

        <button
          class="btn btn-primary"
          onclick="openSubjectModal()"
        >
          + Novo assunto
        </button>

      </div>

    </div>


    <div class="filter-bar">

      <div class="search-box">

        <span>⌕</span>

        <input
          type="text"
          id="reviewSearch"
          placeholder="Pesquisar assunto..."
          oninput="filterReviewTable()"
        >

      </div>


      <select
        id="reviewArea"
        class="filter-select"
        onchange="filterReviewTable()"
      >

        <option value="all">
          Todas as grandes áreas
        </option>

        ${AREA_ORDER
          .map(
            area => `

              <option value="${area}">
                ${AREAS[area].emoji}
                ${AREAS[area].name}
              </option>

            `
          )
          .join("")}

      </select>


      <select
        id="reviewStatus"
        class="filter-select"
        onchange="filterReviewTable()"
      >

        <option value="all">
          Todos
        </option>

        <option value="today">
          Revisar hoje
        </option>

        <option value="overdue">
          Atrasadas
        </option>

        <option value="upcoming">
          Próximas
        </option>

        <option value="completed">
          Concluídas
        </option>

      </select>

    </div>


    <div class="table-wrapper">

      <table class="review-table">

        <thead>

          <tr>

            <th>Grande área</th>
            <th>Assunto</th>
            <th>1º estudo</th>
            <th>D1</th>
            <th>D7</th>
            <th>D30</th>
            <th>D60</th>
            <th>Próxima</th>
            <th></th>

          </tr>

        </thead>


        <tbody id="reviewTableBody">

          ${buildReviewRows(
            db.subjects
          )}

        </tbody>

      </table>

    </div>

  `;

}


function buildReviewRows(
  subjects
) {

  if (!subjects.length) {

    return `

      <tr>

        <td colspan="9">

          <div class="empty-state">

            <div class="empty-icon">
              ✓
            </div>

            <strong>
              Nenhum assunto cadastrado
            </strong>

            <p>
              Comece adicionando seu primeiro assunto.
            </p>

          </div>

        </td>

      </tr>

    `;

  }

  return subjects
    .map(
      subject => `

        <tr
          data-subject-id="${subject.id}"
          data-area="${subject.area}"
          data-name="${escapeHTML(
            subject.name
          ).toLowerCase()}"
        >

          <td>
            ${areaHTML(
              subject.area
            )}
          </td>


          <td>

            <div class="subject-name">
              ${escapeHTML(
                subject.name
              )}
            </div>

            <div class="subject-meta">

              ${
                subject.history.length
              }

              registro${
                subject.history.length === 1
                  ? ""
                  : "s"
              }

            </div>

          </td>


          <td>

            <span class="first-date">
              ${formatDate(
                subject.firstStudy
              )}
            </span>

          </td>


          ${buildReviewCell(
            subject,
            "d1"
          )}

          ${buildReviewCell(
            subject,
            "d7"
          )}

          ${buildReviewCell(
            subject,
            "d30"
          )}

          ${buildReviewCell(
            subject,
            "d60"
          )}


          <td>
            ${buildNextReview(
              subject
            )}
          </td>


          <td>

            <div class="row-actions">

              <button
                class="icon-btn"
                title="Histórico"
                onclick="showHistory('${subject.id}')"
              >
                ↺
              </button>


              <button
                class="icon-btn"
                title="Editar assunto"
                onclick="openSubjectModal('${subject.id}')"
              >
                ⋯
              </button>

            </div>

          </td>

        </tr>

      `
    )
    .join("");

}


function buildReviewCell(
  subject,
  stage
) {

  const review =
    subject.reviews[stage];

  if (!review) {

    return `<td>—</td>`;

  }

  if (review.completed) {

    return `

      <td>

        <div class="review-cell">

          <input
            type="checkbox"
            class="review-checkbox"
            checked
            onchange="
              undoReview(
                '${subject.id}',
                '${stage}'
              )
            "
          >


          <span class="review-date completed">

            ${formatDate(
              review.date
            )}

          </span>

        </div>

      </td>

    `;

  }

  if (!review.plannedDate) {

    return `

      <td>

        <div class="review-cell">

          <input
            type="checkbox"
            class="review-checkbox"
            disabled
          >

          <span class="review-date empty">
            —
          </span>

        </div>

      </td>

    `;

  }

  const status =
    dateStatus(
      review.plannedDate
    );

  return `

    <td>

      <div class="review-cell ${status}">

        <input
          type="checkbox"
          class="review-checkbox"
          onchange="
            completeReview(
              '${subject.id}',
              '${stage}'
            )
          "
        >

        <span
          class="review-date clickable"
          onclick="
            editPlannedDate(
              '${subject.id}',
              '${stage}'
            )
          "
          title="Editar data planejada"
        >

          ${formatDate(
            review.plannedDate
          )}

        </span>

      </div>

    </td>

  `;

}


function buildNextReview(
  subject
) {

  const next =
    getNextReview(
      subject
    );

  if (!next) {

    return `

      <span class="next-review done">
        ✓ Concluído
      </span>

    `;

  }

  const status =
    dateStatus(
      next.date
    );

  let label = "";

  if (
    status === "overdue"
  ) {

    label =
      `Atrasada · ${formatDate(
        next.date
      )}`;

  } else if (
    status === "today"
  ) {

    label =
      `Hoje · ${STAGE_LABELS[
        next.stage
      ]}`;

  } else {

    label =
      `${STAGE_LABELS[
        next.stage
      ]} · ${formatDate(
        next.date
      )}`;

  }

  return `

    <span
      class="next-review ${status}"
    >
      ${label}
    </span>

  `;

}


function getNextReview(
  subject
) {

  for (
    const stage of STAGES
  ) {

    const review =
      subject.reviews[
        stage
      ];

    if (
      review &&
      !review.completed &&
      review.plannedDate
    ) {

      return {

        stage,

        date:
          review.plannedDate

      };

    }

  }

  return null;

}


/* =========================================================
   COMPLETE REVIEW
   ========================================================= */

function completeReview(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const review =
    subject.reviews[stage];

  if (
    !review ||
    review.completed
  ) {

    return;

  }

  const actualDate =
    todayISO();

  const currentIndex =
    STAGES.indexOf(
      stage
    );

  review.completed =
    true;

  review.date =
    actualDate;

  subject.history.push({

    id:
      generateId(),

    type:
      "revisão",

    stage,

    date:
      actualDate,

    createdAt:
      new Date().toISOString()

  });

  if (
    currentIndex <
    STAGES.length - 1
  ) {

    const nextStage =
      STAGES[
        currentIndex + 1
      ];

    const nextReview =
      subject.reviews[
        nextStage
      ];

    nextReview.completed =
      false;

    nextReview.date =
      null;

    nextReview.plannedDate =
      addDays(
        actualDate,
        STAGE_INTERVALS[
          nextStage
        ]
      );

  } else {

    /*
     * O ciclo termina no D60.
     * Não existe uma quinta revisão automática.
     */

    review.plannedDate =
      null;

  }

  saveDatabase();

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

  showToast(
    `${STAGE_LABELS[
      stage
    ]} registrada!`
  );

}


/* =========================================================
   UNDO REVIEW
   ========================================================= */

function undoReview(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const currentIndex =
    STAGES.indexOf(
      stage
    );

  if (
    currentIndex === -1
  ) {

    return;

  }

  const review =
    subject.reviews[
      stage
    ];

  if (
    !review ||
    !review.completed
  ) {

    return;

  }

  subject.history =
    subject.history.filter(
      item =>
        !(
          item.type === "revisão" &&
          item.stage === stage &&
          item.date === review.date
        )
    );

  for (
    let i = currentIndex;
    i < STAGES.length;
    i++
  ) {

    const currentStage =
      STAGES[i];

    subject.reviews[
      currentStage
    ].completed =
      false;

    subject.reviews[
      currentStage
    ].date =
      null;

    subject.reviews[
      currentStage
    ].plannedDate =
      null;

  }

  if (
    currentIndex === 0
  ) {

    subject.reviews.d1.plannedDate =
      addDays(
        subject.firstStudy,
        STAGE_INTERVALS.d1
      );

  } else {

    const previousStage =
      STAGES[
        currentIndex - 1
      ];

    const previousReview =
      subject.reviews[
        previousStage
      ];

    if (
      previousReview &&
      previousReview.completed &&
      previousReview.date
    ) {

      subject.reviews[
        stage
      ].plannedDate =
        addDays(
          previousReview.date,
          STAGE_INTERVALS[
            stage
          ]
        );

    }

  }

  saveDatabase();

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

  showToast(
    `${STAGE_LABELS[
      stage
    ]} desmarcada.`
  );

}


/* =========================================================
   EDITAR DATA
   ========================================================= */

function editPlannedDate(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const review =
    subject.reviews[stage];

  if (
    !review ||
    review.completed
  ) {

    return;

  }

  const current =
    review.plannedDate ||
    todayISO();

  document.getElementById(
    "modalRoot"
  ).innerHTML = `

    <div
      class="modal-backdrop"
      onclick="closeModal(event)"
    >

      <div
        class="modal"
        onclick="event.stopPropagation()"
      >

        <div class="modal-header">

          <h2>
            Editar data
          </h2>


          <button
            class="modal-close"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        <div class="modal-body">

          <div
            style="
              margin-bottom:18px;
              font-size:14px;
              color:var(--text-muted);
            "
          >

            <strong>
              ${STAGE_LABELS[stage]}
            </strong>

            ·

            ${escapeHTML(
              subject.name
            )}

          </div>


          <div class="form-group">

            <label>
              Nova data planejada
            </label>

            <input
              id="plannedDateInput"
              class="form-control"
              type="date"
              value="${current}"
            >

          </div>


          <div
            style="
              margin-top:12px;
              font-size:12px;
              line-height:1.5;
              color:var(--text-muted);
            "
          >

            Essa alteração muda apenas a data planejada.
            A revisão só será registrada quando você marcar
            o checkbox.

          </div>

        </div>


        <div class="modal-footer">

          <button
            class="btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>


          <button
            class="btn btn-primary"
            onclick="
              savePlannedDate(
                '${subject.id}',
                '${stage}'
              )
            "
          >
            Salvar data
          </button>

        </div>

      </div>

    </div>

  `;

}


function savePlannedDate(
  subjectId,
  stage
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const input =
    document.getElementById(
      "plannedDateInput"
    );

  if (!input) return;

  const newDate =
    input.value;

  if (!newDate) {

    showToast(
      "Selecione uma data."
    );

    return;

  }

  const review =
    subject.reviews[
      stage
    ];

  if (!review) return;

  const oldDate =
    review.plannedDate;

  review.plannedDate =
    newDate;

  subject.history.push({

    id:
      generateId(),

    type:
      "alteração de data",

    stage,

    date:
      todayISO(),

    oldDate,

    newDate,

    createdAt:
      new Date().toISOString()

  });

  saveDatabase();

  closeModal();

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

  showToast(
    `Data do ${STAGE_LABELS[
      stage
    ]} alterada.`
  );

}


/* =========================================================
   FILTROS
   ========================================================= */

function filterReviewTable() {

  const search =
    (
      document.getElementById(
        "reviewSearch"
      )?.value || ""
    )
      .toLowerCase()
      .trim();

  const area =
    document.getElementById(
      "reviewArea"
    )?.value ||
    "all";

  const status =
    document.getElementById(
      "reviewStatus"
    )?.value ||
    "all";

  document
    .querySelectorAll(
      "#reviewTableBody tr[data-subject-id]"
    )
    .forEach(
      row => {

        const subject =
          db.subjects.find(
            item =>
              item.id ===
              row.dataset.subjectId
          );

        if (!subject) return;

        let visible = true;

        if (
          search &&
          !subject.name
            .toLowerCase()
            .includes(search)
        ) {

          visible = false;

        }

        if (
          area !== "all" &&
          subject.area !== area
        ) {

          visible = false;

        }

        const next =
          getNextReview(
            subject
          );

        if (
          status === "today"
        ) {

          if (
            !next ||
            next.date !==
              todayISO()
          ) {

            visible = false;

          }

        }

        if (
          status === "overdue"
        ) {

          if (
            !next ||
            next.date >=
              todayISO()
          ) {

            visible = false;

          }

        }

        if (
          status === "upcoming"
        ) {

          if (
            !next ||
            next.date <=
              todayISO()
          ) {

            visible = false;

          }

        }

        if (
          status === "completed"
        ) {

          if (next) {

            visible = false;

          }

        }

        row.style.display =
          visible
            ? ""
            : "none";

      }
    );

}


/* =========================================================
   SUBJECTS
   ========================================================= */

function renderSubjects(
  container
) {

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="assuntos"
      >

        <h1>
          Assuntos
        </h1>

        <p>
          Todos os assuntos cadastrados no seu ciclo de estudos.
        </p>

      </div>


      <div class="page-actions">

        <button
          class="btn btn-primary"
          onclick="openSubjectModal()"
        >
          + Novo assunto
        </button>

      </div>

    </div>


    <div class="content-grid">

      ${
        db.subjects.length

          ? db.subjects
              .map(
                subject => `

                  <div class="data-card">

                    ${areaHTML(
                      subject.area
                    )}


                    <h3
                      style="margin-top:12px;"
                    >
                      ${escapeHTML(
                        subject.name
                      )}
                    </h3>


                    <p>
                      Primeiro estudo:
                      ${formatDateLong(
                        subject.firstStudy
                      )}
                    </p>


                    <div
                      class="data-card-footer"
                    >

                      <span class="data-tag">
                        ${getProgressLabel(
                          subject
                        )}
                      </span>


                      <button
                        class="btn btn-small"
                        onclick="
                          openSubjectModal(
                            '${subject.id}'
                          )
                        "
                      >
                        Editar
                      </button>

                    </div>

                  </div>

                `
              )
              .join("")

          : `

              <div class="data-card">

                <h3>
                  Nenhum assunto
                </h3>

                <p>
                  Adicione assuntos para começar
                  seu ciclo de revisões.
                </p>

              </div>

            `
      }

    </div>

  `;

}


function getProgressLabel(
  subject
) {

  const completed =
    STAGES.filter(
      stage =>
        subject.reviews[
          stage
        ]?.completed
    ).length;

  return `${completed}/4 revisões`;

}


/* =========================================================
   SUBJECT MODAL
   ========================================================= */

function openSubjectModal(
  subjectId = null
) {

  const subject =
    subjectId
      ? db.subjects.find(
          item =>
            item.id === subjectId
        )
      : null;

  const editing =
    Boolean(subject);

  document.getElementById(
    "modalRoot"
  ).innerHTML = `

    <div
      class="modal-backdrop"
      onclick="closeModal(event)"
    >

      <div
        class="modal"
        onclick="event.stopPropagation()"
      >

        <div class="modal-header">

          <h2>
            ${
              editing
                ? "Editar assunto"
                : "Novo assunto"
            }
          </h2>


          <button
            class="modal-close"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        <div class="modal-body">

          <div class="form-grid">

            <div
              class="
                form-group
                full
              "
            >

              <label>
                Assunto
              </label>


              <input
                id="subjectName"
                class="form-control"
                type="text"
                placeholder="Ex.: Pré-eclâmpsia"
                value="${
                  editing
                    ? escapeAttribute(
                        subject.name
                      )
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Grande área
              </label>


              <select
                id="subjectArea"
                class="form-control"
              >

                ${AREA_ORDER
                  .map(
                    area => `

                      <option
                        value="${area}"
                        ${
                          editing &&
                          subject.area ===
                            area
                            ? "selected"
                            : ""
                        }
                      >

                        ${
                          AREAS[
                            area
                          ].emoji
                        }

                        ${
                          AREAS[
                            area
                          ].name
                        }

                      </option>

                    `
                  )
                  .join("")}

              </select>

            </div>


            <div class="form-group">

              <label>
                Primeiro estudo
              </label>


              <input
                id="subjectFirstStudy"
                class="form-control"
                type="date"
                value="${
                  editing
                    ? subject.firstStudy
                    : todayISO()
                }"
              >

            </div>

          </div>

        </div>


        <div class="modal-footer">

          ${
            editing
              ? `

                <button
                  class="btn btn-danger"
                  onclick="
                    deleteSubject(
                      '${subject.id}'
                    )
                  "
                >
                  Excluir
                </button>

              `
              : ""
          }


          <button
            class="btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>


          <button
            class="btn btn-primary"
            onclick="${
              editing
                ? `saveSubject('${subject.id}')`
                : "saveSubject()"
            }"
          >

            ${
              editing
                ? "Salvar alterações"
                : "Adicionar assunto"
            }

          </button>

        </div>

      </div>

    </div>

  `;

}


function saveSubject(
  subjectId = null
) {

  const name =
    document
      .getElementById(
        "subjectName"
      )
      .value
      .trim();

  const area =
    document
      .getElementById(
        "subjectArea"
      )
      .value;

  const firstStudy =
    document
      .getElementById(
        "subjectFirstStudy"
      )
      .value;

  if (!name) {

    alert(
      "Digite o nome do assunto."
    );

    return;

  }

  if (!firstStudy) {

    alert(
      "Selecione a data do primeiro estudo."
    );

    return;

  }

  if (subjectId) {

    const subject =
      db.subjects.find(
        item =>
          item.id === subjectId
      );

    if (!subject) return;

    subject.name =
      name;

    subject.area =
      area;

    saveDatabase();

    closeModal();

    showToast(
      "Assunto atualizado."
    );

  } else {

    const subject =
      createEmptySubject(
        name,
        area,
        firstStudy
      );

    db.subjects.push(
      subject
    );

    saveDatabase();

    closeModal();

    showToast(
      "Assunto adicionado."
    );

  }

  const currentPage =
    document
      .querySelector(
        ".nav-item.active"
      )
      ?.dataset.page ||
    "revisoes";

  renderPage(
    currentPage
  );

}


function deleteSubject(
  subjectId
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const confirmed =
    confirm(
      `Excluir "${subject.name}"? Esta ação não pode ser desfeita.`
    );

  if (!confirmed) return;

  db.subjects =
    db.subjects.filter(
      item =>
        item.id !== subjectId
    );

  saveDatabase();

  closeModal();

  showToast(
    "Assunto excluído."
  );

  renderPage(
    "assuntos"
  );

}


/* =========================================================
   HISTORY
   ========================================================= */

function showHistory(
  subjectId
) {

  const subject =
    db.subjects.find(
      item =>
        item.id === subjectId
    );

  if (!subject) return;

  const history =
    [...subject.history]
      .reverse();

  document.getElementById(
    "modalRoot"
  ).innerHTML = `

    <div
      class="modal-backdrop"
      onclick="closeModal(event)"
    >

      <div
        class="modal"
        onclick="event.stopPropagation()"
      >

        <div class="modal-header">

          <h2>
            Histórico
          </h2>


          <button
            class="modal-close"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        <div class="modal-body">

          <div
            style="margin-bottom:16px;"
          >

            ${areaHTML(
              subject.area
            )}


            <div
              style="
                margin-top:9px;
                font-size:14px;
                font-weight:600;
              "
            >

              ${escapeHTML(
                subject.name
              )}

            </div>

          </div>


          ${
            history.length

              ? `

                <div class="history-list">

                  ${history
                    .map(
                      item => {

                        if (
                          item.type ===
                          "revisão"
                        ) {

                          return `

                            <div
                              class="history-item"
                            >

                              <div
                                class="history-dot"
                              ></div>


                              <div
                                class="history-content"
                              >

                                <strong>

                                  ${
                                    STAGE_LABELS[
                                      item.stage
                                    ]
                                  }

                                  realizada

                                </strong>


                                <span>

                                  ${formatDateLong(
                                    item.date
                                  )}

                                </span>

                              </div>

                            </div>

                          `;

                        }

                        if (
                          item.type ===
                          "alteração de data"
                        ) {

                          return `

                            <div
                              class="history-item"
                            >

                              <div
                                class="history-dot"
                                style="
                                  background:#bd7417;
                                "
                              ></div>


                              <div
                                class="history-content"
                              >

                                <strong>

                                  Data do

                                  ${
                                    STAGE_LABELS[
                                      item.stage
                                    ]
                                  }

                                  alterada

                                </strong>


                                <span>

                                  ${formatDate(
                                    item.oldDate
                                  )}

                                  →

                                  ${formatDate(
                                    item.newDate
                                  )}

                                </span>

                              </div>

                            </div>

                          `;

                        }

                        return "";

                      }
                    )
                    .join("")}

                </div>

              `

              : `

                <div class="empty-state">

                  <div
                    class="empty-icon"
                  >
                    ↺
                  </div>


                  <strong>
                    Nenhum registro ainda
                  </strong>


                  <p>
                    O histórico aparecerá conforme
                    você realizar as revisões.
                  </p>

                </div>

              `
          }

        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard(
  container
) {

  const total =
    db.subjects.length;

  const today =
    db.subjects.filter(
      subject => {

        const next =
          getNextReview(
            subject
          );

        return (
          next &&
          next.date ===
            todayISO()
        );

      }
    ).length;

  const overdue =
    db.subjects.filter(
      subject => {

        const next =
          getNextReview(
            subject
          );

        return (
          next &&
          next.date <
            todayISO()
        );

      }
    ).length;

  const completedReviews =
    db.subjects.reduce(
      (
        total,
        subject
      ) =>
        total +
        STAGES.filter(
          stage =>
            subject
              .reviews[
                stage
              ]
              ?.completed
        ).length,
      0
    );

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="dashboard"
      >

        <h1>
          Dashboard
        </h1>

        <p>
          Visão geral do seu ciclo de estudos.
        </p>

      </div>


      <div class="page-actions">

        <button
          class="btn btn-primary"
          onclick="openSubjectModal()"
        >
          + Novo assunto
        </button>

      </div>

    </div>


    <div class="stats-grid">

      <div class="stat-card">

        <div class="stat-label">
          Assuntos
        </div>

        <div class="stat-number">
          ${total}
        </div>

        <div class="stat-description">
          cadastrados
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Revisar hoje
        </div>

        <div class="stat-number">
          ${today}
        </div>

        <div class="stat-description">
          revisões programadas
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Atrasadas
        </div>

        <div
          class="stat-number"
          style="${
            overdue
              ? "color:var(--red)"
              : ""
          }"
        >
          ${overdue}
        </div>

        <div class="stat-description">
          precisam de atenção
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Revisões feitas
        </div>

        <div class="stat-number">
          ${completedReviews}
        </div>

        <div class="stat-description">
          no histórico
        </div>

      </div>

    </div>


    <div class="dashboard-grid">

      <div class="panel">

        <div class="panel-title">

          <h3>
            Progresso por grande área
          </h3>

          <span>
            revisões concluídas
          </span>

        </div>


        <div class="area-progress">

          ${AREA_ORDER
            .map(
              area => {

                const subjects =
                  db.subjects.filter(
                    subject =>
                      subject.area ===
                      area
                  );

                const possible =
                  subjects.length * 4;

                const completed =
                  subjects.reduce(
                    (
                      sum,
                      subject
                    ) =>
                      sum +
                      STAGES.filter(
                        stage =>
                          subject
                            .reviews[
                              stage
                            ]
                            ?.completed
                      ).length,
                    0
                  );

                const percentage =
                  possible
                    ? Math.round(
                        completed /
                        possible *
                        100
                      )
                    : 0;

                return `

                  <div
                    class="progress-row"
                  >

                    <div
                      class="progress-label"
                    >

                      ${
                        AREAS[
                          area
                        ].emoji
                      }

                      ${
                        AREAS[
                          area
                        ].name
                      }

                    </div>


                    <div
                      class="progress-bar"
                    >

                      <div
                        class="progress-fill"
                        style="
                          width:${percentage}%
                        "
                      ></div>

                    </div>


                    <div
                      class="progress-value"
                    >
                      ${percentage}%
                    </div>

                  </div>

                `;

              }
            )
            .join("")}

        </div>

      </div>


      <div class="panel">

        <div class="panel-title">

          <h3>
            Próximas revisões
          </h3>

          <span>
            próximas
          </span>

        </div>


        <div class="simple-list">

          ${buildUpcomingList()}

        </div>

      </div>

    </div>

  `;

}


function buildUpcomingList() {

  const upcoming =
    db.subjects
      .map(
        subject => {

          const next =
            getNextReview(
              subject
            );

          if (!next)
            return null;

          return {

            subject,

            next

          };

        }
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.next.date
            .localeCompare(
              b.next.date
            )
      )
      .slice(
        0,
        6
      );

  if (!upcoming.length) {

    return `

      <div class="empty-state">

        <strong>
          Nenhuma revisão programada
        </strong>

      </div>

    `;

  }

  return upcoming
    .map(
      item => `

        <div class="list-item">

          <div
            class="list-item-main"
          >

            <strong>
              ${escapeHTML(
                item.subject.name
              )}
            </strong>

            <span>

              ${
                AREAS[
                  item.subject.area
                ].emoji
              }

              ${
                STAGE_LABELS[
                  item.next.stage
                ]
              }

            </span>

          </div>


          <div
            class="list-item-value"
          >

            ${formatDate(
              item.next.date
            )}

          </div>

        </div>

      `
    )
    .join("");

}


/* =========================================================
   PROVAS E SIMULADOS
   ========================================================= */

const TEST_TYPES = [

  "Simulado Medcof",
  "Enamed",
  "Prova de residência",
  "Prova da faculdade",
  "Outro"

];


function testsWithAreaData() {

  return db.tests.filter(
    test =>
      test.areaResults &&
      typeof test.areaResults ===
        "object"
  );

}


function getValidQuestions(
  test
) {

  const total =
    Number(test?.total) || 0;

  const annulled =
    Number(
      test?.annulledQuestions ??
      test?.annulled ??
      0
    ) || 0;

  return Math.max(
    0,
    total - annulled
  );

}


function getTestPercentage(
  test
) {

  const valid =
    getValidQuestions(
      test
    );

  if (!valid) return 0;

  const correct =
    Math.min(
      Math.max(
        0,
        Number(test.correct) || 0
      ),
      valid
    );

  return (
    correct /
    valid *
    100
  );

}


/* =========================================================
   RENDERIZAÇÃO PRINCIPAL DAS PROVAS
   ========================================================= */

function renderTests(
  container
) {

  const stats =
    calculateTestStats();

  const areaStats =
    calculateAreaStats();

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="simulados"
      >

        <h1>
          Provas e simulados
        </h1>

        <p>
          Acompanhe sua evolução e veja seu desempenho
          por grande área.
        </p>

      </div>


      <div class="page-actions">

        <button
          class="btn btn-primary"
          onclick="openTestModal()"
        >
          + Nova prova
        </button>

      </div>

    </div>


    ${
      db.tests.length
        ? buildTestStatistics(
            stats
          )
        : ""
    }


    ${
      db.tests.length
        ? buildTestEvolution()
        : ""
    }


    ${
      db.tests.length
        ? buildAreaStatistics(
            areaStats
          )
        : ""
    }


    <div class="panel">

      <div class="panel-title">

        <h3>
          Histórico de provas
        </h3>

        <span>
          ${
            db.tests.length
          }
          ${
            db.tests.length === 1
              ? "prova"
              : "provas"
          }
        </span>

      </div>


      ${
        db.tests.length
          ? buildTestsHistory()
          : `

              <div class="empty-state">

                <div class="empty-icon">
                  ▤
                </div>

                <strong>
                  Nenhuma prova registrada
                </strong>

                <p>
                  Cadastre sua primeira prova ou simulado
                  para começar a acompanhar sua evolução.
                </p>

              </div>

            `
      }

    </div>

  `;

}


/* =========================================================
   ESTATÍSTICAS DAS PROVAS
   ========================================================= */

function calculateTestStats() {

  const tests =
    db.tests;

  const totalTests =
    tests.length;

  const totalQuestions =
    tests.reduce(
      (
        sum,
        test
      ) =>
        sum +
        Math.max(
          0,
          Number(test.total) || 0
        ),
      0
    );

  const totalAnnulled =
    tests.reduce(
      (
        sum,
        test
      ) =>
        sum +
        Math.max(
          0,
          Number(
            test.annulledQuestions ??
            test.annulled ??
            0
          ) || 0
        ),
      0
    );

  const totalValid =
    tests.reduce(
      (
        sum,
        test
      ) =>
        sum +
        getValidQuestions(
          test
        ),
      0
    );

  const totalCorrect =
    tests.reduce(
      (
        sum,
        test
      ) => {

        const valid =
          getValidQuestions(
            test
          );

        const correct =
          Math.min(
            Math.max(
              0,
              Number(test.correct) || 0
            ),
            valid
          );

        return sum + correct;

      },
      0
    );

  const percentage =
    totalValid
      ? totalCorrect /
        totalValid *
        100
      : 0;

  return {

    totalTests,

    totalQuestions,

    totalAnnulled,

    totalValid,

    totalCorrect,

    percentage

  };

}


function buildTestStatistics(
  stats
) {

  return `

    <div class="stats-grid">

      <div class="stat-card">

        <div class="stat-label">
          Provas
        </div>

        <div class="stat-number">
          ${stats.totalTests}
        </div>

        <div class="stat-description">
          cadastradas
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Questões
        </div>

        <div class="stat-number">
          ${stats.totalQuestions}
        </div>

        <div class="stat-description">

          ${
            stats.totalAnnulled
          }
          ${
            stats.totalAnnulled === 1
              ? "anulada"
              : "anuladas"
          }

        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Acertos
        </div>

        <div class="stat-number">
          ${stats.totalCorrect}
        </div>

        <div class="stat-description">
          de
          ${stats.totalValid}
          válidas
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Aproveitamento
        </div>

        <div class="stat-number">
          ${stats.percentage.toFixed(1)}%
        </div>

        <div class="stat-description">
          média geral ponderada
        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   EVOLUÇÃO
   ========================================================= */

function buildTestEvolution() {

  const ordered =
    [...db.tests]
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      );

  if (!ordered.length) {

    return "";

  }

  const tests =
    ordered.slice(
      -12
    );

  const width = 900;

  const height = 300;

  const padding = 45;

  const chartWidth =
    width -
    padding * 2;

  const chartHeight =
    height -
    padding * 2;

  const points =
    tests.map(
      (
        test,
        index
      ) => {

        const percentage =
          getTestPercentage(
            test
          );

        const x =
          tests.length === 1
            ? width / 2
            : padding +
              (
                index /
                (
                  tests.length -
                  1
                )
              ) *
              chartWidth;

        const y =
          padding +
          (
            100 -
            percentage
          ) /
          100 *
          chartHeight;

        return {

          x,
          y,
          percentage,
          test

        };

      }
    );

  const polyline =
    points
      .map(
        point =>
          `${point.x},${point.y}`
      )
      .join(" ");

  const labels =
    points
      .map(
        (
          point,
          index
        ) => {

          return `

            <text
              x="${point.x}"
              y="${height - 14}"
              text-anchor="middle"
              font-size="11"
              fill="currentColor"
              opacity="0.65"
            >
              ${index + 1}
            </text>


            <circle
              cx="${point.x}"
              cy="${point.y}"
              r="5"
              fill="currentColor"
            />


            <text
              x="${point.x}"
              y="${point.y - 12}"
              text-anchor="middle"
              font-size="11"
              font-weight="600"
              fill="currentColor"
            >
              ${point.percentage.toFixed(0)}%
            </text>

          `;

        }
      )
      .join("");

  return `

    <div
      class="panel"
      style="margin-top:20px;"
    >

      <div class="panel-title">

        <h3>
          Evolução nas provas
        </h3>

        <span>
          últimas ${
            tests.length
          }
        </span>

      </div>


      <div
        style="
          width:100%;
          overflow-x:auto;
          padding:10px 0 4px;
        "
      >

        <svg
          viewBox="0 0 ${width} ${height}"
          width="100%"
          height="300"
          preserveAspectRatio="none"
          style="
            min-width:650px;
            color:var(--accent);
          "
        >

          <line
            x1="${padding}"
            y1="${padding}"
            x2="${width - padding}"
            y2="${padding}"
            stroke="currentColor"
            opacity="0.08"
          />


          <line
            x1="${padding}"
            y1="${height / 2}"
            x2="${width - padding}"
            y2="${height / 2}"
            stroke="currentColor"
            opacity="0.08"
          />


          <line
            x1="${padding}"
            y1="${height - padding}"
            x2="${width - padding}"
            y2="${height - padding}"
            stroke="currentColor"
            opacity="0.08"
          />


          <text
            x="8"
            y="${padding + 4}"
            font-size="11"
            fill="currentColor"
            opacity="0.55"
          >
            100%
          </text>


          <text
            x="15"
            y="${height / 2 + 4}"
            font-size="11"
            fill="currentColor"
            opacity="0.55"
          >
            50%
          </text>


          <text
            x="23"
            y="${height - padding + 4}"
            font-size="11"
            fill="currentColor"
            opacity="0.55"
          >
            0%
          </text>


          <polyline
            points="${polyline}"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />


          ${labels}

        </svg>

      </div>


      <div
        style="
          font-size:12px;
          color:var(--text-muted);
          text-align:center;
        "
      >

        Os números representam a ordem cronológica
        das provas cadastradas.

      </div>

    </div>

  `;

}


/* =========================================================
   ESTATÍSTICAS POR ÁREA
   ========================================================= */

function calculateAreaStats() {

  const result = {};

  AREA_ORDER.forEach(
    area => {

      result[area] = {

        questions: 0,

        correct: 0,

        tests: 0

      };

    }
  );

  testsWithAreaData()
    .forEach(
      test => {

        AREA_ORDER.forEach(
          area => {

            const data =
              test.areaResults[
                area
              ];

            if (!data) return;

            const questions =
              Number(
                data.questions
              ) || 0;

            const correct =
              Number(
                data.correct
              ) || 0;

            if (
              questions <= 0
            ) {

              return;

            }

            result[area]
              .questions +=
              questions;

            result[area]
              .correct +=
              Math.min(
                Math.max(
                  0,
                  correct
                ),
                questions
              );

            result[area]
              .tests += 1;

          }
        );

      }
    );

  AREA_ORDER.forEach(
    area => {

      const item =
        result[area];

      item.percentage =
        item.questions
          ? item.correct /
            item.questions *
            100
          : 0;

    }
  );

  return result;

}


function buildAreaStatistics(
  stats
) {

  const hasData =
    AREA_ORDER.some(
      area =>
        stats[area]
          .questions > 0
    );

  if (!hasData) {

    return `

      <div
        class="panel"
        style="margin-top:20px;"
      >

        <div class="panel-title">

          <h3>
            Desempenho por grande área
          </h3>

        </div>


        <div class="empty-state">

          <strong>
            Ainda não há dados por área
          </strong>

          <p>
            Ao cadastrar uma prova, marque a opção
            de registrar o desempenho por grande área.
          </p>

        </div>

      </div>

    `;

  }

  return `

    <div
      class="panel"
      style="margin-top:20px;"
    >

      <div class="panel-title">

        <h3>
          Desempenho por grande área
        </h3>

        <span>
          acumulado
        </span>

      </div>


      <div class="area-chart">

        ${AREA_ORDER
          .map(
            area => {

              const item =
                stats[area];

              const percentage =
                item.percentage;

              const hasAreaData =
                item.questions > 0;

              return `

                <div
                  class="area-column"
                >

                  <div
                    class="area-percentage"
                  >

                    ${
                      hasAreaData
                        ? percentage.toFixed(1) + "%"
                        : "—"
                    }

                  </div>


                  <div
                    class="area-bar-container"
                  >

                    <div
                      class="area-bar-fill"
                      style="
                        height:${
                          hasAreaData
                            ? percentage
                            : 0
                        }%;
                      "
                    ></div>

                  </div>


                  <div
                    class="area-label"
                  >

                    <span class="area-emoji">
                      ${
                        AREAS[
                          area
                        ].emoji
                      }
                    </span>

                    <span>
                      ${
                        AREAS[
                          area
                        ].name
                      }
                    </span>

                  </div>

                </div>

              `;

            }
          )
          .join("")}

      </div>


      <div
        style="
          margin-top:16px;
          font-size:12px;
          color:var(--text-muted);
        "
      >

        O percentual considera apenas as questões
        das provas em que você informou o desempenho
        por grande área.

      </div>

    </div>

  `;

}


/* =========================================================
   HISTÓRICO DE PROVAS
   ========================================================= */

function buildTestsHistory() {

  const tests =
    [...db.tests]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );

  return `

    <div
      class="content-grid"
      style="margin-top:16px;"
    >

      ${tests
        .map(
          test => {

            const valid =
              getValidQuestions(
                test
              );

            const percentage =
              getTestPercentage(
                test
              );

            const hasAreas =
              Boolean(
                test.areaResults
              );

            return `

              <div class="data-card">

                <span class="data-tag">

                  ${escapeHTML(
                    test.type ||
                    "Outro"
                  )}

                </span>


                <h3
                  style="
                    margin-top:12px;
                  "
                >

                  ${escapeHTML(
                    test.name
                  )}

                </h3>


                <p>

                  ${
                    test.correct
                  }
                  acertos de
                  ${
                    valid
                  }
                  questões válidas.

                </p>


                ${
                  test.annulledQuestions
                    ? `

                      <p
                        style="
                          font-size:12px;
                          color:var(--text-muted);
                        "
                      >

                        ${
                          test.annulledQuestions
                        }
                        questão${
                          test.annulledQuestions === 1
                            ? ""
                            : "ões"
                        }
                        anulada${
                          test.annulledQuestions === 1
                            ? ""
                            : "s"
                        }.

                      </p>

                    `
                    : ""
                }


                ${
                  test.source
                    ? `

                      <p
                        style="
                          font-size:12px;
                          color:var(--text-muted);
                        "
                      >

                        ${escapeHTML(
                          test.source
                        )}

                      </p>

                    `
                    : ""
                }


                ${
                  hasAreas
                    ? `

                      <span
                        class="data-tag"
                        style="
                          margin-top:6px;
                        "
                      >
                        📊 Por área
                      </span>

                    `
                    : ""
                }


                <div
                  class="data-card-footer"
                >

                  <span
                    style="
                      font-size:14px;
                      font-weight:700;
                      color:var(--accent);
                    "
                  >

                    ${
                      percentage.toFixed(
                        1
                      )
                    }%

                  </span>


                  <span
                    style="
                      font-size:12px;
                      color:var(--text-muted);
                    "
                  >

                    ${formatDateLong(
                      test.date
                    )}

                  </span>


                  <div
                    style="
                      display:flex;
                      gap:6px;
                      margin-left:auto;
                    "
                  >

                    <button
                      class="btn btn-small"
                      onclick="
                        openTestModal(
                          '${test.id}'
                        )
                      "
                    >
                      Editar
                    </button>


                    <button
                      class="
                        btn
                        btn-small
                        btn-danger
                      "
                      onclick="
                        deleteTest(
                          '${test.id}'
                        )
                      "
                    >
                      Excluir
                    </button>

                  </div>

                </div>

              </div>

            `;

          }
        )
        .join("")}

    </div>

  `;

}


/* =========================================================
   MODAL DE PROVA
   ========================================================= */

function openTestModal(
  testId = null
) {

  const test =
    testId
      ? db.tests.find(
          item =>
            item.id === testId
        )
      : null;

  const editing =
    Boolean(test);

  const existingAreas =
    test?.areaResults ||
    null;

  document.getElementById(
    "modalRoot"
  ).innerHTML = `

    <div
      class="modal-backdrop"
      onclick="closeModal(event)"
    >

      <div
        class="modal"
        onclick="event.stopPropagation()"
      >

        <div class="modal-header">

          <h2>

            ${
              editing
                ? "Editar prova"
                : "Nova prova"
            }

          </h2>


          <button
            class="modal-close"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        <div class="modal-body">

          <div class="form-grid">

            <div
              class="
                form-group
                full
              "
            >

              <label>
                Nome da prova
              </label>


              <input
                id="testName"
                class="form-control"
                type="text"
                placeholder="Ex.: Simulado geral Medcof"
                value="${
                  editing
                    ? escapeAttribute(
                        test.name
                      )
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Tipo
              </label>


              <select
                id="testType"
                class="form-control"
              >

                ${TEST_TYPES
                  .map(
                    type => `

                      <option
                        value="${escapeAttribute(
                          type
                        )}"
                        ${
                          editing &&
                          (
                            test.type ||
                            "Outro"
                          ) ===
                            type
                            ? "selected"
                            : ""
                        }
                      >
                        ${escapeHTML(
                          type
                        )}
                      </option>

                    `
                  )
                  .join("")}

              </select>

            </div>


            <div class="form-group">

              <label>
                Plataforma / banca
              </label>


              <input
                id="testSource"
                class="form-control"
                type="text"
                placeholder="Medcof / FGV / SES-PE..."
                value="${
                  editing
                    ? escapeAttribute(
                        test.source ||
                        ""
                      )
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Data
              </label>


              <input
                id="testDate"
                class="form-control"
                type="date"
                value="${
                  editing
                    ? test.date
                    : todayISO()
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Questões totais
              </label>


              <input
                id="testTotal"
                class="form-control"
                type="number"
                min="1"
                step="1"
                oninput="updateTestModalSummary()"
                value="${
                  editing
                    ? test.total
                    : ""
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Questões anuladas
              </label>


              <input
                id="testAnnulled"
                class="form-control"
                type="number"
                min="0"
                step="1"
                oninput="updateTestModalSummary()"
                value="${
                  editing
                    ? (
                        test.annulledQuestions ??
                        test.annulled ??
                        0
                      )
                    : 0
                }"
              >

            </div>


            <div class="form-group">

              <label>
                Acertos
              </label>


              <input
                id="testCorrect"
                class="form-control"
                type="number"
                min="0"
                step="1"
                oninput="updateTestModalSummary()"
                value="${
                  editing
                    ? test.correct
                    : ""
                }"
              >

            </div>


            <div
              class="
                form-group
                full
              "
            >

              <div
                id="testModalSummary"
                style="
                  padding:12px 14px;
                  border-radius:10px;
                  background:var(--surface-soft);
                  border:1px solid var(--border);
                  font-size:13px;
                  color:var(--text-secondary);
                  line-height:1.6;
                "
              >
                Preencha os dados acima.
              </div>

            </div>


            <div
              class="
                form-group
                full
              "
            >

              <label
                style="
                  display:flex;
                  align-items:center;
                  gap:8px;
                  cursor:pointer;
                "
              >

                <input
                  id="testUseAreas"
                  type="checkbox"
                  ${
                    existingAreas
                      ? "checked"
                      : ""
                  }
                  onchange="
                    toggleTestAreas()
                  "
                >

                Registrar desempenho por grande área

              </label>


              <div
                style="
                  margin-top:6px;
                  font-size:12px;
                  color:var(--text-muted);
                  line-height:1.5;
                "
              >

                Opcional. Use quando você souber
                quantas questões e acertos teve
                em cada grande área.

              </div>

            </div>


            <div
              id="testAreasContainer"
              class="
                form-group
                full
              "
              style="
                display:${
                  existingAreas
                    ? "block"
                    : "none"
                };
              "
            >

              <div
                style="
                  display:grid;
                  grid-template-columns:
                    minmax(150px, 1.5fr)
                    minmax(90px, 1fr)
                    minmax(90px, 1fr);
                  gap:8px;
                  align-items:center;
                  margin-bottom:8px;
                  font-size:11px;
                  font-weight:700;
                  color:var(--text-muted);
                  text-transform:uppercase;
                "
              >

                <span>
                  Grande área
                </span>

                <span>
                  Questões
                </span>

                <span>
                  Acertos
                </span>

              </div>


              ${AREA_ORDER
                .map(
                  area => {

                    const data =
                      existingAreas?.[
                        area
                      ] || {

                        questions: 0,
                        correct: 0

                      };

                    return `

                      <div
                        style="
                          display:grid;
                          grid-template-columns:
                            minmax(150px, 1.5fr)
                            minmax(90px, 1fr)
                            minmax(90px, 1fr);
                          gap:8px;
                          align-items:center;
                          margin-bottom:8px;
                        "
                      >

                        <span
                          style="
                            font-size:13px;
                            font-weight:600;
                          "
                        >

                          ${
                            AREAS[
                              area
                            ].emoji
                          }

                          ${
                            AREAS[
                              area
                            ].name
                          }

                        </span>


                        <input
                          id="areaQuestions_${area}"
                          class="form-control"
                          type="number"
                          min="0"
                          step="1"
                          value="${
                            Number(
                              data.questions
                            ) || 0
                          }"
                          oninput="
                            updateTestModalSummary()
                          "
                        >


                        <input
                          id="areaCorrect_${area}"
                          class="form-control"
                          type="number"
                          min="0"
                          step="1"
                          value="${
                            Number(
                              data.correct
                            ) || 0
                          }"
                          oninput="
                            updateTestModalSummary()
                          "
                        >

                      </div>

                    `;

                  }
                )
                .join("")}


              <div
                id="testAreaSummary"
                style="
                  margin-top:12px;
                  font-size:12px;
                  color:var(--text-muted);
                  line-height:1.6;
                "
              ></div>

            </div>

          </div>

        </div>


        <div class="modal-footer">

          ${
            editing
              ? `

                <button
                  class="btn btn-danger"
                  onclick="
                    deleteTest(
                      '${test.id}'
                    )
                  "
                >
                  Excluir
                </button>

              `
              : ""
          }


          <button
            class="btn"
            onclick="closeModal()"
          >
            Cancelar
          </button>


          <button
            class="btn btn-primary"
            onclick="${
              editing
                ? `saveTest('${test.id}')`
                : "saveTest()"
            }"
          >

            ${
              editing
                ? "Salvar alterações"
                : "Salvar prova"
            }

          </button>

        </div>

      </div>

    </div>

  `;

  updateTestModalSummary();

}


/* =========================================================
   RESUMO DO MODAL
   ========================================================= */

function updateTestModalSummary() {

  const totalInput =
    document.getElementById(
      "testTotal"
    );

  const annulledInput =
    document.getElementById(
      "testAnnulled"
    );

  const correctInput =
    document.getElementById(
      "testCorrect"
    );

  const summary =
    document.getElementById(
      "testModalSummary"
    );

  if (
    !totalInput ||
    !annulledInput ||
    !correctInput ||
    !summary
  ) {

    return;

  }

  const total =
    Number(
      totalInput.value
    ) || 0;

  const annulled =
    Number(
      annulledInput.value
    ) || 0;

  const correct =
    Number(
      correctInput.value
    ) || 0;

  const valid =
    Math.max(
      0,
      total - annulled
    );

  const percentage =
    valid
      ? correct /
        valid *
        100
      : 0;

  if (!total) {

    summary.innerHTML =
      "Preencha o número total de questões.";

  } else if (
    annulled > total
  ) {

    summary.innerHTML = `

      <span
        style="
          color:var(--red);
          font-weight:600;
        "
      >

        ⚠ O número de anuladas não pode
        ultrapassar o total da prova.

      </span>

    `;

  } else if (
    correct > valid
  ) {

    summary.innerHTML = `

      <span
        style="
          color:var(--red);
          font-weight:600;
        "
      >

        ⚠ Os acertos não podem ultrapassar
        as ${valid} questões válidas.

      </span>

    `;

  } else {

    summary.innerHTML = `

      <strong>
        ${valid}
        questões válidas
      </strong>

      ·

      ${correct}
      acertos

      ·

      aproveitamento de

      <strong>
        ${percentage.toFixed(1)}%
      </strong>

      ${
        annulled
          ? `
              ·
              ${annulled}
              anulada${
                annulled === 1
                  ? ""
                  : "s"
              }
            `
          : ""
      }

    `;

  }

  const useAreas =
    document.getElementById(
      "testUseAreas"
    )?.checked;

  const areaSummary =
    document.getElementById(
      "testAreaSummary"
    );

  if (
    !useAreas ||
    !areaSummary
  ) {

    return;

  }

  let areaQuestions = 0;

  let areaCorrect = 0;

  let invalidArea = false;

  AREA_ORDER.forEach(
    area => {

      const questions =
        Number(
          document.getElementById(
            `areaQuestions_${area}`
          )?.value
        ) || 0;

      const correctArea =
        Number(
          document.getElementById(
            `areaCorrect_${area}`
          )?.value
        ) || 0;

      if (
        !Number.isInteger(
          questions
        ) ||
        questions < 0
      ) {

        invalidArea = true;

      }

      if (
        !Number.isInteger(
          correctArea
        ) ||
        correctArea < 0 ||
        correctArea > questions
      ) {

        invalidArea = true;

      }

      areaQuestions +=
        questions;

      areaCorrect +=
        correctArea;

    }
  );

  const messages = [];

  if (invalidArea) {

    messages.push(
      "Existe alguma quantidade inválida em uma das áreas."
    );

  }

  if (
    areaQuestions !==
    valid
  ) {

    messages.push(
      `Questões por área: ${areaQuestions}/${valid}.`
    );

  }

  if (
    areaCorrect !==
    correct
  ) {

    messages.push(
      `Acertos por área: ${areaCorrect}/${correct}.`
    );

  }

  if (
    !invalidArea &&
    areaQuestions === valid &&
    areaCorrect === correct
  ) {

    areaSummary.innerHTML = `

      <span
        style="
          color:var(--green);
          font-weight:600;
        "
      >

        ✓ Distribuição por área confere com a prova.

      </span>

    `;

  } else {

    areaSummary.innerHTML = `

      <span
        style="
          color:var(--red);
          font-weight:600;
        "
      >

        ⚠
        ${messages.join(" ")}

      </span>

      <br>

      <span>

        A soma das áreas deve ser igual às
        questões válidas e aos acertos informados
        acima.

      </span>

    `;

  }

}


/* =========================================================
   MOSTRAR / OCULTAR ÁREAS
   ========================================================= */

function toggleTestAreas() {

  const checkbox =
    document.getElementById(
      "testUseAreas"
    );

  const container =
    document.getElementById(
      "testAreasContainer"
    );

  if (
    !checkbox ||
    !container
  ) {

    return;

  }

  container.style.display =
    checkbox.checked
      ? "block"
      : "none";

  updateTestModalSummary();

}


/* =========================================================
   SALVAR PROVA
   ========================================================= */

function saveTest(
  testId = null
) {

  const name =
    document.getElementById(
      "testName"
    ).value.trim();

  const type =
    document.getElementById(
      "testType"
    ).value;

  const source =
    document.getElementById(
      "testSource"
    ).value.trim();

  const date =
    document.getElementById(
      "testDate"
    ).value;

  const total =
    Number(
      document.getElementById(
        "testTotal"
      ).value
    );

  const annulled =
    Number(
      document.getElementById(
        "testAnnulled"
      ).value
    ) || 0;

  const correct =
    Number(
      document.getElementById(
        "testCorrect"
      ).value
    );

  const useAreas =
    document.getElementById(
      "testUseAreas"
    ).checked;

  if (!name) {

    alert(
      "Digite o nome da prova."
    );

    return;

  }

  if (!date) {

    alert(
      "Selecione a data da prova."
    );

    return;

  }

  if (
    !Number.isInteger(total) ||
    total < 1
  ) {

    alert(
      "Informe um número válido de questões."
    );

    return;

  }

  if (
    !Number.isInteger(annulled) ||
    annulled < 0
  ) {

    alert(
      "O número de questões anuladas é inválido."
    );

    return;

  }

  if (
    annulled > total
  ) {

    alert(
      "O número de questões anuladas não pode ser maior que o total."
    );

    return;

  }

  const valid =
    total -
    annulled;

  if (
    !Number.isInteger(correct) ||
    correct < 0 ||
    correct > valid
  ) {

    alert(
      `Os acertos devem estar entre 0 e ${valid}.`
    );

    return;

  }

  let areaResults =
    null;

  if (useAreas) {

    areaResults = {};

    let areaQuestions = 0;

    let areaCorrect = 0;

    let invalidArea = false;

    AREA_ORDER.forEach(
      area => {

        const questionsInput =
          document.getElementById(
            `areaQuestions_${area}`
          );

        const correctInput =
          document.getElementById(
            `areaCorrect_${area}`
          );

        const questions =
          Number(
            questionsInput?.value
          );

        const areaCorrectValue =
          Number(
            correctInput?.value
          );

        if (
          !Number.isInteger(
            questions
          ) ||
          questions < 0
        ) {

          invalidArea = true;

          return;

        }

        if (
          !Number.isInteger(
            areaCorrectValue
          ) ||
          areaCorrectValue < 0 ||
          areaCorrectValue > questions
        ) {

          invalidArea = true;

          return;

        }

        areaResults[area] = {

          questions,

          correct:
            areaCorrectValue

        };

        areaQuestions +=
          questions;

        areaCorrect +=
          areaCorrectValue;

      }
    );

    if (invalidArea) {

      alert(
        "Verifique os números informados nas grandes áreas. Os valores devem ser inteiros e os acertos não podem ultrapassar as questões daquela área."
      );

      return;

    }

    if (
      areaQuestions !==
      valid
    ) {

      alert(
        `A soma das questões por grande área (${areaQuestions}) precisa ser igual às questões válidas da prova (${valid}).`
      );

      return;

    }

    if (
      areaCorrect !==
      correct
    ) {

      alert(
        `A soma dos acertos por grande área (${areaCorrect}) precisa ser igual ao total de acertos da prova (${correct}).`
      );

      return;

    }

  }

  if (testId) {

    const test =
      db.tests.find(
        item =>
          item.id === testId
      );

    if (!test) return;

    test.name =
      name;

    test.type =
      type;

    test.source =
      source;

    test.date =
      date;

    test.total =
      total;

    test.correct =
      correct;

    test.annulledQuestions =
      annulled;

    test.areaResults =
      areaResults;

    saveDatabase();

    closeModal();

    showToast(
      "Prova atualizada."
    );

    renderTests(
      document.getElementById(
        "pageContent"
      )
    );

    return;

  }

  db.tests.push({

    id:
      generateId(),

    name,

    source,

    type,

    date,

    total,

    correct,

    annulledQuestions:
      annulled,

    areaResults

  });

  saveDatabase();

  closeModal();

  showToast(
    "Prova registrada."
  );

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   EXCLUIR PROVA
   ========================================================= */

function deleteTest(
  testId
) {

  const test =
    db.tests.find(
      item =>
        item.id === testId
    );

  if (!test) return;

  const confirmed =
    confirm(
      `Excluir "${test.name}"? Esta ação não pode ser desfeita.`
    );

  if (!confirmed) {

    return;

  }

  db.tests =
    db.tests.filter(
      item =>
        item.id !== testId
    );

  saveDatabase();

  closeModal();

  showToast(
    "Prova excluída."
  );

  renderTests(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   CALENDÁRIO
   ========================================================= */

let calendarDate =
  new Date();


function renderCalendar(
  container
) {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const monthName =
    calendarDate.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    );

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let cells = "";

  const weekdays = [

    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb"

  ];

  weekdays.forEach(
    day => {

      cells += `

        <div
          class="calendar-weekday"
        >
          ${day}
        </div>

      `;

    }
  );

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    cells += `

      <div
        class="calendar-day"
      ></div>

    `;

  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const iso =
      `${year}-${
        String(
          month + 1
        ).padStart(
          2,
          "0"
        )
      }-${
        String(day)
          .padStart(
            2,
            "0"
          )
      }`;

    const events =
      getCalendarEvents(
        iso
      );

    const isToday =
      iso === todayISO();

    cells += `

      <div
        class="calendar-day"
      >

        <div
          class="
            calendar-number
            ${
              isToday
                ? "today"
                : ""
            }
          "
        >
          ${day}
        </div>


        ${events
          .map(
            event => `

              <div
                class="calendar-event"
                title="${escapeAttribute(
                  event.name
                )}"
              >

                ${
                  STAGE_LABELS[
                    event.stage
                  ]
                }

                ·

                ${escapeHTML(
                  event.name
                )}

              </div>

            `
          )
          .join("")}

      </div>

    `;

  }

  container.innerHTML = `

    <div class="page-header">

      <div
        class="page-title"
        data-page="calendario"
      >

        <h1>
          Calendário
        </h1>

        <p>
          Visualização das revisões programadas.
        </p>

      </div>

    </div>


    <div class="calendar-header">

      <h2>
        ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}
      </h2>


      <div class="calendar-actions">

        <button
          class="btn btn-small"
          onclick="changeMonth(-1)"
        >
          ←
        </button>


        <button
          class="btn btn-small"
          onclick="goToCurrentMonth()"
        >
          Hoje
        </button>


        <button
          class="btn btn-small"
          onclick="changeMonth(1)"
        >
          →
        </button>

      </div>

    </div>


    <div class="calendar-grid">

      ${cells}

    </div>

  `;

}


function getCalendarEvents(
  iso
) {

  const events = [];

  db.subjects.forEach(
    subject => {

      STAGES.forEach(
        stage => {

          const review =
            subject.reviews[
              stage
            ];

          if (
            review &&
            !review.completed &&
            review.plannedDate ===
              iso
          ) {

            events.push({

              name:
                subject.name,

              stage

            });

          }

        }
      );

    }
  );

  return events;

}


function changeMonth(
  delta
) {

  calendarDate.setMonth(
    calendarDate.getMonth() +
    delta
  );

  renderCalendar(
    document.getElementById(
      "pageContent"
    )
  );

}


function goToCurrentMonth() {

  calendarDate =
    new Date();

  renderCalendar(
    document.getElementById(
      "pageContent"
    )
  );

}


/* =========================================================
   MODAL
   ========================================================= */

function closeModal(
  event
) {

  if (
    event &&
    event.target !==
      event.currentTarget
  ) {

    return;

  }

  const modalRoot =
    document.getElementById(
      "modalRoot"
    );

  if (modalRoot) {

    modalRoot.innerHTML =
      "";

  }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message
) {

  const existing =
    document.querySelector(
      ".toast"
    );

  if (existing) {

    existing.remove();

  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    "toast";

  toast.textContent =
    message;

  document.body.appendChild(
    toast
  );

  setTimeout(
    () => {

      if (
        toast.parentNode
      ) {

        toast.remove();

      }

    },
    2800
  );

}


/* =========================================================
   EXPORT / IMPORT
   ========================================================= */

function exportData() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          db,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    `amadicas-study-${todayISO()}.json`;

  link.click();

  URL.revokeObjectURL(
    url
  );

  showToast(
    "Dados exportados."
  );

}


function importData(
  event
) {

  const file =
    event.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = () => {

    try {

      const imported =
        normalizeDatabase(
          JSON.parse(
            reader.result
          )
        );

      if (
        !confirm(
          "Importar estes dados vai substituir os dados atuais. Continuar?"
        )
      ) {

        return;

      }

      db =
        imported;

      saveDatabase();

      showToast(
        "Dados importados."
      );

      renderPage(
        "dashboard"
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Não foi possível importar este arquivo."
      );

    }

  };

  reader.readAsText(
    file
  );

}


function resetData() {

  const confirmed =
    confirm(
      "Isso apagará todos os assuntos e provas/simulados. Continuar?"
    );

  if (!confirmed)
    return;

  localStorage.removeItem(
    STORAGE_KEY
  );

  db = {

    subjects: [],
    errors: [],
    tests: []

  };

  showToast(
    "Dados resetados."
  );

  renderPage(
    "dashboard"
  );

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function escapeHTML(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}
