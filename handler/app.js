import { renderForm } from './components/mainForm.js';
console.log("runRenderForm called");

let JsonData = null;
let PayloadMessage = null;



function runRenderForm() {
    if (JsonData && PayloadMessage) {
        renderForm(JsonData, PayloadMessage);
    }
}
// function runRenderForm() {
//     renderForm(JsonData, PayloadMessage || {});
// } 
document.addEventListener('DOMContentLoaded', () => {
    fetch('./assets/json/customFieldsForDana.json')
        .then(response => response.json())
        .then(jsonData => {
            JsonData = jsonData;
            console.log("JSON Loaded:", jsonData);
            runRenderForm();

            let selectElements = document.querySelectorAll('select');

            selectElements.forEach(function (selectElement) {
                new Choices(selectElement, {
                    searchEnabled: true,
                    shouldSort: false,
                    itemSelectText: '',
                    searchResultLimit: 9999,
                    renderChoiceLimit: -1,
                    removeItemButton: true,
                    allowHTML: false,
                    fuseOptions: {
                        threshold: 0.3
                    } // Enables the search functionality
                });
            });
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

window.addEventListener('message', function(event) {
     console.log('Payload message: ', event.data);
    const messageDisplay = document.getElementById('ticket-title');
    messageDisplay.innerText += ' (#' + event.data.ticketData.ticketId + ')';
console.log("Waiting for payload...");
    PayloadMessage = event.data;

    runRenderForm();
});
