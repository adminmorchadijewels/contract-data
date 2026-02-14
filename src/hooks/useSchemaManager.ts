import { useQuery } from "@tanstack/react-query";

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  is_primary: boolean;
  is_foreign_key: boolean;
  fk_table: string | null;
  fk_column: string | null;
}

export interface TableInfo {
  table_name: string;
  columns: ColumnInfo[];
}

export interface NewColumn {
  name: string;
  type: string;
  is_nullable: boolean;
  default_value: string;
}

export interface ForeignKey {
  column_name: string;
  ref_table: string;
  on_delete: "cascade" | "set_null";
}

// Schema manager is not applicable with Excel-based storage.
// This hook returns empty data and no-op mutations.
export function useSchemaManager() {
  const { data: schema, isLoading, error, refetch } = useQuery({
    queryKey: ["db_schema"],
    queryFn: async () => {
      return [] as TableInfo[];
    },
  });

  const noOp = async () => {};

  return {
    schema: schema || [],
    isLoading,
    error,
    refetch,
    addColumn: noOp,
    deleteColumn: noOp,
    renameColumn: noOp,
    createTable: noOp,
    isAddingColumn: false,
    isDeletingColumn: false,
    isRenamingColumn: false,
    isCreatingTable: false,
  };
}
