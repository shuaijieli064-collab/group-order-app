const state = {
  menu: [],
  menuAdmin: [],
  categoryAdmin: [],
  menuById: new Map(),
  orders: [],
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
  menuAdminForm: document.getElementById("menu-admin-form"),
  categoryCreateForm: document.getElementById("category-create-form"),
  categoryRenameForm: document.getElementById("category-rename-form"),
  categoryMergeForm: document.getElementById("category-merge-form"),
  categoryDeleteForm: document.getElementById("category-delete-form"),
  categoryCreateName: document.getElementById("category-create-name"),
  categoryRenameOld: document.getElementById("category-rename-old"),
  categoryRenameNew: document.getElementById("category-rename-new"),
  categoryMergeSource: document.getElementById("category-merge-source"),
  categoryMergeTarget: document.getElementById("category-merge-target"),
  categoryMergeTargetOptions: document.getElementById("category-merge-target-options"),
  categoryDeleteName: document.getElementById("category-delete-name"),
  categoryAdminBody: document.getElementById("category-admin-body"),
  menuImportForm: document.getElementById("menu-import-form"),
  menuImportContent: document.getElementById("menu-import-content"),
  menuImportReplace: document.getElementById("menu-import-replace"),
  menuTemplateCsvBtn: document.getElementById("menu-template-csv-btn"),
  menuTemplateTxtBtn: document.getElementById("menu-template-txt-btn"),
  newDishName: document.getElementById("new-dish-name"),
  newDishCategory: document.getElementById("new-dish-category"),
  newDishCategoryOptions: document.getElementById("new-dish-category-options"),
  newDishPrice: document.getElementById("new-dish-price"),
  menuAdminMessage: document.getElementById("menu-admin-message"),
  menuAdminBody: document.getElementById("menu-admin-body"),
  orderList: document.getElementById("order-list"),
  overviewOrderCount: document.getElementById("overview-order-count"),
  overviewItemCount: document.getElementById("overview-item-count"),
  overviewAmount: document.getElementById("overview-amount"),
  dishRankBody: document.getElementById("dish-rank-body"),
  memberRankBody: document.getElementById("member-rank-body"),
};

let activeView = "order";

function normalizeCategory(value) {
  const text = String(value || "").trim();
  return text || "未分类";
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
  const value = storeName || "双椒鲜土锅馆";
  refs.storeNameDisplay.textContent = value;
  refs.storeNameInput.value = value;
  document.title = `${value} · 群下单助手`;
}

function groupedMenu(menu) {
  const groups = {};
  for (const item of menu) {
    const category = normalizeCategory(item.category);
    if (!groups[category]) groups[category] = [];
    groups[category].push({ ...item, category });
  }
  return groups;
}

function renderMenu() {
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
  const categorySet = new Set();
  (state.categoryAdmin || []).forEach((item) => {
    const category = normalizeCategory(item.category);
    if (category) categorySet.add(category);
  });
  state.menuAdmin.forEach((item) => {
    const category = normalizeCategory(item.category);
    if (category) categorySet.add(category);
  });
  if (!categorySet.size) {
    categorySet.add("未分类");
  }
  refs.newDishCategoryOptions.innerHTML = [...categorySet]
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((category) => `<option value="${category}"></option>`)
    .join("");

  if (!state.menuAdmin.length) {
    refs.menuAdminBody.innerHTML = `<tr><td colspan="6" class="empty">暂无菜品</td></tr>`;
    return;
  }

  refs.menuAdminBody.innerHTML = state.menuAdmin
    .map((item) => {
      const category = normalizeCategory(item.category);
      const disabled = item.is_active ? "" : "disabled";
      const statusText = item.is_active ? "上架" : "已删除";
      const statusClass = item.is_active ? "status-up" : "status-down";
      return `
        <tr>
          <td>${item.name}</td>
          <td>${category}</td>
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
          <td>
            <button class="btn btn-danger btn-small" data-delete-dish-hard-id="${item.id}" type="button">彻底删</button>
          </td>
        </tr>
      `;
    })
    .join("");

  refs.menuAdminBody.querySelectorAll("button[data-price-save-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.priceSaveId);
      const input = refs.menuAdminBody.querySelector(`input[data-price-input-id="${id}"]`);
      const price = Number(input?.value || 0);
      if (!price || price <= 0) {
        showAdminMessage("价格必须大于 0", true);
        return;
      }
      try {
        await fetchJson(`/api/menu/${id}/price`, {
          method: "PATCH",
          body: JSON.stringify({ price }),
        });
        showAdminMessage("价格已更新");
        await reloadAll();
      } catch (error) {
        showAdminMessage(error.message, true);
      }
    });
  });

  refs.menuAdminBody.querySelectorAll("button[data-delete-dish-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.deleteDishId);
      const ok = window.confirm("确认删除这个菜品吗？删除后将不再出现在点单菜单中。");
      if (!ok) return;
      try {
        await fetchJson(`/api/menu/${id}`, { method: "DELETE" });
        showAdminMessage("菜品已删除");
        await reloadAll();
      } catch (error) {
        showAdminMessage(error.message, true);
      }
    });
  });

  refs.menuAdminBody.querySelectorAll("button[data-delete-dish-hard-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.deleteDishHardId);
      const ok = window.confirm("确认彻底删除该菜品？已有订单记录的菜品不能彻底删除。");
      if (!ok) return;
      try {
        await fetchJson(`/api/menu/${id}/hard`, { method: "DELETE" });
        showAdminMessage("菜品已彻底删除");
        await reloadAll();
      } catch (error) {
        showAdminMessage(error.message, true);
      }
    });
  });
}

function renderCategoryAdmin() {
  const categories = state.categoryAdmin || [];
  if (!categories.length) {
    refs.categoryAdminBody.innerHTML = `<tr><td colspan="3" class="empty">暂无分类</td></tr>`;
    refs.categoryRenameOld.innerHTML = "";
    refs.categoryMergeSource.innerHTML = "";
    refs.categoryDeleteName.innerHTML = "";
    refs.categoryMergeTargetOptions.innerHTML = "";
    return;
  }

  refs.categoryAdminBody.innerHTML = categories
    .map((item) => `<tr><td>${item.category}</td><td>${item.active_count}</td><td>${item.total_count}</td></tr>`)
    .join("");

  const options = categories
    .map((item) => `<option value="${item.category}">${item.category}</option>`)
    .join("");

  const oldRenameValue = refs.categoryRenameOld.value;
  const oldSourceValue = refs.categoryMergeSource.value;

  refs.categoryRenameOld.innerHTML = options;
  if (categories.some((item) => item.category === oldRenameValue)) {
    refs.categoryRenameOld.value = oldRenameValue;
  } else if (categories.length) {
    refs.categoryRenameOld.value = categories[0].category;
  }
  refs.categoryMergeSource.innerHTML = options;
  if (categories.some((item) => item.category === oldSourceValue)) {
    refs.categoryMergeSource.value = oldSourceValue;
  } else if (categories.length) {
    refs.categoryMergeSource.value = categories[0].category;
  }
  refs.categoryDeleteName.innerHTML = categories
    .filter((item) => Number(item.total_count) === 0)
    .map((item) => `<option value="${item.category}">${item.category}</option>`)
    .join("");
  if (!refs.categoryDeleteName.value) {
    refs.categoryDeleteName.selectedIndex = 0;
  }
  refs.categoryMergeTargetOptions.innerHTML = categories
    .map((item) => `<option value="${item.category}"></option>`)
    .join("");
}

function collectItemsFromForm() {
  const qtyInputs = refs.menuGroups.querySelectorAll("input[data-item-id]");
  const items = [];
  qtyInputs.forEach((input) => {
    const quantity = Number(input.value || 0);
    const menuItemId = Number(input.dataset.itemId);
    if (quantity > 0) {
      items.push({ menu_item_id: menuItemId, quantity });
    }
  });
  return items;
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

  refs.orderList.innerHTML = state.orders
    .map((order) => {
      const itemText = order.items
        .map((item) => `${item.name} x${item.quantity}（${yuan(item.subtotal)}）`)
        .join("；");

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

  refs.orderList.querySelectorAll("button[data-edit-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editId);
      const order = state.orders.find((item) => item.id === id);
      if (order) fillForm(order);
      switchView("order");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  refs.orderList.querySelectorAll("button[data-delete-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.deleteId);
      const ok = window.confirm("确认删除这条订单吗？");
      if (!ok) return;
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      await reloadAll();
      if (Number(refs.orderId.value) === id) resetForm();
    });
  });
}

function renderSummary(summary) {
  refs.overviewOrderCount.textContent = summary.overview.order_count;
  refs.overviewItemCount.textContent = summary.overview.item_count;
  refs.overviewAmount.textContent = yuan(summary.overview.amount);

  refs.dishRankBody.innerHTML = summary.dish_rank
    .slice(0, 15)
    .map(
      (dish) => `<tr><td>${dish.name}</td><td>${dish.category}</td><td>${dish.quantity}</td><td>${yuan(
        dish.amount
      )}</td></tr>`
    )
    .join("");

  refs.memberRankBody.innerHTML = summary.member_rank
    .slice(0, 15)
    .map(
      (member) => `<tr><td>${member.member_name}</td><td>${member.dish_type_count}</td><td>${member.item_count}</td><td>${yuan(
        member.amount
      )}</td></tr>`
    )
    .join("");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

async function reloadAll() {
  const [settings, menu, menuAdmin, categoryAdmin, orders, summary] = await Promise.all([
    fetchJson("/api/settings"),
    fetchJson("/api/menu"),
    fetchJson("/api/menu/admin"),
    fetchJson("/api/categories/admin"),
    fetchJson("/api/orders"),
    fetchJson("/api/summary"),
  ]);
  renderStoreName(settings.store_name);
  state.menu = menu;
  state.menuById = new Map(menu.map((item) => [item.id, item]));
  state.menuAdmin = menuAdmin;
  state.categoryAdmin = categoryAdmin;
  state.orders = orders;
  renderMenu();
  renderMenuAdmin();
  renderCategoryAdmin();
  renderOrders();
  renderSummary(summary);
}

async function submitCategoryCreateForm(event) {
  event.preventDefault();
  clearAdminMessage();
  const name = refs.categoryCreateName.value.trim();
  if (!name) {
    showAdminMessage("分类名称不能为空", true);
    return;
  }

  try {
    await fetchJson("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
    refs.categoryCreateName.value = "";
    showAdminMessage("分类已创建");
    await reloadAll();
    refs.newDishCategory.value = name;
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitCategoryRenameForm(event) {
  event.preventDefault();
  clearAdminMessage();
  const oldName = refs.categoryRenameOld.value.trim();
  const newName = refs.categoryRenameNew.value.trim();
  if (!oldName || !newName) {
    showAdminMessage("请填写完整分类名称", true);
    return;
  }

  try {
    await fetchJson("/api/categories/rename", {
      method: "PATCH",
      body: JSON.stringify({ old_name: oldName, new_name: newName }),
    });
    refs.categoryRenameNew.value = "";
    showAdminMessage("分类已重命名");
    await reloadAll();
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitCategoryMergeForm(event) {
  event.preventDefault();
  clearAdminMessage();
  const sourceName = refs.categoryMergeSource.value.trim();
  const targetName = refs.categoryMergeTarget.value.trim();
  if (!sourceName || !targetName) {
    showAdminMessage("请选择源分类并填写目标分类", true);
    return;
  }

  try {
    const result = await fetchJson("/api/categories/merge", {
      method: "PATCH",
      body: JSON.stringify({ source_name: sourceName, target_name: targetName }),
    });
    refs.categoryMergeTarget.value = "";
    showAdminMessage(`分类已合并，迁移 ${result.moved} 道菜`);
    await reloadAll();
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitCategoryDeleteForm(event) {
  event.preventDefault();
  clearAdminMessage();
  const name = refs.categoryDeleteName.value.trim();
  if (!name) {
    showAdminMessage("当前没有可删空分类", true);
    return;
  }

  try {
    await fetchJson("/api/categories/delete-empty", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    showAdminMessage("空分类已删除");
    await reloadAll();
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitStoreNameForm(event) {
  event.preventDefault();
  clearAdminMessage();

  const storeName = refs.storeNameInput.value.trim();
  if (!storeName) {
    showAdminMessage("店铺名称不能为空", true);
    return;
  }

  try {
    const settings = await fetchJson("/api/settings/store-name", {
      method: "PUT",
      body: JSON.stringify({ store_name: storeName }),
    });
    renderStoreName(settings.store_name);
    showAdminMessage("店铺名称已更新");
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitMenuAdminForm(event) {
  event.preventDefault();
  clearAdminMessage();

  const payload = {
    name: refs.newDishName.value.trim(),
    category: normalizeCategory(refs.newDishCategory.value),
    price: Number(refs.newDishPrice.value || 0),
  };

  try {
    await fetchJson("/api/menu", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    refs.newDishName.value = "";
    refs.newDishCategory.value = payload.category;
    refs.newDishPrice.value = "";
    showAdminMessage("菜品已新增");
    await reloadAll();
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitMenuImportForm(event) {
  event.preventDefault();
  clearAdminMessage();

  const content = refs.menuImportContent.value.trim();
  const replaceAll = refs.menuImportReplace.checked;
  if (!content) {
    showAdminMessage("请先填写导入内容", true);
    return;
  }

  try {
    const result = await fetchJson("/api/menu/import", {
      method: "POST",
      body: JSON.stringify({ content, replace_all: replaceAll }),
    });
    const s = result.summary;
    showAdminMessage(`导入完成：新增 ${s.added}，更新 ${s.updated}，恢复 ${s.restored}`);
    refs.menuImportContent.value = "";
    refs.menuImportReplace.checked = false;
    await reloadAll();
  } catch (error) {
    showAdminMessage(error.message, true);
  }
}

async function submitForm(event) {
  event.preventDefault();
  clearMessage();
  const payload = {
    member_name: refs.memberName.value.trim(),
    contact: refs.contact.value.trim(),
    remark: refs.remark.value.trim(),
    items: collectItemsFromForm(),
  };

  const orderId = refs.orderId.value ? Number(refs.orderId.value) : null;

  try {
    if (orderId) {
      await fetchJson(`/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showMessage("订单已更新");
    } else {
      await fetchJson("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showMessage("订单已提交");
    }

    resetForm({ clearMessage: false });
    await reloadAll();
  } catch (error) {
    showMessage(error.message, true);
  }
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
  refs.categoryCreateForm.addEventListener("submit", submitCategoryCreateForm);
  refs.categoryRenameForm.addEventListener("submit", submitCategoryRenameForm);
  refs.categoryMergeForm.addEventListener("submit", submitCategoryMergeForm);
  refs.categoryDeleteForm.addEventListener("submit", submitCategoryDeleteForm);
  refs.menuImportForm.addEventListener("submit", submitMenuImportForm);
  refs.menuTemplateCsvBtn.addEventListener("click", downloadMenuTemplateCsv);
  refs.menuTemplateTxtBtn.addEventListener("click", downloadMenuTemplateTxt);
}

async function boot() {
  bindEvents();
  switchView(activeView);
  try {
    await reloadAll();
  } catch (error) {
    showMessage(`初始化失败：${error.message}`, true);
  }
}

boot();
