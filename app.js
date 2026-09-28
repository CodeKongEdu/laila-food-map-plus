(() => {
  'use strict';

  const STORAGE_KEY = 'laila_food_map_v6';
  const LEGACY_KEY = 'laila_food_map_v5';
  const STATUS = {
    like: { label: 'Gosto', icon: '✓' },
    eat:  { label: 'Como de boa', icon: '•' },
    meh:  { label: 'Mais ou menos', icon: '~' },
    no:   { label: 'Não como', icon: '×' }
  };

  const CATEGORY_NOTES = {
    'Frutas': 'Aqui a fruta já vale como referência para suco e vitamina também. Morango pode receber um × sem culpa; kiwi merece julgamento justo.',
    'Verduras & legumes': 'Milho está aqui apenas para confirmar um fato já conhecido.',
    'Grãos, massas & pães': 'Arroz, feijão, macarrão, pão e companhia — sem repetir cada versão possível do mesmo alimento.',
    'Carnes & proteínas': 'Ovo aparece uma vez, peixe aparece uma vez e frango aparece uma vez. Se o preparo mudar tudo pra você, me conta depois.',
    'Laticínios & café da manhã': 'Leite e iogurte também aparecem uma vez só. Aqui também entraram alguns lanches rápidos e coisas fáceis de pegar no mercado.',
    'Pratos & refeições': 'Aqui vale o prato inteiro, porque ingrediente separado engana bastante.',
    'Doces & sobremesas': 'Pesquisa científica de altíssima relevância, obviamente. Agora com Fini, bombom e mais lanchinhos doces de mercado.',
    'Bebidas': 'Sem quatro sucos da mesma fruta. Ficaram só os tipos que realmente acrescentam informação — e o lado branco da força, claro.',
    'Temperos & extras': 'Um molho tem poder suficiente para salvar ou destruir uma comida inteira.'
  };

  const SPECIAL_NOTES = {
    'Morango': 'eu já tenho um palpite 😶',
    'Kiwi': 'esse tem defesa 🥝',
    'Milho': 'caso praticamente encerrado 🌽',
    'Monster branco': 'lado branco da força',
    'Monster tradicional': 'o primo barulhento',
    'Pão de queijo': 'difícil errar aqui',
    'Pizza': 'assunto de alta importância',
    'Strogonoff': 'candidato forte',
    'Chocolate': 'vale especificar depois'
  };

  const REACTIONS = {
    'Morango': {
      no: 'Essa eu nem precisava perguntar kkkkk. Morango oficialmente reprovado.',
      meh: '“Mais ou menos” pro morango? Estou considerando isso uma evolução histórica.',
      eat: 'Pera… você COMERIA morango? Vou registrar esse acontecimento.',
      like: 'Isso aqui deve ser fraude. Você marcou que gosta de morango 🤨'
    },
    'Kiwi': {
      like: 'Aí sim. O kiwi recebeu a aprovação que merece 🥝',
      eat: 'Kiwi classificado como aceitável. Eu considero uma vitória.',
      meh: 'Vou fingir que não vi esse “mais ou menos” no kiwi 😶',
      no: 'Meu amor… precisamos conversar sobre essa decisão contra o kiwi.'
    },
    'Milho': {
      like: 'Milho inocentado por unanimidade. Caso encerrado 🌽',
      eat: 'Milho continua sem antecedentes. Tudo certo por aqui.',
      meh: 'Milho “mais ou menos”? O processo será reaberto.',
      no: 'Essa decisão contra o milho será encaminhada para recurso imediatamente.'
    },
    'Monster branco': {
      like: 'Pronto. A soldada oficial do lado branco da força venceu de novo kkkkk.',
      eat: '“Como de boa” é uma forma bem humilde de descrever essa relação com Monster branco kkkkk.',
      meh: 'Mais ou menos? A garota-propaganda do Monster branco perdeu a fé?',
      no: 'Ok, isso definitivamente não foi a Laila que respondeu.'
    }
  };

  const MILESTONES = {
    1: 'Começou, princesa. Agora eu vou descobrir esse cardápio secreto kkkkk.',
    10: 'Dez já. Tá, agora eu tô começando a entender seu gosto de verdade.',
    25: '25 comidas julgadas. Isso aqui oficialmente virou investigação particular.',
    50: '50. Agora já dá para eu parar de chutar metade das coisas que você gosta.',
    100: '100 respostas. Respeito. Eu realmente fiz você avaliar comida por comida kkkkk.',
    150: '150. Nesse ponto eu tenho dados suficientes para uma tese sobre a Laila.',
    200: '200 comidas. Você chegou longe demais para abandonar essa missão agora.'
  };

  const state = {
    foods: {},
    customFoods: [],
    currentCategory: 0,
    customStatus: 'like',
    showOnlyUnanswered: false,
    details: {},
    viewMode: 'quick',
    quickIndex: 0,
    seenMilestones: []
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function normalize(value = '') {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || '{}';
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') Object.assign(state, saved);
      state.viewMode = state.viewMode || 'quick';
      state.quickIndex = Number.isInteger(state.quickIndex) ? state.quickIndex : 0;
      state.seenMilestones = Array.isArray(state.seenMilestones) ? state.seenMilestones : [];
    } catch (error) {
      console.warn('Rascunho ignorado:', error);
    }
  }

  function collectDetails() {
    const ids = ['favoriteMeals','favoriteDrinks','hardNo','brands','textures','restrictions','notes'];
    state.details = state.details || {};
    ids.forEach(id => state.details[id] = ($('#' + id)?.value || '').trim());
  }

  function applyDetails() {
    const ids = ['favoriteMeals','favoriteDrinks','hardNo','brands','textures','restrictions','notes'];
    ids.forEach(id => {
      if ($('#' + id) && state.details?.[id]) $('#' + id).value = state.details[id];
    });
  }

  function saveDraft({ quiet = true } = {}) {
    collectDetails();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateCounters();
    const dot = $('#saveState i');
    if (dot) {
      dot.classList.add('pulse');
      setTimeout(() => dot.classList.remove('pulse'), 650);
    }
    if (!quiet) toast('Salvei por aqui.');
  }

  function emojiForFood(name, category) {
    const n = normalize(name);
    const rules = [
      [/morango|framboesa|amora/, '🍓'], [/banana/, '🍌'], [/maca/, '🍎'], [/pera/, '🍐'], [/uva/, '🍇'],
      [/laranja|mexerica|tangerina/, '🍊'], [/limao|limonada/, '🍋'], [/abacaxi/, '🍍'], [/manga/, '🥭'], [/melancia/, '🍉'],
      [/melao/, '🍈'], [/kiwi/, '🥝'], [/pessego/, '🍑'], [/cereja/, '🍒'], [/coco|agua de coco/, '🥥'], [/abacate/, '🥑'],
      [/tomate/, '🍅'], [/brocolis/, '🥦'], [/cenoura/, '🥕'], [/pepino|picles/, '🥒'], [/milho|polenta/, '🌽'], [/pimentao|pimenta/, '🌶️'],
      [/batata-doce/, '🍠'], [/batata|pure/, '🥔'], [/cogumelo/, '🍄'], [/cebola/, '🧅'], [/alho/, '🧄'], [/folha|alface|rucula|agriao|couve|espinafre|repolho|acelga|salada/, '🥬'],
      [/arroz|risoto|galinhada|carreteiro/, '🍚'], [/feijao|lentilha/, '🫘'], [/macarrao|lasanha|nhoque|ravioli|yakisoba/, '🍝'], [/pao|torrada|bisnaguinha/, '🍞'], [/tapioca|panqueca/, '🥞'],
      [/frango|nugget/, '🍗'], [/bife|carne|costela|churrasco|hamburguer/, '🥩'], [/linguica|salsicha|hot dog/, '🌭'], [/bacon/, '🥓'], [/peixe|atum|sardinha|salmao/, '🐟'], [/camarao/, '🍤'], [/ovo|omelete/, '🍳'],
      [/leite|iogurte|vitamina/, '🥛'], [/queijo|mussarela|parmesao|ricota|cottage|requeijao|cream cheese/, '🧀'], [/manteiga|margarina/, '🧈'],
      [/cafe|cappuccino/, '☕'], [/chocolate quente|achocolatado/, '🍫'], [/croissant/, '🥐'], [/bolo|brownie|cheesecake|torta/, '🍰'], [/cookie|bolacha/, '🍪'], [/pipoca/, '🍿'], [/amendoim|castanha/, '🥜'],
      [/coxinha|esfiha|empada|pastel|kibe/, '🥟'], [/pizza/, '🍕'], [/sushi|temaki/, '🍣'], [/taco/, '🌮'], [/burrito|wrap|tortilha/, '🌯'], [/sopa|caldo/, '🍲'], [/strogonoff|parmegiana|feijoada|escondidinho|marmita/, '🍛'],
      [/chocolate|brigadeiro|beijinho|doce de leite|nutella|granulado/, '🍫'], [/pudim|mousse|gelatina|pave/, '🍮'], [/sorvete/, '🍨'], [/acai/, '🫐'], [/milk-shake/, '🥤'], [/churros|donut/, '🍩'], [/bala|chiclete/, '🍬'],
      [/agua$/, '💧'], [/suco/, '🧃'], [/refrigerante|guarana/, '🥤'], [/cha/, '🫖'], [/energetico|monster|isotonico/, '⚡'],
      [/ketchup|mostarda|maionese|barbecue|molho/, '🥫'], [/azeite/, '🫒'], [/mel|geleia/, '🍯'], [/canela|oregano|coentro|paprica|cheiro-verde/, '🌿']
    ];
    for (const [regex, emoji] of rules) if (regex.test(n)) return emoji;
    const defaults = {
      'Frutas':'🍇','Verduras & legumes':'🥗','Grãos, massas & pães':'🍚','Carnes & proteínas':'🍽️',
      'Laticínios & café da manhã':'🥛','Pratos & refeições':'🍲','Doces & sobremesas':'🍬','Bebidas':'🥤','Temperos & extras':'✨'
    };
    return defaults[category] || '🍽️';
  }

  function categoryEmoji(category) {
    return {
      'Frutas':'🥝','Verduras & legumes':'🥦','Grãos, massas & pães':'🍝','Carnes & proteínas':'🍗',
      'Laticínios & café da manhã':'🥐','Pratos & refeições':'🍲','Doces & sobremesas':'🍫','Bebidas':'🥤','Temperos & extras':'✨'
    }[category] || '🍽️';
  }


  function getFoodMedia(name, category, size = 'thumb') {
    const media = window.FOOD_MEDIA || {};
    const exact = media.exact?.[name];
    if (exact) return exact[size] || exact.thumb || exact.cover || null;
    const normalized = normalize(name);
    for (const rule of (media.patterns || [])) {
      try {
        const regex = new RegExp(rule.match, 'i');
        if (regex.test(normalized)) return size === 'cover' ? (rule.cover || rule.thumb || null) : (rule.thumb || rule.cover || null);
      } catch {}
    }
    const cat = media.categories?.[category];
    return cat ? (size === 'cover' ? (cat.cover || cat.thumb || null) : (cat.thumb || cat.cover || null)) : null;
  }

  function renderFoodVisual(element, name, category, size = 'thumb') {
    if (!element) return;
    const src = getFoodMedia(name, category, size);
    element.classList.toggle('has-photo', !!src);
    element.classList.toggle('no-photo', !src);
    if (src) {
      element.innerHTML = `<img src="${src}" alt="" loading="lazy" decoding="async">`;
      return;
    }
    const initial = (name || category || '?').trim().charAt(0).toUpperCase();
    element.innerHTML = `<span class="food-fallback-letter">${initial}</span><small>${categoryEmoji(category)}</small>`;
  }

  function renderQuickVisual(name, category) {
    const host = $('#quickFoodEmoji');
    if (!host) return;
    const src = getFoodMedia(name, category, 'cover');
    host.classList.toggle('has-photo', !!src);
    host.classList.toggle('no-photo', !src);
    if (src) {
      host.innerHTML = `<img src="${src}" alt="" loading="eager" decoding="async">`;
    } else {
      const initial = (name || category || '?').trim().charAt(0).toUpperCase();
      host.innerHTML = `<span class="food-fallback-letter">${initial}</span><small>${category}</small>`;
    }
  }

  function showDuMessage(message, { persistent = false } = {}) {
    if (!message) return;
    const inline = $('#duInlineMessage');
    if (inline) {
      inline.classList.remove('message-pop');
      inline.textContent = message;
      void inline.offsetWidth;
      inline.classList.add('message-pop');
    }
    const companion = $('#duCompanion');
    const text = $('#duCompanionText');
    if (!companion || !text) return;
    text.textContent = message;
    companion.classList.add('show');
    clearTimeout(showDuMessage.timer);
    if (!persistent) showDuMessage.timer = setTimeout(() => companion.classList.remove('show'), 5200);
  }

  function burst(emoji = '✦', origin = null) {
    const rect = origin?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    for (let i = 0; i < 7; i++) {
      const particle = document.createElement('span');
      particle.className = 'choice-particle';
      particle.textContent = emoji;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${(Math.random() - .5) * 150}px`);
      particle.style.setProperty('--ty', `${-35 - Math.random() * 100}px`);
      particle.style.setProperty('--rot', `${(Math.random() - .5) * 80}deg`);
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 900);
    }
  }

  function reactionFor(name, status) {
    return REACTIONS[name]?.[status] || null;
  }

  function maybeMilestone(count) {
    const message = MILESTONES[count];
    if (!message || state.seenMilestones.includes(count)) return;
    state.seenMilestones.push(count);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showDuMessage(message);
    if ([25, 50, 100, 200].includes(count)) burst('✦');
  }

  function renderCategoryNav() {
    const host = $('#categoryNav');
    host.innerHTML = '';
    window.FOOD_CATALOG.forEach((category, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = state.currentCategory === index ? 'active' : '';
      const categoryAnswers = category.items.filter(name => state.foods?.[name]).length;
      button.innerHTML = `<span>${categoryEmoji(category.name)}</span> ${category.name}<small>${categoryAnswers}/${category.items.length}</small>`;
      button.addEventListener('click', () => {
        state.currentCategory = index;
        state.quickIndex = 0;
        $('#foodSearch').value = '';
        renderFoodArea();
        renderQuickMode();
        saveDraft();
      });
      host.appendChild(button);
    });
  }

  function renderSpotlight(category) {
    const host = $('#categorySpotlight');
    if (!category) { host.hidden = true; return; }
    host.hidden = false;
    host.innerHTML = '';
    const left = document.createElement('div');
    left.className = 'spotlight-left';
    const answered = category.items.filter(name => state.foods?.[name]).length;
    const cover = getFoodMedia(category.name, category.name, 'cover');
    left.innerHTML = `${cover ? `<div class="spotlight-cover"><img src="${cover}" alt="" loading="lazy" decoding="async"></div>` : `<div class="spotlight-emoji">${categoryEmoji(category.name)}</div>`}<div class="spotlight-copy"><strong>${category.name}</strong><span>${answered} de ${category.items.length} julgados</span></div>`;
    const note = document.createElement('div');
    note.className = 'spotlight-note';
    note.textContent = CATEGORY_NOTES[category.name] || 'Marca pensando no que você escolheria de verdade.';
    host.append(left, note);
  }

  function chooseFood(name, category, status, { toggle = false, origin = null, autoAdvance = false } = {}) {
    const previous = state.foods?.[name]?.status;
    if (toggle && previous === status) {
      delete state.foods[name];
    } else {
      state.foods[name] = { name, category, status, statusLabel: STATUS[status].label };
      const reaction = reactionFor(name, status);
      if (reaction) {
        showDuMessage(reaction);
        burst(emojiForFood(name, category), origin);
      }
    }

    saveDraft();
    renderCategoryNav();
    renderSpotlight(window.FOOD_CATALOG[state.currentCategory]);
    renderListMode({ preserveScroll: state.viewMode === 'list' });
    renderQuickMode();

    const count = Object.keys(state.foods || {}).length + (state.customFoods || []).length;
    const specialReaction = reactionFor(name, status);
    if (specialReaction) setTimeout(() => maybeMilestone(count), 2400);
    else maybeMilestone(count);

    if (autoAdvance && !(toggle && previous === status)) {
      const card = $('#quickCard');
      card?.classList.add('choice-made');
      setTimeout(() => {
        card?.classList.remove('choice-made');
        advanceQuick(1, { categoryWrap: true });
      }, 360);
    }
  }

  function createFoodCard(name, category) {
    const card = document.createElement('article');
    card.className = 'food-card';
    const selected = state.foods?.[name]?.status;
    if (selected) card.classList.add('is-marked');
    card.dataset.name = normalize(name);
    card.dataset.category = normalize(category);
    card.dataset.marked = selected ? 'true' : 'false';

    const main = document.createElement('div');
    main.className = 'food-main';
    const icon = document.createElement('div');
    icon.className = 'food-icon';
    renderFoodVisual(icon, name, category, 'thumb');
    const meta = document.createElement('div');
    meta.className = 'food-meta';
    const title = document.createElement('strong');
    title.textContent = name;
    const small = document.createElement('small');
    small.textContent = category;
    meta.append(title, small);
    if (SPECIAL_NOTES[name]) {
      const personal = document.createElement('div');
      personal.className = 'food-personal';
      personal.textContent = SPECIAL_NOTES[name];
      meta.appendChild(personal);
    }
    main.append(icon, meta);

    const options = document.createElement('div');
    options.className = 'food-options';
    Object.entries(STATUS).forEach(([key, item]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${item.icon} ${item.label}`;
      button.setAttribute('aria-label', `${name}: ${item.label}`);
      if (selected === key) button.classList.add(`active-${key}`);
      button.addEventListener('click', () => chooseFood(name, category, key, { toggle: true, origin: button }));
      options.appendChild(button);
    });

    card.append(main, options);
    return card;
  }

  function allFoods() {
    return window.FOOD_CATALOG.flatMap(category => category.items.map(name => ({ name, category: category.name })));
  }

  function renderListMode({ preserveScroll = false } = {}) {
    const scrollY = window.scrollY;
    const query = normalize($('#foodSearch').value.trim());
    const host = $('#foodGrid');
    host.innerHTML = '';
    let items = [];
    if (query) {
      items = allFoods().filter(item => normalize(`${item.name} ${item.category}`).includes(query));
      $('#categorySpotlight').hidden = true;
    } else {
      const activeCategory = window.FOOD_CATALOG[state.currentCategory] || window.FOOD_CATALOG[0];
      renderSpotlight(activeCategory);
      items = activeCategory.items.map(name => ({ name, category: activeCategory.name }));
    }
    if (state.showOnlyUnanswered) items = items.filter(item => !state.foods?.[item.name]);
    items.forEach(item => host.appendChild(createFoodCard(item.name, item.category)));
    $('#emptyState').hidden = items.length > 0;
    if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' }));
  }

  function renderQuickMode() {
    const category = window.FOOD_CATALOG[state.currentCategory] || window.FOOD_CATALOG[0];
    if (!category?.items?.length) return;
    state.quickIndex = Math.max(0, Math.min(state.quickIndex, category.items.length - 1));
    const name = category.items[state.quickIndex];
    const selected = state.foods?.[name]?.status;

    renderQuickVisual(name, category.name);
    $('#quickFoodCategory').textContent = category.name;
    $('#quickFoodName').textContent = name;
    $('#quickFoodNote').textContent = SPECIAL_NOTES[name] || 'qual é o veredito, meu amor?';
    $('#quickProgressText').textContent = `${state.quickIndex + 1} de ${category.items.length}`;
    $('#quickProgressBar').style.width = `${((state.quickIndex + 1) / category.items.length) * 100}%`;
    $$('#quickMode [data-quick-status]').forEach(button => {
      const key = button.dataset.quickStatus;
      button.className = selected === key ? `selected selected-${key}` : '';
      button.setAttribute('aria-pressed', String(selected === key));
      button.dataset.food = name;
      button.dataset.category = category.name;
    });

    const answered = category.items.filter(item => state.foods?.[item]).length;
    if (!SPECIAL_NOTES[name]) {
      $('#duInlineMessage').textContent = answered === 0
        ? 'Vai no seu ritmo, meu amor. Não precisa marcar o que você não souber.'
        : `Já entendi ${answered} daqui. Continua julgando sem dó kkkkk.`;
    }
  }

  function advanceQuick(direction, { categoryWrap = false } = {}) {
    const category = window.FOOD_CATALOG[state.currentCategory];
    if (!category) return;
    const next = state.quickIndex + direction;
    if (next >= 0 && next < category.items.length) {
      state.quickIndex = next;
      renderQuickMode();
      saveDraft();
      return;
    }
    if (categoryWrap && direction > 0 && state.currentCategory < window.FOOD_CATALOG.length - 1) {
      const finished = category.name;
      state.currentCategory += 1;
      state.quickIndex = 0;
      renderFoodArea();
      renderQuickMode();
      showDuMessage(`Fechou ${finished}. Bora para ${window.FOOD_CATALOG[state.currentCategory].name.toLowerCase()}, princesa.`);
      saveDraft();
    } else if (direction < 0 && state.currentCategory > 0) {
      state.currentCategory -= 1;
      state.quickIndex = window.FOOD_CATALOG[state.currentCategory].items.length - 1;
      renderFoodArea();
      renderQuickMode();
      saveDraft();
    } else if (categoryWrap && direction > 0) {
      showDuMessage('Você chegou até o fim de todas as categorias. Tá oficialmente liberada da investigação kkkkk.', { persistent: true });
      burst('✦');
    }
  }

  function setViewMode(mode, { announce = true } = {}) {
    state.viewMode = mode === 'list' ? 'list' : 'quick';
    const quick = state.viewMode === 'quick';
    $('#quickMode').hidden = !quick;
    $('#listMode').hidden = quick;
    $('#foodControls').hidden = quick;
    $('#quickModeBtn').classList.toggle('active', quick);
    $('#listModeBtn').classList.toggle('active', !quick);
    if (announce) showDuMessage(quick ? 'Modo rápido ativado. Só vai julgando uma por uma, amor.' : 'Modo lista. Agora pode fuçar tudo sem pressa.');
    saveDraft();
  }

  function renderFoodArea() {
    renderCategoryNav();
    const category = window.FOOD_CATALOG[state.currentCategory] || window.FOOD_CATALOG[0];
    renderSpotlight(category);
    renderListMode();
    renderQuickMode();
  }

  function updateCounters() {
    const count = Object.keys(state.foods || {}).length + (state.customFoods || []).length;
    $('#answeredCount').textContent = count;
    $('#dockCount').textContent = count;
    const total = allFoods().length;
    const title = $('#dockTitle');
    const subtitle = $('#dockSubtitle');
    if (!title || !subtitle) return;
    if (count === 0) {
      title.textContent = 'ainda não julguei sua comida';
      subtitle.textContent = 'começa quando quiser, princesa';
    } else if (count < 20) {
      title.textContent = 'já aprendi algumas coisas';
      subtitle.textContent = `${total - Math.min(count, total)} opções ainda estão por aí`;
    } else if (count < 80) {
      title.textContent = 'tô pegando seu padrão';
      subtitle.textContent = 'já consigo parar de chutar algumas coisas kkkkk';
    } else {
      title.textContent = 'isso aqui já virou dossiê';
      subtitle.textContent = 'pode enviar quando achar que respondeu o suficiente';
    }
  }

  function renderCustomFoods() {
    const host = $('#customFoodList');
    host.innerHTML = '';
    (state.customFoods || []).forEach((item, index) => {
      const tag = document.createElement('span');
      tag.append(document.createTextNode(`${STATUS[item.status]?.icon || ''} ${item.name} · ${STATUS[item.status]?.label || item.status}`));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Remover ${item.name}`);
      remove.addEventListener('click', () => {
        state.customFoods.splice(index, 1);
        renderCustomFoods();
        saveDraft();
      });
      tag.appendChild(remove);
      host.appendChild(tag);
    });
  }

  function setupCustomStatus() {
    const buttons = $$('#customStatusPicker button');
    const paint = () => buttons.forEach(button => button.classList.toggle('active', button.dataset.status === state.customStatus));
    buttons.forEach(button => button.addEventListener('click', () => {
      state.customStatus = button.dataset.status;
      paint();
      saveDraft();
    }));
    paint();
  }

  function buildPayload() {
    collectDetails();
    const preferences = Object.values(state.foods || {});
    const byStatus = Object.fromEntries(Object.keys(STATUS).map(key => [key, preferences.filter(item => item.status === key).map(item => item.name)]));
    return {
      project: 'laila-food-map',
      version: 6,
      respondent: 'Laila',
      submittedAt: new Date().toISOString(),
      foodPreferences: preferences,
      groupedPreferences: byStatus,
      customFoods: state.customFoods || [],
      details: { ...state.details }
    };
  }

  function downloadJSON() {
    const payload = buildPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `laila-comidas-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast('JSON baixado como backup.');
  }

  async function submitAnswers() {
    const count = Object.keys(state.foods || {}).length + (state.customFoods || []).length;
    if (count < 3) {
      toast('Marca pelo menos algumas comidas antes de enviar.');
      document.querySelector('#comidas').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const cfg = window.APP_CONFIG || {};
    const supabaseKey = cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY;
    const button = $('#submitBtn');
    const original = button.innerHTML;

    if (!cfg.SUPABASE_URL || !supabaseKey || cfg.SUPABASE_URL.includes('SEU-PROJETO')) {
      toast('O banco ainda não foi configurado. Baixei um JSON de backup.');
      downloadJSON();
      return;
    }
    if (!window.supabase?.createClient) {
      toast('Não consegui carregar a conexão com o banco.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Enviando…';
    const payload = buildPayload();
    const submissionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      const client = window.supabase.createClient(cfg.SUPABASE_URL, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { error } = await client.from(cfg.TABLE_NAME || 'food_responses').insert({
        submission_id: submissionId,
        respondent: 'Laila',
        project_version: 6,
        payload
      });
      if (error) throw error;
      localStorage.setItem(`${STORAGE_KEY}_last_submission`, submissionId);
      $('#successDialog').showModal();
    } catch (error) {
      console.error(error);
      toast('Não consegui enviar. Seu rascunho continua salvo.');
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  }

  function setupWelcome() {
    const dialog = $('#welcomeDialog');
    if (!dialog) return;
    const close = (scroll = false) => {
      sessionStorage.setItem('laila_food_map_welcome_seen', '1');
      if (dialog.open) dialog.close();
      if (scroll) setTimeout(() => $('#comidas').scrollIntoView({ behavior: 'smooth' }), 120);
    };
    $('#welcomeStart').addEventListener('click', () => close(true));
    $('#welcomePeek').addEventListener('click', () => close(false));
    if (!sessionStorage.getItem('laila_food_map_welcome_seen')) {
      setTimeout(() => dialog.showModal(), 420);
    }
  }

  function setupInteractions() {
    $('[data-scroll="comidas"]').addEventListener('click', () => $('#comidas').scrollIntoView({ behavior: 'smooth' }));

    $('#quickModeBtn').addEventListener('click', () => setViewMode('quick'));
    $('#listModeBtn').addEventListener('click', () => setViewMode('list'));

    $$('#quickMode [data-quick-status]').forEach(button => {
      button.addEventListener('click', () => {
        chooseFood(button.dataset.food, button.dataset.category, button.dataset.quickStatus, {
          origin: button,
          autoAdvance: true
        });
      });
    });
    $('#quickPrev').addEventListener('click', () => advanceQuick(-1));
    $('#quickNext').addEventListener('click', () => advanceQuick(1, { categoryWrap: true }));
    $('#quickSkip').addEventListener('click', () => {
      showDuMessage('Pulou. Sem pressão — melhor não responder do que inventar.');
      advanceQuick(1, { categoryWrap: true });
    });

    $('#foodSearch').addEventListener('input', () => renderListMode());
    $('#unansweredToggle').addEventListener('click', event => {
      state.showOnlyUnanswered = !state.showOnlyUnanswered;
      event.currentTarget.classList.toggle('active', state.showOnlyUnanswered);
      event.currentTarget.setAttribute('aria-pressed', String(state.showOnlyUnanswered));
      event.currentTarget.textContent = state.showOnlyUnanswered ? 'mostrando só não marcados' : 'mostrar só não marcados';
      renderListMode();
      saveDraft();
    });

    $('#customFoodForm').addEventListener('submit', event => {
      event.preventDefault();
      const input = $('#customFoodName');
      const name = input.value.trim();
      if (!name) return;
      state.customFoods.push({ name, status: state.customStatus, statusLabel: STATUS[state.customStatus].label });
      input.value = '';
      renderCustomFoods();
      saveDraft();
      showDuMessage(`Anotado: “${name}”. Essa aí não estava nem no meu interrogatório kkkkk.`);
    });

    $$('#detalhes textarea').forEach(field => field.addEventListener('input', () => saveDraft()));

    $('#downloadBtn').addEventListener('click', downloadJSON);
    $('#submitBtn').addEventListener('click', submitAnswers);
    $('#closeDialog').addEventListener('click', () => $('#successDialog').close());
    $('#dialogOk').addEventListener('click', () => $('#successDialog').close());
    $('#duCompanionClose').addEventListener('click', () => $('#duCompanion').classList.remove('show'));

    document.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (state.viewMode !== 'list') setViewMode('list', { announce: false });
        $('#foodSearch').focus();
      }
      if (state.viewMode === 'quick' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        if (event.key === '1') $('#quickMode [data-quick-status="like"]').click();
        if (event.key === '2') $('#quickMode [data-quick-status="eat"]').click();
        if (event.key === '3') $('#quickMode [data-quick-status="meh"]').click();
        if (event.key === '4') $('#quickMode [data-quick-status="no"]').click();
        if (event.key === 'ArrowRight') advanceQuick(1, { categoryWrap: true });
        if (event.key === 'ArrowLeft') advanceQuick(-1);
      }
    });
  }

  loadDraft();
  applyDetails();
  setupCustomStatus();
  renderCustomFoods();
  renderFoodArea();
  updateCounters();
  setupInteractions();
  setupWelcome();
  setViewMode(state.viewMode, { announce: false });

  $('#unansweredToggle').classList.toggle('active', !!state.showOnlyUnanswered);
  $('#unansweredToggle').setAttribute('aria-pressed', String(!!state.showOnlyUnanswered));
  if (state.showOnlyUnanswered) $('#unansweredToggle').textContent = 'mostrando só não marcados';
  setInterval(() => saveDraft(), 15000);
})();
