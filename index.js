const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/cheeseburger-counter', { useNewUrlParser: true, useUnifiedTopology: true });

const staffSchema = new mongoose.Schema({
    name: String,
    soldCount: Number
});

const Staff = mongoose.model('Staff', staffSchema);

app.get('/staff', async (req, res) => {
    const staff = await Staff.find();
    res.json(staff);
});

app.post('/staff', async (req, res) => {
    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.json(newStaff);
});

app.put('/staff/:id', async (req, res) => {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStaff);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
