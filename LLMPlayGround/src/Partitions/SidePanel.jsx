import { DraggableNode } from "../NodeTypes/DraggableNode.jsx";
import { NavLink } from "react-router";
import { BsCollection } from "react-icons/bs";
import {useCallback,useEffect, useState,useContext,useRef} from "react";
import { useReactFlow } from "@xyflow/react";
import { RxCross1 } from "react-icons/rx";
import { MySavedContext,MyTopPanelContext} from "./Flow.jsx";
import { url } from "../App.jsx";
import Tooltip from "@mui/joy/Tooltip";
import { toast } from "sonner";

export const queryUserFlows = async (setSavedFlows, setIsLoading) => {

  await setIsLoading(true);
  try {
    const token = window.localStorage.getItem("access_token");
    const response = await fetch(url + "/getSaved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("setting Saved Flows and IsLoading to false");
    await setSavedFlows(data.message);
    await setIsLoading(false);
  } catch (error) {
    console.log(error);
  }
};


const DeleteFlow = async (
  elem,
  setSavedFlows,
  rf,
  titleInputRef,
  setIsLoading,
  setIsTitleEmpty
) => {
  try {
    const token = window.localStorage.getItem("access_token");
    const response = await fetch(url + "/deleteData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token, title: elem.title }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    // console.log(data.message);
    setIsTitleEmpty(false);
    localStorage.setItem("CurrentFlow", -1);
    rf.setNodes([]);
    rf.setEdges([]);
    rf.setViewport([]);
    titleInputRef.current.value = "";
    await queryUserFlows(setSavedFlows, setIsLoading);
    toast.info(`${import.meta.env.VITE_ASSISTANT}Deleted Flow ${elem.title} ! You are In New Flow `);

  } catch (error) {
    console.log(error);
  }
};


export const SidePanel = () => {
  const {setIsLoading, mode, titleInputRef,setIsTitleEmpty} = useContext(MyTopPanelContext);
  const rf=useReactFlow();
  const [savedFlows,setSavedFlows]=useContext(MySavedContext);
  const styles = getStyles(mode);

  useEffect(()=>{
    queryUserFlows(setSavedFlows, setIsLoading);
    localStorage.setItem("CurrentFlow",-1);
    // console.log("Tools.useEffect([]) => ", " called queryUserFlows ");
  },[]);

  const UpdateFlow=(elem,setIsLoading)=>{
    // console.log("id of the flow ", elem._id);
    setIsTitleEmpty(false);
    localStorage.setItem("CurrentFlow",elem._id);
    const currentFlow=JSON.parse(elem.data);
    if(titleInputRef){
      titleInputRef.current.value=elem.title;
    }

    rf.setNodes(currentFlow.nodes || []);
    rf.setEdges(currentFlow.edges || []);
    rf.setViewport(currentFlow.viewport || []);
    // setViewport({ x, y, zoom });
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.draggableNodes}>
          <DraggableNode title="LLM" type="LLM" label="LLM" />
          <DraggableNode type="TextInput" label="TextInput" />
        </div>
        <div style={styles.saved_div}>
          <div style={styles.heading}>
            {" "}
            <h3> Saved </h3>{" "}
          </div>
          <div style={styles.saved_item_container}>
            {savedFlows
              ? savedFlows.map((elem, index) => (
                  <div
                    key={index}
                    style={styles.saved_item}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = "darkgray";
                      event.currentTarget.style.cursor = "pointer";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <button
                      style={styles.saved_item_button}
                      onClick={() => UpdateFlow(elem, setIsLoading)}
                      onMouseEnter={(event) => { event.currentTarget.style.cursor = "pointer"; }}
                    >
                      {elem.title}
                    </button>
                    <div style={styles.icon_div}>
                      <Tooltip
                        title="Delete Flow"
                        variant="soft"
                        placement="right-end"
                      >
                        <span>
                          <RxCross1
                            onClick={() => {
                              DeleteFlow(
                                elem,
                                setSavedFlows,
                                rf,
                                titleInputRef,
                                setIsLoading,
                                setIsTitleEmpty
                              );
                            }}
                            style={styles.cross_icon}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.cursor = "pointer";
                              event.currentTarget.style.color = "red";
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.color = mode
                                ? "white"
                                : "black";
                            }}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                ))
              : "none"}
          </div>
        </div>
      </div>
    </>
  );
};

const getStyles = (mode) => ({
  container: {
    width: "7vw",
    borderRight: "1px solid " + (mode ? "black" : "white"),
    height: "calc(100vh )",
    backgroundColor: mode ? "white" : "black",
    display: "flex",
    color: "black",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // gap: "10px",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  draggableNodes: {
    width: "100%",
    height: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: mode ? "white" : "black",
    paddingTop: "10px",
    gap: "10px",
  },
  saved_div: {
    width: "100%",
    height: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mode ? "white" : "black",
  },

  heading: {
    color: mode ? "black" : "white",
    borderBottom: "1px solid " + (mode ? "black" : "white"),
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    fontFamily: "Aileron",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "5%",
    width: "100%",
  },

  saved_item_container: {
    // backgroundColor: mode ? "white" : "black",
    // backgroundColor: "orange",
    backgroundColor: "transparent",
    overflowY: "scroll",
    display: "flex",
    scrollbarWidth: "none", // For Firefox
    msOverflowStyle: "none", // For IE and Edge
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    height: "95%",
    width: "100%",
    gap: "1px",
    paddingTop: "10px",
  },

  saved_item: {
    width: "100%",
    height: "30px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "pink",
    backgroundColor: "transparent",
  },
  saved_item_button: {
    width: "80%",

    height: "30px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis ellipsis",
    // backgroundColor: "red",
    backgroundColor: "transparent",
    color: mode ? "black" : "white",
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon_div: {
    // backgroundColor: "gray",
    backgroundColor: "transparent",

    height: "100%",
    width: "20%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
  },
  cross_icon: {
    width: "10px",
    height: "30px",
    color: mode ? "white" : "black",
  },
  logout: {
    position: "absolute",
    bottom: "10px",
    color: "white",
  },
});
