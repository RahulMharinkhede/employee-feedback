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
            {id: 1, name: 'Jitendra Nikhade', number: 1},
            {id: 2, name: 'Surekha Pande', number: 2},
            {id: 3, name: 'Dattatray Raut', number: 3},
            {id: 4, name: 'Kalpana Chandele', number: 4},
            {id: 6, name: 'Pawan Kulthe', number: 6},
            {id: 7, name: 'Nitin Ambade', number: 7},
            {id: 8, name: 'Kiran Supe', number: 8},
            {id: 9, name: 'Hemant Kadnake', number: 9},
            {id: 10, name: 'Naresh Nikhare', number: 10},
            {id: 11, name: 'Madhuri Nimkar', number: 11},
            {id: 12, name: 'Kishor Eknar', number: 12},
            {id: 13, name: 'Bhagwan Chandrawanshi', number: 13},
            {id: 14, name: 'Abhijeet Tekam', number: 14},
            {id: 16, name: 'Prakash Bonde', number: 16},
            {id: 17, name: 'Rushikesh Pullarwar', number: 17},
            {id: 18, name: 'Priya Lekurwale', number: 18},
            {id: 19, name: 'Dipak Dafade', number: 19},
            {id: 20, name: 'Shalini Kasare', number: 20},
            {id: 21, name: 'Samir Kahile', number: 21},
            {id: 22, name: 'Sachin Meshram', number: 22},
            {id: 23, name: 'Chandrakant Kubade', number: 23},
            {id: 24, name: 'Kavita Patil', number: 24},
            {id: 25, name: 'Nayankumar Hargule', number: 25},
            {id: 26, name: 'Parmeshwar Ambore', number: 26},
            {id: 27, name: 'Nitish Halde', number: 27},
            {id: 28, name: 'Ajay Mahadole', number: 28},
            {id: 29, name: 'Mohan Nagpure', number: 29},
            {id: 30, name: 'Paritosh Shukla', number: 30},
            {id: 31, name: 'Antariksh Kumbhare', number: 31},
            {id: 32, name: 'Shweta Lokhande', number: 32},
            {id: 33, name: 'Bharat Nimaje', number: 33},
            {id: 34, name: 'Chandrashekhar Ukey', number: 34},
            {id: 35, name: 'Navkiran shirasakar', number: 35},
            {id: 36, name: 'Prasanna Waradpande', number: 36},
            {id: 37, name: 'Vijay Dhage', number: 37},
            {id: 38, name: 'Manoj Shriwastav', number: 38},
            {id: 39, name: 'Vilash Kedar', number: 39},
            {id: 40, name: 'Gauri Zade', number: 40},
            {id: 41, name: 'Santosh Ghatol', number: 41},
            {id: 42, name: 'Hemant Bendale', number: 42},
            {id: 43, name: 'Shubham Pajgade', number: 43},
            {id: 44, name: 'Vikas Nandurkar', number: 44},
           {id: 45, name: 'Najim Patel', number: 45},
           {id: 46, name: 'Rahul Harinkhede', number: 46},
           {id: 47, name: 'Suraj Phule', number: 47},
           {id: 48, name: 'Prakash Tembhurne', number: 48},
           {id: 49, name: 'Sanjay Malwe', number: 49},
            {id: 50, name: 'Pradeep Wagh', number: 50},
            {id: 51, name: 'Madhukar Tikhe', number: 51},
            {id: 74, name: 'Vilas Shette', number: 74}
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
