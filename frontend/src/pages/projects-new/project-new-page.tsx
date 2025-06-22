import {
	Container,
	Paper,
	Typography,
	TextField,
	Button,
	Box,
} from "@mui/material";
import { routes } from "~/shared/routing";
import { projectAddForm } from "./model";
import { useUnit } from "effector-react";

export const ProjectsNewPage = () => {
	const { extendedForm: form } = useUnit(projectAddForm);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			onKeyDown={(e) => {
				if (e.code === "Enter") {
					e.preventDefault();
				}
			}}
		>
			<Container sx={{ mt: 4 }} className="!max-w-full">
				<Paper elevation={5} className="!p-10 !rounded-xl">
					<Typography variant="h5" className="!mb-5">
						Создание проекта
					</Typography>
					<form.Field name="name">
						{(field) => (
							<TextField
								size="small"
								label="Имя"
								fullWidth
								className="!mb-4"
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								margin="normal"
								error={field.state.meta.errors.length > 0}
							/>
						)}
					</form.Field>
					<form.Field name="description">
						{(field) => (
							<TextField
								size="small"
								label="Описание"
								multiline
								rows={5}
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								error={field.state.meta.errors.length > 0}
								fullWidth
								className="!mb-4"
							/>
						)}
					</form.Field>
					<Box className="flex justify-end" gap={2}>
						<Button
							variant="outlined"
							type="reset"
							color="secondary"
							onClick={() => {
								routes.projects.open();
								form.reset();
							}}
						>
							Отмена
						</Button>
						<form.Subscribe>
							<Button variant="contained" type="submit" color="secondary">
								Создать
							</Button>
						</form.Subscribe>
					</Box>
				</Paper>
			</Container>
		</form>
	);
};
