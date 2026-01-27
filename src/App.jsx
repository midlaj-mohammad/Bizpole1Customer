import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";
import StartYourBusiness from "./components/StartYourBusiness";
import Quiz from "./components/Quiz";
import BusinessPanel from "./components/BusinessPanel";
import Tellabout from "./components/Tellabout";
import Subscription from "./components/Subscription";
import Payment from "./components/Payment";

// Main Dashboard pages
import DashboardLayout from "./pages/DashboardLayout";
import DashboardMain from "./pages/DashboardMain";
import BizpoleBooks from "./pages/BizpoleBooks";

// BizpoleOne dashboard pages
import BizpoleOneDashboardLayout from "./pages/BizpoleOneDashboardLayout";
import BizpoleOne from "./pages/BizpoleOne";
import BizpoleOneOverview from "./pages/BizpoleOneOverview";
import BizpoleOneServices from "./pages/BizpoleOneServices";
import ProfilePage from "./pages/ProfilePage";
import ProfileLayout from "./pages/ProfileLayout";
import CalenderPage from "./pages/CalenderPage";
import ProfileDocuments from "./pages/ProfileDocuments";
import ProfileSettings from "./pages/ModernCalendar";
import ModernCalendar from "./pages/ModernCalendar";
import ProfileEvents from "./pages/ProfileEvents";
import BizpoleOneTasks from "./pages/BizpoleOneTasks";
import BusinessQuiz from "./components/Quastions";
import BusinessQuizWizard from "./components/Quastions";
import ExisitingCompanies from "./pages/ExisitingCompanies";
import CustomerFiles from "./pages/CustomerFiles";
import CompanyDetails from "./pages/CompanyDetails";
import Services from "./pages/Services";
import ProductList from "./pages/ProductView/ProductList";
import { getSecureItem, setSecureItem } from "./utils/secureStorage";
import Plansandpricing from "./pages/Plansandpricing";
import ServiceDetails from "./pages/ServiceDetails";
import MyPackages from "./pages/MyPackages";
import MyIndividualservices from "./pages/MyIndividualservices";
import Partners from "./pages/Partners";

function App() {
  const location = useLocation();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // paths where navbar & footer should not appear
  const hideLayoutPaths = [
    "/startbusiness",
    "/startbusiness/choose",
    "/startbusiness/quiz",
    "/startbusiness/about",
    "/startbusiness/subscriptions",
    "/payments",
    "/quiz",
    "/profile",
    "/existing-companies",
    "/dashboard", // includes /dashboard and its children
  ];

  useEffect(() => {
    const user = getSecureItem("user");
    if (typeof user === "string") {
      try {
        const parsed = JSON.parse(user);
        setSecureItem("user", parsed); // re-store correctly
      } catch {
        console.warn("Old user format found, clearing...");
        localStorage.removeItem("user");
      }
    }
  }, []);
  const hideLayout = hideLayoutPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main className="flex-grow ">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/startbusiness/*" element={<StartYourBusiness />} />
          <Route path="/checking" element={<BusinessPanel />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/partners" element={<Partners />} />

          <Route path="/startbusiness/about" element={<Tellabout />} />
          <Route path="/startbusiness/subscriptions" element={<Subscription />} />
          <Route path="/payments" element={<Payment />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/questions" element={<BusinessQuizWizard />} />

          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="calendar" element={<CalenderPage />} />
            <Route path="documents" element={<ProfileDocuments />} />
            <Route path="moderncalendar" element={<ModernCalendar />} />
            <Route path="events" element={<ProfileEvents />} />
            <Route path="files" element={<CustomerFiles />} />
            <Route path="companydetails" element={<CompanyDetails />} />

          </Route>



          <Route path="/existing-companies" element={<ExisitingCompanies />} />
          {/* Main Dashboard (Nested Routes) - Protected */}
          <Route element={<ProtectedRoute redirectPath="/" />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardMain />} /> {/* default */}
              <Route path="books" element={<BizpoleBooks />} />

              {/* BizpoleOne Nested Dashboard */}
              <Route path="bizpoleone" element={<BizpoleOneDashboardLayout />}>
                <Route index element={<BizpoleOne />} /> {/* default inside bizpoleone */}
                <Route path="package" element={<MyPackages />} />
                <Route path="services" element={<BizpoleOneServices />} />
                <Route path="orders" element={<BizpoleOneServices />} />
                <Route path="tasks" element={<BizpoleOneTasks />} />
                <Route path="pricing" element={<Plansandpricing />} />
                <Route path="individual" element={<MyIndividualservices />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
