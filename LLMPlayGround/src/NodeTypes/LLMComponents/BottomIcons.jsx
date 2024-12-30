
import { handleMouseDown } from "../../Functionality/resizing_llm";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { RxClipboardCopy } from "react-icons/rx";
import { toast } from "sonner";

export const BottomIcons=({props})=>{
return (

<div style={styles.bottom_output_icons} className="nodrag">
  <div
    onMouseEnter={(event) => {
      event.currentTarget.style.cursor = "pointer";
    }}
  >
    <RxClipboardCopy
      style={{ color: "gainsboro" }}
      onMouseEnter={(event) => {
        event.preventDefault();
        event.currentTarget.style.color = "green";
      }}
      onMouseLeave={(event) => {
        event.preventDefault();
        console.log("left");
        event.currentTarget.style.color = "gainsboro";
      }}
      onClick={(event) => {
        navigator.clipboard.writeText(props.output).then(
          () =>
            toast.success(
              `${import.meta.env.VITE_ASSISTANT}Text copied to clipboard!`
            ),
          () =>
            toast.error(`${import.meta.env.VITE_ASSISTANT}Failed to copy text.`)
        );
      }}
    />
  </div>

  <div
    className="nodrag"
    style={styles.expanding_icon_container}
    onMouseDown={(event) =>
      handleMouseDown( event, props )
    }
  >
    <CgArrowsExpandLeft
      style={{ color: "gainsboro" }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color = "gray";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color = "gainsboro";
      }}
    />
  </div>
</div>

); 
}

const styles = {
  bottom_output_icons: {
    width: "40px",
    height: "20px",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    margin: "5px",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    bottom: "0",
    right: "0",
  },
  expanding_icon_container: {
    cursor: "se-resize",
  },
};

