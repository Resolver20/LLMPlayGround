import { getOutgoers, Handle, Position, useReactFlow } from "@xyflow/react";
import { useRef, useEffect, useState,useCallback } from "react";



export const TextInput = ({ id,data }) => {
  const rf = useReactFlow();
  const current_node = rf.getNodes().find((node) => node.id === id);
  const [inputData, setInputData] = useState(data.node_data);
  const inputRef = useRef();
  const isMounted1=useRef(false);
  // console.log(id,current_node.data.node_data);
    const node = rf.getNode(id);

  // console.log("TextInput => ",node);

  // useEffect(()=>{
    // setInputData(current_node.data.node_data);
  // },[]);

  const connected_nodes = getOutgoers(
    current_node,
    rf.getNodes(),
    rf.getEdges()
  );
  const connected_ids = connected_nodes.map((node) => node.id);

  useEffect(() => 
    {
      // console.log("TextInput => isMounted1 ", isMounted1);
      if(isMounted1.current){

        const current_node=rf.getNode(id);
        if(current_node.data.node_data!==inputData){
          
          // console.log("TextInput.useEffect([inputData]).updateNode  (message : Updating current Nodes data ) =>" ,inputData ,":end")  
          rf.updateNode(id, (node) => ({ ...node, data: { ...node.data, node_data: inputData, }, }));
          
          // console.log("TextInput.useEffect([inputData]).setNodes  (message : propagating changes to other connected nodes ) => ")
          // Propagate input data to connected nodes
          rf.setNodes((nodes) =>
            nodes.map((node) => {
              // console.log("updating connecting nodes from InputText");
              // console.log("TextInput.useEffect([inputData]) => ",node);
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
      }
      else{
        isMounted1.current=true;
      }
        
    }, [inputData]);

  const handleDataChange = useCallback((event) => {
    const input = event.target.value;
    // console.log("TextInput.handleDataChange  (message : There is an input Data change ) =>", input);
    setInputData(input);

    if (inputRef.current) {
      // console.log("Height Change");
      inputRef.current.style.height = "70px"; // Reset height for scrollHeight recalculation
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${scrollHeight}px`; // Adjust height dynamically
    }
  },[]);

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
