import { renderForm } from './components/mainForm.js';
console.log("runRenderForm called");

// let JsonData = null;
// let PayloadMessage = null;



// // function runRenderForm() {
// //     if (JsonData && PayloadMessage) {
// //         renderForm(JsonData, PayloadMessage);
// //     }
// // }
// function runRenderForm() {
//     renderForm(JsonData, PayloadMessage || {});
// } 
// document.addEventListener('DOMContentLoaded', () => {
//     fetch('./assets/json/customFieldsForDana.json')
//         .then(response => response.json())
//         .then(jsonData => {
//             JsonData = jsonData;
//             console.log("JSON Loaded:", jsonData);
//             runRenderForm();

//             let selectElements = document.querySelectorAll('select');

//             selectElements.forEach(function (selectElement) {
//                 new Choices(selectElement, {
//                     searchEnabled: true,
//                     shouldSort: false,
//                     itemSelectText: '',
//                     searchResultLimit: 9999,
//                     renderChoiceLimit: -1,
//                     removeItemButton: true,
//                     allowHTML: false,
//                     fuseOptions: {
//                         threshold: 0.3
//                     } // Enables the search functionality
//                 });
//             });
//         })
//         .catch(error => console.error('Error fetching JSON:', error));
// });

// window.addEventListener('message', function(event) {
//      console.log('Payload message: ', event.data);
//     const messageDisplay = document.getElementById('ticket-title');
//     messageDisplay.innerText += ' (#' + event.data.ticketData.ticketId + ')';
// console.log("Waiting for payload...");
//     PayloadMessage = event.data;

//     runRenderForm();
// });
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
    window.IntentCustomFieldsData &&
    window.TaxonomyV2CustomFieldsData &&
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
  fetch("./assets/json/customFieldsForDana.json")
    .then((response) => response.json())
    .then((intentCustomFieldsData) => {
      window.IntentCustomFieldsData = intentCustomFieldsData;
      runRenderForm();
    })
    .catch((error) => console.error("Error fetching JSON:", error));

  fetch("./assets/json/customFieldsForDana.json")
    .then((response) => response.json())
    .then((defaultFieldsData) => {
      window.DefaultFieldsData = defaultFieldsData;
      runRenderForm();
    })
    .catch((error) => console.error("Error fetching JSON:", error));

  fetch("./assets/json/customFieldsForDana.json")
    .then((response) => response.json())
    .then((taxonomyV2CustomFieldsData) => {
      window.TaxonomyV2CustomFieldsData = taxonomyV2CustomFieldsData;
      runRenderForm();
    })
    .catch((error) => console.error("Error fetching JSON:", error));
});
