const { spawn } = require("child_process");
const path = require("path");

exports.checkAtsScore = async (req, res) => {
    try {
        if (!req.file || !req.body.job_desc) {
            return res.status(400).json({ error: "Resume (PDF) and job description (JSON) are required." });
        }

        const jobDesc = JSON.parse(req.body.job_desc);
        const pdfBuffer = req.file.buffer;
        
        const pythonScriptPath = path.join(process.cwd(), 'utils', 'ats_service.py');
        const pythonProcess = spawn("python", [pythonScriptPath]);

        const processPromise = new Promise((resolve, reject) => {
            let result = "";
            let errorOutput = "";
            
            pythonProcess.stdout.on("data", (data) => {
                result += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
                console.error("Python Error:", data.toString());
            });

            pythonProcess.on("error", (error) => {
                console.error("Process error:", error);
                reject(error);
            });

            pythonProcess.on("close", (code) => {
                if (code === 0) {
                    // Try to find the last valid JSON in the output
                    try {
                        // Remove any non-JSON output that might precede the actual JSON
                        const lastLine = result.trim().split('\n').pop();
                        const parsedResult = JSON.parse(lastLine);
                        resolve(parsedResult);
                    } catch (parseError) {
                        reject(new Error(`Failed to parse Python output: ${result}\nError output: ${errorOutput}`));
                    }
                } else {
                    reject(new Error(`Process exited with code ${code}\nError output: ${errorOutput}`));
                }
            });
        });

        // Send data to Python process
        const inputData = JSON.stringify({
            resume_pdf: pdfBuffer.toString("base64"),
            job_desc: jobDesc
        });
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

        // Wait for the Python process to complete
        try {
            const result = await processPromise;
            return res.json(result);
        } catch (error) {
            console.error("Error processing Python result:", error);
            return res.status(500).json({ 
                error: "Error processing ATS score",
                details: error.message
            });
        }

    } catch (error) {
        console.error("Service error:", error);
        return res.status(500).json({ error: "Failed to process request" });
    }
};













// const { spawn } = require("child_process");
// const path = require("path"); // Add path import

// exports.checkAtsScore = async (req, res) => {
//     try {
//         if (!req.file || !req.body.job_desc) {
//             return res.status(400).json({ error: "Resume (PDF) and job description (JSON) are required." });
//         }

//         const jobDesc = JSON.parse(req.body.job_desc);
//         const pdfBuffer = req.file.buffer;

//         console.log(">>>>>>>>>>1st CHECK POINT");
        
//         const pythonScriptPath = path.join(process.cwd(), 'utils', 'ats_service.py');
//         console.log("Python script path:", pythonScriptPath);
        
//         const pythonProcess = spawn("python", [pythonScriptPath]);

//         console.log(">>>>>>>>>>2ND CHECK POINT");

//         // Create a promise to handle the async process
//         const processPromise = new Promise((resolve, reject) => {
//             let result = "";
            
//             pythonProcess.stdout.on("data", (data) => {
//                 console.log("Received data from Python");
//                 result += data.toString();
//             });

//             pythonProcess.stderr.on("data", (data) => {
//                 console.error("Python Error:", data.toString());
//             });

//             pythonProcess.on("error", (error) => {
//                 console.error("Process error:", error);
//                 reject(error);
//             });

//             pythonProcess.on("close", (code) => {
//                 console.log("Python process closed with code:", code);
//                 if (code === 0) {
//                     resolve(result);
//                 } else {
//                     reject(new Error(`Process exited with code ${code}`));
//                 }
//             });
//         });

//         // Send data to Python process
//         try {
//             const inputData = JSON.stringify({
//                 resume_pdf: pdfBuffer.toString("base64"),
//                 job_desc: jobDesc
//             });
//             pythonProcess.stdin.write(inputData);
//             pythonProcess.stdin.end();
//             console.log("Data sent to Python process");
//         } catch (error) {
//             console.error("Error writing to Python process:", error);
//             return res.status(500).json({ error: "Failed to send data to process" });
//         }

//         // Wait for the Python process to complete
//         try {
//             const result = await processPromise;
//             const parsedResult = JSON.parse(result);
//             return res.json(parsedResult);
//         } catch (error) {
//             console.error("Error processing Python result:", error);
//             return res.status(500).json({ error: "Error processing ATS score" });
//         }

//     } catch (error) {
//         console.error("Service error:", error);
//         return res.status(500).json({ error: "Failed to process request" });
//     }
// };