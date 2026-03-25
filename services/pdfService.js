const htmlPdf = require('html-pdf-node');

// Generate PDF from HTML content
const generatePDF = async (htmlContent, options = {}) => {
  try {
    const defaultOptions = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true,
      ...options
    };

    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, defaultOptions);

    return pdfBuffer;

  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Generate PDF from HTML content
const generateReceiptPDF = async (donation) => {
  try {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatPurpose = (purpose) => {
      return purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDonationType = (type) => {
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const amountToWords = (amount) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const convertHundreds = (num) => {
        let result = '';
        if (num > 99) {
          result += ones[Math.floor(num / 100)] + ' Hundred ';
          num %= 100;
        }
        if (num > 19) {
          result += tens[Math.floor(num / 10)] + ' ';
          num %= 10;
        } else if (num > 9) {
          result += teens[num - 10] + ' ';
          return result;
        }
        if (num > 0) {
          result += ones[num] + ' ';
        }
        return result;
      };

      if (amount === 0) return 'Zero Rupees Only';

      let crores = Math.floor(amount / 10000000);
      amount %= 10000000;
      let lakhs = Math.floor(amount / 100000);
      amount %= 100000;
      let thousands = Math.floor(amount / 1000);
      amount %= 1000;
      let hundreds = amount;

      let result = '';
      if (crores > 0) result += convertHundreds(crores) + 'Crore ';
      if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
      if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
      if (hundreds > 0) result += convertHundreds(hundreds);

      return result.trim() + ' Rupees Only';
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt-${donation.receiptNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
            }
            
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border: 2px solid #fed7aa;
              border-radius: 12px;
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #f59e0b, #f97316);
              color: white;
              padding: 30px;
              text-align: center;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            
            .logo-circle {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 20px;
              font-size: 30px;
            }
            
            .org-name {
              font-size: 32px;
              font-weight: bold;
              margin: 0;
            }
            
            .tagline {
              font-size: 16px;
              opacity: 0.9;
              margin: 5px 0 0 0;
            }
            
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              color: #ea580c;
              margin: 20px 0 10px 0;
            }
            
            .subtitle {
              color: #6b7280;
              font-size: 14px;
            }
            
            .content {
              padding: 30px;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .detail-section {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #374151;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 4px 0;
            }
            
            .detail-label {
              font-weight: 600;
              color: #6b7280;
            }
            
            .detail-value {
              font-weight: 600;
              color: #374151;
            }
            
            .amount-highlight {
              color: #ea580c;
              font-size: 20px;
            }
            
            .status-badge {
              background: #dcfce7;
              color: #166534;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            
            .donation-details {
              background: linear-gradient(135deg, #fff7ed, #fef3c7);
              border: 2px solid #fed7aa;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
            }
            
            .amount-section {
              text-align: center;
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #f59e0b;
              margin-top: 15px;
            }
            
            .amount-label {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            .amount-value {
              font-size: 28px;
              font-weight: bold;
              color: #ea580c;
            }
            
            .currency {
              font-size: 16px;
              color: #6b7280;
              margin-top: 5px;
            }
            
            .amount-words {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #6b7280;
            }
            
            .tax-info {
              background: #eff6ff;
              border: 2px solid #dbeafe;
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
            }
            
            .tax-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 15px;
            }
            
            .tax-list {
              list-style: none;
              padding: 0;
            }
            
            .tax-list li {
              color: #1e40af;
              margin: 8px 0;
              padding-left: 20px;
              position: relative;
            }
            
            .tax-list li:before {
              content: "•";
              color: #3b82f6;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            
            .org-details {
              border-top: 2px solid #e5e7eb;
              padding-top: 25px;
              margin-top: 30px;
            }
            
            .org-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            
            .org-section {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
            }
            
            .org-section h4 {
              font-weight: bold;
              color: #374151;
              margin-bottom: 10px;
            }
            
            .org-section p {
              color: #6b7280;
              font-size: 14px;
              margin: 3px 0;
            }
            
            .signature-section {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            
            .signature-line {
              width: 200px;
              height: 60px;
              border-bottom: 2px solid #6b7280;
              margin: 0 auto 10px auto;
            }
            
            .signature-name {
              font-weight: bold;
              color: #374151;
              margin-bottom: 5px;
            }
            
            .signature-designation {
              color: #6b7280;
              font-size: 12px;
            }
            
            .footer-note {
              color: #9ca3af;
              font-size: 12px;
              text-align: center;
              margin-top: 20px;
              line-height: 1.4;
            }
            
            @media print {
              body { 
                background: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                <div class="logo-circle">🙏</div>
                <div>
                  <h1 class="org-name">Moksha Sewa</h1>
                  <p class="tagline">Dignity in Departure</p>
                </div>
              </div>
              
              <div>
                <h2 class="receipt-title">DONATION RECEIPT</h2>
                <p class="subtitle">Tax Exemption under Section 80G of Income Tax Act, 1961</p>
                <p class="subtitle">Registration No: [Your 80G Registration Number]</p>
              </div>
            </div>

            <!-- Content -->
            <div class="content">
              <!-- Receipt and Donor Details -->
              <div class="details-grid">
                <div class="detail-section">
                  <h3 class="section-title">Receipt Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Receipt No:</span>
                    <span class="detail-value amount-highlight">${donation.receiptNumber}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Donation ID:</span>
                    <span class="detail-value">${donation.donationId}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formatDate(donation.createdAt)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="status-badge">${donation.paymentStatus.toUpperCase()}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <h3 class="section-title">Donor Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${donation.name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${donation.email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${donation.phone}</span>
                  </div>
                  ${donation.panNumber ? `
                  <div class="detail-row">
                    <span class="detail-label">PAN:</span>
                    <span class="detail-value">${donation.panNumber}</span>
                  </div>
                  ` : ''}
                </div>
              </div>

              <!-- Donation Details -->
              <div class="donation-details">
                <h3 class="section-title" style="text-align: center; margin-bottom: 20px;">Donation Details</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;">
                  <div>
                    <div class="detail-row">
                      <span class="detail-label">Purpose:</span>
                      <span class="detail-value amount-highlight">${formatPurpose(donation.purpose)}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Type:</span>
                      <span class="detail-value">${formatDonationType(donation.donationType)}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Payment Method:</span>
                      <span class="detail-value">${donation.paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div class="amount-section">
                    <p class="amount-label">Total Amount</p>
                    <p class="amount-value">₹${donation.amount.toLocaleString('en-IN')}</p>
                    <p class="currency">(${donation.currency.toUpperCase()})</p>
                  </div>
                </div>
              </div>

              <!-- Amount in Words -->
              <div class="amount-words">
                <span class="detail-label">Amount in Words: </span>
                <span class="detail-value">${amountToWords(donation.amount)}</span>
              </div>

              <!-- Tax Information -->
              <div class="tax-info">
                <h3 class="tax-title">Tax Exemption Information</h3>
                <ul class="tax-list">
                  <li>This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.</li>
                  <li>Moksha Sewa is registered under Section 12A and has valid 80G certification.</li>
                  <li>Please retain this receipt for your tax filing purposes.</li>
                  <li>For any queries regarding tax exemption, please contact our accounts department.</li>
                </ul>
              </div>

              <!-- Organization Details -->
              <div class="org-details">
                <div class="org-grid">
                  <div class="org-section">
                    <h4>Organization Details</h4>
                    <p><strong>Moksha Sewa Foundation</strong></p>
                    <p>Registered Address: [Your Organization Address]</p>
                    <p>Phone: [Your Phone Number]</p>
                    <p>Email: info@moksha-seva.org</p>
                    <p>Website: www.moksha-seva.org</p>
                  </div>
                  
                  <div class="org-section">
                    <h4>Registration Details</h4>
                    <p>PAN: [Organization PAN]</p>
                    <p>80G Registration: [80G Number]</p>
                    <p>12A Registration: [12A Number]</p>
                    <p>FCRA Registration: [FCRA Number if applicable]</p>
                  </div>
                </div>
              </div>

              <!-- Digital Signature -->
              <div class="signature-section">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Authorized Signatory</p>
                <div class="signature-line"></div>
                <p class="signature-name">[Authorized Person Name]</p>
                <p class="signature-designation">[Designation]</p>
                
                <div class="footer-note">
                  <p>This is a computer-generated receipt and does not require a physical signature.</p>
                  <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: true
    };

    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    return pdfBuffer;

  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error('Failed to generate PDF receipt');
  }
};

module.exports = {
  generateReceiptPDF,
  generatePDF
};