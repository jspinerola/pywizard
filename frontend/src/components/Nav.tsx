import React from "react";
import pywizard from "@/assets/pywizard.png";
import { Link } from "react-router";
import { Code, Home } from "lucide-react";

const Nav: React.FC = () => {
  return (
    <nav className="border-b-1  text-white flex items-center p-4 justify-between">
      <Link to="/" className="flex gap-2 ">
        <img
          src={pywizard}
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        <h1 className="inline text-2xl font-bold align-middle font-mono text-secondary ">PyWizard</h1>
      </Link>
      <ul className="flex list-none m-0">
        <li className="mr-6">
          <Link
            to="/"
            className="text-white hover:text-secondary no-underline flex items-center gap-2"
          >
            <Home size={16} /> Home
          </Link>
        </li>
        <li className="mr-6">
          <Link
            to="/code"
            className="text-white hover:text-secondary no-underline flex items-center gap-2"
          >
            <Code size={16} /> Code
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
