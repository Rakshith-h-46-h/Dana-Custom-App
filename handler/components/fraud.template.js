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
