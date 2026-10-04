const Member = require('../models/Member');
const Transaction = require('../models/Transaction');

// @desc    Get all members
// @route   GET /api/members
exports.getAllMembers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    // Attach active issued count to each member
    const memberData = await Promise.all(
      members.map(async (m) => {
        const activeLoans = await Transaction.countDocuments({
          memberId: m._id,
          status: 'issued',
        });
        return {
          ...m.toObject(),
          activeLoans,
        };
      })
    );

    res.status(200).json({ success: true, count: memberData.length, data: memberData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const transactions = await Transaction.find({ memberId: member._id })
      .populate('bookId', 'title author isbn')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...member.toObject(),
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a member
// @route   POST /api/members
exports.createMember = async (req, res) => {
  try {
    const { name, email, phone, membershipDate } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone',
      });
    }

    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: `Member with email '${email}' already exists`,
      });
    }

    const member = await Member.create({
      name,
      email,
      phone,
      membershipDate: membershipDate || Date.now(),
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a member
// @route   PUT /api/members/:id
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const { name, email, phone } = req.body;

    if (email && email !== member.email) {
      const existing = await Member.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Member with email '${email}' already exists`,
        });
      }
      member.email = email;
    }

    if (name) member.name = name;
    if (phone) member.phone = phone;

    const updatedMember = await member.save();
    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a member
// @route   DELETE /api/members/:id
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const activeIssued = await Transaction.findOne({
      memberId: member._id,
      status: 'issued',
    });

    if (activeIssued) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete member: This member currently has unreturned books. Please return them first.',
      });
    }

    await Member.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
