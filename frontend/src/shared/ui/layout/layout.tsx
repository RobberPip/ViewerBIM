import clsx from "clsx";
import type React from "react";
import type { ReactNode, CSSProperties } from "react";
import styles from "./layout.module.css";

export const Layout: React.FC<{
	header?: ReactNode;
	footer?: ReactNode;
	sidebar?: ReactNode;
	children: ReactNode;
	className?: string;
	mainClassName?: string;
	sidebarClassName?: string;
	style?: CSSProperties;
}> = ({
	header,
	children,
	footer,
	className,
	mainClassName,
	sidebarClassName,
	style,
	sidebar,
}) => {
	return (
		<div className={`${styles.layout} ${className || ""}`} style={style}>
			<header className="container">{header}</header>
			<aside className={clsx(sidebarClassName)}>{sidebar}</aside>
			<main className={clsx("container", mainClassName)}>{children}</main>
			<footer className="container">{footer}</footer>
		</div>
	);
};
