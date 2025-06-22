import {
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Drawer,
	Box,
	Avatar,
	Typography,
	Divider,
} from "@mui/material";
import { useUnit } from "effector-react";
import { $activeItem, $menuItems, navigate, resetActiveItem } from "./model";
import { Logout } from "@mui/icons-material";
import { $viewer, logout } from "~/shared/auth";
import { useEffect } from "react";

export const ProfileNavbar = () => {
	const items = useUnit($menuItems);
	const activeItem = useUnit($activeItem);
	const username = useUnit(
		$viewer.map((q: { login?: string } | null | undefined) => q?.login ?? ""),
	);
	console.log(username);
	useEffect(() => {
		// Сброс активного элемента при демонтировании компонента
		return () => {
			resetActiveItem();
		};
	}, []);
	return (
		<Drawer
			variant="permanent"
			sx={{
				width: 240,
				".MuiDrawer-paper": {
					width: 240,
					backgroundColor: "#141516",
					color: "#fff",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				},
			}}
		>
			{/* Верхняя часть: профиль и пункты меню */}
			<Box>
				<Box className="flex items-center py-4 px-6">
					<Avatar sx={{ mr: 2 }} />
					<Typography variant="subtitle1">{username}</Typography>
				</Box>
				<Divider />
				<List>
					{items.map((item) => (
						<ListItem className="!px-2" key={item.id} disablePadding>
							<ListItemButton
								selected={
									activeItem?.id === item.id || item.route.$isOpened.getState()
								}
								onClick={() => navigate(item.id)}
							>
								<item.icon className="!mr-2" />
								<ListItemText primary={item.text} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>
			<Box>
				<Divider sx={{ my: 1 }} />
				<List>
					<ListItem className="!px-2" disablePadding>
						<ListItemButton onClick={() => logout()}>
							<Logout className="!mr-2" />
							<ListItemText primary="Выход" />
						</ListItemButton>
					</ListItem>
				</List>
			</Box>
		</Drawer>
	);
};
