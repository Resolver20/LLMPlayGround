import {useState,useRef,useCallback,useEffect} from "react";
import { NavLink,useLocation,useNavigate} from "react-router";
import {url} from "../App.jsx";
import { Toaster, toast } from "sonner";


const LoginPage = () => {
  // console.log("url value : ", url);
  const [formFields,setFormFields]=useState({});
  const usernameRef=useRef();
  const passwordRef=useRef();
  const location =useLocation();
  const [message,setMessage]=useState("");
  const navigate=useNavigate();
  const buttonRef=useRef();

  // const [isVisible, setIsVisible] = useState(true);
  const { username }=location.state||{};
  
    useEffect(() => {
      if(username){ toast(`${import.meta.env.VITE_ASSISTANT}Welcome ${username} !!`); }
      else{toast(`${import.meta.env.VITE_ASSISTANT}Welcome Stranger !!`);}
    }, []);

  const Authenticate=async ()=>{
    const userName=usernameRef.current.value;
    const pwd=passwordRef.current.value;
    try{

      const response = await fetch((url + `/Auth/login`), { method: "POST", headers :{"Content-Type":"application/json"},  body: JSON.stringify({ username :userName,password:pwd} )})
      if (!response.ok) { 
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data=await response.json();
      window.localStorage.setItem("access_token", data.token);
      // console.log(data); 
      navigate("/App");
    }
    catch(error){
      toast.error(`${error}`);
      console.error('Error:', error);
    };
   }
  
   const checkForEnter = (event,position) => {
    
    if (event.key === "Enter") {
      event.preventDefault();
      if (position == "username") {
        passwordRef.current.focus();
      }
      else{
        buttonRef.current.click(); 
      }
    }
  }

  return (
    <div style={styles.main_div}>
      {/* <div className={`banner ${!isVisible ? "fade-out" : ""}`}> <h1> Welcome {username} </h1> </div> */}
      <div style={styles.loginForm}>
        <Toaster richColors position="top-left" />
        <div>
          <div style={styles.input_container}>
            {" "}
            <h3> Username </h3>{" "}
            <input
              ref={usernameRef}
              style={styles.input}
              onKeyDown={(event) => checkForEnter(event, "username")}
              type="text"
            />
          </div>
          <div style={styles.input_container}>
            {" "}
            <h3> Password </h3>{" "}
            <input
              ref={passwordRef}
              style={styles.input}
              onKeyDown={(event) => checkForEnter(event, "password")}
              type="password"
            />{" "}
          </div>
          <div style={styles.input_container}>
            <div>
              {" "}
              <NavLink to="/SignUp">
                {" "}
                <h5 style={{ color: "gray" }}> SignUp ? </h5>{" "}
              </NavLink>{" "}
            </div>
            <div>
              {" "}
              <button
                ref={buttonRef}
                style={styles.submitButton}
                onClick={Authenticate}
                onMouseEnter={(event) => {
                  event.currentTarget.style.cursor = "pointer";
                }}
              >
                {" "}
                <h4> Submit </h4>{" "}
              </button>{" "}
            </div>
          </div>
        </div>
        <div style={styles.Label}>
          {" "}
          <h1>LLM PlayGround </h1>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

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
    width: "900px",
    height: "200px",
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
    width: "100%",
    height: "30px",
    backgroundColor: "white",
    color: "black",
  },
  input_container: {
    display: "flex",
    flexDirection: "row",
    color: "black",
    backgroundColor:"white",
    fontWeight: "10px",
    width:"300px",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
  },
  Label: {
    color: "black",
  },
  submitButton:{
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"white",
    color:"green",
    border:"1px solid green",
    width:"80px",
    height:"30px"

  }
};