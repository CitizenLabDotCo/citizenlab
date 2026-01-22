# frozen_string_literal: true

require 'csv'

namespace :single_use do
  desc 'Remap areas and their corresponding custom field options based on CSV mapping file'
  # Usage:
  # rails "single_use:remap_areas_and_custom_field_options[doemee.inulst,/path/to/mapping.csv]"
  #
  # CSV file should have two columns: OLD and NEW
  # OLD column contains the current area names
  # NEW column contains the target area names to map to
  #
  # Multiple OLD values can map to the same NEW value, which will:
  # - Update all matching areas to the NEW name
  # - Keep only one area with the NEW name (the first alphabetically by OLD name)
  # - Delete duplicate areas that now have the same name
  # - Update all references (projects, users, etc.) to point to the kept area
  # - Update the corresponding custom field options for the domicile field
  #
  # Example CSV:
  # OLD,NEW
  # Hulst,Hulst
  # Paal,Graauw
  # Zandberg,Graauw
  # Schuddebeurs,Hulst
  task :remap_areas_and_custom_field_options, %i[host csv_path] => :environment do |_task, args|
    raise 'Please provide host argument' if args[:host].blank?
    raise 'Please provide csv_path argument' if args[:csv_path].blank?
    raise "CSV file not found: #{args[:csv_path]}" unless File.exist?(args[:csv_path])

    reporter = ScriptReporter.new
    tenant = Tenant.find_by(host: args[:host])
    raise "Tenant not found: #{args[:host]}" unless tenant

    tenant.switch do
      # Read CSV file
      csv = CSV.read(args[:csv_path], headers: true)

      # Validate CSV format
      unless csv.headers.include?('OLD') && csv.headers.include?('NEW')
        raise 'CSV must have OLD and NEW columns'
      end

      # Build mapping hash: old_name => new_name
      mapping = {}
      csv.each do |row|
        old_name = row['OLD']&.strip
        new_name = row['NEW']&.strip

        next if old_name.blank? || new_name.blank?

        mapping[old_name] = new_name
      end

      puts "Found #{mapping.size} area mappings to process"
      puts "Tenant: #{tenant.host}"
      puts '-' * 80

      # Get domicile custom field if it exists
      domicile_field = CustomField.find_by(key: 'domicile')

      if domicile_field
        puts "✓ Found domicile custom field with #{domicile_field.options.count} options"
      else
        puts '⚠ No domicile custom field found - only areas will be updated'
      end
      puts '-' * 80

      # Group mappings by target name to find merges
      target_groups = mapping.group_by { |_old, new| new }

      # Track statistics
      stats = {
        areas_renamed: 0,
        areas_merged: 0,
        areas_not_found: 0,
        options_updated: 0,
        errors: []
      }

      ActiveRecord::Base.transaction do
        target_groups.each do |target_name, old_new_pairs|
          old_names = old_new_pairs.map(&:first)

          # Find all areas with the old names (case-insensitive match on default locale)
          default_locale = I18n.default_locale.to_s
          matching_areas = Area.all.select do |area|
            area_name = area.title_multiloc[default_locale]&.strip
            old_names.any? { |old_name| area_name&.casecmp?(old_name) }
          end

          if matching_areas.empty?
            old_names.each do |old_name|
              stats[:areas_not_found] += 1
              puts "⚠ Area not found: '#{old_name}'"
            end
            next
          end

          if matching_areas.size == 1
            # Simple rename - just one area to update
            area = matching_areas.first
            old_name_display = area.title_multiloc[default_locale]

            # Skip if already has the target name
            if area.title_multiloc[default_locale]&.strip&.casecmp?(target_name)
              puts "→ '#{old_name_display}' already has target name '#{target_name}' - skipping"
              next
            end

            # Update area title
            new_title_multiloc = area.title_multiloc.dup
            area.title_multiloc.each_key do |locale|
              new_title_multiloc[locale] = target_name
            end

            area.title_multiloc = new_title_multiloc

            if area.save
              stats[:areas_renamed] += 1
              puts "✓ Renamed area: '#{old_name_display}' → '#{target_name}' (ID: #{area.id})"

              # Custom field option is automatically updated via Area's after_update callback
              if area.custom_field_option
                stats[:options_updated] += 1
                puts "  └─ Updated custom field option (ID: #{area.custom_field_option.id})"
              end
            else
              error_msg = "Failed to rename area '#{old_name_display}': #{area.errors.full_messages.join(', ')}"
              stats[:errors] << error_msg
              puts "✗ #{error_msg}"
            end
          else
            # Multiple areas need to be merged into one
            # Sort by old name to ensure deterministic behavior
            sorted_areas = matching_areas.sort_by { |a| a.title_multiloc[default_locale] || '' }
            area_to_keep = sorted_areas.first
            areas_to_merge = sorted_areas[1..]

            puts "⚡ Merging #{sorted_areas.size} areas into '#{target_name}':"
            puts "  ├─ KEEP: '#{area_to_keep.title_multiloc[default_locale]}' (ID: #{area_to_keep.id})"
            areas_to_merge.each do |area|
              puts "  ├─ MERGE: '#{area.title_multiloc[default_locale]}' (ID: #{area.id})"
            end

            # Merge all associations from areas_to_merge to area_to_keep
            areas_to_merge.each do |area_to_merge|
              # Update projects associations
              AreasProject.where(area_id: area_to_merge.id).each do |areas_project|
                # Check if association already exists
                existing = AreasProject.find_by(area_id: area_to_keep.id, project_id: areas_project.project_id)
                if existing
                  areas_project.destroy
                else
                  areas_project.update!(area_id: area_to_keep.id)
                end
              end

              # Update followers
              Follower.where(followable_type: 'Area', followable_id: area_to_merge.id).each do |follower|
                # Check if user already follows the kept area
                existing = Follower.find_by(
                  followable_type: 'Area',
                  followable_id: area_to_keep.id,
                  user_id: follower.user_id
                )
                if existing
                  follower.destroy
                else
                  follower.update!(followable_id: area_to_keep.id)
                end
              end

              # Update static page associations
              AreasStaticPage.where(area_id: area_to_merge.id).each do |areas_static_page|
                # Check if association already exists
                existing = AreasStaticPage.find_by(
                  area_id: area_to_keep.id,
                  static_page_id: areas_static_page.static_page_id
                )
                if existing
                  areas_static_page.destroy
                else
                  areas_static_page.update!(area_id: area_to_keep.id)
                end
              end

              # Update user custom field values (domicile field)
              if domicile_field
                User.where("custom_field_values->>'domicile' = ?", area_to_merge.id).each do |user|
                  user.custom_field_values['domicile'] = area_to_keep.id
                  user.save(validate: false) # Skip validation in case of other issues
                end
              end

              # Destroy the area (this will also destroy its custom_field_option via callback)
              area_to_merge.destroy!
              stats[:areas_merged] += 1
            end

            # Now update the kept area's name
            new_title_multiloc = area_to_keep.title_multiloc.dup
            area_to_keep.title_multiloc.each_key do |locale|
              new_title_multiloc[locale] = target_name
            end

            area_to_keep.title_multiloc = new_title_multiloc

            if area_to_keep.save
              stats[:areas_renamed] += 1
              puts "  └─ ✓ Renamed kept area to '#{target_name}'"

              # Custom field option is automatically updated via Area's after_update callback
              if area_to_keep.custom_field_option
                stats[:options_updated] += 1
                puts "     └─ Updated custom field option (ID: #{area_to_keep.custom_field_option.id})"
              end
            else
              error_msg = "Failed to rename kept area: #{area_to_keep.errors.full_messages.join(', ')}"
              stats[:errors] << error_msg
              puts "  └─ ✗ #{error_msg}"
            end
          end
        end

        # Update followers_count for all affected areas
        puts '-' * 80
        puts 'Recalculating followers_count...'
        Area.all.each do |area|
          area.update_column(:followers_count, area.followers.count)
        end

        puts '-' * 80
        puts 'Summary:'
        puts "  Areas renamed: #{stats[:areas_renamed]}"
        puts "  Areas merged: #{stats[:areas_merged]}"
        puts "  Areas not found: #{stats[:areas_not_found]}"
        puts "  Custom field options updated: #{stats[:options_updated]}"

        if stats[:errors].any?
          puts "\n⚠ Errors encountered:"
          stats[:errors].each do |error|
            puts "  - #{error}"
          end
        end

        puts '-' * 80

        if stats[:errors].any?
          puts '⚠ Completed with errors - review above'
        else
          puts '✓ Migration completed successfully!'
        end

        reporter.report_success('Area remapping completed')
      end
    rescue StandardError => e
      reporter.report_failure(e)
      puts "\n✗ Migration failed: #{e.message}"
      puts e.backtrace.first(5).join("\n")
      raise
    end
  end
end
