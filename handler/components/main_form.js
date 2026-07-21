import {generateTaxonomyV2, addTaxonomyV2EventListener} from "./taxonomy_v2.template.js?t=1781172527";
import {generateIntent, addIntentEventListener} from "./intent.template.js?t=1781172527";
import {addDefaultFieldsEventListener, generateDefaultFields} from "./default_fields.template.js?t=1781172527";
import {addSubmitFormEventListener} from "../services/service_v2.js?t=1781172527";

export function renderForm() {
  const formContainer = document.getElementById("formContainer");
  let formHtml = '<form id="customForm">';

  const messageDisplay = document.getElementById("ticket-title");
  messageDisplay.innerText = "Conditional Custom Fields (#" + window.PayloadData.ticketId + ")";

  formHtml += generateDefaultFields();
  formHtml += generateIntent();
  formHtml += generateTaxonomyV2();

  formHtml += '<button id="btn_store">Submit</button>';
  formHtml += "</form>";

  formContainer.innerHTML = formHtml;

  addDefaultFieldsEventListener();
  addIntentEventListener();
  addTaxonomyV2EventListener();

  addSubmitFormEventListener();
}
