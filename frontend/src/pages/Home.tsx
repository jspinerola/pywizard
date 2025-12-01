import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Home() {
  return <div> 
    <div className="h-screen flex flex-col items-center justify-center typewriter">
        <h1 className=" text-[#00A2E8] text-2xl md:text-8xl font-bold p-2.5"><span className="text-[#FCFF46]">Py</span>Wizard</h1>
        <p className="text-2xl md:text-3xl mt-4">Decode the magic of the code like a real wizard!</p>
        <Button asChild className="fade-in mt-4 bg-[#00A2E8] rounded-xl text-lg p-6 text-white hover:bg-[#007bb8] w-32">
          <Link to="/code">Get Started</Link> 
        </Button>
    </div>
    <div className="flex flex-row justify-center text-gray-800 bg-[#EDE2AF] p-15 ml-auto mr-auto mb-10 rounded-lg shadow-lg">
      <div className="grid gap-5 grid-cols-2 justify-center items-center w-8/12">
        <div>
          <h2 className="text-xl md:text-3xl font-semibold mb-2.5">What is PyWizard?</h2>
          <p>
            PyWizard is an app dedicated to understanding how those hieroglyphics we call 
            code function. In it, the user may run code and will receive a visualizations 
            of how the logic iterates through itself along with the outputs of the code
          </p>
          <Button asChild className="mt-4 bg-[#00A2E8] rounded-xl text-white hover:bg-[#007bb8] w-32">
            <Link to="/code">Get Started</Link> 
          </Button>
        </div>
        <div>
          <img src="https://i.imgur.com/MpQT3Oq.gif" alt="Wizard Coding" className="rounded-lg shadow-lg mt-4"/>
        </div>
      </div>

    </div>
  
  </div>;
}

export default Home;
