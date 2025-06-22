import { Container, Box, Typography, TextField, Button } from "@mui/material";
import { signUpForm } from "../model";
import { useUnit } from "effector-react";

export const SignUp = () => {
	const { extendedForm: form } = useUnit(signUpForm);
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
			<Container
				maxWidth="sm"
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<Box
					sx={{
						p: 3,
						boxShadow: 3,
						borderRadius: 2,
						width: "100%",
						maxWidth: 400,
					}}
				>
					<Typography variant="h5" className="text-white" gutterBottom>
						Регистрация
					</Typography>
					<form.Field name="email">
						{(field) => (
							<TextField
								fullWidth
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								margin="normal"
								label="Email"
								error={field.state.meta.errors.length > 0}
								required
							/>
						)}
					</form.Field>
					<form.Field name="password">
						{(field) => (
							<TextField
								fullWidth
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								margin="normal"
								label="Пароль"
								error={field.state.meta.errors.length > 0}
								required
							/>
						)}
					</form.Field>
					<form.Subscribe>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							fullWidth
							sx={{ mt: 2 }}
						>
							Зарегистрироваться
						</Button>
					</form.Subscribe>
				</Box>
			</Container>
		</form>
	);
};
