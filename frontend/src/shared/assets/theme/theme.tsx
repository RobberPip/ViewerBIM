import { createTheme } from "@mui/material";
import "~/shared/assets/theme/componets/button.css";
import "~/shared/assets/theme/componets/textFiled.css";

export const theme = createTheme({
	palette: {
		mode: "dark",
		secondary: {
			main: "#5e6ad2",
		},
	},
});
