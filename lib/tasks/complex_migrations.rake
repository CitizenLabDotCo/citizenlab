namespace :complex_migrations do

  TOPIC_CODE_MAPPING = {
    'Nature and animals'          => 'nature',
    'Cleanliness and waste'       => 'waste',
    'Sustainable development'     => 'sustainability',
    'Mobility'                    => 'mobility',
    'Energy and technology'       => 'technology',
    'Work, economy and tourism'   => 'economy',
    'Housing'                     => 'housing',
    'Public spaces and buildings' => 'public_space',
    'safety'                      => 'safety',
    'Education and youth'         => 'education',
    'Culture, sports and events'  => 'culture',
    'Health and welfare'          => 'health',
    'Social inclusion'            => 'inclusion',
    'Community development'       => 'community',
    'City services'               => 'services',
    'Other'                       => 'other',
  }


  desc "Fix the old timezones values in the tenant settings by mapping them to the new timezone values"
  task :migrate_topic_codes, [:url] => [:environment] do |t, args|
    errors = []
    puts "Processing topic mapping"
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    is_mapping = {}
    data.each do |d|
      if d['tenant_id'].present? && d['id'].present? && d['Link_to'] == 'is' && d['Current_topic'].present?
        is_mapping[d['tenant_id']] ||= {}
        code = TOPIC_CODE_MAPPING[d['Current_topic']]
        errors += ["No topic code found for #{d['Current_topic']} (tenant #{d['tenant_id']})"] if !code
        is_mapping[d['tenant_id']][d['id']] = code
      end
    end
    sub_mapping = {}
    data.each do |d|
      if d['tenant_id'].present? && d['id'].present? && d['Link_to'] == 'subtopic of' && d['Merge'].present?
        sub_mapping[d['tenant_id']] ||= {}
        code = TOPIC_CODE_MAPPING[d['Current_topic']]
        errors += ["No topic code found for #{d['Current_topic']} (tenant #{d['tenant_id']})"] if !code
        sub_mapping[d['tenant_id']][d['id']] = {'code' => code, 'merge' => (d['Merge'] == 'TRUE')}
      end
    end

    if errors.present?
      puts 'Errors occured:'
      errors.each{|err| puts err}
      return
    end

    changed_associations = []

    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        begin
          # Add code to existing topics
          tenant_is_mapping = is_mapping[tenant.id]
          if tenant_is_mapping
            Topic.where(id: tenant_is_mapping.keys).each do |topic|
              code = tenant_is_mapping[topic.id]
              # TODO also overwrite title?
              if topic.update(code: code)
                puts "#{topic.id} (#{topic.title_multiloc.values.first})=> #{code}"
              else
                errors += ["Failed to update topic #{topic.id} in #{tenant.host}: #{topic.errors.details}"]
              end
            end
          end

          # TODO add new if not exist

          # Merge subtopics (e.g. Sports -> Culture)
          tenant_sub_mapping = sub_mapping[tenant.id]
          if tenant_sub_mapping
            tenant_is_mapping.each do |topic_id, value|
              code = value['code']
              if value['merge']
                parent_topic = Topic.find_by code: code
                if parent_topic
                  ideas = Idea.where(id: IdeasTopic.where(topic_id: topic_id).pluck(:idea_id))
                  ideas.each do |idea|
                    already_assigned = false
                    if idea.topic_ids.include? parent_topic.id
                      already_assigned = true
                    else
                      idea.topics << parent_topic
                      idea.save!
                    end
                    changed_associations += [{
                      tenant_host: tenant.host,
                      post_type: 'Idea',
                      post_id: idea.id,
                      merged_topic_id: topic.id,
                      merged_topic_code: topic.code,
                      merged_topic_name: topic.title_multiloc.values.first,
                      parent_topic_id: parent_topic.id,
                      parent_topic_code: parent_topic.code,
                      parent_topic_name: parent_topic.title_multiloc.values.first,
                      already_assigned: already_assigned
                    }]
                  end

                  initiatives = Initiative.where(id: InitiativesTopic.where(topic_id: topic_id).pluck(:initiative_id))
                  initiatives.each do |initiative|
                    already_assigned = false
                    if initiative.topic_ids.include? parent_topic.id
                      already_assigned = true
                    else
                      initiative.topics << parent_topic
                      initiative.save!
                    end
                    changed_associations += [{
                      tenant_host: tenant.host,
                      post_type: 'Initiative',
                      post_id: initiative.id,
                      merged_topic_id: topic.id,
                      merged_topic_code: topic.code,
                      merged_topic_name: topic.title_multiloc.values.first,
                      parent_topic_id: parent_topic.id,
                      parent_topic_code: parent_topic.code,
                      parent_topic_name: parent_topic.title_multiloc.values.first,
                      already_assigned: already_assigned
                    }]
                  end
                  
                  topic.destroy!
                else
                  errors += ["Couldn't find topic #{code} to merge with for #{tenant.host}"]
                end
              end
            end
          end

          # Add topics to existing projects
          Project.all.each do |pj|
            pj.topics = Topic.order(:ordering).reverse
            if !pj.save
              errors += ["Failed to add topics to project #{pj.id} in #{tenant.host}: #{pj.errors.details}"]
            end
          end

          # Write backup file
          CSV.open('changed_associations.csv', "wb") do |csv|
            csv << changed_associations.first.keys
            changed_associations.each do |d|
              csv << d.values
            end
          end
        rescue Exception => e
          errors += ["Failed to migrate topics for tenant #{tenant.host}: #{e.message}"]
        end
      end
    end
    
    if errors.present?
      puts 'Errors occured:'
      errors.each{|err| puts err}
    else
      puts 'Success!'
    end
  end
end