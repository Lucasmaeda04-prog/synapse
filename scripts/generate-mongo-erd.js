/*
  Simple ER diagram generator for Mongoose (NestJS) schemas.
  - Scans apps/server/src/database/schemas/*.schema.ts
  - Detects @Schema classes and @Prop refs to build relationships
  - Outputs Mermaid ER diagram to docs/diagrams/mongodb-erd.mmd

  Usage: node scripts/generate-mongo-erd.js
*/

const fs = require('fs');
const path = require('path');

// Resolve paths relative to this script file so it works from any CWD
const SCHEMAS_DIR = path.resolve(
  __dirname,
  '..',
  'apps',
  'server',
  'src',
  'database',
  'schemas',
);
const OUT_DIR = path.resolve(__dirname, '..', 'docs', 'diagrams');
const OUT_FILE = path.join(OUT_DIR, 'mongodb-erd.mmd');

function readFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.schema.ts'))
    .map((f) => ({ name: f, content: fs.readFileSync(path.join(dir, f), 'utf8') }));
}

function inferFieldType(propConfig, fieldTypeTs) {
  const cleaned = fieldTypeTs.replace(/\s*\|\s*null/g, '').trim();
  const isArrayTs = /\[\]$/.test(cleaned);
  const baseTs = cleaned.replace(/\[\]$/, '');

  const isArrayCfg = /\[\s*Types\.ObjectId\s*\]/.test(propConfig) || /type:\s*\[[^\]]+\]/.test(propConfig);
  const required = /required:\s*true/.test(propConfig);

  let base = 'string';

  if (/Types\.ObjectId/.test(propConfig) || /Types\.ObjectId/.test(baseTs)) base = 'objectId';
  else if (/Date/.test(propConfig) || /Date/.test(baseTs)) base = 'date';
  else if (/Number/.test(propConfig) || /:\s*number\b/.test(fieldTypeTs) || /:\s*Number\b/.test(fieldTypeTs)) base = 'int';
  else if (/Boolean/.test(propConfig) || /:\s*boolean\b/.test(fieldTypeTs) || /:\s*Boolean\b/.test(fieldTypeTs)) base = 'boolean';
  else if (/String/.test(propConfig) || /:\s*string\b/.test(fieldTypeTs) || /:\s*String\b/.test(fieldTypeTs)) base = 'string';
  else base = 'string'; // fallback for custom/union types (e.g., 'A' | 'B', UserRole, MediaItem)

  // Mermaid ER attribute types are simple tokens; avoid arrays and unions in type token
  const isArray = isArrayCfg || isArrayTs;
  return { base, isArray: !!isArray, required };
}

function parseSchemas(files) {
  const entities = new Map(); // name -> { name, collection, fields: Array<{name,type,isArray,required,ref?}> }
  const relations = []; // { from, to, cardinality, label }

  for (const { name: fileName, content } of files) {
    // Find class name
    const classMatch = content.match(/export\s+class\s+(\w+)/);
    if (!classMatch) continue;
    const className = classMatch[1];

    // Optional collection name from @Schema({ collection: '...' })
    const collMatch = content.match(/@Schema\(\{[^}]*collection:\s*'([^']+)'/);
    const entity = {
      name: className,
      collection: collMatch ? collMatch[1] : undefined,
      fields: [],
    };

    // Find props with refs
    // Example: @Prop({ type: Types.ObjectId, ref: 'User', required: true })\n  field!: Types.ObjectId;
    // Arrays: @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })\n  student_ids!: Types.ObjectId[];
    const propRegex = /@Prop\(\{([^}]*)\}\)[\s\S]*?\n\s*(\w+)\!?\??:\s*([^;\n]+);/g;
    let m;
    while ((m = propRegex.exec(content))) {
      const propConfig = m[1];
      const fieldName = m[2];
      const fieldType = m[3].trim();
      const { base, isArray, required } = inferFieldType(propConfig, fieldType);

      const refMatch = propConfig.match(/ref:\s*'([^']+)'/);
      const ref = refMatch ? refMatch[1] : undefined;
      entity.fields.push({ name: fieldName, type: base, isArray, required, ref });

      if (ref) {
        const target = ref;
        if (isArray) {
          // Current has many Target
          relations.push({ from: entity.name, to: target, cardinality: '1N', label: fieldName });
        } else {
          // Target has many Current
          relations.push({ from: target, to: entity.name, cardinality: '1N', label: fieldName });
        }
      }
    }

    entities.set(entity.name, entity);
  }

  return { entities: Array.from(entities.values()), relations };
}

function toMermaid({ entities, relations }) {
  const lines = [];
  lines.push('erDiagram');

  // Entities (without listing attributes to keep it clean)
  for (const e of entities) {
    const title = e.collection ? `${e.name} [${e.collection}]` : e.name;
    lines.push(`  ${title} {`);
    for (const f of e.fields) {
      const type = f.type || 'string';
      const name = f.name + (f.required ? '*' : '');
      lines.push(`    ${type} ${name}`);
    }
    lines.push('  }');
  }

  // Relations
  // Mermaid ER: A ||--o{ B : "label"
  for (const r of relations) {
    const left = r.from;
    const right = r.to;
    const arrow = '||--o{'; // we only model 1-to-N from left to right
    lines.push(`  ${left} ${arrow} ${right} : ${JSON.stringify(r.label)}`);
  }

  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(SCHEMAS_DIR)) {
    console.error('Schemas directory not found:', SCHEMAS_DIR);
    process.exit(1);
  }

  const files = readFiles(SCHEMAS_DIR);
  const model = parseSchemas(files);
  const mermaid = toMermaid(model);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, mermaid, 'utf8');
  console.log('Mermaid ER diagram written to', OUT_FILE);
}

main();
