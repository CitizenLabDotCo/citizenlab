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
    client['neighbourhoods'].find.each do |n|
      migrate_area n
    end
    users_hash = {}
  	client['users'].find.each do |u|
  		migrate_user(u, users_hash)
  	end

    if !@log.empty?
      puts 'Migrated with errors!'
      @log.each(&method(:puts))
      puts "There were #{@log.size} migration errors."
    else
      puts 'Migration succeeded!'
    end
  end


  def connect address=nil
    if address
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    else
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    end
  end


  def migrate_area n
    begin
      Area.create!(title_multiloc: n['name_i18n'], description_multiloc: n['description_i18n'])
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def migrate_user u, users_hash
    # one big transaction
    d = {}
    # email
    if u['telescope']['email'] || u['registered_emails'] || u['emails']
      d[:email] = u['telescope']['email'] || (u['registered_emails'] || u['emails']).first['address']
    else
      @log.concat ["Couldn't find an email for user #{u.to_s}"]
      return
    end
    # first_name and last_name
    if u.dig('services', 'facebook', 'first_name') && u.dig('services', 'facebook', 'last_name')
      d[:first_name] = u.dig('services', 'facebook', 'first_name')
      d[:last_name] = u.dig('services', 'facebook', 'last_name')
    elsif u.dig('profile', 'name') || u['username'] ###
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
      @log.concat ["Couldn't find a name for user #{u.to_s}"]
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
    # gender
    if u.dig('telescope', 'gender')
      d[:gender] = u.dig('telescope', 'gender')
    end
    # domicile
    if u.dig('telescope', 'domicile')
      if u.dig('telescope', 'domicile') == 'extern'
        d[:domicile] = 'outside'
      else
        area = Area.all.select { |a| a.title_multiloc.values.include? u.dig('telescope', 'domicile') }.first
        if area
          d[:domicile] = area.id
        else
          @log.concat ["Couldn't find the area #{u.dig('telescope', 'domicile')}"]
        end
      end
    end
    # birthyear
    if u.dig('telescope', 'birthyear')
      d[:birthyear] = u.dig('telescope', 'birthyear')
    end
    # education
    if u.dig('telescope', 'education')
      d[:education] = u.dig('telescope', 'education')
    end
    # image
    if u.dig('profile', 'image')
      d[:avatar] = u.dig('profile', 'image')
    end
    begin
      record = User.new d
      # slug
      if u.dig('telescope', 'slug')
        record.slug = SlugService.new.generate_slug(record,u.dig('telescope', 'slug'))
        d[:slug] = record.slug # for inclusion in logging
      end
      record.save!
      users_hash[u['_id']] = record.id
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

end
