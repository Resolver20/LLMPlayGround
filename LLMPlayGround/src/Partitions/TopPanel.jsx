import { useReactFlow ,Panel} from "@xyflow/react";
import { MdOutlineSaveAlt } from "react-icons/md";
import {useRef,useContext,useState,useEffect,useCallback} from "react";
import {  useNavigate } from "react-router";
import {MySavedContext,MyTopPanelContext} from "./Flow.jsx";
import { AiOutlineClear } from "react-icons/ai";
import { queryUserFlows } from "./SidePanel.jsx";
import CircularProgress from "@mui/joy/CircularProgress";
import { MdLightMode } from "react-icons/md";
import { TiDocumentAdd } from "react-icons/ti";
import { IoIosLogOut } from "react-icons/io";
import { url } from "../App.jsx";
import { toast } from "sonner";
import Tooltip from "@mui/joy/Tooltip";
import { authenticationFailed } from "../JavaScript/EasterEggs.js";

export const TopPanel=()=>{
    const rf=useReactFlow();
    const [savedFlows, setSavedFlows] = useContext(MySavedContext);
    const {isLoading, setIsLoading, mode, setMode, titleInputRef,isTitleEmpty,setIsTitleEmpty} = useContext(MyTopPanelContext);
    const styles=getStyles(mode,isTitleEmpty);
    const navigate = useNavigate();


    const handleSaveShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveFlow();
      }
    };
    useEffect(() => {
      
      window.addEventListener('keydown', handleSaveShortcut);
      return () => {
        window.removeEventListener('keydown', handleSaveShortcut);
      };
    }, []);

    const saveFlow = async () => {
      if (rf) {
        if(localStorage.getItem("CurrentFlow")=="duplicate"){return;}
        setIsLoading(true);
        const data_id = localStorage.getItem("CurrentFlow");
        localStorage.setItem("CurrentFlow", "duplicate");
        const flow = rf.toObject();
        const data = JSON.stringify(flow);
        const title = titleInputRef.current.value;
        if (title.length == 0) {
          toast.error(`${import.meta.env.VITE_ASSISTANT}Please Enter The Title to Save`);
          localStorage.setItem("CurrentFlow", data_id);
          setIsTitleEmpty(true);
          setIsLoading(false);
          return;
        }
        // console.log("Value of mode",mode);
        setIsTitleEmpty(false);
        try {
          const response = await fetch(url + import.meta.env.VITE_SAVE_DATA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: window.localStorage.getItem("access_token"),
              data: data,
              title: title,
              id: data_id,
            }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const res_data = await response.json();
          if(res_data.failure){ 
            authenticationFailed(navigate);
            return;
          }

          if (data_id == -1) {
            toast.success( `${import.meta.env.VITE_ASSISTANT} Successfully Saved !!` );
          }
          else{
            toast.success( `${import.meta.env.VITE_ASSISTANT} Successfully Updated !!` );
          }
          localStorage.setItem("CurrentFlow",res_data._id);
          queryUserFlows(setSavedFlows, setIsLoading);
        } catch (err) {
          console.log(err);
        }
        setIsLoading(false);
      }
    };

    const LogOut=()=>{
        localStorage.removeItem("access_token");
        navigate("/");
    }
    
    const createNewFlow=useCallback(async ()=>{
      toast( `${import.meta.env.VITE_ASSISTANT}Created New Flow` );
      rf.setNodes([]);
      rf.setEdges([]);
      rf.setViewport([]);
      titleInputRef.current.value = "";
      setIsTitleEmpty(false);
      localStorage.setItem("CurrentFlow",-1);
    },[]);
    
    const ChangeColor=()=>{
      localStorage.setItem("isLight",!mode);
      setMode(!mode);
    }
    return (
      <>
        <Panel position="top-right">
          <div style={styles.topRight_buttons}>
            <button style={styles.loading_animation_button} onClick={saveFlow}>
              {isLoading && (
                <CircularProgress
                  color="danger"
                  variant="solid"
                  size="sm"
                  thickness={4}
                />
              )}
            </button>

            <Tooltip title="New Flow" variant="soft">
              <button
                style={styles.action_buttons}
                onClick={createNewFlow}
              >
                <TiDocumentAdd
                  style={styles.action_icon}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.cursor = "pointer";
                  }}
                />
              </button>
            </Tooltip>
            <Tooltip title="Change Mode" variant="soft">
            <button style={styles.action_buttons} onClick={ChangeColor}>
              <MdLightMode
                style={styles.action_icon}
                onMouseEnter={(event) => {
                  event.currentTarget.style.cursor = "pointer";
                }}
                />
            </button>
            </Tooltip>
            <Tooltip title="LogOut" variant="soft">
            <button style={styles.action_buttons} onClick={LogOut}>
              <IoIosLogOut
                style={styles.action_icon}
                onMouseEnter={(event) => {
                  event.currentTarget.style.cursor = "pointer";
                }}
                />
            </button>
              </Tooltip>
          </div>
        </Panel>

        <Panel position="top-left">
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Enter the title"
            style={styles.input_div}
          />
        </Panel>
      </>
    );
}
export default TopPanel;

const getStyles = (mode,isTitleEmpty) => ({
  action_icon: {
    backgroundColor: "transparent",
    width: "33px",
    height: "33px",
    color: mode ? "black" : "white",
  },
  action_buttons: {
    backgroundColor: "transparent",
    border: "none",
  },
  input_div: {
    width: "100%",
    maxWidth: "400px",
    height: "40px",
    border: "none",
    borderBottom: isTitleEmpty?"1px solid red":("1px solid " + (mode ? "black" : "white")),
    backgroundColor: "transparent",
    outline: "none",
    fontWeight: "bold",
    fontSize: "1.5rem",
    padding: "1px",
    color: mode ? "black" : "white",
    textOverflow: "clip",
  },
  loading_animation_button: {
    position: "absolute",
    backgroundColor: "transparent",
    width: "40px",
    height: "40px",
    border: "none",
    right: "130px",
    top: "1px",
  },
  topRight_buttons: {
    width: "100px",
    height: "40px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
});