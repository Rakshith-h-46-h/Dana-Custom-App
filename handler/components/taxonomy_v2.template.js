import { escapeHtml, generateCustomField } from "./util.js";

export function generateTaxonomyV2() {
  let fieldHtml = '';

  const ticketTaxonomyV2 = window?.PayloadData?.customFields?.['h2'];
  const taxonomyV2Config = window?.PayloadCustomFields?.find(item => item.key === 'h2');

  if (taxonomyV2Config && window.TaxonomyV2CustomFieldsData) {
    let lastLevel;
    let lastOptionId;

    // generate chosen taxonomy levels

    ticketTaxonomyV2?.forEach((ticketOption, level) => {
      const optionConfig = taxonomyV2Config.options[level].find(option => option.id === ticketOption.id);

      fieldHtml += generateTaxonomyV2Dropdown(level, optionConfig.parent, taxonomyV2Config, ticketOption.name);

      lastLevel = level;
      lastOptionId = ticketOption.id;
    });

    // find out whether the chosen taxonomy has a next level
    let nextLevel;
    let nextLevelParentId;

    if (lastLevel === undefined) {
      // lastLevel undefined -> next is l0
      nextLevel = 0;
      nextLevelParentId = 'null';
    }
    // l3 is the outmost level, so if lastLevel === 3 -> no next level
    else if (lastLevel < 3) {
      // find out whether the last option has a child
      const child = taxonomyV2Config.options[lastLevel + 1].find(option => option.parent === lastOptionId);
      if (child) {
        nextLevel = lastLevel + 1;
        nextLevelParentId = lastOptionId;
      }
    }

    if (nextLevel >= 0) {
      fieldHtml += generateTaxonomyV2Dropdown(nextLevel, nextLevelParentId, taxonomyV2Config);
    } else {
      fieldHtml += generateTaxonomyV2CustomFields(lastOptionId);
    }
  }

  return fieldHtml;
}

function generateTaxonomyV2Dropdown(level, parentId, taxonomyV2Config, chosenOption) {
  let fieldHtml = '';

  const levelName = taxonomyV2Config.levels[level];
  const levelOptions = taxonomyV2Config.options[level];

  fieldHtml += `<div id="h2-l${level}-container" class="taxonomy-v2-container" data-taxonomy-v2-level="${level}">`;
  fieldHtml += `<label for="h2-l${level}">${escapeHtml(levelName)} *</label>`;

  fieldHtml += `<select id="h2-l${level}" name="${levelName}" class="dynamic-dropdown" required>`;
  fieldHtml += `<option value="" disabled selected>Select ${escapeHtml(levelName)}</option>`;
  levelOptions.forEach(option => {
    if (option.parent === parentId) {
      fieldHtml += `<option value="${option.name}" ${option.name === chosenOption ? "selected" : "" } data-taxonomy-v2-option-id="${option.id}">${escapeHtml(option.name)}</option>`;
    }
  })

  fieldHtml += `</select>`;
  fieldHtml += `<span id="h2-l${level}-error-message" class="error-message hidden">${escapeHtml(levelName) + ' cannot be empty'}</span>`;
  fieldHtml += `</div>`;

  return fieldHtml;
}

function generateTaxonomyV2CustomFields(lastLevelId) {
  const yellowCustomFields = window?.PayloadCustomFields;

  let fieldHtml = '';

  let taxonomyCustomFields = [];
  window.TaxonomyV2CustomFieldsData[lastLevelId]?.forEach(cfKey => {
    taxonomyCustomFields.push(yellowCustomFields.find(cf => cf.key === cfKey));
  });

  taxonomyCustomFields.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  taxonomyCustomFields.forEach(cf => {
    fieldHtml += generateCustomField(cf.key, "taxonomy-v2-cf-container");
  });

  return fieldHtml;
}

export function addTaxonomyV2EventListener() {
  const formContainer = document.getElementById('formContainer');

  formContainer.addEventListener('change', event => {
    const eventTarget = event.target;
    const eventTaxonomyContainer = eventTarget.closest('.taxonomy-v2-container');

    if (!eventTaxonomyContainer) return;

    const eventTaxonomyLevel = parseInt(eventTaxonomyContainer.getAttribute('data-taxonomy-v2-level'));

    clearTaxonomyV2(eventTaxonomyLevel);

    const taxonomyV2Config = window.PayloadCustomFields.find(item => item.key === 'h2');
    const chosenOption = eventTarget.options[eventTarget.selectedIndex];
    const chosenOptionId = chosenOption.getAttribute('data-taxonomy-v2-option-id');

    const hasNextLevel = doesTargetHaveNextTaxonomyLevel(eventTaxonomyLevel, chosenOptionId, taxonomyV2Config);
    if (hasNextLevel) {
      // if target has next level, generate the next taxonomy level
      eventTaxonomyContainer.insertAdjacentHTML('afterend', generateTaxonomyV2Dropdown(eventTaxonomyLevel+1, chosenOptionId, taxonomyV2Config));
    } else {
      // if not, generate the taxonomy custom fields
      eventTaxonomyContainer.insertAdjacentHTML('afterend', generateTaxonomyV2CustomFields(chosenOptionId));
    }

    // hide error message if previously shown
    const errorMessageSpan = document.getElementById(eventTarget.id + '-error-message');
    errorMessageSpan.classList.add('hidden');

    let selectElements = document.querySelectorAll("select");
    selectElements.forEach(function (selectElement) {
      if (!selectElement.classList.contains('choices__input')) {
        new Choices(selectElement, { searchEnabled: true });
      }
    });
  })
}

function clearTaxonomyV2(eventTaxonomyLevel) {
  // remove taxonomy levels greater than the event target
  const taxonomyContainers = document.querySelectorAll('.taxonomy-v2-container');
  taxonomyContainers.forEach(container => {
    const containerLevel = container.getAttribute('data-taxonomy-v2-level');
    if (containerLevel > eventTaxonomyLevel) container.remove();
  });

  // remove all custom fields
  const customFieldContainers = document.querySelectorAll('.taxonomy-v2-cf-container');
  customFieldContainers.forEach(container => container.remove());
}

function doesTargetHaveNextTaxonomyLevel(eventTaxonomyLevel, chosenOptionId, taxonomyV2Config) {
  if (eventTaxonomyLevel === 3) {
    // lowest level is l3: cannot have next level
    return false;
  }

  const child = taxonomyV2Config.options[eventTaxonomyLevel + 1].find(option => option.parent === chosenOptionId);
  return !!child;
}
