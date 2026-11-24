const choicesInstances = new WeakMap();

export function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """)
    .replaceAll("'", "'");
}

export function initChoicesOnSelect(select) {
  if (!select || typeof Choices === "undefined") return;

  const existing = choicesInstances.get(select);
  if (existing && typeof existing.destroy === "function") {
    existing.destroy();
    choicesInstances.delete(select);
  }

  try {
    const instance = new Choices(select, {
      searchEnabled: true,
      shouldSort: false,
      itemSelectText: "",
      searchResultLimit: 9999,
      renderChoiceLimit: -1,
      removeItemButton: true,
      allowHTML: false,
      fuseOptions: {
        threshold: 0.3
      }
    });
    choicesInstances.set(select, instance);
  } catch (err) {
    console.warn("Choices init skipped for select:", select.id, err);
  }
}

function normalizeOption(item) {
  if (typeof item === "string" || typeof item === "number") {
    return { id: String(item), name: String(item), parent: "" };
  }
  const id = String(item?.id ?? item?.value ?? item?.name ?? "");
  const name = String(item?.name ?? item?.label ?? id);
  const parent = item?.parent !== undefined && item?.parent !== null ? String(item.parent) : "";
  return { id, name, parent };
}

function getHierarchyMap(cfKey, customField) {
  // 1. Prefer fraud.json hierarchy map (keyed by cfKey or top-level hierarchy)
  const jsonHierarchy = window?.DefaultFieldsData?.hierarchy;
  if (jsonHierarchy && typeof jsonHierarchy === "object") {
    if (jsonHierarchy[cfKey] && typeof jsonHierarchy[cfKey] === "object") {
      return jsonHierarchy[cfKey];
    }
    return jsonHierarchy;
  }

  // 2. Fallback: build map from customField.options if provided as [products, classifications, subclassifications]
  if (Array.isArray(customField?.options) && customField.options.length >= 2) {
    const map = {};
    const products = Array.isArray(customField.options[0]) ? customField.options[0].map(normalizeOption) : [];
    const classifications = Array.isArray(customField.options[1]) ? customField.options[1].map(normalizeOption) : [];
    const subclassifications = Array.isArray(customField.options[2]) ? customField.options[2].map(normalizeOption) : [];

    products.forEach((prod) => {
      map[prod.name] = {};
      classifications
        .filter((cls) => !cls.parent || cls.parent === prod.id || cls.parent === prod.name)
        .forEach((cls) => {
          map[prod.name][cls.name] = subclassifications
            .filter((sub) => !sub.parent || sub.parent === cls.id || sub.parent === cls.name)
            .map((sub) => sub.name);
        });
    });

    return map;
  }

  return {};
}

export function getProductsForField(cfKey) {
  const customField = window?.PayloadCustomFields?.find((cf) => cf.key === cfKey);
  const map = getHierarchyMap(cfKey, customField);
  return Object.keys(map).map((productName) => ({ id: productName, name: productName }));
}

export function getClassificationsForProduct(cfKey, selectedProduct) {
  if (!selectedProduct) return [];
  const customField = window?.PayloadCustomFields?.find((cf) => cf.key === cfKey);
  const map = getHierarchyMap(cfKey, customField);
  const byProduct = map[selectedProduct];
  if (!byProduct || typeof byProduct !== "object") return [];
  return Object.keys(byProduct).map((clsName) => ({ id: clsName, name: clsName }));
}

export function getSubclassificationsForSelection(cfKey, selectedProduct, selectedClassification) {
  if (!selectedProduct || !selectedClassification) return [];
  const customField = window?.PayloadCustomFields?.find((cf) => cf.key === cfKey);
  const map = getHierarchyMap(cfKey, customField);
  const subs = map?.[selectedProduct]?.[selectedClassification];
  if (!Array.isArray(subs)) return [];
  return subs.map((item) => normalizeOption(item));
}

function populateSelectOptions(selectEl, placeholderText, items, selectedValue = "") {
  const optionsHtml = [
    `<option value="" disabled ${!selectedValue ? "selected" : ""}>${escapeHtml(placeholderText)}</option>`,
    ...items.map((item) => {
      const opt = normalizeOption(item);
      const isSelected = selectedValue && String(opt.id) === String(selectedValue) ? "selected" : "";
      return `<option value="${escapeHtml(opt.id)}" ${isSelected}>${escapeHtml(opt.name)}</option>`;
    })
  ].join("");

  selectEl.innerHTML = optionsHtml;
}

export function generateProductHierarchyField(cfKey, containerClassName = "", isRequired = false) {
  const customField = window?.PayloadCustomFields?.find((cf) => cf.key === cfKey);
  if (!customField) return "";

  const reqAttr = isRequired ? "required" : "";
  const labelText = `${escapeHtml(customField.name)}${isRequired ? " *" : ""}`;
  const products = getProductsForField(cfKey);

  // Optional pre-populated value from ticket payload (e.g. ["Prod A", "Class A1", "Sub A1-1"] or { product, classification, subclassification })
  const rawSaved = window?.PayloadData?.customFields?.[cfKey];
  let savedProduct = "";
  let savedClassification = "";
  let savedSubclassification = "";

  if (Array.isArray(rawSaved)) {
    savedProduct = rawSaved[0] ?? "";
    savedClassification = rawSaved[1] ?? "";
    savedSubclassification = rawSaved[2] ?? "";
  } else if (rawSaved && typeof rawSaved === "object") {
    savedProduct = rawSaved.product ?? rawSaved[0] ?? "";
    savedClassification = rawSaved.classification ?? rawSaved[1] ?? "";
    savedSubclassification = rawSaved.subclassification ?? rawSaved[2] ?? "";
  } else if (typeof rawSaved === "string") {
    savedProduct = rawSaved;
  }

  const classifications = savedProduct ? getClassificationsForProduct(cfKey, savedProduct) : [];
  const subclassifications =
    savedProduct && savedClassification
      ? getSubclassificationsForSelection(cfKey, savedProduct, savedClassification)
      : [];

  const showClassification = Boolean(savedProduct) && classifications.length > 0;
  const showSubclassification = showClassification && Boolean(savedClassification) && subclassifications.length > 0;

  let html = `<div id="${escapeHtml(cfKey)}-container" class="${escapeHtml(containerClassName)} product-hierarchy-wrapper" data-cf-key="${escapeHtml(cfKey)}">`;
  html += `<div class="hierarchy-group-label">${labelText}</div>`;

  // 1. Product
  html += `
    <div id="${escapeHtml(cfKey)}-product-box" class="hierarchy-step" data-step="product">
      <label for="${escapeHtml(cfKey)}_product">Product${isRequired ? " *" : ""}</label>
      <select id="${escapeHtml(cfKey)}_product" name="${escapeHtml(cfKey)}_product" class="dynamic-dropdown hierarchy-product" ${reqAttr}>
        ${buildOptionListHtml("Select Product", products, savedProduct)}
      </select>
    </div>
  `;

  // 2. Classification (shown after Product is selected)
  html += `
    <div id="${escapeHtml(cfKey)}-classification-box" class="hierarchy-step ${showClassification ? "" : "hidden"}" data-step="classification">
      <label for="${escapeHtml(cfKey)}_classification">Classification${isRequired ? " *" : ""}</label>
      <select id="${escapeHtml(cfKey)}_classification" name="${escapeHtml(cfKey)}_classification" class="dynamic-dropdown hierarchy-classification" ${showClassification ? "" : "disabled"} ${reqAttr}>
        ${buildOptionListHtml("Select Classification", classifications, savedClassification)}
      </select>
    </div>
  `;

  // 3. Subclassification (shown after Classification is selected)
  html += `
    <div id="${escapeHtml(cfKey)}-subclassification-box" class="hierarchy-step ${showSubclassification ? "" : "hidden"}" data-step="subclassification">
      <label for="${escapeHtml(cfKey)}_subclassification">Subclassification${isRequired ? " *" : ""}</label>
      <select id="${escapeHtml(cfKey)}_subclassification" name="${escapeHtml(cfKey)}_subclassification" class="dynamic-dropdown hierarchy-subclassification" ${showSubclassification ? "" : "disabled"} ${reqAttr}>
        ${buildOptionListHtml("Select Subclassification", subclassifications, savedSubclassification)}
      </select>
    </div>
  `;

  html += `<span id="${escapeHtml(cfKey)}-error-message" class="error-message hidden">${escapeHtml(customField.name)} cannot be empty</span>`;
  html += `</div>`;

  return html;
}

function buildOptionListHtml(placeholderText, items, selectedValue = "") {
  return [
    `<option value="" disabled ${!selectedValue ? "selected" : ""}>${escapeHtml(placeholderText)}</option>`,
    ...items.map((item) => {
      const opt = normalizeOption(item);
      const isSelected = selectedValue && String(opt.id) === String(selectedValue) ? "selected" : "";
      return `<option value="${escapeHtml(opt.id)}" ${isSelected}>${escapeHtml(opt.name)}</option>`;
    })
  ].join("");
}

export function bindProductHierarchyEvents(rootContainer = document.getElementById("formContainer")) {
  if (!rootContainer || rootContainer.dataset.hierarchyBound === "true") return;
  rootContainer.dataset.hierarchyBound = "true";

  rootContainer.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;

    const wrapper = target.closest(".product-hierarchy-wrapper");
    if (!wrapper) return;

    const cfKey = wrapper.dataset.cfKey;
    const classBox = wrapper.querySelector(`#${CSS.escape(cfKey)}-classification-box`);
    const classSelect = wrapper.querySelector(`#${CSS.escape(cfKey)}_classification`);
    const subBox = wrapper.querySelector(`#${CSS.escape(cfKey)}-subclassification-box`);
    const subSelect = wrapper.querySelector(`#${CSS.escape(cfKey)}_subclassification`);

    if (target.classList.contains("hierarchy-product")) {
      const selectedProduct = target.value;
      const classifications = getClassificationsForProduct(cfKey, selectedProduct);

      // Reset subclassification whenever product changes
      if (subSelect && subBox) {
        subSelect.disabled = true;
        populateSelectOptions(subSelect, "Select Subclassification", []);
        initChoicesOnSelect(subSelect);
        subBox.classList.add("hidden");
      }

      // Show & populate classification for selected product
      if (classSelect && classBox) {
        const hasClassifications = Boolean(selectedProduct) && classifications.length > 0;
        populateSelectOptions(classSelect, "Select Classification", classifications);
        classSelect.disabled = !hasClassifications;
        classBox.classList.toggle("hidden", !hasClassifications);
        initChoicesOnSelect(classSelect);
      }
    } else if (target.classList.contains("hierarchy-classification")) {
      const productSelect = wrapper.querySelector(`#${CSS.escape(cfKey)}_product`);
      const selectedProduct = productSelect?.value || "";
      const selectedClassification = target.value;
      const subclassifications = getSubclassificationsForSelection(
        cfKey,
        selectedProduct,
        selectedClassification
      );

      // Show & populate subclassification for selected classification
      if (subSelect && subBox) {
        const hasSubclassifications = Boolean(selectedClassification) && subclassifications.length > 0;
        populateSelectOptions(subSelect, "Select Subclassification", subclassifications);
        subSelect.disabled = !hasSubclassifications;
        subBox.classList.toggle("hidden", !hasSubclassifications);
        initChoicesOnSelect(subSelect);
      }
    }
  });
}

export function generateCustomField(cfKey, containerClassName, isRequired = false) {
  let fieldHtml = "";

  const customField = window?.PayloadCustomFields?.find((cf) => cf.key === cfKey);

  if (customField) {
    if (customField.element === "radiobuttons") fieldHtml += generateDropdownCustomField(customField, containerClassName, isRequired);
    else if (customField.element === "longText") fieldHtml += generateTextCustomField(customField, containerClassName, isRequired);
    else if (customField.element === "date") fieldHtml += generateDateCustomField(customField, containerClassName, isRequired);
    else if (customField.element === "number") fieldHtml += generateNumberCustomField(customField, containerClassName, isRequired);
    else if (customField.element === "shortText") fieldHtml += generateTextCustomField(customField, containerClassName, isRequired);
    else if (
      customField.element === "hierarchicalCustomField" ||
      customField.element === "productHierarchy"
    ) {
      fieldHtml += generateProductHierarchyField(cfKey, containerClassName, isRequired);
    }
  }

  return fieldHtml;
}

function generateDropdownCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = "";

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = escapeHtml(customField.name);
  if (isRequired) labelName += " *";

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<select id="${customField.key}" name="${customField.name}" class="dynamic-dropdown" ${isRequired ? "required" : ""}>`;

  fieldHtml += `<option value="" disabled selected>Select ${escapeHtml(customField.name)}</option>`;
  customField.radiobuttons.forEach((option) => {
    fieldHtml += `<option value="${option}" ${option === ticketCustomFieldValue ? "selected" : ""}>${escapeHtml(option)}</option>`;
  });

  const isValueInvalid =
    ticketCustomFieldValue &&
    !customField.radiobuttons.find((option) => option === ticketCustomFieldValue);
  if (isValueInvalid) {
    fieldHtml += `<option value="${ticketCustomFieldValue}" selected disabled>${escapeHtml(ticketCustomFieldValue)}</option>`;
  }

  fieldHtml += `</select>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + " cannot be empty"}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateTextCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = "";

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = escapeHtml(customField.name);
  if (isRequired) labelName += " *";

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<input type="text" id="${customField.key}" name="${customField.name}" placeholder="${customField.name}" value="${ticketCustomFieldValue || ""}" ${isRequired ? "required" : ""}/>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + " cannot be empty"}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateDateCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = "";

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = customField.name;
  if (isRequired) labelName += " *";

  let formattedDate = "";
  if (ticketCustomFieldValue) {
    const isoDate = new Date(ticketCustomFieldValue);
    formattedDate = isoDate.toISOString().split("T")[0];
  }

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<input type="date" id="${customField.key}" name="${customField.name}" placeholder="${customField.name}" value="${formattedDate}"/>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + " cannot be empty"}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateNumberCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = "";

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = customField.name;
  if (isRequired) labelName += " *";

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<input type="number" id="${customField.key}" name="${customField.name}" placeholder="${customField.name}" value="${ticketCustomFieldValue || ""}"/>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + " cannot be empty"}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}
