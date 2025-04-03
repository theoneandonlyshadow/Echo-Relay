const express = require('express');
const router = express.Router();
const { Model } = require('../monkeese/model.js');

router.post('/update-wss', async (req, res) => {
    const { shortCode } = req.body;
    
    try {
        if (!shortCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Short code is required' 
            });
        }
        
        const updatedDoc = await Model.findOneAndUpdate(
            { shortCode },
            { wss: true },
            { new: true }
        );
        
        if (!updatedDoc) {
            return res.status(404).json({
                success: false,
                message: 'Could not establish communication with XPR-WSS'
            });
        }
        
        res.json({ success: true, wss: updatedDoc.wss });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;