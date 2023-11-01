// GoogleLoginButton.js
import React from "react";
import { GoogleLogin } from "react-google-login";

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
  const responseGoogle = (response) => {
    if (response && response.profileObj) {
      onSuccess(response.profileObj);
    } else {
      onFailure();
    }
  };

  return (
    <div>
      <GoogleLogin
        clientId="689219991754-bb36m167brrpjgb6j06l9qjotdt4lnbl.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={(err) => console.log("fail", err)}
        isSignedIn={true}
      />
    </div>
  );
};

export default GoogleLoginButton;
