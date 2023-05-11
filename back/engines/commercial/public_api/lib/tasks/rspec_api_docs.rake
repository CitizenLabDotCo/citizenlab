# frozen_string_literal: true

require 'rspec/core/rake_task'

desc 'Generate public Open API request documentation from API specs'
# open_api documentation: https://github.com/zipmark/rspec_api_documentation#open_api
RSpec::Core::RakeTask.new('public_api:docs:generate' => :environment) do |t, _task_args|
  ENV['DOC_FORMAT'] = 'open_api'
  ENV['DOCS_DIR'] = Rails.root.join('doc/public_api').to_s
  ENV['API_NAME'] = 'CitizenLab Public API'
  ENV['CONFIGURATIONS_DIR'] = Rails.root.join('engines/commercial/public_api/config/open_api').to_s

  t.pattern = 'engines/commercial/public_api/spec/acceptance/v2/**/*_spec.rb'
  t.rspec_opts = ['--format RspecApiDocumentation::ApiFormatter']
end
