import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt-nodejs'

import Product from './models/Product'
import productdata from './data/productdata'

import About from './models/About'
import aboutcwg from './aboutcwg/'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/cleanGenAPI"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// login API

const Member = mongoose.model('Member', {
  name: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,    
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex'),
  }
});

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()
const listEndpoints = require("express-list-endpoints");

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable' })
  }
})

// Start defining your routes here
app.get('/', async (req, res) => {
  res.send(listEndpoints(app));
});

const authenticateUser = async (req, res, next) => {

  try {
    const user = await Member.findOne({
      accessToken: req.header('Authorization')
    });

    if (user) {
      req.user = user;
      next();
    } else {
      res
        .status(401)
        .json({ loggedOut: true, message:'Please try logging in again' });
     } 
    
   }  catch (err) {
     res
        .status(403)
        .json({ message: 'Access token is missing or wrong', errors: err })
    }
}

app.post('/members', async (req, res) => {

  try {
    const {name, email, password } = req.body;
    const user = new Member({name, email, password: bcrypt.hashSync(password)});
    const saved = await user.save();
    res.status(201).json({id: saved._id, accessToken: saved.accessToken});
  } catch (err) {
    res.status(400).json({message:'Could not create user', errors: err })
  }
})

app.get('/memberpage', authenticateUser);
app.get('/memberpage', (req, res) => {
  res.status(201).json({ message: 'Hello' });
})

app.post('/sessions', async (req, res) => {

  try {
    const { email, password } = req.body;
    const user = await Member.findOne({email});

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(201).json({ id: user._id, accessToken: user.accessToken });
    } else {
      res.status(404).json({ notFound: true })
    }

  } catch (err) {
    res.status(404).json({ notFound: true });
  }

});


/// Products API

  const seedDatabase = async () => {
    await Product.deleteMany();

    productdata.forEach((product) => new Product(product).save());

  };
  seedDatabase();


app.get("/products", async (req, res) => {
  
  Product.find(res.query)
  
  try { 
  if (productdata) {
       res.json(productdata)
   } else {
     res.status(404).json({error: 'Could not found product'})
   }

  } catch {
    res.status(404).json({ error: 'Something is invalid' })
  }
  
});

app.get('/product/:id', async (req, res) => {

  try {
    const product_id = await Product.findById(req.params.id)

    if(product_id) {
      res.json(product_id )
    } else {
      res.status(404).json({error: 'Product id not found'})
    }

  } catch(err) {
    res.status(400).json({error: 'Something is Invalid'})
  }

})


// information API 

const seedDatabase = async () => {
  await About.deleteMany();

  aboutcwg.forEach((about) => new About(about).save());

};
seedDatabase();


app.get("/about", async (req, res) => {
  
  About.find(res.query)
  
  try { 
  if (aboutcwg) {
       res.json(aboutcwg)
   } else {
     res.status(404).json({error: 'Could not found product'})
   }

  } catch {
    res.status(404).json({ error: 'Something is invalid' })
  }
  
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})


