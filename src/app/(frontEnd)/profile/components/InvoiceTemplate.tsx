import React from "react";
import { useSettingsContext } from "@/context/useSettingsContext";
import logo from "@/assets/images/logo.png";
import Image from "next/image";

export interface TransactionTicket {
  name: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface TransactionItem {
  id: string;
  transactionRef?: string;
  date: string;
  description: string;
  paymentMethod: string;
  amount: string;
  status: "Success" | "Processing" | "Failed" | string;
  type: string;
  eventName?: string;
  tickets?: TransactionTicket[];
  quantity: number;
  unitPrice: string;
}

interface InvoiceTemplateProps {
  transaction: TransactionItem;
  user: any;
  id?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ transaction, user, id }) => {
  const { setting } = useSettingsContext();

  return (
    <div id={id || "invoice-template-container"} style={{ width: '800px', padding: '40px', backgroundColor: '#fff', color: '#333', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <Image
            src={setting("general.logo", logo.src)}
            alt={setting("general.title", "AISGWB")}
            width={86}
            height={135}
            style={{ objectFit: 'contain' }}
            unoptimized
            priority
          />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '4px', backgroundColor: (transaction.status === 'Success' || transaction.status === 'Completed' || transaction.status === 'Free') ? '#dcfce7' : (transaction.status === 'Processing' || transaction.status === 'Pending' ? '#fef08a' : '#fee2e2'), color: (transaction.status === 'Success' || transaction.status === 'Completed' || transaction.status === 'Free') ? '#166534' : (transaction.status === 'Processing' || transaction.status === 'Pending' ? '#854d0e' : '#991b1b'), fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            {transaction.status}
          </div>
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>Invoice #{transaction.transactionRef}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Booked By</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{user?.name || user?.fullName || ''}</p>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', marginBottom: '2px' }}>Email: {user?.email || 'N/A'}</p>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Phone: {user?.phone || user?.mobile || 'N/A'}</p>
        </div>
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Invoice Date</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>{transaction.date}</p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937', fontSize: '16px' }}>
          Event: {transaction.eventName || transaction.description}
        </p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', width: '10%' }}>#</th>
            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', width: '40%' }}>Ticket Name</th>
            <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', width: '15%' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', width: '15%' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', width: '20%' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(transaction.tickets && transaction.tickets.length > 0) ? (
            transaction.tickets.map((ticket, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 0', color: '#6b7280' }}>{String(index + 1).padStart(2, '0')}</td>
                <td style={{ padding: '16px 0' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{ticket.name}</p>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'center', color: '#1f2937' }}>{ticket.quantity}</td>
                <td style={{ padding: '16px 0', textAlign: 'right', color: '#1f2937' }}>{ticket.unitPrice}</td>
                <td style={{ padding: '16px 0', textAlign: 'right', color: '#1f2937' }}>{ticket.totalPrice}</td>
              </tr>
            ))
          ) : (
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px 0', color: '#6b7280' }}>01</td>
              <td style={{ padding: '16px 0' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{transaction.description}</p>
              </td>
              <td style={{ padding: '16px 0', textAlign: 'center', color: '#1f2937' }}>{transaction.quantity}</td>
              <td style={{ padding: '16px 0', textAlign: 'right', color: '#1f2937' }}>{transaction.unitPrice}</td>
              <td style={{ padding: '16px 0', textAlign: 'right', color: '#1f2937' }}>{transaction.amount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: '#4b5563' }}>
            <span>Subtotal</span>
            <span>{transaction.amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
            <span style={{ color: '#1f2937' }}>Total Amount</span>
            <span style={{ color: '#1f2937' }}>{transaction.amount}</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Note: For any queries, please contact {setting("general.support_email", "")}.</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: 'bold', marginBottom: '4px' }}>Thank you for being a part of this event!</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>warm regards,<br />{setting("general.title", "AISGWB")}</p>
      </div>
    </div>
  );
};
