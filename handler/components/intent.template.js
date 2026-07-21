import { generateCustomField } from "./util.js";

const INTENT_CUSTOM_FIELD_KEY = 'k49';

export function generateIntent() {
  let fieldHtml = '';

  if (window.IntentCustomFieldsData) {
    const chosenIntent = window?.PayloadData?.customFields?.[INTENT_CUSTOM_FIELD_KEY];

    fieldHtml += generateCustomField(INTENT_CUSTOM_FIELD_KEY, 'intent-container', true);
    fieldHtml += generateIntentCustomFields(chosenIntent);
  }

  return fieldHtml;
}

function generateIntentCustomFields(chosenIntent) {
  let fieldHtml = '';

  window.IntentCustomFieldsData[chosenIntent]?.forEach((cfKey) => {
    fieldHtml += generateCustomField(cfKey, "intent-cf-container");
  });

  return fieldHtml;
}

export function addIntentEventListener() {
  const formContainer = document.getElementById('formContainer');

  formContainer.addEventListener('change', event => {
    const eventTarget = event.target;
    if (eventTarget.id !== INTENT_CUSTOM_FIELD_KEY) return;

    clearIntentCustomFields();

    const eventTargetContainer = eventTarget.closest('.intent-container');
    eventTargetContainer.insertAdjacentHTML('afterend', generateIntentCustomFields(eventTarget.value));

    // hide error message if previously shown
    const errorMessageSpan = document.getElementById('k49-error-message');
    errorMessageSpan.classList.add('hidden');

    let selectElements = document.querySelectorAll("select");
    selectElements.forEach(function (selectElement) {
      if (!selectElement.classList.contains('choices__input')) {
        new Choices(selectElement, { searchEnabled: true });
      }
    });
  });
}

function clearIntentCustomFields() {
  const intentCustomFieldsContainers = document.querySelectorAll('.intent-cf-container');
  intentCustomFieldsContainers.forEach(container => container.remove());
}
