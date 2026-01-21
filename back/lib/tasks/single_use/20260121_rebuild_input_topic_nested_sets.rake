# frozen_string_literal: true

namespace :single_use do
  desc 'Rebuild nested set columns for InputTopic and DefaultInputTopic after migration'
  task rebuild_input_topic_nested_sets: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "Processing tenant: #{tenant.host}"

      # Rebuild InputTopic nested set per project
      InputTopic.rebuild!
      puts "  - Rebuilt #{InputTopic.count} InputTopics"

      # Rebuild DefaultInputTopic nested set
      DefaultInputTopic.rebuild!
      puts "  - Rebuilt #{DefaultInputTopic.count} DefaultInputTopics"
    end

    puts 'Done!'
  end
end
