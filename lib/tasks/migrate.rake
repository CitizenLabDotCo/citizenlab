require 'mongo'

# require "rails"

@log = []

namespace :migrate do
  desc "Migrating Data from a CL1 Platform to a CL2 Tenant"
  task from_cl1: :environment do
  	## NOTE: it is assumed that the desired tenant is already created and been switched 
  	# uri = Mongo::URI.new("mongodb://citizenlab:jhshEVweHWULVCA9x2nLuWL8@lamppost.15.mongolayer.com:10300,lamppost.14.mongolayer.com:10323/demo?replicaSet=set-56285eff675db1d28f0012d1")
  	# client = Mongo::Client.new(uri.servers, uri.options)
  	# client.login(uri.credentials)

    client = connect # Mongo::Client.new(['127.0.0.1:27017'])
    users_hash = {}
  	client['users'].find.each do |u|
  		migrate_user(u, users_hash)
  	end

    if !@log.empty?
      puts 'Migrated with errors!'
      @log.each(&method(:puts))
    end
  end


  def connect address=nil
    if address
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    else
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    end
  end


  def migrate_user u, users_hash
    # one big transaction
    d = {}
    # email
    if u['telescope']['email'] || u['registered_emails'] || u['emails']
      d[:email] = u['telescope']['email'] || (u['registered_emails'] || u['emails']).first['address']
    else
      return
    end
    # first_name and last_name
    if u.dig('profile', 'name') || u['username'] ###
      name_pts = (u.dig('profile', 'name') || u['username']).split
      if name_pts.size < 2
        name_pts = u['username'].split '_'
      end
      if name_pts.size >= 2
        d[:first_name] = name_pts.first
        d[:last_name] = name_pts.drop(1).join ' '
      else
        d[:first_name] = u['username']
        d[:last_name] = 'Unknown' ###
      end
    else
      return
    end
    # password
    d[:password] = 'testtest' ###
    # locale
    d[:locale] = u['telescope']['locale'] || Tenant.current.settings.dig('core', 'locales').first
    # admin
    if u['isAdmin']
      d[:roles] = [{type: 'admin'}]
    end
    # slug
    if u.dig('telescope', 'slug')
      d[:slug] = u.dig('telescope', 'slug')
    end
    # gender
    if u.dig('telescope', 'gender')
      d[:gender] = u.dig('telescope', 'gender')
    end
    # domicile
    if u.dig('telescope', 'domicile')
      d[:domicile] = u.dig('telescope', 'domicile')
    end
    # birthyear
    if u.dig('telescope', 'birthyear')
      d[:birthyear] = u.dig('telescope', 'birthyear')
    end
    # education
    if u.dig('telescope', 'education')
      d[:education] = u.dig('telescope', 'education')
    end
    begin
      users_hash[u['_id']] = User.create!(d).id
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

end
