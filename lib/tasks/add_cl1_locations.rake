require 'mongo'


namespace :migrate do
  desc "Add the locations to tenants which have already been migrated"
  task :add_cl1_locations, [:json_url] => [:environment] do |t, args|
    url = args[:json_url]
    migration_settings = JSON.load(open(url))
    platform = migration_settings['platform']
    password = migration_settings['password']
    db_user = migration_settings['db_user'] || 'citizenlab'
    host = migration_settings['host']
    client = connect(platform: platform, db_user: db_user, password: password)
    Apartment::Tenant.switch(host.gsub '.', '_') do
      client['posts'].find.no_cursor_timeout.each do |p|
        add_locations p
      end
    end
  end

  def connect(platform: nil, db_user: nil, password: nil)
    Mongo::Client.new("mongodb://lamppost.14.mongolayer.com:10323/#{platform}", auth_mech: :mongodb_cr, user: db_user, password: password)
  end

  def add_locations p 
    if !(p['slug'] && p['location'])
      return
    end
    idea = Idea.find_by(slug: p['slug'])
    if !idea 
      return
    end
    latitude, longitude = p['location'].split(',')
    idea.location_point = "Point(#{latitude} #{longitude})"
    idea.save!
  end

end
