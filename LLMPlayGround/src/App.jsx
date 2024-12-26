
import {FlowWrapper} from "./Partitions/Flow.jsx";

export const url = import.meta.env.VITE_VERCEL_HOST;

export default function App() {
  
  return (
    <div style={styles.container}>
    <FlowWrapper/>
    </div>
  );
}
const styles={
  container:{
    display:"flex",
    flexDirection:"row",
    margin:"0px",
    padding:"0px",
  }
}
