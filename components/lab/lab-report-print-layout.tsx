"use client"

import React from "react"

interface LabTest {
  testName: string
  value: string
  units?: string
  normalRange?: string
  status: "normal" | "abnormal" | "critical"
  notes?: string
  completedAt: Date
  technician: string
  verifiedBy?: string
}

interface PatientInfo {
  name: string
  uhid: string
  age: string
  gender: string
  address?: string
}

interface OrderInfo {
  orderId: string
  orderDate: string
  collectionDate?: string
  reportDate: string
  doctorName: string
  priority: string
}

interface LabReportPrintLayoutProps {
  patientInfo: PatientInfo
  orderInfo: OrderInfo
  tests: LabTest[]
  report?: string
}

export const LabReportPrintLayout = React.forwardRef<HTMLDivElement, LabReportPrintLayoutProps>(
  ({ patientInfo, orderInfo, tests, report }, ref) => {
    return (
      <div ref={ref} className="print-container bg-white">
        <style jsx global>{`
          .print-only {
            display: none;
          }
          
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only {
              display: block !important;
            }
            .print-container,
            .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        `}</style>

        {/* A4 Page Container */}
        <div className="w-full max-w-[210mm] mx-auto bg-white relative p-8">
          {/* Letterhead Header */}
          <div className="text-center border-b-4 border-blue-900 pb-2 mb-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
                <span className="text-white text-2xl font-serif italic">S</span>
              </div>
              <h1 className="text-2xl font-bold text-blue-900 tracking-wide">
                SRIJONI HEALING HOME PVT. LTD.
              </h1>
            </div>
            <p className="text-xs text-gray-700">
              56, HEM CHANDRA NASKAR ROAD, BELIAGHATA, KOLKATA - 10
            </p>
            <p className="text-xs text-gray-700">
              PHONE: 2372 0038 / 2372-0378, FAX: 2372-0862, E-MAIL: srijonihealinghome@gmail.com
            </p>
          </div>

          {/* Report Header */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">LABORATORY REPORT</h2>
          </div>

          {/* Patient Info and Order Info Row */}
          <div className="grid grid-cols-2 gap-8 mb-4 text-xs">
            {/* Left Column - Patient Info */}
            <div>
              <div className="mb-1">
                <span className="font-semibold">Patient Name:</span> {patientInfo.name}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Regd. No.:</span> {patientInfo.uhid}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Age:</span> {patientInfo.age}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Sex:</span> {patientInfo.gender}
              </div>
              {patientInfo.address && (
                <div className="mb-1">
                  <span className="font-semibold">Address:</span>
                  <div className="ml-4">{patientInfo.address}</div>
                </div>
              )}
            </div>

            {/* Right Column - Order Details */}
            <div>
              <div className="mb-1">
                <span className="font-semibold">Lab Order No.:</span> {orderInfo.orderId}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Order Date:</span> {orderInfo.orderDate}
              </div>
              {orderInfo.collectionDate && (
                <div className="mb-1">
                  <span className="font-semibold">Collection Date:</span> {orderInfo.collectionDate}
                </div>
              )}
              <div className="mb-1">
                <span className="font-semibold">Report Date:</span> {orderInfo.reportDate}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Referring Doctor:</span> {orderInfo.doctorName}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Priority:</span>{" "}
                <span className={orderInfo.priority === "STAT" ? "text-red-600 font-bold" : ""}>
                  {orderInfo.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Test Results Table */}
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2 bg-gray-100 px-2 py-1 border border-gray-400">TEST RESULTS</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1 text-left">Test Name</th>
                  <th className="border border-gray-400 px-2 py-1 text-center">Result</th>
                  <th className="border border-gray-400 px-2 py-1 text-center">Units</th>
                  <th className="border border-gray-400 px-2 py-1 text-center">Normal Range</th>
                  <th className="border border-gray-400 px-2 py-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-400 px-2 py-1">{test.testName}</td>
                    <td className="border border-gray-400 px-2 py-1 text-center font-semibold">
                      {test.value}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-center">{test.units || "-"}</td>
                    <td className="border border-gray-400 px-2 py-1 text-center">
                      {test.normalRange || "-"}
                    </td>
                    <td
                      className={`border border-gray-400 px-2 py-1 text-center font-semibold ${
                        test.status === "critical"
                          ? "text-red-600"
                          : test.status === "abnormal"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {test.status.toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Notes */}
          {tests.some((t) => t.notes) && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2 bg-gray-100 px-2 py-1 border border-gray-400">NOTES</h3>
              <div className="text-xs border border-gray-400 px-2 py-2 min-h-[60px]">
                {tests
                  .filter((t) => t.notes)
                  .map((test, idx) => (
                    <div key={idx} className="mb-1">
                      <span className="font-semibold">{test.testName}:</span> {test.notes}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Lab Report/Interpretation */}
          {report && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-2 bg-gray-100 px-2 py-1 border border-gray-400">
                INTERPRETATION & RECOMMENDATIONS
              </h3>
              <div className="text-xs border border-gray-400 px-2 py-2 min-h-[80px] whitespace-pre-wrap">
                {report}
              </div>
            </div>
          )}

          {/* Test Execution Info */}
          <div className="mb-8 text-xs">
            <h3 className="text-sm font-bold mb-2 bg-gray-100 px-2 py-1 border border-gray-400">
              TEST EXECUTION DETAILS
            </h3>
            <div className="border border-gray-400 px-2 py-2">
              {tests.map((test, idx) => (
                <div key={idx} className="mb-1">
                  <span className="font-semibold">{test.testName}:</span> Performed by {test.technician} on{" "}
                  {test.completedAt.toLocaleDateString()}
                  {test.verifiedBy && ` | Verified by ${test.verifiedBy}`}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end text-xs mt-12">
            <div>
              <div className="text-[10px] text-gray-600 mb-2">
                ** This is a computer-generated report **
              </div>
            </div>
            <div className="text-right">
              <div>For: SRIJONI HEALING HOME PVT LTD.</div>
              <div className="mt-8 border-t border-gray-400 pt-1">Authorized Signatory</div>
            </div>
          </div>

          {/* Software Footer */}
          <div className="absolute bottom-2 left-8 text-[8px] text-gray-500">
            Software: Hospital Management System - Laboratory Module
          </div>

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <div className="w-64 h-64 rounded-full border-8 border-gray-400 flex items-center justify-center">
              <span className="text-9xl font-serif italic text-gray-400">S</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

LabReportPrintLayout.displayName = "LabReportPrintLayout"
