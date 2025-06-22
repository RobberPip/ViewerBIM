import { Box, Container, Paper, Typography, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useUnit } from "effector-react";
import { routes } from "~/shared/routing";
import { projectsQuery } from "./model";

const columns: GridColDef[] = [
	{
		field: "name",
		headerName: "Имя проекта",
		headerAlign: "center",
		width: 430,
	},
	{
		field: "updatedAt",
		headerName: "Дата обновления",
		description: "This column has a value getter and is not sortable.",
		sortable: false,
		headerAlign: "center",
		width: 220,
	},
	{
		field: "createdAt",
		headerName: "Дата создания",
		headerAlign: "center",
		width: 220,
	},
	{
		field: "actions",
		headerName: "Действие",
		sortable: false,
		align: "center",
		headerAlign: "center",
		width: 150,
		renderCell: (params) => (
			<Button
				variant="contained"
				color="primary"
				onClick={() => routes.projectsForm.open({ projectId: params.row.id })}
			>
				Открыть
			</Button>
		),
	},
];

const paginationModel = { page: 0, pageSize: 10 };
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const ProjectsPage = () => {
	const projects = useUnit(projectsQuery);
	return (
		<Box>
			<Container sx={{ mt: 4 }} className="!max-w-full">
				<Paper elevation={5} className="!p-10 !rounded-xl">
					<Box className="flex justify-between">
						<Typography variant="h5">Проекты</Typography>
						<Button
							size="small"
							variant="contained"
							color="secondary"
							onClick={() => routes.projectsNew.open()}
							// TODO
							// onClick={() => {
							// 	routes.viewer.open({
							// 		items: [
							// 			"https://thatopen.github.io/engine_components/resources/small.ifc",
							// 			"https://storage.yandexcloud.net/asffs/%D0%9F%D1%80%D0%BE%D0%B5%D0%BA%D1%821.ifc",
							// 		],
							// 	});
							// }}
						>
							Создать новый
						</Button>
					</Box>
					<DataGrid
						rows={projects.data || []}
						columns={columns}
						pageSizeOptions={[10, 25, 50]}
						initialState={{ pagination: { paginationModel } }}
						disableRowSelectionOnClick
						className="!border-0 !mt-2"
					/>
				</Paper>
			</Container>
		</Box>
	);
};
