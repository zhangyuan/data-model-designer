import Ajv, { JSONSchemaType } from 'ajv';

export type Spec = {
  tables: {
    name: string;
    columns?: {
      name: string;
    }[];
    position?: {
      x: number;
      y: number;
    };
  }[];
  refs?: {
    source: {
      table: string;
    };
    target: {
      table: string;
    };
  }[];
}

export const SpecSchema: JSONSchemaType<Spec> = {
  type: 'object',
  properties: {
    tables: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          columns: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
          position: {
            type: 'object',
            nullable: true,
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
            required: ['x', 'y'],
            additionalProperties: false,
          },
        },
        required: ['name'],
        additionalProperties: false,
      },
    },
    refs: {
      type: 'array',
      nullable: true,
      items: {
        type: 'object',
        properties: {
          source: {
            type: 'object',
            properties: {
              table: { type: 'string' },
            },
            required: ['table'],
            additionalProperties: false,
          },
          target: {
            type: 'object',
            properties: {
              table: { type: 'string' },
            },
            required: ['table'],
            additionalProperties: false,
          },
        },
        required: ['source', 'target'],
        additionalProperties: false,
      },
    },
  },
  required: ["tables"],
  additionalProperties: false,
}

const ajv = new Ajv()
export const validateSpecSchema = ajv.compile<Spec>(SpecSchema)
