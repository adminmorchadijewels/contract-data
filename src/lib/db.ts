/**
 * db.ts — Supabase CRUD layer
 *
 * Drop-in async replacement for the synchronous excelDataService functions.
 * All hooks and components should import from here for data operations.
 */
import { supabase } from "./supabase";
import type { TableName } from "./excelDataService";

export type { TableName };

export async function selectAll<T = Record<string, unknown>>(table: TableName): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function selectById<T extends Record<string, unknown> = Record<string, unknown>>(
  table: TableName,
  id: string,
): Promise<T | undefined> {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as T | undefined;
}

export async function selectWhere<T extends Record<string, unknown> = Record<string, unknown>>(
  table: TableName,
  field: string,
  value: unknown,
): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").eq(field, value as string);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function insertRow<T = Record<string, unknown>>(
  table: TableName,
  row: Partial<T>,
): Promise<T> {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw new Error(error.message);
  return data as T;
}

export async function updateRow<T extends Record<string, unknown> = Record<string, unknown>>(
  table: TableName,
  id: string,
  updates: Partial<T>,
): Promise<T | null> {
  const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as T | null;
}

export async function deleteRow(table: TableName, id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteWhere(
  table: TableName,
  field: string,
  value: unknown,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq(field, value as string);
  if (error) throw new Error(error.message);
}

export async function upsertRow<T = Record<string, unknown>>(
  table: TableName,
  row: Partial<T>,
  onConflict: string,
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .upsert(row, { onConflict })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as T;
}
