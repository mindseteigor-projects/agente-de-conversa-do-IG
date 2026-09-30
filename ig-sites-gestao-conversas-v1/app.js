/* ============================================================
   IG SITES — GESTÃO COMERCIAL
   app.js COMPLETO
   ============================================================

   - CRM somente para organização e análise
   - NÃO conecta ao WhatsApp
   - NÃO envia mensagens
   - Importação funciona COM ou SEM linhas em branco
   - Detecta empresa, telefone e etapa
   - Evita contatos duplicados
   - Mantém dados no localStorage
   ============================================================ */


/* ============================================================
   CONFIGURAÇÕES
   ============================================================ */

const STORAGE_KEY = "ig_sites_conversas";
const NOTES_KEY = "ig_sites_anotacoes";


/* ============================================================
   ETAPAS DO FUNIL
   ============================================================ */

const ETAPAS = [
  "Prospectado",
  "Respondeu",
  "Interessado",
  "Pediu modelo",
  "Orçamento / negociação",
  "Venda fechada",
  "Não avançou"
];


/* ============================================================
   DADOS INICIAIS
   ============================================================ */

const dadosIniciais = [
  {
    id: 1,
    empresa: "Oficina Exemplo",
    telefone: "(41) 99999-1111",
    etapa: "Interessado",
    ultimaAtividade: "2026-09-25",
    observacao: "Demonstrou interesse no site.",
    historico: [
      {
        data: "2026-09-25",
        texto: "Cliente demonstrou interesse."
      }
    ]
  },
  {
    id: 2,
    empresa: "Estética Modelo",
    telefone: "(41) 98888-2222",
    etapa: "Pediu modelo",
    ultimaAtividade: "2026-09-24",
    observacao: "Pediu para ver um modelo.",
    historico: [
      {
        data: "2026-09-24",
        texto: "Pediu modelo do site."
      }
    ]
  },
  {
    id: 3,
    empresa: "Mercado Fictício",
    telefone: "(41) 97777-3333",
    etapa: "Respondeu",
    ultimaAtividade: "2026-09-23",
    observacao: "Respondeu à abordagem.",
    historico: [
      {
        data: "2026-09-23",
        texto: "Respondeu à mensagem inicial."
      }
    ]
  },
  {
    id: 4,
    empresa: "Studio Demonstração",
    telefone: "(41) 96666-4444",
    etapa: "Orçamento / negociação",
    ultimaAtividade: "2026-09-22",
    observacao: "Entrou em conversa sobre preço.",
    historico: [
      {
        data: "2026-09-22",
        texto: "Conversa sobre orçamento."
      }
    ]
  },
  {
    id: 5,
    empresa: "Café Ilustrativo",
    telefone: "(41) 95555-5555",
    etapa: "Não avançou",
    ultimaAtividade: "2026-09-20",
    observacao: "Não demonstrou interesse.",
    historico: [
      {
        data: "2026-09-20",
        texto: "Não avançou."
      }
    ]
  },
  {
    id: 6,
    empresa: "Auto Demo",
    telefone: "(41) 94444-6666",
    etapa: "Venda fechada",
    ultimaAtividade: "2026-09-19",
    observacao: "Venda fechada.",
    historico: [
      {
        data: "2026-09-19",
        texto: "Venda fechada."
      }
    ]
  }
];


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}


function hoje() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


function normalizarTelefone(telefone) {
  let numero = String(telefone || "")
    .replace(/\D/g, "");

  if (numero.startsWith("55") && numero.length > 11) {
    numero = numero.substring(2);
  }

  return numero;
}


function formatarTelefone(telefone) {
  let numero = String(telefone || "")
    .replace(/\D/g, "");

  if (numero.startsWith("55") && numero.length > 11) {
    numero = numero.substring(2);
  }

  if (numero.length === 11) {
    return `(${numero.substring(0, 2)}) ${numero.substring(2, 7)}-${numero.substring(7)}`;
  }

  if (numero.length === 10) {
    return `(${numero.substring(0, 2)}) ${numero.substring(2, 6)}-${numero.substring(6)}`;
  }

  return telefone;
}


function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ============================================================
   STORAGE
   ============================================================ */

function carregarConversas() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dadosIniciais)
      );

      return [...dadosIniciais];
    }

    const conversas = JSON.parse(dados);

    if (!Array.isArray(conversas)) {
      return [];
    }

    return conversas;

  } catch (erro) {
    console.error("Erro ao carregar conversas:", erro);
    return [];
  }
}


function salvarConversas(conversas) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(conversas)
  );
}


function carregarAnotacoes() {
  try {
    const dados = localStorage.getItem(NOTES_KEY);

    if (!dados) {
      return [];
    }

    const anotacoes = JSON.parse(dados);

    return Array.isArray(anotacoes)
      ? anotacoes
      : [];

  } catch (erro) {
    console.error("Erro ao carregar anotações:", erro);
    return [];
  }
}


function salvarAnotacoes(anotacoes) {
  localStorage.setItem(
    NOTES_KEY,
    JSON.stringify(anotacoes)
  );
}


/* ============================================================
   ETAPAS
   ============================================================ */

function etapaValida(etapa) {
  return ETAPAS.includes(etapa);
}


/* ============================================================
   NORMALIZAÇÃO DE TEXTO
   ============================================================ */

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/* ============================================================
   DETECTAR ETAPA
   ============================================================ */

function detectarEtapa(texto) {
  const t = normalizarTexto(texto);

  /*
     VENDA FECHADA
  */

  if (
    t.includes("venda fechada") ||
    t.includes("venda realizada") ||
    t.includes("cliente fechado") ||
    t.includes("fechou") ||
    t.includes("fechamento") ||
    t === "venda"
  ) {
    return "Venda fechada";
  }


  /*
     NÃO AVANÇOU
  */

  if (
    t.includes("nao tenho interesse") ||
    t.includes("sem interesse") ||
    t.includes("nao quero") ||
    t.includes("nao tenho interesse") ||
    t.includes("não tenho interesse") ||
    t.includes("não quero") ||
    t.includes("nao avancou") ||
    t.includes("não avançou") ||
    t.includes("desistiu")
  ) {
    return "Não avançou";
  }


  /*
     ORÇAMENTO / NEGOCIAÇÃO
  */

  if (
    t.includes("orcamento") ||
    t.includes("orçamento") ||
    t.includes("negociacao") ||
    t.includes("negociação") ||
    t.includes("quanto custa") ||
    t.includes("quanto fica") ||
    t.includes("qual o preco") ||
    t.includes("qual o preço") ||
    t.includes("preco") ||
    t.includes("preço") ||
    t.includes("valor do site") ||
    t.includes("valor")
  ) {
    return "Orçamento / negociação";
  }


  /*
     PEDIU MODELO
  */

  if (
    t.includes("pediu modelo") ||
    t.includes("pedir modelo") ||
    t.includes("manda o modelo") ||
    t.includes("mandar modelo") ||
    t.includes("mande o modelo") ||
    t.includes("enviar modelo") ||
    t.includes("envia o modelo") ||
    t.includes("quero ver o modelo") ||
    t.includes("ver o modelo") ||
    t.includes("ver modelo") ||
    t.includes("quer ver o site") ||
    t.includes("modelo do site") ||
    t.includes("me mostra o modelo") ||
    t.includes("me mostre o modelo")
  ) {
    return "Pediu modelo";
  }


  /*
     INTERESSADO

     Essa etapa vem depois de "Pediu modelo"
     e "Orçamento", porque essas frases são
     mais específicas.
  */

  if (
    t.includes("tenho interesse") ||
    t.includes("interessado") ||
    t.includes("tenho interesse sim") ||
    t.includes("gostei") ||
    t.includes("quero fazer") ||
    t.includes("quero sim") ||
    t.includes("vamos fazer") ||
    t.includes("pode fazer") ||
    t.includes("tenho interesse no site") ||
    t.includes("tenho interesse no projeto")
  ) {
    return "Interessado";
  }


  /*
     RESPONDEU
  */

  if (
    t === "respondeu" ||
    t.includes("respondeu") ||
    t.includes("resposta")
  ) {
    return "Respondeu";
  }


  /*
     WHATSAPP CONFIRMADO NÃO É ETAPA.
     Portanto:
  */

  return "Prospectado";
}


/* ============================================================
   IDENTIFICAR TELEFONE
   ============================================================ */

function extrairTelefone(texto) {
  if (!texto) {
    return null;
  }

  const original = String(texto);

  /*
     Primeiro procuramos números com DDD explícito.
  */

  const numeros = original.replace(/\D/g, "");

  /*
     Número com código do Brasil.
  */

  if (
    numeros.startsWith("55") &&
    numeros.length >= 12 &&
    numeros.length <= 13
  ) {
    const sem55 = numeros.substring(2);

    if (
      sem55.length === 10 ||
      sem55.length === 11
    ) {
      return formatarTelefone(sem55);
    }
  }


  /*
     Número brasileiro normal.
  */

  if (
    numeros.length === 10 ||
    numeros.length === 11
  ) {
    return formatarTelefone(numeros);
  }


  /*
     Regex para casos em que existem outros caracteres.
  */

  const padrao =
    /(?:\+?55[\s.-]*)?\(?\d{2}\)?[\s.-]*9?[\s.-]*\d{4}[\s.-]*\d{4}/;

  const resultado =
    original.match(padrao);

  if (!resultado) {
    return null;
  }

  const limpo =
    resultado[0].replace(/\D/g, "");

  const sem55 =
    limpo.startsWith("55")
      ? limpo.substring(2)
      : limpo;

  if (
    sem55.length === 10 ||
    sem55.length === 11
  ) {
    return formatarTelefone(sem55);
  }

  return null;
}


function linhaEhTelefone(linha) {
  return !!extrairTelefone(linha);
}


/* ============================================================
   IMPORTAÇÃO DE LISTA
   ============================================================

   FUNCIONA COM:

   Empresa
   Telefone
   Status

   Empresa
   Telefone
   Status

   E TAMBÉM:

   Empresa
   Telefone
   Status
   Empresa
   Telefone
   Status

   Ou seja: NÃO depende de linhas vazias.
   ============================================================ */

function analisarLista(texto) {

  const linhas = String(texto || "")
    .split(/\r?\n/)
    .map(linha => linha.trim())
    .filter(linha => linha.length > 0);


  const contatos = [];

  let empresaAtual = null;
  let telefoneAtual = null;
  let informacoesAtual = [];


  function finalizarContato() {

    if (!telefoneAtual) {
      return;
    }

    const informacao =
      informacoesAtual
        .join(" | ")
        .trim();


    contatos.push({

      empresa:
        empresaAtual ||
        "Empresa sem nome",

      telefone:
        formatarTelefone(
          telefoneAtual
        ),

      etapa:
        detectarEtapa(
          informacao
        ),

      observacao:
        informacao,

      fonte:
        "importacao"

    });


    empresaAtual = null;
    telefoneAtual = null;
    informacoesAtual = [];
  }


  for (
    let i = 0;
    i < linhas.length;
    i++
  ) {

    const linha =
      linhas[i];


    /*
       ENCONTROU TELEFONE
    */

    if (
      linhaEhTelefone(linha)
    ) {

      /*
         Se já existe um telefone,
         significa que o contato anterior
         terminou.
      */

      if (telefoneAtual) {
        finalizarContato();
      }


      telefoneAtual =
        extrairTelefone(linha);

      continue;
    }


    /*
       AINDA NÃO TEMOS TELEFONE

       Portanto, a primeira linha encontrada
       é o nome da empresa.
    */

    if (!telefoneAtual) {

      if (!empresaAtual) {

        empresaAtual =
          linha;
      }

      continue;
    }


    /*
       JÁ TEMOS:

       empresa
       +
       telefone

       Portanto, qualquer linha seguinte
       pertence à informação/status desse
       contato.
    */

    informacoesAtual.push(
      linha
    );
  }


  /*
     FINALIZAR ÚLTIMO CONTATO
  */

  finalizarContato();


  /*
     REMOVER DUPLICADOS
  */

  return removerDuplicadosImportacao(
    contatos
  );
}


/* ============================================================
   REMOVER DUPLICADOS DA IMPORTAÇÃO
   ============================================================ */

function removerDuplicadosImportacao(
  contatos
) {

  const mapa =
    new Map();


  for (
    const contato of contatos
  ) {

    const telefone =
      normalizarTelefone(
        contato.telefone
      );


    if (!telefone) {
      continue;
    }


    if (
      !mapa.has(telefone)
    ) {

      mapa.set(
        telefone,
        contato
      );
    }
  }


  return Array.from(
    mapa.values()
  );
}


/* ============================================================
   VERIFICAR DUPLICADO NO CRM
   ============================================================ */

function telefoneJaExiste(
  telefone,
  conversas
) {

  const numero =
    normalizarTelefone(
      telefone
    );


  return conversas.some(
    conversa =>
      normalizarTelefone(
        conversa.telefone
      ) === numero
  );
}


/* ============================================================
   IMPORTAR CONTATOS
   ============================================================ */

function importarContatos(
  contatos
) {

  const conversas =
    carregarConversas();


  let adicionados = 0;
  let duplicados = 0;


  contatos.forEach(
    contato => {

      if (!contato.telefone) {
        return;
      }


      if (
        telefoneJaExiste(
          contato.telefone,
          conversas
        )
      ) {

        duplicados++;

        return;
      }


      const novaConversa = {

        id:
          gerarId(),

        empresa:
          contato.empresa ||
          "Empresa sem nome",

        telefone:
          formatarTelefone(
            contato.telefone
          ),

        etapa:
          etapaValida(
            contato.etapa
          )
            ? contato.etapa
            : "Prospectado",

        ultimaAtividade:
          hoje(),

        observacao:
          contato.observacao ||
          "",

        historico: [

          {

            data:
              hoje(),

            texto:
              contato.observacao
                ? `Contato importado. Informação: ${contato.observacao}`
                : "Contato importado."

          }

        ]

      };


      conversas.push(
        novaConversa
      );


      adicionados++;
    }
  );


  salvarConversas(
    conversas
  );


  return {
    adicionados,
    duplicados
  };
}


/* ============================================================
   INTERFACE DE IMPORTAÇÃO
   ============================================================ */

function criarInterfaceImportacao() {

  if (
    document.getElementById(
      "igImportarListaBtn"
    )
  ) {
    return;
  }


  const botoes =
    Array.from(
      document.querySelectorAll(
        "button"
      )
    );


  const botaoRegistro =
    botoes.find(
      botao =>
        botao.textContent
          .toLowerCase()
          .includes(
            "registrar conversa"
          )
    );


  const botao =
    document.createElement(
      "button"
    );


  botao.id =
    "igImportarListaBtn";


  botao.type =
    "button";


  botao.innerHTML =
    "⇩ Importar lista";


  botao.style.cssText = `
    margin-left: 10px;
    padding: 11px 18px;
    border: 0;
    border-radius: 10px;
    background: #eef2f7;
    color: #142033;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  `;


  botao.addEventListener(
    "click",
    abrirModalImportacao
  );


  if (
    botaoRegistro &&
    botaoRegistro.parentElement
  ) {

    botaoRegistro.parentElement.appendChild(
      botao
    );

  } else {

    document.body.appendChild(
      botao
    );
  }
}


/* ============================================================
   MODAL DE IMPORTAÇÃO
   ============================================================ */

function criarModalImportacao() {

  if (
    document.getElementById(
      "igImportModal"
    )
  ) {
    return;
  }


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "igImportModal";


  modal.innerHTML = `

    <div
      id="igImportOverlay"
      style="
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.45);
        z-index:9998;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      "
    >

      <div
        style="
          width:min(760px,100%);
          max-height:90vh;
          overflow:auto;
          background:white;
          border-radius:18px;
          box-shadow:0 25px 70px rgba(0,0,0,.20);
          padding:26px;
        "
      >

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:20px;
            margin-bottom:8px;
          "
        >

          <div>

            <h2
              style="
                margin:0;
                color:#111827;
                font-size:22px;
              "
            >
              Importar lista de contatos
            </h2>

            <p
              style="
                margin:7px 0 0;
                color:#64748b;
                font-size:14px;
              "
            >
              Cole sua lista. O sistema identifica
              empresa, telefone e etapa automaticamente.
            </p>

          </div>


          <button
            id="igFecharImportModal"
            type="button"
            style="
              border:0;
              background:#f1f5f9;
              border-radius:9px;
              width:38px;
              height:38px;
              cursor:pointer;
              font-size:20px;
            "
          >
            ×
          </button>

        </div>


        <div
          style="
            margin-top:20px;
            padding:13px 15px;
            border-radius:10px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            color:#475569;
            font-size:13px;
            line-height:1.6;
          "
        >

          <strong>
            Pode colar com ou sem linhas em branco.
          </strong>

          <br><br>

          Exemplo:

          <br><br>

          Oficina Motor Sul<br>
          (41) 99999-1001<br>
          Prospectado<br>
          Estética Bella Vida<br>
          (41) 98888-1002<br>
          Respondeu

          <br><br>

          O sistema reconhece o telefone como
          separador de cada contato.

        </div>


        <textarea
          id="igImportTextarea"
          placeholder="Cole sua lista aqui..."
          style="
            width:100%;
            min-height:260px;
            margin-top:16px;
            padding:15px;
            box-sizing:border-box;
            border:1px solid #cbd5e1;
            border-radius:12px;
            resize:vertical;
            font-family:inherit;
            font-size:14px;
            line-height:1.55;
            outline:none;
          "
        ></textarea>


        <div
          id="igImportResultado"
          style="
            margin-top:15px;
            display:none;
          "
        ></div>


        <div
          style="
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-top:18px;
            flex-wrap:wrap;
          "
        >

          <button
            id="igCancelarImportacao"
            type="button"
            style="
              padding:11px 17px;
              border:1px solid #cbd5e1;
              border-radius:9px;
              background:white;
              color:#334155;
              font-weight:600;
              cursor:pointer;
            "
          >
            Cancelar
          </button>


          <button
            id="igAnalisarImportacao"
            type="button"
            style="
              padding:11px 17px;
              border:0;
              border-radius:9px;
              background:#3159d9;
              color:white;
              font-weight:600;
              cursor:pointer;
            "
          >
            Analisar lista
          </button>


          <button
            id="igConfirmarImportacao"
            type="button"
            style="
              display:none;
              padding:11px 17px;
              border:0;
              border-radius:9px;
              background:#16a34a;
              color:white;
              font-weight:600;
              cursor:pointer;
            "
          >
            Importar contatos
          </button>

        </div>

      </div>

    </div>
  `;


  document.body.appendChild(
    modal
  );


  modal.style.display =
    "none";


  document
    .getElementById(
      "igFecharImportModal"
    )
    .addEventListener(
      "click",
      fecharModalImportacao
    );


  document
    .getElementById(
      "igCancelarImportacao"
    )
    .addEventListener(
      "click",
      fecharModalImportacao
    );


  document
    .getElementById(
      "igAnalisarImportacao"
    )
    .addEventListener(
      "click",
      analisarImportacaoInterface
    );


  document
    .getElementById(
      "igConfirmarImportacao"
    )
    .addEventListener(
      "click",
      confirmarImportacaoInterface
    );
}


/* ============================================================
   ABRIR MODAL
   ============================================================ */

function abrirModalImportacao() {

  const modal =
    document.getElementById(
      "igImportModal"
    );


  if (!modal) {
    return;
  }


  modal.style.display =
    "block";


  const textarea =
    document.getElementById(
      "igImportTextarea"
    );


  const resultado =
    document.getElementById(
      "igImportResultado"
    );


  const confirmar =
    document.getElementById(
      "igConfirmarImportacao"
    );


  if (textarea) {
    textarea.value = "";
  }


  if (resultado) {

    resultado.style.display =
      "none";

    resultado.innerHTML =
      "";
  }


  if (confirmar) {

    confirmar.style.display =
      "none";
  }


  window.igContatosImportacao =
    [];


  setTimeout(
    () => textarea?.focus(),
    100
  );
}


/* ============================================================
   FECHAR MODAL
   ============================================================ */

function fecharModalImportacao() {

  const modal =
    document.getElementById(
      "igImportModal"
    );


  if (modal) {

    modal.style.display =
      "none";
  }


  window.igContatosImportacao =
    [];
}


/* ============================================================
   ANALISAR IMPORTAÇÃO NA INTERFACE
   ============================================================ */

function analisarImportacaoInterface() {

  const textarea =
    document.getElementById(
      "igImportTextarea"
    );


  const resultado =
    document.getElementById(
      "igImportResultado"
    );


  const confirmar =
    document.getElementById(
      "igConfirmarImportacao"
    );


  if (!textarea || !resultado) {
    return;
  }


  const texto =
    textarea.value.trim();


  if (!texto) {

    resultado.style.display =
      "block";


    resultado.innerHTML = `

      <div
        style="
          padding:13px;
          border-radius:10px;
          background:#fef2f2;
          color:#991b1b;
          border:1px solid #fecaca;
        "
      >
        Cole uma lista de contatos antes de analisar.
      </div>

    `;


    if (confirmar) {
      confirmar.style.display =
        "none";
    }


    return;
  }


  const contatos =
    analisarLista(
      texto
    );


  window.igContatosImportacao =
    contatos;


  if (!contatos.length) {

    resultado.style.display =
      "block";


    resultado.innerHTML = `

      <div
        style="
          padding:13px;
          border-radius:10px;
          background:#fef2f2;
          color:#991b1b;
          border:1px solid #fecaca;
        "
      >
        Não consegui identificar nenhum contato.
        <br><br>
        Verifique se a lista possui empresa e telefone.
      </div>

    `;


    if (confirmar) {
      confirmar.style.display =
        "none";
    }


    return;
  }


  const conversas =
    carregarConversas();


  let novos = 0;
  let duplicados = 0;


  contatos.forEach(
    contato => {

      if (
        telefoneJaExiste(
          contato.telefone,
          conversas
        )
      ) {

        duplicados++;

      } else {

        novos++;
      }
    }
  );


  let tabela = `

    <div
      style="
        padding:14px;
        border-radius:10px;
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        margin-bottom:14px;
      "
    >

      <strong
        style="
          color:#166534;
        "
      >
        ${contatos.length}
        contato(s) identificado(s)
      </strong>

      <div
        style="
          margin-top:5px;
          color:#475569;
          font-size:13px;
        "
      >
        ${novos}
        novo(s) serão importados.

        ${duplicados}
        já existem no CRM.
      </div>

    </div>


    <div
      style="
        border:1px solid #e2e8f0;
        border-radius:10px;
        overflow:auto;
        max-height:300px;
      "
    >

      <table
        style="
          width:100%;
          border-collapse:collapse;
          font-size:13px;
        "
      >

        <thead>

          <tr
            style="
              background:#f8fafc;
              text-align:left;
            "
          >

            <th style="padding:10px;">
              Empresa
            </th>

            <th style="padding:10px;">
              Telefone
            </th>

            <th style="padding:10px;">
              Etapa
            </th>

          </tr>

        </thead>

        <tbody>
  `;


  contatos.forEach(
    contato => {

      const existe =
        telefoneJaExiste(
          contato.telefone,
          conversas
        );


      tabela += `

        <tr
          style="
            border-top:1px solid #e2e8f0;
            ${existe ? "opacity:.55;" : ""}
          "
        >

          <td style="padding:10px;">
            ${escaparHTML(
              contato.empresa
            )}
          </td>

          <td style="padding:10px;">
            ${escaparHTML(
              contato.telefone
            )}
          </td>

          <td style="padding:10px;">

            <span
              style="
                display:inline-block;
                padding:4px 8px;
                border-radius:999px;
                background:#eef2ff;
                color:#3159d9;
                font-size:11px;
              "
            >
              ${escaparHTML(
                contato.etapa
              )}
            </span>

          </td>

        </tr>

      `;
    }
  );


  tabela += `

        </tbody>

      </table>

    </div>

  `;


  resultado.style.display =
    "block";


  resultado.innerHTML =
    tabela;


  if (confirmar) {

    confirmar.style.display =
      novos > 0
        ? "inline-block"
        : "none";
  }
}


/* ============================================================
   CONFIRMAR IMPORTAÇÃO
   ============================================================ */

function confirmarImportacaoInterface() {

  const contatos =
    window.igContatosImportacao ||
    [];


  if (!contatos.length) {
    return;
  }


  const resultado =
    importarContatos(
      contatos
    );


  const elemento =
    document.getElementById(
      "igImportResultado"
    );


  if (elemento) {

    elemento.style.display =
      "block";


    elemento.innerHTML = `

      <div
        style="
          padding:15px;
          border-radius:10px;
          background:#f0fdf4;
          border:1px solid #bbf7d0;
          color:#166534;
        "
      >

        <strong>
          Importação concluída.
        </strong>

        <div
          style="
            margin-top:7px;
          "
        >
          ${resultado.adicionados}
          contato(s) adicionado(s).
        </div>

        <div
          style="
            margin-top:3px;
          "
        >
          ${resultado.duplicados}
          contato(s) ignorado(s) porque
          já estavam no CRM.
        </div>

      </div>

    `;
  }


  const confirmar =
    document.getElementById(
      "igConfirmarImportacao"
    );


  if (confirmar) {

    confirmar.style.display =
      "none";
  }


  window.igContatosImportacao =
    [];


  render();
}


/* ============================================================
   FILTRAR CONVERSAS
   ============================================================ */

function obterConversasFiltradas() {

  const conversas =
    carregarConversas();


  const input =
    document.getElementById(
      "searchInput"
    );


  const select =
    document.getElementById(
      "stageFilter"
    );


  const busca =
    input?.value
      ?.toLowerCase()
      ?.trim() ||
    "";


  const filtro =
    select?.value ||
    "";


  return conversas.filter(
    conversa => {

      const textoBusca = `

        ${conversa.empresa || ""}

        ${conversa.telefone || ""}

        ${conversa.observacao || ""}

      `.toLowerCase();


      const correspondeBusca =
        !busca ||
        textoBusca.includes(
          busca
        );


      const correspondeEtapa =
        !filtro ||
        filtro === "Todas as etapas" ||
        conversa.etapa === filtro;


      return (
        correspondeBusca &&
        correspondeEtapa
      );
    }
  );
}


/* ============================================================
   RENDER PRINCIPAL
   ============================================================ */

function render() {

  renderListaConversas();

  atualizarContadores();

  atualizarFunil();

  atualizarAnalise();

  atualizarAnotacoes();

  renderDashboard();
}


/* ============================================================
   RENDER CONVERSAS
   ============================================================ */

function renderListaConversas() {

  const conversas =
    obterConversasFiltradas();


  const tbody =
    document.querySelector(
      "#conversationsTable tbody"
    ) ||
    document.querySelector(
      "#conversations-table tbody"
    ) ||
    document.querySelector(
      "table tbody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML =
    "";


  conversas.forEach(
    conversa => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          <strong>
            ${escaparHTML(
              conversa.empresa
            )}
          </strong>
        </td>

        <td>
          ${escaparHTML(
            conversa.telefone
          )}
        </td>

        <td>

          <span
            class="stage-badge"
          >
            ${escaparHTML(
              conversa.etapa
            )}
          </span>

        </td>

        <td>
          ${escaparHTML(
            conversa.ultimaAtividade
          )}
        </td>

        <td>

          <button
            type="button"
            class="view-conversation-btn"
            data-id="${conversa.id}"
          >
            Ver conversa
          </button>

        </td>

      `;


      tbody.appendChild(
        tr
      );
    }
  );


  document
    .querySelectorAll(
      ".view-conversation-btn"
    )
    .forEach(
      botao => {

        botao.addEventListener(
          "click",
          () => {

            abrirConversa(
              Number(
                botao.dataset.id
              )
            );
          }
        );
      }
    );
}


/* ============================================================
   ABRIR CONVERSA
   ============================================================ */

function abrirConversa(id) {

  const conversas =
    carregarConversas();


  const conversa =
    conversas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!conversa) {
    return;
  }


  let modal =
    document.getElementById(
      "conversationModal"
    );


  if (!modal) {

    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "conversationModal";


    modal.innerHTML = `

      <div
        style="
          position:fixed;
          inset:0;
          background:rgba(15,23,42,.45);
          z-index:9997;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
        "
      >

        <div
          style="
            background:white;
            width:min(650px,100%);
            max-height:90vh;
            overflow:auto;
            border-radius:18px;
            padding:25px;
          "
        >

          <div
            id="conversationModalContent"
          ></div>

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );
  }


  const content =
    document.getElementById(
      "conversationModalContent"
    );


  if (!content) {
    return;
  }


  const historico =
    Array.isArray(
      conversa.historico
    )
      ? conversa.historico
      : [];


  content.innerHTML = `

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:15px;
      "
    >

      <div>

        <h2
          style="
            margin:0;
          "
        >
          ${escaparHTML(
            conversa.empresa
          )}
        </h2>

        <p
          style="
            margin:5px 0 0;
            color:#64748b;
          "
        >
          ${escaparHTML(
            conversa.telefone
          )}
        </p>

      </div>


      <button
        id="fecharConversationModal"
        type="button"
        style="
          border:0;
          background:#f1f5f9;
          border-radius:8px;
          width:36px;
          height:36px;
          cursor:pointer;
          font-size:20px;
        "
      >
        ×
      </button>

    </div>


    <div
      style="
        margin-top:20px;
        padding:14px;
        background:#f8fafc;
        border-radius:10px;
      "
    >

      <strong>
        Etapa:
      </strong>

      ${escaparHTML(
        conversa.etapa
      )}

      <br><br>

      <strong>
        Última atividade:
      </strong>

      ${escaparHTML(
        conversa.ultimaAtividade
      )}

    </div>


    ${
      conversa.observacao
        ? `

          <div
            style="
              margin-top:15px;
              padding:14px;
              border:1px solid #e2e8f0;
              border-radius:10px;
            "
          >

            <strong>
              Observação
            </strong>

            <p
              style="
                margin:8px 0 0;
                color:#475569;
              "
            >
              ${escaparHTML(
                conversa.observacao
              )}
            </p>

          </div>

        `
        : ""
    }


    <h3
      style="
        margin-top:22px;
      "
    >
      Histórico
    </h3>


    <div>

      ${
        historico.length
          ? historico
              .map(
                item => `

                  <div
                    style="
                      padding:12px;
                      border-bottom:1px solid #e2e8f0;
                    "
                  >

                    <div
                      style="
                        font-size:12px;
                        color:#64748b;
                      "
                    >
                      ${escaparHTML(
                        item.data
                      )}
                    </div>

                    <div
                      style="
                        margin-top:4px;
                      "
                    >
                      ${escaparHTML(
                        item.texto
                      )}
                    </div>

                  </div>

                `
              )
              .join("")
          : `

              <p
                style="
                  color:#64748b;
                "
              >
                Nenhum histórico registrado.
              </p>

            `
      }

    </div>

  `;


  modal.style.display =
    "block";


  document
    .getElementById(
      "fecharConversationModal"
    )
    ?.addEventListener(
      "click",
      () => {

        modal.style.display =
          "none";
      }
    );
}


/* ============================================================
   CONTADORES
   ============================================================ */

function atualizarContadores() {

  const conversas =
    carregarConversas();


  const total =
    conversas.length;


  const respondidas =
    conversas.filter(
      conversa =>
        conversa.etapa !==
        "Prospectado"
    ).length;


  const interessadas =
    conversas.filter(
      conversa =>
        conversa.etapa ===
          "Interessado" ||
        conversa.etapa ===
          "Pediu modelo" ||
        conversa.etapa ===
          "Orçamento / negociação" ||
        conversa.etapa ===
          "Venda fechada"
    ).length;


  const vendas =
    conversas.filter(
      conversa =>
        conversa.etapa ===
        "Venda fechada"
    ).length;


  atualizarElementoTexto(
    [
      "totalConversas",
      "total-conversas"
    ],
    total
  );


  atualizarElementoTexto(
    [
      "respondidas",
      "totalRespondidas"
    ],
    respondidas
  );


  atualizarElementoTexto(
    [
      "interessadas",
      "totalInteressadas"
    ],
    interessadas
  );


  atualizarElementoTexto(
    [
      "vendasFechadas",
      "totalVendas"
    ],
    vendas
  );
}


function atualizarElementoTexto(
  ids,
  valor
) {

  ids.forEach(
    id => {

      const elemento =
        document.getElementById(
          id
        );


      if (elemento) {

        elemento.textContent =
          valor;
      }
    }
  );
}


/* ============================================================
   FUNIL
   ============================================================ */

function atualizarFunil() {

  const conversas =
    carregarConversas();


  const contagem =
    {};


  ETAPAS.forEach(
    etapa => {

      contagem[etapa] =
        0;
    }
  );


  conversas.forEach(
    conversa => {

      if (
        contagem[
          conversa.etapa
        ] !== undefined
      ) {

        contagem[
          conversa.etapa
        ]++;
      }
    }
  );


  ETAPAS.forEach(
    etapa => {

      const id =
        normalizarTexto(
          etapa
        )
          .replace(
            /[^a-z0-9]+/g,
            "-"
          );


      atualizarElementoTexto(
        [
          `funil-${id}`,
          `funnel-${id}`,
          `stage-${id}`
        ],
        contagem[etapa]
      );
    }
  );
}


/* ============================================================
   ANÁLISE
   ============================================================ */

function atualizarAnalise() {

  const conversas =
    carregarConversas();


  const total =
    conversas.length;


  if (!total) {

    atualizarElementoTexto(
      ["taxaResposta"],
      "0%"
    );

    atualizarElementoTexto(
      ["taxaInteresse"],
      "0%"
    );

    atualizarElementoTexto(
      ["taxaModelo"],
      "0%"
    );

    atualizarElementoTexto(
      ["taxaVenda"],
      "0%"
    );

    return;
  }


  const respondidas =
    conversas.filter(
      conversa =>
        conversa.etapa !==
        "Prospectado"
    ).length;


  const interessadas =
    conversas.filter(
      conversa =>
        conversa.etapa ===
          "Interessado" ||
        conversa.etapa ===
          "Pediu modelo" ||
        conversa.etapa ===
          "Orçamento / negociação" ||
        conversa.etapa ===
          "Venda fechada"
    ).length;


  const modelos =
    conversas.filter(
      conversa =>
        conversa.etapa ===
        "Pediu modelo"
    ).length;


  const vendas =
    conversas.filter(
      conversa =>
        conversa.etapa ===
        "Venda fechada"
    ).length;


  const taxaResposta =
    (
      respondidas /
      total
    ) * 100;


  const taxaInteresse =
    (
      interessadas /
      total
    ) * 100;


  const taxaModelo =
    (
      modelos /
      total
    ) * 100;


  const taxaVenda =
    (
      vendas /
      total
    ) * 100;


  atualizarElementoTexto(
    ["taxaResposta"],
    `${taxaResposta.toFixed(1)}%`
  );


  atualizarElementoTexto(
    ["taxaInteresse"],
    `${taxaInteresse.toFixed(1)}%`
  );


  atualizarElementoTexto(
    ["taxaModelo"],
    `${taxaModelo.toFixed(1)}%`
  );


  atualizarElementoTexto(
    ["taxaVenda"],
    `${taxaVenda.toFixed(1)}%`
  );
}


/* ============================================================
   ANOTAÇÕES
   ============================================================ */

function atualizarAnotacoes() {

  const anotacoes =
    carregarAnotacoes();


  const container =
    document.getElementById(
      "anotacoesLista"
    );


  if (!container) {
    return;
  }


  if (!anotacoes.length) {

    container.innerHTML = `

      <p
        style="
          color:#64748b;
        "
      >
        Nenhuma anotação registrada.
      </p>

    `;

    return;
  }


  container.innerHTML =
    anotacoes
      .map(
        anotacao => `

          <div
            style="
              padding:13px;
              border-bottom:1px solid #e2e8f0;
            "
          >

            <div
              style="
                font-size:12px;
                color:#64748b;
              "
            >
              ${escaparHTML(
                anotacao.data
              )}
            </div>

            <div
              style="
                margin-top:5px;
              "
            >
              ${escaparHTML(
                anotacao.texto
              )}
            </div>

          </div>

        `
      )
      .join("");
}


/* ============================================================
   DASHBOARD / VISÃO GERAL
   ============================================================ */

function renderDashboard() {

  const conversas =
    carregarConversas();


  const recentes =
    [...conversas]
      .sort(
        (a, b) =>
          String(
            b.ultimaAtividade
          ).localeCompare(
            String(
              a.ultimaAtividade
            )
          )
      )
      .slice(0, 5);


  /*
     Procura containers comuns.
  */

  const containers =
    [
      "recentConversations",
      "conversasRecentes",
      "recentes",
      "recent-conversations"
    ];


  let container = null;


  for (
    const id of containers
  ) {

    const elemento =
      document.getElementById(
        id
      );


    if (elemento) {

      container =
        elemento;

      break;
    }
  }


  if (!container) {
    return;
  }


  if (!recentes.length) {

    container.innerHTML = "";

    return;
  }


  container.innerHTML =
    recentes
      .map(
        conversa => `

          <div
            style="
              padding:10px 0;
              border-bottom:1px solid #e2e8f0;
            "
          >

            <strong>
              ${escaparHTML(
                conversa.empresa
              )}
            </strong>

            <div
              style="
                font-size:12px;
                color:#64748b;
                margin-top:3px;
              "
            >
              ${escaparHTML(
                conversa.etapa
              )}
            </div>

          </div>

        `
      )
      .join("");
}


/* ============================================================
   FILTROS
   ============================================================ */

function configurarFiltros() {

  const search =
    document.getElementById(
      "searchInput"
    );


  const filtro =
    document.getElementById(
      "stageFilter"
    );


  if (search) {

    search.addEventListener(
      "input",
      render
    );
  }


  if (filtro) {

    filtro.addEventListener(
      "change",
      render
    );
  }
}


/* ============================================================
   FILTRO DE ETAPAS
   ============================================================ */

function configurarFiltroEtapas() {

  const select =
    document.getElementById(
      "stageFilter"
    );


  if (!select) {
    return;
  }


  /*
     Se já estiver configurado pelo HTML,
     não sobrescreve.
  */

  if (
    select.options.length >
    1
  ) {
    return;
  }


  select.innerHTML = `

    <option value="">
      Todas as etapas
    </option>

    ${ETAPAS
      .map(
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
      )
      .join("")}

  `;
}


/* ============================================================
   ADICIONAR CONVERSA
   ============================================================ */

function adicionarConversaManual(
  empresa,
  telefone,
  etapa = "Prospectado",
  observacao = ""
) {

  const conversas =
    carregarConversas();


  if (
    telefoneJaExiste(
      telefone,
      conversas
    )
  ) {

    alert(
      "Este telefone já está cadastrado no CRM."
    );

    return false;
  }


  const novaConversa = {

    id:
      gerarId(),

    empresa:
      String(
        empresa || ""
      ).trim(),

    telefone:
      formatarTelefone(
        telefone
      ),

    etapa:
      etapaValida(
        etapa
      )
        ? etapa
        : "Prospectado",

    ultimaAtividade:
      hoje(),

    observacao:
      String(
        observacao || ""
      ).trim(),

    historico: [

      {
        data:
          hoje(),

        texto:
          "Conversa registrada manualmente."
      }

    ]

  };


  conversas.push(
    novaConversa
  );


  salvarConversas(
    conversas
  );


  render();


  return true;
}


/* ============================================================
   ALTERAR ETAPA
   ============================================================ */

function atualizarEtapa(
  id,
  novaEtapa
) {

  const conversas =
    carregarConversas();


  const conversa =
    conversas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!conversa) {
    return;
  }


  if (
    !etapaValida(
      novaEtapa
    )
  ) {
    return;
  }


  conversa.etapa =
    novaEtapa;


  conversa.ultimaAtividade =
    hoje();


  if (
    !Array.isArray(
      conversa.historico
    )
  ) {

    conversa.historico =
      [];
  }


  conversa.historico.push({

    data:
      hoje(),

    texto:
      `Etapa alterada para "${novaEtapa}".`

  });


  salvarConversas(
    conversas
  );


  render();
}


/* ============================================================
   ADICIONAR HISTÓRICO
   ============================================================ */

function adicionarHistorico(
  id,
  texto
) {

  const conversas =
    carregarConversas();


  const conversa =
    conversas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!conversa) {
    return;
  }


  if (
    !Array.isArray(
      conversa.historico
    )
  ) {

    conversa.historico =
      [];
  }


  conversa.historico.push({

    data:
      hoje(),

    texto:
      String(
        texto || ""
      ).trim()

  });


  conversa.ultimaAtividade =
    hoje();


  salvarConversas(
    conversas
  );


  render();
}


/* ============================================================
   EXPORTAR
   ============================================================ */

function exportarConversas() {

  const conversas =
    carregarConversas();


  const arquivo =
    new Blob(
      [
        JSON.stringify(
          conversas,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      arquivo
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    `ig-sites-conversas-${hoje()}.json`;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );
}


/* ============================================================
   RESTAURAR DEMO
   ============================================================ */

function restaurarDadosDemo() {

  const confirmar =
    window.confirm(
      "Isso substituirá os contatos atuais pelos dados de demonstração. Deseja continuar?"
    );


  if (!confirmar) {
    return;
  }


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      dadosIniciais
    )
  );


  render();


  alert(
    "Dados de demonstração restaurados."
  );
}


/* ============================================================
   ESTILOS
   ============================================================ */

function aplicarEstilos() {

  if (
    document.getElementById(
      "igSitesJSStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "igSitesJSStyles";


  style.textContent = `

    .stage-badge {

      display:inline-flex;

      align-items:center;

      padding:5px 9px;

      border-radius:999px;

      background:#eef3ff;

      color:#3159d9;

      font-size:11px;

      font-weight:500;

      white-space:nowrap;

    }


    #igImportTextarea:focus {

      border-color:#3159d9 !important;

      box-shadow:
        0 0 0 3px
        rgba(49,89,217,.10);

    }


    #igImportModal button:hover {

      filter:brightness(.97);

    }

  `;


  document.head.appendChild(
    style
  );
}


/* ============================================================
   NAVEGAÇÃO
   ============================================================

   O sistema tenta preservar a navegação que já existe no
   seu HTML.

   Primeiro verifica links reais.

   Depois verifica data-page.

   Depois verifica IDs conhecidos.

   ============================================================ */

function normalizarNomePagina(
  nome
) {

  return String(
    nome || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-"
    )
    .trim();
}


/* ============================================================
   IDENTIFICAR PÁGINA PELO TEXTO
   ============================================================ */

function identificarPaginaTexto(
  texto
) {

  const t =
    normalizarTexto(
      texto
    );


  if (
    t.includes("visao geral")
  ) {
    return "visao-geral";
  }


  if (
    t === "conversas" ||
    t.includes("conversas")
  ) {
    return "conversas";
  }


  if (
    t === "funil" ||
    t.includes("funil")
  ) {
    return "funil";
  }


  if (
    t.includes("analise")
  ) {
    return "analise";
  }


  if (
    t.includes("anotacoes")
  ) {
    return "anotacoes";
  }


  if (
    t.includes("configuracoes")
  ) {
    return "configuracoes";
  }


  return null;
}


/* ============================================================
   ATUALIZAR MENU ATIVO
   ============================================================ */

function atualizarMenuAtivo(
  pagina
) {

  const itens =
    document.querySelectorAll(
      "aside a, aside button, nav a, nav button, [data-page]"
    );


  itens.forEach(
    item => {

      const dataPage =
        item.getAttribute(
          "data-page"
        );


      const texto =
        item.textContent ||
        "";


      const paginaItem =
        dataPage
          ? normalizarNomePagina(
              dataPage
            )
          : identificarPaginaTexto(
              texto
            );


      const ativo =
        paginaItem ===
        normalizarNomePagina(
          pagina
        );


      item.classList.toggle(
        "active",
        ativo
      );


      /*
         Preserva a classe existente
         e apenas adiciona visual.
      */

      if (ativo) {

        item.style.background =
          "rgba(74, 103, 170, 0.45)";

        item.style.color =
          "#ffffff";

      } else {

        item.style.background =
          "";

        item.style.color =
          "";
      }
    }
  );
}


/* ============================================================
   NAVEGAR
   ============================================================ */

function navegarParaPagina(
  pagina
) {

  if (!pagina) {
    return;
  }


  const nome =
    normalizarNomePagina(
      pagina
    );


  atualizarMenuAtivo(
    nome
  );


  /*
     Se o projeto usa páginas HTML diferentes,
     NÃO impedimos o link normal.
  */

  try {

    if (
      window.location.hash !==
      `#${nome}`
    ) {

      history.pushState(
        {
          pagina: nome
        },
        "",
        `#${nome}`
      );
    }

  } catch (erro) {

    console.warn(
      "Não foi possível atualizar o histórico.",
      erro
    );
  }


  render();
}


/* ============================================================
   CONFIGURAR MENU
   ============================================================ */

function configurarMenuLateral() {

  const itens =
    document.querySelectorAll(
      "aside a, aside button, nav a, nav button, [data-page]"
    );


  itens.forEach(
    item => {

      if (
        item.dataset
          .igMenuConfigurado ===
        "true"
      ) {

        return;
      }


      item.dataset
        .igMenuConfigurado =
        "true";


      item.addEventListener(
        "click",
        function(event) {

          const href =
            item.getAttribute(
              "href"
            );


          const dataPage =
            item.getAttribute(
              "data-page"
            );


          /*
             Se existe um href real,
             deixamos o navegador trabalhar.

             Isso evita quebrar menus que já
             possuem páginas HTML.
          */

          if (
            href &&
            href !== "#" &&
            !href.startsWith(
              "javascript:"
            )
          ) {

            return;
          }


          const pagina =
            dataPage
              ? normalizarNomePagina(
                  dataPage
                )
              : identificarPaginaTexto(
                  item.textContent
                );


          if (!pagina) {
            return;
          }


          event.preventDefault();


          navegarParaPagina(
            pagina
          );
        }
      );
    }
  );
}


/* ============================================================
   HISTÓRICO DO NAVEGADOR
   ============================================================ */

window.addEventListener(
  "popstate",
  function() {

    const pagina =
      window.location.hash
        .replace(
          "#",
          ""
        )
        .trim();


    if (pagina) {

      atualizarMenuAtivo(
        pagina
      );

    } else {

      atualizarMenuAtivo(
        "visao-geral"
      );
    }


    render();
  }
);


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function inicializarIGSitesCRM() {

  /*
     Garantir storage.
  */

  carregarConversas();


  /*
     Interface de importação.
  */

  criarInterfaceImportacao();

  criarModalImportacao();


  /*
     Estilos.
  */

  aplicarEstilos();


  /*
     Filtros.
  */

  configurarFiltros();

  configurarFiltroEtapas();


  /*
     Menu.
  */

  configurarMenuLateral();


  /*
     Render inicial.
  */

  render();


  /*
     Atualizar menu.
  */

  const paginaAtual =
    window.location.hash
      .replace(
        "#",
        ""
      )
      .trim();


  atualizarMenuAtivo(
    paginaAtual ||
    "visao-geral"
  );


  console.log(
    "IG Sites Gestão de Conversas iniciado."
  );


  console.log(
    "Importador: funciona com ou sem linhas em branco."
  );


  console.log(
    "WhatsApp: somente análise, nenhum envio."
  );
}


/* ============================================================
   FUNÇÕES GLOBAIS
   ============================================================ */

window.render =
  render;

window.analisarLista =
  analisarLista;

window.importarContatos =
  importarContatos;

window.abrirModalImportacao =
  abrirModalImportacao;

window.fecharModalImportacao =
  fecharModalImportacao;

window.adicionarConversaManual =
  adicionarConversaManual;

window.atualizarEtapa =
  atualizarEtapa;

window.adicionarHistorico =
  adicionarHistorico;

window.exportarConversas =
  exportarConversas;

window.restaurarDadosDemo =
  restaurarDadosDemo;

window.detectarEtapa =
  detectarEtapa;

window.navegarParaPagina =
  navegarParaPagina;


/* ============================================================
   START
   ============================================================ */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    inicializarIGSitesCRM
  );

} else {

  inicializarIGSitesCRM();
}
