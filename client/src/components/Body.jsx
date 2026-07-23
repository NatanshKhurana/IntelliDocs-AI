import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "@/utils/api";
import { setUser, clearUser } from "@/store/userSlice";

const Body = () => {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  // Apply dark / light class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // On app load: check if cookie session is still valid
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        dispatch(setUser(res.data.user));
      } catch {
        // Not logged in (guest mode) - this is normal
        dispatch(clearUser());
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Body;
