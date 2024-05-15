process.env[‘PATH’] = process.env[‘PATH’] + ‘:’ + process.env[‘LAMBDA_TASK_ROOT’];

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');



exports.handler = async (event) => {
    // Running the executable
    try {
        const process = spawn(helloWorld, []);
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    } catch (error) {
        console.log(`Error executing binary: ${error}`);
    }
};
