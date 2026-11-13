(() => {
  "use strict";
  const KEY = "squad_ads_html_v1";
  const initial = () => ({
    posts: [
      {
        id: 184,
        address: "Avenida Peter Henry Rolfs",
        status: "falha",
        issue: "Intensidade baixa",
        x: 26,
        y: 29,
        lum: 15,
      },
      {
        id: 278,
        address: "Rua dos Passos",
        status: "falha",
        issue: "Lâmpada queimada",
        x: 67,
        y: 35,
        lum: 0,
      },
      {
        id: 52,
        address: "Praça Silviano Brandão",
        status: "atencao",
        issue: "Manutenção preventiva",
        x: 46,
        y: 63,
        lum: 75,
      },
      {
        id: 102,
        address: "Rua Gomes Barbosa",
        status: "falha",
        issue: "Falha intermitente",
        x: 80,
        y: 69,
        lum: 20,
      },
      {
        id: 391,
        address: "Rua Arthur Bernardes",
        status: "falha",
        issue: "Lâmpada piscando",
        x: 15,
        y: 72,
        lum: 35,
      },
      {
        id: 115,
        address: "Rua dos Estudantes",
        status: "normal",
        issue: "",
        x: 38,
        y: 17,
        lum: 95,
      },
      {
        id: 207,
        address: "Avenida Santa Rita",
        status: "normal",
        issue: "",
        x: 58,
        y: 80,
        lum: 90,
      },
      {
        id: 310,
        address: "Avenida Bueno Brandão",
        status: "normal",
        issue: "",
        x: 87,
        y: 17,
        lum: 92,
      },
      {
        id: 404,
        address: "Rua Padre Serafim",
        status: "normal",
        issue: "",
        x: 12,
        y: 45,
        lum: 97,
      },
    ],
    tickets: [
      {
        id: 1,
        post: 184,
        status: "aberto",
        issue: "Intensidade baixa",
        tech: "",
        note: "",
      },
      {
        id: 2,
        post: 278,
        status: "aberto",
        issue: "Lâmpada queimada",
        tech: "",
        note: "",
      },
      {
        id: 3,
        post: 52,
        status: "aberto",
        issue: "Manutenção preventiva",
        tech: "",
        note: "",
      },
      {
        id: 4,
        post: 102,
        status: "aberto",
        issue: "Falha intermitente",
        tech: "",
        note: "",
      },
      {
        id: 5,
        post: 391,
        status: "aberto",
        issue: "Lâmpada piscando",
        tech: "",
        note: "",
      },
    ],
    next: 6,
  });
  let data;
  try {
    data = JSON.parse(localStorage.getItem(KEY)) || initial();
  } catch {
    data = initial();
  }
  let role = "",
    selectedPost = 184,
    selectedTicket = null;
  const $ = (id) => document.getElementById(id),
    save = () => localStorage.setItem(KEY, JSON.stringify(data)),
    esc = (v) =>
      String(v ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      ),
    post = (id) => data.posts.find((p) => p.id === id),
    badge = (s) =>
      `<span class="status ${s.replaceAll(" ", "-")}">${esc(s === "atencao" ? "Atenção" : s)}</span>`,
    toast = (s) => {
      $("toast").textContent = s;
      $("toast").classList.remove("hidden");
      setTimeout(() => $("toast").classList.add("hidden"), 2600);
    };
  function nav(page) {
    if (
      role === "tecnico" &&
      !["tecnico", "dashboard", "energia"].includes(page)
    ) {
      toast("Área restrita ao gestor");
      return;
    }
    document
      .querySelectorAll(".section")
      .forEach((x) => x.classList.toggle("active", x.id === page));
    document
      .querySelectorAll(".nav")
      .forEach((x) => x.classList.toggle("active", x.dataset.page === page));
    $("pageTitle").textContent = {
      dashboard: "Dashboard geral",
      monitoramento: "Mapa inteligente",
      iluminacao: "Iluminação",
      energia: "Energia solar",
      manutencao: "Manutenção / Falhas",
      relatorios: "Relatórios",
      alertas: "Alertas",
      tecnico: "App mobile do técnico",
    }[page];
    render();
    refreshMapSize();
    requestAnimationFrame(() => setTimeout(renderEnergyCharts, 120));
  }
  function login() {
    if ($("password").value !== "demo123") {
      toast("Senha incorreta. Use demo123");
      return;
    }
    role = $("loginRole").value;
    $("login").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("userLabel").textContent =
      role === "gestor" ? "Carlos Mendes • Gestor" : "Rafael Souza • Técnico";
    $("rolePill").textContent = role === "gestor" ? "Gestor" : "Técnico";
    $("headerName").textContent =
      role === "gestor" ? "Carlos Mendes" : "Rafael Souza";
    document
      .querySelectorAll(".nav")
      .forEach(
        (x) =>
          (x.style.display =
            role === "tecnico" &&
            !["tecnico", "dashboard", "energia"].includes(x.dataset.page)
              ? "none"
              : ""),
      );
    nav(role === "gestor" ? "dashboard" : "tecnico");
  }
  function metrics() {
    let fails = data.posts.filter((p) => p.status === "falha").length;
    let cards = [
      [
        "Luminárias ativas",
        data.posts.filter((p) => p.status === "normal").length +
          " / " +
          data.posts.length,
        "Postes da demonstração",
      ],
      ["Consumo mensal", "1.250 kWh", "-3,2% vs. mês anterior"],
      [
        "Em manutenção",
        data.tickets.filter((t) => t.status !== "resolvido").length,
        "Chamados pendentes",
      ],
      ["Energia gerada", "2.000 kWh", "Solar / mês"],
    ];
    $("metrics").innerHTML = cards
      .map(
        (c) =>
          `<div class="card"><div class="label">${c[0]}</div><div class="number">${c[1]}</div><small>${c[2]}</small></div>`,
      )
      .join("");
    $("summary").innerHTML =
      `<div class="detail"><div>🟢 Normal<strong>${data.posts.filter((p) => p.status === "normal").length}</strong></div><div>🔴 Falha<strong>${fails}</strong></div><div>🟡 Atenção<strong>${data.posts.filter((p) => p.status === "atencao").length}</strong></div><div>🛠 Chamados<strong>${data.tickets.length}</strong></div></div>`;
  }
  const streetNames = [
    "Avenida Peter Henry Rolfs",
    "Avenida Santa Rita",
    "Avenida Bueno Brandão",
    "Rua dos Passos",
    "Rua Arthur Bernardes",
    "Rua Gomes Barbosa",
    "Rua dos Estudantes",
    "Rua Padre Serafim",
    "Praça Silviano Brandão",
    "Praça do Rosário",
    "Rua Floriano Peixoto",
    "Rua Benjamim Araújo",
    "Rua Dona Gertrudes",
    "Rua Afonso Pena",
    "Rua Santana",
    "Rua Doutor Brito",
    "Rua Álvaro Gouveia",
    "Rua Senador Vaz de Melo",
    "Rua Virgilio Val",
    "Rua Feijó Bhering",
    "Rua Cesar Santana",
    "Rua Presidente Tancredo Neves",
    "Rua Prefeito João Francisco",
    "Rua Benedito Valadares",
    "Rua José da Cruz Reis",
    "Rua São José",
  ];
  const streetLegacy = {
    184: "Av. R. Barbosa",
    278: "Rua da Saúde",
    52: "Praça Central",
    102: "Av. B. Vista",
    391: "R. das Flores",
    207: "Av. Santa Rita",
    310: "Bairro Fátima",
    404: "Rua da Matriz",
  };
  const streetCorrect = {
    184: "Avenida Peter Henry Rolfs",
    278: "Rua dos Passos",
    52: "Praça Silviano Brandão",
    102: "Rua Gomes Barbosa",
    391: "Rua Arthur Bernardes",
    115: "Rua dos Estudantes",
    207: "Avenida Santa Rita",
    310: "Avenida Bueno Brandão",
    404: "Rua Padre Serafim",
  };
  const postLocations = {
    184: [-20.7549, -42.879],
    278: [-20.7568, -42.88],
    52: [-20.7536278, -42.8814159],
    102: [-20.7561, -42.8777],
    391: [-20.7545, -42.8825],
    115: [-20.7555, -42.8759],
    207: [-20.7581, -42.8792],
    310: [-20.7511, -42.8818],
    404: [-20.7526, -42.8778],
  };
  for (const p of data.posts) {
    if (streetLegacy[p.id] === p.address) p.address = streetCorrect[p.id];
  }
  const leafletMaps = {},
    leafletMarkers = {};
  let locatedStreetLayer = null; // nomes mantidos para compatibilidade com as abas existentes
  function markHtml(status) {
    return `<div class="post-marker ${status}"></div>`;
  }
  let mapStatusFilter = "todos";
  function matchesMapPost(p, id) {
    if (id === "dashMap") return true;
    const q = $("searchPost").value.trim().toLocaleLowerCase("pt-BR");
    return (
      (mapStatusFilter === "todos" || p.status === mapStatusFilter) &&
      (!q || `${p.id} ${p.address}`.toLocaleLowerCase("pt-BR").includes(q))
    );
  }
  function updateMapFilterUi() {
    document.querySelectorAll("[data-map-filter]").forEach((b) => {
      b.classList.toggle("active", b.dataset.mapFilter === mapStatusFilter);
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.mapFilter === mapStatusFilter),
      );
    });
    const qty = data.posts.filter((p) => matchesMapPost(p, "mainMap")).length;
    if ($("mapVisibleCount"))
      $("mapVisibleCount").textContent =
        qty +
        " poste" +
        (qty === 1 ? "" : "s") +
        " " +
        (qty === 1 ? "vis\u00edvel" : "vis\u00edveis") +
        " - posicoes aproximadas";
    if ($("mapCountAll")) $("mapCountAll").textContent = data.posts.length;
    if ($("filterPost")) $("filterPost").value = mapStatusFilter;
  }
  /* ========================================================================
   MAPAS DA SQUAD ADS — LEAFLET + CARTO DARK (exemplo enviado pelo usuário)
   As coordenadas dos postes são SIMULADAS; não são cadastro municipal.
   O Leaflet usa [latitude, longitude], o que simplifica a visualização.
   A única dependência cartográfica aqui é o CSS/JS Leaflet via CDN.
   ======================================================================== */
  const VICOSA_CENTER = [-20.7546, -42.8825];
  const mapHandles = {};
  let mapTheme = "dark";
  const MAP_TIMEOUT_MS = 8500;
  const CARTO_TILE_URLS = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_58lc_1_6e315feb2e31f66115d55954",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_58lc_1_6e315feb2e31f66115d55954",
  };
  const CARTO_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";

  /* ==================== LIMITE MUNICIPAL DO IBGE ====================
   API pública de malhas geográficas, município de Viçosa/MG (3171303).
   GeoJSON é um polígono de DIVISA MUNICIPAL; não contém ruas nem substitui
   os tiles CARTO. A consulta ocorre uma única vez e serve aos dois mapas.
   Se o serviço falhar, o usuário recebe informação sem perder os postes.
   Fonte: IBGE, API v3 Malhas Geográficas.
   ================================================================ */
  const IBGE_MALHA_URL =
    "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3171303?formato=application%2Fvnd.geo%2Bjson";
  let ibgeGeoJSON = null,
    ibgeLoading = null;
  let ibgeVisible = true;
  function ibgeMessage(id, text) {
    const status = mapHandles[id]?.ibgeStatus;
    if (status) status.textContent = text;
  }
  function ibgeControl(id) {
    const state = mapHandles[id];
    const ctrl = L.control({ position: "topright" });
    ctrl.onAdd = function () {
      const root = L.DomUtil.create("div", "squad-ibge-control");
      root.setAttribute("role", "group");
      root.setAttribute("aria-label", "Limite municipal do IBGE");
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.textContent = "◈ Limite municipal IBGE";
      toggle.setAttribute(
        "aria-label",
        "Mostrar ou ocultar limite do município de Viçosa",
      );
      const view = document.createElement("button");
      view.type = "button";
      view.textContent = "⌖ Ver limite inteiro";
      view.setAttribute("aria-label", "Enquadrar todo o limite municipal");
      const status = document.createElement("span");
      status.className = "squad-ibge-state";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      root.append(toggle, view, status);
      L.DomEvent.disableClickPropagation(root);
      L.DomEvent.disableScrollPropagation(root);
      toggle.addEventListener("click", () => {
        ibgeVisible = !ibgeVisible;
        Object.keys(mapHandles).forEach((mapId) => {
          const s = mapHandles[mapId];
          if (!s?.ibgeLayer) return;
          if (ibgeVisible) {
            s.ibgeLayer.addTo(s.instance);
          } else s.instance.removeLayer(s.ibgeLayer);
        });
        toggle.textContent = ibgeVisible
          ? "◈ Ocultar limite IBGE"
          : "◈ Exibir limite IBGE";
        if (ibgeVisible && !ibgeGeoJSON) loadIbgeBoundary(true);
      });
      view.addEventListener("click", () => {
        if (!ibgeGeoJSON) {
          loadIbgeBoundary(true);
          return;
        }
        const layer = state.ibgeLayer;
        if (layer?.getBounds()?.isValid()) {
          // Município é maior que o centro urbano: zoom mínimo temporariamente
          // reduzido para permitir o enquadramento total do limite.
          state.instance.setMinZoom(9);
          state.instance.fitBounds(layer.getBounds(), {
            padding: [22, 22],
            maxZoom: 14,
            animate: true,
          });
        }
      });
      state.ibgeStatus = status;
      ibgeMessage(
        id,
        ibgeGeoJSON ? "Limite carregado." : "Consultando limite oficial…",
      );
      return root;
    };
    ctrl.addTo(state.instance);
    state.ibgeControl = ctrl;
  }
  function addIbgeLayer(id) {
    const state = mapHandles[id];
    if (!state || !ibgeGeoJSON || !window.L) return;
    if (state.ibgeLayer) {
      state.instance.removeLayer(state.ibgeLayer);
    }
    state.ibgeLayer = L.geoJSON(ibgeGeoJSON, {
      style: {
        color: "#38bdf8",
        weight: 3,
        opacity: 0.95,
        fillColor: "#38bdf8",
        fillOpacity: 0.05,
      },
      interactive: true,
    }).bindPopup(
      "<strong>Viçosa — MG</strong><br>Limite municipal: IBGE 3171303<br><small>Malha oficial; os postes são demonstrativos.</small>",
    );
    if (ibgeVisible) state.ibgeLayer.addTo(state.instance);
    ibgeMessage(id, "Limite do IBGE carregado.");
  }
  async function loadIbgeBoundary(force = false) {
    if (ibgeGeoJSON && !force) {
      Object.keys(mapHandles).forEach(addIbgeLayer);
      return;
    }
    if (ibgeLoading) return ibgeLoading;
    Object.keys(mapHandles).forEach((id) =>
      ibgeMessage(id, "Consultando limite oficial…"),
    );
    ibgeLoading = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 14000);
      try {
        const resp = await fetch(IBGE_MALHA_URL, {
          headers: { Accept: "application/vnd.geo+json, application/json" },
          signal: controller.signal,
        });
        if (!resp.ok) throw Error("HTTP " + resp.status);
        const shape = await resp.json();
        if (
          !shape ||
          !["Feature", "FeatureCollection", "Polygon", "MultiPolygon"].includes(
            shape.type,
          )
        )
          throw Error("Resposta não é GeoJSON de município");
        ibgeGeoJSON = shape;
        Object.keys(mapHandles).forEach(addIbgeLayer);
      } catch (e) {
        console.warn("Não foi possível carregar limite municipal do IBGE:", e);
        Object.keys(mapHandles).forEach((id) =>
          ibgeMessage(
            id,
            "IBGE indisponível. Clique em “Ver limite inteiro” para tentar novamente.",
          ),
        );
      } finally {
        clearTimeout(timer);
        ibgeLoading = null;
      }
    })();
    return ibgeLoading;
  }

  function markerPosition(p) {
    return postLocations[p.id] || null;
  }
  function mapMessage(id, text, withButton = true) {
    const host = $(id);
    if (!host) return;
    let box = host.querySelector(".map-failure-note");
    if (!box) {
      box = document.createElement("div");
      box.className = "map-failure-note squad-map-notice";
      host.append(box);
    }
    box.replaceChildren(document.createTextNode(text + " "));
    if (withButton) {
      const b = document.createElement("button");
      b.className = "btn small";
      b.type = "button";
      b.textContent = "Tentar novamente";
      b.setAttribute("aria-label", "Recarregar mapa de Viçosa");
      b.addEventListener("click", () => retryMap(id));
      box.append(b);
    }
  }
  function clearMapNotice(id) {
    $(id)?.querySelector(".map-failure-note")?.remove();
  }
  /* Checa se tiles cartográficos chegaram. Uma mensagem amigável não bloqueia
   marcadores, zoom ou arraste quando o provedor de mapas estiver indisponível. */
  function startMapTimeout(id) {
    const state = mapHandles[id];
    if (!state) return;
    clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      if (!state.tilesSeen) {
        mapMessage(
          id,
          "O fundo com as ruas não carregou (CARTO). Os postes e o limite municipal do IBGE, quando disponível, continuam interativos.",
        );
        if (id === "mainMap")
          $("streetStatus").textContent =
            "Não foi possível carregar as ruas do CARTO. Os postes são demonstrativos.";
      }
    }, MAP_TIMEOUT_MS);
  }
  function createCARTOLayer(id) {
    const state = mapHandles[id];
    if (!state) return;
    if (state.layer) state.instance.removeLayer(state.layer);
    state.tilesSeen = false;
    const layer = L.tileLayer(CARTO_TILE_URLS[mapTheme], {
      attribution: CARTO_ATTRIBUTION,
      subdomains: "abcd",
      minZoom: 9,
      maxZoom: 19,
      maxNativeZoom: 19,
      detectRetina: false,
      crossOrigin: true,
    });
    state.layer = layer;
    layer.on("tileload", () => {
      if (!state.tilesSeen) {
        state.tilesSeen = true;
        clearTimeout(state.timer);
        clearMapNotice(id);
        if (id === "mainMap")
          $("streetStatus").textContent =
            "Mapa interativo de Viçosa • ruas carregadas pelo CARTO.";
      }
    });
    layer.on("tileerror", () => {
      state.tileErrors = (state.tileErrors || 0) + 1;
    });
    layer.addTo(state.instance);
    startMapTimeout(id);
  }
  function retryMap(id) {
    const state = mapHandles[id];
    if (!state) {
      map(id);
      return;
    }
    clearMapNotice(id);
    state.tileErrors = 0;
    createCARTOLayer(id);
  }
  function map(id) {
    const host = $(id);
    if (!host) return;
    if (!window.L) {
      mapMessage(
        id,
        "A biblioteca Leaflet não carregou. Verifique a conexão com a internet.",
      );
      return;
    }
    if (mapHandles[id]) {
      drawMapMarkers(id);
      setTimeout(() => mapHandles[id].instance.invalidateSize(), 100);
      return;
    }
    try {
      const instance = L.map(id, {
        center: VICOSA_CENTER,
        zoom: 15,
        minZoom: 13,
        maxZoom: 19,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomAnimation: true,
        attributionControl: true,
      });
      const state = {
        instance,
        markers: L.layerGroup().addTo(instance),
        layer: null,
        timer: null,
        tilesSeen: false,
        tileErrors: 0,
      };
      mapHandles[id] = state;
      createCARTOLayer(id);
      ibgeControl(id);
      loadIbgeBoundary();
      instance.on("zoomend", () => drawMapMarkers(id));
      instance.on("moveend", () => {
        if (instance.getZoom() < 17) drawMapMarkers(id);
      });
      drawMapMarkers(id);
      setTimeout(() => instance.invalidateSize(), 160);
    } catch (err) {
      console.warn("Falha ao iniciar mapa Leaflet:", err);
      mapMessage(id, "Não foi possível iniciar o mapa interativo.");
    }
  }
  /* Ícone interativo colorido, incluindo pulso vermelho em postes com falha. */
  function postIcon(p) {
    const cls =
      p.status === "falha"
        ? "falha"
        : p.status === "atencao"
          ? "atencao"
          : "normal";
    return L.divIcon({
      className: "squad-leaflet-icon",
      html: `<span class="squad-post-dot ${cls}"></span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -16],
    });
  }
  function clusterIcon(n) {
    return L.divIcon({
      className: "squad-leaflet-cluster",
      html: `<span class="squad-cluster-bubble">${n}</span>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
  }
  function drawMapMarkers(id) {
    const state = mapHandles[id];
    if (!state) return;
    state.markers.clearLayers();
    const postsVisible = data.posts.filter(
      (p) => markerPosition(p) && matchesMapPost(p, id),
    );
    if (id === "mainMap") updateMapFilterUi();
    const zoom = state.instance.getZoom(),
      groups = [];
    postsVisible.forEach((p) => {
      const pos = markerPosition(p);
      const screen = state.instance.project(pos, zoom);
      const group =
        zoom < 17
          ? groups.find((g) => Math.hypot(g.x - screen.x, g.y - screen.y) < 43)
          : null;
      if (group) {
        group.posts.push(p);
      } else groups.push({ x: screen.x, y: screen.y, posts: [p] });
    });
    groups.forEach((group) => {
      if (group.posts.length > 1) {
        const p = group.posts[0];
        L.marker(markerPosition(p), {
          icon: clusterIcon(group.posts.length),
          keyboard: true,
          alt: `Grupo de ${group.posts.length} postes`,
        })
          .on("click", () =>
            state.instance.flyTo(markerPosition(p), Math.min(19, zoom + 2), {
              duration: 0.65,
            }),
          )
          .addTo(state.markers);
        return;
      }
      const p = group.posts[0];
      const marker = L.marker(markerPosition(p), {
        icon: postIcon(p),
        keyboard: true,
        alt: `Poste ${p.id} ${p.address}`,
      });
      const popup = document.createElement("div");
      popup.className = "squad-gl-popup";
      const title = document.createElement("strong");
      title.textContent = "Poste #" + p.id;
      const address = document.createElement("p");
      address.textContent = p.address;
      const description = document.createElement("p");
      description.textContent = `Status: ${p.status === "atencao" ? "Atenção" : p.status === "falha" ? "Falha" : "Normal"} · ${p.issue || "Sem ocorrência"}`;
      const note = document.createElement("small");
      note.textContent = "Coordenada aproximada para demonstração acadêmica.";
      const view = document.createElement("button");
      view.type = "button";
      view.className = "btn small";
      view.textContent = "Ver detalhes";
      view.addEventListener("click", () => {
        selectedPost = p.id;
        detail();
        nav("monitoramento");
      });
      popup.append(
        title,
        address,
        description,
        note,
        document.createElement("br"),
        view,
      );
      marker.bindPopup(popup, { maxWidth: 300 });
      marker.on("click", () => {
        selectedPost = p.id;
        detail();
        if (id === "dashMap") nav("monitoramento");
      });
      marker.addTo(state.markers);
    });
  }
  function setMapStyle(theme) {
    mapTheme = theme === "light" ? "light" : "dark";
    for (const id of Object.keys(mapHandles)) {
      clearMapNotice(id);
      createCARTOLayer(id);
    }
  }
  /* Datalist e botões de acesso rápido para logradouros de Viçosa. */
  function initStreetUi() {
    $("vicosaStreets").innerHTML = streetNames
      .map((s) => `<option value="${esc(s)}"></option>`)
      .join("");
    $("streetChips").innerHTML = streetNames
      .slice(0, 7)
      .map(
        (s) =>
          `<button type="button" class="street-chip" data-street="${esc(s)}">${esc(s)}</button>`,
      )
      .join("");
  }
  /* A pesquisa prioriza ruas associadas aos postes da demo.
   Para demais ruas, consulta o Nominatim somente ao clicar em Localizar. */
  async function locateStreet() {
    const typed = $("streetSearch").value.trim();
    if (!typed) {
      $("streetStatus").textContent = "Digite ou selecione uma rua.";
      return;
    }
    const localPost = data.posts.find(
      (p) =>
        p.address.toLocaleLowerCase("pt-BR") ===
        typed.toLocaleLowerCase("pt-BR"),
    );
    if (localPost && mapHandles.mainMap) {
      flyMapToPost(localPost.id, 17);
      $("streetStatus").textContent =
        "Rua localizada pelo poste demonstrativo #" +
        localPost.id +
        " (posição aproximada).";
      return;
    }
    if (!mapHandles.mainMap) {
      $("streetStatus").textContent = "Mapa indisponível. Confira sua conexão.";
      return;
    }
    const btn = $("streetLocate");
    btn.disabled = true;
    $("streetStatus").textContent = "Pesquisando rua em Viçosa…";
    try {
      const q = encodeURIComponent(typed + ", Viçosa, Minas Gerais, Brasil");
      const response = await fetch(
        "https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" + q,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) throw Error("Geocodificador indisponível");
      const results = await response.json();
      const found = results.find(
        (x) =>
          x.display_name.toLowerCase().includes("viçosa") &&
          x.display_name.toLowerCase().includes("minas gerais"),
      );
      if (!found) {
        $("streetStatus").textContent =
          "Rua não localizada. Confira o nome completo.";
        return;
      }
      const lat = Number(found.lat),
        lng = Number(found.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng))
        throw Error("Coordenadas inválidas");
      const instance = mapHandles.mainMap.instance;
      instance.flyTo([lat, lng], 17, { duration: 0.65 });
      if (locatedStreetLayer) locatedStreetLayer.remove();
      locatedStreetLayer = L.marker([lat, lng])
        .bindPopup(typed + " · Resultado cartográfico aproximado")
        .addTo(instance);
      locatedStreetLayer.openPopup();
      $("streetStatus").textContent =
        "Localizado: " + typed + " • OpenStreetMap";
    } catch (err) {
      console.warn("Busca de ruas:", err);
      $("streetStatus").textContent =
        "A busca externa falhou. Experimente as ruas rápidas.";
    } finally {
      btn.disabled = false;
    }
  }
  function centerCity() {
    if (mapHandles.mainMap) {
      mapHandles.mainMap.instance.flyTo(VICOSA_CENTER, 15, { duration: 0.65 });
      $("streetStatus").textContent = "Mapa centralizado em Viçosa — MG.";
    } else
      $("streetStatus").textContent = "Mapa não carregado. Tente novamente.";
  }
  function flyMapToPost(id, zoom = 18) {
    const pos = postLocations[id],
      state = mapHandles.mainMap;
    if (!pos || !state) return;
    state.instance.flyTo(pos, zoom, { duration: 0.65 });
    selectedPost = id;
    detail();
  }
  function refreshMapSize() {
    setTimeout(() => {
      Object.values(mapHandles).forEach((s) => s.instance.invalidateSize());
    }, 180);
  }
  function chart(id) {
    let a = [61, 68, 57, 72, 79, 66, 84],
      b = [37, 46, 51, 59, 48, 65, 73];
    $(id).innerHTML =
      `<div class="bars">${a.map((v, i) => `<div class="barpair"><div class="bar" style="height:${v}%" title="Consumo ${v * 20} kWh"></div><div class="bar solar" style="height:${b[i]}%" title="Geração ${b[i] * 20} kWh"></div></div>`).join("")}</div><div class="caption">Seg · Ter · Qua · Qui · Sex · Sáb · Dom</div><div class="caption">🔵 Consumo &nbsp; 🟡 Geração solar</div>`;
  }
  function detail() {
    let p = post(selectedPost);
    $("postDetail").innerHTML =
      `<h2>Poste ${p.id} — ${esc(p.address)}</h2><div class="detail"><div>Status<strong>${badge(p.status)}</strong></div><div>Ocorrência<strong>${esc(p.issue || "Nenhuma")}</strong></div><div>Luminosidade<strong>${p.lum}%</strong></div><div>Comunicação<strong>OK (simulada)</strong></div></div><p class="muted">Última comunicação: agora (simulada)</p><div class="actions"><button class="btn alt small" data-action="history" data-id="${p.id}">Ver histórico</button>${role === "gestor" ? `<button class="btn small" data-action="failure" data-id="${p.id}">Simular falha</button>` : ""}<button class="btn alt small" data-action="focusMapPost" data-id="${p.id}">📍 Localizar no mapa</button></div>`;
  }
  function posts() {
    let q = $("searchPost").value.toLowerCase(),
      f = $("filterPost").value,
      rows = data.posts.filter(
        (p) =>
          (f === "todos" || p.status === f) &&
          `${p.id} ${p.address}`.toLowerCase().includes(q),
      );
    $("postsTable").innerHTML =
      `<table><thead><tr><th>Poste</th><th>Endereço</th><th>Status</th><th>Luminosidade</th><th></th></tr></thead><tbody>${rows.map((p) => `<tr class="row-focus" tabindex="0" data-focus-post="${p.id}" title="Localizar poste #${p.id}"><td>#${p.id}</td><td>${esc(p.address)}</td><td>${badge(p.status)}</td><td>${p.lum}%</td><td><button class="btn alt small" data-action="focusMapPost" data-id="${p.id}" aria-label="Localizar poste ${p.id} no mapa">Localizar ↗</button></td></tr>`).join("")}</tbody></table>`;
    $("lightsTable").innerHTML =
      `<div class="tablewrap"><table><tr><th>Poste</th><th>Estado</th><th>Intensidade</th><th>Sensor</th></tr>${data.posts.map((p) => `<tr><td>${p.id} — ${esc(p.address)}</td><td>${badge(p.status)}</td><td>${p.lum}%</td><td>Online (simulado)</td></tr>`).join("")}</table></div>`;
  }
  function tickets() {
    let f = $("filterTicket").value,
      rows = data.tickets.filter((t) => f === "todos" || t.status === f);
    $("ticketsTable").innerHTML =
      `<table><tr><th>Chamado</th><th>Poste</th><th>Problema</th><th>Status</th><th>Responsável</th><th>Ação</th></tr>${rows.map((t) => `<tr><td>#${t.id}</td><td>${t.post} — ${esc(post(t.post)?.address || "")}</td><td>${esc(t.issue)}</td><td>${badge(t.status)}</td><td>${esc(t.tech || "Aguardando")}</td><td class="actions">${role === "gestor" && t.status === "aberto" ? `<button class="btn small" data-action="approve" data-id="${t.id}">Aprovar e atribuir</button>` : ""}${t.status === "resolvido" ? "✓ Concluído" : "—"}</td></tr>`).join("")}</table>`;
  }
  function mobile() {
    let f = $("filterMobile").value;
    let rows = data.tickets.filter(
      (t) => t.status !== "aberto" && (f === "todos" || t.status === f),
    );
    $("mobileOrders").innerHTML = rows.length
      ? rows
          .map(
            (t) =>
              `<div class="order" data-action="ticket" data-id="${t.id}"><b>Poste ${t.post} — ${esc(post(t.post)?.address || "")}</b><small>${esc(t.issue)} • ${esc(t.status)}</small></div>`,
          )
          .join("")
      : '<div class="empty">Nenhuma ordem disponível. O gestor precisa aprovar os chamados.</div>';
    let t = data.tickets.find(
      (t) => t.id === selectedTicket && t.status !== "aberto",
    );
    $("mobileDetail").innerHTML = t
      ? `<div class="panel" style="margin:12px"><h2>Atendimento #${t.id}</h2><p>Poste ${t.post} — ${esc(t.issue)}</p><p>${badge(t.status)}</p>${t.status === "aprovado" ? `<button class="btn" data-action="start" data-id="${t.id}">Iniciar atendimento</button>` : ""}${t.status === "em atendimento" ? `<label class="field"><input type="checkbox" id="checkDiagnosis"> Diagnóstico realizado</label><label class="field"><input type="checkbox" id="checkCircuit"> Circuito verificado</label><label class="field">Observações<input id="techNote" placeholder="Descreva o serviço"></label><button class="btn" data-action="finish" data-id="${t.id}">Finalizar atendimento</button>` : ""}${t.status === "resolvido" ? `<p class="notice">Atendimento concluído. ${esc(t.note)}</p>` : ""}</div>`
      : "";
  }
  function alerts() {
    $("alertsList").innerHTML =
      data.posts
        .filter((p) => p.status !== "normal")
        .map(
          (p) =>
            `<div class="order"><b>Poste ${p.id} — ${esc(p.address)}</b><small>${badge(p.status)} ${esc(p.issue)}</small></div>`,
        )
        .join("") || '<div class="empty">Sem alertas ativos</div>';
  }
  function renderExtras() {
    const last = data.tickets.slice(0, 3);
    $("recentTickets").innerHTML =
      last
        .map(
          (t) =>
            `<div class="activity-row"><span class="activity-icon">⚡</span><span><b>Poste #${t.post}</b><small>${esc(t.issue)}</small></span>${badge(t.status)}</div>`,
        )
        .join("") || '<div class="empty">Nenhuma ocorrência</div>';
    $("alertDot").style.display = data.tickets.some(
      (t) => t.status === "aberto",
    )
      ? "block"
      : "none";
    const consumo = [55, 65, 59, 72, 62, 69, 75],
      solar = [28, 36, 48, 43, 63, 59, 72],
      x = (i) => 65 + i * 110,
      y = (v) => 172 - (v - 15) * 1.9,
      points = (a) => a.map((v, i) => `${x(i)},${y(v)}`).join(" "),
      labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    $("performanceGraph").innerHTML =
      `<svg class="performance-svg" viewBox="0 0 750 225" preserveAspectRatio="none" role="img" aria-label="Gráfico ilustrativo semanal de consumo e geração solar"><defs><linearGradient id="graphFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ccdf5" stop-opacity=".18"/><stop offset="100%" stop-color="#4ccdf5" stop-opacity="0"/></linearGradient></defs>${[35, 70, 105, 140, 175].map((v) => `<line class="gridline" x1="52" y1="${v}" x2="725" y2="${v}"/>`).join("")}<polygon class="graph-fill" points="${points(solar)} 725,185 65,185"/><polyline class="line-consume" points="${points(consumo)}"/><polyline class="line-solar" points="${points(solar)}"/>${solar.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.6" fill="#57d2f7"/>`).join("")}${labels.map((t, i) => `<text class="axis-label" x="${x(i)}" y="213" text-anchor="middle">${t}</text>`).join("")}</svg>`;
  }
  /* Renderiza dados sem recriar gráficos a cada evento de manutenção. */
  function render() {
    metrics();
    map("dashMap");
    map("mainMap");
    detail();
    posts();
    tickets();
    mobile();
    alerts();
    $("reportFailures").textContent = data.tickets.length + " chamados";
    renderExtras();
    refreshInsights();
    requestAnimationFrame(renderEnergyCharts);
  }
  function failure(id) {
    if (role !== "gestor") return toast("Apenas o gestor pode simular falhas");
    let p = post(id);
    if (!p) return;
    let active = data.tickets.find(
      (t) => t.post === id && t.status !== "resolvido",
    );
    if (active) {
      toast("Já existe chamado ativo para esse poste");
      return;
    }
    p.status = "falha";
    p.issue = "Falha detectada pelo sensor (simulada)";
    p.lum = 0;
    data.tickets.unshift({
      id: data.next++,
      post: id,
      status: "aberto",
      issue: p.issue,
      tech: "",
      note: "",
    });
    save();
    render();
    toast("Falha detectada e chamado aberto automaticamente");
  }
  function exportFile(name, content, type) {
    let url = URL.createObjectURL(new Blob([content], { type })),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-page]");
    if (b) {
      nav(b.dataset.page);
      return;
    }
    let p = e.target.closest("[data-post]");
    if (p) {
      selectedPost = +p.dataset.post;
      nav("monitoramento");
      return;
    }
    let a = e.target.closest("[data-action]");
    if (!a) return;
    let id = +a.dataset.id,
      action = a.dataset.action;
    if (action === "selectPost") {
      selectedPost = id;
      detail();
    }
    if (action === "history") {
      let t = data.tickets.filter((t) => t.post === id);
      alert(
        "Histórico do poste " +
          id +
          "\n" +
          (t.map((x) => `Chamado #${x.id}: ${x.status}`).join("\n") ||
            "Sem ocorrências"),
      );
    }
    if (action === "failure") failure(id);
    if (action === "approve") {
      if (role !== "gestor") return;
      let t = data.tickets.find((t) => t.id === id);
      if (t?.status === "aberto") {
        t.status = "aprovado";
        t.tech = "Rafael Souza";
        save();
        render();
        toast("Chamado aprovado e atribuído ao técnico");
      }
    }
    if (action === "ticket") {
      selectedTicket = id;
      mobile();
    }
    if (action === "start") {
      let t = data.tickets.find((t) => t.id === id);
      if (role === "tecnico" && t?.status === "aprovado") {
        t.status = "em atendimento";
        save();
        render();
        toast("Atendimento iniciado");
      }
    }
    if (action === "finish") {
      let t = data.tickets.find((t) => t.id === id);
      if (role !== "tecnico" || t?.status !== "em atendimento") return;
      if (!$("checkDiagnosis")?.checked || !$("checkCircuit")?.checked)
        return toast("Conclua o checklist primeiro");
      t.status = "resolvido";
      t.note = $("techNote").value.trim() || "Checklist concluído";
      let p = post(t.post);
      p.status = "normal";
      p.issue = "";
      p.lum = 95;
      save();
      render();
      toast("Chamado resolvido e poste normalizado");
    }
  });
  document
    .querySelectorAll(".nav")
    .forEach((b) => b.addEventListener("click", () => nav(b.dataset.page)));
  $("bellBtn").onclick = () => nav("alertas");
  $("loginBtn").onclick = login;
  $("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });
  $("logoutBtn").onclick = () => {
    role = "";
    $("password").value = "";
    $("login").classList.remove("hidden");
    $("app").classList.add("hidden");
  };
  $("resetBtn").onclick = () => {
    if (confirm("Reiniciar todos os dados demonstrativos?")) {
      data = initial();
      save();
      selectedTicket = null;
      render();
      toast("Dados reiniciados");
    }
  };
  $("simulate").onclick = () => {
    let available = data.posts.filter((p) => p.status === "normal");
    let p = available[Math.floor(Math.random() * available.length)];
    if (p) failure(p.id);
    else toast("Não há postes disponíveis para nova falha");
  };
  $("createFailure").onclick = () => {
    let available = data.posts.filter((p) => p.status === "normal");
    let p = available[Math.floor(Math.random() * available.length)];
    if (p) failure(p.id);
    else toast("Não há postes disponíveis para nova falha");
  }; // Filtros da tabela e do mapa compartilham os mesmos dados.
  ["searchPost", "filterPost"].forEach((id) =>
    $(id).addEventListener(id === "searchPost" ? "input" : "change", posts),
  );
  $("filterTicket").onchange = tickets;
  $("filterMobile").onchange = mobile;
  $("exportJson").onclick = () =>
    exportFile(
      "squad_ads_relatorio.json",
      JSON.stringify({ geradoEm: new Date().toISOString(), ...data }, null, 2),
      "application/json",
    );
  $("exportCsv").onclick = () => {
    let csv =
      "id;poste;problema;status;tecnico;observacao\n" +
      data.tickets
        .map((t) =>
          [t.id, t.post, t.issue, t.status, t.tech, t.note]
            .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
            .join(";"),
        )
        .join("\n");
    exportFile(
      "chamados_squad_ads.csv",
      "\ufeff" + csv,
      "text/csv;charset=utf-8",
    );
  };
  initStreetUi();
  $("streetLocate").onclick = locateStreet;
  $("centerVicosa").onclick = centerCity;
  $("mapThemeToggle").onclick = () => {
    setMapStyle(mapTheme === "dark" ? "light" : "dark");
    $("mapThemeToggle").textContent =
      mapTheme === "dark" ? "☀ Mapa claro" : "☾ Mapa escuro";
  };
  $("streetSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") locateStreet();
  });
  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-street]");
    if (chip) {
      $("streetSearch").value = chip.dataset.street;
      nav("monitoramento");
      locateStreet();
    }
  });
  const refreshMapFilters = () => {
    drawMapMarkers("mainMap");
    posts();
  };
  document.querySelectorAll("[data-map-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      mapStatusFilter = b.dataset.mapFilter;
      refreshMapFilters();
    }),
  );
  $("filterPost").addEventListener("change", () => {
    mapStatusFilter = $("filterPost").value;
    refreshMapFilters();
  });
  $("searchPost").addEventListener("input", refreshMapFilters);
  $("resetMapFilter").addEventListener("click", () => {
    mapStatusFilter = "todos";
    $("searchPost").value = "";
    refreshMapFilters();
  });
  let expandedMap = false;
  const closeFullscreen = () => {
    expandedMap = false;
    $("mainMap").classList.remove("map-expanded");
    $("mapFullscreen").textContent = "⛶ Ampliar mapa";
    const close = $("mapFullscreenClose");
    if (close) close.remove();
    refreshMapSize();
  };
  $("mapFullscreen").addEventListener("click", () => {
    if (expandedMap) {
      closeFullscreen();
      return;
    }
    expandedMap = true;
    $("mainMap").classList.add("map-expanded");
    $("mapFullscreen").textContent = "⤢ Fechar tela cheia";
    const b = document.createElement("button");
    b.id = "mapFullscreenClose";
    b.className = "map-fullscreen-close";
    b.textContent = "✕ Fechar mapa";
    b.addEventListener("click", closeFullscreen);
    document.body.appendChild(b);
    refreshMapSize();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && expandedMap) closeFullscreen();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest('[data-action="focusMapPost"]');
    if (!b) return;
    const id = +b.dataset.id,
      coords = postLocations[id];
    if (!coords) return;
    mapStatusFilter = "todos";
    $("searchPost").value = "";
    nav("monitoramento");
    if (mapHandles.mainMap) flyMapToPost(id, 18);
    else $("streetStatus").textContent = "Mapa ainda não carregado.";
  });

  /* =================== ENERGIA SIMULADA ===================
   Modelo determinístico coerente: consumo = solar direta + bateria usada + rede.
   A geração excedente pode carregar a bateria ou ficar sem uso (não é consumo).
   Tudo é calculado em kWh, sem consultas a servidor. */
  let energyPeriod = "semana";
  const energyCharts = {};
  const numPt = (n) =>
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(n);
  const energyInputs = {
    dia: {
      labels: Array.from(
        { length: 24 },
        (_, i) => String(i).padStart(2, "0") + "h",
      ),
      cons: [
        2.6, 2.3, 2.2, 2.1, 2.1, 2.3, 2.9, 3.6, 4, 4.3, 4.5, 4.7, 4.8, 4.7, 4.6,
        4.7, 5, 5.5, 5.7, 5.6, 5.2, 4.4, 3.7, 3.1,
      ],
      sun: [
        0, 0, 0, 0, 0, 0, 0.4, 1.2, 2.6, 4.1, 5.2, 6.3, 6.9, 6.7, 5.8, 4.8, 3.6,
        2.1, 0.8, 0.1, 0, 0, 0, 0,
      ],
    },
    semana: {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      cons: [42, 44, 43, 46, 49, 45, 41],
      sun: [33, 39, 34, 45, 46, 42, 37],
    },
    mes: {
      labels: Array.from({ length: 30 }, (_, i) =>
        String(i + 1).padStart(2, "0"),
      ),
      cons: Array.from(
        { length: 30 },
        (_, i) => 38 + ((i * 7) % 11) + Math.round(3 * Math.sin(i * 0.7)),
      ),
      sun: Array.from(
        { length: 30 },
        (_, i) => 31 + ((i * 5) % 18) + Math.round(5 * Math.cos(i * 0.55)),
      ),
    },
  };
  function energyModel(period = energyPeriod) {
    const input = energyInputs[period],
      cons = input.cons,
      sun = input.sun;
    const solarDirect = cons.map((v, i) => Math.min(sun[i], v * 0.68));
    const batteryUse = cons.map((v, i) =>
      Math.min(v - solarDirect[i], v * 0.1),
    );
    const grid = cons.map((v, i) =>
      Math.max(0, v - solarDirect[i] - batteryUse[i]),
    );
    const solarStore = cons.map((v, i) =>
      Math.min(Math.max(0, sun[i] - solarDirect[i]), v * 0.14),
    );
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const totals = {
      consumption: sum(cons),
      generation: sum(sun),
      direct: sum(solarDirect),
      battery: sum(batteryUse),
      grid: sum(grid),
      stored: sum(solarStore),
    };
    let level = 58;
    const batteryLevel = cons.map((v, i) => {
      level = Math.max(
        15,
        Math.min(98, level + (solarStore[i] - batteryUse[i]) * 0.62),
      );
      return Math.round(level * 10) / 10;
    });
    return { ...input, solarDirect, batteryUse, grid, batteryLevel, totals };
  }
  function animateCount(el, to, unit = "kWh") {
    if (!el) return;
    const prev = Number(el.dataset.number || 0),
      finish = performance.now(),
      duration = 480;
    el.dataset.number = String(to);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      el.textContent = numPt(to) + " " + unit;
      return;
    }
    const frame = (now) => {
      if (!el.isConnected || Number(el.dataset.number) !== to) return;
      const t = Math.min(1, (now - finish) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = numPt(prev + (to - prev) * eased) + " " + unit;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  function renderEnergyMetrics() {
    const m = energyModel(),
      t = m.totals;
    const variations = [4.8, -3.2, 2.4, -6.1];
    const rows = [
      [
        "Geração solar",
        t.generation,
        variations[0],
        "Potência fotovoltaica acumulada",
      ],
      ["Consumo total", t.consumption, variations[1], "Demanda das luminárias"],
      ["Armazenada", t.stored, variations[2], "Carga estimada no período"],
      ["Rede elétrica", t.grid, variations[3], "Suprimento complementar"],
    ];
    const saldo = t.generation - t.consumption;
    rows.push([
      "Saldo solar",
      Math.abs(saldo),
      null,
      saldo >= 0 ? "Superávit de geração" : "Déficit de geração",
    ]);
    const host = $("energyMetrics");
    // Não recria os contadores em cada simulação de falha.
    if (host.dataset.period !== energyPeriod) {
      host.innerHTML = rows
        .map(
          (r, i) =>
            `<div class="card"><div class="label">${r[0]}</div><div class="number" data-energy-value="${i}">0 kWh</div><small>${r[2] === null ? (saldo >= 0 ? "▲ Sobra" : "▼ Déficit") : `<span class="${r[2] >= 0 ? "kpi-up" : "kpi-down"}">${r[2] >= 0 ? "▲" : "▼"} ${numPt(Math.abs(r[2]))}%</span> vs. período anterior`}</small><small>${r[3]}</small></div>`,
        )
        .join("");
      host.dataset.period = energyPeriod;
    }
    host
      .querySelectorAll("[data-energy-value]")
      .forEach((node, i) => animateCount(node, rows[i][1]));
    const org = $("energyOriginLegend");
    if (org)
      org.innerHTML = [
        ["Solar direta", t.direct, "#e5b449"],
        ["Rede elétrica", t.grid, "#2e91ce"],
        ["Bateria", t.battery, "#43c6ef"],
      ]
        .map(
          (r) =>
            `<span class="origin-key"><i style="background:${r[2]}"></i>${r[0]} ${numPt(r[1])} kWh</span>`,
        )
        .join("");
    document.querySelectorAll("[data-period]").forEach((b) => {
      b.classList.toggle("active", b.dataset.period === energyPeriod);
      b.setAttribute("aria-pressed", String(b.dataset.period === energyPeriod));
    });
  }
  function chartOptions(unit = "kWh") {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: { duration: 440 },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#bdd7e5",
            usePointStyle: true,
            boxWidth: 10,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: "#102b41",
          borderColor: "#3b6e87",
          borderWidth: 1,
          titleColor: "#f1f8ff",
          bodyColor: "#d4e9f4",
          padding: 12,
          callbacks: {
            label: (item) =>
              `${item.dataset.label}: ${numPt(item.parsed.y ?? item.parsed)} ${unit}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94b1c6", maxTicksLimit: 11 },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(138,184,214,.11)" },
          ticks: { color: "#94b1c6", callback: (v) => numPt(v) + " " + unit },
          title: { display: true, text: unit, color: "#a8c8d9" },
        },
      },
    };
  }
  function createOrUpdateChart(key, canvas, config) {
    if (!window.Chart || !$(canvas)) return false;
    const chart = energyCharts[key];
    if (chart) {
      chart.data.labels = config.data.labels;
      chart.data.datasets = config.data.datasets;
      chart.update();
      return true;
    }
    energyCharts[key] = new Chart($(canvas).getContext("2d"), config);
    return true;
  }
  function renderEnergyCharts() {
    if (!window.Chart) {
      for (const id of [
        "energyComboCanvas",
        "energyOriginCanvas",
        "energyBatteryCanvas",
        "dashboardEnergyCanvas",
      ]) {
        const el = $(id);
        if (el && !el.parentNode.querySelector(".chart-unavailable"))
          el.insertAdjacentHTML(
            "afterend",
            '<p class="muted chart-unavailable">Gráficos indisponíveis: verifique a conexão com o CDN Chart.js.</p>',
          );
      }
      return;
    }
    const m = energyModel(),
      gold = "#e5b449",
      blue = "#2e91ce",
      cyan = "#43c6ef";
    if ($("energia").classList.contains("active")) {
      renderEnergyMetrics();
      const o = chartOptions();
      createOrUpdateChart("combo", "energyComboCanvas", {
        type: "bar",
        data: {
          labels: m.labels,
          datasets: [
            {
              type: "bar",
              label: "Consumo",
              data: m.cons,
              backgroundColor: "rgba(46,145,206,.75)",
              borderRadius: 5,
              order: 2,
            },
            {
              type: "line",
              label: "Geração solar",
              data: m.sun,
              borderColor: gold,
              backgroundColor: gold,
              borderWidth: 3,
              pointRadius: 2,
              tension: 0.32,
              order: 1,
            },
          ],
        },
        options: o,
      });
      const t = m.totals;
      createOrUpdateChart("origin", "energyOriginCanvas", {
        type: "doughnut",
        data: {
          labels: ["Solar direta", "Rede elétrica", "Bateria"],
          datasets: [
            {
              data: [t.direct, t.grid, t.battery],
              backgroundColor: [gold, blue, cyan],
              borderWidth: 0,
              spacing: 4,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "72%",
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (i) => `${i.label}: ${numPt(i.parsed)} kWh` },
            },
          },
        },
      });
      const opts = chartOptions("%");
      opts.scales.y.min = 0;
      opts.scales.y.max = 100;
      opts.scales.y.title.text = "Carga (%)";
      createOrUpdateChart("battery", "energyBatteryCanvas", {
        type: "line",
        data: {
          labels: m.labels,
          datasets: [
            {
              label: "Nível da bateria",
              data: m.batteryLevel,
              borderColor: cyan,
              backgroundColor: "rgba(67,198,239,.14)",
              fill: true,
              tension: 0.34,
              pointRadius: 2,
              borderWidth: 3,
            },
          ],
        },
        options: opts,
      });
    }
    if ($("dashboard").classList.contains("active")) {
      const week = energyModel("semana");
      const opts = chartOptions();
      opts.plugins.legend.labels.padding = 12;
      createOrUpdateChart("dashboard", "dashboardEnergyCanvas", {
        type: "bar",
        data: {
          labels: week.labels,
          datasets: [
            {
              label: "Consumo",
              data: week.cons,
              backgroundColor: "rgba(46,145,206,.85)",
              borderRadius: 4,
            },
            {
              label: "Geração solar",
              data: week.sun,
              backgroundColor: "rgba(229,180,73,.9)",
              borderRadius: 4,
            },
          ],
        },
        options: opts,
      });
    }
  }
  function refreshInsights() {
    const posts = data.posts,
      normal = posts.filter((p) => p.status === "normal").length,
      attention = posts.filter((p) => p.status === "atencao").length,
      errors = posts.filter((p) => p.status === "falha").length;
    const active = data.tickets.filter((t) => t.status !== "resolvido").length;
    $("lightingOverview").innerHTML = [
      ["Luminárias normais", normal, "Monitoramento demonstrativo"],
      [
        "Necessitam atenção",
        attention + errors,
        "Alertas e falhas identificadas",
      ],
      [
        "Luminosidade média",
        Math.round(posts.reduce((s, p) => s + p.lum, 0) / posts.length) + "%",
        "Indicador estimado",
      ],
    ]
      .map(
        (r) =>
          `<div class="insight-tile"><div class="label">${r[0]}</div><strong>${r[1]}</strong><small>${r[2]}</small></div>`,
      )
      .join("");
    $("reportOverview").innerHTML = [
      ["Postes cadastrados", posts.length, "Base local"],
      ["Chamados pendentes", active, "Aguardando atendimento ou aprovação"],
      [
        "Chamados resolvidos",
        data.tickets.length - active,
        "Histórico demonstrativo",
      ],
    ]
      .map(
        (r) =>
          `<div class="insight-tile"><div class="label">${r[0]}</div><strong>${r[1]}</strong><small>${r[2]}</small></div>`,
      )
      .join("");
    $("alertOverview").innerHTML = [
      ["Falhas críticas", errors, "Sinalização vermelha"],
      ["Em atenção", attention, "Avaliação preventiva"],
      [
        "Chamados abertos",
        data.tickets.filter((t) => t.status === "aberto").length,
        "Dependem do gestor",
      ],
    ]
      .map(
        (r) =>
          `<div class="insight-tile"><div class="label">${r[0]}</div><strong>${r[1]}</strong><small>${r[2]}</small></div>`,
      )
      .join("");
  }
  // A tabela e o teclado também podem centralizar o mapa no poste.
  function flyToPost(id) {
    const coords = postLocations[id];
    if (!coords) return;
    selectedPost = id;
    mapStatusFilter = "todos";
    $("searchPost").value = "";
    nav("monitoramento");
    if (mapHandles.mainMap) flyMapToPost(id, 18);
    detail();
  }
  document.addEventListener("click", (e) => {
    const row = e.target.closest("[data-focus-post]");
    if (row && !e.target.closest("button")) flyToPost(+row.dataset.focusPost);
  });
  document.addEventListener("keydown", (e) => {
    const row = e.target.closest("[data-focus-post]");
    if (row && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      flyToPost(+row.dataset.focusPost);
    }
  });
  document.querySelectorAll("[data-period]").forEach((b) =>
    b.addEventListener("click", () => {
      energyPeriod = b.dataset.period;
      renderEnergyCharts();
    }),
  );

  render();
})();
