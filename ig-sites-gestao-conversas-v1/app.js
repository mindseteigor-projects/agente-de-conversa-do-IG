/* ============================================================
   IG SITES — GESTÃO DE CONVERSAS
   app.js — versão corrigida
   ============================================================

   IMPORTANTE:
   - Não conecta ao WhatsApp.
   - Não envia mensagens.
   - Os dados ficam no localStorage.
   - O importador separa corretamente cada contato.
   ============================================================ */

const STORAGE_KEY = "ig_sites_conversas";
const NOTES_KEY = "ig_sites_anotacoes";

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
   FUNÇÕES BÁSICAS
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
  return String(telefone || "")
    .replace(/\D/g, "")
    .replace(/^55/, "");
}

function formatarTelefone(telefone) {
  const numero = String(telefone || "").replace(/\D/g, "");

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

    return Array.isArray(conversas) ? conversas : [];
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

    if (!dados) return [];

    const anotacoes = JSON.parse(dados);

    return Array.isArray(anotacoes) ? anotacoes : [];
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

const ETAPAS = [
  "Prospectado",
  "Respondeu",
  "Interessado",
  "Pediu modelo",
  "Orçamento / negociação",
  "Venda fechada",
  "Não avançou"
];

function etapaValida(etapa) {
  return ETAPAS.includes(etapa);
}

/* ============================================================
   DETECÇÃO DE ETAPA
   ============================================================ */

function detectarEtapa(texto) {
  const original = String(texto || "").trim();

  const textoNormalizado = original
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  /*
     ORDEM IMPORTANTE:
     frases mais específicas vêm antes das genéricas.
  */

  // Venda fechada
  if (
    textoNormalizado.includes("venda fechada") ||
    textoNormalizado.includes("venda realizada") ||
    textoNormalizado.includes("fechou") ||
    textoNormalizado.includes("cliente fechado") ||
    textoNormalizado.includes("fechamento")
  ) {
    return "Venda fechada";
  }

  // Não avançou
  if (
    textoNormalizado.includes("nao tenho interesse") ||
    textoNormalizado.includes("sem interesse") ||
    textoNormalizado.includes("nao quero") ||
    textoNormalizado.includes("nao tenho") ||
    textoNormalizado.includes("não tenho interesse")
  ) {
    return "Não avançou";
  }

  if (
    textoNormalizado.includes("nao avancou") ||
    textoNormalizado.includes("não avançou")
  ) {
    return "Não avançou";
  }

  // Orçamento / negociação
  if (
    textoNormalizado.includes("orcamento") ||
    textoNormalizado.includes("orçamento") ||
    textoNormalizado.includes("negociacao") ||
    textoNormalizado.includes("negociação") ||
    textoNormalizado.includes("quanto custa") ||
    textoNormalizado.includes("quanto fica") ||
    textoNormalizado.includes("qual o preco") ||
    textoNormalizado.includes("qual o preço") ||
    textoNormalizado.includes("preco") ||
    textoNormalizado.includes("preço")
  ) {
    return "Orçamento / negociação";
  }

  // Pediu modelo
  if (
    textoNormalizado.includes("pediu modelo") ||
    textoNormalizado.includes("pedir modelo") ||
    textoNormalizado.includes("manda o modelo") ||
    textoNormalizado.includes("mandar modelo") ||
    textoNormalizado.includes("mande o modelo") ||
    textoNormalizado.includes("enviar modelo") ||
    textoNormalizado.includes("envia o modelo") ||
    textoNormalizado.includes("ver o modelo") ||
    textoNormalizado.includes("ver modelo") ||
    textoNormalizado.includes("quer ver o site") ||
    textoNormalizado.includes("quero ver o modelo") ||
    textoNormalizado.includes("modelo do site")
  ) {
    return "Pediu modelo";
  }

  // Interessado
  if (
    textoNormalizado.includes("tenho interesse") ||
    textoNormalizado.includes("interessado") ||
    textoNormalizado.includes("interesse") ||
    textoNormalizado.includes("gostei") ||
    textoNormalizado.includes("quero fazer") ||
    textoNormalizado.includes("quero sim") ||
    textoNormalizado.includes("vamos fazer") ||
    textoNormalizado.includes("pode fazer")
  ) {
    return "Interessado";
  }

  // Respondeu
  if (
    textoNormalizado === "respondeu" ||
    textoNormalizado.includes("respondeu")
  ) {
    return "Respondeu";
  }

  /*
     "WhatsApp confirmado" NÃO é uma etapa.
     Portanto, cai em Prospectado.
  */

  return "Prospectado";
}

/* ============================================================
   DETECÇÃO DE TELEFONE
   ============================================================ */

function extrairTelefone(texto) {
  if (!texto) return null;

  /*
     Aceita exemplos como:
     (41) 99999-9999
     (41) 9999-9999
     41999999999
     5541999999999
     +55 41 99999-9999
  */

  const padrao = /(?:\+?55[\s.-]*)?(?:\(?\d{2}\)?[\s.-]*)?(?:9[\s.-]*)?\d{4}[\s.-]*\d{4}/;

  const resultado = String(texto).match(padrao);

  if (!resultado) return null;

  const numero = resultado[0];

  const somenteNumeros = numero.replace(/\D/g, "");

  /*
     Telefones brasileiros normalmente terão
     pelo menos 10 dígitos sem o 55.
  */

  const sem55 = somenteNumeros.startsWith("55")
    ? somenteNumeros.substring(2)
    : somenteNumeros;

  if (sem55.length < 10 || sem55.length > 11) {
    return null;
  }

  return formatarTelefone(sem55);
}

function linhaEhTelefone(linha) {
  return !!extrairTelefone(linha);
}

/* ============================================================
   LIMPEZA DE LINHAS
   ============================================================ */

function limparLinhas(texto) {
  return String(texto || "")
    .split(/\r?\n/)
    .map(linha => linha.trim())
    .filter(linha => linha.length > 0);
}

/* ============================================================
   IMPORTADOR CORRIGIDO
   ============================================================

   O problema anterior era que o parser mantinha o primeiro
   nome como empresa e aplicava esse nome aos telefones seguintes.

   Agora o parser trabalha por CONTATO.

   Exemplo:

   Oficina Motor Sul
   (41) 99999-1001
   WhatsApp confirmado

   Estética Bella Vida
   (41) 98888-1002
   Respondeu

   Cada bloco gera um contato diferente.
   ============================================================ */

function analisarLista(texto) {
  const linhas = limparLinhas(texto);

  const contatos = [];

  /*
     Primeiro tentamos o formato recomendado:
     blocos separados por linhas vazias.

     Como limparLinhas remove as linhas vazias, fazemos uma
     segunda leitura para preservar os blocos.
  */

  const blocos = String(texto || "")
    .split(/\r?\n\s*\r?\n/)
    .map(bloco => {
      return bloco
        .split(/\r?\n/)
        .map(linha => linha.trim())
        .filter(Boolean);
    })
    .filter(bloco => bloco.length > 0);

  /*
     Caso existam blocos separados corretamente,
     usamos o formato de blocos.
  */

  for (const bloco of blocos) {
    const telefoneIndex = bloco.findIndex(linha =>
      linhaEhTelefone(linha)
    );

    if (telefoneIndex === -1) {
      continue;
    }

    const telefone = extrairTelefone(bloco[telefoneIndex]);

    /*
       A empresa é a linha imediatamente anterior ao telefone.
    */

    let empresa = "";

    if (telefoneIndex > 0) {
      empresa = bloco[telefoneIndex - 1].trim();
    }

    /*
       Se houver algum texto antes do telefone além do nome,
       usamos a primeira linha como empresa.
    */

    if (!empresa && bloco.length > 0) {
      empresa = bloco[0].trim();
    }

    /*
       Tudo que vem depois do telefone é considerado
       informação/status/observação.
    */

    const informacoes = bloco
      .slice(telefoneIndex + 1)
      .filter(Boolean);

    const textoInformacoes = informacoes.join(" | ");

    const etapa = detectarEtapa(textoInformacoes);

    /*
       Se não houver informação depois do telefone,
       o contato entra como Prospectado.
    */

    contatos.push({
      empresa: empresa || "Empresa sem nome",
      telefone,
      etapa,
      observacao: textoInformacoes || "",
      fonte: "importacao"
    });
  }

  /*
     FALLBACK:
     Se o usuário colar uma lista sem linhas vazias,
     fazemos uma segunda estratégia.

     Procuramos cada telefone e usamos a linha anterior
     como nome da empresa.
  */

  if (contatos.length === 0) {
    const linhasCompletas = String(texto || "")
      .split(/\r?\n/)
      .map(linha => linha.trim())
      .filter(Boolean);

    for (let i = 0; i < linhasCompletas.length; i++) {
      const linhaAtual = linhasCompletas[i];

      if (!linhaEhTelefone(linhaAtual)) {
        continue;
      }

      const telefone = extrairTelefone(linhaAtual);

      let empresa = "";

      /*
         Procuramos para trás a primeira linha que não seja
         telefone.
      */

      for (let j = i - 1; j >= 0; j--) {
        if (!linhaEhTelefone(linhasCompletas[j])) {
          empresa = linhasCompletas[j];
          break;
        }
      }

      /*
         Procuramos o texto até o próximo telefone.
      */

      const informacoes = [];

      for (let k = i + 1; k < linhasCompletas.length; k++) {
        if (linhaEhTelefone(linhasCompletas[k])) {
          break;
        }

        informacoes.push(linhasCompletas[k]);
      }

      const textoInformacoes = informacoes.join(" | ");

      contatos.push({
        empresa: empresa || "Empresa sem nome",
        telefone,
        etapa: detectarEtapa(textoInformacoes),
        observacao: textoInformacoes,
        fonte: "importacao"
      });
    }
  }

  return removerDuplicadosImportacao(contatos);
}

/* ============================================================
   REMOVER DUPLICADOS DA LISTA IMPORTADA
   ============================================================ */

function removerDuplicadosImportacao(contatos) {
  const mapa = new Map();

  for (const contato of contatos) {
    const telefone = normalizarTelefone(contato.telefone);

    if (!telefone) continue;

    if (!mapa.has(telefone)) {
      mapa.set(telefone, contato);
    }
  }

  return Array.from(mapa.values());
}

/* ============================================================
   VERIFICAR DUPLICADOS NO CRM
   ============================================================ */

function telefoneJaExiste(telefone, conversas) {
  const normalizado = normalizarTelefone(telefone);

  return conversas.some(conversa => {
    return normalizarTelefone(conversa.telefone) === normalizado;
  });
}

/* ============================================================
   IMPORTAR CONTATOS
   ============================================================ */

function importarContatos(contatos) {
  const conversas = carregarConversas();

  let adicionados = 0;
  let duplicados = 0;

  const agora = hoje();

  contatos.forEach(contato => {
    if (!contato.telefone) return;

    if (telefoneJaExiste(contato.telefone, conversas)) {
      duplicados++;
      return;
    }

    const novaConversa = {
      id: gerarId(),

      empresa: contato.empresa || "Empresa sem nome",

      telefone: formatarTelefone(contato.telefone),

      etapa: etapaValida(contato.etapa)
        ? contato.etapa
        : "Prospectado",

      ultimaAtividade: agora,

      observacao: contato.observacao || "",

      historico: [
        {
          data: agora,
          texto:
            contato.observacao
              ? `Contato importado. Informação: ${contato.observacao}`
              : "Contato importado."
        }
      ]
    };

    conversas.push(novaConversa);

    adicionados++;
  });

  salvarConversas(conversas);

  return {
    adicionados,
    duplicados
  };
}

/* ============================================================
   INTERFACE DO IMPORTADOR
   ============================================================ */

function criarInterfaceImportacao() {
  /*
     Evita criar duas vezes.
  */

  if (document.getElementById("igImportarListaBtn")) {
    return;
  }

  /*
     Procurar um lugar apropriado no topo da página.
  */

  const botoes = Array.from(
    document.querySelectorAll("button")
  );

  let botaoRegistro = botoes.find(botao =>
    botao.textContent
      .toLowerCase()
      .includes("registrar conversa")
  );

  const botao = document.createElement("button");

  botao.id = "igImportarListaBtn";
  botao.type = "button";
  botao.innerHTML = "⇩ Importar lista";

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

  botao.addEventListener("click", abrirModalImportacao);

  if (botaoRegistro && botaoRegistro.parentElement) {
    botaoRegistro.parentElement.appendChild(botao);
  } else {
    document.body.appendChild(botao);
  }
}

/* ============================================================
   MODAL
   ============================================================ */

function criarModalImportacao() {
  if (document.getElementById("igImportModal")) {
    return;
  }

  const modal = document.createElement("div");

  modal.id = "igImportModal";

  modal.innerHTML = `
    <div id="igImportOverlay" style="
      position:fixed;
      inset:0;
      background:rgba(15,23,42,.45);
      z-index:9998;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    ">

      <div style="
        width:min(760px, 100%);
        max-height:90vh;
        overflow:auto;
        background:white;
        border-radius:18px;
        box-shadow:0 25px 70px rgba(0,0,0,.20);
        padding:26px;
      ">

        <div style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          margin-bottom:8px;
        ">

          <div>
            <h2 style="
              margin:0;
              color:#111827;
              font-size:22px;
            ">
              Importar lista de contatos
            </h2>

            <p style="
              margin:7px 0 0;
              color:#64748b;
              font-size:14px;
            ">
              Cole sua lista abaixo. O sistema vai separar cada empresa,
              telefone e etapa automaticamente.
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

        <div style="
          margin-top:20px;
          padding:13px 15px;
          border-radius:10px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          color:#475569;
          font-size:13px;
          line-height:1.6;
        ">
          <strong>Formato recomendado:</strong><br>

          Empresa<br>
          Telefone<br>
          Status ou mensagem<br><br>

          Empresa<br>
          Telefone<br>
          Status ou mensagem

          <br><br>

          <strong>Exemplo:</strong><br>

          Oficina Motor Sul<br>
          (41) 99999-1001<br>
          WhatsApp confirmado
          <br><br>

          Estética Bella Vida<br>
          (41) 98888-1002<br>
          Respondeu
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

        <div style="
          display:flex;
          justify-content:flex-end;
          gap:10px;
          margin-top:18px;
          flex-wrap:wrap;
        ">

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

  document.body.appendChild(modal);

  document
    .getElementById("igFecharImportModal")
    .addEventListener("click", fecharModalImportacao);

  document
    .getElementById("igCancelarImportacao")
    .addEventListener("click", fecharModalImportacao);

  document
    .getElementById("igAnalisarImportacao")
    .addEventListener("click", analisarImportacaoInterface);

  document
    .getElementById("igConfirmarImportacao")
    .addEventListener("click", confirmarImportacaoInterface);

  modal.style.display = "none";
}

/* ============================================================
   ABRIR / FECHAR MODAL
   ============================================================ */

function abrirModalImportacao() {
  const modal = document.getElementById("igImportModal");

  if (!modal) return;

  modal.style.display = "block";

  const textarea = document.getElementById("igImportTextarea");

  const resultado = document.getElementById("igImportResultado");

  const confirmar = document.getElementById(
    "igConfirmarImportacao"
  );

  if (textarea) textarea.value = "";

  if (resultado) {
    resultado.style.display = "none";
    resultado.innerHTML = "";
  }

  if (confirmar) {
    confirmar.style.display = "none";
  }

  window.igContatosImportacao = [];

  setTimeout(() => {
    textarea?.focus();
  }, 100);
}

function fecharModalImportacao() {
  const modal = document.getElementById("igImportModal");

  if (modal) {
    modal.style.display = "none";
  }

  window.igContatosImportacao = [];
}

/* ============================================================
   ANALISAR IMPORTAÇÃO
   ============================================================ */

function analisarImportacaoInterface() {
  const textarea = document.getElementById(
    "igImportTextarea"
  );

  const resultado = document.getElementById(
    "igImportResultado"
  );

  const confirmar = document.getElementById(
    "igConfirmarImportacao"
  );

  if (!textarea || !resultado) return;

  const texto = textarea.value.trim();

  if (!texto) {
    resultado.style.display = "block";

    resultado.innerHTML = `
      <div style="
        padding:13px;
        border-radius:10px;
        background:#fef2f2;
        color:#991b1b;
        border:1px solid #fecaca;
      ">
        Cole uma lista de contatos antes de analisar.
      </div>
    `;

    if (confirmar) {
      confirmar.style.display = "none";
    }

    return;
  }

  const contatos = analisarLista(texto);

  window.igContatosImportacao = contatos;

  if (contatos.length === 0) {
    resultado.style.display = "block";

    resultado.innerHTML = `
      <div style="
        padding:13px;
        border-radius:10px;
        background:#fef2f2;
        color:#991b1b;
        border:1px solid #fecaca;
      ">
        Não consegui identificar contatos.
        <br><br>
        Verifique se sua lista possui empresa e telefone.
      </div>
    `;

    if (confirmar) {
      confirmar.style.display = "none";
    }

    return;
  }

  const conversas = carregarConversas();

  let novos = 0;
  let duplicados = 0;

  contatos.forEach(contato => {
    if (telefoneJaExiste(contato.telefone, conversas)) {
      duplicados++;
    } else {
      novos++;
    }
  });

  let tabela = `
    <div style="
      padding:14px;
      border-radius:10px;
      background:#f0fdf4;
      border:1px solid #bbf7d0;
      margin-bottom:14px;
    ">
      <strong style="color:#166534;">
        ${contatos.length} contato(s) identificado(s)
      </strong>

      <div style="
        margin-top:5px;
        color:#475569;
        font-size:13px;
      ">
        ${novos} novo(s) serão importados.
        ${duplicados} já existem no CRM.
      </div>
    </div>

    <div style="
      border:1px solid #e2e8f0;
      border-radius:10px;
      overflow:auto;
      max-height:300px;
    ">

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:13px;
      ">

        <thead>
          <tr style="
            background:#f8fafc;
            text-align:left;
          ">
            <th style="padding:10px;">Empresa</th>
            <th style="padding:10px;">Telefone</th>
            <th style="padding:10px;">Etapa</th>
          </tr>
        </thead>

        <tbody>
  `;

  contatos.forEach(contato => {
    const existe = telefoneJaExiste(
      contato.telefone,
      conversas
    );

    tabela += `
      <tr style="
        border-top:1px solid #e2e8f0;
        ${existe ? "opacity:.55;" : ""}
      ">

        <td style="padding:10px;">
          ${escaparHTML(contato.empresa)}
        </td>

        <td style="padding:10px;">
          ${escaparHTML(contato.telefone)}
        </td>

        <td style="padding:10px;">
          <span style="
            display:inline-block;
            padding:4px 8px;
            border-radius:999px;
            background:#eef2ff;
            color:#3159d9;
            font-size:11px;
          ">
            ${escaparHTML(contato.etapa)}
          </span>
        </td>

      </tr>
    `;
  });

  tabela += `
        </tbody>
      </table>
    </div>
  `;

  resultado.style.display = "block";
  resultado.innerHTML = tabela;

  if (confirmar) {
    confirmar.style.display = novos > 0
      ? "inline-block"
      : "none";
  }
}

/* ============================================================
   CONFIRMAR IMPORTAÇÃO
   ============================================================ */

function confirmarImportacaoInterface() {
  const contatos =
    window.igContatosImportacao || [];

  if (!contatos.length) {
    return;
  }

  const resultado = importarContatos(contatos);

  const resultadoElemento =
    document.getElementById("igImportResultado");

  if (resultadoElemento) {
    resultadoElemento.style.display = "block";

    resultadoElemento.innerHTML = `
      <div style="
        padding:15px;
        border-radius:10px;
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        color:#166534;
      ">

        <strong>Importação concluída.</strong>

        <div style="margin-top:7px;">
          ${resultado.adicionados} contato(s) adicionado(s).
        </div>

        <div style="margin-top:3px;">
          ${resultado.duplicados} contato(s) ignorado(s)
          porque já estavam no CRM.
        </div>

      </div>
    `;
  }

  const confirmar =
    document.getElementById(
      "igConfirmarImportacao"
    );

  if (confirmar) {
    confirmar.style.display = "none";
  }

  /*
     Atualizar a página/lista.
  */

  if (typeof window.render === "function") {
    window.render();
  }

  /*
     Se o projeto estiver usando uma função de atualização
     diferente, tentamos também estas possibilidades.
  */

  if (typeof renderConversas === "function") {
    renderConversas();
  }

  if (typeof renderDashboard === "function") {
    renderDashboard();
  }
}

/* ============================================================
   RENDERIZAÇÃO DAS CONVERSAS
   ============================================================ */

function obterConversasFiltradas() {
  const conversas = carregarConversas();

  const busca =
    document
      .getElementById("searchInput")
      ?.value
      ?.toLowerCase()
      ?.trim() || "";

  const filtro =
    document
      .getElementById("stageFilter")
      ?.value || "";

  return conversas.filter(conversa => {
    const correspondeBusca =
      !busca ||
      String(conversa.empresa)
        .toLowerCase()
        .includes(busca) ||
      String(conversa.telefone)
        .toLowerCase()
        .includes(busca) ||
      String(conversa.observacao || "")
        .toLowerCase()
        .includes(busca);

    const correspondeEtapa =
      !filtro ||
      filtro === "Todas as etapas" ||
      conversa.etapa === filtro;

    return correspondeBusca && correspondeEtapa;
  });
}

/* ============================================================
   FUNÇÃO PRINCIPAL DE RENDER
   ============================================================ */

function render() {
  /*
     Primeiro tenta usar elementos existentes no HTML.
  */

  renderListaConversas();
  atualizarContadores();
  atualizarFunil();
  atualizarAnalise();
  atualizarAnotacoes();
}

/* ============================================================
   RENDER LISTA
   ============================================================ */

function renderListaConversas() {
  const conversas = obterConversasFiltradas();

  /*
     Procurar por tabelas existentes.
  */

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

  tbody.innerHTML = "";

  conversas.forEach(conversa => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <strong>
          ${escaparHTML(conversa.empresa)}
        </strong>
      </td>

      <td>
        ${escaparHTML(conversa.telefone)}
      </td>

      <td>
        <span class="stage-badge">
          ${escaparHTML(conversa.etapa)}
        </span>
      </td>

      <td>
        ${escaparHTML(conversa.ultimaAtividade)}
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

    tbody.appendChild(tr);
  });

  document
    .querySelectorAll(".view-conversation-btn")
    .forEach(botao => {
      botao.addEventListener("click", () => {
        const id = Number(botao.dataset.id);

        abrirConversa(id);
      });
    });
}

/* ============================================================
   ABRIR CONVERSA
   ============================================================ */

function abrirConversa(id) {
  const conversas = carregarConversas();

  const conversa = conversas.find(
    item => Number(item.id) === Number(id)
  );

  if (!conversa) return;

  /*
     Se existir modal de conversa no projeto,
     tenta preenchê-lo.
  */

  let modal =
    document.getElementById(
      "conversationModal"
    );

  if (!modal) {
    modal = document.createElement("div");

    modal.id = "conversationModal";

    modal.innerHTML = `
      <div style="
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.45);
        z-index:9997;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      ">

        <div style="
          background:white;
          width:min(650px,100%);
          max-height:90vh;
          overflow:auto;
          border-radius:18px;
          padding:25px;
        ">

          <div id="conversationModalContent"></div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  const content = document.getElementById(
    "conversationModalContent"
  );

  if (!content) return;

  const historico = Array.isArray(conversa.historico)
    ? conversa.historico
    : [];

  content.innerHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:15px;
    ">

      <div>
        <h2 style="margin:0;">
          ${escaparHTML(conversa.empresa)}
        </h2>

        <p style="
          margin:5px 0 0;
          color:#64748b;
        ">
          ${escaparHTML(conversa.telefone)}
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

    <div style="
      margin-top:20px;
      padding:14px;
      background:#f8fafc;
      border-radius:10px;
    ">

      <strong>Etapa:</strong>
      ${escaparHTML(conversa.etapa)}

      <br><br>

      <strong>Última atividade:</strong>
      ${escaparHTML(conversa.ultimaAtividade)}

    </div>

    ${
      conversa.observacao
        ? `
          <div style="
            margin-top:15px;
            padding:14px;
            border:1px solid #e2e8f0;
            border-radius:10px;
          ">
            <strong>Observação</strong>

            <p style="
              margin:8px 0 0;
              color:#475569;
            ">
              ${escaparHTML(conversa.observacao)}
            </p>
          </div>
        `
        : ""
    }

    <h3 style="margin-top:22px;">
      Histórico
    </h3>

    <div>
      ${
        historico.length
          ? historico
              .map(item => `
                <div style="
                  padding:12px;
                  border-bottom:1px solid #e2e8f0;
                ">
                  <div style="
                    font-size:12px;
                    color:#64748b;
                  ">
                    ${escaparHTML(item.data)}
                  </div>

                  <div style="
                    margin-top:4px;
                  ">
                    ${escaparHTML(item.texto)}
                  </div>
                </div>
              `)
              .join("")
          : `
            <p style="color:#64748b;">
              Nenhum histórico registrado.
            </p>
          `
      }
    </div>
  `;

  modal.style.display = "block";

  document
    .getElementById("fecharConversationModal")
    ?.addEventListener("click", () => {
      modal.style.display = "none";
    });
}

/* ============================================================
   CONTADORES
   ============================================================ */

function atualizarContadores() {
  const conversas = carregarConversas();

  const total = conversas.length;

  const respondidas = conversas.filter(
    c =>
      c.etapa === "Respondeu" ||
      c.etapa === "Interessado" ||
      c.etapa === "Pediu modelo" ||
      c.etapa === "Orçamento / negociação" ||
      c.etapa === "Venda fechada"
  ).length;

  const interessadas = conversas.filter(
    c =>
      c.etapa === "Interessado" ||
      c.etapa === "Pediu modelo" ||
      c.etapa === "Orçamento / negociação" ||
      c.etapa === "Venda fechada"
  ).length;

  const pedidosModelo = conversas.filter(
    c => c.etapa === "Pediu modelo"
  ).length;

  const negociacoes = conversas.filter(
    c => c.etapa === "Orçamento / negociação"
  ).length;

  const vendas = conversas.filter(
    c => c.etapa === "Venda fechada"
  ).length;

  atualizarElementoTexto(
    ["totalConversas", "total-conversas"],
    total
  );

  atualizarElementoTexto(
    ["respondidas", "totalRespondidas"],
    respondidas
  );

  atualizarElementoTexto(
    ["interessadas", "totalInteressadas"],
    interessadas
  );

  atualizarElementoTexto(
    ["pedidosModelo", "totalPedidosModelo"],
    pedidosModelo
  );

  atualizarElementoTexto(
    ["negociacoes", "totalNegociacoes"],
    negociacoes
  );

  atualizarElementoTexto(
    ["vendasFechadas", "totalVendas"],
    vendas
  );
}

function atualizarElementoTexto(ids, valor) {
  ids.forEach(id => {
    const elemento =
      document.getElementById(id);

    if (elemento) {
      elemento.textContent = valor;
    }
  });
}

/* ============================================================
   FUNIL
   ============================================================ */

function atualizarFunil() {
  const conversas = carregarConversas();

  const contagem = {};

  ETAPAS.forEach(etapa => {
    contagem[etapa] = 0;
  });

  conversas.forEach(conversa => {
    if (contagem[conversa.etapa] !== undefined) {
      contagem[conversa.etapa]++;
    }
  });

  ETAPAS.forEach(etapa => {
    const id = etapa
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .toLowerCase();

    atualizarElementoTexto(
      [
        `funil-${id}`,
        `funnel-${id}`,
        `stage-${id}`
      ],
      contagem[etapa]
    );
  });
}

/* ============================================================
   ANÁLISE
   ============================================================ */

function atualizarAnalise() {
  const conversas = carregarConversas();

  const total = conversas.length;

  if (total === 0) return;

  const respondidas = conversas.filter(
    c =>
      c.etapa !== "Prospectado"
  ).length;

  const interessadas = conversas.filter(
    c =>
      c.etapa === "Interessado" ||
      c.etapa === "Pediu modelo" ||
      c.etapa === "Orçamento / negociação" ||
      c.etapa === "Venda fechada"
  ).length;

  const pedidosModelo = conversas.filter(
    c => c.etapa === "Pediu modelo"
  ).length;

  const vendas = conversas.filter(
    c => c.etapa === "Venda fechada"
  ).length;

  const taxaResposta =
    (respondidas / total) * 100;

  const taxaInteresse =
    (interessadas / total) * 100;

  const taxaModelo =
    (pedidosModelo / total) * 100;

  const taxaVenda =
    (vendas / total) * 100;

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
  const anotacoes = carregarAnotacoes();

  const container =
    document.getElementById(
      "anotacoesLista"
    );

  if (!container) return;

  if (!anotacoes.length) {
    container.innerHTML = `
      <p style="color:#64748b;">
        Nenhuma anotação registrada.
      </p>
    `;

    return;
  }

  container.innerHTML = anotacoes
    .map(anotacao => `
      <div style="
        padding:13px;
        border-bottom:1px solid #e2e8f0;
      ">

        <div style="
          font-size:12px;
          color:#64748b;
        ">
          ${escaparHTML(anotacao.data)}
        </div>

        <div style="
          margin-top:5px;
        ">
          ${escaparHTML(anotacao.texto)}
        </div>

      </div>
    `)
    .join("");
}

/* ============================================================
   FILTROS
   ============================================================ */

function configurarFiltros() {
  const searchInput =
    document.getElementById("searchInput");

  const stageFilter =
    document.getElementById("stageFilter");

  searchInput?.addEventListener(
    "input",
    render
  );

  stageFilter?.addEventListener(
    "change",
    render
  );
}

/* ============================================================
   CRIAR FILTRO DE ETAPAS SE NECESSÁRIO
   ============================================================ */

function configurarFiltroEtapas() {
  const select =
    document.getElementById("stageFilter");

  if (!select) return;

  /*
     Se já possui opções suficientes, não substituímos.
  */

  if (select.options.length > 1) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Todas as etapas
    </option>

    ${ETAPAS.map(etapa => `
      <option value="${escaparHTML(etapa)}">
        ${escaparHTML(etapa)}
      </option>
    `).join("")}
  `;
}

/* ============================================================
   ADICIONAR CONVERSA MANUALMENTE
   ============================================================ */

function adicionarConversaManual(
  empresa,
  telefone,
  etapa = "Prospectado",
  observacao = ""
) {
  const conversas = carregarConversas();

  if (telefoneJaExiste(telefone, conversas)) {
    alert(
      "Este telefone já está cadastrado no CRM."
    );

    return false;
  }

  const novaConversa = {
    id: gerarId(),

    empresa: empresa.trim(),

    telefone: formatarTelefone(telefone),

    etapa: etapaValida(etapa)
      ? etapa
      : "Prospectado",

    ultimaAtividade: hoje(),

    observacao: observacao.trim(),

    historico: [
      {
        data: hoje(),
        texto: "Conversa registrada manualmente."
      }
    ]
  };

  conversas.push(novaConversa);

  salvarConversas(conversas);

  render();

  return true;
}

/* ============================================================
   ATUALIZAR ETAPA
   ============================================================ */

function atualizarEtapa(id, novaEtapa) {
  const conversas = carregarConversas();

  const conversa = conversas.find(
    item => Number(item.id) === Number(id)
  );

  if (!conversa) return;

  if (!etapaValida(novaEtapa)) {
    return;
  }

  conversa.etapa = novaEtapa;

  conversa.ultimaAtividade = hoje();

  if (!Array.isArray(conversa.historico)) {
    conversa.historico = [];
  }

  conversa.historico.push({
    data: hoje(),
    texto: `Etapa alterada para "${novaEtapa}".`
  });

  salvarConversas(conversas);

  render();
}

/* ============================================================
   ADICIONAR HISTÓRICO
   ============================================================ */

function adicionarHistorico(
  id,
  texto
) {
  const conversas = carregarConversas();

  const conversa = conversas.find(
    item => Number(item.id) === Number(id)
  );

  if (!conversa) return;

  if (!Array.isArray(conversa.historico)) {
    conversa.historico = [];
  }

  conversa.historico.push({
    data: hoje(),
    texto: String(texto || "").trim()
  });

  conversa.ultimaAtividade = hoje();

  salvarConversas(conversas);

  render();
}

/* ============================================================
   EXPORTAR DADOS
   ============================================================ */

function exportarConversas() {
  const conversas = carregarConversas();

  const arquivo = new Blob(
    [
      JSON.stringify(
        conversas,
        null,
        2
      )
    ],
    {
      type: "application/json"
    }
  );

  const url =
    URL.createObjectURL(arquivo);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `ig-sites-conversas-${hoje()}.json`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/* ============================================================
   RESETAR DADOS DE DEMONSTRAÇÃO
   ============================================================ */

function restaurarDadosDemo() {
  const confirmar = window.confirm(
    "Isso substituirá os contatos atuais pelos dados de demonstração. Deseja continuar?"
  );

  if (!confirmar) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(dadosIniciais)
  );

  render();

  alert(
    "Dados de demonstração restaurados."
  );
}

/* ============================================================
   CORREÇÃO DOS BADGES
   ============================================================ */

function aplicarEstiloEtapas() {
  const estilo = document.createElement("style");

  estilo.id = "igSitesStageStyles";

  estilo.textContent = `
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
      box-shadow:0 0 0 3px rgba(49,89,217,.10);
    }

    #igImportModal button:hover {
      filter:brightness(.97);
    }
  `;

  document.head.appendChild(estilo);
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function inicializarIGSitesCRM() {
  /*
     Garante que o storage exista.
  */

  carregarConversas();

  /*
     Interface de importação.
  */

  criarInterfaceImportacao();

  criarModalImportacao();

  aplicarEstiloEtapas();

  configurarFiltros();

  configurarFiltroEtapas();

  render();

  console.log(
    "IG Sites Gestão de Conversas iniciado."
  );

  console.log(
    "Importador corrigido: cada telefone recebe sua própria empresa."
  );
}

/* ============================================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
   ============================================================ */

window.render = render;

window.abrirModalImportacao =
  abrirModalImportacao;

window.fecharModalImportacao =
  fecharModalImportacao;

window.analisarLista =
  analisarLista;

window.importarContatos =
  importarContatos;

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

/* ============================================================
   START
   ============================================================ */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    inicializarIGSitesCRM
  );
} else {
  inicializarIGSitesCRM();
}
