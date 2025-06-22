import { CardMedia } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ContainerScroll } from "~/shared/ui/container-scroll-animation";
import { Highlight } from "~/shared/ui/hero-highlight";
import { Spotlight } from "~/shared/ui/spotlight";
import ImageArch from "~/shared/assets/arch.jpg";
import ImageIssue from "~/shared/assets/Issue.jpg";
import ImageSpec from "~/shared/assets/spec.jpg";
import { $authorized} from "~/shared/auth";
import { routes } from "~/shared/routing";
import { WobbleCard } from "~/shared/ui/wobble-card";

export const RootPage = () => {
	return (
		<Box className="flex justify-center items-center flex-col">
			<div className="!m-30 !mb-42">
				<Spotlight className="md:-top-60 md:left-20 scale-100" fill="white" />
				<div className="max-w-6xl !mt-20 text-center">
					<h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
						<Highlight className="text-black dark:text-white">
							BIMLine
						</Highlight>
						- система хранения и просмотра данных цифровых информационных
						моделей.
					</h1>
					<div className="!mt-10 flex justify-center gap-4">
						
						{/* <Button color="secondary" size="large" className="hover:scale-105">
							Читать обновления
						</Button> */}
					</div>
				</div>
			</div>
			<Box
				className="w-full flex-col !mt-20 flex justify-center items-center text-white py-20 relative"
				sx={{ backgroundColor: "#141516" }}
			>
				<div className="flex flex-col md:flex-row items-center text-center md:text-left w-full px-6 md:px-12">
					<div className="2xl:!mx-40 !mx-20">
						<h2 className="text-4xl font-bold mb-4">
							Получите максимум BIMLine
						</h2>
						<p className="text-lg text-gray-300">
							Загрузите свой проект и начните работать с цифровыми
							<br />
							моделями без лишних сложностей.
							<br /> Удобная интеграция и простота использования.
						</p>
						<Button
							variant="contained"
							color="primary"
							size="large"
							className="!mt-5 bg-gradient-to-r from-blue-500 to-purple-700  hover:scale-105"
							onClick={() =>
								$authorized ? routes.profile.open() : routes.auth.signIn.open()
							}
						>
							Начать сейчас
						</Button>
					</div>
					<div className="md:w-1/2 relative flex justify-center">
						<ContainerScroll
							titleComponent={
								<div>
									<h1 className="text-4xl font-semibold">
										Используй уже сейчас <br />
										<span className="text-4xl 2xl:text-[6rem] md:text-[5rem] font-bold mt-1 leading-none">
											Viewer модели
										</span>
									</h1>
								</div>
							}
						>
							<CardMedia
								component="img"
								image={ImageArch}
								alt="Example"
							/>
						</ContainerScroll>
						
					</div>
				</div>
				<div className="w-full flex justify-start mb-4">
				<span className="!ml-77 !mb-10 text-4xl 2xl:text-[5rem] md:text-[5rem] font-bold mt-1 leading-none">
					Главные преимущества
				</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full items-stretch">
			<WobbleCard
						containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-purple-800 via-purple-600 to-purple-700 min-h-[500px] lg:min-h-[300px]">
						<div className="max-w-xs">
						<h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
							Формирование спецификацей
						</h2>
						<p className="mt-4 text-left  text-base/6 text-neutral-200">
							Попробуйте собрать все элементы в спецификацию, выбрав нужные параметры и сгруппировав. Таблицу можно экспортировать в Excel
						</p>
						</div>
						<img
						src={ImageSpec}
						width={400}
						height={150}
						alt="linear demo image"
						className="absolute lg:-right-[-0%] filter -bottom-70 object-contain rounded"
						/>
					</WobbleCard>

				<WobbleCard
					containerClassName="col-span-1 min-h-[300px] flex flex-col justify-between bg-gradient-to-br from-purple-900 via-purple-700 to-purple-800">
					<div>
					<h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
						Поддержка Ai инструментов
					</h2>
					<p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
						Попробуйте совершать выборку элементов через обычное написание запросов, AI-агент сделает всю работу за вас
					</p>
					</div>
				</WobbleCard>

				<WobbleCard
					containerClassName="col-span-1 lg:col-span-3 min-h-[300px] flex flex-col justify-between bg-gradient-to-br from-indigo-800 via-blue-800 to-indigo-900 relative">
					<div className="max-w-sm">
					<h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
						Работа с Issue
					</h2>
					<p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
						Попробуйте сделать выборку элементов и создать Issue для сохранения положения камеры и выборки элементов для последующей передачи другим пользователям проекта
					</p>
					</div>
					<img
					src={ImageIssue}
					width={325}
					height={500}
					alt="linear demo image"
					className="absolute right-0 bottom-0 object-contain rounded"
					/>
				</WobbleCard>
				</div>

			</Box>
		</Box>
	);
};
