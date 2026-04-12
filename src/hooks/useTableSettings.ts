import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { selectWhere, upsertRow } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface TableSetting {
  id?: string;
  table_name: string;
  visible: boolean;
  column_config: ColumnConfig[];
}

// Default columns for each table
export const DEFAULT_COLUMNS: Record<string, ColumnConfig[]> = {
  companies: [
    { key: "name", label: "Name", visible: true, order: 0 },
    { key: "type", label: "Type", visible: true, order: 1 },
    { key: "code", label: "Code", visible: true, order: 2 },
    { key: "atoll", label: "Atoll", visible: true, order: 3 },
    { key: "contract_count", label: "No. of Contracts", visible: true, order: 4 },
    { key: "linked_resorts", label: "Linked Resorts", visible: true, order: 5 },
    { key: "address", label: "Address", visible: true, order: 6 },
    { key: "registration_no", label: "Registration No.", visible: true, order: 7 },
    { key: "coordinates", label: "Coordinates", visible: false, order: 8 },
  ],
  contracts: [
    { key: "contract_code", label: "Contract Code", visible: true, order: 0 },
    { key: "group", label: "Group", visible: true, order: 1 },
    { key: "resort", label: "Resort", visible: true, order: 2 },
    { key: "sub_contracts", label: "Sub-Contracts", visible: true, order: 3 },
    { key: "status", label: "Status", visible: true, order: 4 },
  ],
};

export function useTableSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { data: settings, isLoading } = useQuery({
    queryKey: ["table_settings", userId],
    queryFn: async () => {
      if (!userId) return [];
      return selectWhere("table_settings", "user_id", userId);
    },
    enabled: !!userId,
  });

  const getSettingsForTable = (tableName: string): TableSetting => {
    const found = settings?.find((s) => s.table_name === tableName) as TableSetting | undefined;
    if (found) {
      return {
        id: found.id,
        table_name: found.table_name,
        visible: found.visible,
        column_config: typeof found.column_config === "string"
          ? JSON.parse(found.column_config)
          : found.column_config as ColumnConfig[],
      };
    }
    return {
      table_name: tableName,
      visible: true,
      column_config: DEFAULT_COLUMNS[tableName] || [],
    };
  };

  const getVisibleColumns = (tableName: string): ColumnConfig[] => {
    const s = getSettingsForTable(tableName);
    return s.column_config
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order);
  };

  const upsertMutation = useMutation({
    mutationFn: async (setting: TableSetting) => {
      if (!userId) return;
      await upsertRow(
        "table_settings",
        {
          user_id: userId,
          table_name: setting.table_name,
          visible: setting.visible,
          column_config: setting.column_config,
        },
        "user_id,table_name",
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["table_settings"] }),
  });

  return {
    settings,
    isLoading,
    getSettingsForTable,
    getVisibleColumns,
    upsertSetting: upsertMutation.mutateAsync,
    allTableNames: Object.keys(DEFAULT_COLUMNS),
  };
}
