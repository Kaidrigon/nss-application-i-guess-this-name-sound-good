import api from "./api";

// =========================================================
// GET EVENT REPORT
// =========================================================

export const getEventReport = async (eventId) => {
const response = await api.get(
`/reports/event/${eventId}`
);
return response.data;
};
// =========================================================
// DOWNLOAD EVENT EXCEL REPORT
// =========================================================

export const downloadEventExcelReport = async (
eventId
) => {
const response = await api.get(
`/reports/event/${eventId}/excel`,
{
responseType: "blob",
}
);


// -----------------------------------------------------
// TRY TO GET THE FILENAME FROM THE BACKEND
// -----------------------------------------------------

let filename = "NSS_Event_Report.xlsx";

const contentDisposition =
    response.headers["content-disposition"];

if (contentDisposition) {
    const filenameMatch =
        contentDisposition.match(
            /filename="?([^"]+)"?/
        );

    if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
    }
}

// -----------------------------------------------------
// CREATE BROWSER DOWNLOAD
// -----------------------------------------------------

const blob = new Blob(
    [response.data],
    {
        type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
);

const downloadUrl =
    window.URL.createObjectURL(blob);

const link =
    document.createElement("a");

link.href = downloadUrl;
link.download = filename;

document.body.appendChild(link);
link.click();
link.remove();

// -----------------------------------------------------
// CLEAN UP OBJECT URL
// -----------------------------------------------------
window.URL.revokeObjectURL(
    downloadUrl
);
return filename;
};
