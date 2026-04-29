const Notification = require('../models/Notification');

// Get notifications for the authenticated user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete (dismiss) a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    // Use a single atomic find-and-delete to ensure ownership and avoid remove() middleware issues
    const note = await Notification.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!note) {
      // Could be not found or not owned by user
      const exists = await Notification.findById(id);
      if (!exists) return res.status(404).json({ success: false, message: 'Notification not found' });

      // Log ownership mismatch for debugging
      console.warn('Delete notification authorization failure', {
        notificationId: id,
        notificationOwner: exists.userId ? String(exists.userId) : exists.userId,
        requester: req.user ? String(req.user._id) : req.user,
        requesterRole: req.user ? req.user.role : undefined
      });

      return res.status(403).json({ success: false, message: 'Not authorized to delete this notification' });
    }

    res.json({ success: true, message: 'Notification dismissed' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
