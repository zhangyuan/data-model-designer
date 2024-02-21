import TableNode, { TableProps } from "./components/TableNode";
import ReactFlow from "reactflow";
import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import "reactflow/dist/style.css";
import { parse, stringify } from "yaml";

export interface Spec {
  tables: {
    name: string;
    columns: {
      name: string;
    }[];
  }[];
}

const updateTableProps = (nodesProps: TableProps[], spec: Spec) => {
  return spec.tables.map((t, idx) => {
    return {
      id: t.name,
      position: { x: 10 + 100 * idx, y: 10},
      data: t,
      type: 'tableNode',
    }
  })
}

export default function App() {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

  const spec: Spec = {
    tables: [
      {
        name: "order",
        columns: [{ name: "id" }, { name: "name" }, { name: "start_date" }],
      },
    ],
  };
  const [code, setCode] = useState<string | undefined>(
    stringify(spec)
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [nodes, setNodes] = useState<TableProps[]>(updateTableProps([], spec));

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    try {
      const newSpec = parse(value || "") as Spec;
      setNodes(updateTableProps(nodes, newSpec))
      setErrorMessage("");
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-3 gap-1">
        <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl pt-2">
          <Editor
            height="85vh"
            width={`100%`}
            language={"yaml"}
            value={code}
            defaultValue=""
            onChange={handleEditorChange}
          />
          {errorMessage && (
            <div className="errors bg-red-100 p-2">{errorMessage}</div>
          )}
        </div>
        <div className="col-span-2 bg-slate-300" style={{ height: 800 }}>
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} />
        </div>
      </div>
    </div>
  );
}
