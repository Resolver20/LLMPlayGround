import {
  Handle,
  Position,
  useReactFlow,
  getIncomers,
  getOutgoers,
  NodeToolbar,
} from "@xyflow/react";
import { useState, useEffect, useRef } from "react";
import { fetch_LLama } from "../JavaScript/Request";
import { EventEmitter } from "events";
import { FiCodepen } from "react-icons/fi";
import "../css/LLM.css";


export const LLM = ({ id, data }) => {
  
  const processed_data = Object.entries(data.input_data) .filter(([key]) => key !== id) .map(([_, value]) => value);
  const [inputValue, setInputValue] = useState(processed_data);
  const [boolean, setBoolean] = useState(false);

  const buttonRef = useRef();
  const rf = useReactFlow();
  const [output, setOutput] = useState(data.node_data);
  const current_node = rf.getNodes().find((node) => node.id === id);
  const node = rf.getNode(id);

  const isMounted1=useRef(false);
  const isMounted2=useRef(false);
  const isMounted3=useRef(false);
  console.log("LLM (message : data )=>  ", data);
  console.log("LLM Node ",current_node);

  const connected_ids = getOutgoers(node, rf.getNodes(), rf.getEdges()).map(
    (node) => node.id
  );



  useEffect(() => {
    console.log(" LLM => isMounted1.current ",isMounted1);
    if(isMounted1.current){

      console.log("LLM.useEffect([data.node_data]) => ",data);
      rf.setNodes((nodes) => {
        if (!nodes) return [];
        return nodes.map((node) => {
          if (connected_ids.includes(node.id)) {
            return {
              ...node,
              data: {
                ...(node.data || []),
                input_data: { ...node.data.input_data, [id]: data.node_data },
                update_from: "LLM",
              },
            };
          }
          return node;
        });
      });
    }else{
      isMounted1.current=true;
    }
  }, [data.node_data]);

  const onBooleanChange=(flag)=>{
    console.log("LLM.onBooleanChange => ",flag);

      rf.setNodes((nodes) => {
        if (!nodes) return [];
        return nodes.map((node) => {
            return {
              ...node,
              data: {
                ...(node.data || []),
                boolean_state: flag,
              },
            };
        });
        });
  };

  useEffect(()=>{
    console.log(" LLM => isMounted1.current ", isMounted2);
    if(isMounted2.current){

      console.log("LLM.useEffect([data.booleanState]) =>" ,data.boolean_state);
      setBoolean(data.boolean_state);
    }
    else{
      isMounted2.current=true;
    }

  },[data.boolean_state])


      
    const streamEmitter = new EventEmitter();

    const handleButtonClick = (
      event,
    ) => {
      streamEmitter.removeAllListeners("data");
      streamEmitter.removeAllListeners("end");
      setOutput("");

      fetch_LLama(event, data, streamEmitter, id, "/queryGrok");
      let fragment_chunk = "";
      streamEmitter.on("data", (chunk) => {
        onBooleanChange(true);
        const fragment = chunk;
        setOutput((prev) => prev + fragment);
        fragment_chunk += fragment;
      });
      streamEmitter.on("end", () => {
        rf.updateNode(id, (node) => ({
          ...node,
          data: { ...(node.data || []), node_data: fragment_chunk, update_from: "done_updating", },
        }));
        onBooleanChange(false);
      });
    };



  useEffect(() => {
    console.log(" LLM => isMounted1.current ", isMounted3);
    if(isMounted3.current){

      const new_data = Object.entries(data.input_data)
      .filter(([key]) => key !== id)
      .map(([_, value]) => value);
      console.log("LLM.useEffect([data.input_data]) => ", data);
      setInputValue(new_data);
      
      if (data.update_from === "LLM") {
        console.log( "LLM.useEffect([data. input_data]) => ( message : clicking the run button )", data );
        buttonRef.current.click() ;
      }
    }
    else{
      isMounted3.current=true;
    }
  }, [data.input_data]);


   
  return (
    <>
      <NodeToolbar
        isVisible={true}
        position={data.toolbarPosition}
        style={styles.toolbar}
      >
        <button
          ref={buttonRef}
          onClick={(event) =>
            handleButtonClick(
              event
            )
          }
          disabled={boolean}
          style={{
            ...styles.button,
            backgroundColor:  boolean  ? "transparent" : "blue",
          }}
        >
          <FiCodepen style={styles.icon} />
        </button>
      </NodeToolbar>

      <Handle type="target" position={Position.Left} />

      <div style={styles.container}>
        <div style={styles.inputContainer}>
          <div style={styles.header}>Input</div>
          <div style={styles.inputContent} className="nowheel">
            {inputValue.length ? (
              inputValue.map((info, index) => (
                <div key={index} style={styles.inputRow}>
                  <div>{index + 1}.</div>
                  <div>{info}</div>
                </div>
              ))
            ) : (
              <div style={styles.noInput}>No Input Nodes Found</div>
            )}
          </div>
        </div>

        <div style={styles.outputContainer} className="nowheel">
          {output || "Awaiting output..."}
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </>
  );
};

const styles = {
  container: {
    width: "300px",
    height: "300px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  inputContainer: {
    height: "120px",
    padding: "10px",
    borderBottom: "1px solid #ddd",
    overflowY: "auto",
  },
  header: {
    fontWeight: "bold",
    marginBottom: "5px",
    fontSize: "14px",
  },
  inputContent: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  inputRow: {
    display: "flex",
    flexDirection: "row",
    gap: "5px",
    fontSize: "13px",
  },
  noInput: {
    fontStyle: "italic",
    color: "#999",
  },
  outputContainer: {
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    color: "#333",
    overflowY: "auto",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "5px",
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#ddd",
    cursor: "not-allowed",
  },
  icon: {
    fontSize: "18px",
  },
};
