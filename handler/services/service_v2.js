import { yAppWidget } from "../app.js";

export function addSubmitFormEventListener() {
  let button = document.getElementById("btn_store");

  button.addEventListener("click", async event => {
    event.preventDefault();

    const updatedCustomFields = {};
    const updatedTaxonomyV2 = [];
    let requiredButEmptyCheck = false;

    const inputs = document.querySelectorAll("#customForm select, #customForm input");
    inputs.forEach(input => {
       if (!input.id || input.id.trim() === "") {
    return;
  }
      if (input.required) {
        const errorMessageSpan = document.getElementById(input.id + '-error-message');

        if (!input.value) {
          requiredButEmptyCheck = true;
          errorMessageSpan.classList.remove('hidden');
        }
        else {
          errorMessageSpan.classList.add('hidden');
        }
      }

      if (input.id.startsWith('h2')) {
        const level = parseInt(input.id[input.id.length - 1]);
        const chosenOption = input.options[input.selectedIndex];
      } else if (input.type === 'date') {
        // handle date custom field -> add time
        if (input.value) {
          const time = new Date().toISOString().split('T')[1];
          updatedCustomFields[input.id] = input.value + 'T' + time;
        }
   } else {
    const value = input.value.trim();

    if (value === "") {
        if (input.required) {
            requiredButEmptyCheck = true;
            document
                .getElementById(input.id + "-error-message")
                ?.classList.remove("hidden");
        }
        return;
    }

    updatedCustomFields[input.id] = value;
}
})
    
    if (!requiredButEmptyCheck) {
      // Add Team field manually
updatedCustomFields["k19"] = window.PayloadData.customFields.k19;
      console.log(updatedCustomFields);
console.log("Submitting payload:");
console.log(JSON.stringify(updatedCustomFields, null, 2));
      const submittedData = await yAppWidget.update(
        "update_custom_fields",
        updatedCustomFields,
      );

      console.log("custom fields updated", submittedData);
      alert("Data successfully updated.");
    }
  });
}
