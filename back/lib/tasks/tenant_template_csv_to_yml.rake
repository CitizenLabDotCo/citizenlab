# frozen_string_literal: true

require 'csv'
require 'yaml'
require 'securerandom'
require 'redcarpet'

### rake tenant_template:csv_to_yml['tmp','fr-BE fr-FR'] ###

namespace :tenant_template do
  desc 'Converts tenant templates from csv files to a yml file, working in the specified folder'
  task :csv_to_yml, %i[path locale] => [:environment] do |_t, args|
    locales = args[:locale].split
    template_path = Rails.root.join('config/tenant_templates/base.yml')
    yml_base = YAML.load(File.read(template_path)) # rubocop:disable Security/YAMLLoad

    users_hash           = {}
    topics_hash          = {}
    idea_statuses_hash   = {}
    projects_hash        = {}
    ideas_hash           = {}
    comments_hash        = {}

    yml_users = convert_users(read_csv('Users', args), locales, users_hash)
    yml_topics = yml_base['models']['topic']
    yml_topics.each { |t| topics_hash[t['title_multiloc'].split('.').last] = t }
    yml_idea_statuses = yml_base['models']['idea_status']
    yml_idea_statuses.each { |s| idea_statuses_hash[s['code']] = s }
    yml_project_images = []
    yml_projects       = convert_projects(read_csv('Projects', args), locales, projects_hash, topics_hash, yml_project_images)
    yml_votes          = []
    yml_ideas_topics   = []
    yml_idea_images    = []
    yml_ideas          = convert_ideas(read_csv('Ideas', args), locales, ideas_hash, users_hash,
      projects_hash, topics_hash, idea_statuses_hash, yml_votes,
      yml_ideas_topics, yml_idea_images)
    yml_comments       = convert_comments(read_csv('Comments', args), locales, comments_hash, ideas_hash, users_hash)
    yml_events         = convert_events(read_csv('Events', args), locales, projects_hash)
    yml_phases         = convert_phases(read_csv('Phases', args), locales, projects_hash)
    yml_models = { 'models' => yml_base['models'] }
    yml_models['models']['user']          = (yml_models['models']['user'] || []) + yml_users
    yml_models['models']['project']       = (yml_models['models']['project'] || []) + yml_projects
    yml_models['models']['project_image'] = (yml_models['models']['project_image'] || []) + yml_project_images
    yml_models['models']['idea']          = (yml_models['models']['idea'] || []) + yml_ideas
    yml_models['models']['vote']          = (yml_models['models']['vote'] || []) + yml_votes
    yml_models['models']['ideas_topic']   = (yml_models['models']['ideas_topic'] || []) + yml_ideas_topics
    yml_models['models']['idea_image']    = (yml_models['models']['idea_image'] || []) + yml_idea_images
    yml_models['models']['comment']       = (yml_models['models']['comment'] || []) + yml_comments
    yml_models['models']['event']         = (yml_models['models']['event'] || []) + yml_events
    yml_models['models']['phase']         = (yml_models['models']['phase'] || []) + yml_phases

    File.write("#{args[:path]}/tenant_template.yml", yml_models.to_yaml)
  end

  def read_csv(name, args)
    CSV.read("#{args[:path]}/#{name}.csv", { headers: true, col_sep: ',' })
  end

  def make_multiloc(value, locales)
    locales.index_with do |_locale|
      value
    end
  end

  def convert_users(csv_users, locales, users_hash)
    csv_users.map do |csv_user|
      yml_user = {
        'email' => csv_user['Email'],
        'first_name' => csv_user['First Name'],
        'last_name' => csv_user['Last Name'],
        'locale' => locales.first,
        'bio_multiloc' => make_multiloc(md_to_html(csv_user['Biography (Optional)']), locales),
        'gender' => csv_user['Gender'],
        'birthyear'	=> rand(10) == 0 ? nil : rand(1925..2004),
        'domicile' => rand(10) == 0 ? nil : generate_domicile,
        'password' => csv_user['Password (Optional)'] || generate_password,
        'remote_avatar_url' => csv_user['Image URL (Optional)']
      }
      users_hash[csv_user['ID']] = yml_user
      yml_user
    end
  end

  def convert_projects(csv_projects, locales, projects_hash, _topics_hash, yml_project_images)
    csv_projects.map do |csv_project|
      yml_project = {
        'title_multiloc' => make_multiloc(csv_project['Title'], locales),
        'description_multiloc' => make_multiloc(md_to_html(csv_project['Description']), locales),
        'remote_header_bg_url' => csv_project['Background Image URL']
      }
      add_project_images(csv_project, yml_project, yml_project_images)
      projects_hash[csv_project['ID']] = yml_project
      yml_project
    end
  end

  def convert_ideas(csv_ideas, locales,
    ideas_hash, users_hash, projects_hash, topics_hash, idea_statuses_hash,
    yml_votes, yml_ideas_topics, yml_idea_images)
    statuses = %w[proposed under_consideration accepted implemented rejected]
    csv_ideas.map do |csv_idea|
      yml_idea = {
        'title_multiloc' => make_multiloc(csv_idea['Title'], locales),
        'body_multiloc' => make_multiloc(md_to_html(csv_idea['Body']), locales),
        'author_ref' => users_hash[csv_idea['Author ID']],
        'project_ref' => projects_hash[csv_idea['Project ID']],
        'idea_status_ref' => idea_statuses_hash[statuses.sample],
        'publication_status' => 'published'
      }
      generate_and_add_votes(csv_idea, yml_idea, yml_votes, users_hash)
      add_ideas_topics(csv_idea, yml_idea, topics_hash, yml_ideas_topics)
      add_idea_images(csv_idea, yml_idea, yml_idea_images)
      ideas_hash[csv_idea['ID']] = yml_idea
      yml_idea
    end
  end

  def convert_comments(csv_comments, locales, comments_hash, ideas_hash, users_hash)
    csv_comments.map do |csv_comment|
      yml_comment = {
        'body_multiloc' => make_multiloc(md_to_html(csv_comment['Body']), locales),
        'author_ref' => users_hash[csv_comment['Author ID']],
        'idea_ref' => ideas_hash[csv_comment['Idea ID']],
        'parent_ref' => comments_hash[csv_comment['Comment ID (Optional)']]
      }
      comments_hash[csv_comment['ID']] = yml_comment
      yml_comment
    end
  end

  def convert_events(csv_events, locales, projects_hash)
    csv_events.map do |csv_event|
      start_at = Faker::Date.between(from: 1.year.ago, to: 1.year.from_now)
      {
        'title_multiloc' => make_multiloc(csv_event['Title'], locales),
        'description_multiloc' => make_multiloc(md_to_html(csv_event['Description']), locales),
        'location_multiloc' => make_multiloc(csv_event['Location'], locales),
        'project_ref' => projects_hash[csv_event['Project ID']],
        'start_at' => start_at,
        'end_at' => start_at + 1.day
      }
    end
  end

  def convert_phases(csv_phases, locales, projects_hash)
    project_to_time = {}
    csv_phases.map do |csv_phase|
      t = (project_to_time[csv_phase['Project ID']] || Faker::Date.between(from: 4.months.ago, to: 1.month.from_now)) + 1.day
      start_at = t
      end_at = t + rand(1..30).days
      project_to_time[csv_phase['Project ID']] = end_at
      {
        'title_multiloc' => make_multiloc(csv_phase['Title'], locales),
        'description_multiloc' => make_multiloc(md_to_html(csv_phase['Description']), locales),
        'project_ref' => projects_hash[csv_phase['Project ID']],
        'start_at' => start_at,
        'end_at' => end_at
      }
    end
  end

  def generate_password
    SecureRandom.urlsafe_base64 8
  end

  def generate_domicile
    # TODO: fetch areas from those provided (when provided)
    'outside'
  end

  def add_project_images(csv_project, yml_project, yml_project_images)
    yml_project_images.concat [csv_project['Image URL']].select { |i| i }.map do |i|
      {
        'remote_image_url' => i.strip,
        'project_ref' => yml_project
      }
    end
  end

  def generate_and_add_votes(csv_idea, yml_idea, yml_votes, users_hash)
    shuffled_users = users_hash.values.shuffle
    vote_modes = Array.new(Integer(csv_idea['Upvotes'] || 0), 'up') + Array.new(Integer(csv_idea['Downvotes'] || 0), 'down')
    new_votes = zip_min(vote_modes, shuffled_users).map do |z|
      mode = z[0]
      user = z[1]
      {
        'mode' => mode,
        'user_ref' => user,
        'votable_ref' => yml_idea
      }
    end
    yml_votes.concat new_votes
  end

  def add_ideas_topics(csv_idea, yml_idea, topics_hash, yml_ideas_topics)
    topics = [
      csv_idea['Topic 1 (Optional)'],
      csv_idea['Topic 2 (Optional)']
    ].select do |t|
      t && (t != '/') && topics_hash[t]
    end.map do |t|
      {
        'idea_ref' => yml_idea,
        'topic_ref' => topics_hash[t]
      }
    end
    yml_ideas_topics.concat topics
  end

  def add_idea_images(csv_idea, yml_idea, yml_idea_images)
    images = [
      csv_idea['Image URL']
    ].select { |i| i }.map do |i|
      {
        'remote_image_url' => i.strip,
        'idea_ref' => yml_idea
      }
    end
    yml_idea_images.concat images
  end

  def zip_min(l1, l2)
    len = [l1.size, l2.size].min
    l1.take(len).zip l2.take(len)
  end

  def md_to_html(md)
    md && Redcarpet::Markdown.new(Redcarpet::Render::HTML.new).render(md)
  end
end
