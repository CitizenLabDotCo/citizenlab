require 'mongo'


namespace :migrate do
  desc "Migrating Data from a CL1 Platform to a CL2 Tenant"
  task from_cl1: :environment do
  	## NOTE: it is assumed that the desired tenant is already created and been switched 
  	# uri = Mongo::URI.new("mongodb://citizenlab:jhshEVweHWULVCA9x2nLuWL8@lamppost.15.mongolayer.com:10300,lamppost.14.mongolayer.com:10323/demo?replicaSet=set-56285eff675db1d28f0012d1")
  	# client = Mongo::Client.new(uri.servers, uri.options)
  	# client.login(uri.credentials)

    client = connect # Mongo::Client.new(['127.0.0.1:27017'])
  	client['users'].find.each do |u|
  		migrate_user u
  	end
  end


  def connect address=nil
    if address
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    else
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    end
  end


  def migrate_user u
    puts 'im alive!'
  end

end
