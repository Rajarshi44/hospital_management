"use client""use client"



import React from "react"import React from "react"



interface BillingLineItem {interface BillingLineItem {

  id: string  id: string

  description: string  description: string

  type: string  type: string

  rate: number  rate: number

  discount: number  discount: number

  amount: number  amount: number

}}



interface BillingCategory {interface BillingCategory {

  id: string  id: string

  name: string  name: string

  items: BillingLineItem[]  items: BillingLineItem[]

}}



interface PatientInfo {interface PatientInfo {

  name: string  name: string

  uhid: string  uhid: string

  age: string  age: string

  gender: string  gender: string

  pan: string  pan: string

  cin: string  cin: string

  address: string  address: string

}}



interface VisitInfo {interface VisitInfo {

  admissionDate: string  admissionDate: string

  dischargeDate: string  dischargeDate: string

  doctor: string  doctor: string

  diagnosis: string  diagnosis: string

}}



interface BillPrintLayoutProps {interface BillPrintLayoutProps {

  patientInfo: PatientInfo  patientInfo: PatientInfo

  visitInfo: VisitInfo  visitInfo: VisitInfo

  billingCategories: BillingCategory[]  billingCategories: BillingCategory[]

  billNumber: string  billNumber: string

  refNumber: string  refNumber: string

  date: string  date: string

  total: number  total: number

  totalDiscount: number  totalDiscount: number

  subtotal: number  subtotal: number

  serviceCharge: number  serviceCharge: number

  billAmount: number  billAmount: number

}}



export const BillPrintLayout = React.forwardRef<HTMLDivElement, BillPrintLayoutProps>(export const BillPrintLayout = React.forwardRef<HTMLDivElement, BillPrintLayoutProps>(

  (  (

    {    {

      patientInfo,      patientInfo,

      visitInfo,      visitInfo,

      billingCategories,      billingCategories,

      billNumber,      billNumber,

      refNumber,      refNumber,

      date,      date,

      total,      total,

      totalDiscount,      totalDiscount,

      subtotal,      subtotal,

      serviceCharge,      serviceCharge,

      billAmount,      billAmount,

    },    },

    ref    ref

  ) => {  ) => {

    return (    return (

      <>      <>

        <style dangerouslySetInnerHTML={{__html: `        <style dangerouslySetInnerHTML={{__html: `

          @media print {          @media print {

            @page {            @page {

              size: A4;              size: A4;

              margin: 15mm;              margin: 15mm;

            }            }

                        

            body {            body {

              margin: 0 !important;              margin: 0;

              padding: 0 !important;              padding: 0;

              font-family: Arial, sans-serif !important;              font-family: Arial, sans-serif;

            }            }

                        

            * {            * {

              -webkit-print-color-adjust: exact !important;              -webkit-print-color-adjust: exact !important;

              print-color-adjust: exact !important;              print-color-adjust: exact !important;

              color-adjust: exact !important;              color-adjust: exact !important;

            }            }

                        

            .bill-container {            .bill-container {

              width: 100% !important;              width: 100%;

              max-width: 100% !important;              max-width: 100%;

              padding: 0 !important;              padding: 0;

              margin: 0 !important;              margin: 0;

            }            }

                        

            .bill-table {            .bill-table {

              width: 100% !important;              width: 100%;

              border-collapse: collapse !important;              border-collapse: collapse;

              margin: 10px 0 !important;              margin: 10px 0;

            }            }

                        

            .bill-table th,            .bill-table th,

            .bill-table td {            .bill-table td {

              border: 1px solid #666 !important;              border: 1px solid #666;

              padding: 6px 8px !important;              padding: 6px 8px;

              font-size: 11px !important;              font-size: 11px;

            }            }

                        

            .bill-table th {            .bill-table th {

              background-color: #e5e7eb !important;              background-color: #e5e7eb;

              font-weight: bold !important;              font-weight: bold;

            }            }

                        

            .category-row {            .category-row {

              background-color: #f3f4f6 !important;              background-color: #f3f4f6;

              font-weight: bold !important;              font-weight: bold;

            }            }

                        

            .header-border {            .header-border {

              border-bottom: 3px solid #1e3a8a !important;              border-bottom: 3px solid #1e3a8a;

            }            }

                        

            .logo-circle {            .logo-circle {

              width: 48px !important;              width: 48px;

              height: 48px !important;              height: 48px;

              border-radius: 50% !important;              border-radius: 50%;

              background-color: #1e3a8a !important;              background-color: #1e3a8a;

              display: inline-flex !important;              display: inline-flex;

              align-items: center !important;              align-items: center;

              justify-content: center !important;              justify-content: center;

              color: white !important;              color: white;

              font-size: 24px !important;              font-size: 24px;

              font-family: serif !important;              font-family: serif;

              font-style: italic !important;              font-style: italic;

            }            }

          }          }

                    

          @media screen {          @media screen {

            .bill-container {            .bill-container {

              max-width: 210mm;              max-width: 210mm;

              margin: 0 auto;              margin: 0 auto;

              padding: 20mm;              padding: 20mm;

              background: white;              background: white;

              box-shadow: 0 0 10px rgba(0,0,0,0.1);              box-shadow: 0 0 10px rgba(0,0,0,0.1);

            }            }

          }          }

                    

          .bill-container {          .bill-container {

            font-family: Arial, sans-serif;            font-family: Arial, sans-serif;

            color: #000;            color: #000;

          }          }

                    

          .bill-table {          .bill-table {

            width: 100%;            width: 100%;

            border-collapse: collapse;            border-collapse: collapse;

            margin: 10px 0;            margin: 10px 0;

            font-size: 11px;            font-size: 11px;

          }          }

                    

          .bill-table th,          .bill-table th,

          .bill-table td {          .bill-table td {

            border: 1px solid #666;            border: 1px solid #666;

            padding: 6px 8px;            padding: 6px 8px;

            text-align: left;            text-align: left;

          }          }

                    

          .bill-table th {          .bill-table th {

            background-color: #e5e7eb;            background-color: #e5e7eb;

            font-weight: bold;            font-weight: bold;

          }          }

                    

          .category-row {          .category-row {

            background-color: #f3f4f6;            background-color: #f3f4f6;

            font-weight: bold;            font-weight: bold;

          }          }

                    

          .text-right {          .text-right {

            text-align: right;            text-align: right;

          }          }

                    

          .text-center {          .text-center {

            text-align: center;            text-align: center;

          }          }

                    

          .header-border {          .header-border {

            border-bottom: 3px solid #1e3a8a;            border-bottom: 3px solid #1e3a8a;

            padding-bottom: 8px;            padding-bottom: 8px;

            margin-bottom: 15px;            margin-bottom: 15px;

          }          }

                    

          .logo-circle {          .logo-circle {

            width: 48px;            width: 48px;

            height: 48px;            height: 48px;

            border-radius: 50%;            border-radius: 50%;

            background-color: #1e3a8a;            background-color: #1e3a8a;

            display: inline-flex;            display: inline-flex;

            align-items: center;            align-items: center;

            justify-content: center;            justify-content: center;

            color: white;            color: white;

            font-size: 24px;            font-size: 24px;

            font-family: serif;            font-family: serif;

            font-style: italic;            font-style: italic;

            vertical-align: middle;            vertical-align: middle;

          }          }

        `}} />        `}} />

                

        <div ref={ref} className="bill-container">        <div ref={ref} className="bill-container">

          {/* Header */}          {/* Header */}

          <div className="text-center header-border">          <div className="text-center header-border">

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>

              <span className="logo-circle">S</span>              <span className="logo-circle">S</span>

              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', margin: 0, letterSpacing: '0.5px' }}>              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', margin: 0, letterSpacing: '0.5px' }}>

                SRIJONI HEALING HOME PVT. LTD.                SRIJONI HEALING HOME PVT. LTD.

              </h1>              </h1>

            </div>            </div>

            <p style={{ fontSize: '10px', margin: '2px 0', color: '#374151' }}>            <p style={{ fontSize: '10px', margin: '2px 0', color: '#374151' }}>

              56, HEM CHANDRA NASKAR ROAD, BELIAGHATA, KOLKATA - 10              56, HEM CHANDRA NASKAR ROAD, BELIAGHATA, KOLKATA - 10

            </p>            </p>

            <p style={{ fontSize: '10px', margin: '2px 0', color: '#374151' }}>            <p style={{ fontSize: '10px', margin: '2px 0', color: '#374151' }}>

              PHONE: 2372 0038 / 2372-0378, FAX: 2372-0862, E-MAIL: srijonihealinghome@gmail.com              PHONE: 2372 0038 / 2372-0378, FAX: 2372-0862, E-MAIL: srijonihealinghome@gmail.com

            </p>            </p>

          </div>          </div>



          {/* Title */}          {/* Title */}

          <div className="text-center" style={{ margin: '15px 0' }}>          <div className="text-center" style={{ margin: '15px 0' }}>

            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>BILL CUM RECEIPT</h2>            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>BILL CUM RECEIPT</h2>

          </div>          </div>



          {/* Patient and Bill Info */}          {/* Patient and Bill Info */}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '11px', marginBottom: '15px' }}>          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '11px', marginBottom: '15px' }}>

            {/* Left Column */}            {/* Left Column */}

            <div>            <div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Sl. No.:</strong> {billNumber}                <strong>Sl. No.:</strong> {billNumber}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Name of Patient:</strong> {patientInfo.name}                <strong>Name of Patient:</strong> {patientInfo.name}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Address:</strong>                <strong>Address:</strong>

                <div style={{ marginLeft: '15px' }}>{patientInfo.address}</div>                <div style={{ marginLeft: '15px' }}>{patientInfo.address}</div>

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Admission Date:</strong> {visitInfo.admissionDate}                <strong>Admission Date:</strong> {visitInfo.admissionDate}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Discharge Date:</strong> {visitInfo.dischargeDate}                <strong>Discharge Date:</strong> {visitInfo.dischargeDate}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Doctor In Charge:</strong> {visitInfo.doctor}                <strong>Doctor In Charge:</strong> {visitInfo.doctor}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Case:</strong> {visitInfo.diagnosis}                <strong>Case:</strong> {visitInfo.diagnosis}

              </div>              </div>

            </div>            </div>



            {/* Right Column */}            {/* Right Column */}

            <div>            <div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Ref. No.:</strong> {refNumber}                <strong>Ref. No.:</strong> {refNumber}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Date:</strong> {date}                <strong>Date:</strong> {date}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Regd. No.:</strong> {patientInfo.uhid}                <strong>Regd. No.:</strong> {patientInfo.uhid}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Age:</strong> {patientInfo.age}                <strong>Age:</strong> {patientInfo.age}

              </div>              </div>

              <div style={{ marginBottom: '4px' }}>              <div style={{ marginBottom: '4px' }}>

                <strong>Sex:</strong> {patientInfo.gender}                <strong>Sex:</strong> {patientInfo.gender}

              </div>              </div>

              {patientInfo.pan && (              {patientInfo.pan && (

                <div style={{ marginBottom: '4px' }}>                <div style={{ marginBottom: '4px' }}>

                  <strong>Pan No.:</strong> {patientInfo.pan}                  <strong>Pan No.:</strong> {patientInfo.pan}

                </div>                </div>

              )}              )}

              {patientInfo.cin && (              {patientInfo.cin && (

                <div style={{ marginBottom: '4px' }}>                <div style={{ marginBottom: '4px' }}>

                  <strong>Policy No.:</strong> {patientInfo.cin}                  <strong>Policy No.:</strong> {patientInfo.cin}

                </div>                </div>

              )}              )}

            </div>            </div>

          </div>          </div>



          {/* Billing Table */}          {/* Billing Table */}

          <table className="bill-table">          <table className="bill-table">

            <thead>            <thead>

              <tr>              <tr>

                <th style={{ textAlign: 'left', width: '35%' }}>Description</th>                <th style={{ textAlign: 'left', width: '35%' }}>Description</th>

                <th style={{ textAlign: 'center', width: '8%' }}>Type</th>                <th style={{ textAlign: 'center', width: '8%' }}>Type</th>

                <th className="text-right" style={{ width: '10%' }}>Rate</th>                <th className="text-right" style={{ width: '10%' }}>Rate</th>

                <th className="text-right" style={{ width: '8%' }}>Disc.</th>                <th className="text-right" style={{ width: '8%' }}>Disc.</th>

                <th className="text-right" style={{ width: '12%' }}>Amount</th>                <th className="text-right" style={{ width: '12%' }}>Amount</th>

                <th className="text-right" style={{ width: '12%' }}>Serv. Ch. (15%)</th>                <th className="text-right" style={{ width: '12%' }}>Serv. Ch. (15%)</th>

                <th className="text-right" style={{ width: '12%' }}>Gross</th>                <th className="text-right" style={{ width: '12%' }}>Gross</th>

              </tr>              </tr>

            </thead>            </thead>

            <tbody>            <tbody>

              {billingCategories.map((category) => (              {billingCategories.map((category) => (

                <React.Fragment key={category.id}>                <React.Fragment key={category.id}>

                  {/* Category Header */}                  {/* Category Header */}

                  <tr className="category-row">                  <tr className="category-row">

                    <td colSpan={7}>{category.name} ::</td>                    <td colSpan={7}>{category.name} ::</td>

                  </tr>                  </tr>

                  {/* Category Items */}                  {/* Category Items */}

                  {category.items.map((item, idx) => {                  {category.items.map((item, idx) => {

                    const itemServiceCharge = item.amount * 0.15                    const itemServiceCharge = item.amount * 0.15

                    const itemGross = item.amount + itemServiceCharge                    const itemGross = item.amount + itemServiceCharge

                    return (                    return (

                      <tr key={item.id}>                      <tr key={item.id}>

                        <td>{item.description}</td>                        <td>{item.description}</td>

                        <td className="text-center">{item.type.toUpperCase()}</td>                        <td className="text-center">{item.type.toUpperCase()}</td>

                        <td className="text-right">{item.rate.toFixed(2)}</td>                        <td className="text-right">{item.rate.toFixed(2)}</td>

                        <td className="text-right">{item.discount.toFixed(2)}</td>                        <td className="text-right">{item.discount.toFixed(2)}</td>

                        <td className="text-right">{item.amount.toFixed(2)}</td>                        <td className="text-right">{item.amount.toFixed(2)}</td>

                        <td className="text-right">{idx === 0 ? itemServiceCharge.toFixed(2) : "Nil"}</td>                        <td className="text-right">{idx === 0 ? itemServiceCharge.toFixed(2) : "Nil"}</td>

                        <td className="text-right">{idx === 0 ? itemGross.toFixed(2) : item.amount.toFixed(2)}</td>                        <td className="text-right">{idx === 0 ? itemGross.toFixed(2) : item.amount.toFixed(2)}</td>

                      </tr>                      </tr>

                    )                    )

                  })}                  })}

                </React.Fragment>                </React.Fragment>

              ))}              ))}

            </tbody>            </tbody>

          </table>          </table>



          {/* Totals */}          {/* Totals */}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>

            <div style={{ width: '250px', fontSize: '11px' }}>            <div style={{ width: '250px', fontSize: '11px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #666', padding: '4px 0' }}>              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #666', padding: '4px 0' }}>

                <strong>Total ::</strong>                <strong>Total ::</strong>

                <span>{total.toFixed(2)}</span>                <span>{total.toFixed(2)}</span>

              </div>              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>

                <strong>Bill Amount</strong>                <strong>Bill Amount</strong>

                <span>{billAmount.toFixed(2)}</span>                <span>{billAmount.toFixed(2)}</span>

              </div>              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #666' }}>              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #666' }}>

                <strong>Paid Amount</strong>                <strong>Paid Amount</strong>

                <span>{billAmount.toFixed(2)}</span>                <span>{billAmount.toFixed(2)}</span>

              </div>              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', fontWeight: 'bold' }}>

                <span></span>                <span></span>

                <span>{billAmount.toFixed(2)}</span>                <span>{billAmount.toFixed(2)}</span>

              </div>              </div>

            </div>            </div>

          </div>          </div>



          {/* Amount in Words */}          {/* Amount in Words */}

          <div style={{ fontSize: '11px', marginBottom: '30px' }}>          <div style={{ fontSize: '11px', marginBottom: '30px' }}>

            <strong>Rupees. </strong>            <strong>Rupees. </strong>

            {numberToWords(billAmount)} Only            {numberToWords(billAmount)} Only

          </div>          </div>



          {/* Footer */}          {/* Footer */}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '50px' }}>          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '50px' }}>

            <div>            <div>

              <div style={{ borderTop: '1px solid #666', paddingTop: '4px', minWidth: '200px' }}>              <div style={{ borderTop: '1px solid #666', paddingTop: '4px', minWidth: '200px' }}>

                Signature of Patient / Guardian                Signature of Patient / Guardian

              </div>              </div>

            </div>            </div>

            <div style={{ textAlign: 'right' }}>            <div style={{ textAlign: 'right' }}>

              <div>For: SRIJONI HEALING HOME PVT LTD.</div>              <div>For: SRIJONI HEALING HOME PVT LTD.</div>

              <div style={{ marginTop: '40px', borderTop: '1px solid #666', paddingTop: '4px', minWidth: '200px' }}>              <div style={{ marginTop: '40px', borderTop: '1px solid #666', paddingTop: '4px', minWidth: '200px' }}>

                Authorized Signatory                Authorized Signatory

              </div>              </div>

            </div>            </div>

          </div>          </div>



          {/* Software Footer */}          {/* Software Footer */}

          <div style={{ position: 'absolute', bottom: '10px', left: '20px', fontSize: '8px', color: '#6b7280' }}>          <div style={{ position: 'absolute', bottom: '10px', left: '20px', fontSize: '8px', color: '#6b7280' }}>

            Software: Hospital Management System            Software: Hospital Management System

          </div>          </div>

        </div>        </div>

      </>      </>

    )    )

  }  }

))



BillPrintLayout.displayName = "BillPrintLayout"BillPrintLayout.displayName = "BillPrintLayout"

          {/* Letterhead Header */}

// Helper function to convert number to words          <div className="text-center border-b-4 border-blue-900 pb-2 mb-4">

function numberToWords(num: number): string {            <div className="flex items-center justify-center gap-3 mb-1">

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]              <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">

  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]                <span className="text-white text-2xl font-serif italic">S</span>

  const teens = [              </div>

    "Ten",              <h1 className="text-2xl font-bold text-blue-900 tracking-wide">

    "Eleven",                SRIJONI HEALING HOME PVT. LTD.

    "Twelve",              </h1>

    "Thirteen",            </div>

    "Fourteen",            <p className="text-xs text-gray-700">

    "Fifteen",              56, HEM CHANDRA NASKAR ROAD, BELIAGHATA, KOLKATA - 10

    "Sixteen",            </p>

    "Seventeen",            <p className="text-xs text-gray-700">

    "Eighteen",              PHONE: 2372 0038 / 2372-0378, FAX: 2372-0862, E-MAIL: srijonihealinghome@gmail.com

    "Nineteen",            </p>

  ]          </div>



  if (num === 0) return "Zero"          {/* Bill Header */}

          <div className="text-center mb-4">

  const crores = Math.floor(num / 10000000)            <h2 className="text-xl font-bold">BILL CUM RECEIPT</h2>

  const lakhs = Math.floor((num % 10000000) / 100000)          </div>

  const thousands = Math.floor((num % 100000) / 1000)

  const hundreds = Math.floor((num % 1000) / 100)          {/* Bill Info and Patient Info Row */}

  const remainder = Math.floor(num % 100)          <div className="grid grid-cols-2 gap-8 mb-4 text-xs">

            {/* Left Column - Patient Info */}

  let result = ""            <div>

              <div className="mb-1">

  if (crores > 0) result += convertTwoDigit(crores) + " Crore "                <span className="font-semibold">Sl. No.:</span> {billNumber}

  if (lakhs > 0) result += convertTwoDigit(lakhs) + " Lakh "              </div>

  if (thousands > 0) result += convertTwoDigit(thousands) + " Thousand "              <div className="mb-1">

  if (hundreds > 0) result += ones[hundreds] + " Hundred "                <span className="font-semibold">Name of Patient:</span> {patientInfo.name}

  if (remainder > 0) result += convertTwoDigit(remainder)              </div>

              <div className="mb-1">

  return result.trim()                <span className="font-semibold">Address:</span>

                <div className="ml-4">{patientInfo.address}</div>

  function convertTwoDigit(n: number): string {              </div>

    if (n < 10) return ones[n]              <div className="mb-1">

    if (n >= 10 && n < 20) return teens[n - 10]                <span className="font-semibold">Admission Date:</span> {visitInfo.admissionDate}

    return tens[Math.floor(n / 10)] + " " + ones[n % 10]              </div>

  }              <div className="mb-1">

}                <span className="font-semibold">Discharge Date:</span> {visitInfo.dischargeDate}

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
          <table className="w-full text-xs border-collapse mb-4" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th className="border border-gray-400 px-2 py-1 text-left" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'left' }}>Description</th>
                <th className="border border-gray-400 px-2 py-1 text-center" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'center', width: '80px' }}>Type</th>
                <th className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right', width: '80px' }}>Rate</th>
                <th className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right', width: '60px' }}>Disc.</th>
                <th className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right', width: '80px' }}>Amount</th>
                <th className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right', width: '100px' }}>Serv. Ch. (15%)</th>
                <th className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right', width: '80px' }}>Gross</th>
              </tr>
            </thead>
            <tbody>
              {billingCategories.map(category => (
                <React.Fragment key={category.id}>
                  {/* Category Header */}
                  <tr>
                    <td colSpan={7} className="border border-gray-400 px-2 py-1 font-bold bg-gray-50" style={{ border: '1px solid #9ca3af', padding: '4px 8px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                      {category.name} ::
                    </td>
                  </tr>
                  {/* Category Items */}
                  {category.items.map((item, idx) => {
                    const itemServiceCharge = item.amount * 0.15
                    const itemGross = item.amount + itemServiceCharge
                    return (
                      <tr key={item.id}>
                        <td className="border border-gray-400 px-2 py-1" style={{ border: '1px solid #9ca3af', padding: '4px 8px' }}>{item.description}</td>
                        <td className="border border-gray-400 px-2 py-1 text-center" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'center' }}>
                          {item.type.toUpperCase()}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right' }}>
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right' }}>
                          {item.discount.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right' }}>
                          {item.amount.toFixed(2)}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right' }}>
                          {idx === 0 ? itemServiceCharge.toFixed(2) : "Nil"}
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-right" style={{ border: '1px solid #9ca3af', padding: '4px 8px', textAlign: 'right' }}>
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
