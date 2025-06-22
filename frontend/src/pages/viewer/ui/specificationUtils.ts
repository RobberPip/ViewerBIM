export type SortDirection = "asc" | "desc" | null;

export interface RowData {
	id: string;
	[key: string]: string | number | undefined;
}

export const groupRows = (rows: RowData[], selectedFields: string[]) => {
	const sumFields = selectedFields.filter((field) => {
		const val = rows[0]?.[field];
		return !Number.isNaN(Number.parseFloat(String(val)));
	});
	const groupByFields = selectedFields.filter(
		(field) => !sumFields.includes(field),
	);
	const grouped: Record<string, RowData> = {};

	for (const row of rows) {
		const key = groupByFields
			.map((field) => (row[field] ?? "").toString().trim().toLowerCase())
			.join("||");

		if (!grouped[key]) {
			grouped[key] = { ...row };
		} else {
			for (const field of sumFields) {
				const val = row[field];
				const num = Number.parseFloat(String(val).replace(",", "."));
				if (!Number.isNaN(num)) {
					const prevVal = grouped[key][field];
					const prevNum =
						Number.parseFloat(String(prevVal).replace(",", ".")) || 0;
					grouped[key][field] = prevNum + num;
				}
			}
		}
	}

	return Object.values(grouped).map((row, i) => ({
		...row,
		id: (i + 1).toString(),
	}));
};

export const sortRows = (
	rows: RowData[],
	field: string | null,
	direction: SortDirection,
) => {
	if (!field || !direction) return rows;

	return [...rows].sort((a, b) => {
		const aVal = a[field];
		const bVal = b[field];

		const aNum = Number.parseFloat(String(aVal).replace(",", "."));
		const bNum = Number.parseFloat(String(bVal).replace(",", "."));

		let comp = 0;
		if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
			comp = aNum - bNum;
		} else {
			const aStr = (aVal ?? "").toString().toLowerCase();
			const bStr = (bVal ?? "").toString().toLowerCase();
			comp = aStr.localeCompare(bStr);
		}

		return direction === "asc" ? comp : -comp;
	});
};

export const filterRows = (
	rows: RowData[],
	filters: Record<string, string[]>,
) => {
	let filtered = rows;
	for (const field in filters) {
		const allowedValues = filters[field];
		if (allowedValues.length > 0) {
			filtered = filtered.filter((row) => {
				const value = String(row[field] || "");
				return allowedValues.includes(value);
			});
		}
	}
	return filtered;
};
