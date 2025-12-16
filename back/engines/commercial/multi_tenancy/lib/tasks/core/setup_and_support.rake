# frozen_string_literal: true

namespace :setup_and_support do
  desc 'Mass official feedback'
  task :mass_official_feedback, %i[url host locale] => [:environment] do |_t, args|
    # ID, Feedback, Feedback Author Name, Feedback Email, New Status
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
    reporter = ScriptReporter.new
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      data.each do |row|
        idea = Idea.find_by id: row['ID']
        if !idea
          reporter.add_error(
            "Couldn't find idea",
            context: { idea_id: row['ID'] }
          )
          next
        end

        status = if row['New Status'].present?
          IdeaStatus.all.find do |some_idea|
            some_idea.title_multiloc[args[:locale]].downcase.strip == row['New Status'].downcase.strip
          end
        end
        if !status
          reporter.add_error(
            "Couldn't find status",
            context: { idea_id: idea.id, new_status: row['New Status'] }
          )
        end

        name = row['Feedback Author Name']
        text = row['Feedback']
        first_name = idea.author&.first_name || row['First name'] || ''
        text = text.gsub '{{first_name}}', first_name

        user = User.find_by email: row['Feedback Email']
        if !user
          reporter.add_error(
            "Couldn't find feedback author",
            context: { idea_id: idea.id, email: row['Feedback Email'] }
          )
          next
        end

        if status && idea.idea_status != status
          status_id_was = idea.idea_status_id
          idea.update!(idea_status: status)
          LogActivityJob.perform_later(
            idea,
            'changed_status',
            user,
            idea.updated_at.to_i,
            payload: { change: idea.idea_status_id_previous_change }
          )
          reporter.add_change(
            status_id_was,
            status.id,
            context: { idea_id: idea.id }
          )
        end

        feedback_attributes = {
          idea_id: idea.id,
          body_multiloc: { args[:locale] => text },
          author_multiloc: { args[:locale] => name },
          user_id: user.id
        }
        feedback = OfficialFeedback.create!(feedback_attributes)
        LogActivityJob.perform_later(feedback, 'created', user, feedback.created_at.to_i)
        reporter.add_create(
          'OfficialFeedback',
          feedback_attributes,
          context: { idea_id: idea.id }
        )
      end
    end
    reporter.report!('mass_official_feedback_report.json', verbose: true)
  end

  desc 'Delete tenants through list of hostnames'
  task :delete_tenants_sidefx, [:url] => [:environment] do |_t, args|
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
    logs.each { |l| puts l } && true
  end

  desc 'Delete inactive non-participating users'
  task :delete_inactive_nonparticipating_users, [:host] => [:environment] do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      participant_ids = Activity.pluck(:user_id) + Idea.pluck(:author_id) + Comment.pluck(:author_id) + Reaction.pluck(:user_id) + SpamReport.pluck(:user_id) + Basket.pluck(:user_id)
      participant_ids.uniq!
      users = User.normal_user.where.not(id: participant_ids)
      count = users.size
      users.each(&:destroy!)
      puts "Deleted #{count} users."
    end
  end

  desc 'Copy manual email campaigns from one platform to another'
  task :copy_manual_campaigns, %i[from_host to_host] => [:environment] do |_t, args|
    campaigns = Apartment::Tenant.switch(args[:from_host].tr('.', '_')) do
      EmailCampaigns::Campaign.manual.map do |c|
        { 'type' => c.type, 'author_ref' => nil, 'enabled' => c.enabled, 'sender' => 'organization',
          'subject_multiloc' => c.subject_multiloc, 'body_multiloc' => c.body_multiloc, 'created_at' => c.created_at.to_s, 'updated_at' => c.updated_at.to_s }
      end
    end
    template = { 'models' => {
      'email_campaigns/campaigns' => campaigns
    } }

    Tenant.find_by(host: args[:to_host]).switch do
      MultiTenancy::Templates::TenantDeserializer.new.deserialize template
    end
  end

  desc 'Change the slugs of the project through a provided mapping'
  task :map_project_slugs, %i[url host] => [:environment] do |_t, args|
    issues = []
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      data.each do |d|
        pj = Project.find_by slug: d['old_slug'].strip
        if pj
          pj.slug = d['new_slug'].strip
          unless pj.save
            issues += [pj.errors.details]
          end
        else
          issues += ["No project found for slug #{d['old_slug']}"]
        end
      end
      if issues.present?
        puts 'Some mappings failed.'
        issues.each { |issue| puts issue }
      else
        puts 'Success!'
      end
    end
  end

  desc 'Adds an ordered list of custom field options to the specified custom field'
  task :add_custom_field_options, %i[host url id locale] => [:environment] do |_t, args|
    options = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first
      cf = CustomField.find args[:id]
      options.each do |option|
        cfo = cf.options.find_or_create_by!(title_multiloc: { locale => option })
        cfo.move_to_bottom
      end
    end
  end

  desc 'Translate all content of a platform from one locale to another'
  task :translate_tenant, %i[host locale_from locale_to] => [:environment] do |_t, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      translator = MachineTranslations::MachineTranslationService.new
      data_listing = Cl2DataListingService.new
      data_listing.cl2_schema_models.each do |claz|
        puts "Processing class #{claz.name}"
        claz.all.each do |object|
          changes = {}
          data_listing.multiloc_attributes(claz).each do |ml|
            value = object.send ml
            next unless value.present? && value[args[:locale_from]].present? && value[args[:locale_to]].blank?

            puts "Translating #{object.class.name} #{object.id}"
            changes[ml] = value.clone
            changes[ml][args[:locale_to]] =
              translator.translate value[args[:locale_from]], args[:locale_from], args[:locale_to],
                retries: 10
          end
          object.update_columns changes if changes.present?
        end
      end
      puts 'Successfully processed everything'
    end
  end

  desc 'Birthyear select'
  task :birthyear_select, %i[host json_url] => [:environment] do |_t, args|
    errors = []

    multiloc = JSON.parse(open(args[:json_url]).read)
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      title_multiloc = CL2_SUPPORTED_LOCALES.to_h do |locale|
        translation = I18n.with_locale(locale) { I18n.t!('custom_fields.users.birthyear.title') }
        [locale, translation]
      end
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
      (1900..Time.zone.now.year).reverse_each do |year|
        title_multiloc = CL2_SUPPORTED_LOCALES.index_with do |_locale|
          year.to_s
        end
        CustomFieldOption.create!(
          custom_field: field,
          key: year.to_s,
          title_multiloc: title_multiloc
        )
      end

      users_with_birthyear = User.all.select do |user|
        user.birthyear.present?
      end
      users_with_birthyear.each do |user|
        user.custom_field_values[field.key] = user.birthyear.to_s
        unless user.save
          errors += [user.errors.messages]
        end
      end

      CustomField.find_by(code: 'birthyear').update!(enabled: false, required: false)

      if errors.present?
        puts 'Some errors occurred!'
        errors.each { |err| puts err }
      else
        puts 'Success!'
      end
    end
  end

  desc 'Create a new manual group, given a list of user emails'
  task :create_group_from_email_list, %i[host url title] => [:environment] do |_t, args|
    emails = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first
      users = User.where(email: emails)
      Group.create!(title_multiloc: { locale => args[:title] }, membership_type: 'manual', members: users)
    end
  end

  desc 'Create a new manual group, given a list of user IDs'
  task :create_group_from_user_id_list, %i[host url title] => [:environment] do |_t, args|
    ids = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first
      users = User.where(id: ids)
      Group.create!(title_multiloc: { locale => args[:title] }, membership_type: 'manual', members: users)
    end
  end

  desc 'Add areas'
  task :add_areas, %i[host url] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      data.each do |d|
        Area.create!(title_multiloc: d.to_h)
      end
    end
  end

  desc 'Delete spam users (from email list) and their contributions'
  task :delete_users_participation, %i[host url] => [:environment] do |_t, args|
    emails = open(args[:url]).readlines.map(&:strip)
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      users = User.where email: emails
      Idea.where(author: users).destroy_all
      Reaction.where(user: users).destroy_all
      Comment.where(author: users).destroy_all
      Basket.where(user: users).destroy_all
      service = SideFxUserService.new
      users.each do |user|
        service.before_destroy(user, nil)
        user.destroy!
        service.after_destroy(user, nil)
      end
    end
  end

  desc 'Add anonymous likes/dislikes to ideas'
  task :add_idea_reactions, %i[host url] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      errors = []
      data.each do |d|
        idea = Idea.find_by slug: d['slug'].strip
        if idea
          d['add_likes'].to_i.times do
            add_anonymous_reaction idea, 'up'
          end
          d['add_dislikes'].to_i.times do
            add_anonymous_reaction idea, 'down'
          end
        else
          errors += ["Couldn't find idea #{d['slug']}"]
        end
      end
      if errors.present?
        puts 'Some errors occured!'
        errors.each { |l| puts l }
      else
        puts 'Success!'
      end
    end
  end

  desc 'Replace the secret used in the URL of the tile_provider with another secret'
  task :rotate_tile_provider_secret, %i[old_secret new_ret] => [:environment] do |_t, args|
    Rails.logger.warning('Missing old_secret') if args[:old_secret].blank?
    Rails.logger.warning('Missing new_secret') if args[:new_secret].blank?

    old_secret = args[:old_secret]
    new_secret = args[:new_secret]

    Tenant.safe_switch_each do
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
  task remove_vanilla_tile_providers: [:environment] do |_t|
    Tenant.safe_switch_each do
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
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      service = AnonymizeUserService.new
      User.find_each do |u|
        start_at = Tenant.current.created_at
        start_at = 1.month.ago if start_at > Time.now.to_i
        attrs = service.anonymized_attributes [u.locale], start_at: start_at
        if u.email == 'moderator@citizenlab.co'
          attrs.delete 'email'
          attrs.delete 'password'
        end
        u.update! attrs

        u.remove_avatar! if !attrs['remote_avatar_url'] && !attrs['avatar']
        u.slug = nil
        u.send :generate_slug
        u.save!
      end
    end
  end

  desc 'Reduce the number of users on a given platform'
  task :auto_reduce_users, %i[host skip_user_ids_url] => [:environment] do |_, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      service = UserReduceService.new
      scope = if args[:skip_user_ids_url]
        skip_user_ids = open(args[:skip_user_ids_url]).readlines.map(&:strip)
        User.where(id: skip_user_ids)
      end
      puts "Initial amount of users: #{User.count}"
      service.reduce! skip_users: scope
      puts "Final amount of users: #{User.count}"
    end
  end

  desc 'Change the default assignee for proposals'
  task :proposals_default_assignee, %i[host email] => [:environment] do |_, args|
    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      user = User.find_by email: args[:email]
      raise "No user found for email #{args[:email]}" if !user
      raise "#{user.email} is not an admin" if !user.admin?
      raise "#{user.email} is a super admin" if user.super_admin?

      new_created_at = User.admin.order(:created_at).first.created_at - 1.day
      user.update!(created_at: new_created_at)
    end
  end

  def add_anonymous_reaction(reactable, mode)
    attrs = AnonymizeUserService.new.anonymized_attributes AppConfiguration.instance.settings('core', 'locales')
    attrs.delete 'custom_field_values'
    user = User.create! attrs
    Reaction.create!(reactable: reactable, mode: mode, user: user)
    user.destroy!
  end
end
