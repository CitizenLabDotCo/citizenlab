# frozen_string_literal: true

namespace :single_use do
  desc 'Rebuild nested set columns for InputTopic and DefaultInputTopic after migration'
  task rebuild_input_topic_nested_sets: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Temporarily set order_column to preserve existing ordering during rebuild
      InputTopic.acts_as_nested_set_options[:order_column] = :ordering
      InputTopic.rebuild!
      puts "  - Rebuilt #{InputTopic.count} InputTopics"

      DefaultInputTopic.acts_as_nested_set_options[:order_column] = :ordering
      DefaultInputTopic.rebuild!
      puts "  - Rebuilt #{DefaultInputTopic.count} DefaultInputTopics"
    end

    puts 'Done!'
  end
end
