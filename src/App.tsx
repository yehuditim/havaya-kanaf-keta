import { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import ChallengeScreen from "./components/ChallengeScreen";
import SuccessScreen from "./components/SuccessScreen";

type Screen = "home" | "instructions" | "challenge" | "success";

const App = () => {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="min-h-screen">
      {screen === "home" && <HomeScreen onStart={() => setScreen("instructions")} />}
      {screen === "instructions" && <InstructionsScreen onContinue={() => setScreen("challenge")} />}
      {screen === "challenge" && <ChallengeScreen onComplete={() => setScreen("success")} />}
      {screen === "success" && <SuccessScreen onRestart={() => setScreen("home")} />}
    </div>
  );
};

export default App;
