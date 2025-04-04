import { useSelector } from "react-redux";
import { useLocation, Navigate } from "react-router-dom";

const PrivateRoute = (props) => {
  const { isLoggedIn } = useSelector((state) => state.user);
  const location = useLocation();

  if (!localStorage.getItem("token") && !isLoggedIn) {
    return (
      <Navigate
        to={"/login"}
        state={{ from: location }}
        replace={true}
      />
    );
  } else if (isLoggedIn) {
    return props.children;
  }
};

export default PrivateRoute;
