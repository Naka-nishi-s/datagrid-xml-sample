"use client";

import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import { parseStringPromise } from "xml2js";

const FileUploadAndDisplay: React.FC = () => {
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files) {
      return;
    }

    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const xml = e.target?.result;
        if (typeof xml === "string") {
          const result = await parseStringPromise(xml);
          const jsonData = result.root.data;

          const cols: GridColDef[] = [
            { field: "id", headerName: "ID", width: 70 },
            ...Object.keys(jsonData[0]).map((key) => ({
              field: key,
              headerName: key,
              width: 150,
            })),
          ];
          setColumns(cols);

          const rowsData: GridRowsProp = jsonData.map(
            (item: any, index: number) => ({
              id: index + 1,
              ...item,
            })
          );
          setRows(rowsData);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdate = async () => {
    const updatedData = rows.map((row) => {
      const newRow = { ...row };
      delete newRow.id;
      return newRow;
    });

    try {
      await axios.post("/api/save", { columns, rows: updatedData });
      alert("XMLファイルを保存しました");
    } catch (error) {
      console.error("XMLファイルの保存に失敗しました:", error);
      alert("XMLファイルの保存に失敗しました");
    }
  };

  return (
    <div style={{ height: 400, width: "100%" }}>
      <input type="file" id="file" onChange={handleFileChange} />
      <button type="button" onClick={handleUpdate}>
        更新
      </button>
      {rows.length > 0 && <DataGrid rows={rows} columns={columns} />}
    </div>
  );
};

export default FileUploadAndDisplay;
