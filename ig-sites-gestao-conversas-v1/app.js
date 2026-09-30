/* ============================================================
   IG SITES — GESTÃO DE CONVERSAS
   app.js COMPLETO — VERSÃO CORRIGIDA

   ✓ Menu lateral funcionando
   ✓ Troca de telas
   ✓ Importação de listas
   ✓ Aceita:
       Empresa | telefone | etapa
       Empresa    telefone    etapa
       Empresa
       telefone
       etapa
   ✓ Aceita telefones:
       (41) 99999-1001
       41 99999-1001
       41999991001
       +55 41 99999-1001
   ✓ Evita duplicados
   ✓ Salva no localStorage
   ✓ Não conecta ao WhatsApp
   ✓ Não envia mensagens
   ============================================================ */

const STORAGE_KEY = "ig_sites_conversas";
const NOTES_KEY = "ig_sites_anotacoes";

const ETAPAS = [
  "Prospectado",
  "Respondeu",
  "Interessado",
  "Pediu modelo",
  "Orçamento / negociação",
  "Venda fechada",
  "Não avançou"
];

const TITULOS = {
  dashboard: "Visão geral",
  conversations: "Conversas",
  funnel: "Funil",
  analysis: "Análise",
  notes: "Anotações",
  settings: "Configurações"
};

let selectedId = null;
let importadosTemporarios = [];


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function $(id) {
  return document.getElementById(id);
}

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function hoje() {
  const d = new Date();

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/* ============================================================
   TELEFONE
   ============================================================ */

function normalizarTelefone(valor) {
  let numero = String(valor ?? "")
    .replace(/\D/g, "");

  /*
     Remove código do Brasil.
  */

  if (
    numero.startsWith("55") &&
    numero.length >= 12
  ) {
    numero = numero.slice(2);
  }

  return numero;
}

function formatarTelefone(valor) {
  const original = String(valor ?? "").trim();

  let numero = normalizarTelefone(original);

  if (numero.length === 11) {
    return (
      "(" +
      numero.slice(0, 2) +
      ") " +
      numero.slice(2, 7) +
      "-" +
      numero.slice(7)
    );
  }

  if (numero.length === 10) {
    return (
      "(" +
      numero.slice(0, 2) +
      ") " +
      numero.slice(2, 6) +
      "-" +
      numero.slice(6)
    );
  }

  /*
     Se não conseguiu formatar,
     mantém o texto original.
  */

  return original;
}


/* ============================================================
   DETECÇÃO DE TELEFONE
   ============================================================ */

/*
   Aceita:

   (41) 99999-1001
   41 99999-1001
   41999991001
   +55 41 99999-1001
   5541999991001
*/

function extrairTelefone(texto) {
  const valor = String(texto ?? "");

  /*
     Primeiro tenta formatos com pontuação/espaços.
  */

  const regexFormatado =
    /(?:\+?55[\s.-]*)?\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*\d{4}/;

  const encontrado =
    valor.match(regexFormatado);

  if (encontrado) {
    return encontrado[0];
  }

  /*
     Depois procura números contínuos.
  */

  const regexContinuo =
    /(?:55)?\d{10,11}/;

  const continuo =
    valor.match(regexContinuo);

  if (continuo) {
    return continuo[0];
  }

  return null;
}

function linhaEhTelefone(texto) {
  return !!extrairTelefone(texto);
}


/* ============================================================
   ETAPAS
   ============================================================ */

function etapaValida(etapa) {
  return ETAPAS.includes(etapa);
}

function detectarEtapa(texto) {
  const t = normalizarTexto(texto);

  /*
     VENDA FECHADA
  */

  if (
    /venda\s+fechada/.test(t) ||
    /venda\s+realizada/.test(t) ||
    /\bfechou\b/.test(t) ||
    /cliente\s+fechado/.test(t)
  ) {
    return "Venda fechada";
  }

  /*
     NÃO AVANÇOU
  */

  if (
    /nao\s+avancou/.test(t) ||
    /nao\s+tenho\s+interesse/.test(t) ||
    /sem\s+interesse/.test(t) ||
    /nao\s+quero/.test(t) ||
    /desistiu/.test(t)
  ) {
    return "Não avançou";
  }

  /*
     ORÇAMENTO / NEGOCIAÇÃO
  */

  if (
    /orcamento/.test(t) ||
    /negociacao/.test(t) ||
    /quanto\s+custa/.test(t) ||
    /quanto\s+fica/.test(t) ||
    /quanto\s+e/.test(t) ||
    /\bpreco\b/.test(t) ||
    /\bvalor\b/.test(t) ||
    /qual\s+o\s+preco/.test(t)
  ) {
    return "Orçamento / negociação";
  }

  /*
     PEDIU MODELO
  */

  if (
    /pediu\s+modelo/.test(t) ||
    /pedir\s+modelo/.test(t) ||
    /manda\s+(o\s+)?modelo/.test(t) ||
    /mandar\s+(o\s+)?modelo/.test(t) ||
    /mande\s+(o\s+)?modelo/.test(t) ||
    /enviar\s+(o\s+)?modelo/.test(t) ||
    /envia\s+(o\s+)?modelo/.test(t) ||
    /quero\s+ver\s+(o\s+)?modelo/.test(t) ||
    /ver\s+(o\s+)?modelo/.test(t)
  ) {
    return "Pediu modelo";
  }

  /*
     INTERESSADO
  */

  if (
    /tenho\s+interesse/.test(t) ||
    /\binteressado\b/.test(t) ||
    /gostei/.test(t) ||
    /quero\s+fazer/.test(t) ||
    /quero\s+sim/.test(t) ||
    /vamos\s+fazer/.test(t) ||
    /pode\s+fazer/.test(t)
  ) {
    return "Interessado";
  }

  /*
     RESPONDEU
  */

  if (
    /\brespondeu\b/.test(t) ||
    /\bresposta\b/.test(t)
  ) {
    return "Respondeu";
  }

  /*
     PADRÃO
  */

  return "Prospectado";
}


/* ============================================================
   LOCAL STORAGE
   ============================================================ */

function carregarConversas() {
  try {
    const salvo =
      localStorage.getItem(STORAGE_KEY);

    if (!salvo) {
      const iniciais = [];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(iniciais)
      );

      return iniciais;
    }

    const dados =
      JSON.parse(salvo);

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados.map((c, index) => ({
      id:
        c.id ??
        gerarId() + index,

      company:
        c.company ??
        c.empresa ??
        "Empresa sem nome",

      phone:
        formatarTelefone(
          c.phone ??
          c.telefone ??
          ""
        ),

      stage:
        etapaValida(
          c.stage ??
          c.etapa
        )
          ? (
              c.stage ??
              c.etapa
            )
          : "Prospectado",

      firstReply:
        Number(
          c.firstReply ??
          0
        ),

      updated:
        c.updated ??
        hoje(),

      note:
        c.note ??
        c.observacao ??
        "",

      history:
        Array.isArray(c.history)
          ? c.history
          : []
    }));

  } catch (erro) {
    console.error(
      "Erro ao carregar conversas:",
      erro
    );

    return [];
  }
}

function salvarConversas(lista) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(lista)
  );
}

function getConversas() {
  return carregarConversas();
}

function carregarAnotacoes() {
  try {
    const dados =
      JSON.parse(
        localStorage.getItem(
          NOTES_KEY
        ) || "[]"
      );

    return Array.isArray(dados)
      ? dados
      : [];

  } catch {
    return [];
  }
}

function salvarAnotacoes(lista) {
  localStorage.setItem(
    NOTES_KEY,
    JSON.stringify(lista)
  );
}


/* ============================================================
   DUPLICADOS
   ============================================================ */

function telefoneJaExiste(
  telefone,
  conversas
) {
  const numero =
    normalizarTelefone(
      telefone
    );

  if (!numero) {
    return false;
  }

  return conversas.some(
    c =>
      normalizarTelefone(
        c.phone
      ) === numero
  );
}


/* ============================================================
   IMPORTAÇÃO DE LISTA
   ============================================================ */

/*
   Esta função aceita TODOS estes formatos:

   1.

   Oficina Motor Sul (41) 99999-1001 Prospectado

   2.

   Oficina Motor Sul
   (41) 99999-1001
   Prospectado

   3.

   Oficina Motor Sul | (41) 99999-1001 | Prospectado

   4.

   Oficina Motor Sul - 41999991001 - Prospectado

   5.

   Vários contatos sem linhas vazias.

   6.

   Empresa
   telefone
   status
   Empresa
   telefone
   status
*/

function analisarLista(texto) {

  const linhas =
    String(texto ?? "")
      .replace(/\r/g, "")
      .split("\n")
      .map(linha =>
        linha.trim()
      )
      .filter(Boolean);

  const contatos = [];

  /*
     Verifica se uma parte do texto
     parece ser uma etapa.
  */

  function identificarEtapaNaLinha(
    linha
  ) {
    const etapa =
      detectarEtapa(linha);

    /*
       DetectarEtapa sempre retorna
       Prospectado. Por isso precisamos
       verificar se a linha realmente
       contém uma palavra de etapa.
    */

    const t =
      normalizarTexto(linha);

    if (
      t === "prospectado"
    ) {
      return "Prospectado";
    }

    if (
      t === "respondeu"
    ) {
      return "Respondeu";
    }

    if (
      t === "interessado" ||
      t === "tenho interesse"
    ) {
      return "Interessado";
    }

    if (
      t === "pediu modelo" ||
      t === "manda o modelo" ||
      t === "quero ver o modelo"
    ) {
      return "Pediu modelo";
    }

    if (
      t ===
        "orcamento / negociacao" ||
      t ===
        "orçamento / negociação" ||
      t === "negociacao" ||
      t === "negociação"
    ) {
      return "Orçamento / negociação";
    }

    if (
      t === "nao avancou" ||
      t === "não avançou" ||
      t === "sem interesse"
    ) {
      return "Não avançou";
    }

    if (
      t === "venda fechada" ||
      t === "fechou"
    ) {
      return "Venda fechada";
    }

    /*
       Também aceita frases como:
       "Quanto custa?"
       "Gostei, quero fazer"
       etc.
    */

    if (
      /quanto\s+custa/.test(t) ||
      /quanto\s+fica/.test(t) ||
      /negociacao/.test(t) ||
      /negociação/.test(t)
    ) {
      return "Orçamento / negociação";
    }

    if (
      /gostei/.test(t) ||
      /tenho\s+interesse/.test(t)
    ) {
      return "Interessado";
    }

    if (
      /modelo/.test(t) &&
      (
        /manda/.test(t) ||
        /mandar/.test(t) ||
        /enviar/.test(t) ||
        /ver/.test(t) ||
        /pediu/.test(t)
      )
    ) {
      return "Pediu modelo";
    }

    return null;
  }

  /*
     Extrai o conteúdo antes/depois
     do telefone.
  */

  function extrairPartesDaLinha(
    linha,
    telefone
  ) {
    const pos =
      linha.indexOf(
        telefone
      );

    if (pos < 0) {
      return {
        antes: linha.trim(),
        depois: ""
      };
    }

    return {
      antes:
        linha
          .slice(
            0,
            pos
          )
          .trim(),

      depois:
        linha
          .slice(
            pos +
              telefone.length
          )
          .trim()
    };
  }

  let empresaPendente = "";
  let contatoAtual = null;

  function finalizarContato() {

    if (
      !contatoAtual ||
      !contatoAtual.telefone
    ) {
      return;
    }

    const textoInformacoes =
      contatoAtual.informacoes
        .join(" | ")
        .trim();

    let etapa =
      contatoAtual.etapa;

    if (!etapa) {
      etapa =
        detectarEtapa(
          textoInformacoes
        );
    }

    contatos.push({

      empresa:
        contatoAtual.empresa ||
        "Empresa sem nome",

      telefone:
        formatarTelefone(
          contatoAtual.telefone
        ),

      etapa:
        etapa ||
        "Prospectado",

      observacao:
        textoInformacoes,

      fonte:
        "importacao"
    });

    contatoAtual = null;
  }

  /*
     PROCESSA TODAS AS LINHAS
  */

  for (
    let i = 0;
    i < linhas.length;
    i++
  ) {

    const linha =
      linhas[i];

    /*
       Tenta achar telefone
       em qualquer lugar da linha.
    */

    const telefone =
      extrairTelefone(
        linha
      );

    /*
       ========================================================
       CASO A LINHA TENHA TELEFONE
       ========================================================
    */

    if (telefone) {

      /*
         Se já havia um contato,
         finaliza antes de começar outro.
      */

      finalizarContato();

      const partes =
        extrairPartesDaLinha(
          linha,
          telefone
        );

      let empresa =
        partes.antes
          .replace(
            /^[|;\-–—]+/,
            ""
          )
          .replace(
            /[|;\-–—]+$/,
            ""
          )
          .trim();

      let depois =
        partes.depois
          .replace(
            /^[|;\-–—]+/,
            ""
          )
          .replace(
            /[|;\-–—]+$/,
            ""
          )
          .trim();

      /*
         Se não existe empresa antes
         do telefone, usa a empresa
         pendente da linha anterior.
      */

      if (!empresa) {
        empresa =
          empresaPendente ||
          "Empresa sem nome";
      }

      /*
         Verifica se depois do telefone
         existe uma etapa.
      */

      const etapaDaLinha =
        identificarEtapaNaLinha(
          depois
        );

      /*
         Se "depois" for uma etapa,
         não coloca a etapa como
         observação.
      */

      let informacoes = [];

      if (
        depois &&
        !etapaDaLinha
      ) {
        informacoes.push(
          depois
        );
      }

      contatoAtual = {

        empresa,

        telefone,

        etapa:
          etapaDaLinha,

        informacoes
      };

      empresaPendente = "";

      continue;
    }

    /*
       ========================================================
       LINHA SEM TELEFONE
       ========================================================
    */

    /*
       Se ainda não existe contato,
       esta linha provavelmente é
       o nome da empresa.
    */

    if (!contatoAtual) {

      /*
         Se a linha é uma etapa isolada,
         não faz sentido usar como empresa.
      */

      const etapa =
        identificarEtapaNaLinha(
          linha
        );

      if (etapa) {
        continue;
      }

      /*
         Guarda a empresa.
      */

      if (!empresaPendente) {

        empresaPendente =
          linha
            .replace(
              /^[|;\-–—]+/,
              ""
            )
            .replace(
              /[|;\-–—]+$/,
              ""
            )
            .trim();
      }

      continue;
    }

    /*
       ========================================================
       JÁ EXISTE CONTATO
       ========================================================
    */

    const etapa =
      identificarEtapaNaLinha(
        linha
      );

    /*
       Se a linha é uma etapa,
       salva como etapa.
    */

    if (etapa) {

      contatoAtual.etapa =
        etapa;

      continue;
    }

    /*
       Caso contrário, guarda
       como informação/observação.
    */

    contatoAtual.informacoes.push(
      linha
    );
  }

  /*
     Finaliza o último contato.
  */

  finalizarContato();

  /*
     ========================================================
     REMOVE DUPLICADOS DA PRÓPRIA LISTA
     ========================================================
  */

  const mapa =
    new Map();

  for (
    const contato
    of contatos
  ) {

    const numero =
      normalizarTelefone(
        contato.telefone
      );

    if (!numero) {
      continue;
    }

    /*
       Se o mesmo telefone aparecer
       novamente, mantém o primeiro.
    */

    if (!mapa.has(numero)) {

      mapa.set(
        numero,
        contato
      );
    }
  }

  return Array.from(
    mapa.values()
  );
}


/* ============================================================
   IMPORTAR CONTATOS
   ============================================================ */

function importarContatos(
  contatos
) {

  const conversas =
    getConversas();

  let adicionados = 0;
  let duplicados = 0;

  for (
    const contato
    of contatos
  ) {

    if (
      !contato.telefone
    ) {
      continue;
    }

    if (
      telefoneJaExiste(
        contato.telefone,
        conversas
      )
    ) {

      duplicados++;

      continue;
    }

    const novaConversa = {

      id:
        gerarId(),

      company:
        contato.empresa ||
        "Empresa sem nome",

      phone:
        formatarTelefone(
          contato.telefone
        ),

      stage:
        etapaValida(
          contato.etapa
        )
          ? contato.etapa
          : "Prospectado",

      firstReply:
        0,

      updated:
        hoje(),

      note:
        contato.observacao ||
        "",

      history: [
        {
          from:
            "system",

          text:
            contato.observacao
              ? `Contato importado. ${contato.observacao}`
              : "Contato importado.",

          time:
            hoje()
        }
      ]
    };

    conversas.push(
      novaConversa
    );

    adicionados++;
  }

  salvarConversas(
    conversas
  );

  return {
    adicionados,
    duplicados
  };
}


/* ============================================================
   MODAL DE IMPORTAÇÃO
   ============================================================ */

function criarModalImportacao() {

  if ($("igImportModal")) {
    return;
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "igImportModal";

  modal.className =
    "modal";

  modal.innerHTML = `

    <div
      class="modalbox"
      style="
        max-width:900px;
      "
    >

      <div
        class="modalTop"
      >

        <div>

          <h2>
            Importar lista de contatos
          </h2>

          <p class="muted">

            Cole a lista completa.
            O sistema identifica
            automaticamente empresa,
            telefone e etapa.

          </p>

        </div>

        <button
          type="button"
          class="secondary"
          id="igFecharImport"
        >
          Fechar
        </button>

      </div>


      <div
        class="safe"
        style="
          margin-bottom:14px;
        "
      >

        <b>
          Formatos aceitos:
        </b>

        <br><br>

        <b>
          Tudo na mesma linha:
        </b>

        <br>

        Oficina Motor Sul
        (41) 99999-1001
        Prospectado

        <br><br>

        <b>
          Ou separado:
        </b>

        <br>

        Oficina Motor Sul
        <br>
        (41) 99999-1001
        <br>
        Prospectado

      </div>


      <textarea
        id="igImportTextarea"
        style="
          width:100%;
          min-height:280px;
          box-sizing:border-box;
          padding:14px;
          border:1px solid #cbd5e1;
          border-radius:10px;
          font:inherit;
          resize:vertical;
        "
        placeholder="Cole sua lista aqui..."
      ></textarea>


      <div
        id="igImportResultado"
        style="
          margin-top:15px;
        "
      ></div>


      <div
        style="
          display:flex;
          justify-content:flex-end;
          gap:10px;
          margin-top:15px;
          flex-wrap:wrap;
        "
      >

        <button
          type="button"
          class="secondary"
          id="igCancelarImport"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="primary"
          id="igAnalisarImport"
        >
          Analisar lista
        </button>

        <button
          type="button"
          class="primary"
          id="igConfirmarImport"
          style="
            display:none;
          "
        >
          Importar contatos
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("igFecharImport")
    .onclick =
    fecharImportacao;

  $("igCancelarImport")
    .onclick =
    fecharImportacao;

  $("igAnalisarImport")
    .onclick =
    analisarImportacaoInterface;

  $("igConfirmarImport")
    .onclick =
    confirmarImportacaoInterface;
}


/* ============================================================
   BOTÃO IMPORTAR
   ============================================================ */

function criarBotaoImportar() {

  if ($("igImportarListaBtn")) {
    return;
  }

  const botao =
    document.createElement(
      "button"
    );

  botao.id =
    "igImportarListaBtn";

  botao.type =
    "button";

  botao.className =
    "secondary";

  botao.textContent =
    "⇩ Importar lista";

  botao.style.marginLeft =
    "10px";

  botao.addEventListener(
    "click",
    abrirImportacao
  );

  /*
     Tenta colocar o botão
     perto dos botões existentes.
  */

  const referencia =
    $("newConversation2") ||
    $("newConversation");

  if (
    referencia &&
    referencia.parentElement
  ) {

    referencia.parentElement
      .appendChild(
        botao
      );

  } else {

    /*
       Fallback.
    */

    document.body
      .appendChild(
        botao
      );
  }
}


/* ============================================================
   ABRIR / FECHAR IMPORTAÇÃO
   ============================================================ */

function abrirImportacao() {

  criarModalImportacao();

  $("igImportModal")
    .classList
    .add("show");

  $("igImportTextarea")
    .value = "";

  $("igImportResultado")
    .innerHTML = "";

  $("igConfirmarImport")
    .style.display =
    "none";

  importadosTemporarios =
    [];

  setTimeout(
    () => {
      $("igImportTextarea")
        ?.focus();
    },
    50
  );
}

function fecharImportacao() {

  $("igImportModal")
    ?.classList
    .remove("show");

  importadosTemporarios =
    [];
}


/* ============================================================
   ANALISAR IMPORTAÇÃO
   ============================================================ */

function analisarImportacaoInterface() {

  const textarea =
    $("igImportTextarea");

  const resultado =
    $("igImportResultado");

  const confirmar =
    $("igConfirmarImport");

  if (!textarea) {
    return;
  }

  const texto =
    textarea.value;

  if (!texto.trim()) {

    resultado.innerHTML = `
      <div class="safe">
        Cole uma lista antes de analisar.
      </div>
    `;

    confirmar.style.display =
      "none";

    return;
  }

  const contatos =
    analisarLista(
      texto
    );

  importadosTemporarios =
    contatos;

  if (!contatos.length) {

    resultado.innerHTML = `
      <div class="safe">

        Não consegui identificar
        nenhum contato.

        <br><br>

        Verifique se os números
        de telefone estão presentes.

      </div>
    `;

    confirmar.style.display =
      "none";

    return;
  }

  const existentes =
    new Set(
      getConversas().map(
        c =>
          normalizarTelefone(
            c.phone
          )
      )
    );

  const novos =
    contatos.filter(
      c =>
        !existentes.has(
          normalizarTelefone(
            c.telefone
          )
        )
    ).length;

  const duplicados =
    contatos.length -
    novos;

  resultado.innerHTML = `

    <div
      class="card"
      style="
        padding:14px;
      "
    >

      <p>

        <b>
          ${contatos.length}
          contato(s) identificado(s)
        </b>

      </p>

      <p>

        ${novos}
        novo(s) serão importados

        •
        
        ${duplicados}
        já cadastrado(s)

      </p>


      <div
        style="
          overflow:auto;
          max-height:320px;
        "
      >

        <table
          style="
            width:100%;
            border-collapse:collapse;
          "
        >

          <thead>

            <tr>

              <th
                style="
                  text-align:left;
                  padding:8px;
                "
              >
                Empresa
              </th>

              <th
                style="
                  text-align:left;
                  padding:8px;
                "
              >
                Telefone
              </th>

              <th
                style="
                  text-align:left;
                  padding:8px;
                "
              >
                Etapa
              </th>

            </tr>

          </thead>

          <tbody>

            ${contatos.map(
              contato => `

                <tr>

                  <td
                    style="
                      padding:8px;
                      border-top:
                        1px solid #e2e8f0;
                    "
                  >
                    ${escaparHTML(
                      contato.empresa
                    )}
                  </td>

                  <td
                    style="
                      padding:8px;
                      border-top:
                        1px solid #e2e8f0;
                    "
                  >
                    ${escaparHTML(
                      contato.telefone
                    )}
                  </td>

                  <td
                    style="
                      padding:8px;
                      border-top:
                        1px solid #e2e8f0;
                    "
                  >
                    ${escaparHTML(
                      contato.etapa
                    )}
                  </td>

                </tr>

              `
            ).join("")}

          </tbody>

        </table>

      </div>

    </div>
  `;

  confirmar.style.display =
    novos > 0
      ? "inline-block"
      : "none";
}


/* ============================================================
   CONFIRMAR IMPORTAÇÃO
   ============================================================ */

function confirmarImportacaoInterface() {

  if (
    !importadosTemporarios.length
  ) {
    return;
  }

  const resultado =
    importarContatos(
      importadosTemporarios
    );

  $("igImportResultado")
    .innerHTML = `

      <div class="safe">

        <b>
          Importação concluída.
        </b>

        <br><br>

        ${resultado.adicionados}
        contato(s) adicionado(s).

        <br>

        ${resultado.duplicados}
        contato(s) ignorado(s)
        por duplicidade.

      </div>

    `;

  $("igConfirmarImport")
    .style.display =
    "none";

  importadosTemporarios =
    [];

  render();
}


/* ============================================================
   NAVEGAÇÃO DO MENU
   ============================================================ */

function mostrarPagina(view) {

  if (
    !TITULOS[view]
  ) {
    view =
      "dashboard";
  }

  /*
     Esconde todas as telas.
  */

  document
    .querySelectorAll(
      ".view"
    )
    .forEach(secao => {

      secao.classList.toggle(
        "active",
        secao.id === view
      );

    });

  /*
     Ativa o botão correspondente.
  */

  document
    .querySelectorAll(
      ".nav[data-view]"
    )
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.view ===
        view
      );

    });

  /*
     Atualiza título.
  */

  if ($("title")) {

    $("title").textContent =
      TITULOS[view];
  }

  /*
     Guarda a tela no endereço.
  */

  try {

    history.pushState(
      {
        view
      },
      "",
      "#" + view
    );

  } catch {}

  /*
     Atualiza conteúdo.
  */

  render();
}

function configurarMenu() {

  const itens =
    document.querySelectorAll(
      ".nav[data-view]"
    );

  itens.forEach(item => {

    /*
       Remove onclick antigo
       caso exista.
    */

    item.onclick =
      function(event) {

        event.preventDefault();
        event.stopPropagation();

        mostrarPagina(
          this.dataset.view
        );

      };

  });
}

function carregarPaginaDoHash() {

  let view =
    window.location.hash
      .replace(
        "#",
        ""
      );

  if (
    !TITULOS[view]
  ) {
    view =
      "dashboard";
  }

  /*
     Ativa a tela.
  */

  document
    .querySelectorAll(
      ".view"
    )
    .forEach(secao => {

      secao.classList.toggle(
        "active",
        secao.id === view
      );

    });

  /*
     Ativa menu.
  */

  document
    .querySelectorAll(
      ".nav[data-view]"
    )
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.view ===
        view
      );

    });

  if ($("title")) {

    $("title").textContent =
      TITULOS[view];
  }
}

window.addEventListener(
  "hashchange",
  () => {
    carregarPaginaDoHash();
    render();
  }
);

window.addEventListener(
  "popstate",
  () => {
    carregarPaginaDoHash();
    render();
  }
);


/* ============================================================
   DASHBOARD
   ============================================================ */

function renderDashboard(
  conversas
) {

  const total =
    conversas.length;

  const respondidas =
    conversas.filter(
      c =>
        c.stage !==
        "Prospectado"
    ).length;

  const interessadas =
    conversas.filter(
      c =>
        [
          "Interessado",
          "Pediu modelo",
          "Orçamento / negociação",
          "Venda fechada"
        ].includes(
          c.stage
        )
    ).length;

  const vendas =
    conversas.filter(
      c =>
        c.stage ===
        "Venda fechada"
    ).length;

  if ($("sTotal")) {
    $("sTotal").textContent =
      total;
  }

  if ($("sAnswered")) {
    $("sAnswered").textContent =
      respondidas;
  }

  if ($("sInterested")) {
    $("sInterested").textContent =
      interessadas;
  }

  if ($("sWon")) {
    $("sWon").textContent =
      vendas;
  }

  if ($("navCount")) {
    $("navCount").textContent =
      total;
  }

  if ($("bars")) {

    const maior =
      Math.max(
        ...ETAPAS.map(
          etapa =>
            conversas.filter(
              c =>
                c.stage ===
                etapa
            ).length
        ),
        1
      );

    $("bars").innerHTML =
      ETAPAS.map(
        etapa => {

          const quantidade =
            conversas.filter(
              c =>
                c.stage ===
                etapa
            ).length;

          const largura =
            quantidade
              ? Math.max(
                  5,
                  quantidade /
                    maior *
                    100
                )
              : 0;

          return `

            <div
              class="barline"
            >

              <div>

                <span>
                  ${escaparHTML(
                    etapa
                  )}
                </span>

                <b>
                  ${quantidade}
                </b>

              </div>

              <div
                class="bar"
              >

                <i
                  style="
                    width:${largura}%;
                  "
                ></i>

              </div>

            </div>

          `;

        }
      ).join("");
  }

  if ($("recent")) {

    const recentes =
      [...conversas]
        .sort(
          (a, b) =>
            String(
              b.updated
            ).localeCompare(
              String(
                a.updated
              )
            )
        )
        .slice(
          0,
          5
        );

    $("recent").innerHTML =
      recentes.length
        ? recentes.map(
            c => `

              <div
                class="recent"
              >

                <b>
                  ${escaparHTML(
                    c.company
                  )}
                </b>

                <small>

                  ${escaparHTML(
                    c.phone
                  )}

                  •

                  ${escaparHTML(
                    c.stage
                  )}

                  •

                  ${escaparHTML(
                    c.updated
                  )}

                </small>

              </div>

            `
          ).join("")
        : `
          <div
            class="empty"
          >
            Nenhuma conversa.
          </div>
        `;
  }
}


/* ============================================================
   CONVERSAS
   ============================================================ */

function renderConversas(
  conversas
) {

  if (!$("rows")) {
    return;
  }

  const busca =
    (
      $("search")
        ?.value ||
      ""
    )
      .toLowerCase()
      .trim();

  const filtro =
    $("stageFilter")
      ?.value ||
    "";

  const filtradas =
    conversas.filter(
      c => {

        const texto =
          (
            c.company +
            " " +
            c.phone +
            " " +
            c.note
          )
            .toLowerCase();

        return (
          (
            !busca ||
            texto.includes(
              busca
            )
          ) &&
          (
            !filtro ||
            c.stage ===
            filtro
          )
        );
      }
    );

  $("rows").innerHTML =
    filtradas.length
      ? filtradas.map(
          c => `

            <tr>

              <td>

                <b>
                  ${escaparHTML(
                    c.company
                  )}
                </b>

              </td>

              <td>

                ${escaparHTML(
                  c.phone
                )}

              </td>

              <td>

                <span
                  class="pill"
                >
                  ${escaparHTML(
                    c.stage
                  )}
                </span>

              </td>

              <td>

                ${escaparHTML(
                  c.updated
                )}

              </td>

              <td>

                <button
                  type="button"
                  class="secondary view-btn"
                  data-id="${c.id}"
                >
                  Ver conversa
                </button>

              </td>

            </tr>

          `
        ).join("")
      : `

        <tr>

          <td
            colspan="5"
            class="empty"
          >
            Nenhum resultado.
          </td>

        </tr>

      `;

  document
    .querySelectorAll(
      ".view-btn"
    )
    .forEach(botao => {

      botao.onclick =
        () =>
          abrirConversa(
            Number(
              botao.dataset.id
            )
          );

    });
}


/* ============================================================
   FUNIL
   ============================================================ */

function renderFunil(
  conversas
) {

  if (!$("board")) {
    return;
  }

  $("board").innerHTML =
    ETAPAS.map(
      etapa => {

        const contatos =
          conversas.filter(
            c =>
              c.stage ===
              etapa
          );

        return `

          <div
            class="col"
          >

            <b>

              ${escaparHTML(
                etapa
              )}

              (${contatos.length})

            </b>

            ${
              contatos.length

                ? contatos.map(
                    c => `

                      <div
                        class="ticket"
                        data-id="${c.id}"
                      >

                        <b>
                          ${escaparHTML(
                            c.company
                          )}
                        </b>

                        <small>
                          ${escaparHTML(
                            c.phone
                          )}
                        </small>

                      </div>

                    `
                  ).join("")

                : `
                  <p
                    class="empty"
                  >
                    Nenhuma conversa.
                  </p>
                `
            }

          </div>

        `;
      }
    ).join("");

  document
    .querySelectorAll(
      ".ticket[data-id]"
    )
    .forEach(ticket => {

      ticket.onclick =
        () =>
          abrirConversa(
            Number(
              ticket.dataset.id
            )
          );

    });
}


/* ============================================================
   ANÁLISE
   ============================================================ */

function renderAnalise(
  conversas
) {

  const total =
    conversas.length;

  const respondidas =
    conversas.filter(
      c =>
        c.stage !==
        "Prospectado"
    ).length;

  const interessadas =
    conversas.filter(
      c =>
        [
          "Interessado",
          "Pediu modelo",
          "Orçamento / negociação",
          "Venda fechada"
        ].includes(
          c.stage
        )
    ).length;

  const modelos =
    conversas.filter(
      c =>
        [
          "Pediu modelo",
          "Orçamento / negociação",
          "Venda fechada"
        ].includes(
          c.stage
        )
    ).length;

  const vendas =
    conversas.filter(
      c =>
        c.stage ===
        "Venda fechada"
    ).length;

  if ($("responseRate")) {

    $("responseRate")
      .textContent =
      total
        ? Math.round(
            respondidas /
            total *
            100
          ) + "%"
        : "0%";
  }

  if ($("interestRate")) {

    $("interestRate")
      .textContent =
      respondidas
        ? Math.round(
            interessadas /
            respondidas *
            100
          ) + "%"
        : "0%";
  }

  if ($("modelRate")) {

    $("modelRate")
      .textContent =
      total
        ? Math.round(
            modelos /
            total *
            100
          ) + "%"
        : "0%";
  }

  if ($("saleRate")) {

    $("saleRate")
      .textContent =
      total
        ? Math.round(
            vendas /
            total *
            100
          ) + "%"
        : "0%";
  }

  if ($("dropoff")) {

    const maior =
      Math.max(
        ...ETAPAS.map(
          etapa =>
            conversas.filter(
              c =>
                c.stage ===
                etapa
            ).length
        ),
        1
      );

    $("dropoff").innerHTML =
      ETAPAS.map(
        etapa => {

          const quantidade =
            conversas.filter(
              c =>
                c.stage ===
                etapa
            ).length;

          const largura =
            quantidade
              ? Math.max(
                  4,
                  quantidade /
                    maior *
                    100
                )
              : 0;

          return `

            <div
              class="barline"
            >

              <div>

                <span>
                  ${escaparHTML(
                    etapa
                  )}
                </span>

                <b>
                  ${quantidade}
                </b>

              </div>

              <div
                class="bar"
              >

                <i
                  style="
                    width:${largura}%;
                  "
                ></i>

              </div>

            </div>

          `;

        }
      ).join("");
  }

  const tempos =
    conversas
      .map(
        c =>
          Number(
            c.firstReply
          )
      )
      .filter(
        n =>
          n > 0
      );

  const media =
    tempos.length
      ? Math.round(
          tempos.reduce(
            (a, b) =>
              a + b,
            0
          ) /
          tempos.length
        )
      : 0;

  if ($("timing")) {

    $("timing").innerHTML = `

      <p>

        <b>
          Média até primeira resposta:
        </b>

        ${media}
        minutos

      </p>

    `;
  }

  if ($("insight")) {

    $("insight").innerHTML = `

      <h2>
        Leitura dos dados
      </h2>

      <p>

        Há
        <b>
          ${respondidas}
        </b>
        conversa(s) que responderam.

      </p>

      <p>

        Há
        <b>
          ${interessadas}
        </b>
        conversa(s) em etapas
        de interesse ou posteriores.

      </p>

      <p>

        Há
        <b>
          ${vendas}
        </b>
        venda(s) fechada(s).

      </p>

    `;
  }
}


/* ============================================================
   ANOTAÇÕES
   ============================================================ */

function renderNotas(
  conversas
) {

  if (!$("notesList")) {
    return;
  }

  const anotacoes =
    carregarAnotacoes();

  const cards =
    conversas.map(
      c => `

        <div
          class="card notesItem"
        >

          <h3>

            ${escaparHTML(
              c.company
            )}

            <span
              class="pill"
            >
              ${escaparHTML(
                c.stage
              )}
            </span>

          </h3>

          <p>

            ${escaparHTML(
              c.note ||
              "Sem anotação."
            )}

          </p>

          <small>

            ${escaparHTML(
              c.phone
            )}

          </small>

        </div>

      `
    );

  const extras =
    anotacoes.map(
      n => `

        <div
          class="card notesItem"
        >

          <h3>
            Anotação
          </h3>

          <p>

            ${escaparHTML(
              n.texto
            )}

          </p>

          <small>

            ${escaparHTML(
              n.data
            )}

          </small>

        </div>

      `
    );

  $("notesList").innerHTML =
    [
      ...cards,
      ...extras
    ].join("")
    ||
    `
      <div
        class="card empty"
      >
        Nenhuma anotação.
      </div>
    `;
}


/* ============================================================
   RENDER
   ============================================================ */

function render() {

  const conversas =
    getConversas();

  renderDashboard(
    conversas
  );

  renderConversas(
    conversas
  );

  renderFunil(
    conversas
  );

  renderAnalise(
    conversas
  );

  renderNotas(
    conversas
  );
}


/* ============================================================
   ABRIR CONVERSA
   ============================================================ */

function abrirConversa(
  id
) {

  const conversa =
    getConversas().find(
      c =>
        Number(c.id) ===
        Number(id)
    );

  if (!conversa) {
    return;
  }

  selectedId =
    conversa.id;

  if ($("detailName")) {

    $("detailName")
      .textContent =
      conversa.company;
  }

  if ($("detailMeta")) {

    $("detailMeta")
      .textContent =
      `${conversa.phone} • ${conversa.stage} • última atividade ${conversa.updated}`;
  }

  if ($("detailSummary")) {

    $("detailSummary")
      .innerHTML = `

        <b>
          Etapa:
        </b>

        ${escaparHTML(
          conversa.stage
        )}

        <br>

        <b>
          Primeira resposta:
        </b>

        ${
          conversa.firstReply
            ? conversa.firstReply +
              " minutos"
            : "Não registrada"
        }

        <br>

        <b>
          Observação:
        </b>

        ${escaparHTML(
          conversa.note ||
          "Nenhuma"
        )}

      `;
  }

  if ($("detailNote")) {

    $("detailNote").value =
      conversa.note ||
      "";
  }

  const historico =
    Array.isArray(
      conversa.history
    )
      ? conversa.history
      : [];

  if ($("history")) {

    $("history").innerHTML =
      historico.length
        ? historico.map(
            m => `

              <div
                class="bubble ${
                  m.from ===
                  "client"
                    ? "client"
                    : "ig"
                }"
              >

                ${escaparHTML(
                  m.text
                )}

                <small>

                  ${
                    m.from ===
                    "client"
                      ? "Cliente"
                      : "IG Sites"
                  }

                  •
                  ${escaparHTML(
                    m.time ||
                    ""
                  )}

                </small>

              </div>

            `
          ).join("")
        : `

          <div
            class="empty"
          >

            Nenhum histórico
            registrado.

          </div>

        `;
  }

  if ($("conversationModal")) {

    $("conversationModal")
      .classList
      .add("show");
  }
}


/* ============================================================
   NOVA CONVERSA
   ============================================================ */

function abrirNovaConversa() {

  if ($("modal")) {

    $("modal")
      .classList
      .add("show");
  }
}

function salvarNovaConversa(
  event
) {

  event.preventDefault();

  const formulario =
    event.target;

  const dados =
    new FormData(
      formulario
    );

  const conversas =
    getConversas();

  const telefone =
    formatarTelefone(
      dados.get(
        "phone"
      )
    );

  if (
    telefoneJaExiste(
      telefone,
      conversas
    )
  ) {

    alert(
      "Este telefone já está cadastrado."
    );

    return;
  }

  conversas.push({

    id:
      gerarId(),

    company:
      String(
        dados.get(
          "company"
        ) ||
        ""
      ).trim(),

    phone:
      telefone,

    stage:
      dados.get(
        "stage"
      ) ||
      "Prospectado",

    firstReply:
      Number(
        dados.get(
          "firstReply"
        ) ||
        0
      ),

    updated:
      hoje(),

    note:
      String(
        dados.get(
          "note"
        ) ||
        ""
      ).trim(),

    history: []

  });

  salvarConversas(
    conversas
  );

  formulario.reset();

  if ($("modal")) {

    $("modal")
      .classList
      .remove("show");
  }

  render();
}


/* ============================================================
   SALVAR ANOTAÇÃO
   ============================================================ */

function salvarAnotacaoConversa() {

  const conversas =
    getConversas();

  const conversa =
    conversas.find(
      c =>
        Number(c.id) ===
        Number(selectedId)
    );

  if (!conversa) {
    return;
  }

  conversa.note =
    $("detailNote")
      ?.value
      ?.trim() ||
    "";

  conversa.updated =
    hoje();

  salvarConversas(
    conversas
  );

  const anotacoes =
    carregarAnotacoes();

  anotacoes.unshift({

    data:
      hoje(),

    texto:
      `${conversa.company}: ${
        conversa.note ||
        "Anotação removida."
      }`

  });

  salvarAnotacoes(
    anotacoes
  );

  render();

  abrirConversa(
    conversa.id
  );
}


/* ============================================================
   SELECTS
   ============================================================ */

function preencherSelects() {

  if ($("stageFilter")) {

    $("stageFilter")
      .innerHTML = `

        <option value="">
          Todas as etapas
        </option>

        ${ETAPAS.map(
          etapa => `

            <option
              value="${escaparHTML(
                etapa
              )}"
            >

              ${escaparHTML(
                etapa
              )}

            </option>

          `
        ).join("")}

      `;
  }

  if ($("newStage")) {

    $("newStage")
      .innerHTML =
      ETAPAS.map(
        etapa => `

          <option
            value="${escaparHTML(
              etapa
            )}"
          >

            ${escaparHTML(
              etapa
            )}

          </option>

        `
      ).join("");
  }
}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function inicializar() {

  /*
     Garante que o storage exista.
  */

  carregarConversas();

  /*
     Preenche selects.
  */

  preencherSelects();

  /*
     Configura menu.
  */

  configurarMenu();

  /*
     Botão e modal de importação.
  */

  criarBotaoImportar();

  criarModalImportacao();

  /*
     Busca.
  */

  $("search")
    ?.addEventListener(
      "input",
      render
    );

  /*
     Filtro.
  */

  $("stageFilter")
    ?.addEventListener(
      "change",
      render
    );

  /*
     Nova conversa.
  */

  $("newConversation")
    ?.addEventListener(
      "click",
      abrirNovaConversa
    );

  $("newConversation2")
    ?.addEventListener(
      "click",
      abrirNovaConversa
    );

  /*
     Cancelar modal.
  */

  $("cancel")
    ?.addEventListener(
      "click",
      () => {

        $("modal")
          ?.classList
          .remove(
            "show"
          );

      }
    );

  /*
     Formulário.
  */

  $("form")
    ?.addEventListener(
      "submit",
      salvarNovaConversa
    );

  /*
     Fechar conversa.
  */

  $("closeDetail")
    ?.addEventListener(
      "click",
      () => {

        $("conversationModal")
          ?.classList
          .remove(
            "show"
          );

      }
    );

  /*
     Salvar anotação.
  */

  $("saveNote")
    ?.addEventListener(
      "click",
      salvarAnotacaoConversa
    );

  /*
     Fechar modal clicando fora.
  */

  $("modal")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          $("modal")
        ) {

          $("modal")
            .classList
            .remove(
              "show"
            );
        }

      }
    );

  $("conversationModal")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          $("conversationModal")
        ) {

          $("conversationModal")
            .classList
            .remove(
              "show"
            );
        }

      }
    );

  /*
     Recupera a página atual.
  */

  carregarPaginaDoHash();

  /*
     Renderiza tudo.
  */

  render();
}


/* ============================================================
   FUNÇÕES DISPONÍVEIS GLOBALMENTE
   ============================================================ */

window.analisarLista =
  analisarLista;

window.importarContatos =
  importarContatos;

window.abrirConversa =
  abrirConversa;

window.mostrarPagina =
  mostrarPagina;

window.render =
  render;


/* ============================================================
   INICIAR
   ============================================================ */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    inicializar
  );

} else {

  inicializar();

}
