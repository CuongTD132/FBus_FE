import {
  Card,
  CardHeader,
  Col,
} from "reactstrap";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from "../../services/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const handleLoginWithGoogle = (credentialResponse) => {
    console.log(credentialResponse)
    loginWithGoogle(credentialResponse.credential)
      .then((res) => {
        if(res.data !== '') {
          console.log(res)
          const userData = res.data;
          localStorage.setItem('user', JSON.stringify(res.data))
          if(userData.role === 'ADMIN') {
            navigate("/admin/buses")
          } 
        }
      });
  };
  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-5">
            <div className="text-muted text-center mt-2 mb-3">
              <small>Sign in with</small>
            </div>
            <div className="btn-wrapper text-center">
              <GoogleOAuthProvider
                clientId="319062689013-fku6m54vf3arbhrnoiij84qb0e852o28.apps.googleusercontent.com"
                responseType="code,token">
                <GoogleLogin
                  onSuccess={handleLoginWithGoogle}
                  onError={() => {
                    console.log('Login Failed');
                  }}
                />
              </GoogleOAuthProvider>
            </div>
          </CardHeader>
        </Card>
      </Col>
    </>
  );
};

export default Login;