export function generateCustomField(cfKey, containerClassName, isRequired = false) {
  let fieldHtml = '';

  const customField = window?.PayloadCustomFields?.find(cf => cf.key === cfKey);

  if (customField) {
    if (customField.element === 'radiobuttons') fieldHtml += generateDropdownCustomField(customField, containerClassName, isRequired);
    else if (customField.element === 'longText') fieldHtml += generateTextCustomField(customField, containerClassName, isRequired);
    else if (customField.element === 'date') fieldHtml += generateDateCustomField(customField, containerClassName, isRequired);
    else if (customField.element === 'number') fieldHtml += generateNumberCustomField(customField, containerClassName, isRequired);
  }

  return fieldHtml;
}

function generateDropdownCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = '';

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = escapeHtml(customField.name);
  if (isRequired) labelName += " *";

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}"">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<select id="${customField.key}" name="${customField.name}" class="dynamic-dropdown" ${isRequired ? "required" : ""}>`;

  fieldHtml += `<option value="" disabled selected>Select ${escapeHtml(customField.name)}</option>`;
  customField.radiobuttons.forEach((option) => {
    fieldHtml += `<option value="${option}" ${option === ticketCustomFieldValue ? "selected" : ""}>${escapeHtml(option)}</option>`;
  });

  // if the current value is an invalid one: add a disabled option for that value
  // so saving custom form without changing this custom field will still maintain that value
  let isValueInvalid = ticketCustomFieldValue && !customField.radiobuttons.find(option => option === ticketCustomFieldValue);
  if (isValueInvalid) {
    fieldHtml += `<option value="${ticketCustomFieldValue}" selected disabled>${escapeHtml(ticketCustomFieldValue)}</option>`;
  }

  fieldHtml += `</select>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + ' cannot be empty'}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateTextCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = '';

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = escapeHtml(customField.name);
  if (isRequired) labelName += " *";

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<input type="text" id="${customField.key}" name="${customField.name}" placeholder="${customField.name}" value="${ticketCustomFieldValue || ''}" ${isRequired ? "required" : ""}/>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + ' cannot be empty'}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateDateCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = '';

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = customField.name;
  if (isRequired) labelName += " *";

  let formattedDate = '';
  if (ticketCustomFieldValue) {
    const isoDate = new Date(ticketCustomFieldValue);
    formattedDate = isoDate.toISOString().split('T')[0];
  }

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<input type="date" id="${customField.key}" name="${customField.name}" placeholder="${customField.name}" value="${formattedDate}"/>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + ' cannot be empty'}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateNumberCustomField(customField, containerClassName, isRequired) {
  let fieldHtml = '';

  const ticketCustomFieldValue = window?.PayloadData?.customFields?.[customField.key];
  let labelName = customField.name;
  if (isRequired) labelName += " *";

  fieldHtml += `<div id="${customField.key}-container" class="${containerClassName}">`;
  fieldHtml += `<label for="${customField.key}">${labelName}</label>`;
  fieldHtml += `<input type="number" id="${customField.key}" name="${customField.name}" placeholder="${customField.name}" value="${ticketCustomFieldValue || ''}"/>`;
  fieldHtml += `<span id="${customField.key}-error-message" class="error-message hidden">${escapeHtml(customField.name) + ' cannot be empty'}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
