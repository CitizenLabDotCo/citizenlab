require 'rspec/core/rake_task'

desc 'Generate public API request documentation from API specs'
RSpec::Core::RakeTask.new('public_api:docs:generate' => :environment) do |t, task_args|
  # ENV["DOC_FORMAT"] = "api_blueprint"
  ENV["DOC_FORMAT"] = "html"
  ENV["DOCS_DIR"] = Rails.root.join('doc', 'public_api').to_s
  ENV["API_NAME"] = "CitizenLab Partner API"

  t.pattern = 'engines/commercial/public_api/spec/acceptance/**/*_spec.rb'
  t.rspec_opts = ["--format RspecApiDocumentation::ApiFormatter"]
end