const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// API endpoint to receive feedback
app.post('/api/feedback', (req, res) => {
    try {
        const feedbackData = req.body;
        
        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `feedback_${feedbackData.evaluator.name.replace(/\s+/g, '_')}_${feedbackData.evaluator.number}_${timestamp}.json`;
        const filepath = path.join(dataDir, filename);
        
        // Save to JSON file
        fs.writeFileSync(filepath, JSON.stringify(feedbackData, null, 2));
        
        // Also save to CSV for easy viewing
        const csvFilename = filename.replace('.json', '.csv');
        const csvFilepath = path.join(dataDir, csvFilename);
        
        let csvContent = "Employee Name,Employee Number,Rating,Reason,Evaluator,Evaluator Number,Timestamp\n";
        
        Object.entries(feedbackData.ratings).forEach(([id, rating]) => {
            const emp = getEmployeeById(id);
            const reason = rating <= 3 ? (feedbackData.reasons[id] || 'No reason provided') : '';
            const reasonFormatted = reason ? `"${reason.replace(/"/g, '""')}"` : '';
            
            csvContent += `"${emp.name}",${emp.number},${rating},${reasonFormatted},"${feedbackData.evaluator.name}",${feedbackData.evaluator.number},"${feedbackData.completedAt}"\n`;
        });
        
        fs.writeFileSync(csvFilepath, csvContent);
        
        console.log(`Feedback saved: ${filename}`);
        res.json({ success: true, message: 'Feedback saved successfully' });
        
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ success: false, message: 'Error saving feedback' });
    }
});

// API endpoint to get all feedback (for admin)
app.get('/api/feedback', (req, res) => {
    try {
        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
        const allFeedback = files.map(file => {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            return { filename: file, data: data };
        });
        
        res.json(allFeedback);
    } catch (error) {
        console.error('Error reading feedback:', error);
        res.status(500).json({ success: false, message: 'Error reading feedback' });
    }
});

// API endpoint to download all feedback as ZIP
app.get('/api/download-all', (req, res) => {
    try {
        const archiver = require('archiver');
        const archive = archiver('zip');
        
        res.attachment('all-feedback.zip');
        archive.pipe(res);
        
        archive.directory(dataDir, false);
        archive.finalize();
        
    } catch (error) {
        console.error('Error creating ZIP:', error);
        res.status(500).json({ success: false, message: 'Error creating ZIP' });
    }
});

// Helper function to get employee by ID
function getEmployeeById(id) {
    const employees = [
        {id: 1, name: 'John Smith', number: 1},
        {id: 2, name: 'Jane Johnson', number: 2},
        {id: 3, name: 'Mike Williams', number: 3},
        {id: 4, name: 'Sarah Brown', number: 4},
        {id: 5, name: 'David Jones', number: 5},
        {id: 6, name: 'Lisa Garcia', number: 6},
        {id: 7, name: 'Chris Miller', number: 7},
        {id: 8, name: 'Anna Davis', number: 8},
        {id: 9, name: 'Mark Rodriguez', number: 9},
        {id: 10, name: 'Emily Martinez', number: 10},
        {id: 11, name: 'James Hernandez', number: 11},
        {id: 12, name: 'Maria Lopez', number: 12},
        {id: 13, name: 'Robert Gonzalez', number: 13},
        {id: 14, name: 'Jennifer Wilson', number: 14},
        {id: 15, name: 'William Anderson', number: 15},
        {id: 16, name: 'Linda Thomas', number: 16},
        {id: 17, name: 'Richard Taylor', number: 17},
        {id: 18, name: 'Patricia Moore', number: 18},
        {id: 19, name: 'Charles Jackson', number: 19},
        {id: 20, name: 'Barbara Martin', number: 20},
        {id: 21, name: 'Joseph Lee', number: 21},
        {id: 22, name: 'Elizabeth Perez', number: 22},
        {id: 23, name: 'Thomas Thompson', number: 23},
        {id: 24, name: 'Susan White', number: 24},
        {id: 25, name: 'Daniel Harris', number: 25},
        {id: 26, name: 'Jessica Sanchez', number: 26},
        {id: 27, name: 'Matthew Clark', number: 27},
        {id: 28, name: 'Nancy Ramirez', number: 28},
        {id: 29, name: 'Anthony Lewis', number: 29},
        {id: 30, name: 'Dorothy Robinson', number: 30}
    ];
    
    return employees.find(emp => emp.id == id) || {name: 'Unknown', number: 0};
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Data will be saved to: ${dataDir}`);
    console.log('API endpoints:');
    console.log('- POST /api/feedback (submit feedback)');
    console.log('- GET /api/feedback (view all feedback)');
    console.log('- GET /api/download-all (download all as ZIP)');
});
