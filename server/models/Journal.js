const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true // [cite: 14]
  },
  ambience: { 
    type: String, 
    required: true,
    enum: ['forest', 'ocean', 'mountain'] // Restricting to the immersive sessions mentioned [cite: 3]
  },
  text: { 
    type: String, 
    required: true // [cite: 16]
  },
  // Storing the LLM analysis directly on the document makes the Insights API much easier to build
  analysis: {
    emotion: { type: String }, // [cite: 31]
    keywords: [{ type: String }], // [cite: 32]
    summary: { type: String } // [cite: 33]
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields, useful for time-based insights
});

module.exports = mongoose.model('Journal', journalSchema);