import { PowerSyncDatabase } from "@powersync/web";
import { PowerSyncContext } from "@powersync/react";
import { Connector } from "./connector";
import { AppSchema } from "./app-schema";
import { useMemo } from "react";
import { Board } from "./Board";
import Logger from "js-logger";

export default function PowerSync() {
  const powerSync = useMemo(() => {
    const db = new PowerSyncDatabase({
      // The schema you defined in the previous step
      schema: AppSchema,
      database: {
        // Filename for the SQLite database — it's important to only instantiate one instance per file.
        dbFilename: "powersync.db",
        // Optional. Directory where the database file is located.'
        // dbLocation: 'path/to/directory'
      },
    });

    const connector = new Connector();
    connector.login().then(() => {
      db.connect(connector);
    });

    return db;
  }, []);

  Logger.useDefaults();

  Logger.setLevel(Logger.DEBUG);

  return (
    <PowerSyncContext.Provider value={powerSync}>
      <Board />
    </PowerSyncContext.Provider>
  );
}
