import "./App.css";
import { useState, useEffect } from "react";
import UserTable from "./UserTable";
import GoogleLoginButton from "./GoogleLoginButton";

function App() {
  const [users, setUsers] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false); // State to track sign-in status

  useEffect(() => {
    // Fetch user data only if the user is signed in
    if (isSignedIn) {
      fetch("http://localhost:5000/telegram") // Replace with your API endpoint
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error(error));
    }
  }, [isSignedIn]); // Depend on isSignedIn state

  function handleSignIn() {
    setIsSignedIn(true);
  }

  return (
    <div className="App">
      {isSignedIn ? (
        <UserTable users={users} />
      ) : (
        <GoogleLoginButton onSignIn={handleSignIn} />
      )}
    </div>
  );
}
export default App;
