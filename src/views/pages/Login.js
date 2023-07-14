import { Card, CardHeader, Col } from "reactstrap";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isTokenExpired } from "../../services/checkToken";
import { useEffect } from "react";
const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && !isTokenExpired()) {
      if (user.role === 'Admin') {
        navigate("/admin/map");      
      }
    }else if (isTokenExpired()){
        localStorage.removeItem('user');
    }
  }, [navigate]);
  const handleLoginWithGoogle = (credentialResponse) => {
    loginWithGoogle(credentialResponse.credential)
      .then((res) => {
        if (res.data !== '' && !isTokenExpired()) {
          // console.log(res)
          const userData = res.data;
          localStorage.setItem('user', JSON.stringify(res.data))
          if (userData.role === 'Admin') {
            navigate("/admin/map");
            toast.success(`Welcome ${userData.name} to Admin Page`, {
              autoClose: 1000,
            });

          } else if (isTokenExpired(false)) {
            navigate("/admin/buses");
          } else if (userData.role === 'Driver') {
            toast.warning("You're not Authorized", {
              autoClose: 1000,
            });
            localStorage.removeItem('user');
          }
        } else {
          toast.error("Your account is not registered", {
            autoClose: 1000,
          });
        }
      });
  };

  return (
    <>
      <ToastContainer /> {/* Add ToastContainer component at the end */}
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-5">
            <div className="text-muted text-center mt-2 mb-3">
              <small>Sign in with</small>
            </div>
            <div className="btn-wrapper text-center">
              <GoogleOAuthProvider
                clientId="319062689013-fku6m54vf3arbhrnoiij84qb0e852o28.apps.googleusercontent.com"
                responseType="code,token"
              >
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
