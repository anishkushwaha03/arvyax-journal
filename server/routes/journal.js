const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');

// POST /api/journal - Store entries in a database
router.post('/', async (req, res) => {
  try {
    const { userId, ambience, text } = req.body;

    const newEntry = new Journal({ userId, ambience, text });
    await newEntry.save();

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// GET /api/journal/:userId - Return all entries
router.get('/:userId', async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// GET /api/journal/insights/:userId - Return user insights
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // MongoDB aggregation to calculate the insights efficiently
    const insights = await Journal.aggregate([
      { $match: { userId: userId } },
      {
        $facet: {
          totalEntries: [{ $count: "count" }],
          ambienceStats: [
            { $group: { _id: "$ambience", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
          ],
          emotionStats: [
            { $match: { "analysis.emotion": { $exists: true } } },
            { $group: { _id: "$analysis.emotion", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
          ],
          recentKeywords: [
            { $match: { "analysis.keywords": { $exists: true } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $unwind: "$analysis.keywords" },
            { $group: { _id: "$analysis.keywords" } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    // Format the response to match the exact expected output 
    const result = insights[0];
    const totalEntries = result.totalEntries[0]?.count || 0;
    const mostUsedAmbience = result.ambienceStats[0]?._id || "none";
    const topEmotion = result.emotionStats[0]?._id || "none";
    const recentKeywords = result.recentKeywords.map(k => k._id) || [];

    res.status(200).json({
      totalEntries,
      topEmotion,
      mostUsedAmbience,
      recentKeywords
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// POST /api/journal/analyze - Analyze emotions using an LLM
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Strict prompt to ensure the exact output format
    const prompt = `
      Analyze the following journal entry from a user who just completed an immersive nature session.
      Provide the output strictly as a JSON object with exactly these keys:
      - "emotion": A single word describing the primary emotion.
      - "keywords": An array of 3-5 relevant keywords from the text.
      - "summary": A short one-sentence summary of the user's experience.

      Journal Entry: "${text}"
      
      Return ONLY valid JSON. Do not include markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    res.status(200).json(parsedData);

  } catch (error) {
    console.error("LLM Analysis Error:", error);
    res.status(500).json({ error: 'Failed to analyze journal entry' });
  }
});

module.exports = router;