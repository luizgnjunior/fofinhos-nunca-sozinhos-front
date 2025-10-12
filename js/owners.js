const API_URL = "http://localhost:3000/owners";

let editingOwnerId = null;
let ownerIdToDelete = null;

let isFormVisible = false;
const tableWrapper = document.getElementById("owners-table-card");
const formWrapper = document.getElementById("owner-form-card");
const emptyMessage = document.getElementById("empty-message");
const tableContainer = document.getElementById("owners-table-container");

function showOwnerForm() {
  const tableCard = document.getElementById("owners-table-card");
  tableCard.classList.remove("show");
  setTimeout(() => {
    tableCard.classList.add("d-none");

    const formCard = document.getElementById("owner-form-card");
    formCard.classList.remove("d-none");
    setTimeout(() => {
      formCard.classList.add("show");
    }, 10);
  }, 200);

  attachFormListeners();
  validateFormFields();
}

function hideOwnerForm() {
  if (document.activeElement) {
    document.activeElement.blur();
  }

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  document.getElementById("notes").value = "";

  const inputs = document.querySelectorAll("#owner-form-card .form-control");
  inputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
  });

  const feedbacks = document.querySelectorAll(
    "#owner-form-card .invalid-feedback"
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

    getOwners();

    window.scrollTo(0, scrollY);
  }, 200);
}

async function getOwners() {
  const loading = document.getElementById("loading-indicator");
  const tableWrapper = document.getElementById("owners-table-wrapper");

  document
    .getElementById("owners-table-card")
    .classList.remove("d-none", "fade");
  tableWrapper.classList.remove("show");
  tableWrapper.classList.add("d-none");
  loading.classList.remove("d-none");

  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Erro ao buscar tutores");

    const owners = await response.json();

    setTimeout(() => {
      renderOwnersTable(owners);

      loading.classList.add("d-none");
      tableWrapper.classList.remove("d-none");
      setTimeout(() => {
        tableWrapper.classList.add("show");
      }, 10);
    }, 1000);
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar tutores");

    loading.classList.add("d-none");
    tableWrapper.classList.remove("d-none");
    tableWrapper.classList.add("show");
  }
}

function renderOwnersTable(owners) {
  const tableWrapper = document.getElementById("owners-table-wrapper");
  const tableContainer = document.getElementById("owners-table-container");

  if (owners.length === 0) {
    tableContainer.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-emoji-frown display-4 text-warning mb-3"></i>
        <h5>Ops! Ainda não temos tutores cadastrados.</h5>
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
            <th>Observações</th>
            <th class="text-end"></th>
          </tr>
        </thead>
        <tbody>
          ${owners
            .map(
              (owner) => `
              <tr>
                <td>${owner.name}</td>
                <td>${owner.phone}</td>
                <td>${owner.address}</td>
                <td>${owner.notes ? owner.notes : " - "}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" title="Editar" onclick="editOwner('${
                    owner.id
                  }')">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger ms-2" title="Excluir" onclick="prepareDeleteOwner('${
                    owner.id
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
  ];

  let isValid = true;

  fields.forEach(({ id, min }) => {
    const input = document.getElementById(id);
    const value = input.value.trim();
    const feedback = input.nextElementSibling;

    if (value.length < min) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      if (feedback) feedback.classList.remove("d-none");
      isValid = false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      if (feedback) feedback.classList.add("d-none");
    }
  });

  return isValid;
}

async function createOrUpdateOwner(event) {
  event.preventDefault();

  if (!validateFormFieldsInfo()) return;

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const notes = document.getElementById("notes").value.trim();

  const ownerData = { name, phone, address, notes };

  try {
    if (editingOwnerId) {
      const response = await fetch(`${API_URL}/${editingOwnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerData),
      });

      if (!response.ok) throw new Error("Erro ao editar tutor");

      showToast("toastUpdated");
      editingOwnerId = null;
    } else {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerData),
      });

      if (!response.ok) throw new Error("Erro ao adicionar tutor");

      showToast("toastAdded");
    }

    hideOwnerForm();
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar tutor");
  }
}

async function editOwner(id) {
  try {
    const response = await fetch(`${API_URL}`);
    const owners = await response.json();
    const owner = owners.find((o) => o.id === id);

    if (!owner) return alert("Tutor não encontrado");

    document.getElementById("name").value = owner.name;
    document.getElementById("phone").value = owner.phone;
    document.getElementById("address").value = owner.address;
    document.getElementById("notes").value = owner.notes;

    editingOwnerId = id;

    if (!isFormVisible) showOwnerForm();

    document.getElementById("submit-button").textContent = "Salvar alterações";
  } catch (error) {
    console.error("Erro ao carregar tutor para edição:", error);
  }
}

function prepareDeleteOwner(id) {
  ownerIdToDelete = id;
}

async function confirmDeleteOwner() {
  if (!ownerIdToDelete) return;

  try {
    const response = await fetch(`${API_URL}/${ownerIdToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir tutor");

    showToast("toastDeleted");
    getOwners();

    ownerIdToDelete = null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    modal.hide();
  } catch (error) {
    console.error("Erro ao excluir tutor:", error);
    alert("Erro ao excluir tutor");
  }
}

function validateFormFields() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const isValid = name && phone && address && notes;
  document.getElementById("submit-button").disabled = !isValid;
}

function attachFormListeners() {
  const inputs = ["name", "phone", "address", "notes"];
  inputs.forEach((id) => {
    document.getElementById(id).addEventListener("input", validateFormFields);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getOwners();
  allowOnlyNumbers("phone");
  applyPhoneMask("phone");
  allowOnlyLetters("name");
});
