# BulkImportIdeas

## Importing from handwritten ideas / surveys using google
To use the Google document AI importer you need to add the following to your back-secret.env file:
```
GOOGLE_APPLICATION_CREDENTIALS=/citizenlab/back/config/google_cloud.json
GOOGLE_DOCUMENT_AI_PROJECT=xxxxxxxxxxxx
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_PROCESSOR=xxxxxxxxxxxxx
```

`google_cloud.json` is the credentials file you create in google cloud.

To create your Form Parser processor go to: https://console.cloud.google.com/ai/document-ai/processors

Seems to be an issue in our code at the moment with 'eu' based processors so just create it in the 'us'.

Comment out `GOOGLE_DOCUMENT_AI_PROJECT` if you are just working on the interface so that it 
imports fake data and does not call the google API and incur cost.