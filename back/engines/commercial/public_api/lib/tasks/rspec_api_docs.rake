# frozen_string_literal: true

require 'rspec/core/rake_task'

desc 'Generate public API request documentation from API specs'
RSpec::Core::RakeTask.new('public_api:docs:generate' => :environment) do |t, _task_args|
  ENV['DOC_FORMAT'] = 'open_api'
  ENV['DOCS_DIR'] = Rails.root.join('doc/public_api').to_s
  ENV['API_NAME'] = 'CitizenLab Public API'

  t.pattern = 'engines/commercial/public_api/spec/acceptance/**/*_spec.rb'
  # t.pattern = 'engines/commercial/public_api/spec/acceptance/ideas_spec.rb'
  t.rspec_opts = ['--format RspecApiDocumentation::ApiFormatter']
end
