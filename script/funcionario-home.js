const urlApi = "http://localhost:3001";
const func = JSON.parse(localStorage.getItem("funcionario") || "null");

if (!func?.func_id) {
  window.location.href = "./login-funcionario.html";
}

const selCar = document.querySelector("#selCar");
const lstCli = document.querySelector("#lstCli");
const lstCar = document.querySelector("#lstCar");
const tabMan = document.querySelector("#tabMan");
const resumo = document.querySelector("#resumo");
const msg = document.querySelector("#msg");
const form = document.querySelector("#formMan");
const titForm = document.querySelector("#titForm");
const btnMan = document.querySelector("#btnMan");
const cancMan = document.querySelector("#cancMan");
let clientes = [];
let carros = [];
let mants = [];
let cliSel = null;
let carSel = null;
let manSel = null;

function foiConcluida(valor) {
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

document.querySelector("#boasVindas").textContent = `Olá, ${func.nome_func || "funcionário"}`;

document.querySelector("#sair").addEventListener("click", () => {
  localStorage.removeItem("funcionario");
  window.location.href = "./login-funcionario.html";
});

function dataBr(data) {
  if (!data) return "Não informada";
  const texto = String(data).split(/[T ]/)[0];
  const partes = texto.split("-");
  if (partes.length !== 3) return "Não informada";
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function dataCampo(data) {
  return data ? String(data).split(/[T ]/)[0] : "";
}

function montarSel(select, itens, textoVazio, valor, texto) {
  select.innerHTML = itens.length
    ? itens.map((item) => `<option value="${escapar(item[valor])}">${escapar(item[texto])}</option>`).join("")
    : `<option value="">${textoVazio}</option>`;
}

function mostrarMants() {
  const itens = mants.filter((manutencao) => Number(manutencao.id_ver) === Number(carSel));
  return itens.length
    ? `<table class="tab-man">
        <thead><tr><th>Serviço</th><th>Situação</th><th>Entrada</th><th>Valor</th></tr></thead>
        <tbody>${itens.map((manutencao) => `
          <tr class="linha-man" data-man="${escapar(manutencao.id_manu)}" tabindex="0">
            <td><strong>${escapar(manutencao.descri_manu)}</strong><span>${escapar(manutencao.tipo_manu)}</span></td>
            <td>${escapar(manutencao.situa_manu)}</td>
            <td>${dataBr(manutencao.data_manu)}</td>
            <td>R$ ${Number(manutencao.valor_manu).toFixed(2).replace(".", ",")}</td>
          </tr>`).join("")}</tbody>
      </table>`
    : '<p class="vazio">Nenhuma manutenção para este carro.</p>';
}

function mostrarClis() {
  lstCli.innerHTML = clientes.length
    ? clientes.map((cliente) => {
      const selecionado = Number(cliente.id_cliente) === Number(cliSel);
      return `<button class="item${selecionado ? " sel" : ""}" type="button" data-cli="${escapar(cliente.id_cliente)}">
        <strong>${escapar(cliente.nome_cliente)}</strong>
        <span>CPF ${escapar(cliente.cpf_cliente)}</span>
      </button>`;
    }).join("")
    : '<p class="vazio">Nenhum cliente cadastrado.</p>';

  resumo.textContent = `${clientes.length} cliente(s) · ${carros.length} carro(s) · ${mants.length} manutenção(ões)`;
}

function mostrarCars() {
  const lista = carros.filter((carro) => Number(carro.id_cliente) === Number(cliSel));
  lstCar.innerHTML = lista.length
    ? lista.map((carro) => `
      <button class="item${Number(carro.id_ver) === Number(carSel) ? " sel" : ""}" type="button" data-car="${escapar(carro.id_ver)}">
        <strong>${escapar(carro.marca_vei)} ${escapar(carro.modelo_vei)}</strong>
        <span>${escapar(carro.placa_vei)} · ${escapar(carro.ano_vei)} · ${escapar(carro.cor_vei)}</span>
      </button>`).join("")
    : '<p class="vazio">Este cliente não possui carros.</p>';
}

function mostrarTabMan() {
  tabMan.innerHTML = carSel ? mostrarMants() : '<p class="vazio">Selecione um carro.</p>';
}

lstCli.addEventListener("click", (evento) => {
  const item = evento.target.closest("[data-cli]");
  if (!item) return;
  cliSel = item.dataset.cli;
  carSel = null;
  mostrarClis();
  mostrarCars();
  mostrarTabMan();
});

lstCar.addEventListener("click", (evento) => {
  const item = evento.target.closest("[data-car]");
  if (!item) return;
  carSel = item.dataset.car;
  mostrarCars();
  mostrarTabMan();
});

function editarMan(id) {
  const manutencao = mants.find((item) => Number(item.id_manu) === Number(id));
  if (!manutencao) return;

  manSel = manutencao.id_manu;
  selCar.value = manutencao.id_ver;
  document.querySelector("#dtEnt").value = dataCampo(manutencao.data_manu);
  document.querySelector("#descMan").value = manutencao.descri_manu || "";
  document.querySelector("#tipoMan").value = manutencao.tipo_manu || "";
  document.querySelector("#sitMan").value = manutencao.situa_manu || "aguardando";
  document.querySelector("#vlrMan").value = manutencao.valor_manu ?? "";
  document.querySelector("#dtSai").value = dataCampo(manutencao.datentreg_manu);
  titForm.textContent = "Editar manutenção";
  btnMan.textContent = "Salvar alteração";
  cancMan.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

tabMan.addEventListener("click", (evento) => {
  const item = evento.target.closest("[data-man]");
  if (item) editarMan(item.dataset.man);
});

tabMan.addEventListener("keydown", (evento) => {
  if (evento.key !== "Enter" && evento.key !== " ") return;
  const item = evento.target.closest("[data-man]");
  if (!item) return;
  evento.preventDefault();
  editarMan(item.dataset.man);
});

function cancelarEdicao() {
  manSel = null;
  form.reset();
  titForm.textContent = "Registrar manutenção";
  btnMan.textContent = "Registrar manutenção";
  cancMan.hidden = true;
}

cancMan.addEventListener("click", cancelarEdicao);

function atualizarCars() {
  montarSel(selCar, carros, "Nenhum veículo cadastrado", "id_ver", "placa_vei");
}

async function carregar() {
  try {
    const respostas = await Promise.all([
      fetch(`${urlApi}/clientes`),
      fetch(`${urlApi}/veiculos`),
      fetch(`${urlApi}/manutencoes`),
    ]);
    if (respostas.some((resposta) => !resposta.ok)) throw new Error("Falha ao consultar a API.");

    [clientes, carros, mants] = await Promise.all(respostas.map((resposta) => resposta.json()));
    atualizarCars();
    mostrarClis();
    mostrarCars();
    mostrarTabMan();
  } catch (erro) {
    msg.textContent = erro.message;
    msg.className = "erro";
  }
}

document.querySelector("#formMan").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const situacao = document.querySelector("#sitMan").value;
  const dataEntrega = document.querySelector("#dtSai").value || null;

  if (foiConcluida(situacao) && !dataEntrega) {
    msg.textContent = "Informe a data de entrega para uma manutenção concluída.";
    msg.className = "erro";
    return;
  }

  const dados = {
    data: document.querySelector("#dtEnt").value,
    descricao: document.querySelector("#descMan").value.trim(),
    tipo: document.querySelector("#tipoMan").value.trim(),
    situacao,
    dataEntrega,
    valor: Number(document.querySelector("#vlrMan").value),
    idVeiculo: Number(selCar.value),
  };

  try {
    const rota = manSel ? `${urlApi}/manutencoes/${manSel}` : `${urlApi}/manutencoes`;
    const resposta = await fetch(rota, {
      method: manSel ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(resultado.mensagem || "Não foi possível registrar a manutenção.");
    msg.textContent = "Manutenção registrada com sucesso.";
    msg.className = "sucesso";
    cancelarEdicao();
    await carregar();
  } catch (erro) {
    msg.textContent = erro.message;
    msg.className = "erro";
  }
});

carregar();
