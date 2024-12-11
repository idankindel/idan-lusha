import Ajv from 'ajv';

export const ajv = new Ajv({ allErrors: true });

export const validators = {
  parseUrl: ajv.compile({
    "type": "object",
    "properties": {
      "url": {
        "type": "string"
      }
    },
    "required": ["url"],
    "additionalProperties": false
  })
};
