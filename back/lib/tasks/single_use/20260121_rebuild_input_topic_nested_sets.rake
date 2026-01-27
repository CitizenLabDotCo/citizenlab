# frozen_string_literal: true

namespace :single_use do
  desc 'Rebuild nested set columns for InputTopic and DefaultInputTopic after migration'
  task rebuild_input_topic_nested_sets: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Normally we'd use InputTopic.rebuild! for this, but we can't make this
      # respect the (now obsolete) :ordering column. Because of this, we're setting
      # the nested set columns manually here, since it's pretty trivial when coming from a list.

      InputTopic.transaction do
        Project.find_each do |project|
          project.input_topics.order(:ordering).each.with_index do |topic, i|
            topic.update_columns(
              lft: (2 * i) + 1,
              rgt: (2 * i) + 2,
              depth: 0,
              children_count: 0,
              parent_id: nil
            )
          end
        end
      end

      DefaultInputTopic.transaction do
        DefaultInputTopic.order(:ordering).each.with_index do |topic, i|
          topic.update_columns(
            lft: (2 * i) + 1,
            rgt: (2 * i) + 2,
            depth: 0,
            children_count: 0,
            parent_id: nil
          )
        end
      end

      puts 'Done!'
    end
  end
end
