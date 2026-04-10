import React, { useState, useRef, useCallback } from "react";

let blockCounter = 0;

function StickyBlock({ block, isSelected, onSelect, onDeleteBlock, onDeleteNote, setBlocks }) {
  const blockRef = useRef(null);
  const posRef = useRef({ x: block.x, y: block.y });

  const startDrag = useCallback((e) => {
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
    onSelect(block.id);
    const offsetX = e.clientX - posRef.current.x;
    const offsetY = e.clientY - posRef.current.y;
    const onMove = (eMove) => {
      posRef.current = { x: eMove.clientX - offsetX, y: eMove.clientY - offsetY };
      if (blockRef.current) {
        blockRef.current.style.left = posRef.current.x + "px";
        blockRef.current.style.top = posRef.current.y + "px";
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [block.id, onSelect]);

  const startRename = (e) => {
    e.stopPropagation();
    setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, editingName: true } : b));
  };

  const commitRename = (val) => {
    setBlocks(prev => prev.map(b =>
      b.id === block.id ? { ...b, name: val.trim() || b.name, editingName: false } : b
    ));
  };

  return (
    <div
      ref={blockRef}
      onMouseDown={startDrag}
      onClick={() => onSelect(block.id)}
      style={{
        position: "absolute",
        left: block.x,
        top: block.y,
        minWidth: 180,
        maxWidth: 260,
        background: "#fffa65",
        border: isSelected ? "2px solid #2266dd" : "2px solid transparent",
        borderRadius: 4,
        padding: 10,
        cursor: "grab",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 4 }}>
        {block.editingName ? (
          <input
            autoFocus
            defaultValue={block.name}
            onMouseDown={e => e.stopPropagation()}
            onBlur={e => commitRename(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") commitRename(e.target.value);
              if (e.key === "Escape") setBlocks(prev => prev.map(b =>
                b.id === block.id ? { ...b, editingName: false } : b
              ));
            }}
            style={{ fontSize: 12, fontWeight: 500, border: "1px solid #aaa", borderRadius: 3, padding: "1px 4px", background: "#fffde0", width: "100%" }}
          />
        ) : (
          <span
            onDoubleClick={startRename}
            title="Double-click to rename"
            style={{ fontSize: 12, fontWeight: "bold", color: "#555", cursor: "text", flex: 1 }}
          >
            {block.name}
          </span>
        )}
        <button onClick={() => onDeleteBlock(block.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>x</button>
      </div>

      {block.notes.length === 0 && (
        <p style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>No notes yet</p>
      )}
      {block.notes.map((note, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #ddd", borderRadius: 3, padding: "4px 6px", margin: "4px 0", fontSize: 13 }}>
          <span>{note}</span>
          <button onClick={() => onDeleteNote(block.id, i)} style={{ background: "#e33", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 11, padding: "1px 5px", marginLeft: 6 }}>X</button>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [blocks, setBlocks] = useState([
    { id: ++blockCounter, x: 20, y: 20, notes: [], name: "Block 1", editingName: false },
  ]);
  const [selectedId, setSelectedId] = useState(blockCounter);
  const [input, setInput] = useState("");

  const addBlock = () => {
    const id = ++blockCounter;
    const offset = blocks.length * 30;
    setBlocks(prev => [...prev, { id, x: 20 + offset, y: 20 + offset, notes: [], name: `Block ${id}`, editingName: false }]);
    setSelectedId(id);
  };

  const deleteBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedId(prev => {
      if (prev !== id) return prev;
      const remaining = blocks.filter(b => b.id !== id);
      return remaining.length ? remaining[remaining.length - 1].id : null;
    });
  };

  const addNote = () => {
    if (!input.trim() || !selectedId) return;
    setBlocks(prev => prev.map(b =>
      b.id === selectedId ? { ...b, notes: [...b.notes, input.trim()] } : b
    ));
    setInput("");
  };

  const deleteNote = (blockId, noteIndex) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, notes: b.notes.filter((_, i) => i !== noteIndex) } : b
    ));
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  return (
    <div style={{ fontFamily: "Arial", padding: 16 }}>
      <h1>Draggable Notes</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Write a note..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addNote()}
          style={{ padding: "6px 10px", fontSize: 14, flex: 1, minWidth: 160 }}
        />
        <button onClick={addNote} style={{ padding: "6px 12px" }}>Add note</button>
        <button onClick={addBlock} style={{ padding: "6px 12px", color: "#2266dd", borderColor: "#2266dd" }}>+ New block</button>
      </div>

      <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
        {selectedBlock ? `Adding notes to "${selectedBlock.name}"` : "Click a block to select it"}
      </p>

      <div style={{ position: "relative", height: "80vh", border: "1px dashed #ccc", borderRadius: 4, overflow: "hidden" }}>
        {blocks.map(block => (
          <StickyBlock
            key={block.id}
            block={block}
            isSelected={selectedId === block.id}
            onSelect={setSelectedId}
            onDeleteBlock={deleteBlock}
            onDeleteNote={deleteNote}
            setBlocks={setBlocks}
          />
        ))}
      </div>
    </div>
  );
}

export default App;