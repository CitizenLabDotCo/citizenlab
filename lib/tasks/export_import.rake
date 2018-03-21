require 'yaml'


namespace :migrate do
  desc "Creates a YML file for migration of Vancouver."
  task :export, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    yml_models = { 'models' => {} }
    users_hash = {}
    projects_hash = {}
    ideas_hash = {}
    comments_hash = {}
    Apartment::Tenant.switch(host.gsub('.', '_')) do
        yml_models['models']['user'] = encode_users_ei users_hash
        yml_models['models']['project'] = encode_projects_ei projects_hash
        yml_models['models']['project_image'] = encode_project_images_ei projects_hash
        yml_models['models']['idea'] = encode_ideas_ei ideas_hash, users_hash, projects_hash
        yml_models['models']['idea_image'] = encode_idea_images_ei ideas_hash
        yml_models['models']['comment'] = encode_comments_ei comments_hash, users_hash, ideas_hash
        yml_models['models']['votes'] = encode_votes_ei users_hash, ideas_hash, comments_hash
        yml_models['models']['phase'] = encode_phases_ei projects_hash
        yml_models['models']['event'] = encode_events_ei projects_hash
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
                   'roles'             => u.roles,
                   'created_at'        => u.created_at,
                   'updated_at'        => u.updated_at
                 }
      if !yml_user['password_digest']
        yml_user['password'] = SecureRandom.urlsafe_base64 32
      end
      users_hash[u.id] = yml_user
      yml_user
    end
  end

  def encode_projects_ei projects_hash
    Project.all.map do |p|
      yml_project = { 'title_multiloc'               => p.title_multiloc,
                      'description_multiloc'         => p.description_multiloc,
                      'remote_header_bg_url'         => p.header_bg_url,
                      'description_preview_multiloc' => p.description_preview_multiloc,
                      'presentation_mode'            => p.presentation_mode,
                      'participation_method'         => p.participation_method,
                      'process_type'                 => p.process_type,
                      'internal_role'                => p.internal_role,
                      'publication_status'           => p.publication_status,
                      'created_at'                   => p.created_at,
                      'updated_at'                   => p.updated_at,
                      'posting_enabled'              => p.posting_enabled,
                      'commenting_enabled'           => p.commenting_enabled,
                      'voting_enabled'               => p.voting_enabled,
                      'voting_method'                => p.voting_method,
                      'voting_limited_max'           => p.voting_limited_max
                   }
      if yml_project['participation_method'] == 'survey'
        yml_project['survey_embed_url'] = p.survey_embed_url
        yml_project['survey_service']   = p.survey_service
      end
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

  def encode_ideas_ei ideas_hash, users_hash, projects_hash
    Idea.all.map do |i|
      yml_idea = { 'title_multiloc'       => i.title_multiloc,
                   'body_multiloc'        => i.body_multiloc,
                   'publication_status'   => i.publication_status,
                   'project_ref'          => projects_hash[i.project&.id],
                   'author_ref'           => users_hash[i.author&.id],
                   'location_description' => i.location_description,
                   'published_at'         => i.published_at,
                   'created_at'           => i.created_at,
                   'updated_at'           => i.updated_at
                   }
      ideas_hash[i.id] = yml_idea
      yml_idea
    end
  end

  def encode_idea_images_ei ideas_hash
    Idea.all.select{ |i| i.idea_images.present? }.map do |i|
      i.idea_images.map do |ii|
        { 'idea_ref' => ideas_hash[i.id],
          'remote_image_url' => ii.image_url,
          'ordering' => ii.ordering
        }
      end
    end.flatten
  end

  def encode_comments_ei comments_hash, users_hash, ideas_hash
    Comment.all.map do |c|
      yml_comment = { 'body_multiloc' => c.body_multiloc,
                      'author_ref'    => users_hash[c.author.id],
                      'idea_ref'      => ideas_hash[c.idea.id],
                      'created_at'    => c.created_at,
                      'updated_at'    => c.updated_at
                   }
      if c.parent
        yml_comment['parent_ref'] = comments_hash[c.parent.id]
      end
      comments_hash[c.id] = yml_comment
      yml_comment
    end
  end

  def encode_votes_ei users_hash, ideas_hash, comments_hash
    Vote.all.map do |v|
      yml_vote = { 'mode'         => v.mode,
                   'user_ref'     => users_hash[v.user.id],
                   'votable_type' => v.votable_type,
                   'created_at'   => v.created_at,
                   'updated_at'   => v.updated_at
                   }
      if v.votable_type == 'Idea'
        yml_vote['votable_ref'] = ideas_hash[v.votable_id]
      elsif v.votable_type == 'Comment'
        yml_vote['votable_ref'] = comments_hash[v.votable_id]
      end
      if yml_vote['votable_ref']
        yml_vote
      else
        false
      end
    end.select{ |v| v }
  end

  def encode_phases_ei projects_hash
    Phase.all.map do |p|
      yml_phase = { 'title_multiloc'       => p.title_multiloc,
                    'description_multiloc' => p.description_multiloc,
                    'project_ref'          => projects_hash[p.project.id],
                    'start_at'             => p.start_at,
                    'end_at'               => p.end_at,
                    'participation_method' => p.participation_method,
                    'created_at'           => p.created_at,
                    'updated_at'           => p.updated_at,
                    'posting_enabled'      => p.posting_enabled,
                    'commenting_enabled'   => p.commenting_enabled,
                    'voting_enabled'       => p.voting_enabled,
                    'voting_method'        => p.voting_method,
                    'voting_limited_max'   => p.voting_limited_max
                   }
      if yml_phase['participation_method'] == 'survey'
        yml_phase['survey_embed_url'] = p.survey_embed_url
        yml_phase['survey_service']   = p.survey_service
      end
      yml_phase
    end
  end

  def encode_events_ei projects_hash
    Event.all.map do |e|
      yml_event = { 'title_multiloc'       => e.title_multiloc,
                    'description_multiloc' => e.description_multiloc,
                    'project_ref'          => projects_hash[e.project.id],
                    'start_at'             => e.start_at,
                    'end_at'               => e.end_at,
                    'location_multiloc'    => e.location_multiloc,
                    'created_at'           => e.created_at,
                    'updated_at'           => e.updated_at
                   }
      yml_event
    end
  end



  task :import, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    Apartment::Tenant.switch(host.gsub('.', '_')) do
      TenantTemplateService.new.apply_template args[:file], is_path=true ## 'tmp/vancouver.yml'
    end
  end

end