const api = "http://localhost:3001";

// Autentica o funcionário e guarda seus dados para a área restrita.
document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const botao = document.querySelector("#entrar");
  const nome = document.querySelector("#nome_func").value.trim();
  const senha = document.querySelector("#senha_func").value;

  botao.disabled = true;

  try {
    const resposta = await fetch(`${api}/funcionarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha }),
    });

    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      alert(resultado.mensagem || "Nome ou senha incorretos.");
      return;
    }

    localStorage.setItem("funcionario", JSON.stringify(resultado));
    window.location.href = "./funcionario-home.html";
  } catch {
    alert("Não foi possível conectar ao servidor.");
  } finally {
    botao.disabled = false;
  }
});
