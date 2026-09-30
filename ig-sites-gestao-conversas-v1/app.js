/* =========================================================
   IG SITES — GESTÃO DE CONVERSAS
   Versão com importação automática de listas
   SOMENTE LEITURA — NÃO ENVIA MENSAGENS
   ========================================================= */

const stages = [
  'Prospectado',
  'Respondeu',
  'Em atendimento',
  'Interessado',
  'Pediu modelo',
  'Orçamento / negociação',
  'Venda fechada',
  'Não avançou'
];

/* =========================================================
   DADOS
   ========================================================= */

let conversations = JSON.parse(
  localStorage.getItem('igs_conversations') || 'null'
) || [
  {
    id: 1,
    company: 'Oficina Exemplo',
    phone: '(41) 99999-1111',
    stage: 'Interessado',
    firstReply: 18,
    updated: '2026-09-25',
    note: 'Demonstrou interesse no site. Acompanhar próximo passo.',
    history: [
      {
        from: 'ig',
        text: 'Olá! Tudo bem? Falo com o responsável pela Oficina Exemplo?',
        time: '09:10'
      },
      {
        from: 'client',
        text: 'Olá, sim. Pode falar.',
        time: '09:28'
      },
      {
        from: 'ig',
        text: 'Encontrei vocês no Google e queria apresentar uma ideia de site para o negócio.',
        time: '09:30'
      },
      {
        from: 'client',
        text: 'Tenho interesse. Como seria?',
        time: '09:36'
      }
    ]
  },

  {
    id: 2,
    company: 'Estética Modelo',
    phone: '(41) 98888-2222',
    stage: 'Pediu modelo',
    firstReply: 7,
    updated: '2026-09-24',
    note: 'Pediu para ver um exemplo de site.',
    history: [
      {
        from: 'ig',
        text: 'Olá! Tudo bem? Falo com o responsável pela Estética Modelo?',
        time: '14:02'
      },
      {
        from: 'client',
        text: 'Sim, sou eu.',
        time: '14:09'
      },
      {
        from: 'ig',
        text: 'Encontrei vocês no Google e tenho uma ideia de apresentação online para o negócio.',
        time: '14:10'
      },
      {
        from: 'client',
        text: 'Pode me mandar um modelo?',
        time: '14:12'
      }
    ]
  },

  {
    id: 3,
    company: 'Mercado Fictício',
    phone: '(41) 97777-3333',
    stage: 'Respondeu',
    firstReply: 42,
    updated: '2026-09-23',
    note: 'Respondeu, mas conversa não avançou.',
    history: [
      {
        from: 'ig',
        text: 'Olá! Tudo bem? Falo com o responsável pelo Mercado Fictício?',
        time: '11:15'
      },
      {
        from: 'client',
        text: 'Sim.',
        time: '11:57'
      }
    ]
  },

  {
    id: 4,
    company: 'Studio Demonstração',
    phone: '(41) 96666-4444',
    stage: 'Orçamento / negociação',
    firstReply: 12,
    updated: '2026-09-22',
    note: 'Chegou na etapa de negociação.',
    history: [
      {
        from: 'ig',
        text: 'Olá! Tudo bem? Falo com o responsável pelo Studio Demonstração?',
        time: '10:20'
      },
      {
        from: 'client',
        text: 'Sim, sou responsável.',
        time: '10:32'
      },
      {
        from: 'client',
        text: 'Quanto fica para fazer um site?',
        time: '10:34'
      }
    ]
  },

  {
    id: 5,
    company: 'Café Ilustrativo',
    phone: '(41) 95555-5555',
    stage: 'Não avançou',
    firstReply: 0,
    updated: '2026-09-20',
    note: 'Não respondeu à abordagem inicial.',
    history: [
      {
        from: 'ig',
        text: 'Olá! Tudo bem? Falo com o responsável pelo Café Ilustrativo?',
        time: '16:05'
      }
    ]
  },

  {
    id: 6,
    company: 'Auto Demo',
    phone: '(41) 94444-6666',
    stage: 'Venda fechada',
    firstReply: 5,
    updated: '2026-09-19',
    note: 'Venda marcada como fechada pelo usuário.',
    history: [
      {
        from: 'ig',
        text: 'Olá! Tudo bem? Falo com o responsável pela Auto Demo?',
        time: '08:40'
      },
      {
        from: 'client',
        text: 'Sim.',
        time: '08:45'
      },
      {
        from: 'client',
        text: 'Gostei da ideia e quero seguir.',
        time: '08:52'
      }
    ]
  }
];

let selectedId = null;

/* =========================================================
   FUNÇÕES BÁSICAS
   ========================================================= */

const $ = id => document.getElementById(id);

const save = () => {
  localStorage.setItem(
    'igs_conversations',
    JSON.stringify(conversations)
  );
};

const esc = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char])
  );

const countStage = stage =>
  conversations.filter(c => c.stage === stage).length;

/* =========================================================
   RENDERIZAÇÃO PRINCIPAL
   ========================================================= */

function render() {

  const total = conversations.length;

  const answered = conversations.filter(
    c => c.stage !== 'Prospectado'
  ).length;

  const interested = conversations.filter(
    c =>
      [
        'Interessado',
        'Pediu modelo',
        'Orçamento / negociação',
        'Venda fechada'
      ].includes(c.stage)
  ).length;

  $('sTotal').textContent = total;
  $('sAnswered').textContent = answered;
  $('sInterested').textContent = interested;
  $('sWon').textContent = countStage('Venda fechada');

  if ($('navCount')) {
    $('navCount').textContent = total;
  }

  /* FUNIL DA VISÃO GERAL */

  const max = Math.max(
    ...stages.map(countStage),
    1
  );

  if ($('bars')) {
    $('bars').innerHTML = stages
      .map(stage => `
        <div class="barline">
          <div>
            <span>${esc(stage)}</span>
            <b>${countStage(stage)}</b>
          </div>

          <div class="bar">
            <i style="width:${Math.max(
              countStage(stage) ? 5 : 0,
              countStage(stage) / max * 100
            )}%"></i>
          </div>
        </div>
      `)
      .join('');
  }

  /* CONVERSAS RECENTES */

  if ($('recent')) {

    $('recent').innerHTML =
      conversations
        .slice()
        .sort((a, b) => b.id - a.id)
        .slice(0, 5)
        .map(c => `
          <div class="recent">
            <b>${esc(c.company)}</b>
            <small>
              ${esc(c.phone)} •
              ${esc(c.stage)} •
              ${esc(c.updated)}
            </small>
          </div>
        `)
        .join('') ||
      '<div class="empty">Nenhuma conversa registrada.</div>';
  }

  /* LISTA DE CONVERSAS */

  const searchInput = $('search');

  const q = searchInput
    ? (searchInput.value || '').toLowerCase()
    : '';

  const filter = $('stageFilter')
    ? $('stageFilter').value
    : '';

  const list = conversations.filter(c => {

    const text = [
      c.company,
      c.phone,
      c.note
    ]
      .join(' ')
      .toLowerCase();

    return (
      (!q || text.includes(q)) &&
      (!filter || c.stage === filter)
    );
  });

  if ($('rows')) {

    $('rows').innerHTML =
      list
        .map(c => `
          <tr>
            <td>
              <b>${esc(c.company)}</b>
            </td>

            <td>
              ${esc(c.phone)}
            </td>

            <td>
              <span class="pill">
                ${esc(c.stage)}
              </span>
            </td>

            <td>
              ${esc(c.updated)}
            </td>

            <td>
              <button
                class="secondary"
                onclick="openConversation(${c.id})">
                Ver conversa
              </button>
            </td>
          </tr>
        `)
        .join('') ||
      `
        <tr>
          <td colspan="5" class="empty">
            Nenhum resultado.
          </td>
        </tr>
      `;
  }

  /* QUADRO DO FUNIL */

  if ($('board')) {

    $('board').innerHTML = stages
      .map(stage => `
        <div class="col">

          <b>
            ${esc(stage)}
            (${countStage(stage)})
          </b>

          ${
            conversations
              .filter(c => c.stage === stage)
              .map(c => `
                <div
                  class="ticket"
                  onclick="openConversation(${c.id})">

                  <b>${esc(c.company)}</b>

                  <small>
                    ${esc(c.phone)}
                  </small>

                </div>
              `)
              .join('') ||
            '<p class="empty">Nenhuma conversa.</p>'
          }

        </div>
      `)
      .join('');
  }

  /* =====================================================
     ANÁLISE
     ===================================================== */

  const model = conversations.filter(
    c =>
      [
        'Pediu modelo',
        'Orçamento / negociação',
        'Venda fechada'
      ].includes(c.stage)
  ).length;

  if ($('responseRate')) {
    $('responseRate').textContent =
      total
        ? Math.round(answered / total * 100) + '%'
        : '0%';
  }

  if ($('interestRate')) {
    $('interestRate').textContent =
      answered
        ? Math.round(interested / answered * 100) + '%'
        : '0%';
  }

  if ($('modelRate')) {
    $('modelRate').textContent =
      total
        ? Math.round(model / total * 100) + '%'
        : '0%';
  }

  if ($('saleRate')) {
    $('saleRate').textContent =
      total
        ? Math.round(
            countStage('Venda fechada') /
            total *
            100
          ) + '%'
        : '0%';
  }

  if ($('dropoff')) {

    $('dropoff').innerHTML = stages
      .map(stage => `
        <div class="barline">

          <div>
            <span>${esc(stage)}</span>
            <b>${countStage(stage)}</b>
          </div>

          <div class="bar">
            <i style="width:${Math.max(
              countStage(stage) ? 4 : 0,
              countStage(stage) / max * 100
            )}%"></i>
          </div>

        </div>
      `)
      .join('');
  }

  const replies = conversations
    .map(c => Number(c.firstReply))
    .filter(n => n > 0);

  const averageReply =
    replies.length
      ? Math.round(
          replies.reduce(
            (a, b) => a + b,
            0
          ) / replies.length
        )
      : 0;

  if ($('timing')) {

    $('timing').innerHTML = `
      <p>
        <b>Média até primeira resposta:</b>
        ${averageReply} minutos
      </p>

      <p>
        <b>Mais rápida:</b>
        ${replies.length ? Math.min(...replies) : 0}
        minutos
      </p>

      <p>
        <b>Mais demorada:</b>
        ${replies.length ? Math.max(...replies) : 0}
        minutos
      </p>
    `;
  }

  if ($('insight')) {

    $('insight').innerHTML = `
      <h2>Leitura dos dados</h2>

      <p>
        Hoje há <b>${answered}</b> conversas que
        responderam e <b>${interested}</b> que chegaram
        a interesse, pedido de modelo ou negociação.
      </p>

      <p>
        Use esses números para descobrir em qual etapa
        você mais perde contatos.
      </p>
    `;
  }

  /* ANOTAÇÕES */

  if ($('notesList')) {

    $('notesList').innerHTML =
      conversations
        .map(c => `
          <div class="card notesItem">

            <h3>
              ${esc(c.company)}

              <span class="pill">
                ${esc(c.stage)}
              </span>
            </h3>

            <p>
              ${esc(
                c.note ||
                'Sem anotação.'
              )}
            </p>

            <small>
              ${esc(c.phone)}
            </small>

          </div>
        `)
        .join('') ||
      `
        <div class="card empty">
          Nenhuma anotação.
        </div>
      `;
  }
}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function show(view) {

  document
    .querySelectorAll('.view')
    .forEach(element => {

      element.classList.toggle(
        'active',
        element.id === view
      );

    });

  document
    .querySelectorAll('.nav')
    .forEach(element => {

      element.classList.toggle(
        'active',
        element.dataset.view === view
      );

    });

  const titles = {
    dashboard: 'Visão geral',
    conversations: 'Conversas',
    funnel: 'Funil',
    analysis: 'Análise',
    notes: 'Anotações',
    settings: 'Configurações'
  };

  if ($('title')) {
    $('title').textContent =
      titles[view] || 'Visão geral';
  }
}

document
  .querySelectorAll('.nav')
  .forEach(nav => {

    nav.onclick = () => {
      show(nav.dataset.view);
    };

  });

/* =========================================================
   FILTROS
   ========================================================= */

if ($('stageFilter')) {

  stages.forEach(stage => {

    $('stageFilter').insertAdjacentHTML(
      'beforeend',
      `<option value="${esc(stage)}">
        ${esc(stage)}
      </option>`
    );

  });

  $('stageFilter').onchange = render;
}

if ($('search')) {
  $('search').oninput = render;
}

/* =========================================================
   CADASTRO MANUAL
   ========================================================= */

function openNewConversation() {

  if ($('modal')) {
    $('modal').classList.add('show');
  }
}

if ($('newConversation')) {
  $('newConversation').onclick =
    openNewConversation;
}

if ($('newConversation2')) {
  $('newConversation2').onclick =
    openNewConversation;
}

if ($('cancel')) {

  $('cancel').onclick = () => {

    $('modal').classList.remove('show');

  };
}

if ($('newStage')) {

  stages.forEach(stage => {

    $('newStage').insertAdjacentHTML(
      'beforeend',
      `<option value="${esc(stage)}">
        ${esc(stage)}
      </option>`
    );

  });
}

if ($('form')) {

  $('form').onsubmit = event => {

    event.preventDefault();

    const formData =
      new FormData(event.target);

    const company =
      String(formData.get('company') || '').trim();

    const phone =
      String(formData.get('phone') || '').trim();

    if (!company || !phone) {
      alert('Preencha empresa e telefone.');
      return;
    }

    conversations.push({

      id: Date.now(),

      company,

      phone,

      stage:
        formData.get('stage') ||
        'Prospectado',

      firstReply:
        Number(
          formData.get('firstReply') || 0
        ),

      updated:
        new Date()
          .toISOString()
          .slice(0, 10),

      note:
        String(
          formData.get('note') || ''
        ).trim(),

      history: []

    });

    save();

    render();

    event.target.reset();

    $('modal').classList.remove('show');

  };
}

/* =========================================================
   ABRIR CONVERSA
   ========================================================= */

window.openConversation = function(id) {

  selectedId = id;

  const conversation =
    conversations.find(
      item => item.id === id
    );

  if (!conversation) {
    return;
  }

  $('detailName').textContent =
    conversation.company;

  $('detailMeta').textContent =
    `${conversation.phone} • ` +
    `${conversation.stage} • ` +
    `última atividade ${conversation.updated}`;

  $('detailSummary').innerHTML = `

    <b>Etapa:</b>
    ${esc(conversation.stage)}
    <br>

    <b>Tempo até primeira resposta:</b>
    ${
      conversation.firstReply
        ? conversation.firstReply +
          ' minutos'
        : 'Não respondeu'
    }

    <br>

    <b>Observação:</b>
    ${esc(
      conversation.note ||
      'Nenhuma'
    )}

  `;

  $('detailNote').value =
    conversation.note || '';

  if (
    conversation.history &&
    conversation.history.length
  ) {

    $('history').innerHTML =
      conversation.history
        .map(message => `

          <div class="bubble ${
            message.from === 'client'
              ? 'client'
              : 'ig'
          }">

            ${esc(message.text)}

            <small>
              ${
                message.from === 'client'
                  ? 'Cliente'
                  : 'IG Sites'
              }

              •
              ${esc(message.time || '')}
            </small>

          </div>

        `)
        .join('');

  } else {

    $('history').innerHTML = `
      <div class="empty">
        Nenhuma mensagem registrada
        nesta conversa.
      </div>
    `;

  }

  $('conversationModal')
    .classList.add('show');
};

if ($('closeDetail')) {

  $('closeDetail').onclick = () => {

    $('conversationModal')
      .classList.remove('show');

  };
}

if ($('saveNote')) {

  $('saveNote').onclick = () => {

    const conversation =
      conversations.find(
        item => item.id === selectedId
      );

    if (!conversation) {
      return;
    }

    conversation.note =
      $('detailNote').value;

    save();

    render();

    openConversation(
      conversation.id
    );

  };
}

/* =========================================================
   IMPORTAÇÃO DE LISTAS
   ========================================================= */

/*
   A importação é criada diretamente pelo JavaScript.
   Assim você NÃO precisa alterar o index.html.
*/

function createImportInterface() {

  const conversationView =
    $('conversations');

  if (!conversationView) {
    return;
  }

  const head =
    conversationView.querySelector('.head');

  if (!head) {
    return;
  }

  if ($('importListButton')) {
    return;
  }

  const button =
    document.createElement('button');

  button.id =
    'importListButton';

  button.className =
    'secondary';

  button.innerHTML =
    '⇩ Importar lista';

  button.style.marginLeft =
    '8px';

  button.onclick =
    openImportModal;

  const existingButton =
    head.querySelector('.primary');

  if (existingButton) {

    existingButton
      .parentNode
      .insertBefore(
        button,
        existingButton.nextSibling
      );

  } else {

    head.appendChild(button);

  }
}

/* =========================================================
   MODAL DE IMPORTAÇÃO
   ========================================================= */

function createImportModal() {

  if ($('importModal')) {
    return;
  }

  const modal =
    document.createElement('div');

  modal.id =
    'importModal';

  modal.className =
    'modal';

  modal.innerHTML = `

    <div
      class="modalbox"
      style="width:min(850px,100%)">

      <h2>
        Importar lista de contatos
      </h2>

      <p class="muted">

        Cole abaixo a lista que você recebeu.
        O sistema tentará identificar automaticamente
        empresa, telefone e etapa.

      </p>

      <div
        class="safe"
        style="margin-top:10px">

        🔒
        <b>Somente organização.</b>

        Nenhuma mensagem será enviada
        pelo sistema.

      </div>

      <textarea
        id="importText"
        placeholder="Cole sua lista aqui...

Exemplo:

Oficina ABC
(41) 99999-1111
WhatsApp confirmado

Estética XYZ
(41) 98888-2222
Pediu modelo

Mercado Teste
(41) 97777-3333
Não avançou"
        style="
          width:100%;
          min-height:280px;
          resize:vertical;
          margin-top:10px;
        "
      ></textarea>

      <div
        id="importPreview"
        style="margin-top:15px">
      </div>

      <div
        style="
          display:flex;
          justify-content:flex-end;
          gap:8px;
          margin-top:15px;
        ">

        <button
          type="button"
          class="secondary"
          id="closeImport">

          Cancelar

        </button>

        <button
          type="button"
          class="secondary"
          id="previewImport">

          Analisar lista

        </button>

        <button
          type="button"
          class="primary"
          id="confirmImport">

          Importar contatos

        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  $('closeImport').onclick =
    closeImportModal;

  $('previewImport').onclick =
    previewImport;

  $('confirmImport').onclick =
    confirmImport;

  $('importText').addEventListener(
    'input',
    () => {

      $('importPreview').innerHTML = '';

    }
  );
}

/* =========================================================
   ABRIR / FECHAR IMPORTAÇÃO
   ========================================================= */

function openImportModal() {

  createImportModal();

  $('importModal')
    .classList.add('show');

  $('importText').value = '';

  $('importPreview').innerHTML = '';

}

function closeImportModal() {

  if ($('importModal')) {

    $('importModal')
      .classList.remove('show');

  }
}

/* =========================================================
   NORMALIZAÇÃO DE TELEFONE
   ========================================================= */

function normalizePhone(phone) {

  return String(phone || '')
    .replace(/\D/g, '');
}

/* =========================================================
   IDENTIFICAR TELEFONES
   ========================================================= */

function extractPhones(text) {

  const phoneRegex =
    /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}/g;

  return text.match(phoneRegex) || [];
}

/* =========================================================
   IDENTIFICAR ETAPA
   ========================================================= */

function detectStage(text) {

  const value =
    String(text || '')
      .toLowerCase();

  if (
    value.includes('venda fechada') ||
    value.includes('fechou') ||
    value.includes('cliente fechado') ||
    value.includes('vendeu')
  ) {

    return 'Venda fechada';

  }

  if (
    value.includes('orçamento') ||
    value.includes('orcamento') ||
    value.includes('negociação') ||
    value.includes('negociacao') ||
    value.includes('preço') ||
    value.includes('preco') ||
    value.includes('quanto fica') ||
    value.includes('quanto custa')
  ) {

    return 'Orçamento / negociação';

  }

  if (
    value.includes('pediu modelo') ||
    value.includes('pediu o modelo') ||
    value.includes('mandar modelo') ||
    value.includes('manda modelo') ||
    value.includes('enviar modelo') ||
    value.includes('ver modelo') ||
    value.includes('quer ver o site') ||
    value.includes('quero ver o site')
  ) {

    return 'Pediu modelo';

  }

  if (
    value.includes('interessado') ||
    value.includes('tenho interesse') ||
    value.includes('tenho interesse sim') ||
    value.includes('gostei') ||
    value.includes('quero fazer') ||
    value.includes('quero sim')
  ) {

    return 'Interessado';

  }

  if (
    value.includes('não avançou') ||
    value.includes('nao avancou') ||
    value.includes('sem interesse') ||
    value.includes('não tenho interesse') ||
    value.includes('nao tenho interesse')
  ) {

    return 'Não avançou';

  }

  if (
    value.includes('respondeu') ||
    value.includes('respondeu a mensagem')
  ) {

    return 'Respondeu';

  }

  return 'Prospectado';
}

/* =========================================================
   LIMPAR NOME
   ========================================================= */

function cleanCompanyName(text) {

  let name =
    String(text || '').trim();

  name =
    name
      .replace(
        /^(nome da empresa|empresa|nome)\s*[:\-]\s*/i,
        ''
      );

  name =
    name
      .replace(
        /^(empresa|lead)\s*[:\-]\s*/i,
        ''
      );

  return name.trim();

}

/* =========================================================
   ANALISAR LISTA
   ========================================================= */

function parseImportText(text) {

  const lines =
    String(text || '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

  const results = [];

  let currentCompany = '';
  let currentPhone = '';
  let currentExtra = [];

  function finishCurrent() {

    if (!currentPhone) {
      return;
    }

    const stage =
      detectStage(
        [
          currentCompany,
          ...currentExtra
        ].join(' ')
      );

    results.push({

      company:
        currentCompany ||
        'Empresa sem nome',

      phone:
        currentPhone,

      stage,

      extra:
        currentExtra.join(' ')

    });

  }

  for (const line of lines) {

    const phones =
      extractPhones(line);

    if (phones.length) {

      /*
         Quando encontramos um telefone,
         entendemos que começa/termina
         um contato.
      */

      if (currentPhone) {
        finishCurrent();
      }

      currentPhone =
        phones[0];

      const beforePhone =
        line
          .replace(
            phones[0],
            ''
          )
          .trim()
          .replace(
            /^[|:\-–—]+|[|:\-–—]+$/g,
            ''
          )
          .trim();

      if (beforePhone) {

        if (!currentCompany) {

          currentCompany =
            cleanCompanyName(
              beforePhone
            );

        } else {

          currentExtra.push(
            beforePhone
          );

        }

      }

      continue;
    }

    /*
       Ignora linhas que são apenas
       separadores/status genéricos.
    */

    const normalized =
      line.toLowerCase();

    const genericStatus =
      [
        'whatsapp confirmado',
        'whatsapp não confirmado',
        'whatsapp nao confirmado',
        'vale tentar',
        'status',
        'telefone',
        'número',
        'numero',
        'mensagem para copiar'
      ];

    if (
      genericStatus.some(
        item =>
          normalized.includes(item)
      )
    ) {

      currentExtra.push(line);

      continue;
    }

    /*
       Se ainda não temos empresa,
       esta linha provavelmente é o nome.
    */

    if (!currentCompany) {

      currentCompany =
        cleanCompanyName(line);

    } else {

      currentExtra.push(line);

    }
  }

  finishCurrent();

  /*
     Remove duplicados dentro da
     própria lista.
  */

  const unique = [];
  const seen = new Set();

  for (const item of results) {

    const normalized =
      normalizePhone(item.phone);

    if (!normalized) {
      continue;
    }

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    unique.push({

      ...item,

      phone:
        item.phone.trim()

    });
  }

  return unique;
}

/* =========================================================
   PRÉ-VISUALIZAÇÃO
   ========================================================= */

function previewImport() {

  const text =
    $('importText').value;

  if (!text.trim()) {

    $('importPreview').innerHTML = `
      <div class="safe">
        Cole uma lista antes de analisar.
      </div>
    `;

    return;
  }

  const parsed =
    parseImportText(text);

  if (!parsed.length) {

    $('importPreview').innerHTML = `
      <div class="safe">
        Não consegui identificar telefones
        nessa lista.
      </div>
    `;

    return;
  }

  const existingPhones =
    new Set(
      conversations.map(
        c =>
          normalizePhone(c.phone)
      )
    );

  let newCount = 0;
  let duplicateCount = 0;

  parsed.forEach(item => {

    if (
      existingPhones.has(
        normalizePhone(item.phone)
      )
    ) {

      duplicateCount++;

    } else {

      newCount++;

    }

  });

  $('importPreview').innerHTML = `

    <div class="card">

      <h3>
        Resultado da análise
      </h3>

      <p>
        <b>${parsed.length}</b>
        contatos identificados.
      </p>

      <p>
        <b>${newCount}</b>
        novos contatos.
      </p>

      <p>
        <b>${duplicateCount}</b>
        contatos já existentes.
      </p>

      <div
        style="
          max-height:250px;
          overflow:auto;
          margin-top:12px;
        ">

        <table>

          <thead>
            <tr>
              <th>Empresa</th>
              <th>Telefone</th>
              <th>Etapa</th>
            </tr>
          </thead>

          <tbody>

            ${parsed
              .slice(0, 100)
              .map(item => `

                <tr>

                  <td>
                    ${esc(item.company)}
                  </td>

                  <td>
                    ${esc(item.phone)}
                  </td>

                  <td>
                    <span class="pill">
                      ${esc(item.stage)}
                    </span>
                  </td>

                </tr>

              `)
              .join('')}

          </tbody>

        </table>

      </div>

      ${
        parsed.length > 100
          ? `
            <p class="muted">
              Mostrando os primeiros 100
              contatos na prévia.
            </p>
          `
          : ''
      }

    </div>
  `;
}

/* =========================================================
   CONFIRMAR IMPORTAÇÃO
   ========================================================= */

function confirmImport() {

  const text =
    $('importText').value;

  if (!text.trim()) {

    alert(
      'Cole uma lista antes de importar.'
    );

    return;
  }

  const parsed =
    parseImportText(text);

  if (!parsed.length) {

    alert(
      'Nenhum contato com telefone foi identificado.'
    );

    return;
  }

  /*
     Telefones que já existem no CRM.
  */

  const existingPhones =
    new Set(
      conversations.map(
        c =>
          normalizePhone(c.phone)
      )
    );

  let imported = 0;
  let duplicated = 0;

  for (const item of parsed) {

    const normalizedPhone =
      normalizePhone(item.phone);

    if (!normalizedPhone) {
      continue;
    }

    /*
       Não duplica.
    */

    if (
      existingPhones.has(
        normalizedPhone
      )
    ) {

      duplicated++;

      continue;
    }

    /*
       Cria novo contato.
    */

    conversations.push({

      id:
        Date.now() +
        Math.floor(
          Math.random() * 100000
        ),

      company:
        item.company,

      phone:
        item.phone,

      stage:
        item.stage,

      firstReply:
        0,

      updated:
        new Date()
          .toISOString()
          .slice(0, 10),

      note:
        item.extra ||
        'Importado por lista.',

      history: []

    });

    existingPhones.add(
      normalizedPhone
    );

    imported++;
  }

  save();

  render();

  closeImportModal();

  show('conversations');

  alert(
    `Importação concluída!\n\n` +
    `Novos contatos: ${imported}\n` +
    `Duplicados ignorados: ${duplicated}`
  );
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

createImportInterface();

createImportModal();

render();
