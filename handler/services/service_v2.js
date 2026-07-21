import { yAppWidget } from "../app.js?t=1781172527";

export function addSubmitFormEventListener() {
  let button = document.getElementById("btn_store");

  button.addEventListener("click", async event => {
    event.preventDefault();

    const updatedCustomFields = {};
    const updatedTaxonomyV2 = [];
    let requiredButEmptyCheck = false;

    const inputs = document.querySelectorAll('#customForm select.choices__input, #customForm input:not(.choices__input)');
    inputs.forEach(input => {
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
        // h2 -> taxonomy v2
        const level = parseInt(input.id[input.id.length - 1]);
        const chosenOption = input.options[input.selectedIndex];

        updatedTaxonomyV2[level] = {
          name: chosenOption.value,
          id: chosenOption.getAttribute('data-taxonomy-v2-option-id'),
        };
      } else if (input.type === 'date') {
        // handle date custom field -> add time
        if (input.value) {
          const time = new Date().toISOString().split('T')[1];
          updatedCustomFields[input.id] = input.value + 'T' + time;
        }
      } else if (input.type === 'number') {
        // handle number custom field -> parse value to number
        if (input.value) {
          updatedCustomFields[input.id] = parseInt(input.value);
        }
      } else {
        // else -> regular custom field
        updatedCustomFields[input.id] = input.value;
      }
    });

    updatedCustomFields['h2'] = updatedTaxonomyV2;

    if (!requiredButEmptyCheck) {
      console.log(updatedCustomFields);

      const submittedData = await yAppWidget.update(
        "update_custom_fields",
        updatedCustomFields,
      );

      console.log("custom fields updated", submittedData);
      alert("Data successfully updated.");
    }
  });
}
