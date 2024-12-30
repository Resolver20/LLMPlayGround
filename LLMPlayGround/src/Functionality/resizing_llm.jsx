export const handleMouseDown = ( e,props) => {
  const initialMouseX = e.clientX;
  const initialMouseY = e.clientY;
  const initialWidth = props.llm_resizable_ref.current.offsetWidth;
  const initialHeight = props.llm_resizable_ref.current.offsetHeight;

  const onMouseMove = (e) => {
    const newWidth = initialWidth + (e.clientX - initialMouseX);
    const newHeight = initialHeight + (e.clientY - initialMouseY);
    // console.log(newWidth, newHeight);
    const new_width = Math.max(newWidth, 300);
    const new_height = Math.max(newHeight, 300);
    // console.log("updated ", new_width, new_height);
     props.rf.updateNode(props.id, (node) => ({
       ...node,
       data: {
         ...(node.data || []),
         "node_width":newWidth,
         "node_height":newHeight,
       },
     }));
    props.set_llm_height(new_height);
    props.set_llm_width(new_width);
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};
