import KanbanBoard from "@/components/KanbanBoard";
import type { ItemsFile } from "@/lib/items";
import data from "@/data/items.json";

export default function Page() {
  return <KanbanBoard data={data as ItemsFile} />;
}
