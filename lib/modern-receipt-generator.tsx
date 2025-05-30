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
  private primaryColor = "#059669"; // Green-600
  private secondaryColor = "#374151"; // Gray-700
  private lightGray = "#F3F4F6"; // Gray-100
  private darkGray = "#6B7280"; // Gray-500

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string) {
    // Background header
    this.doc.setFillColor(this.primaryColor);
    this.doc.rect(0, 0, 210, 40, "F");

    // Company logo/name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Kenya Trails", 20, 25);

    // Tagline
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Explore Kenya's Hidden Gems", 20, 32);

    // Receipt title
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, 140, 25);

    // Reset text color
    this.doc.setTextColor(0, 0, 0);
  }

  private addCompanyInfo() {
    this.doc.setFontSize(9);
    this.doc.setTextColor(this.darkGray);
    this.doc.text("Kenya Trails Ltd.", 20, 50);
    this.doc.text("P.O. Box 12345, Nairobi, Kenya", 20, 55);
    this.doc.text("Phone: +254 759 155 650", 20, 60);
    this.doc.text("Email: info@kenyatrails.com", 20, 65);
    this.doc.text("Website: www.kenyatrails.com", 20, 70);
  }

  private addReceiptInfo(receiptId: string, date: Date) {
    // Receipt info box
    this.doc.setFillColor(this.lightGray);
    this.doc.rect(140, 45, 50, 30, "F");

    this.doc.setFontSize(9);
    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Receipt #:", 145, 52);
    this.doc.text("Date:", 145, 58);
    this.doc.text("Status:", 145, 64);

    this.doc.setFont("helvetica", "normal");
    this.doc.text(receiptId.substring(0, 12).toUpperCase(), 145, 56);
    this.doc.text(date.toLocaleDateString("en-GB"), 145, 62);
    this.doc.text("PAID", 145, 68);
  }

  private addSectionTitle(title: string, y: number): number {
    this.doc.setFillColor(this.primaryColor);
    this.doc.rect(20, y, 170, 8, "F");

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, 22, y + 5.5);

    this.doc.setTextColor(0, 0, 0);
    return y + 15;
  }

  private addInfoRow(
    label: string,
    value: string,
    y: number,
    bold: boolean = false
  ): number {
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.darkGray);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(label, 25, y);

    this.doc.setTextColor(this.secondaryColor);
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.text(value, 100, y);

    return y + 6;
  }

  private addAmountSummary(
    amountPaid: number,
    amountDue: number,
    totalAmount: number,
    y: number
  ): number {
    // Summary box
    this.doc.setFillColor(this.lightGray);
    this.doc.rect(120, y, 70, 25, "F");
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.rect(120, y, 70, 25, "S");

    let currentY = y + 8;

    this.doc.setFontSize(10);
    this.doc.setTextColor(this.secondaryColor);

    // Total Amount
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Total Amount:", 125, currentY);
    this.doc.text(`KSh ${totalAmount.toLocaleString()}`, 160, currentY);
    currentY += 6;

    // Amount Paid
    this.doc.text("Amount Paid:", 125, currentY);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`KSh ${amountPaid.toLocaleString()}`, 160, currentY);
    currentY += 6;

    // Balance Due
    this.doc.setTextColor(amountDue > 0 ? "#DC2626" : this.primaryColor); // Red if due, green if paid
    this.doc.text("Balance Due:", 125, currentY);
    this.doc.text(`KSh ${amountDue.toLocaleString()}`, 160, currentY);

    return y + 35;
  }

  private addFooter() {
    const footerY = 260;

    // Footer line
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(20, footerY, 190, footerY);

    // Thank you message
    this.doc.setFontSize(12);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Thank you for choosing Kenya Trails!", 20, footerY + 10);

    // Footer info
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.darkGray);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      "This is a computer-generated receipt. No signature required.",
      20,
      footerY + 18
    );
    this.doc.text(
      "For inquiries, contact us at support@kenyatrails.com or +254 700 123 456",
      20,
      footerY + 24
    );
  }

  private addWatermark() {
    // Add subtle watermark
    this.doc.setTextColor(240, 240, 240);
    this.doc.setFontSize(40);
    this.doc.setFont("helvetica", "bold");

    // Save current state
    this.doc.saveGraphicsState();

    // Rotate and add watermark
    // this.doc.setGState({
    //   opacity: 0.1,
    // });

    // Center the watermark
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;

    this.doc.text("KENYA TRAILS", pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: "center",
    });

    // Restore state
    this.doc.restoreGraphicsState();
  }

  generateBookingReceipt(booking: BookingReceiptData): void {
    console.log(booking);
    this.doc = new jsPDF();

    // Add watermark first (behind content)
    this.addWatermark();

    // Header
    this.addHeader("BOOKING RECEIPT");

    // Company info and receipt info
    this.addCompanyInfo();
    this.addReceiptInfo(booking.id, booking.bookingDate);

    let currentY = 85;

    // Customer Information Section
    currentY = this.addSectionTitle("CUSTOMER INFORMATION", currentY);
    currentY = this.addInfoRow(
      "Name:",
      booking.userName || "Not provided",
      currentY
    );
    currentY = this.addInfoRow("Email:", booking.userEmail, currentY);
    currentY = this.addInfoRow(
      "Booking ID:",
      booking.id.substring(0, 12).toUpperCase(),
      currentY
    );
    currentY = this.addInfoRow(
      "Booking Date:",
      booking.bookingDate.toLocaleDateString("en-GB"),
      currentY
    );

    currentY += 10;

    // Event Information Section
    currentY = this.addSectionTitle("EVENT INFORMATION", currentY);
    currentY = this.addInfoRow("Event:", booking.eventTitle, currentY, true);
    currentY = this.addInfoRow(
      "Event ID:",
      booking.eventId.substring(0, 12).toUpperCase(),
      currentY
    );
    currentY = this.addInfoRow(
      "Number of People:",
      booking.numberOfPeople.toString(),
      currentY
    );
    currentY = this.addInfoRow(
      "Payment Status:",
      booking.paymentStatus.toUpperCase(),
      currentY,
      true
    );

    currentY += 10;

    // Payment Summary Section
    currentY = this.addSectionTitle("PAYMENT SUMMARY", currentY);
    currentY = this.addAmountSummary(
      booking.amountPaid,
      booking.amountDue,
      booking.totalAmount,
      currentY
    );

    // QR Code placeholder (you can integrate a QR code library)
    currentY += 10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.darkGray);
    this.doc.text("Scan QR code for booking verification:", 25, currentY);

    // QR Code placeholder box
    this.doc.setDrawColor(this.darkGray);
    this.doc.rect(25, currentY + 5, 30, 30, "S");
    this.doc.setFontSize(6);
    this.doc.text("QR CODE", 35, currentY + 22);

    // Footer
    this.addFooter();
  }

  generatePaymentReceipt(payment: PaymentReceiptData): void {
    this.doc = new jsPDF();

    // Add watermark first (behind content)
    this.addWatermark();

    // Header
    this.addHeader("PAYMENT RECEIPT");

    // Company info and receipt info
    this.addCompanyInfo();
    this.addReceiptInfo(payment.id, payment.createdAt);

    let currentY = 85;

    // Customer Information Section
    currentY = this.addSectionTitle("CUSTOMER INFORMATION", currentY);
    currentY = this.addInfoRow(
      "Name:",
      payment.userName || "Not provided",
      currentY
    );
    currentY = this.addInfoRow("Email:", payment.userEmail, currentY);

    currentY += 10;

    // Payment Information Section
    currentY = this.addSectionTitle("PAYMENT INFORMATION", currentY);
    currentY = this.addInfoRow("Service:", payment?.paymentFor, currentY, true);
    // currentY = this.addInfoRow(
    //   "Event:",
    //   payment.eventTitle || "Event",
    //   currentY,
    //   true
    // );
    currentY = this.addInfoRow(
      "Payment Reference:",
      payment.reference,
      currentY
    );
    currentY = this.addInfoRow(
      "Payment Date:",
      payment.createdAt.toLocaleDateString("en-GB"),
      currentY
    );
    currentY = this.addInfoRow(
      "Payment Status:",
      payment.status.toUpperCase(),
      currentY,
      true
    );

    currentY += 10;

    // Amount Section
    currentY = this.addSectionTitle("AMOUNT DETAILS", currentY);

    // Amount box
    this.doc.setFillColor(this.lightGray);
    this.doc.rect(120, currentY, 70, 15, "F");
    this.doc.setDrawColor(this.primaryColor);
    this.doc.setLineWidth(1);
    this.doc.rect(120, currentY, 70, 15, "S");

    this.doc.setFontSize(12);
    this.doc.setTextColor(this.primaryColor);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Total Paid:", 125, currentY + 8);
    this.doc.text(`KSh ${payment.amount.toLocaleString()}`, 155, currentY + 8);

    currentY += 25;

    // Terms and conditions
    currentY += 10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.darkGray);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("TERMS & CONDITIONS:", 25, currentY);
    currentY += 5;
    this.doc.text(
      "• This payment is for event promotion services on Kenya Trails platform",
      25,
      currentY
    );
    currentY += 4;
    this.doc.text(
      "• Promotion duration and terms as agreed upon booking",
      25,
      currentY
    );
    currentY += 4;
    this.doc.text("• Refunds are subject to our refund policy", 25, currentY);

    // Footer
    this.addFooter();
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
  console.log(payment);
  const generator = new ModernReceiptGenerator();
  generator.generatePaymentReceipt(payment);
  generator.save(`payment-receipt-${payment.id.substring(0, 8)}.pdf`);
};
