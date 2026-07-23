import { generateCustomField } from "./util.js";
import { loadTeamTemplate } from "../app.js";

const TEAM_CF_KEY = "k19";

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

export function addDefaultFieldsEventListener() {
    const formContainer = document.getElementById("formContainer");

    formContainer.addEventListener("change", async (event) => {
        const eventTarget = event.target;

        if (eventTarget.id !== TEAM_CF_KEY) return;

        switch (eventTarget.value) {
            case "Channel":
                await loadTeamTemplate("channel");
                break;

            case "Fraud":
                await loadTeamTemplate("fraud");
                break;

            case "Merchant":
                await loadTeamTemplate("merchant");
                break;

            case "Non Fraud":
                await loadTeamTemplate("non-fraud");
                break;
        }
    });
}
