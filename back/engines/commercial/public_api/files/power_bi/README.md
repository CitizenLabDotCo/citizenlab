# PowerBI templates

This folder contains PowerBI templates for loading data from our Public API. 
These templates need to be kept in step with the Public API, and there are tests in place 
to ensure nothing is removed or changed in the Public API that would break these templates.

If these templates change, then the string for X-GoVocal-Client within the templates will need to be updated. 
This is used to track usage of a particular version of the template.