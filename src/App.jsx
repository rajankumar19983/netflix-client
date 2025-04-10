import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Details from "./pages/Details";
import SearchResults from "./pages/SearchResults";
import Explore from "./pages/Explore";
import Footer from "./components/Footer";
import { useDispatch, useSelector } from "react-redux";
import AuthPage from "./pages/AuthPage";
import toast, { Toaster } from "react-hot-toast";
import { account } from "./store/user-slice";
import { LuLoader } from "react-icons/lu";
import PrivateRoute from "./components/PrivateRoute";
import PageNotFound from "./pages/PageNotFound";
import { fetchApiUrls, fetchGenres } from "./store/homepage-slice";
import socket from "./utils/socketInstance";
import {
  addNotification,
  fetchNotifications,
} from "./store/notification-slice";
import { addParticipant, removeParticipant } from "./store/watchParty-slice";
import {
  incomingCall,
  callRejected,
  callAccepted,
  callEndedExternally,
  receivedIceCandidate,
} from "./store/call-Slice.js";
import CallModal from "./components/CallModal.jsx";
import VideoCallModal from "./components/VideoCallModal.jsx";

function App() {
  const { isLoggedIn, isLoading, authChecked, user } = useSelector(
    (state) => state.user
  );
  const callInfo = useSelector((state) => state.call.callInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // rejoin watchparty on re-load
  useEffect(() => {
    if (user?._id) {
      const savedCode = localStorage.getItem("watchPartyCode");
      if (savedCode) {
        socket.emit("joinWatchParty", {
          roomId: savedCode,
          userId: user?._id,
        });
        toast.success("Reconnected to your watch party!");
      }
    }
  }, [user]);

  // handling socket events for app, friends, watchparties, calls
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchNotifications());
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("joinApp", user._id.toString());
      socket.on("friendrequest", (data) => {
        dispatch(addNotification(data));
      });
      socket.on("requestaccepted", (data) => {
        dispatch(addNotification(data));
      });
      socket.on("mediaSelected", ({ mediaType, mediaId }) => {
        navigate(`/${mediaType}/${mediaId}`);
      });
      socket.on("UserJoined", ({ userId }) => {
        dispatch(addParticipant(userId));
      });
      socket.on("userLeft", ({ userId }) => {
        dispatch(removeParticipant(userId));
      });
      socket.on("incomingCall", (data) => dispatch(incomingCall(data)));
      socket.on("callRejected", (data) => dispatch(callRejected(data)));
      socket.on("callAccepted", (data) => dispatch(callAccepted(data)));

      socket.on("disconnect", () => {
        toast.error("Disconnected from server. Trying to reconnect...");
      });
    }
    return () => {
      socket.off("friendrequest");
      socket.off("requestaccepted");
      socket.off("mediaSelected");
      socket.off("disconnect");
      // socket.off("incomingCall");
      // socket.off("callRejected");
      // socket.off("callAccepted");
      // socket.off("callEnded");
    };
  }, [user?._id]);

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(account());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    dispatch(fetchApiUrls());
    dispatch(fetchGenres());
  }, [dispatch]);

  const funcAuthCheck = () => {
    return (
      <div className="h-screen">
        <div className="flex justify-center items-center bg-black h-full">
          <LuLoader className="animate-spin text-red-600 size-10" />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!authChecked) {
      return funcAuthCheck;
    }
  }, [authChecked]);

  if (localStorage.getItem("token") && isLoading && !isLoggedIn) {
    return (
      <div className="h-screen">
        <div className="flex justify-center items-center bg-black h-full">
          <LuLoader className="animate-spin text-red-600 size-10" />
          {/* <img
            src="/Netflix.gif"
            alt="Auth gif"
            className="z-[100]"
          /> */}
        </div>
      </div>
    );
  }

  return (
    <>
      {
        authChecked && (
          <main className="bg-dark_1">
            <Header />
            <Routes>
              <Route
                path="/"
                element={isLoggedIn ? <Home /> : <AuthPage />}
              />
              <Route
                path="/signup"
                element={!isLoggedIn ? <Signup /> : <Navigate to={"/"} />}
              />
              <Route
                path="/login"
                element={!isLoggedIn ? <Login /> : <Navigate to={"/"} />}
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/:mediaType/:id"
                element={
                  <PrivateRoute>
                    <Details />
                  </PrivateRoute>
                }
              />
              <Route
                path="/search/:query"
                element={
                  <PrivateRoute>
                    <SearchResults />
                  </PrivateRoute>
                }
              />
              <Route
                path="/explore/:mediaType"
                element={
                  <PrivateRoute>
                    <Explore />
                  </PrivateRoute>
                }
              />
              <Route
                path="*"
                element={<PageNotFound />}
              />
            </Routes>
            <Footer />
            <Toaster reverseOrder={true} />
            <CallModal />
            {callInfo?.status === "in-call" && <VideoCallModal />}
          </main>
        )
        // : (
        //   // <div>
        //   //   <img
        //   //     src="/Netflix.gif"
        //   //     alt="Auth gif"
        //   //   />
        //   // </div>
        //   <p>Loading</p>
        // )
      }
    </>
  );
}

export default App;
