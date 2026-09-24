const urlApi = "http://localhost:3001";

const form = document.querySelector("#loginCliente");
const btn = document.querySelector("#entrar");
const msg = document.querySelector("#mensagem");

function soNums(valor) {
  return valor.replace(/\D/g, "");
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const nome = document.querySelector("#nome_cliente").value.trim();
  const cpf = soNums(document.querySelector("#cpf_cliente").value);
  const senha = document.querySelector("#senha_cliente").value;

  msg.textContent = "Entrando...";
  msg.className = "carregando";
  btn.disabled = true;

  try {
    const resposta = await fetch(`${urlApi}/clientes/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cpf, senha }),
    });

    if (!resposta.ok) {
      msg.textContent = "Nome, CPF ou senha incorretos.";
      msg.className = "erro";
      return;
    }

    const cliente = await resposta.json();
    localStorage.setItem("cliente", JSON.stringify(cliente));
    msg.textContent = `Cadastro encontrado, ${cliente.nome_cliente}.`;
    msg.className = "sucesso";
    window.location.href = "./homeuser.html";
  } catch {
    msg.textContent = "Não foi possível conectar ao servidor.";
    msg.className = "erro";
  } finally {
    btn.disabled = false;
  }
});
