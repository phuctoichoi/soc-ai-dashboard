require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection settings
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || 'soc_ai';
const collectionName = process.env.MONGODB_COLLECTION || 'cases';

let client;
let db;
let casesCollection;

async function connectDB() {
  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db(dbName);
    casesCollection = db.collection(collectionName);
    console.log(`Connected successfully to MongoDB: database "${dbName}", collection "${collectionName}"`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Helpers
function getUtcNowIso() {
  return new Date().toISOString();
}

// 1. Get all cases (with optional status filtering)
app.get('/api/cases', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    // Sort by received_at descending (latest cases first)
    const cases = await casesCollection
      .find(query)
      .sort({ received_at: -1 })
      .toArray();

    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 2. Get case details by case_id
app.get('/api/cases/:case_id', async (req, res) => {
  try {
    const { case_id } = req.params;
    const caseData = await casesCollection.findOne({ case_id: case_id.trim() });
    
    if (!caseData) {
      return res.status(404).json({ error: 'Not Found', message: `Case ${case_id} not found.` });
    }
    
    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 3. Update HITL decision (Approve / Reject) with Optimistic Concurrency Control
app.post('/api/cases/:case_id/review', async (req, res) => {
  try {
    const { case_id } = req.params;
    const { decision, reviewer, feedback, edited_recommendation } = req.body;

    // Validation
    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Unsupported HITL decision. Must be "Approved" or "Rejected".' });
    }
    if (!reviewer || !reviewer.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'Reviewer name is required.' });
    }

    const reviewedAt = getUtcNowIso();
    const cleanCaseId = case_id.trim();

    // Filters by case_id AND status: 'Waiting_HITL'
    const filter = {
      case_id: cleanCaseId,
      status: 'Waiting_HITL'
    };

    const update = {
      $set: {
        status: decision,
        updated_at: reviewedAt,
        'hitl.decision': decision,
        'hitl.edited_recommendation': edited_recommendation ? edited_recommendation.trim() : null,
        'hitl.feedback': feedback ? feedback.trim() : null,
        'hitl.reviewer': reviewer.trim(),
        'hitl.reviewed_at': reviewedAt
      },
      $push: {
        audit_trail: {
          action: 'HITL_DECISION',
          from_status: 'Waiting_HITL',
          to_status: decision,
          actor: reviewer.trim(),
          at: reviewedAt,
          details: {
            feedback: feedback ? feedback.trim() : null,
            edited_recommendation: edited_recommendation ? edited_recommendation.trim() : null
          }
        }
      }
    };

    // Atomic update
    const result = await casesCollection.findOneAndUpdate(
      filter,
      update,
      { returnDocument: 'after' }
    );

    // If result is null, it means no document matched case_id with status Waiting_HITL
    // Note: in newer MongoDB NodeJS drivers, result might be the document directly or an object containing the document under `value`
    const updatedDocument = result.value || result;

    if (!updatedDocument) {
      return res.status(409).json({ 
        error: 'Conflict / Not Reviewable', 
        message: 'Case was not found or has already been reviewed by another analyst.' 
      });
    }

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating HITL decision:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// 4. Ask AI Assistant for further event details
app.post('/api/cases/:case_id/ask', async (req, res) => {
  try {
    const { case_id } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'Question is required.' });
    }

    const caseData = await casesCollection.findOne({ case_id: case_id.trim() });
    if (!caseData) {
      return res.status(404).json({ error: 'Not Found', message: `Case ${case_id} not found.` });
    }

    // Build rich prompt for Ollama containing case context and the analyst's question
    const prompt = [
      'Bạn là kỹ sư phân tích mã độc và an ninh mạng SOC thông minh.',
      'Dưới đây là thông tin chi tiết về sự cố (Wazuh Raw Alert JSON):',
      JSON.stringify(caseData.raw_alert || {}, null, 2),
      '',
      `Hãy trả lời câu hỏi sau của nhà phân tích bằng tiếng Việt ngắn gọn, tập trung vào kỹ thuật và đưa ra các hành động cụ thể cần làm:`,
      `"${question.trim()}"`
    ].join('\n');

    const ollamaUrl = 'http://192.168.1.242:11434/api/generate';
    console.log(`Sending question to Ollama at ${ollamaUrl} for case ${case_id}`);

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json({ answer: data.response });
  } catch (error) {
    console.error('Error asking AI:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
});
