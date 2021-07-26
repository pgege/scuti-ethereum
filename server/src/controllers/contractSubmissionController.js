const path = require('path');
const { extractCompressedFile, downloadRepo } = require("../../utils/fileUtils");
const {testContract} = require("../utils/testHarness");
const {
    contestConstructorDetails,
    contestTestJsonObject
} = require("../constants/jsonTestValues");
const { generateGithubDownloadUrl } = require("../utils/url.js");

async function contractSubmissionController(req, res){

    const { 
        repoName, 
        commitId,
        pathToTestFile
    } = req.body;

    let testResults;
    
    try {
        const url = generateGithubDownloadUrl(repoName, commitId);
    
        const downloadedTarFolderPath = await downloadRepo(url);

        const repoTestingDirectory = path.dirname(downloadedTarFolderPath);

        const testFileLocation = await extractCompressedFile(downloadedTarFolderPath, repoTestingDirectory, pathToTestFile);

        if(testFileLocation){
            /* 
                TODO: contestTestJsonObject - currently is a json object imported from a javascript file, needs to be moved
                to a JSON file. This allows us to retrieve contract owner's test cases
            */
            testResults = await testContract(testFileLocation, contestConstructorDetails, contestTestJsonObject);
        }

        res.status(200).json({
            "results": (testResults)
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }      
}

module.exports = {
    contractSubmissionController
};