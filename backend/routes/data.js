const express = require('express');
const router = express.Router();
const Data = require('../models/Data');

// @route   GET api/data
// @desc    Get all data
// @access  Public
router.get('/', async (req, res) => {
  try {
    const data = await Data.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/data
// @desc    Add new data
// @access  Public
router.post('/', async (req, res) => {
  const { tower1, tower2, tower3, rssi } = req.body;

  try {
    const newData = new Data({
      tower1,
      tower2,
      tower3,
      rssi
    });

    const data = await newData.save();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/data
// @desc    Delete all data
// @access  Public
router.delete('/', async (req, res) => {
  try {
    await Data.deleteMany({});
    res.json({ msg: 'All data removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
