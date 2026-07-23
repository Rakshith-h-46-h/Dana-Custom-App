export async function loadTeamTemplate(fileName) {
    try {
        const response = await fetch(`./assets/json/${fileName}.json`);

        if (!response.ok) {
            throw new Error(`Cannot load ${fileName}.json`);
        }

        window.DefaultFieldsData = await response.json();

        console.log("Loaded:", fileName);

    } catch (err) {
        console.error(err);
    }
}
