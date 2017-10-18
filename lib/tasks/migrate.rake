require 'mongo'


namespace :migrate do
  desc "Migrating Data from a CL1 Platform to a CL2 Tenant"
  task from_cl1: :environment do
  	## NOTE: it is assumed that the desired tenant is already created and been switched 
  	uri = Mongo::URI.new("mongodb://citizenlab:jhshEVweHWULVCA9x2nLuWL8@lamppost.15.mongolayer.com:10300,lamppost.14.mongolayer.com:10323/demo?replicaSet=set-56285eff675db1d28f0012d1")
  	client = Mongo::Client.new(uri.servers, uri.options)
  	client.login(uri.credentials)
  	cnt = 0
  	client[uri.database]['users'].find.each do |u|
  		cnt += 1
  	end
  	puts cnt
  end

end
