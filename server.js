const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Add this line

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

const dbURI = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

mongoose.set('debug', true);

mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
    process.exit(1); // Exit the process with an error code
  });

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// Define the Customer schema
const customerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  productName: { type: String, default: '' },
  price: { type: Number, default: 0 },
  address: { type: String, default: '' },
  phone: { type: String, default: '' }
});

const Customer = mongoose.model('Customer', customerSchema);

// API endpoint to handle customer data
app.post('/customers', async (req, res) => {
  const { name, productName, price, address, phone } = req.body;
  const customerData = { name, productName, price, address, phone };
  const customer = new Customer(customerData);

  try {
    await customer.save();
    console.log('Customer data saved:', customer);
    res.send(customer);
  } catch (error) {
    console.error('Error saving customer data:', error);
    res.status(500).send('Error saving customer data');
  }
});

app.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.send(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).send('Error fetching customers');
  }
});


app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, productName, price, address, phone } = req.body;

  try {
    const customer = await Customer.findByIdAndUpdate(id, { name, productName, price, address, phone }, { new: true });
    res.send(customer);
  } catch (error) {
    console.error('Error updating customer data:', error);
    res.status(500).send('Error updating customer data');
  }
});

app.delete('/customers/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.send({ message: 'Customer deleted' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).send('Error deleting customer');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
