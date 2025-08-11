import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const exportToExcel = (selectedRows, compName) => {
  if (selectedRows.length === 0) {
    toast.warning("Please select atleast one row to export!");
    return;
  }

  // Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(selectedRows);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

  // Generate buffer and save
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, compName + ".xlsx");
  toast.success("Successfully exported the file. Please check your downloads.");
};

export default exportToExcel;
