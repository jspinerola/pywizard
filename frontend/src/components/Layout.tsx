import React from "react";
import { Outlet } from "react-router";

function Layout() {
  return (
    <>
      <div>Header</div>
      <main>
        <Outlet />
      </main>
      <div>Footer</div>
    </>
  );
}

export default Layout;
