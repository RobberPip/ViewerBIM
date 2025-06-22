import { useUnit } from "effector-react";
import { SignIn } from "./ui/sign-in";
import { loginRoute } from "./model";
import { SignUp } from "./ui/sign-up";

export const LoginPage = () => {
	const isLogin = useUnit(loginRoute.$isOpened);
	return isLogin ? <SignIn /> : <SignUp />;
};
