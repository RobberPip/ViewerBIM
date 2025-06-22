import { useCallback, useState } from "react";
import {
	Container,
	Paper,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Checkbox,
	ListItemText,
	OutlinedInput,
	Button,
	Box,
	Table,
	Tab,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDropzone } from "react-dropzone";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ru } from "date-fns/locale";
import { useUnit } from "effector-react";
import { addIfcMutation, addUserMutation, projectQuery } from "./model";
import { routes } from "~/shared/routing";

const ALL_OPTION = "all";

export const ProjectsFormPage = () => {
	const projectData = useUnit(projectQuery.$data);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [tab, setTab] = useState("1");
	const rawLoadDates = projectData?.loaders?.map((q) => q.createdAt) ?? [];
	const allowedDates = rawLoadDates
		.filter((dateStr): dateStr is string => dateStr !== undefined)
		.map((dateStr) => new Date(dateStr))
		.filter((date) => !Number.isNaN(date.getTime()));

	const isDateAllowed = (date: Date) =>
		allowedDates.some(
			(allowed) =>
				allowed.getFullYear() === date.getFullYear() &&
				allowed.getMonth() === date.getMonth() &&
				allowed.getDate() === date.getDate(),
		);

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const handleProjectsChange = (event: any) => {
		const value = event.target.value as string[];
		if (value.includes(ALL_OPTION)) {
			setSelectedProjects([ALL_OPTION]);
		} else {
			setSelectedProjects(value);
		}
	};

	const isAllSelected = selectedProjects.includes(ALL_OPTION);

	const filteredLoaders =
		projectData?.loaders?.filter((loader) => {
			if (!selectedDate || !loader.createdAt) return false;
			const loaderDate = new Date(loader.createdAt);
			return (
				loaderDate.getFullYear() === selectedDate.getFullYear() &&
				loaderDate.getMonth() === selectedDate.getMonth() &&
				loaderDate.getDate() === selectedDate.getDate()
			);
		}) ?? [];

	const selectedLinks = (
		isAllSelected
			? filteredLoaders.map((loader) => loader.linkIFC)
			: filteredLoaders
					.filter(
						(loader) => loader.name && selectedProjects.includes(loader.name),
					)
					.map((loader) => loader.linkIFC)
	).filter((link): link is string => typeof link === "string");

	return (
		<Container sx={{ mt: 4 }} className="!max-w-full">
			<Paper elevation={5} className="!p-10 !rounded-xl">
				<Typography variant="h5" className="!mb-5">
					{projectData?.name}
				</Typography>
				<Typography variant="subtitle1" className="!mb-5">
					Ключ загрузки: {projectData?.loadKey}
				</Typography>
				<Box className="flex">
					<Box>
						<LocalizationProvider
							dateAdapter={AdapterDateFns}
							adapterLocale={ru}
						>
							<DatePicker
								label="Выберите дату"
								value={selectedDate}
								onChange={(newValue) => {
									setSelectedDate(newValue);
									setSelectedProjects([]);
								}}
								shouldDisableDate={(date) => !isDateAllowed(date)}
							/>
						</LocalizationProvider>

						<FormControl className="!w-100" disabled={!selectedDate}>
							<InputLabel id="project-select-label">Выгрузки</InputLabel>
							<Select
								labelId="project-select-label"
								multiple
								value={selectedProjects}
								onChange={handleProjectsChange}
								input={<OutlinedInput label="Выгрузки" />}
								renderValue={(selected) =>
									isAllSelected
										? "Все выгрузки"
										: filteredLoaders
												.filter(
													(loader) =>
														loader.name && selected.includes(loader.name),
												)
												.map((loader) => loader.name)
												.join(", ")
								}
							>
								<MenuItem value={ALL_OPTION}>
									<Checkbox checked={isAllSelected} />
									<ListItemText primary="Все выгрузки" />
								</MenuItem>
								{filteredLoaders.map((loader) => (
									<MenuItem
										key={loader.name || "unknown"}
										value={loader.name || "unknown"}
										disabled={isAllSelected}
									>
										<Checkbox
											checked={
												loader.name
													? selectedProjects.includes(loader.name)
													: false
											}
										/>
										<ListItemText primary={loader.name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
					<Button
						className="!ml-10 !h-10 !self-center !flex-wrap"
						variant="contained"
						color="primary"
						disabled={selectedLinks.length === 0}
						onClick={() => {
						
							if (projectData?.id) {
								routes.viewer.open({
									items: selectedLinks,
									projectId: projectData.id,
								});
							}
						}}
					>
						Открыть в Viewer
					</Button>
				</Box>
				<TabContext value={tab}>
					<Box className="!mt-5 border-b border-gray-500">
						<TabList
							onChange={(event: React.SyntheticEvent, newValue: string) =>
								setTab(newValue)
							}
							aria-label="lab API tabs example"
						>
							<Tab label="Пользователи" value="1" />
							<Tab label="создать выгрузку" value="2" />
						</TabList>
					</Box>
					<TabPanel className="!px-0" value="1">
						{(projectData?.users ?? []).length > 0 && (
							<Box>
								<Box className="flex justify-between items-center mb-3">
									<Typography variant="h6">Пользователи проекта</Typography>
									<Button
										className="!h-10"
										variant="contained"
										color="secondary"
										onClick={() => {
											if (projectData?.id) {
												addUserMutation.start({ projectId: projectData.id });
											}
										}}
									>
										Пригласить
									</Button>
								</Box>

								<TableContainer component={Paper}>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell>ID</TableCell>
												<TableCell>Логин</TableCell>
												<TableCell>Имя</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{projectData?.users?.map((user) => (
												<TableRow key={user.id}>
													<TableCell>{user.id}</TableCell>
													<TableCell>{user.login}</TableCell>
													<TableCell>
														{user.firstName} {user.lastName}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
						)}
					</TabPanel>
					<TabPanel className="!px-0" value="2">
						{projectData?.id && <FileDropZone projectId={projectData.id} />}
					</TabPanel>
				</TabContext>
			</Paper>
		</Container>
	);
};

export const FileDropZone = ({ projectId }: { projectId: string }) => {
	const onDropIfc = useCallback(
		(acceptedFiles: File[]) => {
			if (!acceptedFiles || acceptedFiles.length === 0) return;

			addIfcMutation.start({
				projectId,
				files: acceptedFiles,
			});
		},
		[projectId],
	);

	const dropzoneIfc = useDropzone({
		onDrop: onDropIfc,
		accept: { "model/ifc": [".ifc"] },
		multiple: true,
	});

	return (
		<Box display="flex" gap={4} flexWrap="wrap">
			<Paper
				{...dropzoneIfc.getRootProps()}
				className="border-2 border-dashed border-blue-400 p-4 text-center cursor-pointer w-full"
			>
				<input {...dropzoneIfc.getInputProps()} />
				<CloudUploadIcon className="!text-[40px] text-blue-400" />
				<Typography variant="h6" mt={1} className="text-blue-400">
					Загрузить .ifc файлы
				</Typography>
				<Typography variant="body2" color="textSecondary">
					Перетащите .ifc файлы сюда или кликните для выбора
				</Typography>
			</Paper>
		</Box>
	);
};
