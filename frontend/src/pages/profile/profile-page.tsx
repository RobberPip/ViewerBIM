import { Avatar, Button, Divider, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
	profileQuery,
	updateProfileForm,
	updateProfileMutation,
} from "./model";
import { useUnit } from "effector-react";

export const ProfilePage = () => {
	const { extendedForm: form } = useUnit(updateProfileForm);
	const { pending } = useUnit(updateProfileMutation);
	const username = useUnit(profileQuery.$data?.map((q) => q.login));
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
			<Box>
				<Container sx={{ mt: 4 }} className="!max-w-full">
					<Paper elevation={5} className="!p-10 !rounded-xl">
						<Box className="flex items-center !mb-8">
							<Avatar className="!h-20 !w-20" />
							<Typography variant="h5" className="!ml-5">
								{username}
							</Typography>
						</Box>
						<Typography variant="h6" className="!mb-0 !font-bold">
							Настройки профиля
							<Typography variant="subtitle2" display="block">
								Настройте профиль под свои потребности
							</Typography>
						</Typography>
						<Divider className="!my-4" />
						<Typography variant="body1" className="!mb-3" display="block">
							Личная информация
						</Typography>
						<Box className="!mb-4" display="flex" gap={1}>
							<form.Field name="firstName">
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
										InputLabelProps={{ shrink: true }}
									/>
								)}
							</form.Field>
							<form.Field name="lastName">
								{(field) => (
									<TextField
										size="small"
										label="Фамилия"
										fullWidth
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										margin="normal"
										error={field.state.meta.errors.length > 0}
										InputLabelProps={{ shrink: true }}
									/>
								)}
							</form.Field>
						</Box>
						<form.Field name="description">
							{(field) => (
								<TextField
									size="small"
									label="Описание"
									multiline
									rows={5}
									fullWidth
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									error={field.state.meta.errors.length > 0}
									InputLabelProps={{ shrink: true }}
								/>
							)}
						</form.Field>
						<Divider className="!my-4" />
						<Typography variant="body1" className="!mb-3" display="block">
							Информация о компании
							<Typography variant="caption" display="block">
								Основные сведения о нашей компании и её деятельности
							</Typography>
						</Typography>
						<Box className="flex items-center">
							<Typography className="!flex-1" variant="body2">
								Укажите адрес официального сайта компании
							</Typography>
							<form.Field name="companyWebsite">
								{(field) => (
									<TextField
										size="small"
										label="Ссылка"
										className="!w-1/2"
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										error={field.state.meta.errors.length > 0}
										InputLabelProps={{ shrink: true }}
									/>
								)}
							</form.Field>
						</Box>
						<Box className="flex justify-end !mt-6">
							<form.Subscribe
								selector={(state) => state.isTouched && state.canSubmit}
								// biome-ignore lint/correctness/noChildrenProp: <explanation>
								children={(canSubmit) => {
									return (
										<Button
											type="submit"
											loading={pending}
											variant="contained"
											color="secondary"
											disabled={!canSubmit}
										>
											Сохранить
										</Button>
									);
								}}
							/>
						</Box>
					</Paper>
				</Container>
			</Box>
		</form>
	);
};
