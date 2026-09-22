const api = "http://localhost:3001";
const cliente = JSON.parse(localStorage.getItem("cliente") || "null");
const idCliente = cliente?.id_cliente ?? cliente?.Id_cliente;
const nomeCliente = cliente?.nome_cliente ?? cliente?.Nome_cliente;

if (!cliente || !idCliente) {
  window.location.href = "./loginuser.html";
}

const titulo = document.querySelector("#titulo");
const logoutButton = document.querySelector("#logout");
const formulario = document.querySelector("#veiculoForm");
const botao = document.querySelector("#cadastrarVeiculo");
const mensagem = document.querySelector("#mensagem");

titulo.textContent = `Olá, ${nomeCliente || "cliente"}`;

// Encerra a sessão do cliente.
logoutButton.addEventListener("click", () => {
	localStorage.removeItem("cliente");
  window.location.href = "./loginuser.html";
});

// Cadastra um veículo vinculado ao cliente autenticado.
formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  const dados = new FormData(formulario);
  const veiculo = {
    placa: dados.get("placa").trim().toUpperCase(),
    marca: dados.get("marca").trim(),
    modelo: dados.get("modelo").trim(),
    ano: Number(dados.get("ano")),
    cor: dados.get("cor").trim(),
    idCliente,
  };

  botao.disabled = true;
  mensagem.textContent = "Cadastrando veículo...";
  mensagem.className = "carregando";

  try {
    const resposta = await fetch(`${api}/veiculos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(veiculo),
    });

    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      mensagem.textContent = resultado.mensagem || "Não foi possível cadastrar o veículo.";
      mensagem.className = "erro";
      return;
    }

    mensagem.textContent = "Veículo cadastrado com sucesso.";
    mensagem.className = "sucesso";
    formulario.reset();
  } catch {
    mensagem.textContent = "Não foi possível conectar ao servidor.";
    mensagem.className = "erro";
  } finally {
    botao.disabled = false;
  }
});
