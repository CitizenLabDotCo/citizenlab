# frozen_string_literal: true

namespace :single_use do
  desc 'Backup current test data for migration testing'
  task backup_test_data: :environment do
    puts '💾 BACKING UP CURRENT TEST DATA...'
    puts '=' * 80

    backup_data = {}

    ContentBuilder::Layout.find_each do |layout|
      puts "📋 Backing up layout: #{layout.code} (ID: #{layout.id})"

      backup_data[layout.id] = {
        'id' => layout.id,
        'code' => layout.code,
        'content_buildable_type' => layout.content_buildable_type,
        'content_buildable_id' => layout.content_buildable_id,
        'enabled' => layout.enabled,
        'craftjs_json' => layout.craftjs_json,
        'created_at' => layout.created_at,
        'updated_at' => layout.updated_at
      }
    end

    # Save backup to a file
    backup_file = Rails.root.join('tmp/accordion_migration_backup.json')
    FileUtils.mkdir_p(File.dirname(backup_file))

    File.write(backup_file, JSON.pretty_generate(backup_data))

    puts "\n✅ Backup completed!"
    puts "📁 Backup saved to: #{backup_file}"
    puts "📊 Total layouts backed up: #{backup_data.keys.length}"
    puts "\n💡 To restore this backup, run:"
    puts '   docker compose run web bundle exec rake single_use:restore_test_data'
  end

  desc 'Restore test data from backup'
  task restore_test_data: :environment do
    puts '🔄 RESTORING TEST DATA FROM BACKUP...'
    puts '=' * 80

    backup_file = Rails.root.join('tmp/accordion_migration_backup.json')

    unless File.exist?(backup_file)
      puts "❌ Backup file not found: #{backup_file}"
      puts '💡 Run backup first: docker compose run web bundle exec rake single_use:backup_test_data'
      return
    end

    # Read backup data
    backup_data = JSON.parse(File.read(backup_file))

    puts "📁 Loading backup from: #{backup_file}"
    puts "📊 Total layouts to restore: #{backup_data.keys.length}"

    # Clear existing layouts
    ContentBuilder::Layout.delete_all
    puts '🗑️  Cleared existing layouts'

    # Restore layouts
    backup_data.each do |layout_id, layout_data|
      puts "🔄 Restoring layout: #{layout_data['code']} (ID: #{layout_id})"

      ContentBuilder::Layout.create!(
        id: layout_data['id'],
        code: layout_data['code'],
        content_buildable_type: layout_data['content_buildable_type'],
        content_buildable_id: layout_data['content_buildable_id'],
        enabled: layout_data['enabled'],
        craftjs_json: layout_data['craftjs_json'],
        created_at: layout_data['created_at'],
        updated_at: layout_data['updated_at']
      )
    end

    puts "\n✅ Restore completed!"
    puts "📊 Total layouts restored: #{ContentBuilder::Layout.count}"
  end
end
