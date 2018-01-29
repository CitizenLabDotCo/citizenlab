require 'yaml'


namespace :migrate do
  desc "Creates a YML file for migration of Vancouver."
  task :export, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    yml_models = { 'models' => {} }
    users_hash = {}
    projects_hash = {}
    Apartment::Tenant.switch(host.gsub('.', '_')) do
        yml_models['models']['user'] = encode_users_ei users_hash
        yml_models['models']['project'] = encode_projects_ei projects_hash
        yml_models['models']['project_image'] = encode_project_images_ei projects_hash
    end
    File.open(args[:file], 'w') {|f| f.write yml_models.to_yaml }
  end

  def encode_users_ei users_hash
    User.all.map do |u|
      yml_user = { 'email'             => u.email, 
                   'first_name'        => u.first_name,
                   'last_name'         => u.last_name,
                   'cl1_migrated'      => u.cl1_migrated,
                   'locale'            => u.locale,
                   'bio_multiloc'      => u.bio_multiloc,
                   'gender'            => u.gender,
                   'birthyear'         => u.birthyear,
                   'domicile'          => u.domicile,
                   'education'         => u.education,
                   'password_digest'   => u.password_digest,
                   'remote_avatar_url' => u.avatar_url,
                   'roles'             => u.roles
                 }
      users_hash[u.id] = yml_user
      yml_user
    end
  end

  def encode_projects_ei projects_hash
    Project.all.map do |p|
      yml_project = { 'title_multiloc'               => p.title_multiloc,
                      'description_multiloc'         => p.description_multiloc,
                      'remote_header_bg_url'         => p.header_bg_url,
                      'visible_to'                   => p.visible_to,
                      'description_preview_multiloc' => p.description_preview_multiloc,
                      'presentation_mode'            => p.presentation_mode,
                      'participation_method'         => p.participation_method,
                      'process_type'                 => p.process_type,
                      'internal_role'                => p.internal_role,
                      'publication_status'           => p.publication_status
                   }
      projects_hash[p.id] = yml_project
      yml_project
    end
  end

  def encode_project_images_ei projects_hash
    Project.all.select{ |p| p.project_images.present? }.map do |p|
      p.project_images.map do |pi|
        { 'project_ref' => projects_hash[p.id],
          'remote_image_url' => pi.image_url,
          'ordering' => pi.ordering
        }
      end
    end.flatten
  end


  task :import, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    Apartment::Tenant.switch(host.gsub('.', '_')) do
      TenantTemplateService.new.apply_template args[:file], is_path=true ## 'tmp/vancouver.yml'
    end
  end

end