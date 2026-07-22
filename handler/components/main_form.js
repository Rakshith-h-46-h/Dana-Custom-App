import {addDefaultFieldsEventListener, generateDefaultFields} from "./default_fields.template.js";
import {addSubmitFormEventListener} from "../services/service_v2.js";

export function renderForm() {
  const formContainer = document.getElementById("formContainer");
  let formHtml = '<form id="customForm">';

  const messageDisplay = document.getElementById("ticket-title");
  messageDisplay.innerText = "Conditional Custom Fields (#" + window.PayloadData.ticketId + ")";

  formHtml += generateDefaultFields();
 

  formHtml += '<button id="btn_store">Submit</button>';
  formHtml += "</form>";

  formContainer.innerHTML = formHtml;

  addDefaultFieldsEventListener();
  

  addSubmitFormEventListener();
}
