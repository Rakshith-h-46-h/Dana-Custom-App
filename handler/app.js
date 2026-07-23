import { applyDebugState } from "./components/applyDebugState.js";
import { renderForm } from "./components/main_form.js";

export let yAppWidget = null;

(async () => {
  const { YAppWidget } =
    await import("https://cdn.yellowmessenger.com/yapps-sdk/v1.0.0/widget.js");
  yAppWidget = new YAppWidget();
  await applyDebugState(runRenderForm);
  yAppWidget
    .ask("ask_ticket_cf_info")
    .then(async (data) => {
      console.log("got an answer back from cloud for ask_ticket_info", data);

      window.PayloadData = data.eventResponse.eventData.ticketDetails;
      window.PayloadCustomFields = data.eventResponse.eventData.customFields;
      const team = window.PayloadData.customFields.k19;

let fileName = "";

switch (team) {
  case "Fraud":
    fileName = "fraud";
    break;

  case "Channel":
    fileName = "channel";
    break;

  case "Merchant":
    fileName = "merchant";
    break;

  case "Non Fraud":
    fileName = "non-fraud";
    break;

  default:
    console.error("Unknown team:", team);
    return;
}

await loadTeamTemplate(fileName);

console.table(
    window.PayloadCustomFields.map(cf => ({
        key: cf.key,
        name: cf.name
    }))
);
    })
    .catch((e) => {
      console.log("Error while fetching ask_ticket_cf_info", e);
    });
})();

function runRenderForm() {
  const messageDisplay = document.getElementById("ticket-title-forbidden");
  if (
    window.PayloadData &&
    window.PayloadCustomFields
  ) {
    messageDisplay.innerText = '';
    renderForm();

    let selectElements = document.querySelectorAll("select");

    selectElements.forEach(function (selectElement) {
      new Choices(selectElement, {
        searchEnabled: true, // Enables the search functionality
      });
    });
  } else {
    messageDisplay.innerText = "Loading...";
  }
}

export async function loadTeamTemplate(fileName) {
    try {
        const response = await fetch(`./assets/json/${fileName}.json`);

        console.log("Status:", response.status);

        window.DefaultFieldsData = await response.json();

        console.log("Loaded:", window.DefaultFieldsData);

        runRenderForm();   // ✅ only render after JSON is loaded
    } catch (error) {
        console.error(error);
    }
}
