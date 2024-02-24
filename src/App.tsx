import TableNode, { TableData } from "./components/TableNode";
import ReactFlow, { NodeChange, applyNodeChanges, Node } from "reactflow";
import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import "reactflow/dist/style.css";
import { parse, stringify } from "yaml";
import { useCallback } from 'react';

export interface Spec {
  tables: {
    name: string;
    columns: {
      name: string;
    }[];
  }[];
}

const buildNodes = function (spec: Spec): Node<TableData>[] {
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
  const initialNodes =  buildNodes(spec)

  const [nodes, setNodes] = useState(initialNodes);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    try {
      const newSpec = parse(value || "") as Spec;
      setNodes(buildNodes(newSpec))
      setErrorMessage("");
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

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
        <div className="col-span-2 bg-slate-300" style={{ height: '100%' }}>
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} onNodesChange={onNodesChange} />
        </div>
      </div>
    </div>
  );
}
