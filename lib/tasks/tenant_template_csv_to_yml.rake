
require 'csv'


namespace :tenant_template do
  desc "TODO"
  task :csv_to_yml, [:path] => [:environment] do |t, args|
  	convert_ideas(CSV.read(args[:path]+'/Ideas.csv', { col_sep: ',' }))
  end


  def convert_ideas(raw_ideas)
  	puts "We have #{raw_ideas.size} ideas."
  end

end