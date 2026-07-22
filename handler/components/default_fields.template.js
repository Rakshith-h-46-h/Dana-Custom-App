import {generateCustomField} from "./util.js";



export function generateDefaultFields() {
  let fieldHtml = '';

  window.DefaultFieldsData.forEach(defaultField => {
    fieldHtml += generateCustomField(defaultField.key, "default-field-container", defaultField.isRequired);

    if (defaultField.key === CHANNEL_CF_KEY) fieldHtml += generateChannelCustomFields();
  })

  return fieldHtml;
}

function generateChannelCustomFields() {
  let fieldHtml = '';

  const chosenChannel = window?.PayloadData?.customFields?.['k44'];

  // when chosen channel is 'Cabang', generate 'Cabang Penerima' additional custom field
  if (chosenChannel === 'Cabang') {
    fieldHtml += generateCustomField(CABANG_PENERIMA_CF_KEY, 'branch-container');
  }

  return fieldHtml;
}

export function addDefaultFieldsEventListener() {
  const formContainer = document.getElementById('formContainer');

  formContainer.addEventListener('change', event => {
    const eventTarget = event.target;
    const eventDefaultFieldContainer = eventTarget.closest('.default-field-container');

    if (!eventDefaultFieldContainer) return;

    // hide error message if previously shown
    const errorMessageSpan = document.getElementById(eventTarget.id + '-error-message');
    errorMessageSpan.classList.add('hidden');

    if (eventTarget.id !== CHANNEL_CF_KEY) return;

    // generate/remove Channel custom fields
    const eventContainer = eventTarget.closest('.default-field-container');

    if (eventTarget.value !== 'Cabang') {
      // when changes to other than 'Cabang' remove 'Cabang Penerima' custom field
      const branchContainer = document.querySelector('.branch-container');
      branchContainer?.remove();
    } else {
      // when changes to 'Cabang' generate 'Cabang Penerima' custom field
      eventContainer.insertAdjacentHTML('afterend', generateCustomField(CABANG_PENERIMA_CF_KEY, 'branch-container'));
    }
  });
}
