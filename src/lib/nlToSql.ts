/**
 * Natural-language → SQL generator.
 *
 * Uses pattern matching and schema awareness to convert plain English
 * descriptions into SQL queries that run against the in-memory store.
 */

import { getTableNames, getTableColumns } from "./sqlEngine";

// ── Schema knowledge ────────────────────────────────────────────────

interface TableMeta {
  name: string;
  keywords: string[];  // words that map to this table
  columns: string[];
}

function buildSchema(): TableMeta[] {
  return getTableNames().map(name => ({
    name,
    keywords: getKeywordsForTable(name),
    columns: getTableColumns(name),
  }));
}

function getKeywordsForTable(table: string): string[] {
  const map: Record<string, string[]> = {
    companies: ["company", "companies", "resort", "resorts", "group", "groups", "hotel", "hotels"],
    contracts: ["contract", "contracts", "agreement", "agreements", "deal", "deals"],
    atolls: ["atoll", "atolls", "location", "locations", "island", "islands"],
    pricing_standard: ["pricing", "standard pricing", "fare", "fares", "rate", "rates", "transfer pricing", "standard fare", "standard rate"],
    pricing_special: ["special pricing", "special fare", "special rate", "discount", "discounts", "management pricing", "staff pricing", "fam"],
    contract_baggage: ["baggage", "luggage", "bag"],
    contract_booking: ["booking", "reservation"],
    contract_age: ["age", "child", "children", "adult", "infant", "age rule", "age rules"],
    contract_addons: ["addon", "add-on", "addons", "add-ons", "extra", "extras", "additional", "vehicle"],
    contract_insurance: ["insurance", "cover", "coverage"],
    contract_government_charges: ["government", "tax", "taxes", "gst", "charges", "government charges"],
    contract_fuel: ["fuel", "surcharge", "fuel surcharge"],
    contract_payment_plan: ["payment", "payment plan", "payment terms", "billing"],
    contract_service_commitment: ["service", "commitment", "sla", "service level"],
    contract_termination: ["termination", "cancellation", "cancel"],
    contract_notes: ["note", "notes", "comment", "comments"],
  };
  return map[table] || [table.replace(/_/g, " ")];
}

// ── Column keyword map ──────────────────────────────────────────────

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ["name", "named", "called"],
  code: ["code"],
  type: ["type"],
  atoll: ["atoll", "location"],
  registration_no: ["registration", "reg", "registration number"],
  address: ["address"],
  contract_code: ["contract code", "code"],
  contract_id: ["contract id"],
  sub_contract_type: ["type", "contract type", "sub type", "transfer", "charter"],
  sub_contract_id: ["sub contract", "sub id"],
  start_date: ["start", "start date", "starting", "from date", "begins"],
  end_date: ["end", "end date", "ending", "expiry", "expires", "expiring", "until", "to date"],
  resort_id: ["resort"],
  group_id: ["group"],
  carrier_id: ["carrier"],
  request_type: ["request type", "category"],
  passenger_type: ["passenger", "pax type"],
  return_fare_usd: ["return fare", "return price", "return"],
  one_way_fare_usd: ["one way fare", "one way price", "one way"],
  discount_type: ["discount type", "discount"],
  value: ["value", "amount"],
  parameter: ["parameter", "param"],
  remark: ["remark", "remarks", "note"],
  content: ["content", "text", "body"],
};

// ── Intent detection ────────────────────────────────────────────────

interface ParsedIntent {
  tables: string[];
  columns: string[];
  filters: { col: string; op: string; value: string }[];
  orderBy: { col: string; dir: "ASC" | "DESC" } | null;
  limit: number | null;
  isCount: boolean;
  groupBy: string | null;
  needsJoin: boolean;
}

function normalise(text: string): string {
  return text.toLowerCase().trim().replace(/[?!.]+$/g, "").trim();
}

export function generateSQL(input: string): { sql: string; explanation: string } {
  const text = normalise(input);
  if (!text) return { sql: "", explanation: "Please describe what data you want to see." };

  const schema = buildSchema();
  const intent = detectIntent(text, schema);

  if (intent.tables.length === 0) {
    return {
      sql: "",
      explanation: "I couldn't determine which table you're referring to. Try mentioning a table like companies, contracts, pricing, etc.",
    };
  }

  const mainTable = intent.tables[0];
  const parts: string[] = [];

  // SELECT
  if (intent.isCount && intent.groupBy) {
    parts.push(`SELECT ${intent.groupBy}, COUNT(*)`);
  } else if (intent.isCount) {
    parts.push("SELECT COUNT(*)");
  } else if (intent.columns.length > 0) {
    if (intent.needsJoin) {
      const cols = intent.columns.map(c => {
        // Prefix with alias if it's from the joined table
        const mainCols = getTableColumns(mainTable);
        if (mainCols.includes(c)) return `a.${c}`;
        return `b.${c}`;
      });
      parts.push(`SELECT ${cols.join(", ")}`);
    } else {
      parts.push(`SELECT ${intent.columns.join(", ")}`);
    }
  } else {
    parts.push("SELECT *");
  }

  // FROM
  if (intent.needsJoin && intent.tables.length >= 2) {
    parts.push(`FROM ${mainTable} a`);
    const joinTable = intent.tables[1];
    const joinCol = findJoinColumn(mainTable, joinTable, schema);
    if (joinCol) {
      parts.push(`JOIN ${joinTable} b ON a.${joinCol.left} = b.${joinCol.right}`);
    }
  } else {
    parts.push(`FROM ${mainTable}`);
  }

  // WHERE
  if (intent.filters.length > 0) {
    const conditions = intent.filters.map(f => `${f.col} ${f.op} '${f.value}'`);
    parts.push(`WHERE ${conditions.join("\nAND ")}`);
  }

  // GROUP BY
  if (intent.groupBy) {
    parts.push(`GROUP BY ${intent.groupBy}`);
  }

  // ORDER BY
  if (intent.orderBy) {
    parts.push(`ORDER BY ${intent.orderBy.col} ${intent.orderBy.dir}`);
  }

  // LIMIT
  if (intent.limit) {
    parts.push(`LIMIT ${intent.limit}`);
  }

  const sql = parts.join("\n");
  const explanation = buildExplanation(intent, mainTable);

  return { sql, explanation };
}

// ── Intent detection logic ──────────────────────────────────────────

function detectIntent(text: string, schema: TableMeta[]): ParsedIntent {
  const intent: ParsedIntent = {
    tables: [],
    columns: [],
    filters: [],
    orderBy: null,
    limit: null,
    isCount: false,
    groupBy: null,
    needsJoin: false,
  };

  // Detect tables
  for (const table of schema) {
    for (const kw of table.keywords) {
      if (text.includes(kw)) {
        if (!intent.tables.includes(table.name)) {
          intent.tables.push(table.name);
        }
        break;
      }
    }
  }

  // Fallback: if no table detected, try partial matches
  if (intent.tables.length === 0) {
    const words = text.split(/\s+/);
    for (const table of schema) {
      for (const word of words) {
        if (word.length >= 4 && table.name.includes(word)) {
          intent.tables.push(table.name);
          break;
        }
      }
      if (intent.tables.length > 0) break;
    }
  }

  if (intent.tables.length === 0) return intent;

  const mainTable = intent.tables[0];
  const mainCols = getTableColumns(mainTable);

  // Detect count / how many
  if (/how many|count|total number|number of/.test(text)) {
    intent.isCount = true;
  }

  // Detect group by intent
  if (/per |by |each |grouped? by|for each|breakdown/.test(text)) {
    const groupMatch = text.match(/(?:per|by|each|grouped? by|for each|breakdown\s+(?:by)?)\s+(\w+)/);
    if (groupMatch) {
      const groupWord = groupMatch[1];
      const col = findColumnByKeyword(groupWord, mainCols);
      if (col) {
        intent.groupBy = col;
        if (!intent.isCount) intent.isCount = true;
      }
    }
  }

  // Detect specific columns requested
  if (/show(?:ing)?|display|get|list|select|include|with columns?/.test(text)) {
    for (const col of mainCols) {
      const aliases = COLUMN_ALIASES[col] || [col.replace(/_/g, " ")];
      for (const alias of aliases) {
        if (text.includes(alias) && !["type", "name"].includes(alias)) {
          if (!intent.columns.includes(col)) intent.columns.push(col);
        }
      }
    }
  }

  // Detect filters

  // Type filter for companies
  if (mainTable === "companies") {
    if (/\bresort(?:s)?\b/.test(text) && !/group/.test(text)) {
      intent.filters.push({ col: "type", op: "=", value: "Resort" });
    } else if (/\bgroup(?:s)?\b/.test(text) && !/resort/.test(text)) {
      intent.filters.push({ col: "type", op: "=", value: "Group" });
    }
  }

  // Contract type filter
  if (mainTable === "contracts") {
    if (/\btransfer\b/.test(text)) {
      intent.filters.push({ col: "sub_contract_type", op: "=", value: "Transfer" });
    } else if (/\bsigned charter\b/.test(text)) {
      intent.filters.push({ col: "sub_contract_type", op: "=", value: "Signed Charter" });
    } else if (/\bcharter\b/.test(text) && !/signed/.test(text)) {
      intent.filters.push({ col: "sub_contract_type", op: "=", value: "Charter" });
    }
  }

  // Date-based filters
  const today = new Date().toISOString().split("T")[0];
  if (/\bactive\b/.test(text) && mainCols.includes("end_date")) {
    intent.filters.push({ col: "end_date", op: ">=", value: today });
  }
  if (/\bexpir(ed|ing)\b/.test(text) && mainCols.includes("end_date")) {
    if (/expired/.test(text)) {
      intent.filters.push({ col: "end_date", op: "<", value: today });
    } else {
      // Expiring soon — within 60 days
      const soon = new Date();
      soon.setDate(soon.getDate() + 60);
      intent.filters.push({ col: "end_date", op: ">=", value: today });
      intent.filters.push({ col: "end_date", op: "<=", value: soon.toISOString().split("T")[0] });
    }
  }

  // Name / search filter
  const nameMatch = text.match(/(?:named?|called|for|of)\s+['"]?([A-Z][a-zA-Z\s]+?)['"]?(?:\s|$)/i);
  if (nameMatch && mainCols.includes("name")) {
    const val = nameMatch[1].trim();
    if (val.length >= 3 && !["resort", "group", "contract", "the"].includes(val.toLowerCase())) {
      intent.filters.push({ col: "name", op: "LIKE", value: `%${val}%` });
    }
  }

  // Atoll filter
  const atollMatch = text.match(/(?:in|at|from)\s+(\w+)\s+atoll/i) || text.match(/atoll\s+(\w+)/i);
  if (atollMatch && mainCols.includes("atoll")) {
    intent.filters.push({ col: "atoll", op: "LIKE", value: `%${atollMatch[1]}%` });
  }

  // Passenger type filter
  if (mainCols.includes("passenger_type")) {
    if (/\badult\b/.test(text)) intent.filters.push({ col: "passenger_type", op: "=", value: "Adult" });
    else if (/\bchild(ren)?\b/.test(text)) intent.filters.push({ col: "passenger_type", op: "=", value: "Child" });
  }

  // Special pricing request type
  if (mainTable === "pricing_special" && mainCols.includes("request_type")) {
    const types = ["Management", "Staff", "Service providers", "FAM trips", "Tour Operators", "Tour Guides", "Journalists", "Advertisers"];
    for (const t of types) {
      if (text.includes(t.toLowerCase())) {
        intent.filters.push({ col: "request_type", op: "=", value: t });
        break;
      }
    }
  }

  // Detect ordering
  if (/latest|newest|recent|last/.test(text)) {
    const dateCol = mainCols.includes("created_at") ? "created_at" : mainCols.includes("end_date") ? "end_date" : null;
    if (dateCol) intent.orderBy = { col: dateCol, dir: "DESC" };
  } else if (/oldest|first|earliest/.test(text)) {
    const dateCol = mainCols.includes("created_at") ? "created_at" : mainCols.includes("start_date") ? "start_date" : null;
    if (dateCol) intent.orderBy = { col: dateCol, dir: "ASC" };
  } else if (/alphabetical|a.?z|sorted by name|order by name/.test(text)) {
    if (mainCols.includes("name")) intent.orderBy = { col: "name", dir: "ASC" };
  } else if (/highest|most expensive|expensive/.test(text)) {
    const fareCol = mainCols.includes("return_fare_usd") ? "return_fare_usd" : mainCols.includes("value") ? "value" : null;
    if (fareCol) intent.orderBy = { col: fareCol, dir: "DESC" };
  } else if (/cheapest|lowest|least expensive/.test(text)) {
    const fareCol = mainCols.includes("return_fare_usd") ? "return_fare_usd" : mainCols.includes("value") ? "value" : null;
    if (fareCol) intent.orderBy = { col: fareCol, dir: "ASC" };
  }

  // Detect limit
  const limitMatch = text.match(/(?:top|first|limit|show)\s+(\d+)/);
  if (limitMatch) {
    intent.limit = parseInt(limitMatch[1]);
  } else if (!intent.isCount && !intent.limit) {
    intent.limit = 50; // sensible default
  }

  // Detect need for join
  if (mainTable === "contracts" && /resort name|resort|with name/.test(text) && !intent.isCount) {
    intent.needsJoin = true;
    if (!intent.tables.includes("companies")) intent.tables.push("companies");
    if (intent.columns.length === 0) {
      intent.columns = ["contract_code", "sub_contract_type", "start_date", "end_date", "name"];
    } else if (!intent.columns.includes("name")) {
      intent.columns.push("name");
    }
  }

  return intent;
}

// ── Helpers ─────────────────────────────────────────────────────────

function findColumnByKeyword(keyword: string, columns: string[]): string | null {
  const lower = keyword.toLowerCase();
  // Direct match
  if (columns.includes(lower)) return lower;
  // Match with underscore replacement
  const withUnderscore = lower.replace(/\s+/g, "_");
  if (columns.includes(withUnderscore)) return withUnderscore;
  // Check aliases
  for (const col of columns) {
    const aliases = COLUMN_ALIASES[col] || [col.replace(/_/g, " ")];
    if (aliases.some(a => a === lower || a.includes(lower))) return col;
  }
  // Partial match
  for (const col of columns) {
    if (col.includes(lower) || lower.includes(col.replace(/_/g, ""))) return col;
  }
  return null;
}

function findJoinColumn(table1: string, table2: string, schema: TableMeta[]): { left: string; right: string } | null {
  const cols1 = getTableColumns(table1);
  const cols2 = getTableColumns(table2);

  // Look for foreign keys: table1 has a col ending in _id that matches table2.id
  if (table1 === "contracts" && table2 === "companies") {
    if (cols1.includes("resort_id")) return { left: "resort_id", right: "id" };
    if (cols1.includes("group_id")) return { left: "group_id", right: "id" };
  }
  // Generic: look for sub_contract_id link
  if (cols1.includes("sub_contract_id") && cols2.includes("sub_contract_id")) {
    return { left: "sub_contract_id", right: "sub_contract_id" };
  }
  if (cols1.includes("contract_id") && cols2.includes("contract_id")) {
    return { left: "contract_id", right: "contract_id" };
  }
  // table1 has {table2_singular}_id
  const singularTable2 = table2.replace(/s$/, "");
  const fk = `${singularTable2}_id`;
  if (cols1.includes(fk) && cols2.includes("id")) {
    return { left: fk, right: "id" };
  }

  return null;
}

function buildExplanation(intent: ParsedIntent, mainTable: string): string {
  const parts: string[] = [];

  if (intent.isCount && intent.groupBy) {
    parts.push(`Counting rows in **${mainTable}** grouped by **${intent.groupBy}**`);
  } else if (intent.isCount) {
    parts.push(`Counting all rows in **${mainTable}**`);
  } else if (intent.columns.length > 0) {
    parts.push(`Fetching **${intent.columns.join(", ")}** from **${mainTable}**`);
  } else {
    parts.push(`Fetching all columns from **${mainTable}**`);
  }

  if (intent.needsJoin && intent.tables.length >= 2) {
    parts.push(`joined with **${intent.tables[1]}**`);
  }

  if (intent.filters.length > 0) {
    const filterDesc = intent.filters.map(f => `${f.col} ${f.op} ${f.value}`).join(", ");
    parts.push(`filtered by ${filterDesc}`);
  }

  if (intent.orderBy) {
    parts.push(`sorted by **${intent.orderBy.col}** ${intent.orderBy.dir === "DESC" ? "descending" : "ascending"}`);
  }

  if (intent.limit) {
    parts.push(`limited to **${intent.limit}** rows`);
  }

  return parts.join(", ") + ".";
}
