import { generateField, addDynamicBehavior } from '../templates/form.template.js';
// import PayloadData from '../app.js';

// export function renderForm(formData, payloadData) {
//     const formContainer = document.getElementById('formContainer');
//     let formHtml = '<form id="customForm">';

//     window.PayloadData = payloadData;

//     console.log("window.PayloadData object", window.PayloadData)
//     console.log("formData", formData)

//     // Generate and show the first layer dropdown
//     formHtml += generateField(formData, true, false);


//     formHtml += '<button type="submit">Submit</button>';
//     formHtml += '</form>';

//     formContainer.innerHTML = formHtml;

//     addDynamicBehavior(formData);
// }
export function renderForm(formData, payloadData) {
    const formContainer = document.getElementById('formContainer');
    let formHtml = '<form id="customForm">';

    window.PayloadData = payloadData;

    console.log("formData:", formData);

    const generatedHtml = generateField(formData, true, false);

    console.log("Generated HTML:");
    console.log(generatedHtml);

    formHtml += generatedHtml;

    formHtml += '<button type="submit">Submit</button>';
    formHtml += '</form>';

    console.log("Final HTML:");
    console.log(formHtml);

    formContainer.innerHTML = formHtml;

    console.log("Rendered HTML:");
    console.log(formContainer.innerHTML);

    addDynamicBehavior(formData);
}
