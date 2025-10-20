import { supabase } from "./supabase.js";

// ===================== USUÁRIOS (Supabase) ===================== //

// Criar usuário (opcional se quiser criar manualmente no Supabase)
export async function criarUsuarioSupabase(nome, passHash, saldo = 0) {
  const { data, error } = await supabase
    .from("users")
    .insert([{ nome, saldo, pass_hash: passHash }]); // Garante que a coluna pass_hash seja enviada
  if (error) console.error("Erro ao criar usuário:", error);
  return { data, error };
}

// Atualizar saldo de um usuário
export async function definirSaldo(usuarioId, valor) {
  const { data, error } = await supabase
    .from("users")
    .update({ saldo: valor })
    .eq("id", usuarioId);
  if (error) console.error("Erro ao atualizar saldo:", error);
  else console.log("Saldo atualizado:", data);
}

// Banir usuário por tempo (tempoBan em segundos)
export async function banirUsuario(usuarioId, tempoBan) {
  const banFim = new Date(Date.now() + tempoBan * 1000); // calcula fim do ban
  const { data, error } = await supabase
    .from("users")
    .update({ banido: true, ban_tempo: banFim.toISOString() })
    .eq("id", usuarioId);
  if (error) console.error("Erro ao banir usuário:", error);
  else console.log(`Usuário banido até: ${banFim}`);
}

// ===================== MENSAGENS (Supabase) ===================== //

// Enviar mensagem para usuário
export async function enviarMensagem(usuarioId, titulo, corpo) {
  const { data, error } = await supabase
    .from("mensagens")
    .insert([{ usuario_id: usuarioId, titulo, corpo }]);
  if (error) console.error("Erro ao enviar mensagem:", error);
  return data || [];
}

// Buscar mensagens de um usuário
export async function buscarMensagens(usuarioId) {
  const { data, error } = await supabase
    .from("mensagens")
    .select("*")
    .eq("usuario_id", usuarioId);
  if (error) console.error("Erro ao buscar mensagens:", error);
  return data || [];
}

// ================================================================= //

const GAMES = [
  {
    id: "double",
    name: "Double",
    cat: "Crash",
    img: "https://debc8304dd40g.cloudfront.net/games/-17a08f0a380979da781ea4d2a32b5417.png",
    desc: "Multiplicador crescente — retire antes do crash",
  },
  {
    id: "dice",
    name: "Dice",
    cat: "Minigame",
    img: "https://debc8304dd40g.cloudfront.net/games/-7f39f2ff246fee929d72a8338404c8cb.png",
    desc: "Escolha um número/range e vença pelos RNGs",
  },
  {
    id: "mines",
    name: "Mines",
    cat: "Minigame",
    img: "https://debc8304dd40g.cloudfront.net/games/-b64d0a38ccc356b831b19fee8cc586d8.png",
    desc: "Campo minado — abra casas seguras",
  },
  {
    id: "plinko",
    name: "Plinko",
    cat: "Minigame",
    img: "https://debc8304dd40g.cloudfront.net/games/-a707932c5601b5a5ec43ea2cc10187f5.png",
    desc: "Solte a bola e veja onde ela cai para ganhar prêmios.",
  },
  {
    id: "fortune-double",
    name: "Fortune Double",
    cat: "Crash",
    img: "https://debc8304dd40g.cloudfront.net/games/-ebb48b07e15387c2de91dd7a45ac4d57.png",
    desc: "Double com tema fortune",
  },
  {
    id: "fortune-tiger",
    name: "Fortune Tiger",
    cat: "Slots",
    img: "https://d3fwl9ttzumvxe.cloudfront.net/games/-f05b66d13b610ce95fdce939415d0a4c.png",
    desc: "Slot Tiger — símbolos com bônus",
  },
  {
    id: "fortune-dragon",
    name: "Fortune Dragon",
    cat: "Slots",
    img: "https://d3fwl9ttzumvxe.cloudfront.net/games/-e9e059782e941bde688ef53e9824a40f.png",
    desc: "Slot Dragon — rodada grátis possível",
  },
  {
    id: "fortune-ox",
    name: "Fortune Ox",
    cat: "Slots",
    img: "https://d3fwl9ttzumvxe.cloudfront.net/games/-57f04880dd667eb49e9e4820a267337e.png",
    desc: "Slot Ox — símbolos especiais",
  },
  {
    id: "fortune-rabbit",
    name: "Fortune Rabbit",
    cat: "Slots",
    img: "https://d3fwl9ttzumvxe.cloudfront.net/games/-8968928c5b14b41fa859accba4469bb7.png",
    desc: "Slot Rabbit — pequenas chances grandes ganhos",
  },
];

// -------- storage helpers
const storage = {
  get(k, fallback = null) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};

/* ------------------------------
 HELPERS
 ------------------------------ */
/* helper: format currency */
function formatCurrency(value) {
  // Formata o número para o padrão brasileiro, usando ponto para milhares e vírgula para decimais.
  return (typeof value === "number" ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ------------------------------
 APP STATE
 ------------------------------ */
/* ------------------------------
   APP STATE
------------------------------ */
let state = {
  users: storage.get("mc_users", {}),
  currentUser: storage.get("mc_currentUser", null),
  settings: storage.get("mc_settings", { sound: true, theme: "dark" }),
  missions: storage.get("mc_missions", {}),
};

function saveState() {
  storage.set("mc_users", state.users);
  storage.set("mc_currentUser", state.currentUser);
  storage.set("mc_settings", state.settings);
  storage.set("mc_missions", state.missions);
}

/* ------------------------------
   AUTH / ACCOUNT MANAGEMENT
------------------------------ */
export async function createUser(username, email, pass) {
  // Simula busca no Supabase
  const { data: u, error } = await supabase
    .from("users")
    .select("*")
    .eq("nome", username)
    .single();

  if (error) return { ok: false, msg: "Erro ao criar conta." };

  state.currentUser = username;
  state.users[username] = {
    ...u,
    history: [],
    stats: { wins: 0, plays: 0 },
    profilePic:
      u.profilePic ||
      "https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg",
  };
  saveState();
  return { ok: true };
}

function logout() {
  state.currentUser = null;
  saveState();
  el("gameArea").style.display = "none";
  renderAuth();
  renderBalance();
}

async function deleteAccount() {
  if (!state.currentUser) return;

  const username = state.currentUser;
  const u = state.users[username];

  if (!u) return;

  // Remove no Supabase
  await supabase.from("users").delete().eq("id", u.id);

  // Limpa do localStorage e estado
  delete state.users[username];
  state.currentUser = null;
  saveState();

  showToast("Conta excluída com sucesso.", 3000);
  renderAuth();
  renderBalance();
}

/* ------------------------------
   INICIALIZAÇÃO
------------------------------ */
async function init() {
  document.title = CONFIG.site.title;
  el("brand").querySelector("h1").innerText = CONFIG.site.title;
  el("brand").querySelector(".logo").innerText = CONFIG.site.logo;

  el("gameArea").style.display = "none";

  // Se houver usuário logado, valida sessão
  if (state.currentUser) {
    const u = state.users[state.currentUser];
    if (u) {
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("saldo, banido")
        .eq("id", u.id)
        .single();

      if (error || !dbUser || dbUser.banido) {
        showToast("Sua sessão expirou ou a conta foi desativada.", 4000);
        logout();
      } else {
        state.users[state.currentUser].saldo = dbUser.saldo;
        saveState();
        showToast(`Bem-vindo de volta, ${state.currentUser}`, 2200);
      }
    }
  }

  renderAuth();
  renderBalance();
  renderGames("");
  setupNav();
  renderRanking();
  checkAndShowAdminMessage();
}

export async function createUser(username, email, pass) {
  // 1. Verifica se o usuário já existe no Supabase
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("nome", username)
    .single();

  if (existingUser) {
    return { ok: false, msg: "Usuário já existe" };
  }

  // 2. Cria o usuário no Supabase
  const passHash = hash(pass);
  const { data: newUser, error: insertError } = await criarUsuarioSupabase(
    username,
    passHash,
    CONFIG.users.defaultCredits || 0
  );

  if (insertError) {
    return { ok: false, msg: "Erro ao criar conta. Tente novamente." };
  }

  // 3. Loga o novo usuário
  state.currentUser = username;
  state.users[username] = {
    ...newUser[0], // Adiciona os dados do Supabase ao estado local
    email, // Email não está no DB, mantemos localmente se necessário
    history: [], // Inicializa localmente
    profilePic:
      "https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg",
    stats: { wins: 0, plays: 0, streak: 0 }, // Inicializa localmente
  };
  saveState();
  return { ok: true };
}
export async function loginUser(username, pass) {
  // Busca o usuário no Supabase
  const { data: u, error } = await supabase
    .from("users")
    .select("*")
    .eq("nome", username)
    .single();

  if (error || !u) return { ok: false, msg: "Usuário não encontrado" };

  if (u.isBanned) {
    if (u.isDeleted) {
      return {
        ok: false,
        msg: `Sua conta foi apagada por um administrador. Motivo: ${
          u.banReason || "N/A"
        }`,
      };
    }
    // Checa se o banimento expirou
    if (u.banExpiresAt && Date.now() > u.banExpiresAt) {
      delete u.isBanned;
      delete u.banExpiresAt;
      delete u.banReason;
      saveState();
      // Continua para o login normal
    } else {
      let banMsg = `Esta conta foi banida. Motivo: ${u.banReason || "N/A"}.`;
      if (u.banExpiresAt) {
        const remaining = new Date(u.banExpiresAt - Date.now())
          .toISOString()
          .substr(11, 8);
        banMsg += ` Tempo restante: ${remaining}`;
      }
      return { ok: false, msg: banMsg };
    }
  }
  // Compara o hash da senha
  if (u.pass_hash !== hash(pass)) return { ok: false, msg: "Senha inválida" };

  // Login bem-sucedido
  state.currentUser = username;
  // Armazena os dados essenciais do usuário no estado local
  state.users[username] = {
    ...u,
    history: [],
    stats: { wins: 0, plays: 0 },
    profilePic:
      u.profilePic ||
      "https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg",
  };
  saveState();
  return { ok: true };
}
function logout() {
  state.currentUser = null;
  saveState();
  el("gameArea").style.display = "none"; // Esconde a área de jogo
  renderAuth();
  renderBalance();
  showToast("Desconectado");
}
function deleteAccount() {
  if (!state.currentUser) return;
  // Aqui você adicionaria a lógica para deletar o usuário do Supabase
  // Ex: await supabase.from('users').delete().eq('id', getUser().id);
  // Limpa o usuário do estado local antes de deslogar
  delete state.users[state.currentUser];
  // Chama a função de logout para limpar completamente a sessão e a interface
  logout();
  showToast("Sua conta foi apagada com sucesso.");
}

/* ------------------------------
 UI RENDERING
 ------------------------------ */
const el = (id) => document.getElementById(id);

function renderAuth() {
  const box = el("authBox");
  box.innerHTML = "";
  if (!state.currentUser) {
    // show login / signup
    const form = document.createElement("div");
    form.className = "auth";
    form.innerHTML = `
<input id="authUser" placeholder="Usuário" />
<input id="authEmail" placeholder="Email (p/ cadastro)" />
<input id="authPass" type="password" placeholder="Senha" />
<div style="display:flex;gap:8px">
  <button id="btnLogin" class="play-btn">Entrar</button>
  <button id="btnSignup" class="play-btn">Cadastrar</button>
</div>
<div class="small-muted" style="margin-top:6px">Saldo inicial: R$ ${formatCurrency(
      CONFIG.users.defaultCredits
    )}</div>
`;
    box.appendChild(form);
    document.getElementById("btnLogin").onclick = () => {
      const u = document.getElementById("authUser").value.trim();
      const p = document.getElementById("authPass").value;
      if (!u || !p) {
        showToast("Preencha usuário e senha");
        return;
      }
      loginUser(u, p).then((r) => {
        if (!r.ok) showToast(r.msg);
        else {
          showToast("Bem-vindo, " + u);
          renderAuth();
          renderBalance();
          renderGames("");
          renderRanking();
          checkAndShowAdminMessage(); // CORREÇÃO: Checa por mensagem após o login
        }
      });
    };
    document.getElementById("btnSignup").onclick = () => {
      const u = document.getElementById("authUser").value.trim();
      const e = document.getElementById("authEmail").value.trim();
      const p = document.getElementById("authPass").value;
      if (!u || !e || !p) {
        showToast("Preencha todos os campos");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(e)) {
        showToast("Email inválido");
        return;
      }
      if (p.length < 4) {
        showToast("Senha muito curta (>=4)");
        return;
      }
      createUser(u, e, p).then((r) => {
        if (!r.ok) showToast(r.msg);
        else {
          showToast("Conta criada: " + u);
          renderAuth();
          renderBalance();
          renderGames(""); // CORREÇÃO: Renderiza os jogos novamente após o cadastro.
          renderRanking();
          checkAndShowAdminMessage(); // CORREÇÃO: Checa por mensagem após o cadastro
        }
      });
    };
  } else {
    const user = state.users[state.currentUser];
    const form = document.createElement("div"); // CORREÇÃO: A variável 'form' não estava declarada
    const profilePicUrl =
      user.profilePic ||
      "https://i.pinimg.com/236x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg";
    form.className = "auth-user";
    form.innerHTML = `
      <button id="inboxBtn" class="icon-btn" title="Caixa de Entrada">
        ✉️
        <span id="inboxBadge" class="badge" style="display: none;"></span>
      </button>
      <div style="text-align:right"><strong>${
        state.currentUser
      }</strong><div class="small-muted">${user.email || ""}</div></div>
      <img src="${profilePicUrl}" alt="Foto de Perfil" />
    `;
    box.appendChild(form);
    el("inboxBtn").onclick = showInbox;
    renderInboxBadge();
  }
  // update accountInfo
  const currentUserData = state.currentUser
    ? state.users[state.currentUser]
    : null;
  if (el("accountInfo")) {
    el("accountInfo").innerText = currentUserData
      ? `Usuário: ${state.currentUser}\nSaldo: ${formatCurrency(
          currentUserData.saldo
        )} créditos`
      : "Nenhum usuário conectado";
  }

  // Atualiza o nome de usuário na barra lateral
  el("usernameDisplay").innerText = state.currentUser || "—";
}
function renderInboxBadge() {
  if (!state.currentUser) return;
  const badge = el("inboxBadge");
  if (!badge) return;

  const unreadCount = (getUser().inbox || []).filter((msg) => !msg.read).length;
  if (unreadCount > 0) {
    badge.innerText = unreadCount;
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

function showInbox() {
  const u = getUser();
  if (!u) return;

  const inboxModal = document.createElement("div");
  inboxModal.className = "admin-modal-overlay";
  const messagesHtml = (u.inbox || [])
    .map(
      (msg) => `
    <div class="inbox-message ${msg.read ? "read" : ""}" data-msg-id="${
        msg.id
      }">
      <div class="inbox-message-header">
        <strong>${msg.title}</strong>
        <span class="small-muted">${new Date(
          msg.timestamp
        ).toLocaleString()}</span>
      </div>
      <p>${msg.message}</p>
    </div>
  `
    )
    .join("");

  inboxModal.innerHTML = `
    <div class="admin-modal-content">
      <div class="admin-modal-header"><h3>Caixa de Entrada</h3></div>
      <div class="admin-modal-body" style="padding: 0;">
        <div class="inbox-container">${
          messagesHtml ||
          '<p style="padding: 20px; text-align: center;">Nenhuma mensagem.</p>'
        }</div>
      </div>
    </div>
  `;
  document.body.appendChild(inboxModal);
  inboxModal.onclick = (e) => {
    if (e.target === inboxModal) inboxModal.remove();
  };

  // Marcar mensagens como lidas
  u.inbox.forEach((msg) => (msg.read = true));
  saveState();
  renderInboxBadge();
}

function renderBalance() {
  const user = getUser();
  const v = user ? user.saldo : 0;
  if (el("balanceValue")) {
    el("balanceValue").innerText = formatCurrency(v);
  }
}

function renderGames(filter = "") {
  const grid = el("gamesGrid");
  grid.innerHTML = "";
  const q = filter.toLowerCase();
  GAMES.forEach((g) => {
    if (
      q &&
      !(g.name.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q))
    )
      return;
    const card = document.createElement("div");
    card.className = "game";
    card.innerHTML = `<img src="${g.img}" alt="${g.name}" />`;
    // Clique na imagem abre o jogo
    card.querySelector("img").onclick = () => openGame(g.id);
    grid.appendChild(card);
  });
}

function renderMiniHistory() {
  const box = el("miniHistory");
  box.innerHTML = "";
  if (!state.currentUser) {
    box.innerHTML = '<div class="small-muted">Entre para ver histórico</div>';
    return;
  }
  const h = state.users[state.currentUser].history || [];
  h.slice()
    .reverse()
    .slice(0, 10)
    .forEach((it) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div>${it.game} • ${new Date(it.time).toLocaleTimeString()}</div>
        <div style="color:${it.bet > 0 ? "var(--success)" : "var(--danger)"}">
          ${it.result} • R$ ${formatCurrency(Math.abs(it.bet))}
        </div>`;
      box.appendChild(div);
    });
}

function renderHistory() {
  const box = el("historyList");
  box.innerHTML = "";
  if (!state.currentUser) {
    box.innerHTML = '<div class="small-muted">Entre para ver histórico</div>';
    return;
  }
  const h = state.users[state.currentUser].history || [];
  h.slice()
    .reverse()
    .forEach((it) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div>
          <strong>${it.game}</strong> — ${new Date(it.time).toLocaleString()}
          <div class="small-muted">${it.info || ""}</div>
        </div>
        <div>
          ${it.result} • R$ ${formatCurrency(it.bet)} 
          • Saldo: R$ ${formatCurrency(it.balanceAfter)}
        </div>`;
      box.appendChild(div);
    });
}

function renderRanking() {
  const box = el("rankingList");
  box.innerHTML = "";
  // gera o ranking por saldo
  const arr = Object.keys(state.users).map((u) => ({
    user: u,
    balance: state.users[u].balance,
    joined: state.users[u].joined,
  }));
  arr.sort((a, b) => b.balance - a.balance);
  arr.forEach((r, idx) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `<div>#${idx + 1} ${r.user}</div>
    <div>R$ ${formatCurrency(r.balance)}</div>`;
    box.appendChild(div);
  });
}

/* ------------------------------
 NAV EVENTS
 ------------------------------ */
function setupNav() {
  const show = (id) => {
    [
      "dashboard",
      "history",
      "ranking",
      "bonuses",
      "settings",
      "support",
    ].forEach((s) => {
      el("section-" + s).style.display = s === id ? "block" : "none";
      el("nav-" + s).classList.toggle("active", s === id);
    });
  };
  el("nav-dashboard").onclick = () => show("dashboard");
  el("nav-history").onclick = () => {
    show("history");
    renderHistory();
  };
  el("nav-ranking").onclick = () => {
    show("ranking");
    renderRanking();
  };
  el("nav-bonuses").onclick = () => show("bonuses");
  el("nav-settings").onclick = () => show("settings");
  el("nav-support").onclick = () => show("support");
  el("nav-logout").onclick = () => logout();
}

/* ------------------------------
 GAME ENGINE (simplified & deterministic RNG)
 ------------------------------ */
function ensureAuthOrWarn() {
  if (!state.currentUser) {
    showToast("Faça login para jogar");
    return false;
  }
  return true;
}

function openGame(gameId) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return;
  el("gameArea").style.display = "flex";
  el("gameTitle").innerText = g.name;
  el("gameSubtitle").innerText = g.cat;
  el("betInput").value = 10;
  el("gameCanvas").innerHTML = "";
  el("globalBetControls").style.display = "none"; // Esconde por padrão
  el("btnAction").style.display = "block"; // Garante que o botão Jogar seja visível por padrão
  el("gameCanvas").classList.remove("is-slot-game"); // remove classe de slot
  el("gameInfo").innerText = g.desc;
  el("btnAction").innerText = "Jogar";

  // Incrementa missões de Plinko
  if (gameId === "plinko" && state.currentUser && !state.missions.completed) {
    state.missions.plinkoPlays = (state.missions.plinkoPlays || 0) + 1;
    saveState();
    const required = CONFIG.rewards.plinkoMission.playsRequired;
    if (state.missions.plinkoPlays <= required) {
      showToast(
        `Jogada de Plinko ${state.missions.plinkoPlays}/${required} para a missão!`,
        2000
      );
    }
  }
  // CORREÇÃO: Movido o bloco de setup de jogos para dentro da função openGame
  if (gameId === "double" || gameId === "fortune-double") {
    setupDouble(gameId);
    setupGlobalBetControls();
  } else if (gameId === "dice") {
    setupDice();
    setupGlobalBetControls();
  } else if (gameId === "mines") {
    setupMines();
    setupGlobalBetControls();
  } else if (gameId === "plinko") {
    setupPlinko();
    setupGlobalBetControls();
  } else if (
    [
      "fortune-tiger",
      "fortune-dragon",
      "fortune-ox",
      "fortune-rabbit",
    ].includes(gameId)
  ) {
    setupSlot(gameId);
  } else {
    el("gameCanvas").innerHTML =
      '<div class="small-muted">Jogo não implementado completamente.</div>';
    setupGlobalBetControls();
  }
  renderMiniHistory();
}

/* ---------- helpers for betting and history ---------- */
function getUser() {
  return state.currentUser ? state.users[state.currentUser] : null;
}
function adjustBalance(delta) {
  const u = getUser();
  if (!u) return;
  u.balance += delta;
  saveState();
  renderBalance();
  renderRanking();
}
function pushHistory(game, bet, result, info) {
  if (!state.currentUser) return;
  const u = getUser();
  const entry = {
    game,
    bet,
    result,
    info,
    time: new Date().toISOString(),
    balanceAfter: u.balance,
  };
  u.history = u.history || [];
  u.history.push(entry);
  if (u.history.length > 500) u.history.shift();
  u.stats.plays = (u.stats.plays || 0) + 1;
  if (result && result.toLowerCase().includes("win"))
    u.stats.wins = (u.stats.wins || 0) + 1;
  saveState();

  // Adiciona notificação de jogo na caixa de entrada
  const notifTitle = result === "WIN" ? "Vitória!" : "Derrota";
  const notifMsg = `Jogo: ${game}. ${info}`;
  pushNotification(state.currentUser, "game", notifTitle, notifMsg);

  renderMiniHistory();
  renderHistory();
  renderRanking();
}

/* ------------------------------
 GLOBAL BETTING SYSTEM
 ------------------------------ */
function setupGlobalBetControls() {
  const betControlsContainer = el("globalBetControls");
  betControlsContainer.style.display = "flex";

  const betDisplayEl = el("globalBetDisplay");
  const betInputEl = el("betInput"); // O input original, agora usado como "dado oculto"

  let bet = 0.05;

  const formatBet = (value) => formatCurrency(value);

  const updateBetDisplay = () => {
    betDisplayEl.innerText = formatBet(bet);
    betInputEl.value = bet; // Mantém o input original sincronizado

    betDisplayEl.classList.add("bet-change-animation");
    setTimeout(
      () => betDisplayEl.classList.remove("bet-change-animation"),
      200
    );
  };

  const getStep = (currentBet) => {
    if (currentBet < 0.5) return 0.05;
    if (currentBet < 1.0) return 0.25;
    if (currentBet < 2.0) return 0.25;
    if (currentBet < 5.0) return 0.5;
    if (currentBet < 10.0) return 2.5;
    if (currentBet < 100.0) return 5.0;
    if (currentBet < 1000.0) return 50.0;
    if (currentBet < 10000.0) return 500.0;
    if (currentBet < 20000.0) return 1000.0;
    if (currentBet < 30000.0) return 2000.0;
    if (currentBet < 40000.0) return 3000.0;
    if (currentBet < 50000.0) return 4000.0;
    return 5000.0;
  };

  const changeBet = (direction) => {
    const MAX_BET = 50000;
    let newBet = bet;

    if (direction > 0) {
      if (bet >= MAX_BET) {
        showToast("Este é o valor máximo de aposta.");
        return;
      }
      newBet += getStep(bet);
    } else {
      newBet -= getStep(Math.max(0, newBet - 0.01));
    }

    newBet = Math.round(newBet * 100) / 100;
    bet = Math.max(0.05, Math.min(newBet, MAX_BET));

    updateBetDisplay();
  };

  // Atribui os eventos uma única vez para evitar duplicação
  if (!betControlsContainer.dataset.initialized) {
    el("globalBetDown").onclick = () => changeBet(-1);
    el("globalBetUp").onclick = () => changeBet(1);
    betControlsContainer.dataset.initialized = "true";
  }

  // Define o valor inicial ao abrir o jogo
  updateBetDisplay();
}

/* ------------------------------
 GAME: Double (crash style)
 ------------------------------ */
function setupDouble(gameId) {
  const isFortune = gameId === "fortune-double";

  const canvasEl = el("gameCanvas");
  canvasEl.innerHTML = `
    <div class="double-game ${isFortune ? "fortune-double-theme" : ""}">
      <div id="doubleHistory" class="double-history"></div>
      <div class="double-roulette-container">
        <div class="double-roulette-pointer"></div>
        <div id="doubleRoulette" class="double-roulette"></div>
      </div>
      <div class="double-bet-panels">
        <div class="double-bet-panel red">
          <h3>${isFortune ? "Apostar no Vermelho" : "Apostar no Vermelho"}</h3>
          <span>2x</span>
          <div class="double-bet-amount">R$ 0,00</div>
          <button data-color="red">Apostar</button>
        </div>
        <div class="double-bet-panel white">
          <h3>${isFortune ? "Apostar no Jade" : "Apostar no Branco"}</h3>
          <span>14x</span>
          <div class="double-bet-amount">R$ 0,00</div>
          <button data-color="white">Apostar</button>
        </div>
        <div class="double-bet-panel ${isFortune ? "gold" : "black"}">
          <h3>${isFortune ? "Apostar no Ouro" : "Apostar no Preto"}</h3>
          <span>2x</span>
          <div class="double-bet-amount">R$ 0,00</div>
          <button data-color="${isFortune ? "gold" : "black"}">Apostar</button>
        </div>
      </div>
    </div>
  `;

  const ROULETTE_NUMBERS = [0, 1, 14, 2, 13, 3, 12, 4, 11, 5, 10, 6, 9, 7, 8];
  const ROULETTE_COLORS = {
    red: [1, 2, 3, 4, 5, 6, 7],
    // CORREÇÃO: Define a chave 'gold' ou 'black' de forma estática para consistência
    ...(isFortune
      ? { gold: [8, 9, 10, 11, 12, 13, 14] }
      : { black: [8, 9, 10, 11, 12, 13, 14] }),
    white: [0],
  };

  const rouletteEl = el("doubleRoulette");
  const historyEl = el("doubleHistory");
  const betPanels = canvasEl.querySelectorAll(".double-bet-panel");

  let history = [];
  let bets = { red: 0, white: 0, gold: 0, black: 0 }; // Objeto de apostas unificado
  let isSpinning = false;

  function getColor(number) {
    if (ROULETTE_COLORS.red.includes(number)) return "red";
    if (ROULETTE_COLORS[isFortune ? "gold" : "black"].includes(number))
      return isFortune ? "gold" : "black";
    return "white";
  }

  function populateRoulette() {
    const extendedNumbers = [
      ...ROULETTE_NUMBERS,
      ...ROULETTE_NUMBERS,
      ...ROULETTE_NUMBERS,
    ];
    const fortuneSymbols = {
      red: "🏮", // Lantern
      gold: "🪙", // Coin
      white: "🐲", // Dragon
    };
    rouletteEl.innerHTML = extendedNumbers
      .map((n) => {
        const color = getColor(n);
        const symbol = isFortune ? fortuneSymbols[color] : n;
        return `<div class="double-roulette-item ${color}">${symbol}</div>`;
      })
      .join("");
  }

  function updateHistory() {
    historyEl.innerHTML = history
      .slice(0, 15)
      .map((n) => `<div class="double-history-item ${getColor(n)}"></div>`)
      .join("");
  }

  async function spinRoulette() {
    if (isSpinning) return;

    const totalBet = Object.values(bets).reduce((sum, val) => sum + val, 0);
    if (totalBet === 0) {
      return showToast("Faça uma aposta antes de girar.");
    }
    if (totalBet > getUser().balance) {
      return showToast("Saldo insuficiente para cobrir as apostas.");
    }

    isSpinning = true;
    el("btnAction").disabled = true;
    betPanels.forEach((p) => p.classList.remove("win", "loss"));

    adjustBalance(-totalBet);

    const winningNumber = Math.floor(Math.random() * 15);
    const winningColor = getColor(winningNumber);
    const itemWidth = 80; // width of a roulette item
    const baseOffset = ROULETTE_NUMBERS.length * itemWidth;
    const winningIndex = ROULETTE_NUMBERS.indexOf(winningNumber);
    const randomJitter = (Math.random() - 0.5) * itemWidth * 0.8;
    const targetPosition = baseOffset + winningIndex * itemWidth + randomJitter;

    rouletteEl.style.transition = "transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)";
    rouletteEl.style.transform = `translateX(-${targetPosition}px)`;

    await new Promise((resolve) => setTimeout(resolve, 5500)); // Wait for spin animation

    history.unshift(winningNumber);
    updateHistory();

    let totalWin = 0;
    Object.keys(bets).forEach((color) => {
      if (bets[color] > 0) {
        const panel = canvasEl.querySelector(`.double-bet-panel.${color}`);
        if (color === winningColor) {
          const multiplier = color === "white" ? 14 : 2;
          const winAmount = bets[color] * multiplier;
          totalWin += winAmount;
          panel.classList.add("win");
        } else {
          panel.classList.add("loss");
        }
      }
    });

    if (totalWin > 0) {
      adjustBalance(totalWin);
      showToast(`Você ganhou R$ ${formatCurrency(totalWin)}!`);
      pushHistory(
        "Double",
        totalBet,
        "WIN",
        `Cor: ${winningColor.toUpperCase()} -> +${totalWin}`
      );
    } else if (totalBet > 0) {
      showToast("Você perdeu.");
      pushHistory(
        "Double",
        -totalBet,
        "LOSS",
        `Cor: ${winningColor.toUpperCase()}`
      );
    }

    // Reset for next round
    bets = { red: 0, white: 0, gold: 0, black: 0 };
    betPanels.forEach((p) => {
      p.querySelector(".double-bet-amount").innerText = "R$ 0,00";
    });
    isSpinning = false;
    el("btnAction").disabled = false;
    rouletteEl.style.transition = "none";
    rouletteEl.style.transform = "translateX(0)";
  }

  betPanels.forEach((panel) => {
    panel.querySelector("button").onclick = (e) => {
      if (isSpinning) return showToast("Aguarde o fim da rodada para apostar.");
      if (!ensureAuthOrWarn()) return;
      const bet = Number(el("betInput").value) || 0;
      if (bet < 1) return showToast("Aposta mínima 1");

      const color = e.target.dataset.color;
      bets[color] += bet;
      panel.querySelector(
        ".double-bet-amount"
      ).innerText = `R$ ${formatCurrency(bets[color])}`;
      showToast(`Apostou R$ ${formatCurrency(bet)} no ${color.toUpperCase()}`);
    };
  });

  el("btnAction").innerText = "Girar";
  el("btnAction").onclick = spinRoulette;
  populateRoulette();
  updateHistory();
}

/* ------------------------------
 GAME: Dice
 ------------------------------ */
function setupDice() {
  const canvasEl = el("gameCanvas");
  canvasEl.innerHTML = `
    <div class="dice-game">
      <div class="dice-display">
        <div class="dice-info-label">Último Giro</div>
        <div id="diceResult" class="dice-result-number">0.00</div>
      </div>

      <div class="dice-controls">
        <div class="dice-control-group">
          <label>Multiplicador</label>
          <b id="diceMultiplier">2.00x</b>
        </div>
        <div class="dice-control-group">
          <label>Chance de Vitória</label>
          <b id="diceWinChance">49.50%</b>
        </div>
      </div>

      <div class="dice-slider-container">
        <div class="dice-slider-labels">
          <span id="diceTarget">Girar Abaixo de 49.50</span>
        </div>
        <input type="range" id="diceSlider" min="1" max="98" value="49.5" step="0.01" class="dice-slider">
      </div>

      <div id="diceHistory" class="dice-history"></div>
    </div>
  `;

  const slider = el("diceSlider");
  const multiplierEl = el("diceMultiplier");
  const winChanceEl = el("diceWinChance");
  const targetEl = el("diceTarget");
  const resultEl = el("diceResult");
  const historyEl = el("diceHistory");
  const diceGameContainer = canvasEl.querySelector(".dice-game");

  let history = [];

  function updateUI() {
    const chance = parseFloat(slider.value);
    const multiplier = (99 / chance).toFixed(2);

    winChanceEl.innerText = `${chance.toFixed(2)}%`;
    multiplierEl.innerText = `${multiplier}x`;
    targetEl.innerText = `Girar Abaixo de ${chance.toFixed(2)}`;
  }

  slider.addEventListener("input", updateUI);

  el("btnAction").onclick = () => {
    if (!ensureAuthOrWarn()) return;
    const bet = Number(el("betInput").value) || 0;
    if (bet < 1) return showToast("Aposta mínima 1");

    const u = getUser();
    if (bet > u.balance) return showToast("Saldo insuficiente");

    adjustBalance(-bet);

    const chance = parseFloat(slider.value);
    const roll = parseFloat((Math.random() * 100).toFixed(2));
    const isWin = roll < chance;

    // Animação de rolagem
    let animInterval = setInterval(() => {
      resultEl.innerText = (Math.random() * 100).toFixed(2);
    }, 50);

    setTimeout(() => {
      clearInterval(animInterval);
      resultEl.innerText = roll;
      resultEl.classList.remove("win", "loss");
      diceGameContainer.classList.remove("shake");

      if (isWin) {
        resultEl.classList.add("win");
      } else {
        resultEl.classList.add("loss");
        diceGameContainer.classList.add("shake");
      }
    }, 500);

    // Adiciona ao histórico
    history.unshift({ roll, isWin });
    if (history.length > 20) history.pop();
    historyEl.innerHTML = history
      .map(
        (h) =>
          `<span class="dice-history-item ${
            h.isWin ? "win" : "loss"
          }">${h.roll.toFixed(2)}</span>`
      )
      .join("");

    if (isWin) {
      const multiplier = 99 / chance;
      const payout = Math.floor(bet * multiplier);
      u.balance += payout;
      pushHistory(
        "Dice",
        bet,
        "WIN",
        `Giro ${roll.toFixed(2)} < ${chance.toFixed(2)} -> +${payout}`
      );
      showToast("Parabéns! Você ganhou " + payout + " créditos");
    } else {
      pushHistory(
        "Dice",
        -bet,
        "LOSS",
        `Giro ${roll.toFixed(2)} >= ${chance.toFixed(2)}`
      );
      showToast("Você perdeu!");
    }
    saveState();
    renderBalance();
  };

  updateUI();
}

/* ------------------------------
 GAME: Mines (campo minado)
 ------------------------------ */
function setupMines() {
  const canvasEl = el("gameCanvas");
  canvasEl.innerHTML = "";

  // --- State variables ---
  let started = false;
  let gameOver = false;
  let bet = 0;
  let revealedCount = 0;
  let multiplier = 1;
  let bombs = 4;
  const size = 5;
  let bombPositions = new Set();
  let cells = [];

  // --- UI Elements ---
  const controls = document.createElement("div");
  controls.className = "mines-controls";
  controls.innerHTML = `
    <label class="small-muted">Bombas: <input type="number" id="minesBombs" min="3" max="24" value="4"></label>
    <div id="minesInfoBar" class="mines-info-bar" style="display:none;">
      <span>Multiplicador: <b id="minesMultiplier">1.00x</b></span>
      <span>Lucro: <b id="minesProfit">0</b></span>
    </div>
  `;
  canvasEl.appendChild(controls);

  // Adiciona a lógica para corrigir o valor das bombas
  const bombsInput = el("minesBombs");
  bombsInput.addEventListener("change", () => {
    let value = parseInt(bombsInput.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 24) {
      value = 24;
    }
    bombsInput.value = value;
  });

  const board = document.createElement("div");
  board.className = "mines-board";
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  canvasEl.appendChild(board);

  function revealBoard() {
    gameOver = true;
    board.classList.add("game-over");
    cells.forEach((cell, i) => {
      if (bombPositions.has(i)) {
        if (!cell.classList.contains("revealed-bomb")) {
          cell.classList.add("post-reveal-bomb");
          cell.innerText = "💣";
        }
      } else {
        if (!cell.dataset.revealed) {
          cell.classList.add("post-reveal-safe");
          cell.innerText = "💎";
        }
      }
    });
  }

  function clickCell(e) {
    if (gameOver || e.target.dataset.revealed) return;

    const cell = e.target;
    const idx = Number(cell.dataset.idx);

    if (bombPositions.has(idx)) {
      // --- HIT A BOMB ---
      gameOver = true;
      cell.classList.add("revealed-bomb");
      cell.innerText = "💣";
      board.classList.add("shake"); // Animação de tremor
      pushHistory("Mines", -bet, "LOSS", `Explodiu com ${bombs} bombas`);
      showToast("Mina! Você perdeu.");
      revealBoard();
      el("btnAction").innerText = "Jogar Novamente";
      el("minesBombs").disabled = false; // Reabilita o input de bombas
      el("btnAction").onclick = () => openGame("mines");
    } else {
      // --- HIT A SAFE SPOT ---
      cell.dataset.revealed = "true";
      cell.classList.add("revealed-safe");
      cell.innerText = "💎";
      revealedCount++;

      // Calcular novo multiplicador (fórmula aprimorada)
      const totalSafeSpots = size * size - bombs;
      multiplier =
        (1 / ((totalSafeSpots - revealedCount) / totalSafeSpots)) * 0.95;
      multiplier = Math.max(multiplier, 1); // Garante que não seja menor que 1

      const potentialWin = Math.floor(bet * multiplier);

      el("minesMultiplier").innerText = `${multiplier.toFixed(2)}x`;
      el("minesProfit").innerText = potentialWin; // CORREÇÃO: Mostra o valor total do saque
      el("btnAction").disabled = false; // Habilita o botão de sacar
    }
  }

  function startGame() {
    if (!ensureAuthOrWarn()) return;
    bet = Number(el("betInput").value) || 0;
    if (bet < 1) return showToast("Aposta mínima 1");
    if (bet > getUser().balance) return showToast("Saldo insuficiente");

    adjustBalance(-bet);

    started = true;
    gameOver = false;
    revealedCount = 0;
    multiplier = 1;
    bombs = parseInt(el("minesBombs").value, 10);
    bombPositions = new Set();
    while (bombPositions.size < bombs)
      bombPositions.add(Math.floor(Math.random() * size * size));

    board.innerHTML = "";
    board.classList.remove("shake", "game-over");
    cells = [];
    for (let i = 0; i < size * size; i++) {
      const c = document.createElement("div");
      c.className = "mine-cell";
      c.dataset.idx = i;
      c.addEventListener("click", clickCell);
      board.appendChild(c);
      cells.push(c);
    }

    el("minesBombs").disabled = true;
    el("minesInfoBar").style.display = "flex";
    el("minesMultiplier").innerText = "1.00x";
    el("minesProfit").innerText = "0";

    el("btnAction").innerText = "Sacar";
    el("btnAction").disabled = true; // Desabilita até o primeiro clique
    el("btnAction").onclick = () => {
      if (gameOver || revealedCount === 0) return;
      const win = Math.floor(bet * multiplier);
      getUser().balance += win;
      pushHistory(
        "Mines",
        bet,
        "WIN",
        `${revealedCount} casas • ${bombs} bombas • x${multiplier.toFixed(
          2
        )} -> +${win}`
      );
      showToast(`Você sacou ${win} créditos!`);
      revealBoard();
      saveState();
      el("minesBombs").disabled = false; // Reabilita o input de bombas
      renderBalance();
      el("btnAction").innerText = "Jogar Novamente";
      el("btnAction").onclick = () => openGame("mines");
    };
  }

  // --- Initial Setup ---
  el("btnAction").innerText = "Começar Jogo";
  el("btnAction").onclick = startGame;
  el("gameInfo").innerText =
    "Escolha a quantidade de bombas e clique em 'Começar Jogo'.";
}

/* ------------------------------
 GAME: Plinko
 ------------------------------ */
function setupPlinko() {
  const canvasEl = el("gameCanvas");
  canvasEl.innerHTML = "";

  // --- Controles do Jogo ---
  const controls = document.createElement("div");
  controls.className = "plinko-controls";
  controls.innerHTML = `
    <div class="plinko-control-group">
      <label>Risco</label>
      <select id="plinkoRisk">
        <option value="low">Baixo</option>
        <option value="medium" selected>Médio</option>
        <option value="high">Alto</option>
      </select>
    </div>
    <div class="plinko-control-group">
      <label>Linhas</label>
      <select id="plinkoRows">
        <option>8</option><option>10</option><option selected>12</option><option>14</option><option>16</option>
      </select>
    </div>
  `;
  canvasEl.appendChild(controls);

  // --- Canvas para o Jogo ---
  const canvas = document.createElement("canvas");
  canvas.width = 450;
  canvas.height = 480;
  canvasEl.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let pins = [];
  let multipliers = [];
  let balls = [];

  const MULTIPLIERS = {
    low: [5.6, 2.1, 1.1, 1, 0.5, 0.5, 1, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 13],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  };

  function setupBoard() {
    pins = [];
    multipliers = [];
    const rows = parseInt(el("plinkoRows").value, 10);
    const risk = el("plinkoRisk").value;

    const pinSize = 5;
    const startY = 60;
    const rowSpacing = 30;

    for (let r = 0; r < rows; r++) {
      const numPinsInRow = r + 2;
      const totalWidth = (numPinsInRow - 1) * 35;
      const startX = (canvas.width - totalWidth) / 2;
      for (let c = 0; c < numPinsInRow; c++) {
        pins.push({
          x: startX + c * 35,
          y: startY + r * rowSpacing,
          radius: pinSize,
        });
      }
    }

    const multiplierData = MULTIPLIERS[risk] || MULTIPLIERS.medium;
    const numMultipliers = rows + 1;
    const multiplierWidth = canvas.width / numMultipliers;
    for (let i = 0; i < numMultipliers; i++) {
      const midIndex = Math.floor(multiplierData.length / 2);
      const offset = Math.abs(i - Math.floor(numMultipliers / 2));
      const value =
        multiplierData[midIndex + offset] ||
        multiplierData[midIndex - offset] ||
        0.2;
      multipliers.push({
        x: i * multiplierWidth,
        y: canvas.height - 30,
        width: multiplierWidth,
        height: 30,
        value: value,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Desenha os pinos
    ctx.fillStyle = "#8a9eb5";
    pins.forEach((pin) => {
      ctx.beginPath();
      ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    // Desenha os multiplicadores
    multipliers.forEach((m) => {
      ctx.fillStyle =
        m.value < 1 ? "#b82e2e" : m.value > 5 ? "#f6b93b" : "#2ecc71";
      ctx.fillRect(m.x, m.y, m.width, m.height);
      ctx.fillStyle = "white";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${m.value}x`, m.x + m.width / 2, m.y + 20);
    });
    // Desenha as bolinhas
    balls.forEach((ball) => {
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function update() {
    balls.forEach((ball, ballIndex) => {
      ball.vy += 0.1; // Gravidade
      ball.y += ball.vy;
      ball.x += ball.vx;

      // Colisão com pinos
      for (const pin of pins) {
        const dist = Math.hypot(ball.x - pin.x, ball.y - pin.y);
        if (dist < ball.radius + pin.radius) {
          ball.vy *= -0.3; // Quica um pouco
          ball.vx = (Math.random() - 0.5) * 2; // Muda de direção
          ball.y = pin.y - (ball.radius + pin.radius); // Evita ficar preso
        }
      }

      // Chegou ao fundo
      if (ball.y > canvas.height - 30) {
        const multiplier = multipliers.find(
          (m) => ball.x >= m.x && ball.x < m.x + m.width
        );
        if (multiplier) {
          const payout = Math.floor(ball.bet * multiplier.value);
          const isWin = multiplier.value >= 1;

          getUser().balance += payout;

          if (isWin) {
            pushHistory(
              "Plinko",
              ball.bet,
              "WIN",
              `x${multiplier.value} -> +${payout}`
            );
            showToast(`Ganhou ${payout} créditos (x${multiplier.value})`);
          } else {
            const lossAmount = ball.bet - payout;
            pushHistory("Plinko", -lossAmount, "LOSS", `x${multiplier.value}`);
            showToast(`Perdeu ${lossAmount} créditos (x${multiplier.value})`);
          }

          saveState();
          renderBalance();
        }
        balls.splice(ballIndex, 1); // Remove a bola
      }
    });

    draw();
    requestAnimationFrame(update);
  }

  el("plinkoRisk").onchange = setupBoard;
  el("plinkoRows").onchange = setupBoard;

  el("btnAction").onclick = () => {
    if (!ensureAuthOrWarn()) return;
    const bet = Number(el("betInput").value) || 0;
    if (bet < 1) return showToast("Aposta mínima 1");
    if (bet > getUser().balance) return showToast("Saldo insuficiente");

    adjustBalance(-bet);
    balls.push({
      x: canvas.width / 2,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 1,
      radius: 7,
      color: "#f6b93b",
      bet,
    });
  };

  setupBoard();
  update();
  el("gameInfo").innerText =
    "Solte a bola e torça por um grande multiplicador!";
}
/* ------------------------------
 GAME: Fruit Slice (simplified)
 ------------------------------ */
let fruitSliceGame = {
  interval: null,
  animationFrame: null,
  running: false,
};

function setupFruitSlice() {
  const canvas = el("gameCanvas");
  canvas.innerHTML = ""; // Limpa conteúdo anterior
  const gameCanvas = document.createElement("canvas");
  gameCanvas.width = 500;
  gameCanvas.height = 300;
  gameCanvas.style.background = "#1a202c";
  gameCanvas.style.borderRadius = "10px";
  canvasEl.appendChild(gameCanvas);

  const ctx = gameCanvas.getContext("2d");
  let bet = 0;
  let score = 0;
  let objects = []; // { x, y, vx, vy, text, type, radius, sliced }
  let sliceTrail = [];
  let isSlicing = false;

  // Limpa qualquer loop de jogo anterior para evitar múltiplos jogos rodando
  if (fruitSliceGame.interval) clearInterval(fruitSliceGame.interval);
  if (fruitSliceGame.animationFrame)
    cancelAnimationFrame(fruitSliceGame.animationFrame);
  fruitSliceGame.running = false;

  function spawnObject() {
    const fruits = ["🍎", "🍌", "🍍", "🍊", "🍇", "🍉"];
    const isBomb = Math.random() < 0.2; // 20% de chance de ser bomba
    const text = isBomb
      ? "💣"
      : fruits[Math.floor(Math.random() * fruits.length)];

    objects.push({
      x: Math.random() * gameCanvas.width * 0.8 + gameCanvas.width * 0.1,
      y: gameCanvas.height + 30,
      vx: (Math.random() - 0.5) * 4,
      vy: -10 - Math.random() * 4, // Velocidade inicial para cima
      text,
      type: isBomb ? "bomb" : "fruit",
      radius: 20,
      sliced: false,
      rotation: 0,
    });
  }

  function update() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Desenha o rastro do corte
    if (sliceTrail.length > 1) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sliceTrail[0].x, sliceTrail[0].y);
      for (let i = 1; i < sliceTrail.length; i++) {
        ctx.lineTo(sliceTrail[i].x, sliceTrail[i].y);
      }
      ctx.stroke();
    }

    // Atualiza e desenha os objetos
    objects.forEach((obj, index) => {
      obj.vy += 0.2; // Gravidade
      obj.x += obj.vx;
      obj.y += obj.vy;
      obj.rotation += obj.vx * 0.05;

      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation);
      ctx.font = "36px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(obj.text, 0, 0);
      ctx.restore();

      // Remove se saiu da tela
      if (obj.y > gameCanvas.height + 40) {
        objects.splice(index, 1);
      }
    });

    fruitSliceGame.animationFrame = requestAnimationFrame(update);
  }

  function handleSlice(x, y) {
    if (!isSlicing) return;
    sliceTrail.push({ x, y });
    if (sliceTrail.length > 20) sliceTrail.shift();

    objects.forEach((obj) => {
      if (obj.sliced) return;
      const dist = Math.hypot(x - obj.x, y - obj.y);
      if (dist < obj.radius) {
        if (obj.type === "bomb") {
          // Fim de jogo
          showToast("BOOM! Você acertou uma bomba e perdeu.");
          pushHistory("FruitSlice", -bet, "LOSS", "Acertou uma bomba");
          endGame();
        } else {
          obj.sliced = true;
          score++;
          el("gameInfo").innerText = `Pontos: ${score} | Multiplicador: ${(
            1 +
            score * 0.4
          ).toFixed(2)}x`;
          // Efeito de corte
          obj.text = "💥";
          setTimeout(() => (obj.text = ""), 200);
        }
      }
    });
  }

  function endGame() {
    fruitSliceGame.running = false;
    clearInterval(fruitSliceGame.interval);
    cancelAnimationFrame(fruitSliceGame.animationFrame);
    objects = [];
    el("btnAction").innerText = "Jogar";
  }

  gameCanvas.addEventListener("mousedown", () => (isSlicing = true));
  gameCanvas.addEventListener("mouseup", () => {
    isSlicing = false;
    sliceTrail = [];
  });
  gameCanvas.addEventListener("mouseleave", () => {
    isSlicing = false;
    sliceTrail = [];
  });
  gameCanvas.addEventListener("mousemove", (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    handleSlice(e.clientX - rect.left, e.clientY - rect.top);
  });

  el("gameInfo").innerText = "Corte as frutas e desvie das bombas!";
  el("btnAction").onclick = () => {
    if (fruitSliceGame.running) {
      // Resgatar ganhos
      const payout = Math.floor(bet * (1 + score * 0.4));
      getUser().balance += payout;
      pushHistory("FruitSlice", bet, "WIN", `Score:${score} -> +${payout}`);
      showToast("Você ganhou " + payout + " créditos");
      saveState();
      renderBalance();
      endGame();
      return;
    }

    if (!ensureAuthOrWarn()) return;
    bet = Number(el("betInput").value) || 0;
    if (bet < 1) return showToast("Aposta mínima 1");
    const u = getUser();
    if (bet > u.balance) return showToast("Saldo insuficiente");

    u.balance -= bet;
    saveState();
    renderBalance();

    score = 0;
    fruitSliceGame.running = true;
    el("btnAction").innerText = "Resgatar";
    el("gameInfo").innerText = "Pontos: 0 | Multiplicador: 1.00x";
    fruitSliceGame.interval = setInterval(spawnObject, 800);
    update();
  };
}

/* ------------------------------
 GAME: Slots (Fortune themed, simplified)
 ------------------------------ */
function setupSlot(gameId) {
  // Esconde os controles de aposta globais, pois o slot tem os seus próprios
  el("globalBetControls").style.display = "none";
  el("btnAction").style.display = "none"; // Esconde o botão "Jogar" genérico
  el("betInput").style.display = "none";

  // 1. Limpa a área do jogo e prepara o layout específico do slot
  const gameArea = el("gameArea");
  const gameCanvas = el("gameCanvas");
  const gameInfo = el("gameInfo");
  const genericBetControls = gameArea.querySelector(".bet-controls");

  gameInfo.style.display = "none";

  const isFortuneDragon = gameId === "fortune-dragon";
  const isFortuneOx = gameId === "fortune-ox";
  const isFortuneRabbit = gameId === "fortune-rabbit";
  let themeClass = "fortune-tiger-theme";
  if (isFortuneDragon) themeClass = "fortune-dragon-theme";
  if (isFortuneOx) themeClass = "fortune-ox-theme";
  if (isFortuneRabbit) themeClass = "fortune-rabbit-theme";

  gameCanvas.classList.add("is-slot-game", themeClass);

  // 2. Injeta o HTML do jogo
  gameCanvas.innerHTML = `
    <div class="slot-header-info">
        <div id="bonusSpinsContainer" style="display: none;">
            Giros Grátis: <span id="bonusSpinsCount">0</span>
        </div>
    </div>
    <div class="slot-machine">
        <div id="slotOverlay" class="slot-overlay"></div>
        <div class="slot-reels">
            <canvas id="slotLinesCanvas" class="slot-lines-canvas"></canvas>
            <div class="reel"></div>
            <div class="reel"></div>
            <div class="reel"></div>
        </div>
    </div>
    <div class="slot-controls">
        <div class="control-group">
            <span class="small-muted">Saldo</span>
            <b id="slotBalance">${getUser()?.balance || 0}</b>
        </div>
        <div class="control-group main-controls">
            <button id="betDown" class="bet-adj">-</button>
            <div class="bet-display">
                <span class="small-muted">Aposta</span>
                <b id="slotBet">10</b>
            </div>
            <button id="betUp" class="bet-adj">+</button>
        </div>
        <div class="control-group">
            <span class="small-muted">Ganhos</span>
            <b id="slotWin">0</b>
        </div>
    </div>
    <div class="slot-actions">
        <button id="slotTurbo" class="action-btn" title="Giros rápidos">⚡</button>
        <button id="slotSpin" class="spin-btn" title="Girar os rolos"></button>
        <button id="slotAuto" class="action-btn" title="Girar automaticamente">AUTO</button>
    </div>
  `;

  // 3. Define constantes e variáveis de estado do jogo
  const TIGER_SYMBOLS = {
    wild: { id: "wild", icon: "🐯", value: 250, isBonus: false },
    goldbar: { id: "goldbar", icon: "🍫", value: 100, isBonus: false },
    fish: { id: "fish", icon: "🐠", value: 50, isBonus: false },
    bag: { id: "bag", icon: "💰", value: 25, isBonus: false },
    envelope: { id: "envelope", icon: "🧧", value: 10, isBonus: false },
    ingot: { id: "ingot", icon: "🧰", value: 8, isBonus: false },
    orange: { id: "orange", icon: "🍊", value: 3, isBonus: false },
  };

  const DRAGON_SYMBOLS = {
    wild: { id: "wild", icon: "🐉", value: 250, isBonus: true }, // Dragon is Wild and Bonus
    koi: { id: "koi", icon: "🐟", value: 100, isBonus: false },
    lantern: { id: "lantern", icon: "🏮", value: 50, isBonus: false },
    pearl: { id: "pearl", icon: "⚪", value: 25, isBonus: false },
    scroll: { id: "scroll", icon: "📜", value: 10, isBonus: false },
    coin: { id: "coin", icon: "🪙", value: 8, isBonus: false },
    ingot: { id: "ingot", icon: "💎", value: 3, isBonus: false },
  };

  const OX_SYMBOLS = {
    wild: { id: "wild", icon: "🐂", value: 250, isBonus: true }, // Ox is Wild and Bonus
    goldSack: { id: "goldSack", icon: "💰", value: 100, isBonus: false },
    coins: { id: "coins", icon: "🪙", value: 50, isBonus: false },
    firecracker: { id: "firecracker", icon: "🧨", value: 25, isBonus: false },
    scroll: { id: "scroll", icon: "📜", value: 10, isBonus: false },
    lantern: { id: "lantern", icon: "🏮", value: 8, isBonus: false },
    ingot: { id: "ingot", icon: "💎", value: 3, isBonus: false },
  };

  const RABBIT_SYMBOLS = {
    wild: { id: "wild", icon: "🐇", value: 250, isBonus: true }, // Rabbit is Wild and Bonus
    carrot: { id: "carrot", icon: "🥕", value: 100, isBonus: false },
    star: { id: "star", icon: "✨", value: 50, isBonus: false },
    coin: { id: "coin", icon: "🪙", value: 25, isBonus: false },
    firecracker: { id: "firecracker", icon: "🧨", value: 10, isBonus: false },
    lantern: { id: "lantern", icon: "🏮", value: 8, isBonus: false },
    ingot: { id: "ingot", icon: "💎", value: 3, isBonus: false },
  };

  const SYMBOLS = // CORREÇÃO: Removida a declaração duplicada que causava o erro.
    isFortuneDragon
      ? DRAGON_SYMBOLS
      : isFortuneOx
      ? OX_SYMBOLS
      : isFortuneRabbit
      ? RABBIT_SYMBOLS
      : TIGER_SYMBOLS;
  const SYMBOL_LIST = Object.values(SYMBOLS);
  const PAYLINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let isSpinning = false,
    isTurbo = false,
    isAuto = false,
    freeSpinsRemaining = 0,
    isBonusMode = false,
    bet = 0.05; // Aposta inicial
  let direction = 1; // Variável para o updateBet

  // 4. Seleciona os elementos da UI após serem criados
  const reels = Array.from(document.querySelectorAll(".reel"));
  const symbolElements = [];
  reels.forEach((reelEl) => {
    reelEl.innerHTML = `
        <div class="symbol-container"><div class="symbol"></div></div>
        <div class="symbol-container"><div class="symbol"></div></div>
        <div class="symbol-container"><div class="symbol"></div></div>`;
    symbolElements.push(...reelEl.querySelectorAll(".symbol"));
  });

  const linesCanvas = el("slotLinesCanvas");
  const linesCtx = linesCanvas.getContext("2d");
  const slotReelsEl = el("slot-reels");
  setTimeout(() => {
    // Atraso para garantir que as dimensões estejam corretas
    linesCanvas.width = slotReelsEl.clientWidth;
    linesCanvas.height = slotReelsEl.clientHeight;
  }, 100);

  // 5. Funções auxiliares do jogo
  const formatBetDisplay = (value) => formatCurrency(value);
  function updateBet(direction) {
    // direction é 1 para aumentar, -1 para diminuir
    if (isSpinning) return;

    const MAX_BET = 50000;
    let newBet = bet;

    // Define o valor do incremento/decremento baseado na faixa de aposta atual
    const getStep = (currentBet) => {
      if (currentBet < 0.5) return 0.05;
      if (currentBet < 1.0) return 0.25;
      if (currentBet < 2.0) return 0.25;
      if (currentBet < 5.0) return 0.5;
      if (currentBet < 10.0) return 2.5;
      if (currentBet < 100.0) return 5.0; // Simplificado, mas segue a lógica geral
      if (currentBet < 1000.0) return 50.0;
      if (currentBet < 10000.0) return 500.0;
      if (currentBet < 20000.0) return 1000.0;
      if (currentBet < 30000.0) return 2000.0;
      if (currentBet < 40000.0) return 3000.0;
      if (currentBet < 50000.0) return 4000.0;
      return 5000.0; // Acima de 50k, se o limite fosse maior
    };

    if (direction > 0) {
      if (bet >= MAX_BET) {
        showToast("Este é o valor máximo de aposta.");
        return;
      }
      newBet += getStep(bet);
    } else {
      newBet -= getStep(Math.max(0, newBet - 0.01)); // Usa o step da faixa anterior
    }

    // Arredonda para evitar problemas com ponto flutuante e garante os limites
    newBet = Math.round(newBet * 100) / 100;
    bet = Math.max(0.05, Math.min(newBet, MAX_BET));

    const betDisplayEl = el("slotBet");
    betDisplayEl.innerText = formatBetDisplay(bet);

    // Adiciona a classe de animação e a remove após um curto período
    betDisplayEl.classList.add("bet-change-animation");
    setTimeout(
      () => betDisplayEl.classList.remove("bet-change-animation"),
      200
    );
  }

  function setControlsDisabled(disabled) {
    const isAutoSpinning = isAuto && isSpinning;
    el("slotSpin").disabled = disabled || isAutoSpinning;
    el("betUp").disabled = disabled || isAutoSpinning;
    el("betDown").disabled = disabled || isAutoSpinning;
    el("slotTurbo").disabled = disabled || isAutoSpinning;
    // O botão Auto só é desabilitado durante um giro manual.
    el("slotAuto").disabled = disabled && !isAuto;
  }

  function showWinAnimation(type, amount) {
    const overlay = el("slotOverlay");
    overlay.innerHTML = `
        <div id="coin-container"></div>
        <div class="win-text-container">
          <div class="win-text ${type.toLowerCase()}">${type}</div>
          <div class="win-amount" id="winAmountCounter">0</div>
        </div>`;
    overlay.style.display = "grid";
    overlay.classList.add("active");

    const winAmountEl = el("winAmountCounter");
    let start = 0;
    const duration = 1500;
    const increment = amount / (duration / (1000 / 60));
    const counter = setInterval(() => {
      start += increment;
      if (start >= amount) {
        start = amount;
        clearInterval(counter);
      }
      winAmountEl.innerText = Math.floor(start);
    }, 1000 / 60);

    const coinContainer = el("coin-container");
    for (let i = 0; i < 50; i++) {
      const coin = document.createElement("div");
      coin.className = "coin";
      coin.style.left = `${Math.random() * 100}%`;
      coin.style.animationDelay = `${Math.random() * 2}s`;
      coin.style.setProperty("--i", Math.random());
      coinContainer.appendChild(coin);
    }

    setTimeout(() => {
      overlay.style.display = "none";
      overlay.classList.remove("active");
      coinContainer.innerHTML = "";
    }, 3500);
  }

  function drawPayline(line) {
    linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
    const symbolContainers = document.querySelectorAll(".symbol-container");
    const visualMap = (logicalIndex) => {
      const row = Math.floor(logicalIndex / 3);
      const col = logicalIndex % 3;
      return col * 3 + row;
    };
    const getCenter = (index) => {
      const rect = symbolContainers[index].getBoundingClientRect();
      const parentRect = linesCanvas.getBoundingClientRect();
      return {
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top + rect.height / 2,
      };
    };
    const p1 = getCenter(visualMap(line[0])),
      p2 = getCenter(visualMap(line[1])),
      p3 = getCenter(visualMap(line[2]));
    linesCtx.beginPath();
    linesCtx.moveTo(p1.x, p1.y);
    linesCtx.lineTo(p2.x, p2.y);
    linesCtx.lineTo(p3.x, p3.y);
    linesCtx.strokeStyle = "#ffd700";
    linesCtx.lineWidth = 5;
    linesCtx.lineCap = "round";
    linesCtx.shadowColor = "#ffc700";
    linesCtx.shadowBlur = 15;
    linesCtx.stroke();
    setTimeout(
      () => linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height),
      1500
    );
  }

  function highlightWinningSymbols(line) {
    const visualMap = (logicalIndex) => {
      const row = Math.floor(logicalIndex / 3);
      const col = logicalIndex % 3;
      return col * 3 + row;
    };
    line.forEach((index) => {
      const visualIndex = visualMap(index);
      const symbolContainer =
        document.querySelectorAll(".symbol-container")[visualIndex];
      symbolContainer.classList.add("win-highlight");
    });
  }

  // 6. Função principal de giro (doSpin)
  async function doSpin() {
    // CORREÇÃO DEFINITIVA: O bloco try...finally garante que os botões
    // Este bloco é para o modo AutoPlay
    if (isAuto && freeSpinsRemaining > 0) {
      el("slotAuto").innerText = freeSpinsRemaining;
    }
    // SEMPRE serão reativados, mesmo que ocorra um erro inesperado.
    try {
      if (isSpinning) return;
      if (!ensureAuthOrWarn()) return;

      // Validação de aposta mínima para girar
      if (bet < 1.0) {
        return showToast("Aposta mínima: R$ 1.00");
      }

      const u = getUser();
      if (bet > u.balance) {
        showToast("Saldo insuficiente");
        isAuto = false;
        el("slotAuto").classList.remove("active");
        return;
      }

      isSpinning = true;
      setControlsDisabled(true);

      if (!isBonusMode) {
        adjustBalance(-bet);
      }

      el("slotBalance").innerText = u.balance;
      el("slotWin").innerText = 0;
      document
        .querySelectorAll(".symbol-container.win-highlight")
        .forEach((el) => el.classList.remove("win-highlight"));
      document
        .querySelectorAll(".reel")
        .forEach((r) => r.classList.remove("game-over"));
      linesCtx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);

      const spinTime = isTurbo ? 200 : 1000;
      reels.forEach((r) => r.classList.add("spinning"));

      await new Promise((resolve) => setTimeout(resolve, spinTime));

      reels.forEach((r) => r.classList.remove("spinning"));

      let finalGrid = Array.from(
        { length: 9 },
        () => SYMBOL_LIST[Math.floor(Math.random() * SYMBOL_LIST.length)]
      );

      // Lógica de Multiplicador Aleatório (apenas em giros normais)
      let randomMultiplier = 1;
      if (!isBonusMode && Math.random() < 0.1) {
        // 10% de chance
        const multipliers = [2, 3, 5, 10];
        randomMultiplier =
          multipliers[Math.floor(Math.random() * multipliers.length)];
        showToast(`Multiplicador x${randomMultiplier} ativado!`, 2000);
        // Poderia adicionar uma animação aqui
      }

      for (let i = 0; i < 9; i++) {
        symbolElements[i].innerText = finalGrid[i].icon;
      }

      let totalWin = 0;
      let winningLinesInfo = [];
      let bonusSymbolsCount = 0;

      PAYLINES.forEach((line) => {
        const s1 = finalGrid[line[0]],
          s2 = finalGrid[line[1]],
          s3 = finalGrid[line[2]];
        const firstSymbol = s1.id === "wild" ? s2 : s1;
        const isWin = [s1, s2, s3].every(
          (s) => s.id === firstSymbol.id || s.id === "wild"
        );

        if (isWin) {
          const winSymbol = firstSymbol;
          const lineWin = bet * (winSymbol.value / 10);
          totalWin += lineWin;
          drawPayline(line);
          highlightWinningSymbols(line);
          winningLinesInfo.push(`${winSymbol.icon} x3`);
        }
      });

      // Contar símbolos de bônus (Dragão)
      if (isFortuneDragon || isFortuneOx || isFortuneRabbit) {
        // CORREÇÃO: Removida a condição duplicada.
        bonusSymbolsCount = finalGrid.filter((s) => s.isBonus).length;
      }

      if (totalWin > 0) {
        // Aplica multiplicadores
        if (isBonusMode) totalWin *= 2;
        if (randomMultiplier > 1) totalWin *= randomMultiplier;

        totalWin = Math.floor(totalWin);
        adjustBalance(totalWin);
        el("slotBalance").innerText = u.balance;
        el("slotWin").innerText = totalWin;
        reels.forEach((r) => r.classList.add("game-over"));

        pushHistory(
          gameId,
          bet,
          "WIN",
          `${winningLinesInfo.join(", ")} -> +${totalWin}`
        );

        const winMultiplier = totalWin / bet;
        let winAnimationDuration = 1500;

        if (winMultiplier >= 20) {
          showWinAnimation("MEGA WIN", totalWin);
          winAnimationDuration = 3500;
        } else if (winMultiplier >= 10) {
          showWinAnimation("BIG WIN", totalWin);
          winAnimationDuration = 3500;
        } else {
          showToast(`Ganhou ${totalWin} créditos!`);
        }
        await new Promise((resolve) =>
          setTimeout(resolve, winAnimationDuration)
        );
      } else {
        pushHistory(gameId, -bet, "LOSS", "Sem combinação");
        showToast("Você perdeu.");
      }

      // Lógica de Bônus (Free Spins) para Fortune Dragon
      if (
        (isFortuneDragon || isFortuneOx || isFortuneRabbit) && // CORREÇÃO: Removida a condição duplicada.
        bonusSymbolsCount >= 3 &&
        !isBonusMode
      ) {
        isBonusMode = true;
        freeSpinsRemaining = 8;
        showToast("RODADAS GRÁTIS ATIVADAS!", 3000);
        el("bonusSpinsContainer").style.display = "block";
        el("bonusSpinsCount").innerText = freeSpinsRemaining;
        gameCanvas.classList.add("bonus-mode");
      }

      if (isBonusMode) {
        freeSpinsRemaining--;
        el("bonusSpinsCount").innerText = freeSpinsRemaining;
        if (freeSpinsRemaining <= 0) {
          isBonusMode = false;
          showToast("Rodadas Grátis terminaram.", 2500);
          el("bonusSpinsContainer").style.display = "none";
          gameCanvas.classList.remove("bonus-mode");
        }
      }

      if (isAuto) {
        await new Promise((resolve) =>
          setTimeout(resolve, isTurbo ? 200 : 500)
        );
        isSpinning = false;
        if (freeSpinsRemaining > 0 || isAuto) doSpin();
      }
    } finally {
      // Garante que os botões sejam reativados se o modo auto for desativado no meio de um giro
      if (!isAuto) {
        isSpinning = false;
        setControlsDisabled(false);
      }
    }
  }

  // 7. Adiciona os event listeners
  el("betUp").onclick = () => updateBet(1); // Aumenta o nível de aposta
  el("betDown").onclick = () => updateBet(-1); // Diminui o nível de aposta
  el("slotSpin").onclick = doSpin;
  el("slotTurbo").onclick = () => {
    if (isSpinning) return;
    isTurbo = !isTurbo;
    el("slotTurbo").classList.toggle("active", isTurbo);
    showToast(`Modo Turbo ${isTurbo ? "Ativado" : "Desativado"}`);
  };
  el("slotAuto").onclick = () => {
    // Permite desativar a qualquer momento, mas só permite ativar se não estiver girando
    if (isSpinning && !isAuto) return;
    isAuto = !isAuto;
    const autoBtn = el("slotAuto");
    autoBtn.classList.toggle("active", isAuto);

    if (isAuto) {
      showToast("Auto-Spin Ativado");
      autoBtn.innerText = "PARAR";
      doSpin();
    } else {
      showToast("Auto-Spin Desativado");
      autoBtn.innerText = "AUTO";
    }
  };

  // 8. Renderização inicial
  for (let i = 0; i < 9; i++) {
    symbolElements[i].innerText =
      SYMBOL_LIST[Math.floor(Math.random() * SYMBOL_LIST.length)].icon;
  }
  el("slotBet").innerText = formatBetDisplay(bet); // Garante que a aposta inicial seja exibida corretamente
}

/* ------------------------------
 BONUSES / MISSIONS
 ------------------------------ */
el("claimDaily").onclick = () => {
  if (!ensureAuthOrWarn()) return;
  const u = getUser();
  const lastDailyKey = "mc_daily_" + state.currentUser;
  const last = storage.get(lastDailyKey, 0);
  const now = Date.now();
  if (now - last < 24 * 3600 * 1000) {
    showToast("Bônus diário já resgatado hoje.");
    return;
  }
  u.balance += CONFIG.rewards.dailyBonus;
  storage.set(lastDailyKey, now);
  saveState();
  pushNotification(
    state.currentUser,
    "bonus",
    "Bônus Diário",
    `Você resgatou R$ ${formatCurrency(CONFIG.rewards.dailyBonus)}!`
  );
  renderBalance();
  showToast("+100 créditos (bônus diário)");
};

el("claimFirstBet").onclick = () => {
  if (!ensureAuthOrWarn()) return;
  const u = getUser();
  if (storage.get("mc_firstbet_" + state.currentUser, false)) {
    showToast("Bônus de primeira aposta já resgatado.");
    return;
  }
  u.balance += CONFIG.rewards.firstBetBonus;
  storage.set("mc_firstbet_" + state.currentUser, true);
  saveState();
  pushNotification(
    state.currentUser,
    "bonus",
    "Bônus de Primeira Aposta",
    `Você resgatou R$ ${formatCurrency(CONFIG.rewards.firstBetBonus)}!`
  );
  renderBalance();
  showToast("+50 créditos (primeira aposta)");
};

el("claimMission").onclick = () => {
  if (!ensureAuthOrWarn()) return;
  const m = state.missions;
  if (m.completed) {
    showToast("Missão já concluída.");
    return;
  }
  const required = CONFIG.rewards.plinkoMission.playsRequired;
  if (m.plinkoPlays >= required) {
    getUser().balance += CONFIG.rewards.plinkoMission.reward;
    m.completed = true;
    saveState();
    pushNotification(
      state.currentUser,
      "bonus",
      "Missão Concluída!",
      `Você ganhou R$ ${formatCurrency(
        CONFIG.rewards.plinkoMission.reward
      )} por completar a missão do Plinko.`
    );
    renderBalance();
    showToast(
      `+${CONFIG.rewards.plinkoMission.reward} créditos (missão concluída!)`
    );
  } else
    showToast(
      `Missão não concluída. Jogue Plinko ${required - m.plinkoPlays}x`
    );
};

/* ------------------------------
 SETTINGS
 ------------------------------ */
el("soundToggle").onclick = () => {
  state.settings.sound = !state.settings.sound;
  saveState();
  showToast("Sons: " + (state.settings.sound ? "Ativados" : "Desativados"));
};
el("themeDark").onclick = () => {
  document.body.setAttribute("data-theme", "dark");
  state.settings.theme = "dark";
  saveState();
  showToast("Tema escuro ativado");
};
el("themeLight").onclick = () => {
  document.body.setAttribute("data-theme", "light");
  state.settings.theme = "light";
  saveState();
  showToast("Tema claro (parcial) ativado");
};
el("resetBalance").onclick = () => {
  if (!ensureAuthOrWarn()) return;
  getUser().balance = CONFIG.users.defaultCredits;
  saveState();
  renderBalance();
  showToast("Saldo resetado");
};
el("deleteAccount").onclick = () => {
  if (
    confirm(
      "Apagar conta local? Isso removerá todos os dados desta conta neste navegador."
    )
  )
    deleteAccount();
};

el("adminPanelBtn").onclick = () => {
  // Chama a função do painel de admin definida no config.js
  // Passa o 'state' e as funções 'helpers' necessárias como argumentos
  CONFIG.admin.showPanel(state, {
    showToast,
    formatCurrency,
    saveState,
    renderBalance,
    definirSaldo, // Passando a função do Supabase
    banirUsuario, // Passando a função do Supabase
  });
};

/* ------------------------------
 SEARCH / FILTER
 ------------------------------ */
el("searchInput").addEventListener("input", (e) => {
  renderGames(e.target.value);
  el("filterLabel").innerText = e.target.value || "Todos";
});

/* ------------------------------
 INIT
 ------------------------------ */
// Depositar créditos
el("depositBtn").onclick = () => {
  if (!ensureAuthOrWarn()) return;
  const val = Number(el("depositValue").value) || 0;
  if (val < 1) return showToast("Valor mínimo: 1");
  getUser().balance += val;
  saveState();
  renderBalance();
  showToast("Depositado +" + val + " créditos");
};
// Sacar créditos
el("withdrawBtn").onclick = () => {
  if (!ensureAuthOrWarn()) return;
  const val = Number(el("withdrawValue").value) || 0;
  if (val < 1) return showToast("Valor mínimo: 1");
  if (val > getUser().balance) return showToast("Saldo insuficiente");
  getUser().balance -= val;
  saveState();
  renderBalance();
  showToast("Sacado -" + val + " créditos");
};
async function init() {
  // show default dashboard
  if (el("nav-dashboard")) {
    show("dashboard");
  }
  // nav - show/hide
  // mount quick events
  el("btnAction").onclick = () =>
    showToast("Selecione um jogo e pressione Jogar");

  // Aplica configurações do site
  document.title = CONFIG.site.title;
  el("brand").querySelector("h1").innerText = CONFIG.site.title;
  el("brand").querySelector(".logo").innerText = CONFIG.site.logo;
  el("gameArea").style.display = "none"; // Esconde a área de jogo inicialmente

  // Lógica para mudar a foto de perfil (movido para init)
  el("profilePicInput").addEventListener("change", (event) => {
    if (!ensureAuthOrWarn()) return;

    const file = event.target.files[0];
    if (!file) return;

    // Valida o tipo de arquivo
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showToast("Por favor, selecione uma imagem JPG ou PNG.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const newProfilePicUrl = e.target.result; // URL em Base64

      // Atualiza o estado e a interface
      const u = getUser();
      u.profilePic = newProfilePicUrl;
      saveState();
      renderAuth(); // Re-renderiza para mostrar a nova foto
      showToast("Foto de perfil atualizada!");
    };

    reader.readAsDataURL(file);
  });

  // Se houver um usuário salvo no localStorage, tenta restaurar e validar a sessão
  if (state.currentUser) {
    const userFromStorage = state.users[state.currentUser];
    // Se temos dados no storage, renderiza imediatamente para uma experiência rápida
    if (userFromStorage) {
      // Valida a sessão com o Supabase em segundo plano
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("saldo, banido")
        .eq("id", userFromStorage.id)
        .single();
      if (error || !dbUser || dbUser.banido) {
        showToast("Sua sessão expirou ou a conta foi desativada.", 4000);
        logout();
      } else {
        // Atualiza o saldo local com o do DB para garantir consistência
        state.users[state.currentUser].saldo = dbUser.saldo;
        saveState();
        showToast("Bem-vindo de volta, " + state.currentUser, 2200);
      }
    }
  }

  // Renderiza a interface principal com os dados já carregados
  renderAuth();
  renderBalance();
  renderGames("");
  setupNav();
  renderRanking();

  checkAndShowAdminMessage(); // CORREÇÃO: Checa por mensagem no carregamento inicial
}

/* ------------------------------
 REAL-TIME SYNC (Cross-tab communication)
 ------------------------------ */
window.addEventListener("storage", (event) => {
  // Quando localStorage é mudado em outra aba, atualiza o estado da aba atual
  if (event.key === "mc_users") {
    const newUsers = JSON.parse(event.newValue || "{}");
    state.users = newUsers;
    // Re-renderiza componentes que dependem dos dados do usuário
    renderBalance();
    renderInboxBadge();
  }
});

/* ================================
 NOTE: Este código é um protótipo
 - Segurança: tudo é local e simulado.
 - Para produção: precisarás de backend, autenticação real, proteção.
 - Personalize valores, estilos, sons e animações conforme desejar.
 ================================ */

init();
