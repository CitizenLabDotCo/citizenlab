# frozen_string_literal: true

require 'rspec/core/rake_task'

desc 'Generate public API request documentation from API specs'
RSpec::Core::RakeTask.new('web_api:docs:generate' => :environment) do |t, _task_args|
  ENV['DOC_FORMAT'] = 'html'
  ENV['API_NAME'] = 'CitizenLab Front Web API'
  t.pattern = '{spec,engines/**/spec}/acceptance/**/*_spec.rb'
  t.rspec_opts = ['--format RspecApiDocumentation::ApiFormatter --exclude-pattern="engines/commercial/{admin_api,public_api}/**/*_spec.rb" -t ~admin_api -t ~document:false']
end
