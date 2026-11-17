
const campoNome = document.getElementById("nomeAtleta");
const botaoBuscar = document.getElementById("btnBuscar");
const resultado = document.getElementById("resultado");

function buscarAtleta() {
  const nome = campoNome.value.trim();

  if (nome === "") {
    resultado.innerHTML = "<p>Digite o nome de um atleta para pesquisar.</p>";
    campoNome.focus();
    return;
  }

  resultado.innerHTML = `
    <div class="mensagem-busca">
      <h2>Pesquisa realizada</h2>
      <p>Atleta pesquisado: <strong>${nome.replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[caractere])}</strong></p>
      <p>O histórico de torneios será exibido aqui quando conectarmos a base de resultados da LBX.</p>
    </div>
  `;
}

botaoBuscar.addEventListener("click", buscarAtleta);

campoNome.addEventListener("keydown", function(evento) {
  if (evento.key === "Enter") {
    buscarAtleta();
  }
});

