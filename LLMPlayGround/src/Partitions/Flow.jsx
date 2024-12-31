import React, {
  useCallback,
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  getOutgoers,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SidePanel } from "./SidePanel.jsx";
import { LLM } from "../NodeTypes/LLM.jsx";
import { TextInput } from "../NodeTypes/TextInput.jsx";
import {TopPanel} from "./TopPanel.jsx";

// let id=3;
const getId=()=>{return `id_${(new Date()).getTime()}`}

const nodeTypes = {
  LLM: LLM,
  TextInput:TextInput,
};
const initialNodes = [
  // { id: "1", position: { x: 0, y: 0 }, data: { label: "First Node" } },
  // { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [
  //  { id: "e1-2", source: "1", target: "2", animated: true, label: "to the" }, 
  ];


export const MySavedContext=createContext();
export const MyTopPanelContext=createContext();

export const FlowWrapper=()=>{
    const [isLoading, setIsLoading] = useState(false);
    const titleInputRef=useRef();
    const [isTitleEmpty, setIsTitleEmpty] = useState(false);
    const [savedFlows, setSavedFlows] = useState([]);

    const value=localStorage.getItem("isLight");
    if(value===null){
      localStorage.setItem("isLight",false);
    }

    //dark and light Modes 
    const [mode, setMode] = useState((localStorage.getItem("isLight")=="true")?true:false);

    return (
      <ReactFlowProvider>
        <MyTopPanelContext.Provider value={{isLoading, setIsLoading, mode, setMode, titleInputRef,isTitleEmpty,setIsTitleEmpty}} >
          <MySavedContext.Provider value={[savedFlows, setSavedFlows]}>
            <SidePanel />
            <Flow />
          </MySavedContext.Provider>
        </MyTopPanelContext.Provider>
      </ReactFlowProvider>
    );
};

const Flow=()=>{
  console.log("Rendering  Flow ");
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeData,setnodeData]=useState("");
    const {mode} = useContext(MyTopPanelContext);
    const styles=getStyles(mode);
    const rf = useReactFlow();


    
    const OnNodesChange = useCallback(
      (changes) => {
        console.log("On Nodes Change", changes);
        setNodes((nds) => applyNodeChanges(changes, nds));
      },
      [setNodes]
    );
    const OnEdgesChange = useCallback(
      (changes) => {
        if(changes.length!=0){

        const edge_data=rf.getEdges().filter((elem)=>elem.id==changes[0].id);
        if(changes[0].type=="remove"){
          // console.log("edge Removed");
          const targetId=edge_data[0].target; 
          const sourceId=edge_data[0].source; 

          
          rf.updateNode(targetId, (node) =>{
            const input_data_list = node.data.input_data;
            // console.log("input_datas =>", input_data_list);
            const updated_input_data_list = Object.keys(input_data_list) // If you need the keys, use Object.keys()
              .filter((key) => key !== sourceId) // Filter out the key you don't want
              .reduce((result, key) => {
                result[key] = input_data_list[key]; // Rebuild the object with the filtered keys
                return result;
              }, {}); // Starting with an empty object

            console.log("input_datas =>", updated_input_data_list);
            return { ...node, data: { ...(node.data || []),"input_data":updated_input_data_list } };
          } );
        }
      }

        setEdges((eds) => applyEdgeChanges(changes, eds))
      },
      [setEdges]
    );
    
    // console.log("getting Nodes" ,rf.getNodes())
    // console.log("getting Edges" ,rf.getEdges())

    const onConnect = useCallback(
    
      (connection) => setEdges((oldedges) => {
        const new_edges=addEdge(connection, oldedges);
        // console.log("Flow:onConnect =>",connection);
        const targetNode_ID=connection.target;
        const sourceNode_ID = connection.source;

        const targetNode=rf.getNodes().find((node)=>{if(node.id==targetNode_ID){return node}});
        const sourceNode=rf.getNodes().find((node)=>{if(node.id==sourceNode_ID){return node}});
        let sourceNode_data=sourceNode.data.node_data;

        // console.log("Data ", sourceNode_data);

        // console.log("Flow:onConnect ==>", targetNode_ID,sourceNode_ID,targetNode,sourceNode,sourceNode_data);
        let type="InputText";
        if(sourceNode.type=="LLM"){
          type="LLM";
        }

        setNodes((nodes)=>{
          if(!nodes){return [];}
          const new_nodes=nodes.map((node)=>{
            if (node.id== targetNode_ID){
              // console.log("Flow:onConnect ==>", sourceNode_data, node);
              return {
                ...node,
                data: {
                  ...(node.data || []),
                  "input_data": { ...node.data.input_data, [sourceNode_ID]: sourceNode_data },
                  "update_from":type,
                },
              };
            }
            return node;
          });
          return new_nodes;

        }
      );

        return new_edges;}
      ),
      [setEdges]
    );
    
    const onDragOver=useCallback((event)=>{
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
    },[])
    
    const onDrop=useCallback((event)=>{
      event.preventDefault();
        if (event?.dataTransfer?.getData("application/reactflow")) {
          const appData = JSON.parse( event.dataTransfer.getData("application/reactflow") );
          const type = appData?.nodeType;
          // console.log(type);
          if (typeof type === "undefined" || !type) {
            return;
          }

          const position = rf.screenToFlowPosition({
            x: event.clientX ,
            y: event.clientY ,
          });

          const node_id=getId();
          console.log("node_id",node_id);
          const newNode = {
            id: node_id,
            type,
            position,
            data: {
              "node_data":`${nodeData}`,
              "input_data":{},
              "output_data":{},
              "update_from":"",
              "boolean_state":false,
              "node_width":300,
              "node_height":300

          },
          };
          // console.log(newNode);
          setNodes((nodes)=>[...nodes,newNode]);
        }
    },[]);




    return (
      <div style={{ width: "93vw", height: "calc(100vh)", padding:"1px", backgroundColor:"black" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={OnNodesChange}
          onEdgesChange={OnEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          <Controls color="black" />
          <MiniMap />
          <Background variant="dots"  style={styles.container} gap={12} size={1} />

          <TopPanel/>
           </ReactFlow>
      </div>
    );
  }


  const getStyles =(mode)=>( {
    container: {
      backgroundColor: mode?"white":"black",
      color:mode?"white":"black",
    },
   
  });
