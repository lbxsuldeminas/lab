
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

  if (
    resultadoOriginal === "½-½" ||
    resultadoOriginal === "0.5-0.5"
  ) {
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

  // ESTATÍSTICAS

  const vitorias = partidas.filter(p =>
    interpretarResultado(p, jogador.id).startsWith("Vitória")
  ).length;

  const derrotas = partidas.filter(p =>
    interpretarResultado(p, jogador.id).startsWith("Derrota")
  ).length;

  const empates = partidas.filter(p =>
    interpretarResultado(p, jogador.id) === "Empate"
  ).length;

  // ORDEM: PARTIDAS, VITÓRIAS, DERROTAS E EMPATES

  const estatisticas = document.createElement("div");
  estatisticas.className = "estatisticas";

  [
    ["Partidas", partidas.length],
    ["Vitórias", vitorias],
    ["Derrotas", derrotas],
    ["Empates", empates]
  ].forEach(([titulo, valor]) => {
    const bloco = document.createElement("div");
    bloco.className = "estatistica";

    bloco.appendChild(
      criarElemento("strong", valor)
    );

    bloco.appendChild(
      criarElemento("span", titulo)
    );

    estatisticas.appendChild(bloco);
  });

  resultado.appendChild(estatisticas);

  // HISTÓRICO DE TORNEIOS

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
      criarElemento(
        "p",
        `Pontuação: ${item.final_score ?? "—"}`
      )
    );

    if (torneio.tournament_date) {
      bloco.appendChild(
        criarElemento(
          "p",
          `Data: ${new Date(
            torneio.tournament_date + "T12:00:00"
          ).toLocaleDateString("pt-BR")}`
        )
      );
    }

    resultado.appendChild(bloco);
  });

  // RESULTADOS POR RODADA

  resultado.appendChild(
    criarElemento("h3", "Resultados por rodada")
  );

  // CONTÊINER RESPONSIVO DA TABELA

  const wrapper = document.createElement("div");
  wrapper.className = "tabela-wrapper";

  const tabela = document.createElement("table");
  tabela.className = "tabela-partidas";

  const cabecalho = document.createElement("thead");
  const linhaCabecalho = document.createElement("tr");

  ["Rodada", "Mesa", "Adversário", "Resultado"].forEach(texto => {
    linhaCabecalho.appendChild(
      criarElemento("th", texto)
    );
  });

  cabecalho.appendChild(linhaCabecalho);
  tabela.appendChild(cabecalho);

  const corpoTabela = document.createElement("tbody");

  // ORDENAR PARTIDAS

  partidas.sort((a, b) =>
    a.round_number - b.round_number ||
    (a.board_number || 0) - (b.board_number || 0)
  );

  partidas.forEach(partida => {
    const adversarioId =
      partida.white_player_id === jogador.id
        ? partida.black_player_id
        : partida.white_player_id;

    const adversario = adversarios.find(
      p => p.id === adversarioId
    );

    const linha = document.createElement("tr");

    const resultadoPartida = interpretarResultado(
      partida,
      jogador.id
    );

    const dados = [
      partida.round_number,
      partida.board_number ?? "—",
      adversario?.name || "Adversário",
      resultadoPartida
    ];

    dados.forEach((texto, indice) => {
      const celula = criarElemento("td", texto);

      // CORES DOS RESULTADOS

      if (indice === 3) {
        if (resultadoPartida.startsWith("Vitória")) {
          celula.classList.add("resultado-vitoria");
        } else if (resultadoPartida.startsWith("Derrota")) {
          celula.classList.add("resultado-derrota");
        } else if (resultadoPartida === "Empate") {
          celula.classList.add("resultado-empate");
        }
      }

      linha.appendChild(celula);
    });

    corpoTabela.appendChild(linha);
  });

  tabela.appendChild(corpoTabela);
  wrapper.appendChild(tabela);

  resultado.appendChild(wrapper);
}

// BUSCAR ATLETA

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

        botao.addEventListener("click", () => {
          carregarAtleta(jogador);
        });

        resultado.appendChild(botao);
      });

      return;
    }

    await carregarAtleta(jogadores[0]);

  } catch (erro) {
    console.error(erro);
    resultado.textContent =
      "Erro ao consultar os dados: " + erro.message;

  } finally {
    botaoBuscar.disabled = false;
  }
}

// CARREGAR HISTÓRICO

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

    // IDENTIFICAR ADVERSÁRIOS

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

    montarPerfil(
      jogador,
      participacoes,
      partidas,
      adversarios
    );

  } catch (erro) {
    console.error(erro);
    resultado.textContent =
      "Erro ao carregar histórico: " + erro.message;
  }
}

// EVENTOS

botaoBuscar.addEventListener("click", buscarAtleta);

campoNome.addEventListener("keydown", evento => {
  if (evento.key === "Enter") {
    buscarAtleta();
  }
});
