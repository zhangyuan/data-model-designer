import { Handle, NodeProps, Position } from "reactflow";

export type Table = {
  name: string;
  columns: [{
    name: string
  }]
};

export default function TableNode(props: NodeProps<Table>) {
  const table = props.data

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="border-solid border-2 w-64 grid grid-cols-1 divide-y bg-orange-200 m-2">
        <div className="p-2 bg-blue-400 text-white">{table.name}</div>
        {table.columns.map((c, idx) => {
          return <div className="p-2 text-black" key={idx}>{c.name}</div>;
        })}
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
