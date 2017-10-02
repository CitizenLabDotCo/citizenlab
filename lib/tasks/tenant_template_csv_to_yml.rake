require 'csv'
require 'yaml'


namespace :tenant_template do
  desc "TODO"
  task :csv_to_yml, [:path] => [:environment] do |t, args|
  	yml_users = convert_users(read_csv('Users', args))
  	yml_ideas = convert_ideas(read_csv('Ideas', args))
  	yml_models = {'models' => {'user' => yml_users, 'idea' => yml_ideas}}
  	File.open("#{args[:path]}/tenant_template.yml", 'w') {|f| f.write yml_models.to_yaml }
  end


  def read_csv(name, args)
  	CSV.read("#{args[:path]}/#{name}.csv", { headers: true, col_sep: ',' })
  end


  def convert_users(csv_users)
  	csv_users.map{|csv_user| 
  		{'email' => csv_user['Email']}}
  end

  def convert_ideas(csv_ideas)
  	csv_ideas.map{|csv_idea| 
  		{'title_multiloc' => {'en' => csv_idea['Title']}}}
  end

end