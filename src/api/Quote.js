// src/api/upsertQuote.js
import axiosInstance from "./axiosInstance";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

// Upsert Quote API call
export const upsertQuote = async (plan) => {
  try {
    // Initialize variables
    let user = null;
    let agentId = null;
    let agentName = "";
    let franchiseeId = null;
    let email = "";
    let SelectedCompany = null;

    // 1) Load user (safe parse)
    try {
      const rawUser = getSecureItem("user");
      user = rawUser && typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
    } catch (e) {
      console.log("error parsing user from secureStorage:", e);
      user = null;
    }

    // 2) determine agent/franchisee/email safely
    const firstCompany = user?.Companies?.[0] || null;
    const firstAgent = firstCompany?.Agents?.[0] || null;
    agentId = firstAgent?.EmployeeID || null;
    agentName = firstAgent?.EmployeeName || "";
    franchiseeId = user?.FranchiseeId || user?.FranchiseeID || null;
    email = user?.Email || "";

    // 3) Parse selectedCompany from secure storage robustly
    try {
      const rawSelected = getSecureItem("selectedCompany");
      const parsedSelected = rawSelected && typeof rawSelected === "string" ? JSON.parse(rawSelected) : rawSelected;

      if (parsedSelected && parsedSelected.CompanyID) {
        // find actual company object from user.Companies if available
        if (user?.Companies && Array.isArray(user.Companies)) {
          const found = user.Companies.find(
            (c) => String(c.CompanyID) === String(parsedSelected.CompanyID)
          );
          if (found) {
            SelectedCompany = {
              CompanyID: found.CompanyID,
              CompanyName: found.BusinessName || found.CompanyName || "",
            };
          } else {
            // fallback to parsedSelected directly
            SelectedCompany = {
              CompanyID: parsedSelected.CompanyID,
              CompanyName: parsedSelected.CompanyName || "",
            };
          }
        } else {
          SelectedCompany = {
            CompanyID: parsedSelected.CompanyID,
            CompanyName: parsedSelected.CompanyName || "",
          };
        }
      } else if (user?.Companies && user.Companies.length > 0) {
        // fallback to first company from user
        const first = user.Companies[0];
        SelectedCompany = {
          CompanyID: first.CompanyID,
          CompanyName: first.BusinessName || first.CompanyName || "",
        };
      } else {
        // ultimate fallback
        SelectedCompany = { CompanyID: null, CompanyName: "" };
      }
    } catch (err) {
      console.log("Error parsing selectedCompany:", err);
      // fallback
      if (user?.Companies && user.Companies.length > 0) {
        const first = user.Companies[0];
        SelectedCompany = {
          CompanyID: first.CompanyID,
          CompanyName: first.BusinessName || first.CompanyName || "",
        };
      } else {
        SelectedCompany = { CompanyID: null, CompanyName: "" };
      }
    }

    // Make sure SelectedCompany is not null when building payload (server may expect CompanyID)
    const companyPayload = SelectedCompany && SelectedCompany.CompanyID != null
      ? SelectedCompany
      : (user?.Companies && user.Companies[0])
      ? {
          CompanyID: user.Companies[0].CompanyID,
          CompanyName: user.Companies[0].BusinessName || user.Companies[0].CompanyName || "",
        }
      : SelectedCompany;

    // Build payload
    const payload = {
      ParentQuoteID: null,
      QuoteID: null,
      SelectedCompany: companyPayload,
      SelectedCustomer: (user && user.CustomerID)
        ? {
            CustomerID: user.CustomerID,
            CustomerName: [user.FirstName, user.LastName].filter(Boolean).join(" ").trim() || "John Doe",
          }
        : {
            CustomerID: 2,
            CustomerName: "John Doe",
          },
      QuoteCRE: {
        EmployeeID: agentId || 9,
        EmployeeName: agentName || "",
      },
      FranchiseeID: franchiseeId || 43,
      SourceOfSale: "Website",
      Remarks: "Generated from subscription page",
      IsIndividual: 0,
      PackageID: plan.id || plan.packageId,
      PackageName: plan.name || plan.PackageName || plan.packageName,
      IsMonthly: 0,
      QuoteStatus: "Draft",
      ServiceDetails: (plan.services || []).map((s) => ({
        ServiceID: s.ServiceID,
        ItemName: s.ServiceName,
        ProfessionalFee:
          s.ProfessionalFee != null
            ? parseFloat(s.ProfessionalFee)
            : s.ProfessionalFeeYearly != null
            ? parseFloat(s.ProfessionalFeeYearly)
            : 1000,
        VendorFee:
          s.VendorFee != null
            ? parseFloat(s.VendorFee)
            : s.VendorFeeYearly != null
            ? parseFloat(s.VendorFeeYearly)
            : 500,
        GovtFee:
          s.GovernmentFee != null
            ? parseFloat(s.GovernmentFee)
            : s.GovernmentFeeYearly != null
            ? parseFloat(s.GovernmentFeeYearly)
            : 200,
        ContractorFee: 0,
        GSTPercent: 18,
        Discount: 0,
        Rounding: 0,
        Total:
          s.TotalFee != null
            ? parseFloat(s.TotalFee)
            : s.TotalFeeYearly != null
            ? parseFloat(s.TotalFeeYearly)
            : 1700,
        AdvanceAmount: 500,
        PendingAmount: 1200,
      })),
      IsDirect: 1,
      MailQuoteCustomers: [
        (user && user.CustomerID)
          ? {
              CustomerID: user.CustomerID,
              CustomerName: `${user.FirstName || ""} ${user.LastName || ""}`.trim() || "John Doe",
              Email: user.Email || email || "john@example.com",
            }
          : {
              CustomerID: 2,
              CustomerName: "John Doe",
              Email: "john@example.com",
            },
      ],
    };

    // debug log (remove later)
    console.log("upsertQuote payload:", payload);

    // Post request
    const res = await axiosInstance.post("/upsertQuote", payload);

    // If API returns quotes, update local user object for the matching company
    if (res.data && res.data.Quotes && Array.isArray(res.data.Quotes)) {
      try {
        const rawUser = getSecureItem("user");
        const storedUser = rawUser && typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

        if (storedUser && Array.isArray(storedUser.Companies)) {
          // determine which company to update from response (first quote company)
          const targetCompanyId = res.data.Quotes[0]?.CompanyID || companyPayload?.CompanyID;
          if (targetCompanyId) {
            storedUser.Companies = storedUser.Companies.map((c) => {
              if (String(c.CompanyID) === String(targetCompanyId)) {
                return { ...c, Quotes: res.data.Quotes };
              }
              return c;
            });
            setSecureItem("user", JSON.stringify(storedUser));
          }
        }
      } catch (e) {
        console.log("Failed to update Quotes in secureStorage user object", e);
      }
    }

    return res.data;
  } catch (err) {
    // bubble up the error so component can handle it
    throw err;
  }
};
