import {
	Container,
	Box,
	Typography,
	TextField,
	Button,
	FormControlLabel,
	Checkbox,
	IconButton,
	InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useUnit } from "effector-react";
import { loginForm } from "../model";
import { routes } from "~/shared/routing";
import { useState } from "react";

export const SignIn = () => {
	const { extendedForm: form } = useUnit(loginForm);
	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

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
						Вход
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
								error={field.state.meta.errors.length > 0}
								label="Email"
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
								error={field.state.meta.errors.length > 0}
								label="Пароль"
								required
								type={showPassword ? "text" : "password"}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={togglePasswordVisibility}
												edge="end"
											>
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						)}
					</form.Field>
					<form.Field name="rememberMe">
						{(field) => (
							<FormControlLabel
								control={
									<Checkbox
										checked={field.state.value}
										onChange={(e) => field.handleChange(e.target.checked)}
										name={field.name}
										color="primary"
									/>
								}
								className="text-white"
								label="Запомнить меня"
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
							Войти
						</Button>
					</form.Subscribe>
					<Button
						type="button"
						variant="contained"
						color="primary"
						fullWidth
						onClick={() => routes.auth.signUp.open()}
						sx={{ mt: 2 }}
					>
						Зарегистрироваться
					</Button>
				</Box>
			</Container>
		</form>
	);
};
