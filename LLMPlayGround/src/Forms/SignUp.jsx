import { useState, useRef } from "react";
import { NavLink ,useNavigate} from "react-router";
import { url } from "../App.jsx";
import { Toaster, toast } from "sonner";



const SignUp = () => {
  const [formFields, setFormFields] = useState({});
  const usernameRef = useRef();
  const pwdRef = useRef();
  const rePwdRef = useRef();
  const registerRef = useRef();
  const [boolean,setBoolean] =useState(true);
  const [feedback,setFeedback]=useState("");
  const navigate=useNavigate();

   const checkForEnter = (event,position) => {
     if (event.key === "Enter") {
        event.preventDefault();
        if (position == "username") {
           pwdRef.current.focus();
         }
        else if (position == "pwd") {
          rePwdRef.current.focus();
        }
        else{
          registerRef.current.click();
        }
     }
   };

  const Register= async ()=>{
       const userName = usernameRef.current.value;
       const pwd1 = pwdRef.current.value;
       const pwd2 = rePwdRef.current.value;
       if(pwd1===pwd2){
          try {
            const response = await fetch(url + "/Auth/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username: userName, password: pwd1 }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json(); 
            console.log("Message",data.message);
            if(data.id==-1){
                  toast.error("Username already taken. Please choose another.");
                  return;
            }

            navigate("/",{state:{"username":userName}});


          } catch (error) {
            toast.error("Server Error");
            pwdRef.current.style.borderColor = "black";
            rePwdRef.current.style.borderColor = "black";
            console.error("Error:", error); 
          }

          
        }
        else{
             pwdRef.current.value="";
             rePwdRef.current.value="";
             pwdRef.current.style.borderColor="red";
             rePwdRef.current.style.borderColor="red";
             setBoolean(false);
             setFeedback("Passwords do not match");
              toast.error(`${"Passwords do not match"}`);

        }
  }
  return (
    <div style={styles.main_div}>
              <Toaster richColors position="top-left" />

      <div style={styles.loginForm}>
        <div>
          <div style={styles.input_container}> <h3> Username </h3> <input ref={usernameRef} onKeyDown={(event) => checkForEnter(event, "username")} style={styles.input}  type="text" /></div>
          <div style={styles.input_container}> <h3> Password </h3> <input  type="password" ref={pwdRef} onKeyDown={(event) => checkForEnter(event, "pwd")} style={styles.input}  /> </div>
          <div style={styles.input_container}> <h3>Re-enter your password </h3> <input type="password" ref={rePwdRef}  onKeyDown={(event) => checkForEnter(event, "rePwd")} style={styles.input} /> </div>
          <div style={styles.input_container}> 
            <div> <NavLink to="/"> <h5 style={{color:"gray"}}>  { " Go Back " }</h5> </NavLink> </div>
            <button style={styles.submitButton} ref={registerRef} onClick={Register} onMouseEnter={(event)=>{event.currentTarget.style.cursor = "pointer";}} > <h4> Register </h4> </button> 
            </div> 
        </div>
        <div>
          <div style={styles.Label}> <h1>Welcome </h1>{" "} </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

const styles = {
  main_div: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loginForm: {
    width: "1000px",
    height: "400px",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px",
    border: "1px solid black",
    boxShadow: "1px 1px 2px 2px black",
  },
  input: {
    width: "50%",
    height: "30px",
    backgroundColor: "white",
    color: "black",
    // border:"1px solid red",
    // boxShadow:"1px 1px  red"
  },
  input_container: {
    display: "flex",
    flexDirection: "row",
    color: "black",
    backgroundColor: "white",
    fontWeight: "10px",
    width: "500px",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
  },
  Label: {
    color: "black",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    color: "orange",
    border: "1px solid orange",
    width: "80px",
    height: "30px",
  },
};
