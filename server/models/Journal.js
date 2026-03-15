const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  ambience: { 
    type: String, 
    required: true,
    enum: ['forest', 'ocean', 'mountain']
  },
  text: { 
    type: String, 
    required: true 
  },
  // Storing the LLM analysis directly on the document makes the Insights API much easier to build
  analysis: {
    emotion: { type: String },
    keywords: [{ type: String }], 
    summary: { type: String }
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields, useful for time-based insights
});

module.exports = mongoose.model('Journal', journalSchema);