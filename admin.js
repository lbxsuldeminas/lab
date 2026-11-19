
const SUPABASE_URL = "https://itruyxspmazgdyrelfgj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ExFd7aYrjxoUj_WEgsNpbA_ilPYCnGL";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const botaoEntrar = document.getElementById("entrar");
const botaoSair = document.getElementById("sair");
const mensagem = document.getElementById("mensagem");

const login = document.getElementById("login");
const painel = document.getElementById("painel");

async function verificarSessao() {
  const token = localStorage.getItem("lbx_token");

  const resposta = await fetch(
    `${SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token || SUPABASE_KEY}`
      }
    }
  );

  if (resposta.ok) {
    const usuario = await resposta.json();

    if (usuario.app_metadata?.role === "admin") {
      login.hidden = true;
      painel.hidden = false;
      return;
    }
  }

  localStorage.removeItem("lbx_token");
  login.hidden = false;
  painel.hidden = true;
}
 
botaoEntrar.addEventListener("click", async () => {
  mensagem.textContent = "Verificando acesso...";
  botaoEntrar.disabled = true;

  try {
    const resposta = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY
        },
        body: JSON.stringify({
          email: email.value.trim(),
          password: senha.value
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.msg || dados.message || "E-mail ou senha incorretos."
      );
    }

    localStorage.setItem("lbx_token", dados.access_token);

    mensagem.textContent = "";
    senha.value = "";

    await verificarSessao();

  } catch (erro) {
    mensagem.textContent = erro.message;
  } finally {
    botaoEntrar.disabled = false;
  }
});

botaoSair.addEventListener("click", async () => {
  const token = localStorage.getItem("lbx_token");

  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  localStorage.removeItem("lbx_token");

  login.hidden = false;
  painel.hidden = true;
});

verificarSessao();

document.getElementById("cadastrarEvento").addEventListener("click", async () => {
  const nome = document.getElementById("nomeEvento").value.trim();
  const data = document.getElementById("dataEvento").value;
  const local = document.getElementById("localEvento").value.trim();
  const mensagem = document.getElementById("mensagemEvento");

  if (!nome) {
    mensagem.textContent = "Informe o nome do evento.";
    return;
  }

  const token = localStorage.getItem("lbx_token");

  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      name: nome,
      event_date: data || null,
      location: local || null
    })
  });

  if (resposta.ok) {
    mensagem.textContent = "Evento cadastrado com sucesso!";
    document.getElementById("nomeEvento").value = "";
    document.getElementById("dataEvento").value = "";
    document.getElementById("localEvento").value = "";
  } else {
    const erro = await resposta.json();
    mensagem.textContent = erro.message || "Erro ao cadastrar evento.";
  }
});
