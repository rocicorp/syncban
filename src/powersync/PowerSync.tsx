import { PowerSyncDatabase } from "@powersync/web";
import { PowerSyncContext } from "@powersync/react";
import { Connector } from "./connector";
import { AppSchema } from "./app-schema";
import { useEffect, useState } from "react";
import { Board } from "./Board";
import Logger from "js-logger";
import { Dump } from "./Dump";

export default function PowerSync({ content }: { content: "board" | "dump" }) {
  // State holds the DB instance, initialized client-side
  const [powerSync, setPowerSync] = useState<PowerSyncDatabase | null>(null);

  useEffect(() => {
    // Runs only on client
    console.log("Initializing PowerSync database on client...");
    let db: PowerSyncDatabase | null = null;
    try {
      db = new PowerSyncDatabase({
        schema: AppSchema,
        database: {
          dbFilename: "powersync.db",
        },
      });

      const connector = new Connector();
      // Initialize connector and connect
      connector.login().then(() => {
        if (db) {
          db.connect(connector);
          console.log("PowerSync connected on client.");
          // Set state once connected
          setPowerSync(db);
        }
      });
    } catch (error) {
      console.error("Failed to initialize PowerSync:", error);
      // Handle initialization error appropriately
    }

    // Cleanup function
    return () => {
      console.log("Disconnecting PowerSync on unmount...");
      // Use variable `db` captured in closure for cleanup
      // Check if db was successfully initialized before cleaning up
      if (db) {
        db.disconnectAndClear();
      }
    };
  }, []); // Empty dependency array: runs once on mount

  // Configure logger
  Logger.useDefaults();
  Logger.setLevel(Logger.DEBUG);

  // Show loading state while initializing
  if (!powerSync) {
    return <div>Initializing PowerSync Database...</div>;
  }

  // Render provider and board once ready
  return (
    <PowerSyncContext.Provider value={powerSync}>
      {content === "board" ? <Board /> : <Dump />}
    </PowerSyncContext.Provider>
  );
}
