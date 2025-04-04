import React, { useEffect, useState } from "react";
import ContentWrapper from "./ContentWrapper";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";
import { VscChromeClose } from "react-icons/vsc";
import { SlMenu } from "react-icons/sl";
import { twMerge } from "tailwind-merge";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/user-slice";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { isLoggedIn, user } = useSelector((state) => state.user);

  const [showHeader, setShowHeader] = useState("top");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShouPopup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const listStyle = `text-white font-medium cursor-pointer hover:text-red-500 ${
    mobileMenu
      ? "text-[20px] w-full h-auto px-5 py-[15px] m-0 flex flex-col items-start last:hidden"
      : "h-[60px] text-2xl flex items-center mx-[15px] relative"
  }`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const controlNavbar = () => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY && !mobileMenu) {
        setShowHeader("hide");
      } else {
        setShowHeader("show");
      }
    } else {
      setShowHeader("top");
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  const navigationHandler = (type) => {
    if (type === "movie") {
      navigate("/explore/movie");
    } else {
      navigate("/explore/tv");
    }
    setMobileMenu(false);
  };

  const openSearch = () => {
    setMobileMenu(false);
    setShowSearch(true);
  };

  const openMobileMenu = () => {
    setMobileMenu(true);
    setShowSearch(false);
  };

  const searchQueryHandler = (e) => {
    if (e.key === "Enter" && searchQuery.length > 0) {
      navigate(`/search/${searchQuery}`);
      setTimeout(() => {
        setShowSearch(false);
      }, 1000);
    }
  };

  return (
    <header
      className={twMerge(
        `fixed w-full h-20 flex items-center transition-all duration-300 ease-in-out z-20 ${
          showHeader === "top"
            ? "bg-transparent/25 backdrop-filter backdrop-blur-[3.5px]"
            : showHeader === "show"
            ? "bg-dark_3"
            : "translate-y-[-60px]"
        } ${mobileMenu ? "bg-dark_3" : ""}`
      )}
    >
      <ContentWrapper className="flex items-center justify-between">
        <div>
          <div
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/netflix-logo.png"
              alt="Netflix Logo"
              className="w-32 sm:w-40"
            />
          </div>
        </div>
        {isLoggedIn ? (
          <div className="flex items-center gap-6">
            <ul
              className={`${
                mobileMenu
                  ? "w-full flex flex-col absolute top-20 left-0 bg-dark_3 py-5 border-t border-solid border-t-white/10 animate-[mobileMenu_0.3s_ease_forwards]"
                  : "list-none hidden items-center md:flex"
              }`}
            >
              <li
                className={listStyle}
                onClick={() => navigationHandler("movie")}
              >
                Movies
              </li>
              <li
                className={listStyle}
                onClick={() => navigationHandler("tv")}
              >
                TV Shows
              </li>
              <li className={listStyle}>
                <HiOutlineSearch onClick={openSearch} />
              </li>
            </ul>
            <div className="flex items-center gap-5 md:hidden">
              <HiOutlineSearch
                className="text-2xl text-white font-medium"
                onClick={openSearch}
              />
              {mobileMenu ? (
                <VscChromeClose
                  className="text-2xl text-white font-medium"
                  onClick={() => setMobileMenu(false)}
                />
              ) : (
                <SlMenu
                  className="text-2xl text-white font-medium"
                  onClick={openMobileMenu}
                />
              )}
            </div>
            <div>
              <NotificationBell />
            </div>
            <div className="relative">
              <img
                src={user?.image || "/avatar.png"}
                alt="User icon"
                className="h-10 w-10 rounded-full cursor-pointer"
                onClick={() => setShouPopup(!showPopup)}
              />
              {showPopup && (
                <div className="w-[150px] md:w-[200px] absolute right-0 top-12 mt-2 shadow-lg bg-red-500 rounded-md">
                  <ul className="flex flex-col p-1 gap-2 text-black font-bold text-[18px]">
                    <li
                      className="p-2 bg-gray-400 cursor-pointer"
                      onClick={() => {
                        navigate("/profile");
                        setShouPopup(false);
                      }}
                    >
                      Profile
                    </li>
                    <li
                      className=" p-2 bg-gray-400 cursor-pointer"
                      onClick={() => {
                        dispatch(logout());
                        setShouPopup(false);
                      }}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Link
              to="/login"
              className="text-white bg-red-600 py-2 px-4 rounded font-bold text-[18px]"
            >
              Sign In
            </Link>
          </div>
        )}
      </ContentWrapper>
      {showSearch && (
        <div className="w-full h-[60px] bg-white absolute top-20 animate-[mobileMenu_0.3s_ease_forwards]">
          <ContentWrapper>
            <div className="w-full flex items-center h-10 mt-[10px]">
              <input
                className="w-full h-[50px] bg-white outline-0 border-none rounded-l-[30px] px-[15px] text-[14px] md:h-[60px] md:text-[20px] md:px-[30px]"
                type="text"
                placeholder="Search for a movie, TV show..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyUp={searchQueryHandler}
              />
              <VscChromeClose
                className="text-[20px] flex-shrink-0 ml-[10px] cursor-pointer"
                onClick={() => setShowSearch(false)}
              />
            </div>
          </ContentWrapper>
        </div>
      )}
    </header>
  );
};

export default Header;
