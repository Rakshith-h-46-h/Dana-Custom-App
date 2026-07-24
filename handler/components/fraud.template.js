import { generateCustomField } from "./util.js";

export function generateDefaultFields() {
    let fieldHtml = "";

   if (!window.DefaultFieldsData) {
    console.log("DefaultFieldsData not loaded");
    return "";
}

window.DefaultFieldsData.defaultFields.forEach(defaultField => {
        fieldHtml += generateCustomField(
            defaultField.key,
            "default-field-container",
            defaultField.isRequired
        );
    });

    return fieldHtml;
}
export function generateCaseFields(selectedCase) {
    let fieldHtml = "";

    const caseFields = window.DefaultFieldsData.cases[selectedCase];

    if (!caseFields) return "";

    caseFields.forEach(field => {
        fieldHtml += generateCustomField(
            field.key,
            "case-field-container",
            field.isRequired
        );
    });

    return fieldHtml;
}
export function addDefaultFieldsEventListener() {
    const formContainer = document.getElementById("formContainer");

    formContainer.addEventListener("change", (event) => {

        // Case dropdown
        if (event.target.id !== "k7") return;

        const selectedCase = event.target.value;

        // Remove previous case fields
        document.querySelectorAll(".case-field-container").forEach(el => el.remove());

        // Generate new case fields
        const caseHtml = generateCaseFields(selectedCase);

        // Insert below the Case dropdown
        event.target
            .closest(".default-field-container")
            .insertAdjacentHTML("afterend", caseHtml);
    });
}
