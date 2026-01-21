# frozen_string_literal: true

namespace :topics do
  desc 'Audit cleanup - show what would be deleted (dry run)'
  task audit_cleanup: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Auditing tenant: #{tenant.host}"

      # Find GlobalTopics that are ONLY input topics
      input_only_ids = GlobalTopic
        .where(is_default: false)
        .where.not(id: ProjectsGlobalTopic.select(:global_topic_id))
        .where.not(id: StaticPagesGlobalTopic.select(:global_topic_id))
        .pluck(:id)

      puts "  GlobalTopics to delete: #{input_only_ids.size}"
      puts "  - projects_allowed_input_topics: #{ProjectsAllowedInputTopic.where(topic_id: input_only_ids).count}"
      puts "  - ideas_topics: #{IdeasTopic.where(topic_id: input_only_ids).count}"
      puts "  - followers: #{Follower.where(followable_type: 'GlobalTopic', followable_id: input_only_ids).count}"
      puts "  - activities: #{Activity.where(item_type: 'GlobalTopic', item_id: input_only_ids).count}"

      # Safety check: verify InputTopics exist
      if InputTopic.none?
        puts '  [WARNING] No InputTopics found - migration may not have run!'
      else
        puts "  [OK] InputTopics exist (#{InputTopic.count} records)"
      end

      puts '---'
    end
  end

  desc 'Clean up GlobalTopics that only served as input topics (run after Release 2)'
  task cleanup_input_only_global_topics: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      ActiveRecord::Base.transaction do
        # Safety check: verify InputTopics exist
        if InputTopic.none?
          puts '  Skipping - no InputTopics found (migration must run first)'
          next
        end

        # Find GlobalTopics that are ONLY input topics
        input_only_global_topics = GlobalTopic
          .where(is_default: false)
          .where.not(id: ProjectsGlobalTopic.select(:global_topic_id))
          .where.not(id: StaticPagesGlobalTopic.select(:global_topic_id))

        input_only_ids = input_only_global_topics.pluck(:id)

        if input_only_ids.empty?
          puts '  No input-only GlobalTopics to clean up'
          next
        end

        # Delete associated activities first (before topics are deleted)
        activities_deleted = Activity.where(item_type: 'GlobalTopic', item_id: input_only_ids).delete_all
        puts "  Deleted #{activities_deleted} activities"

        # Delete the GlobalTopics (cascades to: projects_allowed_input_topics, ideas_topics, followers)
        # Using destroy_all to trigger callbacks (including SmartGroups ValueReferenceable)
        count = input_only_global_topics.count
        input_only_global_topics.destroy_all
        puts "  Deleted #{count} input-only GlobalTopics (with cascading deletes)"
      end

      puts "Completed tenant: #{tenant.host}"
      puts '---'
    rescue StandardError => e
      puts "  Error processing tenant #{tenant.host}: #{e.message}"
      puts e.backtrace.first(5).join("\n")
      puts '---'
    end
  end
end
