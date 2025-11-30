const API = "http://localhost:3000/";
const API_URL = `${API}appointments`;
const API_OWNERS = `${API}owners`;
const API_PETS = `${API}pets`;
const API_CARETAKERS = `${API}caretakers`;

let editingAppointmentId = null;
let appointmentIdToDelete = null;

let isFormVisible = false;
const tableWrapper = document.getElementById("appointments-table-card");
const formWrapper = document.getElementById("appointment-form-card");
const tableContainer = document.getElementById("appointments-table-container");

let owners = [];
let pets = [];
let caretakers = [];

/* =========================
   CARREGAR LISTAS BASE
   ========================= */

async function getAppointments() {
  const loading = document.getElementById("loading-indicator");
  const innerWrapper = document.getElementById("appointments-table-wrapper");

  document
    .getElementById("appointments-table-card")
    .classList.remove("d-none", "fade");
  innerWrapper.classList.remove("show");
  innerWrapper.classList.add("d-none");
  loading.classList.remove("d-none");

  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Erro ao buscar agendamentos");

    const appointments = await response.json();

    setTimeout(() => {
      renderAppointmentsTable(appointments);

      loading.classList.add("d-none");
      innerWrapper.classList.remove("d-none");
      setTimeout(() => {
        innerWrapper.classList.add("show");
      }, 10);
    }, 1000);
  } catch (error) {
    alert("Erro ao carregar agendamentos");

    loading.classList.add("d-none");
    innerWrapper.classList.remove("d-none");
    innerWrapper.classList.add("show");
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

async function getPetsBase() {
  try {
    const response = await fetch(`${API_PETS}`);
    if (!response.ok) throw new Error("Erro ao buscar pets");

    pets = await response.json();
    return pets;
  } catch (error) {
    alert("Erro ao carregar pets");
    return [];
  }
}

async function getCaretakers() {
  try {
    const response = await fetch(`${API_CARETAKERS}`);
    if (!response.ok) throw new Error("Erro ao buscar cuidadores");

    caretakers = await response.json();
    return caretakers;
  } catch (error) {
    alert("Erro ao carregar cuidadores");
    return [];
  }
}

/* =========================
   POPULAR SELECTS
   ========================= */

async function populateOwnerSelect() {
  const select = document.getElementById("ownerId");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione</option>';

  if (!owners.length) {
    await getOwners();
  }

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

async function populatePetSelect() {
  const select = document.getElementById("petId");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione</option>';

  if (!pets.length) {
    await getPetsBase();
  }

  if (pets.length === 0) {
    select.innerHTML = '<option value="">Nenhum pet cadastrado</option>';
    return;
  }

  pets.forEach((pet) => {
    const option = document.createElement("option");
    option.value = pet.id;
    option.textContent = pet.name;
    select.appendChild(option);
  });
}

async function populateCaretakerSelect() {
  const select = document.getElementById("caretakerId");
  if (!select) return;

  select.innerHTML = '<option value="">Selecione</option>';

  if (!caretakers.length) {
    await getCaretakers();
  }

  if (caretakers.length === 0) {
    select.innerHTML = '<option value="">Nenhum cuidador cadastrado</option>';
    return;
  }

  caretakers.forEach((caretaker) => {
    const option = document.createElement("option");
    option.value = caretaker.id;
    option.textContent = caretaker.name;
    select.appendChild(option);
  });
}

/* =========================
   FORM: SHOW / HIDE
   ========================= */

function showAppointmentForm() {
  const tableCard = document.getElementById("appointments-table-card");
  tableCard.classList.remove("show");
  setTimeout(() => {
    tableCard.classList.add("d-none");

    const formCard = document.getElementById("appointment-form-card");
    formCard.classList.remove("d-none");
    setTimeout(() => {
      formCard.classList.add("show");
    }, 10);
  }, 200);

  isFormVisible = true;

  attachFormListeners();
  validateFormFields();

  populateOwnerSelect();
  populatePetSelect();
  populateCaretakerSelect();
}

function hideAppointmentForm() {
  if (document.activeElement) {
    document.activeElement.blur();
  }

  document.getElementById("ownerId").value = "";
  document.getElementById("petId").value = "";
  document.getElementById("caretakerId").value = "";
  document.getElementById("date").value = "";
  document.getElementById("status").value = "scheduled";
  document.getElementById("location").value = "";
  document.getElementById("price").value = "";
  document.getElementById("notes").value = "";

  const inputs = document.querySelectorAll(
    "#appointment-form-card .form-control, #appointment-form-card .form-select"
  );
  inputs.forEach((input) => {
    input.classList.remove("is-valid", "is-invalid");
  });

  document.getElementById("submit-button").textContent = "Confirmar";
  document.getElementById("submit-button").disabled = false;

  formWrapper.classList.remove("show");

  setTimeout(() => {
    formWrapper.classList.add("d-none");

    const scrollY = window.scrollY;

    getAppointments();

    window.scrollTo(0, scrollY);
  }, 200);

  isFormVisible = false;
}

/* =========================
   TABELA
   ========================= */

function finInfoOwner(idOwner, info) {
  const o = owners.find((o) => o.id === idOwner);
  return o ? o[info] : " - ";
}

function finInfoPet(idPet, info) {
  const p = pets.find((p) => p.id === idPet);
  return p ? p[info] : " - ";
}

function finInfoCaretaker(idCaretaker, info) {
  const c = caretakers.find((c) => c.id === idCaretaker);
  return c ? c[info] : " - ";
}

function translateStatus(status) {
  switch (status) {
    case "scheduled":
      return "Agendado";
    case "completed":
      return "Concluído";
    case "cancelled":
      return "Cancelado";
    default:
      return status || " - ";
  }
}

function renderAppointmentsTable(appointments) {
  const wrapper = document.getElementById("appointments-table-wrapper");
  const container = document.getElementById("appointments-table-container");

  if (appointments.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-emoji-frown display-4 text-warning mb-3"></i>
        <h5>Ops! Ainda não temos agendamentos cadastrados.</h5>
        <p class="mb-0">Adicione o primeiro clicando no botão acima.</p>
      </div>
    `;

    wrapper.classList.remove("d-none");
    setTimeout(() => wrapper.classList.add("show"), 10);
    return;
  }

  const tableHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Data</th>
            <th>Tutor</th>
            <th>Pet</th>
            <th>Cuidador</th>
            <th>Status</th>
            <th>Local</th>
            <th>Preço (R$)</th>
            <th>Observações</th>
            <th class="text-end"></th>
          </tr>
        </thead>
        <tbody>
          ${appointments
            .map((appt) => {
              const ownerName =
                appt.ownerName || finInfoOwner(appt.ownerId, "name");
              const petName = appt.petName || finInfoPet(appt.petId, "name");
              const caretakerName =
                appt.caretakerName ||
                finInfoCaretaker(appt.caretakerId, "name");

              const statusLabel = translateStatus(appt.status);

              const price =
                typeof appt.price === "number"
                  ? appt.price.toFixed(2).replace(".", ",")
                  : "-";

              const dateStr = appt.date
                ? new Date(appt.date).toLocaleDateString("pt-BR")
                : " - ";

              return `
                <tr>
                  <td>${dateStr}</td>
                  <td>${ownerName || " - "}</td>
                  <td>${petName || " - "}</td>
                  <td>${caretakerName || " - "}</td>
                  <td>${statusLabel}</td>
                  <td>${appt.location || " - "}</td>
                  <td>${price}</td>
                  <td>${appt.notes ? appt.notes : " - "}</td>
                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      title="Editar"
                      onclick="editAppointment('${appt.id}')"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
  class="btn btn-sm btn-outline-danger ms-2"
  title="Excluir"
  onclick="prepareDeleteAppointment('${appt.id}')"
  data-bs-toggle="modal"
  data-bs-target="#deleteConfirmModal"
>
  <i class="bi bi-trash"></i>
</button>

                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
  wrapper.classList.remove("d-none");
  setTimeout(() => wrapper.classList.add("show"), 10);
}

/* =========================
   VALIDAÇÃO
   ========================= */

function validateFormFieldsInfo() {
  const fields = [
    { id: "ownerId", min: 1 },
    { id: "petId", min: 1 },
    { id: "caretakerId", min: 1 },
    { id: "date", min: 1 },
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

function validateFormFields() {
  const ownerId = document.getElementById("ownerId").value.trim();
  const petId = document.getElementById("petId").value.trim();
  const caretakerId = document.getElementById("caretakerId").value.trim();
  const date = document.getElementById("date").value.trim();
  const status = document.getElementById("status").value.trim();

  const isValid = ownerId && petId && caretakerId && date && status;
  document.getElementById("submit-button").disabled = !isValid;
}

function attachFormListeners() {
  const inputs = [
    "ownerId",
    "petId",
    "caretakerId",
    "date",
    "status",
    "location",
    "price",
    "notes",
  ];

  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", validateFormFields);
    el.addEventListener("change", validateFormFields);
  });
}

/* =========================
   CREATE / UPDATE
   ========================= */

async function createOrUpdateAppointment(event) {
  event.preventDefault();

  if (!validateFormFieldsInfo()) return;

  const ownerId = document.getElementById("ownerId").value.trim();
  const petId = document.getElementById("petId").value.trim();
  const caretakerId = document.getElementById("caretakerId").value.trim();
  const date = document.getElementById("date").value;
  const status = document.getElementById("status").value;
  const location = document.getElementById("location").value.trim();
  const priceValue = Number(document.getElementById("price").value);
  const notes = document.getElementById("notes").value.trim();

  const ownerName = finInfoOwner(ownerId, "name") || "";
  const petName = finInfoPet(petId, "name") || "";
  const caretakerName = finInfoCaretaker(caretakerId, "name") || "";

  const now = new Date().toISOString();

  const appointmentBase = {
    ownerId,
    ownerName,
    petId,
    petName,
    caretakerId,
    caretakerName,
    date,
    status,
    notes,
    location,
    price: Number.isFinite(priceValue) ? priceValue : 0,
  };

  try {
    if (editingAppointmentId) {
      const response = await fetch(`${API_URL}/${editingAppointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...appointmentBase,
          updatedAt: now,
        }),
      });

      if (!response.ok) throw new Error("Erro ao editar agendamento");

      showToast("toastUpdated");
      editingAppointmentId = null;
    } else {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...appointmentBase,
          createdAt: now,
          updatedAt: now,
        }),
      });

      if (!response.ok) throw new Error("Erro ao adicionar agendamento");

      showToast("toastAdded");
    }

    hideAppointmentForm();
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar agendamento");
  }
}

/* =========================
   EDITAR / EXCLUIR
   ========================= */

async function editAppointment(id) {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Erro ao buscar agendamentos");

    const appointments = await response.json();
    const appt = appointments.find((a) => a.id === id);

    if (!appt) return alert("Agendamento não encontrado");

    showAppointmentForm();

    setTimeout(() => {
      document.getElementById("ownerId").value = appt.ownerId || "";
      document.getElementById("petId").value = appt.petId || "";
      document.getElementById("caretakerId").value = appt.caretakerId || "";
      document.getElementById("date").value = appt.date || "";
      document.getElementById("status").value = appt.status || "scheduled";
      document.getElementById("location").value = appt.location || "";
      document.getElementById("price").value =
        typeof appt.price === "number" ? appt.price : "";
      document.getElementById("notes").value = appt.notes || "";

      editingAppointmentId = id;
      document.getElementById("submit-button").textContent =
        "Salvar alterações";
      validateFormFields();
    }, 200);
  } catch (error) {
    console.error("Erro ao carregar agendamento para edição:", error);
  }
}

function prepareDeleteAppointment(id) {
  appointmentIdToDelete = id;
}

async function confirmDeleteAppointment() {
  if (!appointmentIdToDelete) return;

  try {
    const response = await fetch(`${API_URL}/${appointmentIdToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir agendamento");

    showToast("toastDeleted");
    getAppointments();

    appointmentIdToDelete = null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    modal.hide();
  } catch (error) {
    alert("Erro ao excluir agendamento");
  }
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  getOwners();
  getPetsBase();
  getCaretakers();
  getAppointments();
});
