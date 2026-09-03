const api = "http://localhost:3000";
const aluno = JSON.parse(localStorage.getItem("aluno") || "null");

if (!aluno || !aluno.aluno_id) window.location.href = "./loginuser.html";

const titulo = document.querySelector("#titulo");
const listaTreinos = document.querySelector("#listaTreinos");
const logoutButton = document.querySelector("#logout");

titulo.textContent = `Olá, ${aluno.nome_alu || "aluno"}`;

// Encerra a sessão do aluno.
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("aluno");
  window.location.href = "./loginuser.html";
});

// Busca e exibe apenas os treinos do aluno logado.
async function carregarTreinos() {
  try {
    const resposta = await fetch(`${api}/treinos?aluno_id=${aluno.aluno_id}`);
    if (!resposta.ok) throw new Error("Erro ao buscar treinos");

    const treinos = await resposta.json();

    if (!treinos.length) {
      listaTreinos.innerHTML =
        '<p class="empty">Nenhum treino cadastrado para você.</p>';
      return;
    }

    listaTreinos.innerHTML = treinos
      .map(
        (treino) => `
          <article class="treino ${treino.finalizado ? "finalizado" : ""}">
            <h3>${treino.nome_trei || "Treino"}</h3>
            <p><strong>Tipo:</strong> ${treino.tipo_trei || "-"}</p>
            <p><strong>Data:</strong> ${treino.data_trei ? new Date(treino.data_trei).toLocaleDateString("pt-BR") : "-"}</p>
            <p><strong>Observações:</strong> ${treino.observ_trei || "Sem observações"}</p>
            <button class="finalizar-btn" type="button" data-id="${treino.treino_id}">
              ${treino.finalizado ? "Finalizado" : "Marcar como finalizado"}
            </button>
          </article>
        `,
      )
      .join("");

    document.querySelectorAll(".finalizar-btn").forEach((botao) => {
      // Finaliza o treino no banco e avisa a área do professor.
      botao.addEventListener("click", async () => {
        const treinoId = Number(botao.dataset.id);
        const treinoAtual = treinos.find((item) => item.treino_id === treinoId);

        if (!treinoAtual) return;

        const resposta = await fetch(`${api}/treino/${treinoId}/finalizar`, {
          method: "PUT",
        });
        if (!resposta.ok) return alert("Não foi possível finalizar o treino.");

        treinoAtual.finalizado = true;
        botao.textContent = "Finalizado";
        botao.disabled = true;
        botao.closest(".treino").classList.add("finalizado");
        localStorage.setItem("treinosAtualizados", Date.now());
      });
    });
  } catch {
    listaTreinos.innerHTML =
      '<p class="empty">Não foi possível carregar os treinos.</p>';
  }
}

carregarTreinos();
// Atualiza a tela quando um novo treino é criado em outra aba.
window.addEventListener("storage", (event) => {
  if (event.key === "treinosAtualizados") carregarTreinos();
});
