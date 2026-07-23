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
    .then((data) => {
      console.log("got an answer back from cloud for ask_ticket_info", data);

      window.PayloadData = data.eventResponse.eventData.ticketDetails;
      window.PayloadCustomFields = data.eventResponse.eventData.customFields;
      console.table(
  window.PayloadCustomFields.map(cf => ({
    key: cf.key,
    name: cf.name
  }))
);
      

      runRenderForm();
    })
    .catch((e) => {
      console.log("Error while fetching ask_ticket_cf_info", e);
    });
})();

function runRenderForm() {
  const messageDisplay = document.getElementById("ticket-title-forbidden");

  if (
    window.DefaultFieldsData &&
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

document.addEventListener("DOMContentLoaded", () => {
  fetch("./assets/json/${fileName}.json")
    .then((response) => response.json())
    .then((defaultFieldsData) => {
      window.DefaultFieldsData = defaultFieldsData;
      runRenderForm();
    })
    .catch((error) => console.error("Error fetching JSON:", error));
});
