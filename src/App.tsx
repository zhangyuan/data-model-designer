import TableNode, { RefData, TableData } from "./components/TableNode";
import ReactFlow, { NodeChange, applyNodeChanges, Node, Edge, Connection, EdgeChange, applyEdgeChanges, addEdge, Background, Controls } from "reactflow";
import { useMemo, useState, MouseEvent } from "react";
import Editor from "@monaco-editor/react";
import "reactflow/dist/style.css";
import { parse, stringify } from "yaml";
import { useCallback } from 'react';
import { Spec, validateSpecSchema } from './spec';

const buildNodes = function (spec: Spec): Node<TableData>[] {
  return spec.tables.map((t, idx) => {
    let position = t.position
    if (!position) {
      position = { x: 10 + 300 * idx, y: 10}
    }

    return {
      id: t.name,
      position: position,
      data: t,
      type: 'tableNode',
    }
  })
}

const buildEdgeFromTables = (sourceTable: string, targetTable: string) => {
  return {
    id: `${sourceTable}/${targetTable}`,
    source: sourceTable,
    target: targetTable,
    type: "step",
    data: {
      source: {
        table: sourceTable
      },
      target: {
        table: targetTable
      }
    }
  }
}

const buildEdges = function (spec: Spec): Edge<RefData>[] {
  return spec.refs?.map((e) => buildEdgeFromTables(e.source.table, e.target.table)) || []
}

const buildSpec = function(nodes: Node<TableData>[], edges: Edge<RefData>[]) : Spec {
  return {
    tables: nodes.map(n => {
      return {
        name: n.id,
        position: {
          x: n.position.x,
          y: n.position.y
        },
        background_color: n.data.background_color,
        text_color: n.data.text_color,
        columns: n.data.columns
      }
    }),
    refs: edges.map((e) => {
      return {
        source: {
          table: e.data?.source.table || ''
        },
        target: {
          table: e.data?.target.table || ''
        }
      }
    })
  }
}

export default function App() {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const initSpec: Spec = {
    tables: [
      {
        name: "order"
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

  const [spec, setSpec] = useState<Spec>(initSpec);

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
      const data = parse(value || "")
      if (validateSpecSchema(data)) {
        const newSpec = data as Spec
        setNodes(buildNodes(newSpec))
        setEdges(buildEdges(newSpec))
        setErrorMessage("");
      } else {
        const errorMessage = validateSpecSchema.errors!.map(e => `${e.instancePath}: ${e.message}`).join("; ")
        throw new Error(errorMessage);
      }
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((oldNodes) => applyNodeChanges(changes, oldNodes))
    }, [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
    },
    [setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdget = buildEdgeFromTables(connection.source!, connection.target!)
      setEdges((oldEdges) => addEdge(newEdget, oldEdges));
    },
    [setEdges],
  );

  const onUpdateSpec = (e: MouseEvent<HTMLButtonElement>) => {
    const newSpec = buildSpec(nodes, edges)
    setSpec(newSpec)
    setCode(stringify(newSpec))
    e.preventDefault()
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-3 gap-1">
        <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl pt-2">
          <Editor
            height="90vh"
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
        <div className="col-span-2" style={{ height: '100%' }}>
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
            <Background />
            <Controls />
          </ReactFlow>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={onUpdateSpec}>Update spec on the left</button>
          </div>
        </div>
      </div>
    </div>
  );
}
