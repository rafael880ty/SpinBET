// =================================================================================
// ARQUIVO DE CONFIGURAÇÃO GERAL DO MINICASSINO
// =================================================================================
// Edite os valores abaixo para personalizar o seu site.
// =================================================================================

const CONFIG = {
  // --- Configurações Gerais do Site ---
  site: {
    title: "MiniCassino", // Nome que aparece na aba do navegador e no topo do site
    logo: "🎲", // Ícone principal do site (pode ser um emoji ou o caminho para uma imagem)
    adminPassword: "admin123", // Senha para acessar o painel de administrador
  },

  // --- Configurações de Bônus e Missões ---
  rewards: {
    dailyBonus: 100, // Valor do bônus diário
    firstBetBonus: 50, // Valor do bônus de primeira aposta
    plinkoMission: {
      playsRequired: 5, // Quantidade de jogadas no Plinko para completar a missão
      reward: 50, // Recompensa da missão
    },
  },

  // --- Configurações dos Jogos ---
  games: {
    // A lógica de cada jogo (multiplicadores, chances, etc.) é controlada em seus respectivos arquivos ou funções.
  },

  // --- Configurações de Usuário ---
  users: {
    defaultCredits: 500, // Saldo inicial para novos usuários
  },

  // =================================================================================
  // PAINEL DE ADMINISTRADOR
  // =================================================================================
  // Toda a lógica do painel de administrador está aqui.
  admin: {
    // Função para exibir o painel de administrador
    showPanel: (state, helpers) => {
      // helpers: { showToast, formatCurrency, saveState, renderBalance }
      const pass = prompt("Digite a senha de administrador:");
      if (pass === null) return; // Cancela se o usuário clicar em "Cancelar"

      if (pass !== CONFIG.site.adminPassword) {
        helpers.showToast("Senha incorreta.");
        return;
      }

      // 1. Esconde a aplicação principal e cria o contêiner do painel admin
      const appElement = document.querySelector(".app");
      appElement.style.display = "none";

      const adminContainer = document.createElement("div");
      adminContainer.id = "adminDashboard";
      adminContainer.className = "admin-dashboard";
      adminContainer.innerHTML = `
        <aside class="admin-sidebar">
          <div class="admin-brand">
            <div class="logo">${CONFIG.site.logo}</div>
            <h1>Painel Admin</h1>
          </div>
          <nav class="admin-nav">
            <button data-section="dashboard" class="active">🏠 Dashboard</button>
            <button data-section="players">👥 Jogadores</button>
            <button data-section="games">🎮 Jogos</button>
            <button data-section="finance">💰 Finanças</button>
            <button data-section="bonuses">🎁 Bônus</button>
            <button data-section="settings">⚙️ Configurações</button>
            <button data-section="logs">🧾 Logs</button>
            <button data-section="support">📢 Suporte</button>
          </nav>
          <button id="adminExitBtn" class="admin-exit-btn">&larr; Voltar ao Site</button>
        </aside>
        <main id="adminMainContent" class="admin-main-content">
          <!-- O conteúdo da seção será injetado aqui -->
        </main>
      `;
      document.body.appendChild(adminContainer);

      // 2. Funções para renderizar cada seção
      const sections = {
        dashboard: () => {
          const totalUsers = Object.keys(state.users).length;
          const totalBalance = Object.values(state.users).reduce(
            (sum, user) => sum + user.balance,
            0
          );
          const totalPlays = Object.values(state.users).reduce(
            (sum, user) => sum + (user.stats.plays || 0),
            0
          );

          // Calcula os jogos mais jogados
          const gamePlays = {};
          Object.values(state.users).forEach((user) => {
            user.history.forEach((h) => {
              gamePlays[h.game] = (gamePlays[h.game] || 0) + 1;
            });
          });
          const popularGames = Object.entries(gamePlays)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(
              ([name, plays]) =>
                `<li>${name} <span>(${plays} jogadas)</span></li>`
            )
            .join("");

          return `
            <div class="admin-header"><h1>Dashboard</h1></div>
            <div class="admin-stats-grid">
              <div class="admin-stat-card">
                <h4>Total de Jogadores</h4>
                <p>${totalUsers}</p>
              </div>
              <div class="admin-stat-card">
                <h4>Saldo Total em Jogo</h4>
                <p>R$ ${helpers.formatCurrency(totalBalance)}</p>
              </div>
              <div class="admin-stat-card">
                <h4>Total de Jogadas</h4>
                <p>${totalPlays}</p>
              </div>
            </div>
            <div class="admin-card">
              <h3>Jogos Mais Populares</h3>
              <ul class="admin-list">${
                popularGames || "<li>Nenhuma jogada registrada.</li>"
              }</ul>
            </div>
          `;
        },
        players: () => {
          const userRows = Object.keys(state.users)
            .map((username) => {
              const user = state.users[username];
              return `
              <tr>
                <td>${username}</td>
                <td>${helpers.formatCurrency(user.balance)}</td>
                <td><span class="admin-status ${
                  user.isBanned ? "offline" : "online"
                }">${user.isBanned ? "Banido" : "Ativo"}</span></td>
                <td>${new Date(user.joined).toLocaleDateString()}</td>
                <td><button class="admin-btn-small" data-user="${username}">Editar</button></td>
              </tr>
            `;
            })
            .join("");

          return `
            <div class="admin-header"><h1>Gerenciar Jogadores</h1></div>
            <div class="admin-card">
              <h3>Lista de Usuários</h3>
              <div class="admin-table-container">
                <table>
                  <thead><tr><th>Usuário</th><th>Saldo</th><th>Status</th><th>Registrado em</th><th>Ações</th></tr></thead>
                  <tbody>${userRows}</tbody>
                </table>
              </div>
            </div>
          `;
        },
        // Placeholders para outras seções
        games: () =>
          `<div class="admin-header"><h1>Gerenciar Jogos</h1></div><div class="admin-card"><p>Seção em desenvolvimento.</p></div>`,
        finance: () =>
          `<div class="admin-header"><h1>Finanças</h1></div><div class="admin-card"><p>Seção em desenvolvimento.</p></div>`,
        bonuses: () =>
          `<div class="admin-header"><h1>Bônus e Promoções</h1></div><div class="admin-card"><p>Seção em desenvolvimento.</p></div>`,
        settings: () =>
          `<div class="admin-header"><h1>Configurações</h1></div><div class="admin-card"><p>Seção em desenvolvimento.</p></div>`,
        logs: () =>
          `<div class="admin-header"><h1>Logs e Segurança</h1></div><div class="admin-card"><p>Seção em desenvolvimento.</p></div>`,
        support: () =>
          `<div class="admin-header"><h1>Suporte</h1></div><div class="admin-card"><p>Seção em desenvolvimento.</p></div>`,
      };

      const mainContent = document.getElementById("adminMainContent");

      // 3. Função para carregar o conteúdo de uma seção
      const loadSection = (sectionName) => {
        mainContent.innerHTML = sections[sectionName](); // CORREÇÃO: Usa a sintaxe correta para chamar a função da seção.
        // Adiciona listeners de eventos específicos da seção, se necessário
        if (sectionName === "players") {
          mainContent.querySelectorAll("button[data-user]").forEach((btn) => {
            btn.onclick = () => showPlayerModal(btn.dataset.user);
          });
        }
      };

      // Função para mostrar o Modal de Edição de Jogador
      const showPlayerModal = (username) => {
        const user = state.users[username];
        if (!user) return;

        const winRate =
          user.stats.plays > 0
            ? ((user.stats.wins / user.stats.plays) * 100).toFixed(1)
            : 0;

        const modal = document.createElement("div");
        modal.className = "admin-modal-overlay";
        modal.innerHTML = `
          <div class="admin-modal-content">
            <div class="admin-modal-header">
              <img src="${user.profilePic}" alt="Avatar">
              <div>
                <h3>${username}</h3>
                <p class="small-muted">ID: ${
                  user.id || "N/A"
                } • Membro desde: ${new Date(
          user.joined
        ).toLocaleDateString()}</p>
              </div>
              <button id="closeModalBtn" class="admin-modal-close">&times;</button>
            </div>
            <div class="admin-modal-body">
              <div class="admin-card">
                <h4>Informações Básicas</h4>
                <div class="admin-form-group">
                  <label for="editUsername">Nome de Usuário</label>
                  <input id="editUsername" type="text" value="${username}">
                </div>
                 <div class="admin-form-group">
                  <label for="adminNotes">Observações Internas (só para admins)</label>
                  <textarea id="adminNotes" placeholder="Adicione notas sobre o jogador...">${
                    user.adminNotes || ""
                  }</textarea>
                </div>
              </div>
              <div class="admin-card">
                <h4>Definir Saldo</h4>
                <div class="admin-form-inline">
                  <input id="setBalanceAmount" type="text" placeholder="Novo saldo. Ex: 100,50">
                  <input id="setBalanceReason" type="text" placeholder="Motivo (obrigatório)">
                  <button id="setBalanceBtn" class="admin-btn-primary">Confirmar</button>
                </div>
              </div>
              <div class="admin-card">
                <h4>Ações da Conta</h4>
                <div class="admin-form-inline">
                  <button id="banBtn" class="admin-btn-secondary">${
                    user.isBanned ? "Gerenciar Banimento" : "Banir / Suspender"
                  }</button>
                  <button id="deleteBtn" class="admin-btn-danger">Excluir Usuário</button>
                </div>
              </div>
              <div class="admin-card">
                <h4>Enviar Mensagem (Popup)</h4>
                <div class="admin-form-group">
                  <textarea id="popupMessage" placeholder="A mensagem aparecerá como um popup para o jogador na próxima vez que ele interagir com o site."></textarea>
                </div>
                <div class="admin-form-inline" style="justify-content: flex-end;">
                  <button id="sendMessageBtn" class="admin-btn-primary">Enviar Mensagem</button>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // --- Event Listeners do Modal Principal ---
        modal.onclick = (e) => {
          if (e.target === modal) modal.remove();
        };
        document.getElementById("closeModalBtn").onclick = () => modal.remove();

        document.getElementById("setBalanceBtn").onclick = () => {
          const amountStr = document
            .getElementById("setBalanceAmount")
            .value.replace(",", ".");
          const amount = parseFloat(amountStr);
          const reason = document
            .getElementById("setBalanceReason")
            .value.trim();

          if (isNaN(amount) || amount < 0)
            return helpers.showToast("Valor de saldo inválido.");
          if (!reason)
            return helpers.showToast(
              "O motivo é obrigatório para alterar o saldo."
            );

          const oldBalance = user.balance;
          user.balance = amount;
          helpers.saveState();
          helpers.showToast(
            `Saldo de ${username} definido para R$ ${helpers.formatCurrency(
              amount
            )}.`
          );
          // Log a ação (simulação)
          console.log(
            `LOG: Saldo de ${username} alterado de ${oldBalance} para ${amount}. Motivo: ${reason}`
          );
          modal.remove();
          loadSection("players");
          helpers.renderBalance();
        };

        document.getElementById("banBtn").onclick = () => {
          showBanModal(username);
          modal.remove();
        };

        document.getElementById("deleteBtn").onclick = () => {
          showDeleteModal(username);
          modal.remove();
        };

        document.getElementById("sendMessageBtn").onclick = () => {
          const message = document.getElementById("popupMessage").value.trim();
          if (!message) {
            return helpers.showToast("A mensagem não pode estar vazia.");
          }
          // Adiciona a mensagem à caixa de entrada do usuário
          helpers.pushNotification(
            username,
            "admin",
            "Mensagem do Administrador",
            message
          );
          helpers.saveState();
          helpers.showToast(`Mensagem enviada para ${username}.`);
          modal.remove();
        };
      };

      // Função para o Modal de Banimento
      const showBanModal = (username) => {
        const user = state.users[username];
        const banModal = document.createElement("div");
        banModal.className = "admin-modal-overlay";
        banModal.innerHTML = `
            <div class="admin-modal-content">
              <div class="admin-modal-header"><h3>Banir / Suspender: ${username}</h3></div>
              <div class="admin-modal-body">
                <div class="admin-form-group">
                    <label>Tipo de Banimento</label>
                    <select id="banType"><option value="temporary">Temporário</option><option value="permanent">Permanente</option></select>
                </div>
                <div id="banDurationFields" class="admin-form-group">
                    <label>Duração</label>
                    <div class="admin-form-inline">
                        <input type="number" id="banDays" placeholder="Dias" min="0">
                        <input type="number" id="banHours" placeholder="Horas" min="0">
                        <input type="number" id="banMinutes" placeholder="Minutos" min="0">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label>Motivo (visível para o jogador)</label>
                    <input id="banReason" type="text" placeholder="Ex: Violação dos termos">
                </div>
              </div>
              <div class="admin-modal-footer">
                    ${
                      user.isBanned
                        ? '<button id="unbanBtn" class="admin-btn-secondary">Desbanir</button>'
                        : ""
                    }
                    <button id="confirmBanBtn" class="admin-btn-primary">Aplicar Banimento</button>
                </div>
                <button id="closeBanModalBtn" class="admin-modal-close">&times;</button>
            </div>
        `;
        document.body.appendChild(banModal);

        const banTypeSelect = document.getElementById("banType");
        const durationFields = document.getElementById("banDurationFields");
        banTypeSelect.onchange = () => {
          durationFields.style.display =
            banTypeSelect.value === "temporary" ? "flex" : "none";
        };

        banModal.onclick = (e) => {
          if (e.target === banModal) banModal.remove();
        };
        document.getElementById("closeBanModalBtn").onclick = () =>
          banModal.remove();

        document.getElementById("confirmBanBtn").onclick = () => {
          const reason = document.getElementById("banReason").value.trim();
          if (!reason) return helpers.showToast("O motivo é obrigatório.");

          user.banReason = reason;
          if (banTypeSelect.value === "permanent") {
            user.isBanned = true;
            delete user.banExpiresAt;
            helpers.showToast(`${username} foi banido permanentemente.`);
          } else {
            const days =
              parseInt(document.getElementById("banDays").value) || 0;
            const hours =
              parseInt(document.getElementById("banHours").value) || 0;
            const minutes =
              parseInt(document.getElementById("banMinutes").value) || 0;
            const durationMs =
              (days * 86400 + hours * 3600 + minutes * 60) * 1000;
            if (durationMs <= 0)
              return helpers.showToast("A duração deve ser maior que zero.");

            user.isBanned = true;
            user.banExpiresAt = Date.now() + durationMs;
            helpers.showToast(`${username} foi banido temporariamente.`);
          }
          helpers.saveState();
          banModal.remove();
          loadSection("players");
        };

        if (user.isBanned) {
          document.getElementById("unbanBtn").onclick = () => {
            delete user.isBanned;
            delete user.banExpiresAt;
            delete user.banReason;
            helpers.saveState();
            helpers.showToast(`${username} foi desbanido.`);
            banModal.remove();
            loadSection("players");
          };
        }
      };

      // Função para o Modal de Deleção
      const showDeleteModal = (username) => {
        const deleteModal = document.createElement("div");
        deleteModal.className = "admin-modal-overlay";
        deleteModal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header"><h3>Excluir Usuário: ${username}</h3></div>
                <div class="admin-modal-body">
                  <p>Esta ação marcará a conta como 'deletada' (soft-delete). O usuário não poderá mais logar. Para confirmar, digite <strong>APAGAR</strong> no campo abaixo.</p>
                  <div class="admin-form-group">
                      <label for="deleteConfirmInput">Confirmação</label>
                      <input id="deleteConfirmInput" type="text" placeholder="Digite APAGAR aqui">
                  </div>
                   <div class="admin-form-group">
                      <label for="deleteReason">Motivo da Exclusão (obrigatório)</label>
                      <input id="deleteReason" type="text" placeholder="Motivo da exclusão">
                  </div>
                </div>
                <div class="admin-modal-footer">
                    <button id="confirmDeleteBtn" class="admin-btn-danger">Confirmar Exclusão Permanente</button>
                </div>
                <button id="closeDeleteModalBtn" class="admin-modal-close">&times;</button>
            </div>
        `;
        document.body.appendChild(deleteModal);

        deleteModal.onclick = (e) => {
          if (e.target === deleteModal) deleteModal.remove();
        };
        document.getElementById("closeDeleteModalBtn").onclick = () =>
          deleteModal.remove();

        document.getElementById("confirmDeleteBtn").onclick = () => {
          const confirmText =
            document.getElementById("deleteConfirmInput").value;
          const reason = document.getElementById("deleteReason").value.trim();

          if (confirmText !== "APAGAR") {
            return helpers.showToast("Confirmação incorreta.");
          }
          if (!reason) {
            return helpers.showToast("O motivo é obrigatório.");
          }

          // Soft-delete
          state.users[username].isDeleted = true;
          state.users[username].isBanned = true; // Impede login
          state.users[
            username
          ].banReason = `Conta apagada por um administrador. Motivo: ${reason}`;

          // Hard-delete (simulado, em um sistema real seria diferente)
          // delete state.users[username];

          helpers.saveState();
          helpers.showToast(`Conta de ${username} foi marcada como deletada.`);
          deleteModal.remove();
          loadSection("players");
        };
      };

      // 4. Lógica dos botões de navegação
      adminContainer.querySelectorAll(".admin-nav button").forEach((button) => {
        button.onclick = () => {
          if (button.classList.contains("active")) return;
          adminContainer
            .querySelector(".admin-nav button.active")
            .classList.remove("active");
          button.classList.add("active");
          loadSection(button.dataset.section);
        };
      });

      // 5. Botão de saída
      document.getElementById("adminExitBtn").onclick = () => {
        adminContainer.remove();
        appElement.style.display = "flex";
      };

      // Carrega a seção inicial (Dashboard)
      loadSection("players"); // Carrega a seção de jogadores por padrão
    },
  },
};
