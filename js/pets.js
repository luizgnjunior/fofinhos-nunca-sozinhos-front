const API = "http://localhost:3000/";
const API_URL = `${API}pets`;
const API_OWNERS = `${API}owners`;

let editingPetId = null;
let petIdToDelete = null;

let isFormVisible = false;
const tableWrapper = document.getElementById("pets-table-card");
const formWrapper = document.getElementById("pet-form-card");
const emptyMessage = document.getElementById("empty-message");
const tableContainer = document.getElementById("pets-table-container");

let owners;

async function getPets() {
  const loading = document.getElementById("loading-indicator");
  const tableWrapper = document.getElementById("pets-table-wrapper");

  document.getElementById("pets-table-card").classList.remove("d-none", "fade");
  tableWrapper.classList.remove("show");
  tableWrapper.classList.add("d-none");
  loading.classList.remove("d-none");

  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Erro ao buscar pets");

    const pets = await response.json();
    console.log("🚀 ~ getPets ~ pets:", pets);

    setTimeout(() => {
      renderPetsTable(pets);

      loading.classList.add("d-none");
      tableWrapper.classList.remove("d-none");
      setTimeout(() => {
        tableWrapper.classList.add("show");
      }, 10);
    }, 1000);
  } catch (error) {
    alert("Erro ao carregar pets");

    loading.classList.add("d-none");
    tableWrapper.classList.remove("d-none");
    tableWrapper.classList.add("show");
  }
}

async function getOwners() {
  try {
    const response = await fetch(`${API_OWNERS}`);
    if (!response.ok) throw new Error("Erro ao buscar tutores");

    owners = await response.json();

    return owners;
  } catch (error) {
    alert("Erro ao carregar tutores");
    return [];
  }
}

async function populateOwnerSelect() {
  const select = document.getElementById("ownerId");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione</option>';

  owners = await getOwners();

  if (owners.length === 0) {
    select.innerHTML = '<option value="">Nenhum tutor cadastrado</option>';
    return;
  }

  owners.forEach((owner) => {
    const option = document.createElement("option");
    option.value = owner.id;
    option.textContent = owner.name;
    select.appendChild(option);
  });
}

function showPetForm() {
  const tableCard = document.getElementById("pets-table-card");
  tableCard.classList.remove("show");
  setTimeout(() => {
    tableCard.classList.add("d-none");

    const formCard = document.getElementById("pet-form-card");
    formCard.classList.remove("d-none");
    setTimeout(() => {
      formCard.classList.add("show");
    }, 10);
  }, 200);

  attachFormListeners();
  validateFormFields();
  populateOwnerSelect();
}

function hidePetForm() {
  if (document.activeElement) {
    document.activeElement.blur();
  }

  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("size").value = "";
  document.getElementById("ownerId").value = "";
  document.getElementById("notes").value = "";

  const inputs = document.querySelectorAll("#pet-form-card .form-control");
  inputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
  });

  const feedbacks = document.querySelectorAll(
    "#pet-form-card .invalid-feedback"
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
    getPets();

    window.scrollTo(0, scrollY);
  }, 200);
}

function renderPetsTable(pets) {
  const tableWrapper = document.getElementById("pets-table-wrapper");
  const tableContainer = document.getElementById("pets-table-container");

  if (pets.length === 0) {
    tableContainer.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-emoji-frown display-4 text-warning mb-3"></i>
        <h5>Ops! Ainda não temos pets cadastrados.</h5>
        <p class="mb-0">Adicione o primeiro clicando no botão acima.</p>
      </div>
    `;

    tableWrapper.classList.remove("d-none");
    setTimeout(() => tableWrapper.classList.add("show"), 10);
    return;
  }

  const tableHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Nome do Pet</th>
            <th>Idade</th>
            <th>Porte</th>
            <th>Tutor</th>
            <th>Observações</th>
            <th class="text-end"></th>
          </tr>
        </thead>
        <tbody>
          ${pets
            .map(
              (pet) => `
              <tr>
                <td class="text-capitalize">${pet.name}</td>
                <td>${pet.age}</td>
                <td>${pet.size}</td>
                <td> ${finInfoOwner(pet.ownerId, `name`)}
               
                </td>
                <td>${pet.notes ? pet.notes : " - "}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" title="Editar" onclick="editPet('${
                    pet.id
                  }')">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger ms-2" title="Excluir" onclick="prepareDeletePet('${
                    pet.id
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

function finInfoOwner(idOwner, info) {
  return owners.find((o) => o.id === idOwner)[info];
}

function validateFormFieldsInfo() {
  const fields = [
    { id: "name", min: 3 },
    { id: "age", min: 1 },
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

async function createOrUpdatePet(event) {
  event.preventDefault();

  if (!validateFormFieldsInfo()) return;

  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const size = document.getElementById("size").value.trim();
  const ownerId = document.getElementById("ownerId").value.trim();
  const notes = document.getElementById("notes").value.trim();

  const petData = { name, age, size, ownerId, notes };

  try {
    if (editingPetId) {
      const response = await fetch(`${API_URL}/${editingPetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });

      if (!response.ok) throw new Error("Erro ao editar pet");

      showToast("toastUpdated");
      editingPetId = null;
    } else {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });

      if (!response.ok) throw new Error("Erro ao adicionar pet");

      showToast("toastAdded");
    }

    hidePetForm();
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar pet");
  }
}

async function editPet(id) {
  try {
    const response = await fetch(`${API_URL}`);
    const pets = await response.json();
    const pet = pets.find((p) => p.id === id);

    if (!pet) return alert("Pet não encontrado");

    if (!isFormVisible) showPetForm();

    const select = document.getElementById("ownerId");

    setTimeout(() => {
      document.getElementById("name").value = pet.name;
      document.getElementById("age").value = pet.age;
      document.getElementById("size").value = pet.size;
      document.getElementById("notes").value = pet.notes || "";

      if (select) select.value = pet.ownerId || "";

      editingPetId = id;
      document.getElementById("submit-button").textContent =
        "Salvar alterações";
    }, 200);
  } catch (error) {
    console.error("Erro ao carregar pet para edição:", error);
  }
}

function prepareDeletePet(id) {
  petIdToDelete = id;
}

async function confirmDeletePet() {
  if (!petIdToDelete) return;

  try {
    const response = await fetch(`${API_URL}/${petIdToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir pet");

    showToast("toastDeleted");
    getOwners();
    getPets();

    petIdToDelete = null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    modal.hide();
  } catch (error) {
    alert("Erro ao excluir pet");
  }
}

function validateFormFields() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const size = document.getElementById("size").value.trim();

  const ownerId = document.getElementById("ownerId").value.trim();

  const isValid = name && age && size && ownerId;
  document.getElementById("submit-button").disabled = !isValid;
}

function attachFormListeners() {
  const inputs = ["name", "age", "size", "ownerId"];
  inputs.forEach((id) => {
    document.getElementById(id).addEventListener("input", validateFormFields);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getOwners();
  getPets();
});
