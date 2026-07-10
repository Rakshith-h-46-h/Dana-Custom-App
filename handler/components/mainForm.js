import { generateField, addDynamicBehavior } from '../templates/form.template.js';
// import PayloadData from '../app.js';

export function renderForm(formData, payloadData) {
    const formContainer = document.getElementById('formContainer');
    let formHtml = '<form id="customForm">';

    window.PayloadData = payloadData;

    console.log("window.PayloadData object", window.PayloadData)
    console.log("formData", formData)

    // Generate and show the first layer dropdown
    formHtml += generateField(formData, true, false);


    formHtml += '<button type="submit">Submit</button>';
    formHtml += '</form>';

    formContainer.innerHTML = formHtml;

    addDynamicBehavior(formData);
}