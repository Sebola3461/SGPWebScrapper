import fs from "fs";
import dumbcsv from "dumb-csv";
import xlsx from "xlsx";

export type APIParameters = {
  sheetName?: string;
  overwrite?: boolean;
};

export function csvToXlsx(
  csvData: string,
  destination: string,
  { sheetName = "", overwrite = false }: APIParameters = {}
) {
  // get records
  const records = dumbcsv
    .fromCSV({ data: csvData, separator: ";" })
    .toJSON() as any[];

  // prepare the xlsx workbook
  const wb = xlsx.utils.book_new();

  // insert the records as a sheet
  const ws = xlsx.utils.json_to_sheet(records);
  xlsx.utils.book_append_sheet(wb, ws, sheetName);

  // write the xlsx workbook to destination
  xlsx.writeFile(wb, destination);
}
