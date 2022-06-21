# Important

Views can't currently be run from the engine folder. 
Run the following command on cl-back-web before migrating:

`cp -r /cl2_back/engines/commercial/analytics/db/views/*.sql /cl2_back/db/views`