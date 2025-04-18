import { usePowerSync } from "@powersync/react";
import { useState } from "react";
import { nanoid } from "nanoid";

export function CreateItemForm() {
  const db = usePowerSync();
  const [newItem, setNewItem] = useState({
    column_id: "",
    title: "",
    body: "",
  });

  const handleCreateItem = async () => {
    try {
      await db.execute(
        'INSERT INTO item (id, column_id, title, body, "order") VALUES (?, ?, ?, ?, ?)',
        [nanoid(), newItem.column_id, newItem.title, newItem.body, "a0"]
      );

      // Reset form
      setNewItem({
        column_id: "",
        title: "",
        body: "",
      });
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h3>Create New Item</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Column ID: </label>
        <input
          value={newItem.column_id}
          onChange={(e) =>
            setNewItem({ ...newItem, column_id: e.target.value })
          }
          placeholder="e.g. col-1"
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Title: </label>
        <input
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          placeholder="Item title"
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Body: </label>
        <input
          value={newItem.body}
          onChange={(e) => setNewItem({ ...newItem, body: e.target.value })}
          placeholder="Item description"
        />
      </div>
      <div>
        <button onClick={handleCreateItem}>Submit</button>
      </div>
    </div>
  );
}
