const urlApi = "http://localhost:3001";
const cli = JSON.parse(localStorage.getItem("cliente") || "null");
const idCli = cli?.id_cliente ?? cli?.Id_cliente;
const nomeCli = cli?.nome_cliente ?? cli?.Nome_cliente;

if (!cli || !idCli) {
  window.location.href = "./loginuser.html";
}

const titulo = document.querySelector("#titulo");
const sair = document.querySelector("#sair");
const form = document.querySelector("#formCar");
const btn = document.querySelector("#cadastrarCar");
const msg = document.querySelector("#msg");
const lstCar = document.querySelector("#lstCar");
const totalCar = document.querySelector("#totalCar");

titulo.textContent = `Olá, ${nomeCli || "cliente"}`;

function escapar(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarCars(lista) {
  totalCar.textContent = `${lista.length} veículo(s)`;
  lstCar.innerHTML = lista.length
    ? lista.map((carro) => `
      <article class="item-car">
        <div>
          <strong>${escapar(carro.marca_vei)} ${escapar(carro.modelo_vei)}</strong>
          <span>${escapar(carro.placa_vei)} · ${escapar(carro.ano_vei)}</span>
        </div>
        <span class="cor-car">${escapar(carro.cor_vei)}</span>
      </article>`).join("")
    : '<p class="vazio">Você ainda não possui veículos cadastrados.</p>';
}

async function carregarCars() {
  try {
    const resposta = await fetch(`${urlApi}/veiculos?clienteId=${encodeURIComponent(idCli)}`);
    if (!resposta.ok) throw new Error("Não foi possível carregar seus veículos.");
    mostrarCars(await resposta.json());
  } catch (erro) {
    totalCar.textContent = "Não disponível";
    lstCar.innerHTML = `<p class="vazio erro">${escapar(erro.message)}</p>`;
  }
}

sair.addEventListener("click", () => {
	localStorage.removeItem("cliente");
  window.location.href = "./loginuser.html";
});

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const dados = new FormData(form);
  const veiculo = {
    placa: dados.get("placa").trim().toUpperCase(),
    marca: dados.get("marca").trim(),
    modelo: dados.get("modelo").trim(),
    ano: Number(dados.get("ano")),
    cor: dados.get("cor").trim(),
    idCliente: idCli,
  };

  btn.disabled = true;
  msg.textContent = "Cadastrando veículo...";
  msg.className = "carregando";

  try {
    const resposta = await fetch(`${urlApi}/veiculos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(veiculo),
    });

    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      msg.textContent = resultado.mensagem || "Não foi possível cadastrar o veículo.";
      msg.className = "erro";
      return;
    }

    msg.textContent = "Veículo cadastrado com sucesso.";
    msg.className = "sucesso";
    form.reset();
    await carregarCars();
  } catch {
    msg.textContent = "Não foi possível conectar ao servidor.";
    msg.className = "erro";
  } finally {
    btn.disabled = false;
  }
});

carregarCars();
