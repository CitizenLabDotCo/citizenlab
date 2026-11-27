# frozen_string_literal: true

# Annotates models with their schema after db:migrate in development. Settings are in
# .annotaterb.yml. Set ANNOTATERB_SKIP_ON_DB_TASKS to any value to skip it.
if Rails.env.development? && ENV['ANNOTATERB_SKIP_ON_DB_TASKS'].nil?
  require 'annotate_rb'

  AnnotateRb::Core.load_rake_tasks
end
