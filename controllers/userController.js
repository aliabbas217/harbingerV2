exports.getCurrentUser = (req, res) => {
    try {
        res.json({ username: req.user.username });
    } catch (error) {
        res.status(500).send('Error fetching current user');
    }
};
