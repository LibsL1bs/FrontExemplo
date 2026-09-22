const api = "http://localhost:3001";

// Mantém compatibilidade com a antiga tela de cadastro.
document.querySelector("#enviar").addEventListener("click", async () => {
  const nome = document.querySelector("#nome").value.trim();
  const senha = document.querySelector("#senha").value.trim();
  const confirmacao = document.querySelector("#Csenha").value.trim();

  if (!nome || !senha || senha !== confirmacao) {
    return alert("Preencha os campos e confirme a senha.");
  }

  const resposta = await fetch(`${api}/funcionarios`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome, senha }),
  });

  if (resposta.status !== 201) return alert("Não foi possível cadastrar.");
  window.location.href = "./login-funcionario.html";
});
