# frozen_string_literal: true

namespace :inconsistent_data do
  desc 'Fixes for inconsistent data'
  task fix_empty_bodies: :environment do
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
          i.body_multiloc[locale] = title unless sanitizer.html_with_content?(i.body_multiloc[locale]) # Just making very sure
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
      puts 'Fixed empty bodies for some tenants:'
      fixes.each do |host, idea_slugs|
        puts "#{host}: #{idea_slugs}"
      end
    end

    if failures.present?
      puts 'Failed to fix empty bodies for some tenants:'
      failures.each do |host, idea_slugs|
        puts "#{host}: #{idea_slugs}"
      end
    else
      puts 'Success!'
    end
  end

  task fix_users_with_invalid_locales: :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        locales = tenant.configuration.settings('core', 'locales')
        User.where.not(locale: locales).update_all(locale: locales.first)
      end
    end
  end

  task fix_identities_with_blank_users: :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Identity.where(user_id: nil).destroy_all
      end
    end
  end

  task fix_users_with_deleted_custom_field_options: :environment do
    service = UserCustomFieldService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        deleted_keys = {}
        CustomField.registration.where(input_type: 'multiselect').pluck(:key).each do |key|
          used_keys = User.select("custom_field_values->'#{key}' as user_options").filter_map(&:user_options).flatten.uniq
          deleted_keys[key] =
            used_keys - CustomField.registration.find_by(key: key).custom_field_options.pluck(:key)
        end
        CustomField.registration.where(input_type: 'select').pluck(:key).each do |key|
          used_keys = User.select("custom_field_values->'#{key}' as user_option").filter_map(&:user_option).uniq
          deleted_keys[key] =
            used_keys - (CustomField.registration.find_by(key: key).custom_field_options.pluck(:key) + ['outside'])
        end
        deleted_keys.each do |field_key, option_keys|
          field = CustomField.registration.find_by key: field_key
          raise 'Trying to delete existing option' if field.custom_field_options.exists?(key: option_keys)

          option_keys.each do |option_key|
            service.delete_custom_field_option_values option_key, field
          end
        end
      end
    end
  end

  task fix_users_with_deleted_domicile: :environment do
    service = UserCustomFieldService.new
    outside = ['outside']

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        deleted_area_ids = User.all.filter_map(&:domicile).uniq - (outside + Area.ids)
        deleted_area_ids.each do |area_id|
          service.delete_custom_field_option_values area_id,
            CustomField.registration.find_by(key: 'domicile')
        end
      end
    end
  end

  task fix_null_values_in_custom_field_values: :environment do
    service = CustomFieldService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        affected_users = User.where("custom_field_values::text LIKE '%null%'")
        affected_users.each do |user|
          user.update_columns custom_field_values: service.compact_custom_field_values!(user.custom_field_values)
        end
      end
    end
  end

  task fix_empty_multilocs: :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        {
          Area => %i[title_multiloc description_multiloc],
          Clustering => [:title_multiloc],
          Comment => [:body_multiloc],
          CustomFieldOption => [:title_multiloc],
          CustomField => %i[title_multiloc description_multiloc],
          EmailCampaigns::Campaign => %i[subject_multiloc body_multiloc],
          Event => %i[title_multiloc description_multiloc location_multiloc],
          Group => [:title_multiloc],
          IdeaStatus => %i[title_multiloc description_multiloc],
          Idea => %i[title_multiloc body_multiloc],
          OfficialFeedback => %i[body_multiloc author_multiloc],
          StaticPage => %i[title_multiloc body_multiloc],
          Phase => %i[title_multiloc description_multiloc],
          Polls::Option => [:title_multiloc],
          Polls::Question => [:title_multiloc],
          Project => %i[title_multiloc description_multiloc description_preview_multiloc],
          Topic => %i[title_multiloc description_multiloc],
          User => [:bio_multiloc]
        }.each do |claz, attributes|
          attributes.each do |attribute|
            claz.where("#{attribute} IS NULL").update_all(attribute => {})
          end
        end
      end
    end
  end

  task fix_null_values_in_multilocs: :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Processing #{tenant.host}..."
        Cl2DataListingService.new.cl2_schema_root_models.each do |claz|
          multiloc_column_names = claz.column_names.select do |col|
            col.end_with? '_multiloc'
          end
          multiloc_column_names.each do |col|
            tups = if claz.columns_hash[col].type == :jsonb
              sql = <<-SQL.squish
                SELECT *
                FROM #{claz.table_name}
                JOIN jsonb_each_text(#{claz.table_name}.#{col}) e
                ON true
                WHERE e.value IS NULL
              SQL
              ActiveRecord::Base.connection.execute sql
            else
              claz.all.select do |obj|
                obj[col].value?(nil)
              end
            end
            next unless tups.count > 0

            tups.pluck('id').each do |id|
              obj = claz.find id
              multiloc = obj[col]
              multiloc.each_key do |k|
                multiloc.delete(k) if multiloc[k].nil?
              end
              obj.update_attribute col, multiloc
            end
          end
        end
      end
    end
  end

  task fix_authored_campaigns_without_authors: :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        EmailCampaigns::Campaigns::Manual.where(sender: 'author').where(author_id: nil)
          .update_all(sender: 'organization')
      end
    end
  end

  task fix_missing_analysis_columns: :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        connection = ActiveRecord::Base.connection

        created_at_exists = connection.column_exists?(:analysis_taggings, :created_at)
        updated_at_exists = connection.column_exists?(:analysis_taggings, :updated_at)

        next if created_at_exists && updated_at_exists

        if !created_at_exists && !updated_at_exists
          puts "Columns missing for #{Tenant.name}, adding them now"
          connection.add_timestamps(:analysis_taggings, null: false, default: Time.now)
        else
          raise "#{Tenant.name} is inconsistent: created_at #{created_at_exists}, updated at #{updated_at_exists}"
        end
      end
    end
  end
end
