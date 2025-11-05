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

interface BillPrintLayoutProps {
  patientInfo: PatientInfo
  visitInfo: VisitInfo
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

export const BillPrintLayout = React.forwardRef<HTMLDivElement, BillPrintLayoutProps>(
  (
    {
      patientInfo,
      visitInfo,
      billingCategories,
      billNumber,
      refNumber,
      date,
      total,
      totalDiscount,
      subtotal,
      serviceCharge,
      billAmount,
    },
    ref
  ) => {
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
        <div className="w-full max-w-[210mm] mx-auto bg-white relative p-8"
>
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

          {/* Bill Header */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">BILL CUM RECEIPT</h2>
          </div>

          {/* Bill Info and Patient Info Row */}
          <div className="grid grid-cols-2 gap-8 mb-4 text-xs">
            {/* Left Column - Patient Info */}
            <div>
              <div className="mb-1">
                <span className="font-semibold">Sl. No.:</span> {billNumber}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Name of Patient:</span> {patientInfo.name}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Address:</span>
                <div className="ml-4">{patientInfo.address}</div>
              </div>
              <div className="mb-1">
                <span className="font-semibold">Admission Date:</span> {visitInfo.admissionDate}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Discharge Date:</span> {visitInfo.dischargeDate}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Doctor In Charge:</span> {visitInfo.doctor}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Case:</span> {visitInfo.diagnosis}
              </div>
            </div>

            {/* Right Column - Bill Details */}
            <div>
              <div className="mb-1">
                <span className="font-semibold">Ref. No.:</span> {refNumber}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Date:</span> {date}
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
              {patientInfo.pan && (
                <div className="mb-1">
                  <span className="font-semibold">Pan No.:</span> {patientInfo.pan}
                </div>
              )}
              {patientInfo.cin && (
                <div className="mb-1">
                  <span className="font-semibold">CIN No.:</span> {patientInfo.cin}
                </div>
              )}
            </div>
          </div>

          {/* Billing Table */}
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-1 text-left">Description</th>
                <th className="border border-gray-400 px-2 py-1 text-center">Type</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Rate</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Disc.</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Amount</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Serv. Ch. (15.00%)</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Gross</th>
              </tr>
            </thead>
            <tbody>
              {billingCategories.map(category => (
                <React.Fragment key={category.id}>
                  {/* Category Header */}
                  <tr>
                    <td colSpan={7} className="border border-gray-400 px-2 py-1 font-bold bg-gray-50">
                      {category.name} ::
                    </td>
                  </tr>
                  {/* Category Items */}
                  {category.items.map((item, idx) => {
                    const itemServiceCharge = item.amount * 0.15
                    const itemGross = item.amount + itemServiceCharge
                    return (
                      <tr key={item.id}>
                        <td className="border border-gray-400 px-2 py-1">{item.description}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center">
                          {item.type.toUpperCase()}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right">
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right">
                          {item.discount.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right">
                          {item.amount.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right">
                          {idx === 0 ? itemServiceCharge.toFixed(2) : "Nil"}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right">
                          {idx === 0 ? itemGross.toFixed(2) : item.amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="text-xs w-64">
              <div className="flex justify-between border-t border-gray-400 py-1">
                <span className="font-semibold">Total ::</span>
                <span>{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold">Bill Amount</span>
                <span>{billAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-400">
                <span className="font-semibold">Paid Amount</span>
                <span>{billAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-base font-bold">
                <span></span>
                <span>{billAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="text-xs mb-8">
            <span className="font-semibold">Rupees. </span>
            {numberToWords(billAmount)} Only
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end text-xs mt-12">
            <div>
              <div className="border-t border-gray-400 pt-1">Signature of Patient / Guardian</div>
            </div>
            <div className="text-right">
              <div>For: SRIJONI HEALING HOME PVT LTD.</div>
              <div className="mt-8 border-t border-gray-400 pt-1">Authorized Signatory</div>
            </div>
          </div>

          {/* Software Footer */}
          <div className="absolute bottom-2 left-8 text-[8px] text-gray-500">
            Software: Hospital Management System
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

BillPrintLayout.displayName = "BillPrintLayout"

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]

  if (num === 0) return "Zero"

  const crores = Math.floor(num / 10000000)
  const lakhs = Math.floor((num % 10000000) / 100000)
  const thousands = Math.floor((num % 100000) / 1000)
  const hundreds = Math.floor((num % 1000) / 100)
  const remainder = Math.floor(num % 100)

  let result = ""

  if (crores > 0) result += convertTwoDigit(crores) + " Crore "
  if (lakhs > 0) result += convertTwoDigit(lakhs) + " Lakh "
  if (thousands > 0) result += convertTwoDigit(thousands) + " Thousand "
  if (hundreds > 0) result += ones[hundreds] + " Hundred "
  if (remainder > 0) result += convertTwoDigit(remainder)

  return result.trim()

  function convertTwoDigit(n: number): string {
    if (n < 10) return ones[n]
    if (n >= 10 && n < 20) return teens[n - 10]
    return tens[Math.floor(n / 10)] + " " + ones[n % 10]
  }
}
