import React from "react";
import { Outlet } from "react-router";
import Nav from "./Nav";
import Footer from "./Footer";

function Layout() {
  return (
    <>
      <Nav />
      <main className="w-full mx-auto container m-6">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
