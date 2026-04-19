const MENU_SEED = [
  { name: "爆炒肥肠", price: 46, category: "招牌必点" },
  { name: "九秒腰花", price: 31, category: "招牌必点" },
  { name: "鹿茸菌炒回锅肉", price: 39, category: "招牌必点" },
  { name: "石锅红烧肉", price: 39, category: "招牌必点" },
  { name: "酸萝卜爆牛肚", price: 39, category: "招牌必点" },
  { name: "紫苏鲜鱼杂", price: 39, category: "招牌必点" },
  { name: "芋头炒腊肉", price: 39, category: "招牌必点" },
  { name: "酸姜鸡杂", price: 32, category: "招牌必点" },
  { name: "小炒格格肝肉", price: 39, category: "招牌必点" },
  { name: "麻辣小龙虾", price: 39, category: "招牌必点" },
  { name: "小黄姜炒鸡", price: 39, category: "招牌必点" },
  { name: "紫苏牛蛙", price: 39, category: "招牌必点" },
  { name: "脆皮辣子鸡", price: 39, category: "招牌必点" },
  { name: "辣椒炒肉", price: 35, category: "招牌必点" },
  { name: "梅干菜凤爪", price: 39, category: "新品上市" },
  { name: "猪头肉炒饼粑", price: 29, category: "新品上市" },
  { name: "发辣香干丝", price: 19, category: "新品上市" },
  { name: "豆芽菜炒鸡蛋", price: 18, category: "新品上市" },
  { name: "蒜苔香豆", price: 9, category: "新品上市" },
  { name: "煲炒猪肝", price: 28, category: "家常小炒" },
  { name: "臭豆腐砂锅", price: 28, category: "家常小炒" },
  { name: "砂锅啤汤烩", price: 26, category: "家常小炒" },
  { name: "坛剁椒脆肝", price: 23, category: "家常小炒" },
  { name: "梅菜炒茄子", price: 22, category: "家常小炒" },
  { name: "肉末笋丝", price: 22, category: "家常小炒" },
  { name: "酸菜炒粉皮", price: 22, category: "家常小炒" },
  { name: "油渣炒洪菜", price: 19, category: "家常小炒" },
  { name: "榨菜肉末豆角", price: 19, category: "家常小炒" },
  { name: "冷辣臭豆腐", price: 16, category: "家常小炒" },
  { name: "酒炒土鸡蛋", price: 23, category: "家常小炒" },
  { name: "带汤臭豆腐", price: 19, category: "家常小炒" },
  { name: "下饭一碗香", price: 18, category: "家常小炒" },
  { name: "酱油土豆丝", price: 16, category: "家常小炒" },
  { name: "油爆小八爪", price: 16, category: "家常小炒" },
  { name: "带皮猪肝汤", price: 16, category: "家常小炒" },
  { name: "豆腐菌菇双汤", price: 16, category: "家常小炒" },
  { name: "麻婆豆腐", price: 9, category: "凉菜配菜" },
  { name: "五香花生米", price: 8, category: "凉菜配菜" },
  { name: "刀拍黄瓜", price: 15, category: "凉菜配菜" }
];

const STORAGE_KEY = "group-order-pages-v1";
const DEFAULT_STORE_NAME = "双椒鲜土锅馆";

const state = {
  storeName: DEFAULT_STORE_NAME,
  menu: [],
  menuAdmin: [],
  orders: [],
  nextMenuId: 1,
  nextOrderId: 1
};

const refs = {
  viewTabsWrap: document.getElementById("view-tabs"),
  storeNameDisplay: document.getElementById("store-name-display"),
  storeNameForm: document.getElementById("store-name-form"),
  storeNameInput: document.getElementById("store-name-input"),
  orderId: document.getElementById("order-id"),
  memberName: document.getElementById("member-name"),
  contact: document.getElementById("contact"),
  remark: document.getElementById("remark"),
  menuGroups: document.getElementById("menu-groups"),
  orderForm: document.getElementById("order-form"),
  submitBtn: document.getElementById("submit-btn"),
  formMessage: document.getElementById("form-message"),
  clearBtn: document.getElementById("clear-form-btn"),
  refreshBtn: document.getElementById("refresh-btn"),
  exportCsvBtn: document.getElementById("export-csv-btn"),
  menuAdminForm: document.getElementById("menu-admin-form"),
  menuImportForm: document.getElementById("menu-import-form"),
  menuImportContent: document.getElementById("menu-import-content"),
  menuImportReplace: document.getElementById("menu-import-replace"),
  menuTemplateCsvBtn: document.getElementById("menu-template-csv-btn"),
  menuTemplateTxtBtn: document.getElementById("menu-template-txt-btn"),
  newDishName: document.getElementById("new-dish-name"),
  newDishCategory: document.getElementById("new-dish-category"),
  newDishPrice: document.getElementById("new-dish-price"),
  menuAdminMessage: document.getElementById("menu-admin-message"),
  menuAdminBody: document.getElementById("menu-admin-body"),
  orderList: document.getElementById("order-list"),
  overviewOrderCount: document.getElementById("overview-order-count"),
  overviewItemCount: document.getElementById("overview-item-count"),
  overviewAmount: document.getElementById("overview-amount"),
  dishRankBody: document.getElementById("dish-rank-body"),
  memberRankBody: document.getElementById("member-rank-body")
};

let activeView = "order";

function nowIso() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function yuan(amount) {
  return `¥${Number(amount || 0).toFixed(0)}`;
}

function showMessage(text, isError = false) {
  refs.formMessage.textContent = text;
  refs.formMessage.style.color = isError ? "#b4382f" : "#2f7d44";
}

function clearMessage() {
  refs.formMessage.textContent = "";
}

function showAdminMessage(text, isError = false) {
  refs.menuAdminMessage.textContent = text;
  refs.menuAdminMessage.style.color = isError ? "#b4382f" : "#2f7d44";
}

function clearAdminMessage() {
  refs.menuAdminMessage.textContent = "";
}

function switchView(view) {
  activeView = view;
  document.querySelectorAll(".screen-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.screen === view);
  });
  refs.viewTabsWrap.querySelectorAll(".view-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.viewTarget === view);
  });
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadMenuTemplateCsv() {
  const rows = [
    ["分类", "菜名", "价格"],
    ["招牌必点", "爆炒肥肠", "46"],
    ["家常小炒", "油渣炒洪菜", "19"],
    ["凉菜配菜", "刀拍黄瓜", "15"],
  ];
  const text = rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
  downloadFile("menu-import-template.csv", `\ufeff${text}`, "text/csv;charset=utf-8;");
}

function downloadMenuTemplateTxt() {
  const text = [
    "分类,菜名,价格",
    "招牌必点,爆炒肥肠,46",
    "家常小炒,油渣炒洪菜,19",
    "凉菜配菜,刀拍黄瓜,15",
  ].join("\n");
  downloadFile("menu-import-template.txt", text, "text/plain;charset=utf-8;");
}

function renderStoreName(storeName) {
  const value = (storeName || "").trim() || DEFAULT_STORE_NAME;
  state.storeName = value;
  refs.storeNameDisplay.textContent = value;
  refs.storeNameInput.value = value;
  document.title = `${value} · 群下单助手（GitHub Pages）`;
}

function parseMenuImportText(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("导入内容不能为空");
  }

  const results = [];
  const lineError = "每行请使用：分类,菜名,价格 或 菜名,价格,分类";

  lines.forEach((line, idx) => {
    const parts = line.split(/[\t,，]+/).map((x) => x.trim()).filter(Boolean);
    let name = "";
    let category = "";
    let priceRaw = "";

    if (parts.length === 3) {
      if (/^\d+$/.test(parts[1])) {
        name = parts[0];
        priceRaw = parts[1];
        category = parts[2];
      } else if (/^\d+$/.test(parts[2])) {
        category = parts[0];
        name = parts[1];
        priceRaw = parts[2];
      } else {
        throw new Error(`第 ${idx + 1} 行格式错误：${lineError}`);
      }
    } else {
      const m = line.match(/^(.+?)\s+(\d+)$/);
      if (!m) {
        throw new Error(`第 ${idx + 1} 行格式错误：${lineError}`);
      }
      name = m[1].trim();
      priceRaw = m[2].trim();
      category = "未分类";
    }

    const price = Number(priceRaw);
    if (!name) throw new Error(`第 ${idx + 1} 行菜名为空`);
    if (!category) throw new Error(`第 ${idx + 1} 行分类为空`);
    if (!Number.isInteger(price) || price <= 0) throw new Error(`第 ${idx + 1} 行价格必须是大于0的整数`);

    results.push({ name, category, price });
  });

  const dedup = new Map();
  results.forEach((item) => dedup.set(item.name, item));
  return [...dedup.values()];
}

function groupedMenu(menu) {
  const groups = {};
  for (const item of menu) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}

function buildSummary() {
  const overview = { order_count: state.orders.length, item_count: 0, amount: 0 };
  const dishMap = new Map();
  const memberRank = [];

  state.orders.forEach((order) => {
    let itemCount = 0;
    let amount = 0;
    order.items.forEach((item) => {
      overview.item_count += item.quantity;
      overview.amount += item.subtotal;
      itemCount += item.quantity;
      amount += item.subtotal;

      const key = `${item.name}__${item.category}`;
      const prev = dishMap.get(key) || { name: item.name, category: item.category, quantity: 0, amount: 0 };
      prev.quantity += item.quantity;
      prev.amount += item.subtotal;
      dishMap.set(key, prev);
    });

    memberRank.push({
      member_name: order.member_name,
      dish_type_count: order.items.length,
      item_count: itemCount,
      amount
    });
  });

  return {
    overview,
    dish_rank: [...dishMap.values()].sort((a, b) => b.quantity - a.quantity || b.amount - a.amount),
    member_rank: memberRank.sort((a, b) => b.amount - a.amount || b.item_count - a.item_count)
  };
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      storeName: state.storeName,
      menuAdmin: state.menuAdmin,
      orders: state.orders,
      nextMenuId: state.nextMenuId,
      nextOrderId: state.nextOrderId
    })
  );
}

function normalizeLoadedState(data) {
  if (!data || !Array.isArray(data.menuAdmin) || !Array.isArray(data.orders)) return false;
  state.storeName = String(data.storeName || DEFAULT_STORE_NAME);
  state.menuAdmin = data.menuAdmin;
  state.orders = data.orders;
  state.nextMenuId = Number(data.nextMenuId || 1);
  state.nextOrderId = Number(data.nextOrderId || 1);
  return true;
}

function initState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let loaded = false;
  if (raw) {
    try {
      loaded = normalizeLoadedState(JSON.parse(raw));
    } catch (_) {
      loaded = false;
    }
  }

  if (!loaded) {
    const stamp = nowIso();
    state.menuAdmin = MENU_SEED.map((item, index) => ({
      id: index + 1,
      name: item.name,
      price: item.price,
      category: item.category,
      is_active: 1,
      updated_at: stamp
    }));
    state.orders = [];
    state.nextMenuId = state.menuAdmin.length + 1;
    state.nextOrderId = 1;
    state.storeName = DEFAULT_STORE_NAME;
    saveState();
  }

  state.menu = state.menuAdmin.filter((item) => item.is_active === 1);
  renderStoreName(state.storeName);
}

function renderMenu() {
  state.menu = state.menuAdmin.filter((item) => item.is_active === 1);
  const groups = groupedMenu(state.menu);
  const html = Object.entries(groups)
    .map(([category, items]) => {
      const itemHtml = items
        .map(
          (item) => `
            <label class="menu-item">
              <span>${item.name}</span>
              <span class="price">${yuan(item.price)}</span>
              <input class="qty" type="number" min="0" value="0" data-item-id="${item.id}" />
            </label>
          `
        )
        .join("");

      return `
        <section class="menu-group">
          <h4>${category}</h4>
          ${itemHtml}
        </section>
      `;
    })
    .join("");

  refs.menuGroups.innerHTML = html;
}

function renderMenuAdmin() {
  if (!state.menuAdmin.length) {
    refs.menuAdminBody.innerHTML = `<tr><td colspan="5" class="empty">暂无菜品</td></tr>`;
    return;
  }

  refs.menuAdminBody.innerHTML = state.menuAdmin
    .map((item) => {
      const disabled = item.is_active ? "" : "disabled";
      const statusText = item.is_active ? "上架" : "已删除";
      const statusClass = item.is_active ? "status-up" : "status-down";
      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>
            <div class="price-edit-wrap">
              <input class="price-edit-input" type="number" min="1" value="${item.price}" data-price-input-id="${item.id}" ${disabled} />
              <button class="btn btn-subtle btn-small" data-price-save-id="${item.id}" type="button" ${disabled}>改价</button>
            </div>
          </td>
          <td><span class="status-tag ${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn btn-danger btn-small" data-delete-dish-id="${item.id}" type="button" ${disabled}>删菜</button>
          </td>
        </tr>
      `;
    })
    .join("");

  refs.menuAdminBody.querySelectorAll("button[data-price-save-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.priceSaveId);
      const input = refs.menuAdminBody.querySelector(`input[data-price-input-id="${id}"]`);
      const price = Number(input?.value || 0);
      if (!price || price <= 0) {
        showAdminMessage("价格必须大于 0", true);
        return;
      }
      const item = state.menuAdmin.find((entry) => entry.id === id);
      if (!item) return;
      item.price = price;
      item.updated_at = nowIso();
      saveState();
      showAdminMessage("价格已更新");
      reloadAll();
    });
  });

  refs.menuAdminBody.querySelectorAll("button[data-delete-dish-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.deleteDishId);
      const ok = window.confirm("确认删除这个菜品吗？删除后将不再出现在点单菜单中。");
      if (!ok) return;
      const item = state.menuAdmin.find((entry) => entry.id === id);
      if (!item) return;
      item.is_active = 0;
      item.updated_at = nowIso();
      saveState();
      showAdminMessage("菜品已删除");
      reloadAll();
    });
  });
}

function collectItemsFromForm() {
  const inputs = refs.menuGroups.querySelectorAll("input[data-item-id]");
  const values = [];
  inputs.forEach((input) => {
    const quantity = Number(input.value || 0);
    const menuItemId = Number(input.dataset.itemId);
    if (menuItemId > 0 && quantity > 0) values.push({ menu_item_id: menuItemId, quantity });
  });
  return values;
}

function resetForm(options = { clearMessage: true }) {
  refs.orderId.value = "";
  refs.memberName.value = "";
  refs.contact.value = "";
  refs.remark.value = "";
  refs.submitBtn.textContent = "提交订单";
  refs.menuGroups.querySelectorAll("input[data-item-id]").forEach((input) => {
    input.value = 0;
  });
  if (options.clearMessage) clearMessage();
}

function fillForm(order) {
  refs.orderId.value = String(order.id);
  refs.memberName.value = order.member_name;
  refs.contact.value = order.contact;
  refs.remark.value = order.remark;
  refs.submitBtn.textContent = "保存修改";
  refs.menuGroups.querySelectorAll("input[data-item-id]").forEach((input) => {
    input.value = 0;
  });
  order.items.forEach((item) => {
    const input = refs.menuGroups.querySelector(`input[data-item-id="${item.menu_item_id}"]`);
    if (input) input.value = item.quantity;
  });
  showMessage(`正在编辑 ${order.member_name} 的订单`);
}

function renderOrders() {
  if (!state.orders.length) {
    refs.orderList.innerHTML = `<p class="empty">暂无订单，快让第一个同事下单吧。</p>`;
    return;
  }

  const ordered = [...state.orders].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  refs.orderList.innerHTML = ordered
    .map((order) => {
      const itemText = order.items.map((item) => `${item.name} x${item.quantity}（${yuan(item.subtotal)}）`).join("；");
      return `
        <article class="order-card">
          <div class="order-meta">
            <div>
              <strong>${order.member_name}</strong>
              <span> · ${order.contact || "未留联系方式"}</span>
            </div>
            <strong>${yuan(order.total_amount)}</strong>
          </div>
          <div class="order-items">${itemText || "无菜品"}</div>
          <div class="order-items">备注：${order.remark || "无"}</div>
          <div class="order-actions">
            <button class="btn btn-subtle" data-edit-id="${order.id}" type="button">编辑</button>
            <button class="btn btn-danger" data-delete-id="${order.id}" type="button">删除</button>
          </div>
        </article>
      `;
    })
    .join("");

  refs.orderList.querySelectorAll("button[data-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.editId);
      const order = state.orders.find((entry) => entry.id === id);
      if (order) fillForm(order);
      switchView("order");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  refs.orderList.querySelectorAll("button[data-delete-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.deleteId);
      if (!window.confirm("确认删除这条订单吗？")) return;
      state.orders = state.orders.filter((entry) => entry.id !== id);
      saveState();
      reloadAll();
      if (Number(refs.orderId.value) === id) resetForm();
    });
  });
}

function renderSummary() {
  const summary = buildSummary();
  refs.overviewOrderCount.textContent = summary.overview.order_count;
  refs.overviewItemCount.textContent = summary.overview.item_count;
  refs.overviewAmount.textContent = yuan(summary.overview.amount);

  refs.dishRankBody.innerHTML = summary.dish_rank
    .slice(0, 15)
    .map((dish) => `<tr><td>${dish.name}</td><td>${dish.category}</td><td>${dish.quantity}</td><td>${yuan(dish.amount)}</td></tr>`)
    .join("");

  refs.memberRankBody.innerHTML = summary.member_rank
    .slice(0, 15)
    .map(
      (member) =>
        `<tr><td>${member.member_name}</td><td>${member.dish_type_count}</td><td>${member.item_count}</td><td>${yuan(member.amount)}</td></tr>`
    )
    .join("");
}

function reloadAll() {
  renderStoreName(state.storeName);
  state.menu = state.menuAdmin.filter((item) => item.is_active === 1);
  renderMenu();
  renderMenuAdmin();
  renderOrders();
  renderSummary();
}

function buildOrderItems(selection) {
  const activeMap = new Map(state.menu.map((item) => [item.id, item]));
  const items = [];
  selection.forEach((entry) => {
    const menu = activeMap.get(entry.menu_item_id);
    if (!menu) return;
    const subtotal = menu.price * entry.quantity;
    items.push({
      menu_item_id: menu.id,
      name: menu.name,
      category: menu.category,
      quantity: entry.quantity,
      unit_price: menu.price,
      subtotal
    });
  });
  return items;
}

function submitForm(event) {
  event.preventDefault();
  clearMessage();

  const memberName = refs.memberName.value.trim();
  if (!memberName) {
    showMessage("成员姓名不能为空", true);
    return;
  }

  const selected = collectItemsFromForm();
  if (!selected.length) {
    showMessage("请至少选择一道菜", true);
    return;
  }

  const items = buildOrderItems(selected);
  if (!items.length) {
    showMessage("菜品无效，请刷新后重试", true);
    return;
  }

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const stamp = nowIso();

  const orderId = refs.orderId.value ? Number(refs.orderId.value) : null;
  if (orderId) {
    const existing = state.orders.find((entry) => entry.id === orderId);
    if (!existing) {
      showMessage("订单不存在", true);
      return;
    }
    existing.member_name = memberName;
    existing.contact = refs.contact.value.trim();
    existing.remark = refs.remark.value.trim();
    existing.items = items;
    existing.total_amount = totalAmount;
    existing.total_count = totalCount;
    existing.updated_at = stamp;
    showMessage("订单已更新");
  } else {
    state.orders.push({
      id: state.nextOrderId,
      member_name: memberName,
      contact: refs.contact.value.trim(),
      remark: refs.remark.value.trim(),
      created_at: stamp,
      updated_at: stamp,
      total_amount: totalAmount,
      total_count: totalCount,
      items
    });
    state.nextOrderId += 1;
    showMessage("订单已提交");
  }

  saveState();
  resetForm({ clearMessage: false });
  reloadAll();
}

function submitMenuAdminForm(event) {
  event.preventDefault();
  clearAdminMessage();

  const name = refs.newDishName.value.trim();
  const category = refs.newDishCategory.value.trim();
  const price = Number(refs.newDishPrice.value || 0);

  if (!name) {
    showAdminMessage("菜名不能为空", true);
    return;
  }
  if (!category) {
    showAdminMessage("分类不能为空", true);
    return;
  }
  if (!price || price <= 0) {
    showAdminMessage("价格必须大于 0", true);
    return;
  }

  const stamp = nowIso();
  const existing = state.menuAdmin.find((item) => item.name === name);
  if (existing && existing.is_active === 1) {
    showAdminMessage("菜名已存在", true);
    return;
  }

  if (existing && existing.is_active === 0) {
    existing.category = category;
    existing.price = price;
    existing.is_active = 1;
    existing.updated_at = stamp;
  } else {
    state.menuAdmin.push({
      id: state.nextMenuId,
      name,
      category,
      price,
      is_active: 1,
      updated_at: stamp
    });
    state.nextMenuId += 1;
  }

  refs.newDishName.value = "";
  refs.newDishCategory.value = "";
  refs.newDishPrice.value = "";

  saveState();
  showAdminMessage("菜品已新增");
  reloadAll();
}

function submitStoreNameForm(event) {
  event.preventDefault();
  clearAdminMessage();

  const value = refs.storeNameInput.value.trim();
  if (!value) {
    showAdminMessage("店铺名称不能为空", true);
    return;
  }

  renderStoreName(value);
  saveState();
  showAdminMessage("店铺名称已更新");
}

function submitMenuImportForm(event) {
  event.preventDefault();
  clearAdminMessage();

  const content = refs.menuImportContent.value.trim();
  const replaceAll = refs.menuImportReplace.checked;
  if (!content) {
    showAdminMessage("请先填写导入内容", true);
    return;
  }

  let parsed;
  try {
    parsed = parseMenuImportText(content);
  } catch (error) {
    showAdminMessage(error.message, true);
    return;
  }

  const stamp = nowIso();
  if (replaceAll) {
    state.menuAdmin.forEach((item) => {
      item.is_active = 0;
      item.updated_at = stamp;
    });
  }

  let added = 0;
  let updated = 0;
  let restored = 0;
  parsed.forEach((item) => {
    const existing = state.menuAdmin.find((entry) => entry.name === item.name);
    if (!existing) {
      state.menuAdmin.push({
        id: state.nextMenuId,
        name: item.name,
        category: item.category,
        price: item.price,
        is_active: 1,
        updated_at: stamp,
      });
      state.nextMenuId += 1;
      added += 1;
      return;
    }

    const wasActive = existing.is_active === 1;
    existing.category = item.category;
    existing.price = item.price;
    existing.is_active = 1;
    existing.updated_at = stamp;
    if (wasActive) {
      updated += 1;
    } else {
      restored += 1;
    }
  });

  saveState();
  refs.menuImportContent.value = "";
  refs.menuImportReplace.checked = false;
  showAdminMessage(`导入完成：新增 ${added}，更新 ${updated}，恢复 ${restored}`);
  reloadAll();
}

function exportCsv() {
  const summary = buildSummary();
  const rows = [];
  rows.push(["群下单导出", nowIso()]);
  rows.push([]);
  rows.push(["成员", "联系方式", "菜品", "单价", "数量", "小计", "备注"]);

  state.orders.forEach((order) => {
    let first = true;
    order.items.forEach((item) => {
      rows.push([
        first ? order.member_name : "",
        first ? order.contact : "",
        item.name,
        item.unit_price,
        item.quantity,
        item.subtotal,
        first ? order.remark : ""
      ]);
      first = false;
    });
  });

  rows.push([]);
  rows.push(["总订单数", summary.overview.order_count]);
  rows.push(["总份数", summary.overview.item_count]);
  rows.push(["总金额", summary.overview.amount]);

  const csvText = rows.map((row) => row.map((value) => `"${String(value || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csvText}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "group-orders.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function bindEvents() {
  refs.viewTabsWrap.querySelectorAll(".view-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.viewTarget));
  });
  refs.storeNameForm.addEventListener("submit", submitStoreNameForm);
  refs.orderForm.addEventListener("submit", submitForm);
  refs.clearBtn.addEventListener("click", resetForm);
  refs.refreshBtn.addEventListener("click", reloadAll);
  refs.menuAdminForm.addEventListener("submit", submitMenuAdminForm);
  refs.menuImportForm.addEventListener("submit", submitMenuImportForm);
  refs.menuTemplateCsvBtn.addEventListener("click", downloadMenuTemplateCsv);
  refs.menuTemplateTxtBtn.addEventListener("click", downloadMenuTemplateTxt);
  refs.exportCsvBtn.addEventListener("click", exportCsv);
}

function boot() {
  initState();
  bindEvents();
  switchView(activeView);
  reloadAll();
}

boot();
