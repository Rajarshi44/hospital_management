"use client"

import React from "react"

interface BillingLineItem {
  id: string
  description: string
  type: string
  rate: number
  discount: number
  amount: number
}

interface BillingCategory {
  id: string
  name: string
  items: BillingLineItem[]
}

interface PatientInfo {
  name: string
  uhid: string
  age: string
  gender: string
  pan: string
  cin: string
  address: string
}

interface VisitInfo {
  admissionDate: string
  dischargeDate: string
  doctor: string
  diagnosis: string
}

interface InsuranceInfo {
  tpa: string
  policyNo: string
  policyValidity: string
  preAuthNo: string
  sumInsured: number
  coPaymentPercent: number
}

interface FinancialInfo {
  totalBillAmount: number
  claimedAmount: number
  approvedAmount: number
  deductibleAmount: number
  nonPayableAmount: number
  coPaymentAmount: number
  patientPayable: number
  tpaPayable: number
}

interface BillPrintLayoutProps {
  patientInfo: PatientInfo
  visitInfo: VisitInfo
  insuranceInfo?: InsuranceInfo
  financialInfo?: FinancialInfo
  treatmentSummary?: string
  billingCategories: BillingCategory[]
  billNumber: string
  refNumber: string
  date: string
  total: number
  totalDiscount: number
  subtotal: number
  serviceCharge: number
  billAmount: number
}

export const BillPrintLayout = React.forwardRef<HTMLDivElement, BillPrintLayoutProps>((props, ref) => {
  const {
    patientInfo,
    visitInfo,
    insuranceInfo,
    financialInfo,
    treatmentSummary,
    billingCategories,
    billNumber,
    refNumber,
    date,
    total,
    billAmount,
  } = props

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @page { 
            size: A4; 
            margin: 15mm; 
          }
          @media print {
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0 !important;
              padding: 0 !important;
            }
            body * {
              visibility: hidden;
            }
            #bill-print-content, #bill-print-content * {
              visibility: visible;
            }
            #bill-print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            * { 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .bill-table th, .bill-table td { 
              border: 1px solid #666 !important; 
              padding: 6px 8px !important; 
            }
            .bill-table th { 
              background-color: #e5e7eb !important; 
            }
            .category-row { 
              background-color: #f3f4f6 !important; 
            }
          }
          .bill-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 11px; 
          }
          .bill-table th, .bill-table td { 
            border: 1px solid #666; 
            padding: 6px 8px; 
          }
          .bill-table th { 
            background-color: #e5e7eb; 
            font-weight: bold; 
          }
          .category-row { 
            background-color: #f3f4f6; 
            font-weight: bold; 
          }
          .text-right { 
            text-align: right; 
          }
          .text-center { 
            text-align: center; 
          }
        `,
        }}
      />

      <div
        id="bill-print-content"
        ref={ref}
        style={{
          maxWidth: "210mm",
          margin: "0 auto",
          padding: "20mm",
          background: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{ textAlign: "center", borderBottom: "3px solid #1e3a8a", paddingBottom: "8px", marginBottom: "15px" }}
        >
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#1e3a8a", margin: 0 }}>
            SRIJONI HEALING HOME PVT. LTD.
          </h1>
          <p style={{ fontSize: "10px", margin: "2px 0" }}>56, HEM CHANDRA NASKAR ROAD, BELIAGHATA, KOLKATA - 10</p>
          <p style={{ fontSize: "10px", margin: "2px 0" }}>PHONE: 2372 0038 / 2372-0378, FAX: 2372-0862</p>
        </div>

        <div style={{ textAlign: "center", margin: "15px 0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>BILL CUM RECEIPT</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            fontSize: "11px",
            marginBottom: "15px",
          }}
        >
          <div>
            <div>
              <strong>Sl. No.:</strong> {billNumber}
            </div>
            <div>
              <strong>Name:</strong> {patientInfo.name}
            </div>
            <div>
              <strong>Address:</strong> {patientInfo.address}
            </div>
            <div>
              <strong>Admission:</strong> {visitInfo.admissionDate}
            </div>
            <div>
              <strong>Discharge:</strong> {visitInfo.dischargeDate}
            </div>
            <div>
              <strong>Doctor:</strong> {visitInfo.doctor}
            </div>
            <div>
              <strong>Case:</strong> {visitInfo.diagnosis}
            </div>
          </div>
          <div>
            <div>
              <strong>Ref. No.:</strong> {refNumber}
            </div>
            <div>
              <strong>Date:</strong> {date}
            </div>
            <div>
              <strong>Regd. No.:</strong> {patientInfo.uhid}
            </div>
            <div>
              <strong>Age:</strong> {patientInfo.age}
            </div>
            <div>
              <strong>Sex:</strong> {patientInfo.gender}
            </div>
            {patientInfo.pan && (
              <div>
                <strong>Pan No.:</strong> {patientInfo.pan}
              </div>
            )}
            {patientInfo.cin && (
              <div>
                <strong>Policy No.:</strong> {patientInfo.cin}
              </div>
            )}
          </div>
        </div>

        {/* Insurance Details Section */}
        {insuranceInfo && (
          <div
            style={{
              fontSize: "11px",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ddd",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "12px" }}>Insurance/TPA Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
              <div>
                <strong>TPA/Insurance:</strong> {insuranceInfo.tpa}
              </div>
              <div>
                <strong>Policy No.:</strong> {insuranceInfo.policyNo}
              </div>
              <div>
                <strong>Policy Validity:</strong> {insuranceInfo.policyValidity}
              </div>
              <div>
                <strong>Pre-Auth No.:</strong> {insuranceInfo.preAuthNo}
              </div>
              <div>
                <strong>Sum Insured:</strong> ₹{insuranceInfo.sumInsured.toLocaleString()}
              </div>
              <div>
                <strong>Co-Payment:</strong> {insuranceInfo.coPaymentPercent}%
              </div>
            </div>
          </div>
        )}

        {/* Treatment Summary */}
        {treatmentSummary && (
          <div
            style={{
              fontSize: "11px",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ddd",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px", fontSize: "12px" }}>Treatment Summary</div>
            <div style={{ lineHeight: "1.5" }}>{treatmentSummary}</div>
          </div>
        )}

        <table className="bill-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Description</th>
              <th style={{ width: "8%", textAlign: "center" }}>Type</th>
              <th style={{ width: "10%", textAlign: "right" }}>Rate</th>
              <th style={{ width: "8%", textAlign: "right" }}>Disc.</th>
              <th style={{ width: "12%", textAlign: "right" }}>Amount</th>
              <th style={{ width: "12%", textAlign: "right" }}>Serv. Ch.</th>
              <th style={{ width: "12%", textAlign: "right" }}>Gross</th>
            </tr>
          </thead>
          <tbody>
            {billingCategories.map(category => (
              <React.Fragment key={category.id}>
                <tr className="category-row">
                  <td colSpan={7}>{category.name} ::</td>
                </tr>
                {category.items.map((item, idx) => {
                  const sc = item.amount * 0.15
                  const gross = item.amount + sc
                  return (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td className="text-center">{item.type.toUpperCase()}</td>
                      <td className="text-right">{item.rate.toFixed(2)}</td>
                      <td className="text-right">{item.discount.toFixed(2)}</td>
                      <td className="text-right">{item.amount.toFixed(2)}</td>
                      <td className="text-right">{idx === 0 ? sc.toFixed(2) : "Nil"}</td>
                      <td className="text-right">{idx === 0 ? gross.toFixed(2) : item.amount.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <div style={{ width: "250px", fontSize: "11px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #666",
                padding: "4px 0",
              }}
            >
              <strong>Total:</strong>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <strong>Bill Amount:</strong>
              <span>₹{billAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown for Insurance */}
        {financialInfo && (
          <div
            style={{
              fontSize: "11px",
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ddd",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "12px" }}>Financial Breakdown</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Total Bill Amount</div>
                <div style={{ fontWeight: "bold" }}>₹{financialInfo.totalBillAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Claimed Amount</div>
                <div style={{ fontWeight: "bold" }}>₹{financialInfo.claimedAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Approved Amount</div>
                <div style={{ fontWeight: "bold" }}>₹{financialInfo.approvedAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Deductible</div>
                <div>₹{financialInfo.deductibleAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Non-Payable</div>
                <div>₹{financialInfo.nonPayableAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Co-Payment</div>
                <div>₹{financialInfo.coPaymentAmount.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: "#fff3cd", padding: "8px", borderRadius: "4px" }}>
                <div style={{ fontSize: "10px", color: "#666" }}>Patient Payable</div>
                <div style={{ fontWeight: "bold", color: "#856404" }}>
                  ₹{financialInfo.patientPayable.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: "#d1ecf1", padding: "8px", borderRadius: "4px" }}>
                <div style={{ fontSize: "10px", color: "#666" }}>TPA Payable</div>
                <div style={{ fontWeight: "bold", color: "#0c5460" }}>₹{financialInfo.tpaPayable.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: "11px", marginBottom: "30px" }}>
          <strong>Rupees:</strong> Forty Five Thousand Only
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "50px" }}>
          <div style={{ borderTop: "1px solid #666", paddingTop: "4px", minWidth: "200px" }}>Patient Signature</div>
          <div style={{ borderTop: "1px solid #666", paddingTop: "4px", minWidth: "200px", textAlign: "right" }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </>
  )
})

BillPrintLayout.displayName = "BillPrintLayout"
