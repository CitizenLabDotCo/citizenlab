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
      csv = CSV.read(args[:csv_path], headers: true)
      validate_csv_headers!(csv)
      mapping = build_mapping_from_csv(csv)
      puts "Found #{mapping.size} area mappings to process"
      puts "Tenant: #{tenant.host}"
      puts '-' * 80
      domicile_field = CustomField.find_by(key: 'domicile')
      print_domicile_field_status(domicile_field)
      puts '-' * 80
      target_groups = mapping.group_by { |_old, new| new }
      stats = init_stats
      ActiveRecord::Base.transaction do
        target_groups.each do |target_name, old_new_pairs|
          process_target_group(target_name, old_new_pairs, domicile_field, stats)
        end
        recalculate_followers_count
        print_summary(stats)
        reporter.add_processed_tenant(tenant)
      end
    rescue StandardError => e
      reporter.add_error(e.message, context: { backtrace: e.backtrace.first(5) })
      puts "\n✗ Migration failed: #{e.message}"
      puts e.backtrace.first(5).join("\n")
      raise
    end
  end
end

# --- Helper methods ---
def validate_csv_headers!(csv)
  unless csv.headers.include?('OLD') && csv.headers.include?('NEW')
    raise 'CSV must have OLD and NEW columns'
  end
end

def build_mapping_from_csv(csv)
  mapping = {}
  csv.each do |row|
    old_name = row['OLD']&.strip
    new_name = row['NEW']&.strip
    next if old_name.blank? || new_name.blank?

    mapping[old_name] = new_name
  end
  mapping
end

def print_domicile_field_status(domicile_field)
  if domicile_field
    puts "✓ Found domicile custom field with #{domicile_field.options.count} options"
  else
    puts '⚠ No domicile custom field found - only areas will be updated'
  end
end

def init_stats
  {
    areas_renamed: 0,
    areas_merged: 0,
    areas_not_found: 0,
    options_updated: 0,
    errors: []
  }
end

def process_target_group(target_name, old_new_pairs, domicile_field, stats)
  old_names = old_new_pairs.map(&:first)
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

    return
  end
  existing_target_area = Area.all.find do |area|
    area_name = area.title_multiloc[default_locale]&.strip
    area_name&.casecmp?(target_name) && matching_areas.exclude?(area)
  end
  if matching_areas.size == 1 && existing_target_area.nil?
    process_simple_rename(matching_areas.first, target_name, stats)
  else
    process_merge(target_name, matching_areas, existing_target_area, domicile_field, stats)
  end
end

def process_simple_rename(area, target_name, stats)
  default_locale = I18n.default_locale.to_s
  old_name_display = area.title_multiloc[default_locale]
  if area.title_multiloc[default_locale]&.strip&.casecmp?(target_name)
    puts "→ '#{old_name_display}' already has target name '#{target_name}' - skipping"
    return
  end
  new_title_multiloc = area.title_multiloc.dup
  area.title_multiloc.each_key { |locale| new_title_multiloc[locale] = target_name }
  area.title_multiloc = new_title_multiloc
  if area.save
    stats[:areas_renamed] += 1
    puts "✓ Renamed area: '#{old_name_display}' → '#{target_name}' (ID: #{area.id})"
    if area.custom_field_option
      stats[:options_updated] += 1
      puts "  └─ Updated custom field option (ID: #{area.custom_field_option.id})"
    end
  else
    error_msg = "Failed to rename area '#{old_name_display}': #{area.errors.full_messages.join(', ')}"
    stats[:errors] << error_msg
    puts "✗ #{error_msg}"
  end
end

def process_merge(target_name, matching_areas, existing_target_area, domicile_field, stats)
  default_locale = I18n.default_locale.to_s
  all_areas_to_process = existing_target_area ? [existing_target_area] + matching_areas : matching_areas
  sorted_areas = all_areas_to_process.sort_by { |a| a.title_multiloc[default_locale] || '' }
  area_to_keep = existing_target_area || sorted_areas.first
  areas_to_merge = sorted_areas.reject { |a| a.id == area_to_keep.id }
  puts "⚡ Merging #{all_areas_to_process.size} areas into '#{target_name}':"
  puts "  ├─ KEEP: '#{area_to_keep.title_multiloc[default_locale]}' (ID: #{area_to_keep.id})"
  areas_to_merge.each do |area_to_merge|
    puts "  ├─ MERGE: '#{area_to_merge.title_multiloc[default_locale]}' (ID: #{area_to_merge.id})"
    update_projects_associations(area_to_keep, area_to_merge)
    update_followers(area_to_keep, area_to_merge)
    update_static_pages(area_to_keep, area_to_merge)
    update_user_domicile(area_to_keep, area_to_merge, domicile_field)
    area_to_merge.destroy!
    stats[:areas_merged] += 1
  end
  new_title_multiloc = area_to_keep.title_multiloc.dup
  area_to_keep.title_multiloc.each_key { |locale| new_title_multiloc[locale] = target_name }
  area_to_keep.title_multiloc = new_title_multiloc
  if area_to_keep.save
    stats[:areas_renamed] += 1
    puts "  └─ ✓ Renamed kept area to '#{target_name}'"
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

def update_projects_associations(area_to_keep, area_to_merge)
  AreasProject.where(area_id: area_to_merge.id).each do |areas_project|
    existing = AreasProject.find_by(area_id: area_to_keep.id, project_id: areas_project.project_id)
    existing ? areas_project.destroy : areas_project.update!(area_id: area_to_keep.id)
  end
end

def update_followers(area_to_keep, area_to_merge)
  Follower.where(followable_type: 'Area', followable_id: area_to_merge.id).each do |follower|
    existing = Follower.find_by(followable_type: 'Area', followable_id: area_to_keep.id, user_id: follower.user_id)
    existing ? follower.destroy : follower.update!(followable_id: area_to_keep.id)
  end
end

def update_static_pages(area_to_keep, area_to_merge)
  AreasStaticPage.where(area_id: area_to_merge.id).each do |areas_static_page|
    existing = AreasStaticPage.find_by(area_id: area_to_keep.id, static_page_id: areas_static_page.static_page_id)
    existing ? areas_static_page.destroy : areas_static_page.update!(area_id: area_to_keep.id)
  end
end

def update_user_domicile(area_to_keep, area_to_merge, domicile_field)
  return unless domicile_field

  User.where("custom_field_values->>'domicile' = ?", area_to_merge.id).each do |user|
    user.custom_field_values['domicile'] = area_to_keep.id
    user.save(validate: false)
  end
end

def recalculate_followers_count
  puts '-' * 80
  puts 'Recalculating followers_count...'
  Area.all.each { |area| area.update_column(:followers_count, area.followers.count) }
end

def print_summary(stats)
  puts '-' * 80
  puts 'Summary:'
  puts "  Areas renamed: #{stats[:areas_renamed]}"
  puts "  Areas merged: #{stats[:areas_merged]}"
  puts "  Areas not found: #{stats[:areas_not_found]}"
  puts "  Custom field options updated: #{stats[:options_updated]}"
  if stats[:errors].any?
    puts "\n⚠ Errors encountered:"
    stats[:errors].each { |error| puts "  - #{error}" }
  end
  puts '-' * 80
  puts stats[:errors].any? ? '⚠ Completed with errors - review above' : '✓ Migration completed successfully!'
end
