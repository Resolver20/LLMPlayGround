import { getOutgoers, Handle, Position, useReactFlow } from "@xyflow/react";
import { useRef, useEffect, useState,useCallback } from "react";



export const TextInput = ({ id,data }) => {
  const rf = useReactFlow();
  const current_node = rf.getNodes().find((node) => node.id === id);

  const [inputData, setInputData] = useState(current_node.data.node_data);
  const inputRef = useRef();
  const isMounted1 = useRef(false);
  const node = rf.getNode(id);

  const connected_nodes = getOutgoers(
    current_node,
    rf.getNodes(),
    rf.getEdges()
  );
  const connected_ids = connected_nodes.map((node) => node.id);

  useEffect(() => {
    // console.log("TextInput => isMounted1 ", isMounted1);
    if (isMounted1.current) {
      const current_node = rf.getNode(id);
      if (current_node.data.node_data !== inputData) {
        rf.updateNode(id, (node) => ({
          ...node,
          data: { ...node.data, node_data: inputData },
        }));

        rf.setNodes((nodes) =>
          nodes.map((node) => {
            if (connected_ids.includes(node.id)) {
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  input_data: { ...node.data.input_data, [id]: inputData },
                  update_from: "InputText",
                },
              };
            }
            return node;
          })
        );
      }
    } else {
      isMounted1.current = true;
    }
  }, [inputData]);

  const handleDataChange = useCallback((event) => {
    const input = event.target.value;
    setInputData(input);

    if (inputRef.current) {
      // console.log("Height Change");
      inputRef.current.style.height = "70px"; // Reset height for scrollHeight recalculation
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${scrollHeight}px`; // Adjust height dynamically
    }
  }, []);

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>Input</div>
        <textarea
          ref={inputRef}
          value={inputData}
          onChange={handleDataChange}
          placeholder="Type here..."
          style={styles.input}
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export const styles = {
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "15px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    width: "280px",
  },
  header: {
    fontWeight: "bold",
    fontSize: "16px",
    color: "#333",
  },
  input: {
    width: "100%",
    minHeight: "70px",
    resize: "none",
    overflow: "hidden",
    padding: "10px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    backgroundColor: "#f9f9f9",
  },
  inputFocus: {
    borderColor: "#007BFF",
  },
};
