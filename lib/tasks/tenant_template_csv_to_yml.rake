require 'csv'
require 'yaml'
require 'securerandom'

### rake tenant_template:csv_to_yml['tmp'] ###


namespace :tenant_template do
  desc "TODO"
  task :csv_to_yml, [:path] => [:environment] do |t, args|
  	locale = 'en' # TODO acquire locale from template settings
    yml_base = YAML.load_file('config/tenant_templates/base.yml')

  	users_hash           = {}
    topics_hash          = {}
    idea_statuses_hash   = {}
  	projects_hash        = {}
  	ideas_hash           = {}
  	comments_hash        = {}

  	yml_users         = convert_users(read_csv('Users', args), locale, users_hash)
    yml_topics        = yml_base['models']['topic']
    yml_topics.each{ |t| topics_hash[t['title_multiloc'].split('.').last] = t }
    yml_idea_statuses = yml_base['models']['idea_status']
    yml_idea_statuses.each{ |s| idea_statuses_hash[s['code']] = s }
  	yml_projects      = convert_projects(read_csv('Projects', args), locale, projects_hash, topics_hash)
  	yml_votes         = []
  	yml_ideas         = convert_ideas(read_csv('Ideas', args), locale, ideas_hash, users_hash, projects_hash, topics_hash, idea_statuses_hash, yml_votes)
  	yml_comments      = convert_comments(read_csv('Comments', args), locale, comments_hash, ideas_hash, users_hash)
  	yml_events        = convert_events(read_csv('Events', args), locale, projects_hash)
  	yml_phases        = convert_phases(read_csv('Phases', args), locale, projects_hash)
  	yml_models        = { 'models' => { 'user'          => yml_users, 
                                        'topic'         => yml_topics,
                                        'idea_status'   => yml_idea_statuses,
  								                      'project'       => yml_projects,  
  								                      'idea'          => yml_ideas, 
  								                      'votes'         => yml_votes,
  		                                  'comment'       => yml_comments, 
  		                                  'event'         => yml_events, 
  		                                  'phase'         => yml_phases } }

  	File.open("#{args[:path]}/tenant_template.yml", 'w') {|f| f.write yml_models.to_yaml }
  end


  def read_csv(name, args)
  	CSV.read("#{args[:path]}/#{name}.csv", { headers: true, col_sep: ',' })
  end


  def convert_users(csv_users, locale, users_hash) # locale?, slug?
  	csv_users.map{|csv_user| 
  		yml_user = { 'email'            => csv_user['Email'], 
  			  			   'first_name'       => csv_user['First Name'],
  						     'last_name'        => csv_user['Last Name'],
  						     'locale'           => locale,
  						     'bio_multiloc'     => csv_user['Biography (Optional)'],
  						     'gender'           => csv_user['Gender'],
  						     'birthyear'	      => rand(10) === 0 ? nil : 1927 + rand(90),
  						     'domicile'         => rand(10) === 0 ? nil : generate_domicile(),
  					       'education'        => rand(10) === 0 ? nil : rand(9),
  					     	 'password'         => csv_user['Password (Optional)'] || generate_password(),
  						     'avatar_image_url' => csv_user['Image URL (Optional)']
  				       }
  		users_hash[csv_user['ID']] = yml_user
  		yml_user
  	}
  end

  def convert_projects(csv_projects, locale, projects_hash, topics_hash)
  	csv_projects.map{|csv_project| 
  		yml_project = {	'title_multiloc'       => {locale => csv_project['Title']},
  						        'description_multiloc' => {locale => csv_project['Description']},
  						        'project_images_urls'  => csv_project['Image URL'] && [csv_project['Image URL']],
  						        'header_bg_image_url'  => csv_project['Background Image URL'],
  						        'topics'               => generate_topics()
  					        }
  		projects_hash[csv_project['ID']] = yml_project
  		yml_project
  	}
  end

  def convert_ideas(csv_ideas, locale, ideas_hash, users_hash, projects_hash, topics_hash, idea_statuses_hash, yml_votes)
  	csv_ideas.map{|csv_idea| 
  		yml_idea = { 'title_multiloc'     => {locale => csv_idea['Title']},
  					       'body_multiloc'      => {locale => csv_idea['Body']},
  				         'author'             => users_hash[csv_idea['Author ID']],
  				         'project'            => users_hash[csv_idea['Project ID']],
  				         'topics'             => [ csv_idea['Topic 1 (Optional)'],
                                             csv_idea['Topic 2 (Optional)'] ].select { |t| t && (t != '/') && topics_hash[t] }
                                                                             .map { |t| topics_hash[t] },
  				         'areas'              => [], # TODO
  				         'upvotes'            => Integer(csv_idea['Upvotes']),
  				         'downvotes'          => Integer(csv_idea['Downvotes']),
  				         'idea_status_code'   => idea_statuses_hash[[ 'proposed', 'under_consideration', 
                                                                'accepted', 'implemented', 
                                                                'rejected', 'custom' ].shuffle.first],
  				         'idea_images_urls'   => csv_idea['Image URL'] && [csv_idea['Image URL']],
  				         'publication_status' => 'published'
  				       }
  		generate_and_add_votes(yml_idea, yml_votes, users_hash)
  		ideas_hash[csv_idea['ID']] = yml_idea
  		yml_idea
  	}
  end

  def convert_comments(csv_comments, locale, comments_hash, ideas_hash, users_hash)
  	csv_comments.map{|csv_comment| 
  		{	'title_multiloc' => 42,
  			'author' => 42
  		}}
  end

  def convert_events(csv_events, locale, projects_hash)
  	csv_events.map{|csv_event| 
  		{	'title_multiloc' => 42,
  			'author' => 42
  		}}
  end

  def convert_phases(csv_phases, locale, projects_hash)
  	csv_phases.map{|csv_phase| 
  		{	'title_multiloc' => 42,
  			'author' => 42
  		}}
  end


  def generate_password()
  	SecureRandom.urlsafe_base64 8
  end

  def generate_domicile()
  	# TODO fetch areas from those provided (when provided)
  	'outside'
  end

  def generate_topics()
  	# TODO
  	[]
  end

  def generate_and_add_votes(yml_idea, yml_votes, users_hash)
  	shuffled_users = users_hash.values.shuffle
  	vote_modes = Array.new(yml_idea['upvotes'], 'up') + Array.new(yml_idea['downvotes'], 'down')
    new_votes = zip_min(vote_modes, shuffled_users).map {|z|  
      mode = z[0]
      user = z[1]
      { 'mode'    => mode,
        'user'    => user,
        'votable' => yml_idea }}
    yml_votes.concat new_votes
    yml_idea['votes'] = new_votes
  end


  def zip_min(l1, l2)
    len = [l1.size,l2.size].min
    l1.take(len).zip l2.take(len)
  end

end