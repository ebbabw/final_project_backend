import mongoose from 'mongoose'

const About = mongoose.model('About', {

    name: { type: String },
    info: { type: String },
    image: {type: String }
   
  });

  export default About
  