import { renderForm } from './components/mainForm.js';

let JsonData = null;
let PayloadMessage = null;

// function runRenderForm() {
//     if (JsonData && PayloadMessage) {
//         renderForm(JsonData, PayloadMessage);
//     }
// }
function runRenderForm() {
    renderForm(JsonData, PayloadMessage || {});
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('./assets/json/customFieldsForDana.json')
        .then(response => response.json())
        .then(jsonData => {
            JsonData = jsonData;  

            runRenderForm();

            let selectElements = document.querySelectorAll('select');

            selectElements.forEach(function (selectElement) {
                new Choices(selectElement, {
                    searchEnabled: true  // Enables the search functionality
                });
            });
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

// window.addEventListener('message', function(event) {
//     // console.log('Payload message: ', event.data);
//     const messageDisplay = document.getElementById('ticket-title');
//     messageDisplay.innerText += ' (#' + event.data.ticketData.ticketId + ')';

//     PayloadMessage = event.data; 

//     runRenderForm();
// });
