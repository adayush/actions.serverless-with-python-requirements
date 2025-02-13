//  Packages
var core = require('@actions/core')
var execSync = require('child_process').execSync
code = execSync('npm install exeq --save')
var exeq = require('exeq')

//  Input variables
var CANARY_DEPLOYMENTS = core.getInput('canary-deployments')
var DOMAIN_MANAGER = core.getInput('domain-manager')
var EXTRA_ARGS = core.getInput('ARGS') // New optional args input

//  Installs Serverless and specified plugins
async function installServerlessAndPlugins() {
  await exeq(
    `echo Installing Serverless and plugins...`,
    `npm install -g serverless@3`,
    `npm i serverless-plugin-canary-deployments`,
    `npm i serverless-python-requirements`
  )
}

//  Runs Serverless deploy using AWS Credentials if specified, else SERVERLESS ACCESS KEY
async function runServerlessDeploy() {
  let deployCommand = `sls deploy --verbose`;

  // Append extra arguments if provided
  if (EXTRA_ARGS) {
    deployCommand += ` ${EXTRA_ARGS}`;
  }

  await exeq(
    `echo Running sls deploy...`,
    `if [ ${process.env.AWS_ACCESS_KEY_ID} ] && [ ${process.env.AWS_SECRET_ACCESS_KEY} ]; then
      sls config credentials --provider aws --key ${process.env.AWS_ACCESS_KEY_ID} --secret ${process.env.AWS_SECRET_ACCESS_KEY} --verbose
    fi`,
    deployCommand
  )
}

//  Runs all functions sequentially
async function handler() {
  try {
    await installServerlessAndPlugins()
    await runServerlessDeploy()
  } catch (error) {
    core.setFailed(error.message);
  }
}

//  Main function
if (require.main === module) {
  handler()
}
