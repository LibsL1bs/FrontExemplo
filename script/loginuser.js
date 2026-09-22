const api = "http://localhost:3001";

const formulario = document.querySelector("#loginCliente");
const botao = document.querySelector("#entrar");
const mensagem = document.querySelector("#mensagem");

function somenteNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function campo(cliente, ...nomes) {
  const chave = Object.keys(cliente).find((item) =>
    nomes.some((nome) => item.toLowerCase() === nome.toLowerCase()),
  );

  return chave ? cliente[chave] : "";
}

// Autentica o cliente pela rota de login da API.
formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.querySelector("#nome_cliente").value.trim();
  const cpf = somenteNumeros(document.querySelector("#cpf_cliente").value);
  const senha = document.querySelector("#senha_cliente").value;

  mensagem.textContent = "Entrando...";
  mensagem.className = "carregando";
  botao.disabled = true;

  try {
    const resposta = await fetch(`${api}/clientes/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cpf, senha }),
    });

    if (!resposta.ok) {
      mensagem.textContent = "Nome, CPF ou senha incorretos.";
      mensagem.className = "erro";
      return;
    }

    const cliente = await resposta.json();
    localStorage.setItem("cliente", JSON.stringify(cliente));
    mensagem.textContent = `Cadastro encontrado, ${campo(cliente, "Nome_cliente", "nome")}.`;
    mensagem.className = "sucesso";
    window.location.href = "./homeuser.html";
  } catch {
    mensagem.textContent = "Não foi possível conectar ao servidor.";
    mensagem.className = "erro";
  } finally {
    botao.disabled = false;
  }
});
