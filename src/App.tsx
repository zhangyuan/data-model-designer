import TableNode, { TableData } from "./components/TableNode";
import ReactFlow, { NodeChange, applyNodeChanges, Node, Edge, EdgeChange, applyEdgeChanges } from "reactflow";
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
    }[]
  }[]
  refs?: {
    source: {
      table: string;
      column?: string;
    };
    target: {
      table: string;
      column?: string;
    };
  }[]
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

const buildEdges = function (spec: Spec): Edge[] {
  return spec.refs?.map((e) => {
    return {
      id: `${e.source.table}.${e.source.column}-${e.target.table}.${e.target.column}`,
      source: e.source.table,
      target: e.target.table,
    }
  }) || []
}

export default function App() {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const spec: Spec = {
    tables: [
      {
        name: "order",
        columns: [{ name: "id" }, { name: "name" }, { name: "start_date" }],
      },
      {
        name: "address",
        columns: [{ name: "line1"}, {name: "line2" }],
      },
    ],
    refs: [
      {
        source: {
          table: "order"
        },
        target: {
          table: "address"
        }
      }
    ]
  };
  const [code, setCode] = useState<string | undefined>(
    stringify(spec)
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const initialNodes =  buildNodes(spec)
  const [nodes, setNodes] = useState(initialNodes);

  const initialEdges =  buildEdges(spec)
  const [edges, setEdges] = useState(initialEdges)

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
    (changes: NodeChange[]) => setNodes((oldNodes) => applyNodeChanges(changes, oldNodes)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
    },
    [setEdges],
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
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
        </div>
      </div>
    </div>
  );
}
