// src/api/upsertQuote.js
import axiosInstance from "./axiosInstance";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

// Upsert Quote API call
export const upsertQuote = async (plan) => {
  console.log("OOOOO", { plan });

  try {
    let user = null;
    let agentId = null;
    let agentName = "";
    let franchiseeId = null;
    let email = "";
    let SelectedCompany = null;

    // 1) Load user safely
    try {
      const rawUser = getSecureItem("user" || "partnerUser");
      user =
        rawUser && typeof rawUser === "string"
          ? JSON.parse(rawUser)
          : rawUser;
    } catch (e) {
      console.log("error parsing user:", e);
      user = null;
    }

    // 2) Agent / Franchisee / Email
    const firstCompany = user?.Companies?.[0] || null;
    const firstAgent = firstCompany?.Agents?.[0] || null;

    agentId = firstAgent?.EmployeeID || null;
    agentName = firstAgent?.EmployeeName || "";
    franchiseeId = user?.FranchiseeId || user?.FranchiseeID || null;
    email = user?.Email || "";

    // ✅ 3) Determine SelectedCompany (FIXED)
    try {
      if (plan?.SelectedCompany?.CompanyID) {
        // PRIORITY 1 → from plan
        SelectedCompany = {
          CompanyID: plan.SelectedCompany.CompanyID,
          CompanyName: plan.SelectedCompany.CompanyName || "",
        };
      } else {
        // PRIORITY 2 → secure storage
        const rawSelected = getSecureItem("selectedCompany");
        const parsedSelected =
          rawSelected && typeof rawSelected === "string"
            ? JSON.parse(rawSelected)
            : rawSelected;

        if (parsedSelected?.CompanyID) {
          SelectedCompany = {
            CompanyID: parsedSelected.CompanyID,
            CompanyName: parsedSelected.CompanyName || "",
          };
        } else if (user?.Companies?.length > 0) {
          // PRIORITY 3 → user first company
          const first = user.Companies[0];
          SelectedCompany = {
            CompanyID: first.CompanyID,
            CompanyName:
              first.BusinessName || first.CompanyName || "",
          };
        } else {
          SelectedCompany = { CompanyID: null, CompanyName: "" };
        }
      }
    } catch (err) {
      console.log("Error determining SelectedCompany:", err);
      SelectedCompany = { CompanyID: null, CompanyName: "" };
    }

    console.log("FINAL CompanyID:", SelectedCompany?.CompanyID);

    // 4) Build payload
    const payload = {
      ParentQuoteID: null,
      QuoteID: null,

      SelectedCompany: SelectedCompany,

      SelectedCustomer:
        user?.CustomerID
          ? {
              CustomerID: user.CustomerID,
              CustomerName:
                [user.FirstName, user.LastName]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || "John Doe",
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
      SourceOfSale: plan.isAssociate ? "Associate" : "Website",
      Remarks: "Generated from subscription page",
      IsIndividual: 0,

      PackageID: plan.id || plan.packageId,
      PackageName:
        plan.name || plan.PackageName || plan.packageName,

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
        user?.CustomerID
          ? {
              CustomerID: user.CustomerID,
              CustomerName: `${user.FirstName || ""} ${
                user.LastName || ""
              }`.trim(),
              Email: user.Email || email || "john@example.com",
            }
          : {
              CustomerID: 2,
              CustomerName: "John Doe",
              Email: "john@example.com",
            },
      ],

      isAssociate: plan.isAssociate,
      AssociateID: plan.AssociateID,
    };

    console.log("upsertQuote payload:", payload);

    // 5) API call
    const res = await axiosInstance.post(
      "/upsertQuote",
      payload
    );

    // 6) Update stored user quotes
    if (res.data?.Quotes && Array.isArray(res.data.Quotes)) {
      try {
        const rawUser = getSecureItem("user" || "partnerUser");
        const storedUser =
          typeof rawUser === "string"
            ? JSON.parse(rawUser)
            : rawUser;

        const targetCompanyId =
          res.data.Quotes[0]?.CompanyID ||
          SelectedCompany?.CompanyID;

        if (
          storedUser?.Companies &&
          targetCompanyId
        ) {
          storedUser.Companies =
            storedUser.Companies.map((c) =>
              String(c.CompanyID) ===
              String(targetCompanyId)
                ? { ...c, Quotes: res.data.Quotes }
                : c
            );

          setSecureItem(
            "user",
            JSON.stringify(storedUser)
          );
        }
      } catch (e) {
        console.log(
          "Failed updating quotes in storage",
          e
        );
      }
    }

    return res.data;
  } catch (err) {
    throw err;
  }
};

