
const SUPABASE_URL = "https://itruyxspmazgdyrelfgj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ExFd7aYrjxoUj_WEgsNpbA_ilPYCnGL";

const resultado = document.getElementById("resultado");
const campoNome = document.getElementById("nomeAtleta");
const botaoBuscar = document.getElementById("btnBuscar");

async function consultarTabela(tabela, parametros) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${tabela}`);

  Object.entries(parametros).forEach(([chave, valor]) => {
    url.searchParams.set(chave, valor);
  });

  const resposta = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar ${tabela}: ${await resposta.text()}`);
  }

  return resposta.json();
}

function criarElemento(tag, texto, classe) {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;

  if (classe) elemento.className = classe;

  return elemento;
}

function interpretarResultado(partida, jogadorId) {
  const resultadoOriginal = (partida.result || "").replace(/\s/g, "");
  const jogadorBrancas = partida.white_player_id === jogadorId;

  if (resultadoOriginal === "½-½" || resultadoOriginal === "0.5-0.5") {
    return "Empate";
  }

  if (resultadoOriginal === "1-0") {
    return jogadorBrancas ? "Vitória" : "Derrota";
  }

  if (resultadoOriginal === "0-1") {
    return jogadorBrancas ? "Derrota" : "Vitória";
  }

  if (resultadoOriginal === "--+") {
    return jogadorBrancas ? "Derrota (WO)" : "Vitória (WO)";
  }

  return partida.result || "Resultado não informado";
}

function montarPerfil(jogador, participacoes, partidas, adversarios) {
  resultado.replaceChildren();

  resultado.appendChild(
    criarElemento("h2", jogador.name, "nome-perfil")
  );

  const vitorias = partidas.filter(p =>
    interpretarResultado(p, jogador.id).startsWith("Vitória")
  ).length;

  const derrotas = partidas.filter(p =>
    interpretarResultado(p, jogador.id).startsWith("Derrota")
  ).length;

  const empates = partidas.filter(p =>
    interpretarResultado(p, jogador.id) === "Empate"
  ).length;

  const estatisticas = document.createElement("div");
  estatisticas.className = "estatisticas";

  [
  ["Vitórias", vitorias],
  ["Empates", empates],
  ["Derrotas", derrotas],
  ["Partidas", partidas.length]
].forEach(([titulo, valor]) => {
    const bloco = document.createElement("div");
    bloco.className = "estatistica";
    bloco.appendChild(criarElemento("strong", valor));
    bloco.appendChild(criarElemento("span", titulo));
    estatisticas.appendChild(bloco);
  });

  resultado.appendChild(estatisticas);

  resultado.appendChild(
    criarElemento("h3", "Histórico de torneios")
  );

  if (participacoes.length === 0) {
    resultado.appendChild(
      criarElemento("p", "Nenhum torneio encontrado.")
    );
  }

  participacoes.forEach(item => {
    const torneio = item.tournaments || {};
    const bloco = document.createElement("div");
    bloco.className = "torneio";

    bloco.appendChild(
      criarElemento("h4", torneio.name || "Torneio")
    );

    bloco.appendChild(
      criarElemento(
        "p",
        `Classificação: ${item.final_rank ?? "—"}º lugar`
      )
    );

    bloco.appendChild(
      criarElemento("p", `Pontuação: ${item.final_score ?? "—"}`)
    );

    if (torneio.tournament_date) {
      bloco.appendChild(
        criarElemento(
          "p",
          `Data: ${new Date(torneio.tournament_date + "T12:00:00").toLocaleDateString("pt-BR")}`
        )
      );
    }

    resultado.appendChild(bloco);
  });

  resultado.appendChild(
    criarElemento("h3", "Resultados por rodada")
  );

  const tabela = document.createElement("table");
  tabela.className = "tabela-partidas";

  const cabecalho = document.createElement("tr");

  ["Rodada", "Mesa", "Adversário", "Resultado"].forEach(texto => {
    cabecalho.appendChild(criarElemento("th", texto));
  });

  tabela.appendChild(cabecalho);

  partidas.sort((a, b) =>
    a.round_number - b.round_number ||
    (a.board_number || 0) - (b.board_number || 0)
  );

  partidas.forEach(partida => {
    const adversarioId =
      partida.white_player_id === jogador.id
        ? partida.black_player_id
        : partida.white_player_id;

    const adversario = adversarios.find(p => p.id === adversarioId);

    const linha = document.createElement("tr");

    [
      partida.round_number,
      partida.board_number ?? "—",
      adversario?.name || "Adversário",
      interpretarResultado(partida, jogador.id)
    ].forEach(texto => {
      linha.appendChild(criarElemento("td", texto));
    });

    tabela.appendChild(linha);
  });

  resultado.appendChild(tabela);
}

async function buscarAtleta() {
  const nome = campoNome.value.trim();

  if (nome.length < 2) {
    resultado.textContent = "Digite pelo menos duas letras do nome.";
    return;
  }

  botaoBuscar.disabled = true;
  resultado.textContent = "Buscando atleta...";

  try {
    const jogadores = await consultarTabela("players", {
      select: "id,name",
      name: `ilike.*${nome}*`,
      order: "name.asc",
      limit: "20"
    });

    if (!jogadores.length) {
      resultado.textContent = "Nenhum atleta encontrado.";
      return;
    }

    if (jogadores.length > 1) {
      resultado.replaceChildren(
        criarElemento("h3", "Selecione o atleta:")
      );

      jogadores.forEach(jogador => {
        const botao = criarElemento("button", jogador.name);
        botao.type = "button";
        botao.addEventListener("click", () => carregarAtleta(jogador));
        resultado.appendChild(botao);
      });

      return;
    }

    await carregarAtleta(jogadores[0]);

  } catch (erro) {
    resultado.textContent = "Erro ao consultar os dados: " + erro.message;
  } finally {
    botaoBuscar.disabled = false;
  }
}

async function carregarAtleta(jogador) {
  resultado.textContent = "Carregando histórico...";

  try {
    const [participacoes, partidas] = await Promise.all([
      consultarTabela("tournament_players", {
        select: "final_rank,final_score,starting_rank,tournaments(name,tournament_date,total_rounds)",
        player_id: `eq.${jogador.id}`
      }),

      consultarTabela("games", {
        select: "id,round_number,board_number,white_player_id,black_player_id,result",
        or: `(white_player_id.eq.${jogador.id},black_player_id.eq.${jogador.id})`,
        order: "round_number.asc"
      })
    ]);

    const ids = [...new Set(
      partidas.flatMap(p => [
        p.white_player_id,
        p.black_player_id
      ]).filter(id => id && id !== jogador.id)
    )];

    let adversarios = [];

    if (ids.length) {
      adversarios = await consultarTabela("players", {
        select: "id,name",
        id: `in.(${ids.join(",")})`
      });
    }

    montarPerfil(jogador, participacoes, partidas, adversarios);

  } catch (erro) {
    resultado.textContent = "Erro ao carregar histórico: " + erro.message;
  }
}

botaoBuscar.addEventListener("click", buscarAtleta);

campoNome.addEventListener("keydown", evento => {
  if (evento.key === "Enter") buscarAtleta();
});
