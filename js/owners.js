const API_URL = "http://localhost:3000/owners";

let editingOwnerId = null;
let ownerIdToDelete = null;

async function getOwners() {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error("Erro ao buscar tutores");

    const owners = await response.json();
    renderOwnersTable(owners);
  } catch (error) {
    console.error(error);
  }
}

function renderOwnersTable(owners) {
  const tbody = document.getElementById("owners-table-body");
  tbody.innerHTML = "";

  owners.forEach((owner) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${owner.name}</td>
      <td>${owner.phone}</td>
      <td>${owner.address}</td>
      <td>${owner.notes}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary " title="Editar" onclick="editOwner('${owner.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger ms-2" title="Excluir" onclick="prepareDeleteOwner('${owner.id}')" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getOwners();
});

async function createOrUpdateOwner(event) {
  event.preventDefault();

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
    } else {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownerData),
      });

      if (!response.ok) throw new Error("Erro ao adicionar tutor");

      showToast("toastAdded");
    }

    document.querySelector("form").reset();
    document.getElementById("submit-button").textContent = "Confirmar";
    editingOwnerId = null;
    getOwners();
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
