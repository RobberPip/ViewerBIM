import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	IconButton,
	ListItemText,
	MenuItem,
	Popover,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as XLSX from "xlsx";
import { useUnit } from "effector-react";
import { $attributesTable } from "../model";

interface Column {
  field: string;
  headerName: string;
  flex: number;
}

interface RowData {
  id: string;
  [key: string]: string | number | undefined;
}

const isTrulyNumeric = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  const str = val.toString().replace(",", ".").trim();
  return /^-?\d+(\.\d+)?$/.test(str);
};

const groupRows = (rows: RowData[], selectedFields: string[]) => {
  const sumFields = selectedFields.filter((field) =>
    rows.some((row) => isTrulyNumeric(row[field]))
  );

  const groupByField = selectedFields.find(
    (field) => !sumFields.includes(field)
  );

  if (!groupByField) {
    let sumRow: any = {};
    for (const field of sumFields) {
      sumRow[field] = rows.reduce((acc, r) => {
        const val = r[field];
        if (!isTrulyNumeric(val)) return acc;
        const num = parseFloat(val.toString().replace(",", "."));
        return acc + num;
      }, 0);
    }
    return [{ ...sumRow, id: "1" }];
  }

  const grouped: Record<string, RowData> = {};

  for (const row of rows) {
    let keyRaw = row[groupByField];
    const key =
      keyRaw !== undefined && keyRaw !== null && keyRaw.toString().trim() !== ""
        ? keyRaw.toString().trim().toLowerCase().replace(/\s+/g, " ")
        : "—";

    if (!grouped[key]) {
      grouped[key] = { ...row };
      grouped[key][groupByField] =
        keyRaw && keyRaw.toString().trim() !== ""
          ? keyRaw.toString().trim()
          : "—";
    } else {
      for (const field of sumFields) {
        const val = row[field];
        if (!isTrulyNumeric(val)) continue;
        const num = parseFloat(val.toString().replace(",", "."));
        const prevVal = grouped[key][field];
        const prevNum = isTrulyNumeric(prevVal)
          ? parseFloat(prevVal.toString().replace(",", "."))
          : 0;
        grouped[key][field] = prevNum + num;
      }
    }
  }

  return Object.values(grouped).map((row, i) => ({
    ...row,
    id: (i + 1).toString(),
  }));
};

const filterRows = (rows: RowData[], filters: Record<string, string[]>) => {
  if (Object.keys(filters).length === 0) return rows;
  return rows.filter((row) =>
    Object.entries(filters).every(([field, vals]) =>
      vals.length === 0 ? true : vals.includes(String(row[field] ?? ""))
    )
  );
};

const sortRows = (
  rows: RowData[],
  sortBy: string | null,
  sortDirection: "asc" | "desc" | null
) => {
  if (!sortBy || !sortDirection) return rows;
  return [...rows].sort((a, b) => {
    const aVal = a[sortBy] ?? "";
    const bVal = b[sortBy] ?? "";
    if (aVal === bVal) return 0;
    if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });
};

export const SpecificationApp = () => {
  // Определяем дефолтные столбцы как константу компонента
  const defaultColumnsOrder: string[] = ["id", "Код элемента"];
  
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultColumnsOrder); // Инициализируем с дефолтными значениями
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumnsOrder);
  const [tableRows, setTableRows] = useState<RowData[]>([]);
  const [groupBySelected, setGroupBySelected] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [columnSearch, setColumnSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const test = useUnit($attributesTable);  useEffect(() => {
    const rows: Record<string, RowData> = {};
    const columnNames: string[] = ["id"];

    if (!test) {
      setColumns([]);
      setTableRows([]);
      setSelectedColumns(defaultColumnsOrder);
      setColumnOrder(defaultColumnsOrder);
      setFilters({});
      setSortBy(null);
      setSortDirection(null);
      return;
    }const lines = test.split("\n").slice(1);
    lines?.forEach((line) => {
      const parts = line.split("\t");
      if (parts.length < 4) return;
      const id = parts[0].split(".")[0];
      const name = parts[2];
      const value = parts[3];

      if (parts[0].indexOf(".") === -1) {
        rows[id] = { id, "Код элемента": name };
        if (!columnNames.includes("Код элемента")) {
          columnNames.push("Код элемента");
        }
      } else {
        if (!rows[id]) rows[id] = { id };
        if (name && value) {
          rows[id][name] = value;
          if (!columnNames.includes(name)) {
            columnNames.push(name);
          }
        }
      }
    });

    const cols = columnNames.map((field) => ({
      field,
      headerName: field,
      flex: 1,
    }));    setColumns(cols);
    
    // Проверяем, впервые ли загружаются данные
    const isFirstLoad = selectedColumns.length <= defaultColumnsOrder.length;
    
    // Если первая загрузка, используем defaultColumnsOrder
    if (isFirstLoad) {
      const validDefaultColumns = defaultColumnsOrder.filter(col => 
        columnNames.includes(col));
      setSelectedColumns(validDefaultColumns);
      setColumnOrder(validDefaultColumns);
    } else {
      // Сохраняем текущий порядок выбранных столбцов
      const currentSelectedColumns = [...selectedColumns];
      const newColumnOrder = [...currentSelectedColumns];
      
      // Сохраняем только столбцы, которые существуют в данных
      const filteredOrder = newColumnOrder.filter(col => 
        columnNames.includes(col));
      
      setSelectedColumns(filteredOrder);
      setColumnOrder(filteredOrder);
    }
    setTableRows(Object.values(rows));
    setFilters({});
    setSortBy(null);
    setSortDirection(null);
  }, [test]);

  const uniqueValuesForColumn = (field: string) => {
    const values = new Set<string>();
    for (const row of tableRows) {
      const val = row[field];
      if (val !== undefined && val !== null && val !== "")
        values.add(String(val));
    }
    return Array.from(values).sort();
  };

  const toggleFilterValue = (field: string, value: string) => {
    setFilters((prev) => {
      const prevValues = prev[field] || [];
      const newValues = prevValues.includes(value)
        ? prevValues.filter((v) => v !== value)
        : [...prevValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const clearFilter = (field: string) => {
    setFilters((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const onSortClick = (field: string) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDirection("asc");
    } else {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortBy(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    }
  };

  const openFilterPopover = (
    event: React.MouseEvent<HTMLElement>,
    field: string
  ) => {
    setAnchorEl(event.currentTarget);
    setFilterColumn(field);
    setFilterSearch("");
  };

  const closeFilterPopover = () => {
    setAnchorEl(null);
    setFilterColumn(null);
    setFilterSearch("");
  };

  const groupedRows = groupBySelected
    ? groupRows(tableRows, selectedColumns.filter((c) => c !== "id"))
    : tableRows;

  const filteredRows = filterRows(groupedRows, filters);  const displayedRows = sortRows(filteredRows, sortBy, sortDirection);
  const handleExportToExcel = () => {
    // Создаем данные для экспорта, сохраняя порядок столбцов
    const selectedData = displayedRows.map((row) => {
      const rowData: Record<string, any> = {};
      selectedColumns.forEach(key => {
        rowData[key] = row[key];
      });
      return rowData;
    });
    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Specification");
    XLSX.writeFile(wb, "specification.xlsx");
  };

	return (
		<Box
			sx={{
				p: 2,
				color: "white",
				borderRadius: 1,
				display: "flex",
				flexDirection: "column",
				height: "89vh",
				boxSizing: "border-box",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
				<FormControlLabel
					control={
						<Checkbox
							checked={groupBySelected}
							onChange={(e) => setGroupBySelected(e.target.checked)}
							sx={{ color: "white" }}
						/>
					}
					label="Группировать"
					sx={{ m: 0 }}
				/>
				<Button
					variant="contained"
					onClick={handleExportToExcel}
					sx={{ minWidth: 140 }}
				>
					Экспорт в Excel
				</Button>
			</Box>				<Select
				multiple
				value={selectedColumns}
				onChange={(e) => {
					let newSelectedColumns = typeof e.target.value === "string"
						? e.target.value.split(",")
						: e.target.value;
					
					// Гарантируем, что "id" всегда выбран, даже если пользователь его отменил
					if (!newSelectedColumns.includes("id")) {
						newSelectedColumns = ["id", ...newSelectedColumns];
					}
					
					// Сохраняем порядок выбора столбцов пользователем
					// Сначала удаляем столбцы, которые больше не выбраны
					let updatedColumns: string[] = selectedColumns.filter(col => 
						newSelectedColumns.includes(col));
					
					// Добавляем новые выбранные столбцы в конец
					newSelectedColumns.forEach((col) => {
						if (!updatedColumns.includes(col)) {
							updatedColumns.push(col);
						}
					});
					
					setSelectedColumns(updatedColumns);
					// Обновляем порядок столбцов в соответствии с выбранными столбцами
					setColumnOrder(updatedColumns);
				}}
				renderValue={() => <span style={{ color: "white" }}>Столбцы</span>}
				sx={{
					mb: 2,
					minWidth: 300,
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "white",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "white",
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "white",
					},
					color: "white",
				}}
				MenuProps={{
					disableAutoFocusItem: true,
					PaperProps: {
						style: {
							maxHeight: 300,
							maxWidth: 500,
							backgroundColor: "#333",
							color: "white",
						},
					},
				}}
			>
				<MenuItem
					disableRipple
					disableTouchRipple
					disableGutters
					sx={{ padding: 0, width: "100%" }}
				>
					<div
						style={{ padding: "8px 16px", width: "100%" }}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<TextField
							inputRef={searchInputRef}
							size="small"
							fullWidth
							autoFocus
							placeholder="Поиск столбцов..."
							value={columnSearch}
							onChange={(e) => setColumnSearch(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onFocus={(e) => e.stopPropagation()}
							sx={{
								mb: 1,
								"& input": { color: "white" },
								"& fieldset": { borderColor: "gray" },
								width: "100%",
							}}
							InputProps={{ sx: { color: "white" } }}
						/>
					</div>
				</MenuItem>				<MenuItem>
					<Checkbox
						checked={selectedColumns.length === columns.length}
						onChange={(e) => {
							if (e.target.checked) {
								// Сохраняем существующий порядок и добавляем остальные столбцы в конец
								const existingColumns = [...selectedColumns];
								const allColumnFields = columns.map(c => c.field);
								
								// Добавляем в конец столбцы, которых еще нет в выбранных
								allColumnFields.forEach(field => {
									if (!existingColumns.includes(field)) {
										existingColumns.push(field);
									}
								});
								
								setSelectedColumns(existingColumns);
								setColumnOrder(existingColumns); // Обновляем порядок столбцов
							}
							else {
								// При снятии выделения возвращаемся к столбцам по умолчанию
								setSelectedColumns(defaultColumnsOrder);
								setColumnOrder(defaultColumnsOrder); // Обновляем порядок столбцов
							}
						}}
						sx={{ color: "white" }}
					/>
					<ListItemText primary="Выбрать все" sx={{ color: "white" }} />
				</MenuItem>

				{columns
					.filter((col) =>
						col.headerName.toLowerCase().includes(columnSearch.toLowerCase()),
					)
					.map((col) => (
						<MenuItem key={col.field} value={col.field} sx={{ color: "white" }}>
							<Checkbox
								checked={selectedColumns.includes(col.field)}
								sx={{ color: "white" }}
							/>
							<ListItemText primary={col.headerName} />
						</MenuItem>
					))}
			</Select>

			<Box
				sx={{
					flex: 1,
					overflow: "auto",
				}}
			>
				<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							{selectedColumns.map((field) => {
									const col = columns.find((c) => c.field === field);
									if (!col) return null;
									const isSorted = sortBy === col.field;
									return (
										<TableCell
											key={col.field}
											sx={{
												cursor: "pointer",
												userSelect: "none",
												whiteSpace: "nowrap",
											}}
											onClick={() => onSortClick(col.field)}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 0.5,
													transform: "scale(0.8)",
													transformOrigin: "left center",
												}}
											>
												{col.headerName}
												{isSorted && (
													<>
														{sortDirection === "asc" ? (
															<ArrowUpwardIcon fontSize="small" />
														) : (
															<ArrowDownwardIcon fontSize="small" />
														)}
													</>
												)}
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														openFilterPopover(e, col.field);
													}}
												>
													<FilterListIcon fontSize="small" />
												</IconButton>
											</Box>
										</TableCell>
									);
								})}
						</TableRow>
					</TableHead>					<TableBody>
						{displayedRows.map((row) => (
							<TableRow key={row.id}>
								{selectedColumns.map((field) => {
									const cellValue = row[field];
									if (
										field === "Код элемента" &&
										typeof cellValue === "string"
									) {
										const maxLength = 20;
										const displayText =
											cellValue.length > maxLength
												? cellValue.slice(0, maxLength) + "..."
												: cellValue;

										return (
											<TableCell key={field} sx={{ whiteSpace: "nowrap" }}>
												<Tooltip title={cellValue}>
													<Box
														sx={{
															transform: "scale(0.7)",
															transformOrigin: "left center",
															display: "inline-block",
															color: "white",
															cursor:
																cellValue.length > maxLength
																	? "pointer"
																	: "default",
														}}
													>
														{displayText}
													</Box>
												</Tooltip>
											</TableCell>
										);
									}

									return (
										<TableCell key={field} sx={{ whiteSpace: "nowrap" }}>
											<Box
												sx={{
													transform: "scale(0.7)",
													transformOrigin: "left center",
													display: "inline-block",
													color: "white",
												}}
											>
												{cellValue}
											</Box>
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Box>

			{/* Popover для фильтра */}
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={closeFilterPopover}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				PaperProps={{
					sx: { backgroundColor: "#333", color: "white", p: 2, minWidth: 240 },
				}}
			>
				{filterColumn && (
					<>
						<TextField
							size="small"
							fullWidth
							placeholder="Фильтр по значению"
							value={filterSearch}
							onChange={(e) => setFilterSearch(e.target.value)}
							sx={{ mb: 1 }}
							autoFocus
						/>
						<Box sx={{ maxHeight: 220, overflowY: "auto" }}>
							{uniqueValuesForColumn(filterColumn)
								.filter((val) =>
									val.toLowerCase().includes(filterSearch.toLowerCase()),
								)
								.map((val) => (
									<FormControlLabel
										key={val}
										control={
											<Checkbox
												checked={filters[filterColumn]?.includes(val) ?? false}
												onChange={() => toggleFilterValue(filterColumn, val)}
												sx={{ color: "white" }}
											/>
										}
										label={val}
										sx={{ color: "white" }}
									/>
								))}
						</Box>
						<Button
							fullWidth
							size="small"
							onClick={() => clearFilter(filterColumn)}
							sx={{ mt: 1 }}
						>
							Очистить фильтр
						</Button>
					</>
				)}
			</Popover>
		</Box>
	);
};
