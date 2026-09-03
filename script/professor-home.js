const api = "http://localhost:3000";
const professorRaw = JSON.parse(localStorage.getItem("professor") || "null");
const professor = professorRaw
  ? {
      ...professorRaw,
      prof_id:
        professorRaw.prof_id ?? professorRaw.Prof_id ?? professorRaw.profId,
    }
  : null;

if (!professor || !professor.prof_id) window.location.href = "./login.html";

const $ = (selector) => document.querySelector(selector);
const storageTreinos = "professorTreinos";
const formAluno = $("#formAluno");
const formTreino = $("#formTreino");
const listaAlunos = $("#listaAlunos");
const listaTreinos = $("#listaTreinos");
const treinoAlunoSelect = $("#treinoAluno");
const addExercicioButton = $("#addExercicio");
const exerciciosTreino = $("#exerciciosTreino");
const logoutButton = $("#logout");
const tabButtons = document.querySelectorAll(".tab-button");
const listaNomesTreino = $("#listaNomesTreino");
const listaTiposTreino = $("#listaTiposTreino");
const listaObservacoesTreino = $("#listaObservacoesTreino");
const listaExercicios = $("#listaExercicios");
const listaSeries = $("#listaSeries");
const listaObservacoesExercicio = $("#listaObservacoesExercicio");
const bemVindo = $("#bemVindo");
let alunos = [];

const telefoneFormatado = (telefone = "") => {
  const numero = telefone.replace(/\D/g, "").slice(0, 11);
  if (numero.length < 11) return telefone || "Não informado";
  return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
};

bemVindo.textContent = `Olá prof. ${professor?.nome_prof || "Professor"}`;

const getTreinos = () =>
  JSON.parse(localStorage.getItem(storageTreinos) || "[]");
const saveTreinos = (treinos) =>
  localStorage.setItem(storageTreinos, JSON.stringify(treinos));

// Busca alunos, status e último treino para a aba de alunos.
async function carregarAlunos() {
  try {
    const [respostaAlunos, respostaProfessores] = await Promise.all([
      fetch(`${api}/alunos`),
      fetch(`${api}/professores`),
    ]);

    if (!respostaAlunos.ok || !respostaProfessores.ok)
      throw new Error("Erro ao buscar alunos");

    alunos = await respostaAlunos.json();
    const professores = await respostaProfessores.json();
    const mapaProfessores = new Map(
      professores.map((p) => [Number(p.prof_id), p.nome_prof]),
    );

    const options = alunos
      .map(
        (aluno) =>
          `<option value="${aluno.aluno_id}">${aluno.nome_alu}</option>`,
      )
      .join("");

    treinoAlunoSelect.innerHTML = `<option value="">Selecione o aluno</option>${options}`;

    if (!alunos.length) {
      listaAlunos.innerHTML =
        '<p class="empty-state">Nenhum aluno cadastrado ainda.</p>';
      return;
    }

    listaAlunos.innerHTML = alunos
      .map((aluno) => {
        const professorNome =
          aluno.nome_professor ||
          aluno.professor_nome ||
          mapaProfessores.get(Number(aluno.prof_id)) ||
          "Professor não vinculado";

        const status = aluno.status_aluno;
        const statusTexto =
          status === null ? "Sem treino" : status ? "Ativo" : "Inativo";
        const statusCor =
          status === null ? "#617371" : status ? "#1f8f5f" : "#b45b35";

        return `
          <div class="item-card">
            <h3>${aluno.nome_alu}</h3>
            <p><strong>Professor:</strong> ${professorNome}</p>
            <p><strong>Telefone:</strong> ${telefoneFormatado(aluno.tele_alu)}</p>
            <p><strong>Status:</strong> <span style="color:${statusCor}; font-weight:700;">${statusTexto}</span></p>
            <p><strong>Último treino:</strong> ${aluno.ultimo_treino || "Sem treino finalizado"}</p>
          </div>
        `;
      })
      .join("");
  } catch {
    listaAlunos.innerHTML =
      '<p class="empty-state">Não foi possível carregar os alunos do banco.</p>';
    treinoAlunoSelect.innerHTML = '<option value="">Selecione o aluno</option>';
  }
}

// Carrega sugestões de treinos e exercícios já cadastrados.
async function carregarOpcoesTreino() {
  try {
    const [treinosResposta, exerciciosResposta] = await Promise.all([
      fetch(`${api}/treinos?prof_id=${professor.prof_id}`),
      fetch(`${api}/exercicios`),
    ]);

    if (!treinosResposta.ok || !exerciciosResposta.ok)
      throw new Error("Erro ao buscar opções de treino");

    const treinos = await treinosResposta.json();
    const exercicios = await exerciciosResposta.json();

    const nomesTreino = [
      ...new Set(treinos.map((treino) => treino.nome_trei).filter(Boolean)),
    ];
    const tiposTreino = [
      ...new Set(treinos.map((treino) => treino.tipo_trei).filter(Boolean)),
    ];
    const observacoesTreino = [
      ...new Set(treinos.map((treino) => treino.observ_trei).filter(Boolean)),
    ];
    const nomesExercicios = [
      ...new Set(
        exercicios.map((exercicio) => exercicio.nome_exer).filter(Boolean),
      ),
    ];
    const seriesExercicios = [
      ...new Set(
        exercicios.map((exercicio) => exercicio.serie_exer).filter(Boolean),
      ),
    ];
    const observacoesExercicio = [
      ...new Set(
        exercicios.map((exercicio) => exercicio.observ_exer).filter(Boolean),
      ),
    ];

    listaNomesTreino.innerHTML = nomesTreino
      .map((valor) => `<option value="${valor}"></option>`)
      .join("");
    listaTiposTreino.innerHTML = tiposTreino
      .map((valor) => `<option value="${valor}"></option>`)
      .join("");
    listaObservacoesTreino.innerHTML = observacoesTreino
      .map((valor) => `<option value="${valor}"></option>`)
      .join("");
    listaExercicios.innerHTML = nomesExercicios
      .map((valor) => `<option value="${valor}"></option>`)
      .join("");
    listaSeries.innerHTML = seriesExercicios
      .map((valor) => `<option value="${valor}"></option>`)
      .join("");
    listaObservacoesExercicio.innerHTML = observacoesExercicio
      .map((valor) => `<option value="${valor}"></option>`)
      .join("");
  } catch {
    listaNomesTreino.innerHTML = "";
    listaTiposTreino.innerHTML = "";
    listaObservacoesTreino.innerHTML = "";
    listaExercicios.innerHTML = "";
    listaSeries.innerHTML = "";
    listaObservacoesExercicio.innerHTML = "";
  }
}

// Renderiza os treinos do professor e relaciona cada aluno ao seu nome.
async function renderTreinos() {
  const resposta = await fetch(`${api}/treinos?prof_id=${professor.prof_id}`);
  const locais = getTreinos();
  const treinos = resposta.ok
    ? (await resposta.json()).map((treino) => ({
        ...treino,
        ...(locais.find((local) => local.id === treino.treino_id) || {}),
        alunoId: treino.aluno_id,
        exercicios:
          locais.find((local) => local.id === treino.treino_id)?.exercicios ||
          [],
      }))
    : [];

  if (!treinos.length) {
    listaTreinos.innerHTML =
      '<p class="empty-state">Nenhum treino cadastrado ainda.</p>';
    return;
  }

  listaTreinos.innerHTML = treinos
    .map((treino) => {
      const exercicios = treino.exercicios
        .map(
          (exercicio) => `
            <li>
              <strong>${exercicio.nome}</strong> — ${exercicio.series} séries,
              ${exercicio.repeticoes} repetições,
              ${exercicio.carga || "carga não informada"}
              ${exercicio.observacao ? `- ${exercicio.observacao}` : ""}
            </li>
          `,
        )
        .join("");

      return `
        <div class="item-card">
          <h3>${treino.nome}</h3>
          <p><strong>Aluno:</strong> ${
            alunos.find(
              (aluno) => Number(aluno.aluno_id) === Number(treino.alunoId),
            )?.nome_alu || treino.alunoId
          }</p>
          <p><strong>Tipo:</strong> ${treino.tipo}</p>
          <p><strong>Data:</strong> ${treino.data}</p>
          <p><strong>Observações:</strong> ${treino.observacao || "Nenhuma"}</p>
          <ul>${exercicios}</ul>
        </div>
      `;
    })
    .join("");
}

// Cria uma linha editável de exercício para o formulário de treino.
function buildExerciseRow() {
  const row = document.createElement("div");
  row.className = "exercise-row";
  row.innerHTML = `
    <button type="button" class="remove-exercise" aria-label="Remover exercício">Remover</button>
    <div class="exercise-grid">
      <label>
        Exercício
        <input type="text" name="nomeExercicio" list="listaExercicios" placeholder="Ex: Supino" required />
      </label>
      <label>
        Séries
        <input type="text" name="seriesExercicio" list="listaSeries" placeholder="Ex: 4" required />
      </label>
      <label>
        Repetições
        <input type="text" name="repeticoesExercicio" placeholder="Ex: 10" required />
      </label>
      <label>
        Carga
        <input type="text" name="cargaExercicio" placeholder="Ex: 20kg" />
      </label>
    </div>
    <label>
      Observação do exercício
      <input type="text" name="obsExercicio" list="listaObservacoesExercicio" placeholder="Ex: lento e controlado" />
    </label>
  `;

  row
    .querySelector(".remove-exercise")
    .addEventListener("click", () => row.remove());
  return row;
}

// Adiciona uma nova linha de exercício ao formulário.
function adicionarLinhaExercicio() {
  exerciciosTreino.appendChild(buildExerciseRow());
}

// Cadastra o aluno vinculado ao professor logado.
formAluno.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = $("#nomeAluno").value.trim();
  const senha = $("#senhaAluno").value.trim();
  const telefone = $("#telefoneAluno").value.trim();

  if (!nome || !senha) {
    alert("Informe o nome e a senha do aluno.");
    return;
  }

  if (senha.length > 8) {
    alert("A senha deve ter no máximo 8 caracteres.");
    return;
  }

  try {
    const resposta = await fetch(`${api}/aluno`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_alu: nome,
        senha_alu: senha,
        tele_alu: telefone,
        prof_id: professor.prof_id,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao cadastrar aluno");
    }

    formAluno.reset();
    await carregarAlunos();
    alert("Aluno cadastrado com sucesso!");
  } catch (error) {
    alert(error.message);
  }
});

// Salva o treino no banco e mantém os detalhes dos exercícios localmente.
formTreino.addEventListener("submit", async (event) => {
  event.preventDefault();

  const alunoId = Number(treinoAlunoSelect.value);
  const nome = $("#nomeTreino").value.trim();
  const tipo = $("#tipoTreino").value.trim();
  const data = $("#dataTreino").value;
  const observacao = $("#observacaoTreino").value.trim();

  if (!alunoId || !nome || !tipo || !data) {
    alert("Preencha todos os campos do treino.");
    return;
  }

  const rows = [...document.querySelectorAll(".exercise-row")];
  const exercicios = rows
    .map((row) => {
      const nomeExercicio = row
        .querySelector('[name="nomeExercicio"]')
        .value.trim();
      const series = row.querySelector('[name="seriesExercicio"]').value.trim();
      const repeticoes = row
        .querySelector('[name="repeticoesExercicio"]')
        .value.trim();
      const carga = row.querySelector('[name="cargaExercicio"]').value.trim();
      const obsExercicio = row
        .querySelector('[name="obsExercicio"]')
        .value.trim();

      if (!nomeExercicio || !series || !repeticoes) return null;

      return {
        nome: nomeExercicio,
        series,
        repeticoes,
        carga: carga || "Não informado",
        observacao: obsExercicio || "",
      };
    })
    .filter(Boolean);

  if (!exercicios.length) {
    alert("Adicione pelo menos um exercício ao treino.");
    return;
  }

  try {
    const resposta = await fetch(`${api}/treino`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_trei: nome,
        tipo_trei: tipo,
        data_trei: data,
        observ_trei: observacao,
        aluno_id: alunoId,
        prof_id: professor.prof_id,
        exer_id: null,
      }),
    });

    if (!resposta.ok) throw new Error("Não foi possível salvar o treino.");

    const salvo = await resposta.json();
    saveTreinos([
      ...getTreinos(),
      {
        id: salvo.treino_id,
        alunoId,
        nome,
        tipo,
        data,
        observacao,
        exercicios,
      },
    ]);

    formTreino.reset();
    exerciciosTreino.innerHTML = "";
    adicionarLinhaExercicio();
    localStorage.setItem("treinosAtualizados", Date.now());
    await renderTreinos();
  } catch (error) {
    alert(error.message);
  }
});

// Encerra a sessão do professor.
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("professor");
  window.location.href = "./login.html";
});

// Alterna entre as abas de alunos e treinos.
for (const button of tabButtons) {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    document
      .querySelectorAll(".tab-button")
      .forEach((item) => item.classList.toggle("active", item === button));
    document
      .querySelectorAll(".tab-panel")
      .forEach((panel) =>
        panel.classList.toggle("active", panel.id === `${target}Tab`),
      );
  });
}

// Insere exercícios adicionais no treino.
addExercicioButton.addEventListener("click", adicionarLinhaExercicio);

// Inicializa data, formulário, alunos, opções e treinos.
async function inicializar() {
  $("#dataTreino").valueAsDate = new Date();
  adicionarLinhaExercicio();
  await Promise.all([carregarAlunos(), carregarOpcoesTreino()]);
  await renderTreinos();
}

inicializar();
window.addEventListener("storage", (event) => {
  if (event.key !== "treinosAtualizados") return;
  carregarAlunos();
  renderTreinos();
});
