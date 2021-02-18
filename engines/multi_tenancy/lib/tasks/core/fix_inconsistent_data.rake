
namespace :inconsistent_data do
  desc "Fixes for inconsistent data"
  task :fix_empty_bodies => :environment do
    fixes = {}
    failures = {}
    sanitizer = SanitizationService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        to_fix = Idea.all.select do |i| 
          i.body_multiloc.values.all? do |text_or_html| 
            !sanitizer.html_with_content?(text_or_html)
          end
        end
        to_fix.each do |i| 
          locale, title = i.title_multiloc.first
          i.body_multiloc[locale] = title if !sanitizer.html_with_content?(i.body_multiloc[locale])  # Just making very sure
          log = if i.save
            fixes
          else
            failures
          end
          log[tenant.host] ||= []
          log[tenant.host] += [i.slug]
        end      
      end
    end

    if fixes.present?
      puts "Fixed empty bodies for some tenants:"
      fixes.each do |host, idea_slugs|
        puts "#{host}: #{idea_slugs}"
      end
    end

    if failures.present?
      puts "Failed to fix empty bodies for some tenants:"
      failures.each do |host, idea_slugs|
        puts "#{host}: #{idea_slugs}"
      end
    else
      puts "Success!"
    end
  end
  

  task :fix_users_with_invalid_locales => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        User.where('locale NOT IN (?)', tenant.settings.dig('core', 'locales'))
          .update_all(locale: tenant.settings.dig('core', 'locales').first)
      end
    end
  end

  task :fix_identities_with_blank_users => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Identity.where('user_id IS NULL').destroy_all
      end
    end
  end

  task :fix_pc_that_cannot_contain_ideas => :environment do
    fixes = {}
    failures = {}

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        to_fix = Project.where(process_type: 'continuous').all.select do |project| 
          !project.can_contain_ideas? && project.ideas.present?
        end
        to_fix += Phase.all.select do |phase| 
          !phase.can_contain_ideas? && phase.ideas.present?
        end
        to_fix.each do |p| 
          log = if p.update(ideas: [])
            fixes
          else
            failures
          end
          log[tenant.host] ||= []
          log[tenant.host] += ["#{p.class} #{p.id}"]
        end      
      end
    end

    if fixes.present?
      puts "Fixed for some tenants:"
      fixes.each do |host, classes_and_slugs|
        puts "#{host}: #{classes_and_slugs.join ', '}"
      end
    end

    if failures.present?
      puts "Failed for some tenants:"
      failures.each do |host, classes_and_slugs|
        puts "#{host}: #{classes_and_slugs.join ', '}"
      end
    else
      puts "Success!"
    end
  end

  task :fix_users_with_deleted_custom_field_options => :environment do
    service = UserCustomFieldService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        deleted_keys = {}
        CustomField.with_resource_type('User').where(input_type: 'multiselect').pluck(:key).each do |key|
          used_keys = User.select("custom_field_values->'#{key}' as user_options").map(&:user_options).compact.flatten.uniq
          deleted_keys[key] = used_keys - CustomField.with_resource_type('User').find_by(key: key).custom_field_options.pluck(:key)
        end
        CustomField.with_resource_type('User').where(input_type: 'select').pluck(:key).each do |key|
          used_keys = User.select("custom_field_values->'#{key}' as user_option").map(&:user_option).compact.uniq
          deleted_keys[key] = used_keys - (CustomField.with_resource_type('User').find_by(key: key).custom_field_options.pluck(:key) + ['outside'])
        end
        deleted_keys.each do |field_key, option_keys|
          field = CustomField.with_resource_type('User').find_by key: field_key
          if field.custom_field_options.where(key: option_keys).exists?
            raise 'Trying to delete existing option'
          else
            option_keys.each do |option_key|
              service.delete_custom_field_option_values option_key, field
            end
          end
        end
      end
    end
  end

  task :fix_users_with_deleted_domicile => :environment do
    service = UserCustomFieldService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        deleted_area_ids = User.all.map(&:domicile).compact.uniq - (['outside'] + Area.ids)
        deleted_area_ids.each do |area_id|
          service.delete_custom_field_option_values area_id, CustomField.with_resource_type('User').find_by(key: 'domicile')
        end
      end
    end
  end

  task :fix_null_values_in_custom_field_values => :environment do
    service = CustomFieldService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        affected_users = User.where("custom_field_values::text LIKE '%null%'")
        affected_users.each do |user|
          user.update_columns custom_field_values: service.cleanup_custom_field_values!(user.custom_field_values)
        end
      end
    end
  end

  task :fix_empty_multilocs => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        {
          Area                     => [:title_multiloc, :description_multiloc],
          Clustering               => [:title_multiloc],
          Comment                  => [:body_multiloc],
          CustomFieldOption        => [:title_multiloc],
          CustomField              => [:title_multiloc, :description_multiloc],
          EmailCampaigns::Campaign => [:subject_multiloc, :body_multiloc],
          Event                    => [:title_multiloc, :description_multiloc, :location_multiloc],
          Group                    => [:title_multiloc],
          IdeaStatus               => [:title_multiloc, :description_multiloc],
          Idea                     => [:title_multiloc, :body_multiloc],
          InitiativeStatus         => [:title_multiloc, :description_multiloc],
          Initiative               => [:title_multiloc, :body_multiloc],
          OfficialFeedback         => [:body_multiloc, :author_multiloc],
          Page                     => [:title_multiloc, :body_multiloc],
          Phase                    => [:title_multiloc, :description_multiloc],
          Polls::Option            => [:title_multiloc],
          Polls::Question          => [:title_multiloc],
          Project                  => [:title_multiloc, :description_multiloc, :description_preview_multiloc],
          Topic                    => [:title_multiloc, :description_multiloc],
          User                     => [:bio_multiloc],
        }.each do |claz, attributes|
          attributes.each do |attribute|
            claz.where("#{attribute} IS NULL").update_all(attribute => {})
          end
        end
      end
    end
  end

  task :fix_machine_translations_without_translatables_for_initiatives => :environment do
    # Can be deleted later

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        MachineTranslations::MachineTranslation.where(translatable_type: 'Initiative')
          .where.not(translatable_id: Initiative.ids)
          .each(&:destroy!)
      end
    end
  end

  task :fix_initiatives_with_non_admin_assignees => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Initiative.where.not(assignee: User.admin).update_all(assignee_id: nil)
      end
    end
  end
end
