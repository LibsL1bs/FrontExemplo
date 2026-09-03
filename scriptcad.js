const api = "http://localhost:3000";

// Mantém compatibilidade com a antiga tela de cadastro.
document.querySelector("#enviar").addEventListener("click", async () => {
  const nome_prof = document.querySelector("#nome").value.trim();
  const senha_prof = document.querySelector("#senha").value.trim();
  const confirmacao = document.querySelector("#Csenha").value.trim();

  if (!nome_prof || !senha_prof || senha_prof !== confirmacao) {
    return alert("Preencha os campos e confirme a senha.");
  }

  const resposta = await fetch(`${api}/professor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome_prof, senha_prof }),
  });

  if (resposta.status !== 201) return alert("Não foi possível cadastrar.");
  window.location.href = "./login.html";
});
