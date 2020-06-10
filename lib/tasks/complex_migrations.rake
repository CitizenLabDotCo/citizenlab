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
    # 'Safety'                  => 'safety',
    'Education and youth'         => 'education',
    'Culture, sports and events'  => 'culture',
    'Health and welfare'          => 'health',
    'Social inclusion'            => 'inclusion',
    'Community development'       => 'community',
    # 'Public services'         => 'services',
    # 'Other'                   => 'other',
  }


  desc "Fix the old timezones values in the tenant settings by mapping them to the new timezone values"
  task :migrate_topic_codes, [:url] => [:environment] do |t, args|
    errors = []
    puts "Processing topic mapping"
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    mapping = {}
    data.each do |d|
      if d['tenant_id'].present? && d['id'].present? && d['Link_to'] == 'is' && d['Current_topic'].present?
        mapping[d['tenant_id']] ||= {}
        code = TOPIC_CODE_MAPPING[d['Current_topic']]
        errors += ["No topic code found for #{d['Current_topic']}"] if !code
        mapping[d['tenant_id']][d['id']] = code
      end
    end
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tenant_mapping = mapping[tenant.id]
      if tenant_mapping
        Apartment::Tenant.switch(tenant.schema_name) do
          Topic.where(id: tenant_mapping.keys).each do |topic|
            code = tenant_mapping[topic.id]
            if topic.update(code: code)
              puts "#{topic.id} (#{topic.title_multiloc.values.first})=> #{code}"
            else
              errors += ["Failed to update topic #{topic.id} in #{tenant.host}"]
            end
          end
        end
      end
      # TODO link existing sports ideas to culture?
      # TODO link other custom subtopics?
      # TODO add new default topics: safety, public services and other if not yet present
      # TODO link existing topics to all existing projects
    end
    if errors.present?
      puts 'Errors occured:'
      errors.each{|err| puts err}
    else
      puts 'Success!'
    end
  end
end