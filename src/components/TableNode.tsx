import { Handle, Position } from "reactflow";

export type TableData = {
    name: string,
    columns: {
      name: string
    }[]
}

export type RefData = {
  source: {
    table: string
  }
  target: {
    table: string
  }
}

export default function TableNode({data}: {data: TableData}) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="border-solid border-2 w-64 grid grid-cols-1 divide-y bg-orange-200 m-2">
        <div className="p-2 bg-blue-400 text-white">{data.name}</div>
        {data.columns.map((c, idx) => {
          return <div className="p-2 text-black" key={idx}>{c.name}</div>;
        })}
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
