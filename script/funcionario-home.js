const api = "http://localhost:3001";
const funcionario = JSON.parse(localStorage.getItem("funcionario") || "null");

if (!funcionario?.func_id) {
  window.location.href = "./login-funcionario.html";
}

const $ = (seletor) => document.querySelector(seletor);
const clientesSelect = $("#clienteConsulta");
const veiculoHistoricoSelect = $("#veiculoHistorico");
const veiculoManutencaoSelect = $("#veiculoManutencao");
const listaVeiculos = $("#listaVeiculos");
const listaHistorico = $("#listaHistorico");
const mensagem = $("#mensagem");
let clientes = [];
let veiculos = [];
let manutencoes = [];

function situacaoConcluida(valor) {
  return valor.trim().toLowerCase().startsWith("conclu");
}

function escapar(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("#bemVindo").textContent = `Olá, ${funcionario.nome_func || "funcionário"}`;

$("#logout").addEventListener("click", () => {
  localStorage.removeItem("funcionario");
  window.location.href = "./login-funcionario.html";
});

function dataBr(data) {
  if (!data) return "Não informada";
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function preencherSelect(select, itens, textoVazio, valor, texto) {
  select.innerHTML = itens.length
    ? itens.map((item) => `<option value="${escapar(item[valor])}">${escapar(item[texto])}</option>`).join("")
    : `<option value="">${textoVazio}</option>`;
}

function renderizarVeiculos() {
  const clienteId = Number(clientesSelect.value);
  const itens = veiculos.filter((veiculo) => Number(veiculo.id_cliente) === clienteId);
  listaVeiculos.innerHTML = itens.length
    ? itens.map((veiculo) => `
      <article class="item-card">
        <h3>${escapar(veiculo.marca_vei)} ${escapar(veiculo.modelo_vei)}</h3>
        <p><strong>Placa:</strong> ${escapar(veiculo.placa_vei)} | <strong>Ano:</strong> ${escapar(veiculo.ano_vei)}</p>
        <p><strong>Cor:</strong> ${escapar(veiculo.cor_vei)}</p>
      </article>`).join("")
    : '<p class="empty-state">Este cliente não possui veículos cadastrados.</p>';
}

function renderizarHistorico() {
  const veiculoId = Number(veiculoHistoricoSelect.value);
  const itens = manutencoes.filter((manutencao) => Number(manutencao.id_ver) === veiculoId);
  listaHistorico.innerHTML = itens.length
    ? itens.map((manutencao) => `
      <article class="item-card">
        <h3>${escapar(manutencao.descri_manu)}</h3>
        <p><strong>Entrada:</strong> ${dataBr(manutencao.data_manu)} | <strong>Entrega:</strong> ${dataBr(manutencao.datentreg_manu)}</p>
        <p><strong>Serviço:</strong> ${escapar(manutencao.tipo_manu)} | <strong>Situação:</strong> ${escapar(manutencao.situa_manu)}</p>
        <p><strong>Valor:</strong> R$ ${Number(manutencao.valor_manu).toFixed(2).replace(".", ",")}</p>
      </article>`).join("")
    : '<p class="empty-state">Nenhuma manutenção registrada para este veículo.</p>';
}

function atualizarVeiculosSelecionaveis() {
  preencherSelect(veiculoHistoricoSelect, veiculos, "Nenhum veículo cadastrado", "id_ver", "placa_vei");
  preencherSelect(veiculoManutencaoSelect, veiculos, "Nenhum veículo cadastrado", "id_ver", "placa_vei");
  renderizarHistorico();
}

async function carregarDados() {
  try {
    const respostas = await Promise.all([
      fetch(`${api}/clientes`),
      fetch(`${api}/veiculos`),
      fetch(`${api}/manutencoes`),
    ]);
    if (respostas.some((resposta) => !resposta.ok)) throw new Error("Falha ao consultar a API.");

    [clientes, veiculos, manutencoes] = await Promise.all(respostas.map((resposta) => resposta.json()));
    preencherSelect(clientesSelect, clientes, "Nenhum cliente cadastrado", "id_cliente", "nome_cliente");
    atualizarVeiculosSelecionaveis();
    renderizarVeiculos();
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = "erro";
  }
}

clientesSelect.addEventListener("change", renderizarVeiculos);
veiculoHistoricoSelect.addEventListener("change", renderizarHistorico);

$("#formManutencao").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const situacao = $("#situacaoManutencao").value;
  const dataEntrega = $("#dataEntrega").value || null;

  if (situacaoConcluida(situacao) && !dataEntrega) {
    mensagem.textContent = "Informe a data de entrega para uma manutenção concluída.";
    mensagem.className = "erro";
    return;
  }

  const dados = {
    data: $("#dataManutencao").value,
    descricao: $("#descricaoManutencao").value.trim(),
    tipo: $("#tipoManutencao").value.trim(),
    situacao,
    dataEntrega,
    valor: Number($("#valorManutencao").value),
    idVeiculo: Number(veiculoManutencaoSelect.value),
  };

  try {
    const resposta = await fetch(`${api}/manutencoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(resultado.mensagem || "Não foi possível registrar a manutenção.");
    mensagem.textContent = "Manutenção registrada com sucesso.";
    mensagem.className = "sucesso";
    $("#formManutencao").reset();
    await carregarDados();
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = "erro";
  }
});

carregarDados();
