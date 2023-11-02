// app.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors());
app.use('/public', express.static('uploads'));
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Create a schema for the blog post
const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  order: Number
});

// Create a model for the blog post
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the blog!');
});

app.get('/posts', async (req, res) => {
    try {
        const result = await BlogPost.find().sort({order: -1});
        const response = [...result];
        return res.send(response);
    } catch (error) {
        console.log("error", error);
        res.send({message: "error"})
    }
})
app.get('/posts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id", id);
        const result = await BlogPost.find({_id: id});
        const response = [...result];
        return res.send(response);
    } catch (error) {
        console.log("error", error);
        res.send({message: "error"})
    }
})

app.post('/post', upload.single('image'), (req, res) => {
  // Create a new blog post
  const blogPost = new BlogPost({
    title: req.body.title,
    content: req.body.content,
    image: req.file.filename
  });

  // Save the blog post to the database
  blogPost.save()
    .then(() => {
      res.send('Blog post created successfully!');
    })
    .catch(err => {
      console.error('Failed to create blog post', err);
      res.status(500).send('Failed to create blog post');
    });
});

app.put('/post/:post_id', express.json(), async (req, res) => {
  try {
      const {post_id} = req.params;
      const post = req.body;
      console.log("post", post);
      const updateResponse = await BlogPost.updateOne({_id: post_id}, {$set: post});
      return res.send({message: "post updated", status: updateResponse});
  } catch (error) {
    console.log(error);
    return res.status(500).send({message: "problem updating post", error: error});
  }
})

app.delete('/posts/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const deletionResponse = await BlogPost.deleteOne({_id: id});
      return res.send({message: "post deleted", status: deletionResponse});
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({message: "problem deleting post", error: error});
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});