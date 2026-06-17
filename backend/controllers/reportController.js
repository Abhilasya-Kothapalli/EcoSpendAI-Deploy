const User = require('../models/User');
const Expense = require('../models/Expense');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

// @desc    Generate and download Monthly Sustainability Certificate PDF
// @route   GET /api/reports/certificate
// @access  Private
const getCertificateReport = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const expenses = await Expense.find({ userId: req.user._id });

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sustainability_certificate_${user.name.replace(/\s+/g, '_')}.pdf"`);

    // Stream PDF directly to client response
    generateCertificatePDF(user, expenses, res);
  } catch (error) {
    console.error('PDF Generation Error:', error.message);
    // If headers were already sent, just close connection, else return 500 JSON
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Failed to generate PDF report' });
    }
    res.end();
  }
};

module.exports = {
  getCertificateReport
};
