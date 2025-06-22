import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import * as OBC from "@thatopen/components";
import { components, highlighter } from "~/shared/lib/untils";
import { useUnit } from "effector-react";
import { $viewer, viewerQuery } from "~/shared/auth";
import { $projectId, addIssueMutation } from "~/pages/viewer";

interface ModalIssueProps {
  open: boolean;
  onClose: () => void;
}

export function ModalIssue({ open, onClose }: ModalIssueProps): JSX.Element | null {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [rememberSelection, setRememberSelection] = useState(true);
  const projectId = useUnit($projectId);
  const user = useUnit(
    $viewer.map((q: { email?: string } | null | undefined) => q?.email ?? ""),
  );

const handleSubmit = async () => {
  const bcfTopics = components.get(OBC.BCFTopics);
  const worlds = components.get(OBC.Worlds);
  const viewpoints = components.get(OBC.Viewpoints);
  bcfTopics.setup({
  author: "user",
});
   // Очистка всех существующих топиков
  for (const topic of bcfTopics.list.values()) {
    bcfTopics.list.delete(topic.guid);
  }

  const selectedIds = rememberSelection
    ? Object.values(highlighter.selection.select).flatMap(set => Array.from(set))
    : [];

  const waitForTopic = () =>
    new Promise(resolve => {
      const handler = ({ value: topic }: { value: OBC.Topic }) => {
        bcfTopics.list.onItemSet.remove(handler);
        resolve(topic);
      };
      bcfTopics.list.onItemSet.add(handler);
    });

  const topicPromise = waitForTopic();

  bcfTopics.create({
    title: title || "Без названия",
    description: description || "Нет описания",
    dueDate: new Date(),
    type: "Issue",
    priority:
      priority === "High"
        ? "Major"
        : priority === "Medium"
        ? "Medium"
        : "Minor",
    stage: "Design",
    labels: new Set(["BIM", "User Issue"]),
    assignedTo: user ?? "",
  });

  const topic = (await topicPromise) as OBC.Topic;

  const firstWorld = worlds.list.values().next().value;

  if (!firstWorld) {
    console.warn("No world available for creating a viewpoint.");
  } else {
    const viewpoint = viewpoints.create(firstWorld, { title: topic.title });

    selectedIds.forEach(id => {
      viewpoint.selectionComponents.add(String(id));
    });

    topic.viewpoints.add(viewpoint.guid);
  }



// const topic = bcfTopics.create({
//   title: "Missing information",
//   description: "It seems these elements are badly defined.",
//   dueDate: new Date("08-01-2020"),
//   type: "Clash",
//   priority: "Major",
//   stage: "Design",
//   labels: new Set(["Architecture", "Cost Estimation"]),
//   assignedTo: "juan.hoyos@thatopen.com",
// });
  const bcf = await bcfTopics.export();
  const bcfFile = new File([bcf], "topic.bcf");

  addIssueMutation.start({
    projectId,
    file: bcfFile,
    title:title || "Без названия",
  });
// const exportBCF = async () => {
//     const bcf = await bcfTopics.export();
//     const bcfFile = new File([bcf], "topic.bcf");
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(bcfFile);
//     a.download = bcfFile.name;
//     a.click();
//     URL.revokeObjectURL(a.href);
//   };
//   exportBCF();
  onClose();
};

  // Always return a JSX.Element or null
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: '!bg-black !text-white !p-4 !rounded-xl' }}
    >
      <DialogTitle className="!text-white !text-xl !font-bold">Создать Issue</DialogTitle>
      <DialogContent className="!space-y-4 ">
        <TextField
          autoFocus
          margin="dense"
          label="Заголовок"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          InputLabelProps={{ className: '!text-gray-400' }}
          InputProps={{ className: '!text-white' }}
          className="!bg-neutral-900 !rounded !mt-3"
        />
        <TextField
          margin="dense"
          label="Описание"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputLabelProps={{ className: '!text-gray-400' }}
          InputProps={{ className: '!text-white' }}
          className="!bg-neutral-900 !rounded"
        />
        <FormControl fullWidth margin="dense" className="!bg-neutral-900 !rounded">
          <InputLabel className="!text-gray-400">Приоритет</InputLabel>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="!text-white"
            MenuProps={{ PaperProps: { className: '!bg-neutral-900 !text-white' } }}
          >
            <MenuItem value="Low">Низкий</MenuItem>
            <MenuItem value="Medium">Средний</MenuItem>
            <MenuItem value="High">Высокий</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberSelection}
              onChange={(e) => setRememberSelection(e.target.checked)}
              className="!text-white"
            />
          }
          label="Запомнить выбор элементов"
          className="!text-gray-300"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="!text-gray-400 hover:!text-white">Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="!bg-gray-700 hover:!bg-gray-600 !text-white"
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}