const API_URL = "http://localhost:3000/caretakers";

let editingCaretakerId = null;
let caretakerIdToDelete = null;

let isFormVisible = false;
const tableWrapper = document.getElementById("caretakers-table-card");
const formWrapper = document.getElementById("caretaker-form-card");
const emptyMessage = document.getElementById("empty-message");
const tableContainer = document.getElementById("caretakers-table-container");

function showCaretakerForm() {
  const tableCard = document.getElementById("caretakers-table-card");
  tableCard.classList.remove("show");
  setTimeout(() => {
    tableCard.classList.add("d-none");

    const formCard = document.getElementById("caretaker-form-card");
    formCard.classList.remove("d-none");
    setTimeout(() => {
      formCard.classList.add("show");
    }, 10);
  }, 200);

  attachFormListeners();
  validateFormFields();
}

function hideCaretakerForm() {
  if (document.activeElement) {
    document.activeElement.blur();
  }

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";

  // limpa selects (se existirem)
  const availableDaysSelect = document.getElementById("availableDays");
  if (availableDaysSelect) {
    Array.from(availableDaysSelect.options).forEach(
      (opt) => (opt.selected = false)
    );
  }
  const servicesSelect = document.getElementById("services");
  if (servicesSelect) {
    Array.from(servicesSelect.options).forEach((opt) => (opt.selected = false));
  }

  document.getElementById("notes").value = "";

  const inputs = document.querySelectorAll(
    "#caretaker-form-card .form-control"
  );
  inputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
  });

  const feedbacks = document.querySelectorAll(
    "#caretaker-form-card .invalid-feedback"
  );

  feedbacks.forEach((msg) => {
    msg.classList.add("d-none");
  });

  document.getElementById("submit-button").textContent = "Confirmar";
  document.getElementById("submit-button").disabled = false;

  formWrapper.classList.remove("show");

  setTimeout(() => {
    formWrapper.classList.add("d-none");

    const scrollY = window.scrollY;

    getCaretakers();

    window.scrollTo(0, scrollY);
  }, 200);
}

async function getCaretakers() {
  const loading = document.getElementById("loading-indicator");
  const tableWrapper = document.getElementById("caretakers-table-wrapper");

  document
    .getElementById("caretakers-table-card")
    .classList.remove("d-none", "fade");
  tableWrapper.classList.remove("show");
  tableWrapper.classList.add("d-none");
  loading.classList.remove("d-none");

  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Erro ao buscar cuidadores");

    const caretakers = await response.json();

    setTimeout(() => {
      renderCaretakersTable(caretakers);

      loading.classList.add("d-none");
      tableWrapper.classList.remove("d-none");
      setTimeout(() => {
        tableWrapper.classList.add("show");
      }, 10);
    }, 1000);
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar cuidadores");

    loading.classList.add("d-none");
    tableWrapper.classList.remove("d-none");
    tableWrapper.classList.add("show");
  }
}

function renderCaretakersTable(caretakers) {
  const tableWrapper = document.getElementById("caretakers-table-wrapper");
  const tableContainer = document.getElementById("caretakers-table-container");

  if (!caretakers || caretakers.length === 0) {
    tableContainer.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-emoji-frown display-4 text-warning mb-3"></i>
        <h5>Ops! Ainda não temos cuidadores cadastrados.</h5>
        <p class="mb-0">Adicione o primeiro clicando no botão acima.</p>
      </div>
    `;

    tableWrapper.classList.remove("d-none");
    setTimeout(() => tableWrapper.classList.add("show"), 10);
    return;
  }

  // Renderiza tabela
  const tableHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Disponibilidade</th>
            <th>Serviços</th>
            <th>Observações</th>
            <th class="text-end"></th>
          </tr>
        </thead>
        <tbody>
          ${caretakers
            .map(
              (c) => `
              <tr>
                <td>${c.name}</td>
                <td>${c.phone}</td>
                <td>${c.address}</td>
                <td>${
                  Array.isArray(c.availableDays) && c.availableDays.length
                    ? c.availableDays.join(", ")
                    : " - "
                }</td>
                <td>${
                  Array.isArray(c.services) && c.services.length
                    ? c.services.join(", ")
                    : " - "
                }</td>
                <td>${c.notes ? c.notes : " - "}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" title="Editar" onclick="editCaretaker('${
                    c.id
                  }')">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger ms-2" title="Excluir" onclick="prepareDeleteCaretaker('${
                    c.id
                  }')" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  tableContainer.innerHTML = tableHTML;
  tableWrapper.classList.remove("d-none");
  setTimeout(() => tableWrapper.classList.add("show"), 10);
}

function allowOnlyNumbers(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });
}

function allowOnlyLetters(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
  });
}

function applyPhoneMask(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, ""); // Remove não-números

    value = value.slice(0, 11); // Limita a 11 dígitos

    value = value
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");

    this.value = value;
  });
}

function validateFormFieldsInfo() {
  const fields = [
    { id: "name", min: 6 },
    { id: "phone", min: 6 },
    { id: "address", min: 6 },
    // availableDays and services validation handled below
  ];

  let isValid = true;

  fields.forEach(({ id, min }) => {
    const input = document.getElementById(id);
    const value = input ? input.value.trim() : "";
    const feedback = input ? input.nextElementSibling : null;

    if (value.length < min) {
      if (input) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
      }
      if (feedback) feedback.classList.remove("d-none");
      isValid = false;
    } else {
      if (input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
      if (feedback) feedback.classList.add("d-none");
    }
  });

  // availableDays (expect select multiple or similar)
  const availableDaysEl = document.getElementById("availableDays");
  if (availableDaysEl) {
    let selectedCount = 0;
    if (availableDaysEl.multiple) {
      selectedCount = Array.from(availableDaysEl.options).filter(
        (o) => o.selected
      ).length;
    } else {
      selectedCount = availableDaysEl.value ? 1 : 0;
    }
    const feedback = availableDaysEl.nextElementSibling;
    if (selectedCount === 0) {
      availableDaysEl.classList.add("is-invalid");
      availableDaysEl.classList.remove("is-valid");
      if (feedback) feedback.classList.remove("d-none");
      isValid = false;
    } else {
      availableDaysEl.classList.remove("is-invalid");
      availableDaysEl.classList.add("is-valid");
      if (feedback) feedback.classList.add("d-none");
    }
  }

  // services (expect select multiple or similar)
  const servicesEl = document.getElementById("services");
  if (servicesEl) {
    let selectedCount = 0;
    if (servicesEl.multiple) {
      selectedCount = Array.from(servicesEl.options).filter(
        (o) => o.selected
      ).length;
    } else {
      selectedCount = servicesEl.value ? 1 : 0;
    }
    const feedback = servicesEl.nextElementSibling;
    if (selectedCount === 0) {
      servicesEl.classList.add("is-invalid");
      servicesEl.classList.remove("is-valid");
      if (feedback) feedback.classList.remove("d-none");
      isValid = false;
    } else {
      servicesEl.classList.remove("is-invalid");
      servicesEl.classList.add("is-valid");
      if (feedback) feedback.classList.add("d-none");
    }
  }

  return isValid;
}

async function createOrUpdateCaretaker(event) {
  event.preventDefault();

  if (!validateFormFieldsInfo()) return;

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const availableDaysEl = document.getElementById("availableDays");
  let availableDays = [];
  if (availableDaysEl) {
    if (availableDaysEl.multiple) {
      availableDays = Array.from(availableDaysEl.options)
        .filter((o) => o.selected)
        .map((o) => o.value);
    } else {
      availableDays = availableDaysEl.value ? [availableDaysEl.value] : [];
    }
  }

  const servicesEl = document.getElementById("services");
  let services = [];
  if (servicesEl) {
    if (servicesEl.multiple) {
      services = Array.from(servicesEl.options)
        .filter((o) => o.selected)
        .map((o) => o.value);
    } else {
      services = servicesEl.value ? [servicesEl.value] : [];
    }
  }

  const notes = document.getElementById("notes").value.trim();

  const caretakerData = {
    name: name,
    address: address || "",
    phone: phone || "",
    availableDays: Array.isArray(availableDays) ? availableDays : [],
    services: Array.isArray(services) ? services : [],
    notes: notes || "",
  };

  try {
    if (editingCaretakerId) {
      const response = await fetch(`${API_URL}/${editingCaretakerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caretakerData),
      });

      if (!response.ok) throw new Error("Erro ao editar cuidador");

      showToast("toastUpdated");
      editingCaretakerId = null;
    } else {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caretakerData),
      });

      if (!response.ok) throw new Error("Erro ao adicionar cuidador");

      showToast("toastAdded");
    }

    hideCaretakerForm();
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar cuidador");
  }
}

async function editCaretaker(id) {
  try {
    const response = await fetch(`${API_URL}`);
    const caretakers = await response.json();
    const c = caretakers.find((t) => t.id === id);

    if (!c) return alert("Cuidador não encontrado");

    // Preenche os campos básicos
    document.getElementById("name").value = c.name;
    document.getElementById("phone").value = c.phone;
    document.getElementById("address").value = c.address;
    document.getElementById("notes").value = c.notes;

    // Exibe o formulário (isso pode já popular selects se seu HTML faz isso)
    if (!isFormVisible) showCaretakerForm();

    // Aguarda um pequeno delay para garantir que selects/DOM estejam prontos
    setTimeout(() => {
      // availableDays
      const availableDaysEl = document.getElementById("availableDays");
      if (availableDaysEl && Array.isArray(c.availableDays)) {
        if (availableDaysEl.multiple) {
          Array.from(availableDaysEl.options).forEach((opt) => {
            opt.selected = c.availableDays.includes(opt.value);
          });
        } else {
          availableDaysEl.value = c.availableDays.length
            ? c.availableDays[0]
            : "";
        }
      }

      // services
      const servicesEl = document.getElementById("services");
      if (servicesEl && Array.isArray(c.services)) {
        if (servicesEl.multiple) {
          Array.from(servicesEl.options).forEach((opt) => {
            opt.selected = c.services.includes(opt.value);
          });
        } else {
          servicesEl.value = c.services.length ? c.services[0] : "";
        }
      }

      editingCaretakerId = id;
      document.getElementById("submit-button").textContent =
        "Salvar alterações";
    }, 200);
  } catch (error) {
    console.error("Erro ao carregar cuidador para edição:", error);
  }
}

function prepareDeleteCaretaker(id) {
  caretakerIdToDelete = id;
}

async function confirmDeleteCaretaker() {
  if (!caretakerIdToDelete) return;

  try {
    const response = await fetch(`${API_URL}/${caretakerIdToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir cuidador");

    showToast("toastDeleted");
    getCaretakers();

    caretakerIdToDelete = null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    modal.hide();
  } catch (error) {
    console.error("Erro ao excluir cuidador:", error);
    alert("Erro ao excluir cuidador");
  }
}

function validateFormFields() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  // Mantendo o mesmo padrão de checagem usada no original
  const isValid = name && phone && address && notes;
  document.getElementById("submit-button").disabled = !isValid;
}

function attachFormListeners() {
  const inputs = [
    "name",
    "phone",
    "address",
    "availableDays",
    "services",
    "notes",
  ];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", validateFormFields);
    // para selects múltiplos, também ouvir change
    if (el && el.tagName === "SELECT")
      el.addEventListener("change", validateFormFields);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getCaretakers();
  allowOnlyNumbers("phone");
  applyPhoneMask("phone");
  allowOnlyLetters("name");
});
