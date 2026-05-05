import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Steps } from "@/components/home/Steps";
import { Team } from "@/components/home/Team";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <main className="flex-1">
        <Hero />
        <Features />
        <Team />
        <Steps />
        <FinalCTA />
      </main>
    </div>
  );
}
