import { type ReactNode, useMemo, useRef } from "react";
import { Layout } from "../layout";
import { ProfileNavbar } from "~/widgets/profile-navbar";

export const ProfileLayout: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	//const path = useUnit(router.$path);
	const containerRef = useRef<HTMLDivElement | null>(null);
	// TODO pending view
	//const { error, pending } = useUnit(profileQuery);

	// TODO scroll hack
	//   useEffect(() => {
	//     if (containerRef.current) {
	//       containerRef.current.parentElement!.scrollTop = 0;
	//     }
	//   }, [path]);

	const pageView = useMemo(() => {
		// if (pending) {
		//   console.log('PENDING');

		//   return (
		//     <div className="card flex justify-content-center align-items-center h-screen">
		//       <ProgressSpinner />
		//     </div>
		//   );
		// }

		// if (error) {
		//   return 'TODO: error view';
		// }

		return children;
		//   }, [pending, error, children]);
	}, [children]);

	return (
		<Layout sidebar={<ProfileNavbar />}>
			<div ref={containerRef} className="mt-4 mr-7">
				{pageView}
			</div>
		</Layout>
	);
};
