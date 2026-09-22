const api = "http://localhost:3001";

const nome = document.querySelector("#nome_cliente");
const cpf = document.querySelector("#cpf_cliente");
const telefone = document.querySelector("#telefone_cliente");
const endereco = document.querySelector("#endereco_cliente");
const senha = document.querySelector("#senha_cliente");
const confirmar = document.querySelector("#confirmar_senha");
const botao = document.querySelector("#cadastrar");

function somenteNumeros(valor) {
  return valor.replace(/\D/g, "");
}

// Valida e envia o cadastro do cliente.
botao.addEventListener("click", async () => {
  const nomeCliente = nome.value.trim();
  const cpfCliente = somenteNumeros(cpf.value);
  const senhaCliente = senha.value.trim();
  const confirmarSenha = confirmar.value.trim();

  if (!nomeCliente || !cpfCliente || !senhaCliente || !confirmarSenha) {
    return alert("Preencha todos os campos.");
  }

  if (senhaCliente !== confirmarSenha) {
    return alert("As senhas precisam ser iguais.");
  }

  try {
    const resposta = await fetch(`${api}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeCliente,
        cpf: cpfCliente,
        telefone: telefone.value.trim(),
        endereco: endereco.value.trim(),
        senha: senhaCliente,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      return alert(erro.mensagem || "Erro ao cadastrar cliente.");
    }

    alert("Cadastro realizado com sucesso!");
    window.location.href = "./loginuser.html";
  } catch {
    alert("Não foi possível conectar ao servidor. Verifique se a API está rodando na porta 3001.");
  }
});
