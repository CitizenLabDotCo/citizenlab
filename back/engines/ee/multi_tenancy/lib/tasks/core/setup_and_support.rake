namespace :setup_and_support do

  desc "Mass official feedback"
  task :mass_official_feedback, [:url,:host,:locale] => [:environment] do |t, args|
    # ID, Feedback, Feedback Author Name, Feedback Email, New Status
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      data.each do |d|
        idea = Idea.find d['ID']
        first_name = idea.author&.first_name || d['First name'] || ''
        d['Feedback'] = d['Feedback'].gsub '{{first_name}}', first_name
      end

      logs = []
      data.each_with_index do |d, i|
        idea = Idea.find d['ID']
        status = if d['New Status'].present?
          IdeaStatus.all.select{|i| i.title_multiloc[args[:locale]].downcase.strip == d['New Status'].downcase.strip}.first
        end
        name = d['Feedback Author Name']
        text = d['Feedback']
        user = User.find_by email: d['Feedback Email']
        if idea && status
          idea.idea_status = status
          idea.save!
          LogActivityJob.perform_later(idea, 'changed_status', user, idea.updated_at.to_i, payload: {change: idea.idea_status_id_previous_change})
          feedback = OfficialFeedback.create!(post: idea, body_multiloc: {args[:locale] => text}, author_multiloc: {args[:locale] => name}, user: user)
          LogActivityJob.perform_later(feedback, 'created', user, feedback.created_at.to_i)
        end
        logs += ["#{i}) Couldn't find idea #{d['ID']}"] if !idea
        logs += ["#{i}) Couldn't find idea author #{d['ID']}"] if idea && !idea.author_id
      end
      logs.each{|l| puts l} && true

    end
  end

  desc "Delete tenants through list of hostnames"
  task :delete_tenants_sidefx, [:url] => [:environment] do |t, args|
    logs = []
    tenant_side_fx = MultiTenancy::SideFxTenantService.new
    data = open(args[:url]).readlines.map(&:strip)
    data.each do |host|
      tn = Tenant.find_by host: host
      if tn.present?
        tenant_side_fx.before_destroy(tn, nil)
        tn = tn.destroy
        if tn.destroyed?
          tenant_side_fx.after_destroy(tn, nil)
        else
          logs += ["Tenant #{host} could not be deleted"]
        end
      else
        logs += ["Tenant #{host} not found"]
      end
    end
    logs.each{|l| puts l} && true
  end

  desc "Delete inactive non-participating users"
  task :delete_inactive_nonparticipating_users, [:host] => [:environment] do |t, args|
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      participant_ids = Activity.pluck(:user_id) + Idea.pluck(:author_id) + Initiative.pluck(:author_id) + Comment.pluck(:author_id) + Vote.pluck(:user_id) + SpamReport.pluck(:user_id) + Basket.pluck(:user_id)
      participant_ids.uniq!
      users = User.normal_user.where.not(id: participant_ids)
      count = users.size
      users.each(&:destroy!)
      puts "Deleted #{count} users."
    end
  end

  desc "Copy manual email campaigns from one platform to another"
  task :copy_manual_campaigns, [:from_host, :to_host] => [:environment] do |t, args|
    campaigns = Apartment::Tenant.switch(args[:from_host].gsub '.', '_') do
      EmailCampaigns::Campaign.where(type: "EmailCampaigns::Campaigns::Manual").map do |c|
        { 'type' => c.type, 'author_ref' => nil, 'enabled' => c.enabled, 'sender' => 'organization', 'subject_multiloc' => c.subject_multiloc, 'body_multiloc' => c.body_multiloc, 'created_at' => c.created_at.to_s, 'updated_at' => c.updated_at.to_s, }
      end
    end
    template = {'models' => {
    'email_campaigns/campaigns' => campaigns
    }}
    Apartment::Tenant.switch(args[:to_host].gsub '.', '_') do
      ::MultiTenancy::TenantTemplateService.new.apply_template template
    end
  end

  desc "Change the slugs of the project through a provided mapping"
  task :map_project_slugs, [:url, :host] => [:environment] do |t, args|
    issues = []
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      data.each do |d|
        pj = Project.find_by slug: d['old_slug'].strip
        if pj
          pj.slug = d['new_slug'].strip
          if !pj.save
            issues += [pj.errors.details]
          end
        else
          issues += ["No project found for slug #{d['old_slug']}"]
        end
      end
      if issues.present?
        puts 'Some mappings failed.'
        issues.each{|issue| puts issue}
      else
        puts 'Success!'
      end
    end
  end

  desc "Adds an ordered list of custom field options to the specified custom field"
  task :add_custom_field_options, [:host,:url,:id,:locale] => [:environment] do |t, args|
    locale = args[:locale] || Tenant.find_by(host: args[:host]).settings.dig('core', 'locales').first
    options = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      cf = CustomField.find args[:id]
      options.each do |option|
        cfo = cf.custom_field_options.create!(title_multiloc: {locale => option})
        cfo.move_to_bottom
      end
    end
  end

  desc "Translate all content of a platform from one locale to another"
  task :translate_tenant, [:host,:locale_from,:locale_to] => [:environment] do |t, args|
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      translator = MachineTranslations::MachineTranslationService.new
      data_listing = Cl2DataListingService.new
      data_listing.cl2_schema_leaf_models.each do |claz|
        claz.find_each do |object|
          changes = {}
          data_listing.multiloc_attributes(claz).each do |ml|
            value = object.send ml
            if value.present? && value[args[:locale_from]].present? && !value[args[:locale_to]].present?
              changes[ml] = value.clone
              changes[ml][args[:locale_to]] = translator.translate value[args[:locale_from]], args[:locale_from], args[:locale_to]
            end
          end
          object.update_columns changes if changes.present?
        end
      end
    end
  end

  desc "Birthyear select"
  task :birthyear_select, [:host,:json_url] => [:environment] do |t, args|
    errors = []

    multiloc = JSON.parse(open(args[:json_url]).read)
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      title_multiloc = CL2_SUPPORTED_LOCALES.map do |locale|
        translation = I18n.with_locale(locale) { I18n.t!('custom_fields.users.birthyear.title') }
        [locale, translation]
      end.to_h
      field = CustomField.create!(
        resource_type: User,
        key: 'custom_birthyear',
        title_multiloc: title_multiloc,
        input_type: 'select',
        required: false,
        enabled: true
      )
      CustomFieldOption.create!(
        custom_field: field,
        key: 'other_option',
        title_multiloc: multiloc
      )
      (1900..Time.now.year).reverse_each do |year|
        title_multiloc = CL2_SUPPORTED_LOCALES.map do |locale|
          [locale, year.to_s]
        end.to_h
        CustomFieldOption.create!(
          custom_field: field,
          key: year.to_s,
          title_multiloc: title_multiloc
        )
      end

      User.all.select do |user|
        user.birthyear.present?
      end.each do |user|
        user.custom_field_values[field.key] = user.birthyear.to_s
        if !user.save
          errors += [user.errors.messages]
        end
      end

      CustomField.find_by(code: 'birthyear').update!(enabled: false, required: false)

      if errors.present?
        puts "Some errors occurred!"
        errors.each{|err| puts err}
      else
        puts 'Success!'
      end
    end
  end

  desc "Add one map legend to a project"
  task :add_map_legend, [:host,:project_slug,:legend_title,:color] => [:environment] do |t, args|
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      project = Project.find_by slug: args[:project_slug]
      config = project.map_config || CustomMaps::MapConfig.create!(project: project)
      config.legend_items.create!(
        title_multiloc: {Tenant.current.settings.dig('core','locales').first => args[:legend_title]},
        color: args[:color]
        )
    end
  end

  desc "Delete map legends of a project"
  task :delete_map_legends, [:host,:project_slug] => [:environment] do |t, args|
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      project = Project.find_by slug: args[:project_slug]
      config = project.map_config || CustomMaps::MapConfig.create!(project: project)
      config.legend_items.each(&:destroy!)
    end
  end

  desc "Create a new manual group, given a list of user emails"
  task :create_group_from_email_list, [:host,:url,:title] => [:environment] do |t, args|
    locale = Tenant.find_by(host: args[:host]).settings.dig('core', 'locales').first
    emails = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      users = User.where(email: emails)
      group = Group.create!(title_multiloc: {locale => args[:title]}, membership_type: 'manual', members: users)
      users.each do |u|
        group.add_member u
      end
      group.save!
    end
  end

  desc "Create a new manual group, given a list of user IDs"
  task :create_group_from_user_id_list, [:host,:url,:title] => [:environment] do |t, args|
    locale = Tenant.find_by(host: args[:host]).settings.dig('core', 'locales').first
    ids = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      users = User.where(id: ids)
      group = Group.create!(title_multiloc: {locale => args[:title]}, membership_type: 'manual', members: users)
      group.save!
    end
  end

  desc "Add areas"
  task :add_areas, [:host,:url] => [:environment] do |t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      data.each do |d|
        Area.create!(title_multiloc: d.to_h)
      end
    end
  end

  desc "Delete users and votes"
  task :delete_users_votes, [:host,:url] => [:environment] do |t, args|
    emails = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      users = User.where email: emails
      votes = Vote.where(user: users).destroy_all
      users.destroy_all
    end
  end

  desc "Add anonymous up/downvotes to ideas"
  task :add_idea_votes, [:host,:url] => [:environment] do |t, args|
    data = CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
    Apartment::Tenant.switch(args[:host].gsub '.', '_') do
      errors = []
      data.each do |d|
        idea = Idea.find_by slug: d['slug'].strip
        if idea
          d['add_upvotes'].to_i.times do
            add_anonymous_vote idea, 'up'
          end
          d['add_downvotes'].to_i.times do
            add_anonymous_vote idea, 'down'
          end
        else
          errors += ["Couldn't find idea #{d['slug']}"]
        end
      end
      if errors.present?
        puts "Some errors occured!"
        errors.each{|l| puts l}
      else
        puts "Success!"
      end
    end
  end

  desc 'Replace the secret used in the URL of the tile_provider with another secret'
  task :rotate_tile_provider_secret, [:old_secret, :new_ret] => [:environment] do |t, args|
    Rails.logger.warning('Missing old_secret') unless args[:old_secret].present?
    Rails.logger.warning('Missing new_secret') unless args[:new_secret].present?

    old_secret = args[:old_secret]
    new_secret = args[:new_secret]

    Tenant.switch_each do
      puts "Updating tenant #{Tenant.current.host}"
      settings = AppConfiguration.instance.settings

      tile_provider = settings.dig('maps', 'tile_provider')
      if tile_provider&.include? old_secret
        settings['maps']['tile_provider'] = tile_provider.gsub(old_secret, new_secret)
        AppConfiguration.instance.update!(settings: settings)
      end

      CustomMaps::MapConfig.all.each do |mc|
        tile_provider = mc.tile_provider
        if tile_provider&.include? old_secret
          mc.update!(tile_provider: tile_provider.gsub(old_secret, new_secret))
        end
      end
    end
  end

  desc 'Set custom map tile provider to null if it is the default'
  task :remove_vanilla_tile_providers => [:environment] do |t|
    Tenant.switch_each do
      puts "Updating tenant #{Tenant.current.host}"
      settings = AppConfiguration.instance.settings
  
      global_tile_provider = settings.dig('maps', 'tile_provider')
  
      CustomMaps::MapConfig.all.each do |mc|
        local_tile_provider = mc.tile_provider
        if global_tile_provider == local_tile_provider
          mc.update!(tile_provider: nil)
        end
      end
    end
  end

  desc 'Anonymize all users of a platform'
  task :anoymize_users, [:host] => [:environment] do |_, args|
    Apartment::Tenant.switch(args[:host].gsub('.', '_')) do
      service = AnonymizeUserService.new
      User.find_each do |u|
        start_at = Tenant.current.created_at
        start_at = Time.now - 1.month if start_at > Time.now.to_i
        attrs = service.anonymized_attributes [u.locale], start_at: start_at
        attrs.delete 'email' if u.email == 'moderator@citizenlab.co'
        u.update! attrs

        u.remove_avatar! if !attrs['remote_avatar_url'] && !attrs['avatar']
        u.send :generate_slug
        u.save!
      end
    end
  end

  def add_anonymous_vote votable, mode
    attrs = AnonymizeUserService.new.anonymized_attributes Tenant.current.settings.dig('core','locales')
    attrs.delete 'custom_field_values'
    user = User.create! attrs
    Vote.create!(votable: votable, mode: mode, user: user)
    user.destroy!
  end
end
