import type { Components } from "@thatopen/components";
import settings from "../../../widgets/components/Panels/Settings.ts";
import * as BUI from "@thatopen/ui";
import projectInformation from "../../../widgets/components/Panels/ProjectInformation.tsx";
import {
	$openedIssueFile,
	aiChatMutation,
	deleteIssueMutation,
	issuesMetaQuery,
	openIssue,
} from "../model.ts";
import { jsonModelsBlobs } from "../viewer-page.tsx";
import * as OBC from "@thatopen/components";
import { createRoot } from "react-dom/client";
import {
	Box,
	Button,
	TextField,
	List,
	ListItem,
	Card,
	CardActions,
	CardContent,
	Typography,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useUnit } from "effector-react";
import { components, highlighter, Models} from "~/shared/lib/untils.ts";

const AiChat = () => {
	const [messages, setMessages] = useState<string[]>([]);
	const [input, setInput] = useState("");
	const listRef = useRef<HTMLUListElement | null>(null);

	const handleSend = () => {
	const trimmedInput = input.trim();
	if (trimmedInput && jsonModelsBlobs.length > 0) {
		setMessages((prev) => [...prev, trimmedInput]);
		setInput("");
		const formData = new FormData();
		formData.append("prompt", trimmedInput);
		for (const { name, blob } of jsonModelsBlobs) {
			formData.append("files", blob, name);
		}
		aiChatMutation.start(formData);
	}
};


	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				width: "100%",
				backgroundColor: "black",
				color: "white",
				boxSizing: "border-box",
				padding: 2,
			}}
		>
			<Box
				sx={{
					flexGrow: 1,
					overflowY: "auto",
				}}
			>
				<List ref={listRef} sx={{ display: "flex", flexDirection: "column" }}>
					{messages.map((msg, idx) => (
						<ListItem
							key={idx}
							sx={{ color: "white", wordBreak: "break-word" }}
						>
							{msg}
						</ListItem>
					))}
				</List>
			</Box>

			<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
				<TextField
					fullWidth
					variant="outlined"
					placeholder="Введите сообщение..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSend();
					}}
					InputProps={{ style: { color: "white" } }}
					InputLabelProps={{ style: { color: "white" } }}
					sx={{
						"& .MuiOutlinedInput-root": {
							"& fieldset": { borderColor: "white" },
							"&:hover fieldset": { borderColor: "#ccc" },
							"&.Mui-focused fieldset": { borderColor: "white" },
						},
					}}
				/>
				<Button variant="contained" onClick={handleSend}>
					Отправить
				</Button>
				{/* <Button
					variant="contained"
					onClick={() => {
						const bcfTopics = components.get(OBC.BCFTopics);

						const input = document.createElement("input");
						input.multiple = false;
						input.accept = ".bcf";
						input.type = "file";

						input.addEventListener("change", async () => {
							const file = input.files?.[0];
							if (!file) return;

							const buffer = await file.arrayBuffer();
							await bcfTopics.load(new Uint8Array(buffer), WorldModel.value);
							console.log(bcfTopics);
							// Пример получения viewpoint из загруженных топиков
							for (const topic of bcfTopics.list.values()) {
								const viewpoints = await topic.viewpoints.values();

								for (const vp of viewpoints) {
									console.log(vp);
								}
							}
							const viewpoints = components.get(OBC.Viewpoints);
							for (const topic of viewpoints.list.values()) {
								topic.go();
							}
						});

						input.click();
					}}
				>
					Тест
				</Button>
				<Button
					variant="contained"
					onClick={async () => {
						const bcfTopics = components.get(OBC.BCFTopics);
						bcfTopics.setup({
							author: "signed.user@mail.com",
							types: new Set(["Information", "Coordination"]),
							statuses: new Set([
								"Active",
								"In Progress",
								"Done",
								"In Review",
								"Closed",
							]),
							users: new Set(["juan.hoyos4@gmail.com"]),
						});

						const viewpoints = components.get(OBC.Viewpoints);

						// Создаём тему
						const topic = bcfTopics.create({
							title: "Example Topic",
							description: "Check this area",
							type: "Information",
							assignedTo: "juan.hoyos4@gmail.com",
						});

						// Создаём viewpoint
						const viewpoint = viewpoints.create(WorldModel.value, {
							title: topic.title,
						});

						topic.viewpoints.add(viewpoint.guid);

						// Добавляем комментарий и связываем его с viewpoint
						const comment = topic.createComment("This needs attention.");
						comment.viewpoint = viewpoint;

						// Экспортируем BCF
						const bcf = await bcfTopics.export();
						const bcfFile = new File([bcf], "topics.bcf");
						const a = document.createElement("a");
						a.href = URL.createObjectURL(bcfFile);
						a.download = bcfFile.name;
						a.click();
						URL.revokeObjectURL(a.href);
					}}
				>
					Создать
				</Button> */}
			</Box>
		</Box>
	);
};
export const Issues = () => {
  const issues = useUnit(issuesMetaQuery.$data);
  const openedIssueFile = useUnit($openedIssueFile);

  const [openedIssueId, setOpenedIssueId] = useState<string | null>(null);
  const [topic, setTopic] = useState<OBC.Topic | null>(null);

  const bcfTopics = components.get(OBC.BCFTopics);
  const worlds = components.get(OBC.Worlds);
  const world = worlds.list.values().next().value;

  useEffect(() => {
    if (!openedIssueFile) {
      setTopic(null);
      setOpenedIssueId(null);
      return;
    }

    if (!world) {
      console.error("World not found");
      return;
    }

    const loadTopic = async () => {
      try {
        const buffer = await openedIssueFile.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        setTopic(null);
        bcfTopics.dispose();
        bcfTopics.load(uint8Array, world);

        setTimeout(() => {
          const firstTopic = bcfTopics.list?.values?.().next()?.value;
          if (firstTopic) {
            setTopic(firstTopic);
            setOpenedIssueId(firstTopic.guid || null);
          } else {
            console.warn("BCF файл не содержит топиков");
            setOpenedIssueId(null);
          }
        }, 100);
      } catch (error) {
        console.error("Ошибка при загрузке issue:", error);
        setTopic(null);
        setOpenedIssueId(null);
      }
    };

    loadTopic();
  }, [openedIssueFile, world, bcfTopics]);

  const onOpenIssue = (issueId: string) => {
    openIssue({ issueId });
  };

  if (openedIssueId && topic) {
    // Получаем viewpoint для кнопок
    const topicViewpointGuid = topic?.viewpoints?.values()?.next()?.value;
    const viewpoints = components.get(OBC.Viewpoints);
    const currentViewpoint = Array.from(viewpoints.list.values()).find(vp => vp.guid === topicViewpointGuid);

    // Проверяем, есть ли у viewpoint selectionComponents
    const hasSelectionComponents = !!(currentViewpoint && currentViewpoint.selectionComponents && currentViewpoint.selectionComponents.size > 0);


    return (
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            setOpenedIssueId(null);
            setTopic(null);
          }}
        >
          Назад к списку
        </Button>

        <Box sx={{ mt: 2, color: "white" }}>
          <Typography variant="h5">{topic.title || "Без имени"}</Typography>
          <Typography>ID: {openedIssueId}</Typography>
          <Typography>Описание: {topic.description || "—"}</Typography>
          <Typography>Автор: {topic.assignedTo || "—"}</Typography>
          <Typography>
            Дата создания:{" "}
            {topic.creationDate ? new Date(topic.creationDate).toLocaleString() : "—"}
          </Typography>
          <Typography>Приоритет: {topic.priority || "—"}</Typography>
          <Typography>Статус: {topic.status || "—"}</Typography>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (!currentViewpoint) {
                  console.warn("Viewpoint в topic не найден");
                  return;
                }
                currentViewpoint.go();
              }}
            >
              Камера
            </Button>

            <Button
              variant="contained"
              color="primary"
              disabled={!hasSelectionComponents}
              onClick={() => {
                if (!currentViewpoint) {
                  console.warn("Viewpoint в topic не найден");
                  return;
                }

                for (const model of Models) {
                  const fragments = model.getFragmentMap(currentViewpoint.selectionComponents as unknown as number[]);
                  highlighter.highlightByID("select", fragments, false, false);
                }
              }}
            >
              Элементы
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      {!issues || issues.length === 0 ? (
        <Typography color="text.secondary">Нет ишью</Typography>
      ) : (
        issues.map((issue, i) => (
          <Card key={issue.id} variant="outlined" sx={{ bgcolor: "#333", color: "white" }}>
            <CardContent>
              <Typography variant="h6">
                Issue #{i + 1} - {issue.title}
              </Typography>
              <Typography variant="body2">ID: {issue.id}</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => onOpenIssue(issue.id)}
              >
                Открыть
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  deleteIssueMutation.start({ issueId: issue.id });
                }}
              >
                Удалить
              </Button>
            </CardActions>
          </Card>
        ))
      )}
    </Box>
  );
};

// Обёртка для рендера React-компонента в контейнер с id
export const leftPanelUi = (components: Components) => {
	let rootAichat: ReturnType<typeof createRoot> | null = null;
	let rootIssues: ReturnType<typeof createRoot> | null = null;

	requestAnimationFrame(() => {
		const containerAichat = document.getElementById("react-aichat");
		if (containerAichat && !rootAichat) {
			rootAichat = createRoot(containerAichat);
			rootAichat.render(<AiChat />);
		}

		const containerIssues = document.getElementById("react-issues");
		if (containerIssues && !rootIssues) {
			rootIssues = createRoot(containerIssues);
			rootIssues.render(<Issues />);
		}
	});

	const projectInformationPanel = projectInformation(components);

	return BUI.Component.create(() => {
		return BUI.html`
      <bim-tabs switchers-full>
        <bim-tab name="project" label="Project" icon="ph:building-fill">
          ${projectInformationPanel}
        </bim-tab>
        <bim-tab name="settings" label="Settings" icon="solar:settings-bold">
          ${settings(components)}
        </bim-tab>
        <bim-tab name="issues" label="Issues" icon="mdi:bug">
          <div id="react-issues" style="width: 100%; height: 100%;"></div>
        </bim-tab>
        <bim-tab name="aichat" label="Ai chat" icon="ph:star-four">
          <div id="react-aichat" style="width: 100%; height: 100%;"></div>
        </bim-tab>
      </bim-tabs>
    `;
	});
};
