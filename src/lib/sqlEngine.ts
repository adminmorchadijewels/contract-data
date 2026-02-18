/**
 * Lightweight SQL engine that runs SELECT queries against the in-memory Excel data store.
 *
 * Supported syntax:
 *   SELECT * | col1, col2, COUNT(*), COUNT(col)
 *   FROM table_name
 *   [JOIN table2 ON table1.col = table2.col]
 *   [WHERE conditions]         — AND/OR, =, !=, <>, <, >, <=, >=, LIKE, IN, IS NULL, IS NOT NULL, BETWEEN
 *   [GROUP BY col1, col2]
 *   [ORDER BY col [ASC|DESC]]
 *   [LIMIT n]
 */

import { selectAll, type TableName } from "./excelDataService";

// ── Public types ────────────────────────────────────────────────────
export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionMs: number;
  error?: string;
}

// Valid table names for validation
const VALID_TABLES: string[] = [
  "companies", "contracts", "atolls",
  "pricing_standard", "pricing_special",
  "contract_baggage", "contract_booking", "contract_age",
  "contract_addons", "contract_insurance", "contract_government_charges",
  "contract_fuel", "contract_payment_plan", "contract_service_commitment",
  "contract_termination", "contract_notes", "table_settings",
];

// ── Tokeniser helpers ───────────────────────────────────────────────

function stripComments(sql: string): string {
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Case-insensitive keyword match */
function kw(token: string, keyword: string): boolean {
  return token.toUpperCase() === keyword;
}

/** Split top-level by a keyword that is NOT inside parentheses */
function splitByKeyword(tokens: string[], keyword: string): { before: string[]; after: string[] } | null {
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "(") depth++;
    else if (tokens[i] === ")") depth--;
    else if (depth === 0 && kw(tokens[i], keyword)) {
      return { before: tokens.slice(0, i), after: tokens.slice(i + 1) };
    }
  }
  return null;
}

/** Tokenize SQL into words, respecting quoted strings and operators */
function tokenize(sql: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = sql.trim();

  while (i < s.length) {
    // Skip whitespace
    if (/\s/.test(s[i])) { i++; continue; }

    // Quoted string (single quotes)
    if (s[i] === "'") {
      let j = i + 1;
      while (j < s.length && (s[j] !== "'" || s[j + 1] === "'")) {
        if (s[j] === "'" && s[j + 1] === "'") j += 2;
        else j++;
      }
      tokens.push(s.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // Two-char operators
    if (i + 1 < s.length) {
      const two = s.slice(i, i + 2);
      if (["<=", ">=", "<>", "!="].includes(two)) {
        tokens.push(two);
        i += 2;
        continue;
      }
    }

    // Single-char operators / punctuation
    if ("(),.*<>=".includes(s[i])) {
      tokens.push(s[i]);
      i++;
      continue;
    }

    // Word / number / identifier
    let j = i;
    while (j < s.length && !/[\s(),.*<>=!']/.test(s[j])) j++;
    if (j > i) {
      tokens.push(s.slice(i, j));
      i = j;
    } else {
      i++;
    }
  }

  return tokens;
}

// ── Parse helpers ───────────────────────────────────────────────────

interface ParsedJoin {
  table: string;
  alias: string;
  leftCol: string;
  rightCol: string;
}

interface ParsedQuery {
  selectCols: string[];          // ["*"] or ["col1", "col2", "COUNT(*)"]
  fromTable: string;
  fromAlias: string;
  joins: ParsedJoin[];
  whereClauses: string[];        // raw tokens for WHERE
  groupBy: string[];
  orderBy: { col: string; dir: "ASC" | "DESC" }[];
  limit: number | null;
}

function parseQuery(sql: string): ParsedQuery {
  const cleaned = stripComments(sql).replace(/;+\s*$/, "").trim();
  const tokens = tokenize(cleaned);

  if (tokens.length === 0) throw new Error("Empty query");
  if (!kw(tokens[0], "SELECT")) throw new Error("Only SELECT queries are supported");

  // Find FROM
  const fromSplit = splitByKeyword(tokens, "FROM");
  if (!fromSplit) throw new Error("Missing FROM clause");

  // Parse SELECT columns
  const selectTokens = fromSplit.before.slice(1); // skip "SELECT"
  const selectCols = parseSelectCols(selectTokens);

  // Parse the rest after FROM
  let rest = fromSplit.after;

  // Extract table name + optional alias
  const fromTable = rest[0]?.toLowerCase();
  if (!fromTable || !VALID_TABLES.includes(fromTable)) {
    throw new Error(`Unknown table: "${rest[0]}". Available tables: ${VALID_TABLES.join(", ")}`);
  }
  let fromAlias = fromTable;
  let restIdx = 1;
  if (rest[1] && !["JOIN", "INNER", "LEFT", "WHERE", "ORDER", "GROUP", "LIMIT"].some(k => kw(rest[1], k))) {
    fromAlias = rest[1].toLowerCase();
    restIdx = 2;
  }
  rest = rest.slice(restIdx);

  // Parse JOINs
  const joins: ParsedJoin[] = [];
  while (rest.length > 0 && (kw(rest[0], "JOIN") || kw(rest[0], "INNER") || kw(rest[0], "LEFT"))) {
    const startIdx = kw(rest[0], "JOIN") ? 1 : 2; // skip "JOIN" or "INNER/LEFT JOIN"
    const joinTable = rest[startIdx]?.toLowerCase();
    if (!joinTable || !VALID_TABLES.includes(joinTable)) {
      throw new Error(`Unknown join table: "${rest[startIdx]}"`);
    }
    let joinAlias = joinTable;
    let onIdx = startIdx + 1;
    if (rest[onIdx] && !kw(rest[onIdx], "ON")) {
      joinAlias = rest[onIdx].toLowerCase();
      onIdx++;
    }
    if (!rest[onIdx] || !kw(rest[onIdx], "ON")) throw new Error("Missing ON in JOIN");
    // ON left = right
    const leftCol = rest[onIdx + 1];
    // skip "="
    const rightCol = rest[onIdx + 3];
    if (!leftCol || !rightCol) throw new Error("Invalid JOIN ON clause");
    joins.push({ table: joinTable, alias: joinAlias, leftCol, rightCol });
    rest = rest.slice(onIdx + 4);
  }

  // Parse WHERE
  let whereClauses: string[] = [];
  const whereSplit = splitByKeyword(rest, "WHERE");
  if (whereSplit) {
    rest = whereSplit.after;
    // Collect everything until GROUP/ORDER/LIMIT
    const endIdx = rest.findIndex((t, i) =>
      kw(t, "GROUP") || kw(t, "ORDER") || kw(t, "LIMIT")
    );
    if (endIdx >= 0) {
      whereClauses = rest.slice(0, endIdx);
      rest = rest.slice(endIdx);
    } else {
      whereClauses = rest;
      rest = [];
    }
  }

  // Parse GROUP BY
  let groupBy: string[] = [];
  const groupSplit = splitByKeyword(rest, "GROUP");
  if (groupSplit) {
    rest = groupSplit.after;
    if (rest[0] && kw(rest[0], "BY")) rest = rest.slice(1);
    const endIdx = rest.findIndex(t => kw(t, "ORDER") || kw(t, "LIMIT"));
    const groupTokens = endIdx >= 0 ? rest.slice(0, endIdx) : rest;
    rest = endIdx >= 0 ? rest.slice(endIdx) : [];
    groupBy = groupTokens.filter(t => t !== ",").map(t => t.toLowerCase());
  }

  // Parse ORDER BY
  const orderBy: { col: string; dir: "ASC" | "DESC" }[] = [];
  const orderSplit = splitByKeyword(rest, "ORDER");
  if (orderSplit) {
    rest = orderSplit.after;
    if (rest[0] && kw(rest[0], "BY")) rest = rest.slice(1);
    const endIdx = rest.findIndex(t => kw(t, "LIMIT"));
    const orderTokens = endIdx >= 0 ? rest.slice(0, endIdx) : rest;
    rest = endIdx >= 0 ? rest.slice(endIdx) : [];
    // Parse "col ASC, col2 DESC"
    let i = 0;
    while (i < orderTokens.length) {
      const col = orderTokens[i];
      if (col === ",") { i++; continue; }
      let dir: "ASC" | "DESC" = "ASC";
      if (orderTokens[i + 1] && (kw(orderTokens[i + 1], "ASC") || kw(orderTokens[i + 1], "DESC"))) {
        dir = orderTokens[i + 1].toUpperCase() as "ASC" | "DESC";
        i += 2;
      } else {
        i++;
      }
      orderBy.push({ col: col.toLowerCase(), dir });
    }
  }

  // Parse LIMIT
  let limit: number | null = null;
  const limitSplit = splitByKeyword(rest, "LIMIT");
  if (limitSplit && limitSplit.after[0]) {
    limit = parseInt(limitSplit.after[0]);
    if (isNaN(limit)) throw new Error(`Invalid LIMIT value: "${limitSplit.after[0]}"`);
  }

  return { selectCols, fromTable, fromAlias, joins, whereClauses, groupBy, orderBy, limit };
}

function parseSelectCols(tokens: string[]): string[] {
  if (tokens.length === 1 && tokens[0] === "*") return ["*"];

  const cols: string[] = [];
  let current = "";
  let depth = 0;

  for (const t of tokens) {
    if (t === "(") { depth++; current += t; continue; }
    if (t === ")") { depth--; current += t; continue; }
    if (t === "," && depth === 0) {
      if (current.trim()) cols.push(current.trim().toLowerCase());
      current = "";
      continue;
    }
    current += (current ? " " : "") + t;
  }
  if (current.trim()) cols.push(current.trim().toLowerCase());

  return cols;
}

// ── WHERE evaluation ────────────────────────────────────────────────

function resolveCol(row: Record<string, unknown>, col: string, aliases: Map<string, string>): unknown {
  // Handle alias.column notation
  if (col.includes(".")) {
    const parts = col.split(".");
    const key = parts[parts.length - 1];
    return row[key];
  }
  return row[col];
}

function evaluateWhere(row: Record<string, unknown>, tokens: string[], aliases: Map<string, string>): boolean {
  if (tokens.length === 0) return true;

  // Split by OR first (lower precedence)
  const orGroups: string[][] = [];
  let current: string[] = [];
  for (const t of tokens) {
    if (kw(t, "OR")) {
      orGroups.push(current);
      current = [];
    } else {
      current.push(t);
    }
  }
  orGroups.push(current);

  return orGroups.some(group => evaluateAndGroup(row, group, aliases));
}

function evaluateAndGroup(row: Record<string, unknown>, tokens: string[], aliases: Map<string, string>): boolean {
  // Split by AND
  const conditions: string[][] = [];
  let current: string[] = [];
  for (const t of tokens) {
    if (kw(t, "AND")) {
      conditions.push(current);
      current = [];
    } else {
      current.push(t);
    }
  }
  conditions.push(current);

  return conditions.every(cond => evaluateCondition(row, cond, aliases));
}

function parseValue(token: string): unknown {
  if (token.startsWith("'") && token.endsWith("'")) {
    return token.slice(1, -1).replace(/''/g, "'");
  }
  if (kw(token, "NULL")) return null;
  if (kw(token, "TRUE")) return true;
  if (kw(token, "FALSE")) return false;
  const num = Number(token);
  if (!isNaN(num)) return num;
  return token;
}

function evaluateCondition(row: Record<string, unknown>, tokens: string[], aliases: Map<string, string>): boolean {
  if (tokens.length === 0) return true;

  // IS NULL / IS NOT NULL
  if (tokens.length >= 3 && kw(tokens[1], "IS")) {
    const col = tokens[0].toLowerCase();
    const val = resolveCol(row, col, aliases);
    if (kw(tokens[2], "NOT") && tokens.length >= 4 && kw(tokens[3], "NULL")) {
      return val !== null && val !== undefined && val !== "";
    }
    if (kw(tokens[2], "NULL")) {
      return val === null || val === undefined || val === "";
    }
  }

  // BETWEEN
  if (tokens.length >= 5 && kw(tokens[1], "BETWEEN")) {
    const col = tokens[0].toLowerCase();
    const val = resolveCol(row, col, aliases);
    const low = parseValue(tokens[2]);
    // tokens[3] should be AND
    const high = parseValue(tokens[4]);
    return String(val) >= String(low) && String(val) <= String(high);
  }

  // IN (val1, val2, ...)
  if (tokens.length >= 4 && kw(tokens[1], "IN")) {
    const col = tokens[0].toLowerCase();
    const val = resolveCol(row, col, aliases);
    // Collect values inside parens
    const inValues: unknown[] = [];
    for (let i = 3; i < tokens.length; i++) {
      if (tokens[i] === "(" || tokens[i] === ")" || tokens[i] === ",") continue;
      inValues.push(parseValue(tokens[i]));
    }
    return inValues.some(v => String(v).toLowerCase() === String(val).toLowerCase());
  }

  // NOT IN
  if (tokens.length >= 5 && kw(tokens[1], "NOT") && kw(tokens[2], "IN")) {
    const col = tokens[0].toLowerCase();
    const val = resolveCol(row, col, aliases);
    const inValues: unknown[] = [];
    for (let i = 4; i < tokens.length; i++) {
      if (tokens[i] === "(" || tokens[i] === ")" || tokens[i] === ",") continue;
      inValues.push(parseValue(tokens[i]));
    }
    return !inValues.some(v => String(v).toLowerCase() === String(val).toLowerCase());
  }

  // LIKE
  if (tokens.length >= 3 && kw(tokens[1], "LIKE")) {
    const col = tokens[0].toLowerCase();
    const val = String(resolveCol(row, col, aliases) ?? "").toLowerCase();
    const pattern = String(parseValue(tokens[2])).toLowerCase();
    const regex = new RegExp("^" + pattern.replace(/%/g, ".*").replace(/_/g, ".") + "$");
    return regex.test(val);
  }

  // NOT LIKE
  if (tokens.length >= 4 && kw(tokens[1], "NOT") && kw(tokens[2], "LIKE")) {
    const col = tokens[0].toLowerCase();
    const val = String(resolveCol(row, col, aliases) ?? "").toLowerCase();
    const pattern = String(parseValue(tokens[3])).toLowerCase();
    const regex = new RegExp("^" + pattern.replace(/%/g, ".*").replace(/_/g, ".") + "$");
    return !regex.test(val);
  }

  // Standard comparison: col OP value
  if (tokens.length >= 3) {
    const col = tokens[0].toLowerCase();
    const op = tokens[1];
    const right = parseValue(tokens[2]);
    const left = resolveCol(row, col, aliases);

    switch (op) {
      case "=": return String(left ?? "").toLowerCase() === String(right ?? "").toLowerCase();
      case "!=" :
      case "<>": return String(left ?? "").toLowerCase() !== String(right ?? "").toLowerCase();
      case "<": return Number(left) < Number(right);
      case ">": return Number(left) > Number(right);
      case "<=": return Number(left) <= Number(right);
      case ">=": return Number(left) >= Number(right);
    }
  }

  return true;
}

// ── Main executor ───────────────────────────────────────────────────

export function executeQuery(sql: string): QueryResult {
  const start = performance.now();

  try {
    const parsed = parseQuery(sql);
    const aliases = new Map<string, string>();
    aliases.set(parsed.fromAlias, parsed.fromTable);

    // Load base table
    let rows = selectAll(parsed.fromTable as TableName).map(r => ({ ...r }));

    // Apply JOINs
    for (const join of parsed.joins) {
      aliases.set(join.alias, join.table);
      const joinData = selectAll(join.table as TableName);

      // Resolve column references (handle alias.col)
      const resolveJoinCol = (col: string) => {
        if (col.includes(".")) return col.split(".").pop()!;
        return col;
      };
      const leftKey = resolveJoinCol(join.leftCol);
      const rightKey = resolveJoinCol(join.rightCol);

      // Build lookup map for performance
      const lookup = new Map<string, Record<string, unknown>[]>();
      for (const jr of joinData) {
        const key = String((jr as any)[rightKey] ?? (jr as any)[leftKey] ?? "");
        if (!lookup.has(key)) lookup.set(key, []);
        lookup.get(key)!.push(jr as Record<string, unknown>);
      }

      const joined: Record<string, unknown>[] = [];
      for (const row of rows) {
        const key = String((row as any)[leftKey] ?? (row as any)[rightKey] ?? "");
        const matches = lookup.get(key);
        if (matches) {
          for (const match of matches) {
            // Prefix join columns with table alias to avoid collision
            const merged = { ...row };
            for (const [k, v] of Object.entries(match)) {
              if (!(k in merged)) merged[k] = v;
              merged[`${join.alias}.${k}`] = v;
            }
            joined.push(merged);
          }
        }
      }
      rows = joined;
    }

    // Apply WHERE
    if (parsed.whereClauses.length > 0) {
      rows = rows.filter(row => evaluateWhere(row, parsed.whereClauses, aliases));
    }

    // Check for aggregate functions
    const hasAgg = parsed.selectCols.some(c => /^count\s*\(/.test(c));

    if (hasAgg || parsed.groupBy.length > 0) {
      rows = applyGroupBy(rows, parsed.selectCols, parsed.groupBy);
    }

    // Apply ORDER BY
    if (parsed.orderBy.length > 0) {
      rows.sort((a, b) => {
        for (const { col, dir } of parsed.orderBy) {
          const aVal = a[col] ?? "";
          const bVal = b[col] ?? "";
          const aNum = Number(aVal);
          const bNum = Number(bVal);
          let cmp: number;
          if (!isNaN(aNum) && !isNaN(bNum)) {
            cmp = aNum - bNum;
          } else {
            cmp = String(aVal).localeCompare(String(bVal));
          }
          if (cmp !== 0) return dir === "DESC" ? -cmp : cmp;
        }
        return 0;
      });
    }

    // Apply LIMIT
    if (parsed.limit !== null) {
      rows = rows.slice(0, parsed.limit);
    }

    // Project columns
    let columns: string[];
    if (parsed.selectCols[0] === "*") {
      columns = rows.length > 0 ? Object.keys(rows[0]).filter(k => !k.includes(".")) : [];
    } else {
      columns = parsed.selectCols.map(c => {
        // Clean up "table.col" → "col"
        if (c.includes(".") && !c.includes("(")) return c.split(".").pop()!;
        return c;
      });
    }

    // Project rows to selected columns
    let projectedRows = rows;
    if (parsed.selectCols[0] !== "*" && !hasAgg) {
      projectedRows = rows.map(row => {
        const projected: Record<string, unknown> = {};
        for (const col of parsed.selectCols) {
          const key = col.includes(".") ? col.split(".").pop()! : col;
          projected[key] = row[key] ?? row[col] ?? null;
        }
        return projected;
      });
    }

    const executionMs = performance.now() - start;

    return {
      columns,
      rows: projectedRows,
      rowCount: projectedRows.length,
      executionMs,
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionMs: performance.now() - start,
      error: err.message || "Unknown error",
    };
  }
}

// ── GROUP BY + aggregates ───────────────────────────────────────────

function applyGroupBy(
  rows: Record<string, unknown>[],
  selectCols: string[],
  groupBy: string[]
): Record<string, unknown>[] {
  if (groupBy.length === 0 && selectCols.every(c => /^count\s*\(/.test(c))) {
    // Single aggregate over all rows
    const result: Record<string, unknown> = {};
    for (const col of selectCols) {
      if (/^count\s*\(\s*\*\s*\)$/.test(col)) {
        result[col] = rows.length;
      } else {
        const match = col.match(/^count\s*\(\s*(\w+)\s*\)$/);
        if (match) {
          result[col] = rows.filter(r => r[match[1]] !== null && r[match[1]] !== undefined && r[match[1]] !== "").length;
        }
      }
    }
    return [result];
  }

  // Group rows
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const key = groupBy.map(col => String(row[col] ?? "")).join("|||");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const result: Record<string, unknown>[] = [];
  for (const [, groupRows] of groups) {
    const out: Record<string, unknown> = {};
    for (const col of selectCols) {
      if (/^count\s*\(\s*\*\s*\)$/.test(col)) {
        out[col] = groupRows.length;
      } else if (/^count\s*\(/.test(col)) {
        const match = col.match(/^count\s*\(\s*(\w+)\s*\)$/);
        if (match) {
          out[col] = groupRows.filter(r => r[match[1]] !== null && r[match[1]] !== undefined).length;
        }
      } else {
        const key = col.includes(".") ? col.split(".").pop()! : col;
        out[key] = groupRows[0][key];
      }
    }
    result.push(out);
  }

  return result;
}

// ── Get table info for autocomplete / help ──────────────────────────

export function getTableNames(): string[] {
  return [...VALID_TABLES].filter(t => t !== "table_settings");
}

export function getTableColumns(tableName: string): string[] {
  if (!VALID_TABLES.includes(tableName)) return [];
  const rows = selectAll(tableName as TableName);
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
}
