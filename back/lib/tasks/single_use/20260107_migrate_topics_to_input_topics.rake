# frozen_string_literal: true

namespace :topics do
  desc 'Copy existing topics data to new input_topics structure (non-destructive)'
  task migrate_to_input_topics: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Track mapping from old topic IDs to new input topic IDs (per project)
      topic_to_input_topic_map = {}

      # Step 1: Create default_input_topics from global_topics marked as default
      GlobalTopic.where(is_default: true).order(:ordering).each do |topic|
        DefaultInputTopic.find_or_create_by!(
          title_multiloc: topic.title_multiloc
        ) do |dit|
          dit.description_multiloc = topic.description_multiloc
          dit.icon = topic.icon
          dit.ordering = topic.ordering
        end
      end
      puts "  Created #{DefaultInputTopic.count} default input topics"

      # Step 2: For each project, create input_topics from projects_allowed_input_topics
      Project.find_each do |project|
        project.projects_allowed_input_topics.includes(:topic).order(:ordering).each do |pait|
          topic = pait.topic # This is a GlobalTopic
          next unless topic # Skip if topic was deleted

          input_topic = InputTopic.find_or_create_by!(
            project: project,
            title_multiloc: topic.title_multiloc
          ) do |it|
            it.description_multiloc = topic.description_multiloc
            it.icon = topic.icon
            it.ordering = pait.ordering
          end

          # Map old topic to new input_topic for ideas migration
          topic_to_input_topic_map[[project.id, topic.id]] = input_topic.id
        end
      end
      puts "  Created input topics for #{Project.count} projects"

      # Step 3: Copy ideas_topics to ideas_input_topics
      migrated_count = 0
      warning_count = 0
      IdeasTopic.includes(:idea).find_each do |ideas_topic|
        project_id = ideas_topic.idea&.project_id
        next unless project_id # Skip orphaned records

        input_topic_id = topic_to_input_topic_map[[project_id, ideas_topic.topic_id]]

        if input_topic_id
          IdeasInputTopic.find_or_create_by!(
            idea_id: ideas_topic.idea_id,
            input_topic_id: input_topic_id
          )
          migrated_count += 1
        else
          puts "  Warning: No input_topic mapping for idea #{ideas_topic.idea_id}, topic #{ideas_topic.topic_id}"
          warning_count += 1
        end
      end
      puts "  Copied #{migrated_count} idea-topic associations (#{warning_count} warnings)"

      # Step 4: Store the mapping for later use - don't modify groups yet
      mapping_file = Rails.root.join('tmp', "topic_mapping_#{tenant.id}.json")
      File.write(mapping_file, topic_to_input_topic_map.transform_keys { |k| k.join(':') }.to_json)
      puts "  Saved topic mapping to #{mapping_file}"

      puts "Completed data copy for tenant: #{tenant.host}"
      puts '---'
    rescue StandardError => e
      puts "  Error processing tenant #{tenant.host}: #{e.message}"
      puts e.backtrace.first(5).join("\n")
      puts '---'
    end
  end
end
