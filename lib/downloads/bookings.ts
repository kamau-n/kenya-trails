import * as XLSX from "xlsx";

export const downloadAllBookings = async (bookings: any, event: any) => {
  try {
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoBase64 = ""; // <-- Optional: insert base64 logo string here

    let yPosition = 65;
    let pageNumber = 1;

    // Modern color palette
    const colors = {
      primary: [21, 21, 21], // Dark gray-blue
      secondary: [107, 114, 128], // Medium gray
      accent: [59, 130, 246], // Blue accent
      background: [249, 250, 251], // Light gray background
      success: [16, 185, 129], // Green
      warning: [245, 158, 11], // Amber
      danger: [239, 68, 68], // Red
      text: [17, 24, 39], // Dark text
      lightText: [107, 114, 128], // Light text
    };

    const renderHeader = () => {
      // Clean header with subtle background
      doc.setFillColor(...colors.background);
      doc.rect(0, 0, pageWidth, 50, "F");

      // Header border line
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(2);
      doc.line(0, 50, pageWidth, 50);

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", pageWidth - 45, 15, 25, 20);
      }

      // Company name
      doc.setTextColor(...colors.primary);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Kenya Trails", 20, 25);

      // Event title
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.secondary);
      doc.text(event?.title || "Event", 20, 32);

      // Report title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.text);
      doc.text("Bookings Payment Report", 20, 42);

      // Report metadata
      doc.setFontSize(9);
      doc.setTextColor(...colors.lightText);
      doc.setFont("helvetica", "normal");
      const reportDate = new Date().toLocaleDateString();
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

      doc.text(
        `Generated: ${reportDate} | Total Bookings: ${totalBookings} | Total Revenue: ${totalRevenue.toLocaleString()}`,
        20,
        58
      );
    };

    const renderTableHeader = () => {
      // Modern table header
      doc.setFillColor(...colors.primary);
      doc.rect(20, yPosition - 8, pageWidth - 40, 14, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);

      // Column headers with proper spacing for PDF width
      doc.text("CUSTOMER", 25, yPosition);
      doc.text("DATE", 55, yPosition);
      doc.text("TOTAL", 85, yPosition);
      doc.text("PEOPLE", 100, yPosition);
      doc.text("PAID", 130, yPosition);
      doc.text("DUE", 155, yPosition);
      doc.text("STATUS", 175, yPosition);

      yPosition += 18;
    };

    const renderTableRow = (booking, index) => {
      const rowHeight = 12;

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(253, 253, 253);
        doc.rect(20, yPosition - 6, pageWidth - 40, rowHeight, "F");
      }

      // Row border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(20, yPosition + 6, pageWidth - 20, yPosition + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.text);

      const bookingDate = new Date(booking.bookingDate).toLocaleDateString();

      // Customer name (truncated if too long)
      const customerName =
        booking.userName.length > 20
          ? booking.userName.slice(0, 17) + "..."
          : booking.userName;
      doc.text(customerName, 25, yPosition);

      // Date
      doc.text(bookingDate, 55, yPosition);

      // Amounts with proper formatting - aligned with headers
      doc.text(booking.totalAmount.toLocaleString(), 85, yPosition);
      doc.text(booking.numberOfPeople.toLocaleString(), 105, yPosition);
      doc.text(booking.amountPaid.toLocaleString(), 135, yPosition);
      doc.text(booking.amountDue.toLocaleString(), 160, yPosition);

      // Status with modern styling
      const statusText = booking.paymentStatus.toUpperCase();
      let statusColor;

      switch (booking.paymentStatus) {
        case "paid":
          statusColor = colors.success;
          break;
        case "partial":
          statusColor = colors.warning;
          break;
        default:
          statusColor = colors.danger;
      }

      doc.setTextColor(...statusColor);
      doc.setFont("helvetica", "bold");
      doc.text(statusText, 180, yPosition);

      yPosition += rowHeight;
    };

    const renderSummarySection = () => {
      yPosition += 10;

      // Summary box
      doc.setFillColor(...colors.background);
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(1);
      doc.rect(20, yPosition - 5, pageWidth - 40, 35, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...colors.primary);
      doc.text("PAYMENT SUMMARY", 25, yPosition + 5);

      // Calculate summary statistics
      const totalAmount = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalPaid = bookings.reduce((sum, b) => sum + b.amountPaid, 0);
      const totalDue = bookings.reduce((sum, b) => sum + b.amountDue, 0);
      const paidBookings = bookings.filter(
        (b) => b.paymentStatus === "paid"
      ).length;
      const partialBookings = bookings.filter(
        (b) => b.paymentStatus === "partial"
      ).length;
      const unpaidBookings = bookings.filter(
        (b) => b.paymentStatus === "unpaid"
      ).length;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.text);

      doc.text(
        `Total Revenue: KES ${totalAmount.toLocaleString()}`,
        25,
        yPosition + 15
      );
      doc.text(
        `Amount Collected: KES ${totalPaid.toLocaleString()}`,
        25,
        yPosition + 22
      );
      doc.text(
        `Outstanding: KES ${totalDue.toLocaleString()}`,
        25,
        yPosition + 29
      );

      doc.text(
        `Paid: ${paidBookings} | Partial: ${partialBookings} | Unpaid: ${unpaidBookings}`,
        120,
        yPosition + 15
      );
      doc.text(
        `Collection Rate: ${((totalPaid / totalAmount) * 100).toFixed(1)}%`,
        120,
        yPosition + 22
      );

      yPosition += 40;
    };

    const renderFooter = (pageNum: any) => {
      // Clean footer
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

      doc.setTextColor(...colors.lightText);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      doc.text(
        "Kenya Trails Booking System - Confidential",
        20,
        pageHeight - 15
      );
      doc.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 15, {
        align: "right",
      });
    };

    const renderSignatureLine = () => {
      if (yPosition > pageHeight - 60) {
        renderFooter(pageNumber);
        doc.addPage();
        pageNumber++;
        yPosition = 30;
      }

      yPosition += 15;
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 100, yPosition);

      doc.setFontSize(9);
      doc.setTextColor(...colors.text);
      doc.text("Authorized Signature", 20, yPosition + 8);

      doc.line(120, yPosition, 180, yPosition);
      doc.text("Date", 120, yPosition + 8);
    };

    // Generate PDF
    renderHeader();
    renderTableHeader();

    bookings.forEach((booking, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        renderFooter(pageNumber);
        doc.addPage();
        pageNumber++;
        yPosition = 65;
        renderHeader();
        renderTableHeader();
      }

      renderTableRow(booking, index);
    });

    // Add summary section on last page
    if (yPosition > pageHeight - 80) {
      renderFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      yPosition = 30;
    }

    renderSummarySection();
    renderSignatureLine();
    renderFooter(pageNumber);

    // Save with professional filename
    const filename = `Kenya_Trails_${(event?.title || "Event").replace(
      /\s+/g,
      "_"
    )}_Payment_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // setIsDownloading(false);
    console.log("successfully downloaded the bookings");
  }
};

export const downloadBookingsAsExcel = async (
  filteredBookings: any,
  event: any,
  bookings: any,
  totalCollections: any,
  collectionBalance: any,
  totalDue: any,
  paidBookings: any,
  pendingBookings: any,
  partialBookings: any
) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare booking data - ensure each booking is unique and not duplicated
    const uniqueBookings = filteredBookings().reduce((acc, booking) => {
      // Check if booking already exists in accumulator
      const existingBooking = acc.find((b) => b.id === booking.id);
      if (!existingBooking) {
        acc.push(booking);
      }
      return acc;
    }, []);

    // Prepare data for Excel with proper structure
    const excelData = uniqueBookings.map((booking, index) => ({
      "S/N": index + 1,
      "Booking ID": booking.id,
      "Customer Name": booking.userName,
      Email: booking.userEmail,
      "Booking Date": booking.bookingDate.toLocaleDateString(),
      "Number of People": booking.numberOfPeople,
      "Total Amount (KSh)": booking.totalAmount,
      "Amount Paid (KSh)": booking.amountPaid,
      "Balance Due (KSh)": booking.amountDue,
      "Payment Status":
        booking.paymentStatus.charAt(0).toUpperCase() +
        booking.paymentStatus.slice(1),
      Phone: booking.userPhone || "N/A",
    }));

    // Create summary worksheet
    const summaryData = [
      ["Event Summary"],
      ["Event Name", event.title],
      ["Event Date", new Date(event.date?.seconds * 1000).toLocaleDateString()],
      ["Total Bookings", bookings.length],
      ["Total Collections", `KSh ${totalCollections.toLocaleString()}`],
      ["Available Balance", `KSh ${collectionBalance.toLocaleString()}`],
      ["Pending Payments", `KSh ${totalDue.toLocaleString()}`],
      ["Paid Bookings", paidBookings],
      ["Partially Paid", partialBookings],
      ["Pending Bookings", pendingBookings],
      [],
      ["Payment Statistics"],
      [
        "Collection Rate",
        `${
          totalCollections + totalDue > 0
            ? Math.round(
                (totalCollections / (totalCollections + totalDue)) * 100
              )
            : 0
        }%`,
      ],
      ["Generated On", new Date().toLocaleString()],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths for summary
    summaryWs["!cols"] = [
      { wch: 20 }, // Labels
      { wch: 30 }, // Values
    ];

    // Create bookings worksheet with clean data
    const bookingsWs = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for bookings
    bookingsWs["!cols"] = [
      { wch: 5 }, // S/N
      { wch: 20 }, // Booking ID
      { wch: 25 }, // Customer Name
      { wch: 30 }, // Email
      { wch: 15 }, // Booking Date
      { wch: 12 }, // Number of People
      { wch: 18 }, // Total Amount
      { wch: 18 }, // Amount Paid
      { wch: 18 }, // Balance Due
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Phone
    ];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
    XLSX.utils.book_append_sheet(wb, bookingsWs, "Bookings");

    // Generate filename
    const eventTitle = event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `${eventTitle}_bookings_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);

    // setSuccess('Excel report downloaded successfully!');
  } catch (error) {
    console.error("Error generating Excel:", error);
    //  setError('Failed to generate Excel report');
  } finally {
    // setIsDownloading(false);
  }
};
