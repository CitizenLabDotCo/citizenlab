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


  desc "Migrate the topics of existing tenants, given a CSV file describing a mapping (behaviour for updating translations or the code, or to merge topics together)"
  task :migrate_topic_codes, [:url] => [:environment] do |t, args|
    errors = []
    puts "Processing topic mapping"
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    is_mapping = {}
    data.each do |d|
      if d['tenant_id'].present? && d['id'].present? && ['is', 'synonym of'].include?(d['Link_to']) && d['Current_topic'].present?
        is_mapping[d['tenant_id']] ||= {}
        code = TOPIC_CODE_MAPPING[d['Current_topic']]
        errors += ["No topic code found for #{d['Current_topic']} (tenant #{d['tenant_id']})"] if !code
        is_mapping[d['tenant_id']][d['id']] = code
      end
    end
    sub_mapping = {}
    data.each do |d|
      if d['tenant_id'].present? && d['id'].present? && d['Link_to'] == 'subtopic of' && d['Merge'].present? && d['Current_topic'].present?
        sub_mapping[d['tenant_id']] ||= {}
        code = TOPIC_CODE_MAPPING[d['Current_topic']]
        errors += ["No topic code found for #{d['Current_topic']} (tenant #{d['tenant_id']})"] if !code
        sub_mapping[d['tenant_id']][d['id']] = {'code' => code, 'merge' => (d['Merge'] == 'TRUE')}
      end
    end
    base_topics = YAML.load(open(Rails.root.join('config', 'tenant_templates', 'base.yml')).read).dig('models', 'topic')

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
          # Add all topics to existing projects to keep coming data operations valid
          Project.all.each do |pj|
            pj.topics = Topic.all
            if !pj.save
              errors += ["Failed to add topics to project #{pj.id} in #{tenant.host}: #{pj.errors.details}"]
            end
          end

          # Add code to existing topics and update them to latest titles
          tenant_is_mapping = is_mapping[tenant.id]
          if tenant_is_mapping
            Topic.where(id: tenant_is_mapping.keys).each do |topic|
              code = tenant_is_mapping[topic.id]
              title_multiloc = CL2_SUPPORTED_LOCALES.map do |locale|
                translation = I18n.with_locale(locale) { I18n.t!("topics.#{code}") }
                [locale, translation]
              end.to_h
              if topic.update(code: code, title_multiloc: title_multiloc)
                puts "#{topic.id} (#{topic.title_multiloc.values.first})=> #{code}"
              else
                errors += ["Failed to update topic #{topic.id} in #{tenant.host}: #{topic.errors.details}"]
              end
            end
          end

          # Add new topics
          base_topics.select do |tp| 
            %w(safety services other).include?(tp['code']) && !Topic.find_by(code: tp['code']).present?
          end.sort_by do |tp|
            tp['ordering']
          end.each do |tp|
            title_multiloc = CL2_SUPPORTED_LOCALES.map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!("topics.#{tp['code']}") }
              [locale, translation]
            end.to_h
            description_multiloc = CL2_SUPPORTED_LOCALES.map do |locale|
              translation = I18n.with_locale(locale) { I18n.t!("topics.#{tp['code']}_description") }
              [locale, translation]
            end.to_h
            tp = Topic.create!(
              title_multiloc: title_multiloc,
              description_multiloc: description_multiloc,
              code: tp['code']
            )
            tp.move_to_bottom
          end

          # Merge subtopics (e.g. Sports -> Culture)
          tenant_sub_mapping = sub_mapping[tenant.id]
          if tenant_sub_mapping
            tenant_sub_mapping&.each do |topic_id, value|
              code = value['code']
              if value['merge']
                parent_topic = Topic.find_by code: code
                topic = Topic.find topic_id
                if parent_topic && topic
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

          # Reorder default topics
          code_seq = Topic.order('ordering').pluck :code
          custom_min = code_seq.each_index.select{|i| code_seq[i] == 'custom'}.first
          custom_max = code_seq.each_index.select{|i| code_seq[i] == 'custom'}.last
          # Preserve order when there's custom topics in between default topics
          preserve_order = custom_min.present? && custom_max.present? && code_seq.each_index.select{|i| code_seq[i] != 'custom'}.select{|i| custom_min < i && i < custom_max }.present?

          if !preserve_order
            Topic.defaults.sort_by do |topic|
              base_topics.select{|tp| tp['code'] == topic.code}.first['ordering']
            end.reverse.each do |topic|
              topic.move_to_top
            end
          end
          Topic.find_by(code: 'other')&.move_to_bottom
          

          # Add topics to existing projects
          Project.all.each do |pj|
            pj.topics = Topic.order(:ordering).reverse
            if !pj.save
              errors += ["Failed to add topics to project #{pj.id} in #{tenant.host}: #{pj.errors.details}"]
            end
          end

          # Write backup file
          if changed_associations.present?
            CSV.open('changed_associations.csv', "wb") do |csv|
              csv << changed_associations.first.keys
              changed_associations.each do |d|
                csv << d.values
              end
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

  desc "Display the topics of all tenants"
  task :display_topics, [] => [:environment] do |t, args|
    logs = []
    Tenant.all.each do |tenant|
      logs += ['------------']
      logs += [tenant.host]
      Apartment::Tenant.switch(tenant.schema_name) do
        locale = tenant.settings.dig('core', 'locales').first
        Topic.order(:ordering).each do |tp|
          logs += ["#{tp.ordering}. #{tp.title_multiloc[locale]} (#{tp.code})"]
        end
      end
      logs += ['------------']
      logs += ['']
    end
    logs.each{|l| puts l}
  end
end