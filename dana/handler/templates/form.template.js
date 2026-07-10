export function generateField(field, isVisible = false, requireds) {
    let fieldHtml = '';
    const visibilityClass = isVisible ? '' : 'hidden';

    if (field.field_type === 'dropdown') {
        fieldHtml += `<div class="field-container ${visibilityClass}" data-level="${field.class_hierarchical_level}">`;
        fieldHtml += `<label for="${field.field_title}">${field.field_title}</label>`;
        fieldHtml += `<select id="${field.field_title}" name="${field.field_title}" class="dynamic-dropdown" data-level="${field.class_hierarchical_level}" select-one>`;
        fieldHtml += `<option value="" disabled selected>Select ${field.field_title}</option>`;
        field.field_value.forEach(option => {
            fieldHtml += `<option value="${option.toLowerCase()}">${option}</option>`;
        });
        fieldHtml += `</select>`;
        fieldHtml += `</div>`;
    } else if (field.field_type === 'text') {
        fieldHtml += `<div class="field-container ${visibilityClass}" data-level="${field.class_hierarchical_level}">`;
        fieldHtml += `<label for="${field.field_title}">${field.field_title}</label>`;
        fieldHtml += `<input type="text" id="${field.field_title}" name="${field.field_title}" placeholder="${field.field_description || field.field_title}" />`;
        fieldHtml += `</div>`;
    } else if (field.field_type === 'date') {
        fieldHtml += `<div class="field-container ${visibilityClass}" data-level="${field.class_hierarchical_level}">`;
        fieldHtml += `<label for="${field.field_title}">${field.field_title}</label>`;
        fieldHtml += `<input type="date" id="${field.field_title}" name="${field.field_title}" />`;
        fieldHtml += `</div>`;
    } else if (field.field_type === 'number') {
        fieldHtml += `<div class="field-container ${visibilityClass}" data-level="${field.class_hierarchical_level}">`;
        fieldHtml += `<label for="${field.field_title}">${field.field_title}</label>`;
        fieldHtml += `<input type="number" id="${field.field_title}" name="${field.field_title}" placeholder="${field.field_title}" />`;
        fieldHtml += `</div>`;
    }

    // Check for nested dynamic fields and add them recursively, initially Hidden
    if (field.dynamic_hierarchical_field && field.dynamic_hierarchical_field.length > 0) {
        fieldHtml += '<div class="nested-fields">';

        field.dynamic_hierarchical_field.forEach(nestedField => {


            (nestedField.field_list_details || []).forEach(child => {
                fieldHtml += generateField(child, false, nestedField.required_fields);
            });

        });

        fieldHtml += '</div>';
    }

    return fieldHtml;
}

export function addDynamicBehavior(formData) {
    console.log("===================== Start addDynamicBehavior =========================")
    const formContainer = document.getElementById('formContainer');

    formContainer.addEventListener('change', (event) => {
        const target = event.target;
        console.log("Change event fired", event.target);

        if (target.classList.contains('dynamic-dropdown')) {
            const selectedValue = target.value;
            const currentLevel = parseInt(target.getAttribute('data-level').replace('l', ''));

            // Clear nested fields below the current level
            clearNestedFields(currentLevel);

            const matchingField = findMatchingField(formData, selectedValue, currentLevel);


            console.log("Matching Field:", matchingField);
            const parentField = target.closest(".field-container");
const nestedContainer = parentField.parentElement.querySelector(":scope > .nested-fields");

            if (matchingField && nestedContainer) {
                // Clear previous nested fields
                nestedContainer.innerHTML = '';

               nestedContainer.innerHTML = "";

matchingField.field_list_details.forEach(field => {
    nestedContainer.insertAdjacentHTML(
        "beforeend",
        generateField(field, true)
    );
});
                

                // Ensure the new dropdown also has event listeners for further nesting
              addDynamicBehavior(formData);

                let selectElements = document.querySelectorAll('select');
                //console.log(selectElements, "selectElement")

                // Loop through each select element and initialize Choices.js with search enabled
                selectElements.forEach(function (selectElement) {
                    console.log(selectElement, "selectElement")
                    new Choices(selectElement, {
                        searchEnabled: true  // Enables the search functionality
                    });
                });
            }
        }
    });

    console.log("===================== End addDynamicBehavior =========================")
}

// Clear nested fields based on the current level
function clearNestedFields(currentLevel) {
    const fieldContainers = document.querySelectorAll('.field-container[data-level]');

    fieldContainers.forEach(container => {
        const level = parseInt(container.getAttribute('data-level').replace('l', ''));
        const nestedContainer = container.nextElementSibling; // Find the nested fields container
        console.log("Nested Container:", nestedContainer);

        // Check if the nested container exists and if its level is greater than the current level
        if (level > currentLevel && nestedContainer) {
            nestedContainer.innerHTML = ''; // Clear nested fields
        }
    });
}

// Find the matching field based on the selected value and hierarchical level
function findMatchingField(formData, selectedValue, currentLevel) {

    if (!formData) {
        return null;
    }

    // Check if this is the current dropdown level
    if (
        formData.class_hierarchical_level &&
        parseInt(formData.class_hierarchical_level.replace('l', '')) === currentLevel
    ) {
        const match = (formData.dynamic_hierarchical_field || []).find(field =>
            field.choosen_value.toLowerCase() === selectedValue.toLowerCase()
        );

        if (match) {
            return match;
        }
    }

    // Search every child in every field_list_details
    for (const dynamicField of (formData.dynamic_hierarchical_field || [])) {

        for (const child of (dynamicField.field_list_details || [])) {

            const result = findMatchingField(
                child,
                selectedValue,
                currentLevel
            );

            if (result) {
                return result;
            }
        }
    }

    return null;
}