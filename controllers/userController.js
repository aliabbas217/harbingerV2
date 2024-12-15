const User = require('../models/userModel')

exports.addUser = async (req, res) =>{
    try{
        const {email} = req.body;
        const user = new User({email});
        await user.save();
        res.status(200).json({
            message: 'User Created Successfully!',
            data: user
        });
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
}



exports.getCurrentUser = (req, res) => {
    try {
        res.json({ username: req.user.username });
    } catch (error) {
        res.status(500).send('Error fetching current user');
    }
};
