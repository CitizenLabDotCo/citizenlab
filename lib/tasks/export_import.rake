require 'yaml'


namespace :migrate do
  desc "Creates a YML file for migration of Vancouver."
  task :export, [:host,:file] => [:environment] do |t, args|
    @refs = {}

    host = args[:host] ## 'vancouver_citizenlab_co'
    yml_models = args[:as_tenant_template] ? YAML.load_file('config/tenant_templates/base.yml') : { 'models' => {} }
    areas_hash = {}
    idea_statuses_hash = {}
    topics_hash = {}
    users_hash = {}
    projects_hash = {}
    ideas_hash = {}
    comments_hash = {}
    phases_hash = {}
    events_hash = {}
    groups_hash = {}
    permissions_hash = {}
    init_base_hashes yml_models, idea_statuses_hash, topics_hash if args[:as_tenant_template]
    Apartment::Tenant.switch(host.gsub('.', '_')) do 
      yml_models['models']['user'] = encode_users_ei users_hash
      yml_models['models']['project'] ||= []
      yml_models['models']['project'] += encode_projects_ei projects_hash
      yml_models['models']['project_image'] = encode_project_images_ei projects_hash
      yml_models['models']['project_file'] = encode_project_files_ei projects_hash
      yml_models['models']['idea'] = encode_ideas_ei ideas_hash, users_hash, projects_hash, idea_statuses_hash, args
      yml_models['models']['idea_image'] = encode_idea_images_ei ideas_hash
      yml_models['models']['idea_file'] = encode_idea_files_ei ideas_hash
      yml_models['models']['comment'] = encode_comments_ei comments_hash, users_hash, ideas_hash
      yml_models['models']['vote'] = encode_votes_ei users_hash, ideas_hash, comments_hash
      yml_models['models']['phase'] = encode_phases_ei phases_hash, projects_hash
      yml_models['models']['phase_file'] = encode_phase_files_ei phases_hash
      yml_models['models']['ideas_phase'] = encode_ideas_phase_ei ideas_hash, phases_hash
      yml_models['models']['event'] = encode_events_ei events_hash, projects_hash
      yml_models['models']['event_file'] = encode_event_files_ei events_hash
      yml_models['models']['projects_topic'] = encode_projects_topics_ei topics_hash, projects_hash if args[:as_tenant_template]
      yml_models['models']['ideas_topic'] = encode_ideas_topics_ei topics_hash, ideas_hash if args[:as_tenant_template]
      yml_models['models']['area'] = encode_areas_ei areas_hash
      yml_models['models']['areas_idea'] = encode_areas_ideas_ei areas_hash, ideas_hash
      yml_models['models']['areas_project'] = encode_areas_projects_ei areas_hash, projects_hash
      yml_models['models']['group'] = encode_groups_ei groups_hash
      yml_models['models']['groups_project'] = encode_groups_projects_ei groups_hash, projects_hash
      yml_models['models']['membership'] = encode_memberships_ei users_hash, groups_hash
      yml_models['models']['permission'] = encode_permissions_ei permissions_hash, projects_hash, phases_hash
      yml_models['models']['groups_permission'] = encode_groups_permissions_ei groups_hash, permissions_hash
    end
    File.open(args[:file], 'w') { |f| f.write yml_models.to_yaml }
  end

  def lookup_ref id, model_name
    @refs[model_name][id]
  end

  def store_ref yml_obj, id, model_name
    @refs[model_name] ||= {}
    @refs[model_name][id] = yml_obj
  end

  def init_base_hashes yml_models, idea_statuses_hash, topics_hash
    yml_models['models']['idea_status'].each do |yml_is|
      is = IdeaStatus.find_by code: yml_is['code']
      idea_statuses_hash[is.id] = yml_is if is
    end
    yml_models['models']['topic'].each do |yml_topic|
      Topic.all.each do |topic|
        title_hash = CL2_SUPPORTED_LOCALES.map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!(yml_topic['title_multiloc']) }
              [locale, translation]
            end.to_h
        title_hash.each do |key, value|
          if topic.title_multiloc[key] == value
            topics_hash[topic.id] = yml_topic
          end
        end
      end
    end
  end

  def encode_areas_ei areas_hash
    Area.all.map do |a|
      yml_area = {
        'title_multiloc'       => a.title_multiloc,
        'description_multiloc' => a.description_multiloc,
        'created_at'           => a.created_at.to_s,
        'updated_at'           => a.updated_at.to_s
      }
      areas_hash[a.id] = yml_area
      yml_area
    end
  end

  def encode_areas_ideas_ei areas_hash, ideas_hash
    AreasIdea.all.map do |ai|
      {
        'area_ref' => areas_hash[ai.area_id],
        'idea_ref' => ideas_hash[ai.idea_id]
      }
    end
  end

  def encode_areas_projects_ei areas_hash, projects_hash
    AreasProject.all.map do |ap|
      {
        'area_ref' => areas_hash[ap.area_id],
        'project_ref' => ideas_hash[ap.project_id]
      }
    end
  end

  def encode_comments_ei comments_hash, users_hash, ideas_hash
    Comment.all.map do |c|
      yml_comment = { 'body_multiloc'      => c.body_multiloc,
                      'author_ref'         => users_hash[c.author.id],
                      'idea_ref'           => ideas_hash[c.idea.id],
                      'publication_status' => c.publication_status,
                      'created_at'         => c.created_at.to_s,
                      'updated_at'         => c.updated_at.to_s
                   }
      if c.parent
        yml_comment['parent_ref'] = comments_hash[c.parent.id]
      end
      comments_hash[c.id] = yml_comment
      yml_comment
    end
  end

  def encode_events_ei events_hash, projects_hash
    Event.all.map do |e|
      yml_event = { 'title_multiloc'       => e.title_multiloc,
                    'description_multiloc' => e.description_multiloc,
                    'project_ref'          => projects_hash[e.project&.id],
                    'start_at'             => e.start_at.to_s,
                    'end_at'               => e.end_at.to_s,
                    'location_multiloc'    => e.location_multiloc,
                    'created_at'           => e.created_at.to_s,
                    'updated_at'           => e.updated_at.to_s
                   }
      events_hash[e.id] = yml_event
      yml_event
    end
  end

  def encode_event_files_ei events_hash
    EventFile.all.map do |ef|
      {
        'remote_file_url' => ef.file_url,
        'event_ref'       => events_hash[ef.event_id],
        'ordering'        => ef.ordering
      }
    end
  end

  def encode_groups_ei groups_hash
    Group.all.map do |g|
      yml_group = { 'title_multiloc'  => g.title_multiloc,
                    'membership_type' => g.membership_type,
                    'rules'           => g.rules,
                    'created_at'      => g.created_at.to_s,
                    'updated_at'      => g.updated_at.to_s
                   }
      groups_hash[g.id] = yml_group
      yml_group
    end
  end

  def encode_groups_permissions_ei groups_hash, permissions_hash
    GroupsPermission.all.map do |gp|
      {
        'group_ref'   => groups_hash[gp.group_id],
        'permission_ref' => permissions_hash[gp.permission_id]
      }
    end 
  end

  def encode_memberships_ei users_hash, groups_hash
    Membership.all.map do |m|
      {
        'group_ref'  => groups_hash[m.group_id],
        'user_ref'   => users_hash[m.user_id],
        'created_at' => m.created_at.to_s,
        'updated_at' => m.updated_at.to_s
      }
    end
  end

  def encode_groups_projects_ei groups_hash, projects_hash
    GroupsProject.all.map do |gp|
      {
        'group_ref'   => groups_hash[gp.group_id],
        'project_ref' => projects_hash[gp.project_id]
      }
    end 
  end

  def encode_ideas_ei ideas_hash, users_hash, projects_hash, idea_statuses_hash, options={}
    Idea.all.map do |i|
      yml_idea = { 'title_multiloc'       => i.title_multiloc,
                   'body_multiloc'        => i.body_multiloc,
                   'publication_status'   => i.publication_status,
                   'project_ref'          => projects_hash[i.project&.id],
                   'author_ref'           => users_hash[i.author&.id],
                   'location_description' => i.location_description,
                   'published_at'         => i.published_at.to_s,
                   'created_at'           => i.created_at.to_s,
                   'updated_at'           => i.updated_at.to_s
                   }
      yml_idea['idea_status_ref'] = idea_statuses_hash[i.idea_status_id] if options[:as_tenant_template]
      ideas_hash[i.id] = yml_idea
      yml_idea
    end
  end

  def encode_idea_images_ei ideas_hash
    Idea.all.select{ |i| i.idea_images.present? }.map do |i|
      i.idea_images.map do |ii|
        { 'idea_ref'         => ideas_hash[i.id],
          'remote_image_url' => ii.image_url,
          'ordering'         => ii.ordering
        }
      end
    end.flatten
  end

  def encode_idea_files_ei ideas_hash
    IdeaFile.all.map do |idf|
      {
        'remote_file_url' => idf.file_url,
        'idea_ref'        => ideas_hash[idf.idea_id],
        'ordering'        => idf.ordering
      }
    end
  end

  def encode_permissions_ei permissions_hash, projects_hash, phases_hash
    Permission.all.map do |p|
      yml_permission = { 
        'action'          => p.action,
        'permitted_by'    => p.permitted_by,
        'created_at'      => p.created_at.to_s,
        'updated_at'      => p.updated_at.to_s
                   }
      yml_permission['permittable_ref'] = case p.permittable_type 
      when 'Project'
        projects_hash[p.permittable_id]
      when 'Phase'
        phases_hash[p.permittable_id]
      else
        nil
      end
      if yml_permission['permittable_ref']
        yml_permission
      else
        nil
      end
      yml_permission
    end
  end

  def encode_phases_ei phases_hash, projects_hash
    Phase.all.map do |p|
      yml_phase = { 'title_multiloc'       => p.title_multiloc,
                    'description_multiloc' => p.description_multiloc,
                    'project_ref'          => projects_hash[p.project&.id],
                    'start_at'             => p.start_at.to_s,
                    'end_at'               => p.end_at.to_s,
                    'participation_method' => p.participation_method,
                    'created_at'           => p.created_at.to_s,
                    'updated_at'           => p.updated_at.to_s,
                    'posting_enabled'      => p.posting_enabled,
                    'commenting_enabled'   => p.commenting_enabled,
                    'voting_enabled'       => p.voting_enabled,
                    'voting_method'        => p.voting_method,
                    'voting_limited_max'   => p.voting_limited_max,
                    'presentation_mode'    => p.presentation_mode
                   }
      if yml_phase['participation_method'] == 'survey'
        yml_phase['survey_embed_url'] = p.survey_embed_url
        yml_phase['survey_service']   = p.survey_service
      end
      phases_hash[p.id] = yml_phase
      yml_phase
    end
  end

  def encode_phase_files_ei phases_hash
    PhaseFile.all.map do |pf|
      {
        'remote_file_url' => pf.file_url,
        'phase_ref'       => phases_hash[pf.phase_id],
        'ordering'        => pf.ordering
      }
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
                      'publication_status'           => p.publication_status,
                      'created_at'                   => p.created_at.to_s,
                      'updated_at'                   => p.updated_at.to_s,
                      'posting_enabled'              => p.posting_enabled,
                      'commenting_enabled'           => p.commenting_enabled,
                      'voting_enabled'               => p.voting_enabled,
                      'voting_method'                => p.voting_method,
                      'voting_limited_max'           => p.voting_limited_max
                   }
      if p.description_preview_multiloc.blank?
      end
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
        { 'project_ref'      => projects_hash[p.id],
          'remote_image_url' => pi.image_url,
          'ordering'         => pi.ordering
        }
      end
    end.flatten
  end

  def encode_project_files_ei projects_hash
    ProjectFile.all.map do |pf|
      {
        'remote_file_url' => pf.file_url,
        'project_ref'     => projects_hash[pf.project_id],
        'ordering'        => pf.ordering
      }
    end
  end

  def encode_ideas_phase_ei ideas_hash, phases_hash
    IdeasPhase.all.map do |ip|
      {
        'idea_ref' => ideas_hash[ip.idea_id],
        'phase_ref' => phases_hash[ip.phase_id]
      }
    end
  end

  def encode_projects_topics_ei topics_hash, projects_hash
    ProjectsTopic.all.map do |pt|
      yml_topic = topics_hash[pt.topic_id]
      if yml_topic 
        {
          'topic_ref'   => yml_topic,
          'project_ref' => projects_hash[pt.project_id]
        }
      else
        nil
      end
    end.compact
  end

  def encode_ideas_topics_ei topics_hash, ideas_hash
    IdeasTopic.all.map do |it|
      yml_topic = topics_hash[it.topic_id]
      if yml_topic 
        {
          'topic_ref'   => yml_topic,
          'idea_ref' => ideas_hash[it.idea_id]
        }
      else
        nil
      end
    end.compact
  end

  def encode_users_ei users_hash
    User.where.not(invite_status: 'pending').map do |u|
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
                   'created_at'        => u.created_at.to_s,
                   'updated_at'        => u.updated_at.to_s
                 }
      if !yml_user['password_digest']
        yml_user['password'] = SecureRandom.urlsafe_base64 32
      end
      users_hash[u.id] = yml_user
      yml_user
    end
  end

  def encode_votes_ei users_hash, ideas_hash, comments_hash
    Vote.all.map do |v|
      yml_vote = { 'mode'         => v.mode,
                   'user_ref'     => users_hash[v.user&.id],
                   'votable_type' => v.votable_type,
                   'created_at'   => v.created_at.to_s,
                   'updated_at'   => v.updated_at.to_s
                   }
      yml_vote['votable_ref'] = case v.votable_type
      when 'Idea'
        ideas_hash[v.votable_id]
      when 'Comment'
        comments_hash[v.votable_id]
      else
        nil
      end
      if yml_vote['votable_ref']
        yml_vote
      else
        nil
      end
    end.compact
  end



  task :import, [:host,:file] => [:environment] do |t, args|
    host = args[:host] ## 'vancouver_citizenlab_co'
    Apartment::Tenant.switch(host.gsub('.', '_')) do
      TenantTemplateService.new.apply_template args[:file], is_path=true ## 'tmp/vancouver.yml'
    end
  end

end