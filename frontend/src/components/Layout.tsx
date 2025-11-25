import React from "react";
import { Outlet } from "react-router";
import Nav from "./Nav";

function Layout() {
  return (
    <>
      <Nav />
      
        <Outlet />
      
      <div>Footer</div>
    </>
  );
}

export default Layout;
