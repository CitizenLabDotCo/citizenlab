

namespace :tenant_template do
  desc "TODO"
  task :csv_to_yml, [:file] => [:environment] do |t, args|
  	file = args[:file]
  	puts "Thou gave me #{args[:file]}"
  end
end