import { generateCustomField } from "./util.js";

export function generateDefaultFields() {
    let fieldHtml = "";

    window.DefaultFieldsData.forEach(defaultField => {
        fieldHtml += generateCustomField(
            defaultField.key,
            "default-field-container",
            defaultField.isRequired
        );
    });

    return fieldHtml;
}
