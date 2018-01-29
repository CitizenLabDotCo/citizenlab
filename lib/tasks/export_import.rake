require 'yaml'


namespace :migrate do
  desc "Creates a YML file for migration of Vancouver."
  task :export, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    yml_models = { 'models' => {} }
    users_hash = {}
    Apartment::Tenant.switch(host.gsub('.', '_')) do
        yml_models['models']['user'] = encode_users users_hash
    end
    File.open(args[:file], 'w') {|f| f.write yml_models.to_yaml }
  end

  def encode_users users_hash
    User.all.map do |u|
      yml_user = { 'email'             => u.email, 
                   'first_name'        => u.first_name,
                   'last_name'         => u.last_name,
                   'locale'            => u.locale,
                   'bio_multiloc'      => u.bio_multiloc,
                   'gender'            => u.gender,
                   'birthyear'         => u.birthyear,
                   'domicile'          => u.domicile,
                   'education'         => u.education,
                   'password_digest'   => u.password_digest,
                   'remote_avatar_url' => u.avatar_url
                 }
      users_hash[u.id] = yml_user
      yml_user
    end
  end


  task :import, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    yml_models = YAML.load_file args[:file] ## 'temp/vancouver.yml'
    Apartment::Tenant.switch(host.gsub('.', '_')) do
        puts "Number of ideas: #{Idea.count}"
    end
  end

end