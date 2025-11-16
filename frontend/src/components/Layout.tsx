import React from "react";
import { Outlet } from "react-router";
import Nav from "./Nav";

function Layout() {
  return (
    <>
      <Nav />
      <main className="w-full mx-auto container m-6">
        <Outlet />
      </main>
      <div>Footer</div>
    </>
  );
}

export default Layout;
