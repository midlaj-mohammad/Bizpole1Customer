
import HeroSection from "../components/HeroSection";
import FinancialDashboard from "../components/FinancialDashboard";
import GlobalStats from "../components/GlobalStats";
import HowWeWork from "../components/HowWeWork";
import ClientsSection from "../components/ClientsSection";
import CustomerSupport from "../components/CustomerSupport";

export default function Home() {
  return (
    <>
    <HeroSection />
    <FinancialDashboard />
    <GlobalStats />
    <HowWeWork />
    <ClientsSection />
    <CustomerSupport />
    </>
  );
}
