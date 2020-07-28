import mongoose from 'mongoose'

const Facts = mongoose.model('Facts', {

    name: { type: String },
    info: { type: String },
    image: {type: String }
   
  });

  export default Facts
  