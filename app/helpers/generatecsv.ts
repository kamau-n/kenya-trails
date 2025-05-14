export const generateCSV = (bookings: any) => {
  const header = [
    "Booking ID",
    "User Name",
    "User Email",
    "Booking Date",
    "Number of People",
    "Total Amount",
    "Amount Paid",
    "Amount Due",
    "Payment Status",
  ];

  const rows = bookings.map((b) => [
    b.id,
    b.userName,
    b.userEmail,
    b.bookingDate.toLocaleDateString("en-KE"),
    b.numberOfPeople,
    b.totalAmount,
    b.amountPaid,
    b.amountDue,
    b.paymentStatus,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((val) => `"${val}"`).join(","))
    .join("\n");

  return csvContent;
};

export const downloadCSV = () => {
  const csv = generateCSV(bookings);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${displayEvent.title}-bookings.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
