
import {FlowWrapper} from "./Partitions/Flow.jsx";
import { Toaster } from "sonner";


export const url = import.meta.env.VITE_VERCEL_HOST;

export default function App() {
  return (
    <div style={styles.container}>
      <Toaster richColors position="top-center" />
      <FlowWrapper />
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
