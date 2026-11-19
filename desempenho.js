
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

// CALCULAR ESTATÍSTICAS POR COR

function calcularDesempenhoCor(partidas, jogadorId, cor) {
  const partidasDaCor = partidas.filter(partida => {
    if (cor === "brancas") {
      return partida.white_player_id === jogadorId;
    }

    return partida.black_player_id === jogadorId;
  });

  let vitorias = 0;
  let derrotas = 0;
  let empates = 0;

  partidasDaCor.forEach(partida => {
    const resultadoPartida = interpretarResultado(partida, jogadorId);

    if (resultadoPartida.startsWith("Vitória")) {
      vitorias++;
    } else if (resultadoPartida.startsWith("Derrota")) {
      derrotas++;
    } else if (resultadoPartida === "Empate") {
      empates++;
    }
  });

  const total = vitorias + derrotas + empates;

  const pontos = vitorias + empates * 0.5;

  const aproveitamento = total > 0
    ? (pontos / total) * 100
    : 0;

  return {
    vitorias,
    derrotas,
    empates,
    total,
    pontos,
    aproveitamento
  };
}

// CRIAR GRÁFICO DE PIZZA

function criarGraficoPizza(titulo, dados) {
  const bloco = document.createElement("div");
  bloco.className = "grafico-cor";

  bloco.style.cssText = `
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 18px;
    flex: 1;
    min-width: 230px;
    box-sizing: border-box;
  `;

  bloco.appendChild(criarElemento("h4", titulo));

  const grafico = document.createElement("div");

  grafico.style.cssText = `
    width: 145px;
    height: 145px;
    border-radius: 50%;
    margin: 15px auto;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const total = dados.total;

  if (total > 0) {
    const percentualVitorias = dados.vitorias / total * 100;
    const percentualEmpates = dados.empates / total * 100;
    const percentualDerrotas = dados.derrotas / total * 100;

    const fimVitorias = percentualVitorias;
    const fimEmpates = fimVitorias + percentualEmpates;

    grafico.style.background = `
      conic-gradient(
        #16a34a 0% ${fimVitorias}%,
        #f59e0b ${fimVitorias}% ${fimEmpates}%,
        #dc2626 ${fimEmpates}% 100%
      )
    `;
  } else {
    grafico.style.background = "#ddd";
  }

  const centro = document.createElement("div");

  centro.style.cssText = `
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  const percentual = criarElemento(
    "strong",
    `${dados.aproveitamento.toFixed(1).replace(".", ",")}%`
  );

  percentual.style.fontSize = "20px";
  percentual.style.color = "#222";

  centro.appendChild(percentual);

  const legendaCentro = criarElemento("small", "Aproveitamento");
  legendaCentro.style.color = "#666";

  centro.appendChild(legendaCentro);

  grafico.appendChild(centro);
  bloco.appendChild(grafico);

  const legenda = document.createElement("div");
  legenda.style.cssText = `
    display: grid;
    gap: 8px;
    font-size: 14px;
  `;

  const itens = [
    {
      nome: "Vitórias",
      quantidade: dados.vitorias,
      cor: "#16a34a"
    },
    {
      nome: "Empates",
      quantidade: dados.empates,
      cor: "#f59e0b"
    },
    {
      nome: "Derrotas",
      quantidade: dados.derrotas,
      cor: "#dc2626"
    }
  ];

  itens.forEach(item => {
    const percentualItem = total > 0
      ? (item.quantidade / total * 100).toFixed(1)
      : "0,0";

    const linha = document.createElement("div");

    linha.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    `;

    const nome = document.createElement("span");

    nome.textContent = `● ${item.nome}`;
    nome.style.color = item.cor;

    const valor = criarElemento(
      "strong",
      `${item.quantidade} (${percentualItem.replace(".", ",")}%)`
    );

    linha.appendChild(nome);
    linha.appendChild(valor);

    legenda.appendChild(linha);
  });

  bloco.appendChild(legenda);

  bloco.appendChild(
    criarElemento("p", `Partidas consideradas: ${total}`)
  );

  return bloco;
}

function montarPerfil(jogador, participacoes, partidas, adversarios) {
  resultado.replaceChildren();

  resultado.appendChild(
    criarElemento("h2", jogador.name, "nome-perfil")
  );

  // ESTATÍSTICAS GERAIS

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
    ["Partidas", partidas.length],
    ["Vitórias", vitorias],
    ["Derrotas", derrotas],
    ["Empates", empates]
  ].forEach(([titulo, valor]) => {
    const bloco = document.createElement("div");
    bloco.className = "estatistica";

    bloco.appendChild(criarElemento("strong", valor));
    bloco.appendChild(criarElemento("span", titulo));

    estatisticas.appendChild(bloco);
  });

  resultado.appendChild(estatisticas);

  // APROVEITAMENTO POR COR

  resultado.appendChild(
    criarElemento("h3", "Aproveitamento por cor das peças")
  );

  const desempenhoBrancas = calcularDesempenhoCor(
    partidas,
    jogador.id,
    "brancas"
  );

  const desempenhoNegras = calcularDesempenhoCor(
    partidas,
    jogador.id,
    "negras"
  );

  const graficos = document.createElement("div");

  graficos.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin: 15px 0 25px;
  `;

  graficos.appendChild(
    criarGraficoPizza("Peças brancas", desempenhoBrancas)
  );

  graficos.appendChild(
    criarGraficoPizza("Peças negras", desempenhoNegras)
  );

  resultado.appendChild(graficos);

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

  // RESULTADOS POR RODADA — UMA TABELA PARA CADA TORNEIO

  resultado.appendChild(
    criarElemento("h3", "Resultados por torneio")
  );

  participacoes.forEach(item => {
    const torneio = item.tournaments || {};

    const partidasTorneio = partidas
      .filter(partida => partida.tournament_id === item.tournament_id)
      .sort((a, b) =>
        a.round_number - b.round_number ||
        (a.board_number || 0) - (b.board_number || 0)
      );

    const bloco = document.createElement("div");
    bloco.className = "torneio";

    bloco.appendChild(
      criarElemento("h4", torneio.name || "Torneio")
    );

    const wrapper = document.createElement("div");
    wrapper.className = "tabela-wrapper";

    const tabela = document.createElement("table");
    tabela.className = "tabela-partidas";

    const cabecalho = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");

    ["Rodada", "Mesa", "Adversário", "Resultado"].forEach(texto => {
      linhaCabecalho.appendChild(criarElemento("th", texto));
    });

    cabecalho.appendChild(linhaCabecalho);
    tabela.appendChild(cabecalho);

    const corpoTabela = document.createElement("tbody");

    partidasTorneio.forEach(partida => {
      const adversarioId =
        partida.white_player_id === jogador.id
          ? partida.black_player_id
          : partida.white_player_id;

      const adversario = adversarios.find(
        p => p.id === adversarioId
      );

      const resultadoPartida = interpretarResultado(
        partida,
        jogador.id
      );

      const linha = document.createElement("tr");

      const dados = [
        partida.round_number,
        partida.board_number ?? "—",
        adversario?.name || "Adversário",
        resultadoPartida
      ];

      dados.forEach((texto, indice) => {
        const celula = criarElemento("td", texto);

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
    bloco.appendChild(wrapper);

    if (partidasTorneio.length === 0) {
      bloco.appendChild(
        criarElemento("p", "Nenhuma partida registrada neste torneio.")
      );
    }

    resultado.appendChild(bloco);
  });
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
        select: "tournament_id,final_rank,final_score,starting_rank,tournaments(name,tournament_date,total_rounds)",
        player_id: `eq.${jogador.id}`
      }),

      consultarTabela("games", {
        select: "id,tournament_id,round_number,board_number,white_player_id,black_player_id,result",
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
