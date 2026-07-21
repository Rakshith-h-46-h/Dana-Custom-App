export async function applyDebugState(runRenderForm) {
  try {
    if (
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
    ) {
      return;
    }
    const response = await fetch("./dist/mockData.json");
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    const ticketDetails = data?.eventResponse?.eventData?.ticketDetails;
    const customFields = data?.eventResponse?.eventData?.customFields;
    if (!ticketDetails) {
      return;
    }
    console.log("Applying debug state...");

    window.PayloadData = ticketDetails;
    window.PayloadCustomFields = customFields;
    window.LastLevel = false;
    window.ListCustomFields = [];
    window.initialLoad = true;
    window.searchResult = {};

    runRenderForm();
  } catch (error) {
    console.log(error);
  }
}
