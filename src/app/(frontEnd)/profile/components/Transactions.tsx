"use client";

import React, { useState, useEffect } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchFrontendTransactions, exportFrontendTransactions } from "@/redux/slices/frontEnd/transactionSlice";
import { fetchFrontendBookings } from "@/redux/slices/frontEnd/bookingSlice";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InvoiceTemplate } from "./InvoiceTemplate";

interface TransactionItem {
  id: string;
  transactionRef?: string;
  date: string;
  description: string;
  paymentMethod: string;
  amount: string;
  status: "Success" | "Processing" | "Failed";
  type: string;
  quantity: number;
  unitPrice: string;
}

const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions: backendTxns, loading: txnsLoading } = useSelector((state: RootState) => state.frontendTransaction);
  const { bookings } = useSelector((state: RootState) => state.frontendBooking);
  const { user } = useSelector((state: RootState) => state.frontendUser);
  const [txnSearch, setTxnSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingTxn, setDownloadingTxn] = useState<TransactionItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    dispatch(fetchFrontendTransactions());
    dispatch(fetchFrontendBookings());
  }, [dispatch]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  // Map Redux Transactions to UI Format
  const transactions: TransactionItem[] = backendTxns.map((t: any) => {
    const eventName = t.eventId?.title || "Event Registration";
    const rawAmount = t.amount || 0;
    
    // Resolve booking from state if t.bookingId is just an ID
    const bookingIdStr = typeof t.bookingId === 'string' ? t.bookingId : (t.bookingId?._id || t.bookingId?.id);
    const booking = bookings?.find((b: any) => b._id === bookingIdStr);
    const bookingTickets = booking?.tickets || (typeof t.bookingId === 'object' ? t.bookingId.tickets : null);

    let mappedTickets: any[] = [];
    
    if (bookingTickets && bookingTickets.length > 0) {
      mappedTickets = bookingTickets.map((bt: any) => {
         const tQty = bt.quantity || 1;
         const tPrice = (bt.price !== undefined && bt.price !== null) ? bt.price : (rawAmount / (bookingTickets.length || 1));
         return {
           name: bt.ticketName || "Event Ticket",
           quantity: tQty,
           unitPrice: tPrice === 0 ? "₹ 0" : `₹ ${Number(tPrice).toFixed(2)}`,
           totalPrice: tPrice === 0 ? "₹ 0" : `₹ ${(Number(tPrice) * tQty).toFixed(2)}`
         };
      });
    } else {
      const fbQty = t.quantity || 1;
      const fbUnitPrice = fbQty > 0 ? (rawAmount / fbQty) : rawAmount;
      mappedTickets = [{
        name: t.description || "Event Ticket Booking",
        quantity: fbQty,
        unitPrice: `₹ ${Number(fbUnitPrice).toFixed(2)}`,
        totalPrice: `₹ ${Number(rawAmount).toFixed(2)}`
      }];
    }

    const qty = mappedTickets.length > 0 ? mappedTickets.reduce((sum, item) => sum + item.quantity, 0) : (t.quantity || 1);
    const unitPrice = qty > 0 ? (rawAmount / qty).toFixed(2) : rawAmount.toFixed(2);

    return {
      id: t.transactionRef || t._id,
      transactionRef: t.transactionRef,
      date: dayjs(t.dateAndTime || t.createdAt).format('DD MMM YYYY, hh:mm A'),
      description: t.description || (eventName ? `${eventName} Registration` : "Payment"),
      paymentMethod: t.paymentMethod || "Online",
      amount: `₹ ${rawAmount}`,
      status: t.status === 'Success' ? 'Success' : (t.status === 'Failed' ? 'Failed' : 'Processing'),
      type: t.type === 'EVENT' ? 'EVENT' : (t.type === 'MEMBERSHIP' ? 'MEMBERSHIP' : t.type || 'EVENT'),
      eventName: eventName,
      tickets: mappedTickets,
      quantity: qty,
      unitPrice: `₹ ${unitPrice}`,
    };
  });

  const filteredTransactions = transactions.filter((txn) => {
    return (
      txn.description.toLowerCase().includes(txnSearch.toLowerCase()) ||
      txn.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      txn.paymentMethod.toLowerCase().includes(txnSearch.toLowerCase())
    );
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await dispatch(exportFrontendTransactions()).unwrap();
      toast.success("Transaction statement downloaded!");
    } catch (error: any) {
      toast.error(error || "Failed to export statement");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadReceipt = (txn: TransactionItem) => {
    setDownloadingTxn(txn);
    setTimeout(async () => {
      const element = document.getElementById("invoice-template-container");
      if (element) {
        try {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true, logging: true });
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Invoice_${txn.id}.pdf`);
          toast.success("Receipt downloaded successfully!");
        } catch (error) {
          toast.error("Failed to generate receipt PDF");
        }
        setDownloadingTxn(null);
      }
    }, 100);
  };

  return (
    <div className="tab-pane fade show active">
      <div className="account-content-card p-3 p-md-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 mb-4 border-bottom gap-3">
          <div>
            <h4 className="card-header-title mb-1">
              <IconifyIcon icon="lucide:receipt" className="text-primary" />
              Transaction & Payment History
            </h4>
            <p className="text-muted small mb-0">Record of payments made for membership dues, event delegate passes, and CMEs.</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "240px" }}>
              <span className="input-group-text bg-white">
                <IconifyIcon icon="lucide:search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search transactions..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
              />
            </div>

            <button
              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <IconifyIcon icon="lucide:file-spreadsheet" width="15" />
              )}
              {isExporting ? "Exporting..." : "Export Statement"}
            </button>
          </div>
        </div>

        {txnsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Fetching your transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-5">
            <IconifyIcon icon="lucide:credit-card" width="48" className="text-muted mb-3" />
            <h5 className="fw-semibold text-muted">No transactions found</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table account-table align-middle">
              <thead>
                <tr>
                  <th>Transaction Ref</th>
                  <th>Date & Time</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Payment Method</th>
                  <th className="text-center">Qty</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="fw-bold text-dark font-monospace">{txn.id}</td>
                    <td className="text-nowrap text-muted small">{txn.date}</td>
                    <td className="fw-semibold text-dark">{txn.description}</td>
                    <td>
                      <span className={`badge ${txn.type === 'EVENT' ? 'bg-primary' : 'bg-success'} bg-opacity-10 ${txn.type === 'EVENT' ? 'text-primary border-primary' : 'text-success border-success'} border border-opacity-25 px-2.5 py-1`}>
                        {txn.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2.5 py-1">
                        <IconifyIcon icon="lucide:wallet" className="me-1 text-primary" />
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="text-center fw-medium text-dark">{txn.quantity}</td>
                    <td className="fw-bold text-dark">{txn.amount}</td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill">
                        {txn.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <OverlayTrigger placement="top" overlay={<Tooltip>Download Receipt</Tooltip>}>
                        <button
                          className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1"
                          onClick={() => handleDownloadReceipt(txn)}
                          disabled={downloadingTxn?.id === txn.id}
                        >
                          {downloadingTxn?.id === txn.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
                          ) : (
                            <IconifyIcon icon="lucide:download" width="14" />
                          )}
                        </button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {downloadingTxn && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <InvoiceTemplate transaction={downloadingTxn} user={user} />
        </div>
      )}
    </div>
  );
};

export default Transactions;

