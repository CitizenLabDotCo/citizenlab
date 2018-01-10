require 'csv'
require 'yaml'
require 'securerandom'
require 'redcarpet'

### rake tenant_template:csv_to_yml['tmp','fr'] ###


namespace :tenant_template do
  desc "Converts tenant templates from csv files to a yml file, working in the specified folder"
  task :csv_to_yml, [:path,:locale] => [:environment] do |t, args|
  	locale = args[:locale]
    yml_base = YAML.load_file('config/tenant_templates/base.yml')

  	users_hash           = {}
    topics_hash          = {}
    idea_statuses_hash   = {}
  	projects_hash        = {}
  	ideas_hash           = {}
  	comments_hash        = {}

  	yml_users          = convert_users(read_csv('Users', args), locale, users_hash)
    yml_topics         = yml_base['models']['topic']
    yml_topics.each{ |t| topics_hash[t['title_multiloc'].split('.').last] = t }
    yml_idea_statuses  = yml_base['models']['idea_status']
    yml_idea_statuses.each{ |s| idea_statuses_hash[s['code']] = s }
    yml_project_images = []
  	yml_projects       = convert_projects(read_csv('Projects', args), locale, projects_hash, topics_hash, yml_project_images)
  	yml_votes          = []
    yml_ideas_topics   = []
    yml_idea_images    = []
  	yml_ideas          = convert_ideas(read_csv('Ideas', args), locale, ideas_hash, users_hash, 
                                       projects_hash, topics_hash, idea_statuses_hash, yml_votes,
                                       yml_ideas_topics, yml_idea_images)
  	yml_comments       = convert_comments(read_csv('Comments', args), locale, comments_hash, ideas_hash, users_hash)
  	yml_events         = convert_events(read_csv('Events', args), locale, projects_hash)
  	yml_phases         = convert_phases(read_csv('Phases', args), locale, projects_hash)
    yml_models         = { 'models' => yml_base['models'] }
    yml_models['models']['user']          = yml_users
    yml_models['models']['project']       = yml_projects
    yml_models['models']['project_image'] = yml_project_images
    yml_models['models']['idea']          = yml_ideas
    yml_models['models']['vote']          = yml_votes
    yml_models['models']['ideas_topic']   = yml_ideas_topics
    yml_models['models']['idea_image']    = yml_idea_images
    yml_models['models']['comment']       = yml_comments
    yml_models['models']['event']         = yml_events
    yml_models['models']['phase']         = yml_phases

  	File.open("#{args[:path]}/tenant_template.yml", 'w') {|f| f.write yml_models.to_yaml }
  end


  def read_csv(name, args)
  	CSV.read("#{args[:path]}/#{name}.csv", { headers: true, col_sep: ',' })
  end


  def convert_users(csv_users, locale, users_hash)
  	csv_users.map{|csv_user| 
  		yml_user = { 'email'             => csv_user['Email'], 
  			  			   'first_name'        => csv_user['First Name'],
  						     'last_name'         => csv_user['Last Name'],
  						     'locale'            => locale,
  						     'bio_multiloc'      => {locale => md_to_html(csv_user['Biography (Optional)'])},
  						     'gender'            => csv_user['Gender'],
  						     'birthyear'	       => rand(10) === 0 ? nil : 1927 + rand(90),
  						     'domicile'          => rand(10) === 0 ? nil : generate_domicile(),
  					       'education'         => rand(10) === 0 ? nil : rand(9),
  					     	 'password'          => csv_user['Password (Optional)'] || generate_password(),
  						     'remote_avatar_url' => csv_user['Image URL (Optional)']&.strip
  				       }
  		users_hash[csv_user['ID']] = yml_user
  		yml_user
  	}
  end

  def convert_projects(csv_projects, locale, projects_hash, topics_hash, yml_project_images)
  	csv_projects.map{|csv_project| 
  		yml_project = {	'title_multiloc'       => {locale => csv_project['Title']},
  						        'description_multiloc' => {locale => md_to_html(csv_project['Description'])},
  						        # 'project_images_images_urls'  => csv_project['Image URL'] && [csv_project['Image URL']],
  						        'remote_header_bg_url'  => csv_project['Background Image URL']&.strip
  					        }
      # TODO associate project topics
      add_project_images(csv_project, yml_project, yml_project_images)
  		projects_hash[csv_project['ID']] = yml_project
  		yml_project
  	}
  end

  def convert_ideas(csv_ideas, locale, 
                    ideas_hash, users_hash, projects_hash, topics_hash, idea_statuses_hash, 
                    yml_votes, yml_ideas_topics, yml_idea_images)
  	csv_ideas.map{|csv_idea| 
  		yml_idea = { 'title_multiloc'     => {locale => csv_idea['Title']},
  					       'body_multiloc'      => {locale => md_to_html(csv_idea['Body'])},
  				         'author_ref'         => users_hash[csv_idea['Author ID']],
  				         'project_ref'        => projects_hash[csv_idea['Project ID']],
  				         'areas'              => [], # TODO
  				         'idea_status_ref'    => idea_statuses_hash[[ 'proposed', 'under_consideration', 
                                                                'accepted', 'implemented', 
                                                                'rejected' ].shuffle.first],
  				         # 'idea_images_images_urls'   => csv_idea['Image URL'] && [csv_idea['Image URL']],
  				         'publication_status' => 'published'
  				       }
  		generate_and_add_votes(csv_idea, yml_idea, yml_votes, users_hash)
      add_ideas_topics(csv_idea, yml_idea, topics_hash, yml_ideas_topics)
      add_idea_images(csv_idea, yml_idea, yml_idea_images)
  		ideas_hash[csv_idea['ID']] = yml_idea
  		yml_idea
  	}
  end

  def convert_comments(csv_comments, locale, comments_hash, ideas_hash, users_hash)
  	csv_comments.map{|csv_comment| 
  		yml_comment = {	'body_multiloc' => {locale => md_to_html(csv_comment['Body'])},
  			              'author_ref'    => users_hash[csv_comment['Author ID']],
                      'idea_ref'      => ideas_hash[csv_comment['Idea ID']],
                      'parent_ref'    => comments_hash[csv_comment['Comment ID (Optional)']]
  		              }
      comments_hash[csv_comment['ID']] = yml_comment
      yml_comment 
    }
  end

  def convert_events(csv_events, locale, projects_hash)
  	csv_events.map{|csv_event| 
      start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
  		{	'title_multiloc'       => {locale => csv_event['Title']},
        'description_multiloc' => {locale => md_to_html(csv_event['Description'])},
        'location_multiloc'    => {locale => csv_event['Location']},
  			'project_ref'          => projects_hash[csv_event['Project ID']],
        'start_at'             => start_at,
        'end_at'               => start_at + 1.days
  		}}
  end

  def convert_phases(csv_phases, locale, projects_hash)
    start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
  	csv_phases.map{|csv_phase| 
  		{	'title_multiloc'       => {locale => csv_phase['Title']},
  			'description_multiloc' => {locale => md_to_html(csv_phase['Description'])},
        'project_ref'          => projects_hash[csv_phase['Project ID']],
        'start_at'             => start_at,
        'end_at'               => (start_at += rand(120).days)
  		}}
  end


  def generate_password()
  	SecureRandom.urlsafe_base64 8
  end

  def generate_domicile()
  	# TODO fetch areas from those provided (when provided)
  	'outside'
  end

  def add_project_images(csv_project, yml_project, yml_project_images)
    yml_project_images.concat [csv_project['Image URL']].select { |i| i }
                                                        .map { |i| { 'remote_image_url' => i.strip,
                                                                     'project_ref'      => yml_project } }
  end

  def generate_and_add_votes(csv_idea, yml_idea, yml_votes, users_hash)
  	shuffled_users = users_hash.values.shuffle
  	vote_modes = Array.new(Integer(csv_idea['Upvotes'] || 0), 'up') + Array.new(Integer(csv_idea['Downvotes'] || 0), 'down')
    new_votes = zip_min(vote_modes, shuffled_users).map {|z|  
      mode = z[0]
      user = z[1]
      { 'mode'        => mode,
        'user_ref'    => user,
        'votable_ref' => yml_idea }}
    yml_votes.concat new_votes
  end

  def add_ideas_topics(csv_idea, yml_idea, topics_hash, yml_ideas_topics)
    yml_ideas_topics.concat [ csv_idea['Topic 1 (Optional)'],
                              csv_idea['Topic 2 (Optional)'] ].select { |t| t && (t != '/') && topics_hash[t] }
                                                              .map { |t| { 'idea_ref'  => yml_idea,
                                                                           'topic_ref' => topics_hash[t] }}
  end

  def add_idea_images(csv_idea, yml_idea, yml_idea_images)
    yml_idea_images.concat [csv_idea['Image URL']].select { |i| i }
                                                  .map { |i| { 'remote_image_url' => i.strip,
                                                               'idea_ref'         => yml_idea } }
  end


  def zip_min(l1, l2)
    len = [l1.size,l2.size].min
    l1.take(len).zip l2.take(len)
  end

  def md_to_html(md)
    md && Redcarpet::Markdown.new(Redcarpet::Render::HTML.new).render(md)
  end

end