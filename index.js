const fs = require('fs');
const util = require('util');
const {struct} = require('pb-util');

/**
 * TODO(developer): UPDATE these variables before running the sample.
 */
 const credentials = {
    
  }

// projectId: ID of the GCP project where Dialogflow agent is deployed
 const projectId = credentials.project_id;
// sessionId: String representing a random number or hashed user identifier
 const sessionId = '123456';
// languageCode: Indicates the language Dialogflow agent should use to detect intents
const languageCode = 'en';


// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

const configuration = {
    credentials: {
        private_key: credentials.private_key,
        client_email: credentials.client_email
    }
}
// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient(configuration);

async function detectIntent(
  projectId,
  sessionId,
  languageCode
) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const readFile = util.promisify(fs.readFile);
  const inputAudio = await readFile("scheuleappointment.wav");
  const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: "FLAC",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    },
    inputAudio: inputAudio,
  };
  
  // Recognizes the speech in the audio and detects its intent.
  const [response] = await sessionClient.detectIntent(request);
  
  console.log('Detected intent:');
  const result = response.queryResult;
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();
  
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log('  Output contexts:');
    result.outputContexts.forEach(context => {
      const contextId =
        contextClient.matchContextFromProjectAgentSessionContextName(
          context.name
        );
      const contextParameters = JSON.stringify(
        struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
}
// executeQueries(projectId, sessionId, queries, languageCode);

detectIntent(projectId, sessionId, languageCode)