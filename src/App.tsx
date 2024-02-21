import TableNode from "./components/TableNode";
import "reactflow/dist/style.css";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import { useMemo } from "react";

export default function App() {
  const nodeTypes = useMemo(() => ({ TableNode: TableNode }), []);

  const initialNodes = [
    { id: "node-1", type: "TableNode", position: { x: 0, y: 0 }, data: {
      name: "workorder",
      columns: [
        {
          name: "id",
        },
        {
          name: "name",
        },
        {
          name: "start_date",
        },
      ],
    } },
  ];

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-3 gap-1">
        <div>01</div>
        <div className="col-span-2 bg-slate-300" style={{ height: 800}}>
          <ReactFlow nodeTypes={nodeTypes} nodes={initialNodes} />
        </div>
      </div>
    </div>
  );
}
