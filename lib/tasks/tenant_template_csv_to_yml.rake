require 'csv'
require 'yaml'
require 'securerandom'

### rake tenant_template:csv_to_yml['tmp'] ###


namespace :tenant_template do
  desc "TODO"
  task :csv_to_yml, [:path] => [:environment] do |t, args|
  	locale = 'en' # TODO acquire locale from template settings

  	yml_users = convert_users(read_csv('Users', args), locale)
  	yml_ideas = convert_ideas(read_csv('Ideas', args), locale)
  	yml_models = {'models' => {'user' => yml_users, 'idea' => yml_ideas}}

  	File.open("#{args[:path]}/tenant_template.yml", 'w') {|f| f.write yml_models.to_yaml }
  end


  def read_csv(name, args)
  	CSV.read("#{args[:path]}/#{name}.csv", { headers: true, col_sep: ',' })
  end


  def convert_users(csv_users, locale) # locale?, slug?
  	csv_users.map{|csv_user| 
  		{ 	'email'        => csv_user['Email'], 
  			'first_name'   => csv_user['First Name'],
  			'last_name'    => csv_user['Last Name'],
  			'locale'       => locale,
  			'bio_multiloc' => csv_user['Biography (Optional)'],
  			'gender'       => csv_user['Gender'],
  			# birthyear?
  			# domicile?
  			# education?
  			'password'     => csv_user['Password (Optional)'] || generate_password(),
  			# ID?
  			'avatar'       =>  csv_user['Image URL (Optional)'] # correct?
  		}}
  end

  def convert_ideas(csv_ideas, locale)
  	csv_ideas.map{|csv_idea| 
  		{'title_multiloc' => {locale => csv_idea['Title']}}}
  end


  def generate_password()
  	SecureRandom.urlsafe_base64 8
  end

end