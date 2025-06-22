import { RouterProvider } from "atomic-router-react";
import { router } from "../shared/routing.ts";
import { appStarted } from "../shared/config.ts";
import { Pages } from "../pages/index.ts";
import { ThemeProvider } from "@mui/material";
import { theme } from "~/shared/assets/theme/theme.tsx";

appStarted();

export const App = () => {
	return (
		<RouterProvider router={router}>
			<ThemeProvider theme={theme}>
				<Pages />
			</ThemeProvider>
		</RouterProvider>
	);
};
