const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.handler = async (event) => {
    const bucketName = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    // The path where the downloaded file will be stored temporarily
    const tmpFilePath = path.join(os.tmpdir(), path.basename(key));
    const tmpExecutablePath = path.join(os.tmpdir(), 'helloWorld');

    // Download the file from S3
    try {
        const params = {
            Bucket: bucketName,
            Key: key
        };
        const data = await s3.getObject(params).promise();
        fs.writeFileSync(tmpFilePath, data.Body);
        console.log(`File downloaded successfully to ${tmpFilePath}`);
    } catch (error) {
        console.log(`Error downloading from S3: ${error}`);
        return;
    }

    // Copying the executable to the temporary folder
    try {
        fs.copyFileSync(path.join(process.env.LAMBDA_TASK_ROOT, 'helloWorld'), tmpExecutablePath);
        console.log(`Executable copied to ${tmpExecutablePath}`);
    } catch (error) {
        console.log(`Error copying executable: ${error}`);
        return;
    }

    // Setting execute permissions for the executable
    try {
        fs.chmodSync(tmpExecutablePath, '755');
        console.log(`Execute permissions set for ${tmpExecutablePath}`);
    } catch (error) {
        console.log(`Error setting execute permissions: ${error}`);
        return;
    }

    // Running the executable
    try {
        const process = spawn(tmpExecutablePath, [tmpFilePath]);
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
