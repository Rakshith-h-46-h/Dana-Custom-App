import {generateCustomField} from "./util.js";
const TEAM_CF_KEY = "k19";


export function generateDefaultFields() {
  let fieldHtml = '';

  window.DefaultFieldsData.forEach(defaultField => {
    fieldHtml += generateCustomField(defaultField.key, "default-field-container", defaultField.isRequired);
  })

  return fieldHtml;
}

function generateChannelCustomFields() {
  let fieldHtml = '';
  return fieldHtml;
}

export function addDefaultFieldsEventListener() {
  const formContainer = document.getElementById('formContainer');

formContainer.addEventListener("change", async (event) => {
    const eventTarget = event.target;

    if (eventTarget.id !== "k19") return;

    switch (eventTarget.value) {
        case "Channel":
            await loadTeamTemplate("channel.json");
            break;

        case "Fraud":
            await loadTeamTemplate("fraud.json");
            break;

        case "Merchant":
            await loadTeamTemplate("merchant.json");
            break;

        case "Non Fraud":
            await loadTeamTemplate("non-fraud.json");
            break;
    }
});
}
