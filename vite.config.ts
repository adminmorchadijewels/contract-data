import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import * as XLSX from "xlsx";


function excelWriterPlugin() {
  const dataDir = path.resolve(__dirname, "public/data");

  return {
    name: "excel-writer",
    configureServer(server: any) {
      server.middlewares.use("/__api/save-table", (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk: string) => (body += chunk));
        req.on("end", () => {
          try {
            const { table, rows } = JSON.parse(body);
            if (!table || !Array.isArray(rows)) {
              res.statusCode = 400;
              res.end("Invalid payload");
              return;
            }

            const wb = XLSX.utils.book_new();
            if (rows.length === 0) {
              const ws = XLSX.utils.aoa_to_sheet([]);
              XLSX.utils.book_append_sheet(wb, ws, table);
            } else {
              const flatRows = rows.map((row: any) => {
                const flat: Record<string, unknown> = {};
                for (const [key, val] of Object.entries(row)) {
                  flat[key] = Array.isArray(val) ? JSON.stringify(val) : val;
                }
                return flat;
              });
              const ws = XLSX.utils.json_to_sheet(flatRows);
              XLSX.utils.book_append_sheet(wb, ws, table);
            }

            const filePath = path.join(dataDir, `${table}.xlsx`);
            XLSX.writeFile(wb, filePath);

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (err: any) {
            console.error("Excel write error:", err);
            res.statusCode = 500;
            res.end(err.message);
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), excelWriterPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
