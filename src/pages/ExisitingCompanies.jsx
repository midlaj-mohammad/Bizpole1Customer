import React, { useState } from 'react';
import CompanyInformationForm from '../components/ExixistingCompany/CompanyInformationForm';
import DirectorPromoterForm from '../components/ExixistingCompany/DirectorPromoterForm';
import RegistrationStatusForm from '../components/ExixistingCompany/RegistrationStatusForm';
import ComplianceStatusCheck from '../components/ExixistingCompany/ComplianceStatusCheck';
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

const ExisitingCompanies = () => {
  // Persist step in localStorage
  const getInitialStep = () => {
    const saved = getSecureItem("onboardingStep");
    return saved ? Number(saved) : 1;
  };
  const [step, setStep] = useState(getInitialStep());
  const [registrationStatusObj, setRegistrationStatusObj] = useState(null);

  // Update localStorage when step changes
  React.useEffect(() => {
    setSecureItem("onboardingStep", step);
  }, [step]);

  return (
    <div className="min-h-screen  bg-gray-50">

  {step === 1 && <CompanyInformationForm onNext={() => setStep(2)} step={step} setStep={setStep} />}
  {step === 2 && <DirectorPromoterForm onNext={() => setStep(3)} onBack={() => setStep(1)} />}
  {step === 3 && <RegistrationStatusForm onNext={(obj) => { setRegistrationStatusObj(obj); setStep(4); }} onBack={() => setStep(2)} />}
  {step === 4 && <ComplianceStatusCheck onBack={() => setStep(3)} registrationStatusObj={registrationStatusObj} />}
    </div>
  );
}

export default ExisitingCompanies;