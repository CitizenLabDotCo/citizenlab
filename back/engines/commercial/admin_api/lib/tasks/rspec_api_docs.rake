require 'rspec/core/rake_task'

desc 'Generate admin API request documentation from API specs'
RSpec::Core::RakeTask.new('admin_api:docs:generate' => :environment) do |t, task_args|
  # ENV["DOC_FORMAT"] = "api_blueprint"
  ENV["DOC_FORMAT"] = "html"
  ENV["DOCS_DIR"] = Rails.root.join('doc', 'admin_api').to_s
  ENV["API_NAME"] = "CitizenLab Admin API"

  t.pattern = '{spec,engines/**/spec}/acceptance/**/*_spec.rb'
  t.rspec_opts = ["-t admin_api --format RspecApiDocumentation::ApiFormatter"]
end