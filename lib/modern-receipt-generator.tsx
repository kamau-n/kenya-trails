import jsPDF from "jspdf";

export interface BookingReceiptData {
  id: string;
  eventTitle: string;
  userName?: string;
  userEmail: string;
  bookingDate: Date;
  amountPaid: number;
  amountDue: number;
  totalAmount: number;
  numberOfPeople: number;
  eventId: string;
  paymentStatus: string;
}

export interface PaymentReceiptData {
  id: string;
  eventTitle: string;
  amount: number;
  reference: string;
  status: string;
  createdAt: Date;
  userEmail: string;
  userName?: string;
  paymentFor?: string;
}

export class ModernReceiptGenerator {
  private doc: jsPDF;
  // Subtle, professional color palette
  private primaryColor = "#1f2937"; // Dark gray
  private accentColor = "#3b82f6"; // Professional blue
  private lightBlue = "#eff6ff"; // Very light blue
  private borderGray = "#e5e7eb"; // Light border gray
  private textGray = "#6b7280"; // Medium gray for secondary text
  private successGreen = "#059669"; // For paid status
  private warningRed = "#dc2626"; // For due amounts

  constructor() {
    this.doc = new jsPDF();
  }

  private addMinimalHeader(title: string) {
    // Clean header with subtle background
    this.doc.setFillColor("#f8fafc"); // Very light gray
    this.doc.rect(0, 0, 210, 35, "F");

    // Thin accent line
    this.doc.setFillColor(this.accentColor);
    this.doc.rect(0, 0, 210, 2, "F");

    // Company name - clean typography
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Kenya Trails", 20, 18);

    // Subtle tagline
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(this.textGray);
    this.doc.text("Adventure & Discovery Platform", 20, 25);

    // Receipt title - right aligned
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(this.primaryColor);
    this.doc.text(title, 190, 18, { align: "right" });

    // Reset colors
    this.doc.setTextColor(0, 0, 0);
  }

  private addCompanyDetails() {
    // Minimal company info block
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.textGray);
    this.doc.setFont("helvetica", "normal");

    const companyInfo = [
      "Kenya Trails Ltd. • P.O. Box 12345, Nairobi, Kenya",
      "Tel: +254 759 155 650 • Email: info@kenyatrails.com",
      "www.kenyatrails.com",
    ];

    let y = 45;
    companyInfo.forEach((line) => {
      this.doc.text(line, 20, y);
      y += 4;
    });
  }

  private addReceiptDetails(receiptId: string, date: Date, status?: string) {
    // Clean info box with subtle border
    this.doc.setDrawColor(this.borderGray);
    this.doc.setLineWidth(0.5);
    this.doc.rect(140, 40, 50, 25, "S");

    // Receipt details
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.textGray);
    this.doc.setFont("helvetica", "normal");

    const details = [
      { label: "Receipt ID:", value: receiptId.substring(0, 10).toUpperCase() },
      { label: "Date:", value: date.toLocaleDateString("en-GB") },
      {
        label: "Time:",
        value: date.toLocaleTimeString("en-GB", { hour12: false }),
      },
    ];

    if (status) {
      details.push({ label: "Status:", value: status.toUpperCase() });
    }

    let y = 46;
    details.forEach((detail) => {
      this.doc.text(detail.label, 142, y);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(this.primaryColor);
      this.doc.text(detail.value, 142, y + 3);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(this.textGray);
      y += 8;
    });
  }

  private addSection(title: string, y: number): number {
    // Subtle section divider
    this.doc.setDrawColor(this.borderGray);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y, 190, y);

    // Section title
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, 20, y + 8);

    return y + 18;
  }

  private addDataRow(
    label: string,
    value: string,
    y: number,
    emphasized: boolean = false
  ): number {
    this.doc.setFontSize(9);

    // Label
    this.doc.setTextColor(this.textGray);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(label, 25, y);

    // Value
    this.doc.setTextColor(emphasized ? this.primaryColor : this.textGray);
    this.doc.setFont("helvetica", emphasized ? "bold" : "normal");
    this.doc.text(value, 100, y);

    return y + 6;
  }

  private addFinancialSummary(
    amounts: {
      total?: number;
      paid: number;
      due?: number;
    },
    y: number
  ): number {
    // Professional financial summary box
    this.doc.setFillColor("#f9fafb"); // Very light gray
    this.doc.setDrawColor(this.borderGray);
    this.doc.setLineWidth(0.5);
    this.doc.rect(110, y, 80, amounts.due !== undefined ? 30 : 20, "FD");

    let currentY = y + 8;
    this.doc.setFontSize(9);

    if (amounts.total !== undefined) {
      // Total amount
      this.doc.setTextColor(this.textGray);
      this.doc.setFont("helvetica", "normal");
      this.doc.text("Total Amount", 115, currentY);
      this.doc.setTextColor(this.primaryColor);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`KSh ${amounts.total.toLocaleString()}`, 185, currentY, {
        align: "right",
      });
      currentY += 7;
    }

    // Amount paid
    this.doc.setTextColor(this.textGray);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Amount Paid", 115, currentY);
    this.doc.setTextColor(this.successGreen);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`KSh ${amounts.paid.toLocaleString()}`, 185, currentY, {
      align: "right",
    });
    currentY += 7;

    if (amounts.due !== undefined) {
      // Balance due
      this.doc.setTextColor(this.textGray);
      this.doc.setFont("helvetica", "normal");
      this.doc.text("Balance Due", 115, currentY);
      this.doc.setTextColor(
        amounts.due > 0 ? this.warningRed : this.successGreen
      );
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`KSh ${amounts.due.toLocaleString()}`, 185, currentY, {
        align: "right",
      });
    }

    return y + (amounts.due !== undefined ? 40 : 30);
  }

  private addStatusBadge(status: string, x: number, y: number) {
    const statusUpper = status.toUpperCase();
    const isPositive = ["PAID", "COMPLETED", "CONFIRMED"].includes(statusUpper);

    // Badge background
    this.doc.setFillColor(isPositive ? "#dcfce7" : "#fef3c7"); // Light green or yellow
    this.doc.setDrawColor(isPositive ? this.successGreen : "#f59e0b");
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(x, y - 4, 25, 8, 2, 2, "FD");

    // Badge text
    this.doc.setFontSize(7);
    this.doc.setTextColor(isPositive ? this.successGreen : "#f59e0b");
    this.doc.setFont("helvetica", "bold");
    this.doc.text(statusUpper, x + 12.5, y, { align: "center" });
  }

  private addMinimalFooter() {
    const footerY = 265;

    // Subtle divider line
    this.doc.setDrawColor(this.borderGray);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, footerY, 190, footerY);

    // Professional thank you
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Thank you for choosing Kenya Trails", 20, footerY + 8);

    // Legal notice
    this.doc.setFontSize(7);
    this.doc.setTextColor(this.textGray);
    this.doc.text(
      "This is a digitally generated receipt. No physical signature required.",
      20,
      footerY + 15
    );
    this.doc.text(
      "For support: support@kenyatrails.com | +254 700 123 456",
      20,
      footerY + 20
    );
  }

  generateBookingReceipt(booking: BookingReceiptData): void {
    this.doc = new jsPDF();

    // Header
    this.addMinimalHeader("BOOKING RECEIPT");
    this.addCompanyDetails();
    this.addReceiptDetails(
      booking.id,
      booking.bookingDate,
      booking.paymentStatus
    );

    let currentY = 75;

    // Customer Information
    currentY = this.addSection("CUSTOMER DETAILS", currentY);
    currentY = this.addDataRow(
      "Customer Name",
      booking.userName || "Not specified",
      currentY
    );
    currentY = this.addDataRow("Email Address", booking.userEmail, currentY);
    currentY = this.addDataRow(
      "Booking Reference",
      booking.id.substring(0, 12).toUpperCase(),
      currentY,
      true
    );

    currentY += 5;

    // Event Information
    currentY = this.addSection("BOOKING DETAILS", currentY);
    currentY = this.addDataRow("Event", booking.eventTitle, currentY, true);
    currentY = this.addDataRow(
      "Event ID",
      booking.eventId.substring(0, 12).toUpperCase(),
      currentY
    );
    currentY = this.addDataRow(
      "Participants",
      booking.numberOfPeople.toString(),
      currentY
    );
    currentY = this.addDataRow(
      "Booking Date",
      booking.bookingDate.toLocaleDateString("en-GB"),
      currentY
    );

    // Status badge
    this.addStatusBadge(booking.paymentStatus, 160, currentY - 2);

    currentY += 10;

    // Financial Summary
    currentY = this.addSection("PAYMENT SUMMARY", currentY);
    currentY = this.addFinancialSummary(
      {
        total: booking.totalAmount,
        paid: booking.amountPaid,
        due: booking.amountDue,
      },
      currentY
    );

    // Terms notice
    currentY += 10;
    this.doc.setFontSize(7);
    this.doc.setTextColor(this.textGray);
    this.doc.text(
      "Terms: Full payment required 48 hours before event date. Cancellation policy applies.",
      20,
      currentY
    );

    this.addMinimalFooter();
  }

  generatePaymentReceipt(payment: PaymentReceiptData): void {
    this.doc = new jsPDF();

    // Header
    this.addMinimalHeader("PAYMENT RECEIPT");
    this.addCompanyDetails();
    this.addReceiptDetails(payment.id, payment.createdAt, payment.status);

    let currentY = 75;

    // Customer Information
    currentY = this.addSection("CUSTOMER DETAILS", currentY);
    currentY = this.addDataRow(
      "Customer Name",
      payment.userName || "Not specified",
      currentY
    );
    currentY = this.addDataRow("Email Address", payment.userEmail, currentY);

    currentY += 5;

    // Payment Information
    currentY = this.addSection("PAYMENT DETAILS", currentY);
    currentY = this.addDataRow(
      "Service",
      payment.paymentFor || "Event Promotion",
      currentY,
      true
    );
    currentY = this.addDataRow(
      "Transaction Reference",
      payment.reference,
      currentY,
      true
    );
    currentY = this.addDataRow(
      "Payment Date",
      payment.createdAt.toLocaleDateString("en-GB"),
      currentY
    );
    currentY = this.addDataRow(
      "Payment Time",
      payment.createdAt.toLocaleTimeString("en-GB", { hour12: false }),
      currentY
    );

    // Status badge
    this.addStatusBadge(payment.status, 160, currentY - 2);

    currentY += 10;

    // Amount Details
    currentY = this.addSection("AMOUNT PAID", currentY);
    currentY = this.addFinancialSummary({ paid: payment.amount }, currentY);

    // Service terms
    currentY += 10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.textGray);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Service Terms:", 20, currentY);

    currentY += 5;
    this.doc.setFont("helvetica", "normal");
    const terms = [
      "• Payment covers event promotion services on Kenya Trails platform",
      "• Service delivery as per agreed promotion package",
      "• Refunds subject to terms and conditions",
    ];

    terms.forEach((term) => {
      this.doc.text(term, 20, currentY);
      currentY += 4;
    });

    this.addMinimalFooter();
  }

  save(filename: string): void {
    this.doc.save(filename);
  }
}

// Export functions for easy use in components
export const downloadBookingReceipt = (booking: BookingReceiptData): void => {
  const generator = new ModernReceiptGenerator();
  generator.generateBookingReceipt(booking);
  generator.save(`booking-receipt-${booking.id.substring(0, 8)}.pdf`);
};

export const downloadPaymentReceipt = (payment: PaymentReceiptData): void => {
  const generator = new ModernReceiptGenerator();
  generator.generatePaymentReceipt(payment);
  generator.save(`payment-receipt-${payment.id.substring(0, 8)}.pdf`);
};
