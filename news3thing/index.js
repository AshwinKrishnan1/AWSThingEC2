const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const process = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = process;

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];


exports.handler = async (event) => {
    // Running the executable
    try {
        const child = spawn('./helloWorld');
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    } catch (error) {
        console.log(`Error executing binary: ${error}`);
    }
};
