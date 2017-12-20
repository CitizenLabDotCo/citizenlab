require 'mongo'
require 'redcarpet'
require 'securerandom'
require 'time'

# require "rails"

@log = []

namespace :migrate do
  desc "Migrating Data from a CL1 Platform to a CL2 Tenant"
  task :from_cl1, [:json_url] => [:environment] do |t, args|
    url = args[:json_url] # "https://api.myjson.com/bins/anxyv"
    migration_settings = JSON.load(open(url))
    platform = migration_settings['platform']
    password = migration_settings['password']
    locales_mapping = { 'en' => 'en', 'nl' => 'nl', 'nl-BE' => 'nl', 'fr' => 'fr' } 
    topics_mapping = migration_settings['topics_mapping'] || {}
    idea_statuses_mapping = migration_settings['idea_statuses_mapping'] || {}

    host = migration_settings['host']
    prev_tenant = Tenant.where(host: host)&.first
    keep_settings = nil
    if prev_tenant
      keep_settings = prev_tenant.settings
      prev_tenant.destroy
    end
    client = connect(platform: platform, password: password)
    create_tenant(platform, host, client['settings'].find.first, client['meteor_accounts_loginServiceConfiguration'], migration_settings, locales_mapping, keep_settings=keep_settings)
    Apartment::Tenant.switch(host.gsub '.', '_') do
      TenantTemplateService.new.apply_template 'base'
    
      topics_code_hash = create_topics_code_hash
      topics_hash = {}
      if client['categories']
        client['categories'].find.no_cursor_timeout.each do |c|
          map_topic c, topics_hash, topics_mapping, topics_code_hash
        end
      end
      areas_hash = {}
      client['neighbourhoods'].find.no_cursor_timeout.each do |n|
        migrate_area n, areas_hash, locales_mapping
      end
      superadmin_id = nil
      groups_hash = {}
      client['groups'].find.no_cursor_timeout.each do |g|
        was_superadmin = migrate_group g, groups_hash, locales_mapping
        if was_superadmin
          superadmin_id = was_superadmin
        end
      end
      users_hash = {}
  	  client['users'].find.no_cursor_timeout.each do |u|
  		  migrate_user u, users_hash, groups_hash, superadmin_id, locales_mapping
  	  end
      projects_hash = {}
      phases_hash = {}
      client['projects'].find.no_cursor_timeout.each do |p|
        migrate_project p, projects_hash, areas_hash, topics_hash, phases_hash, groups_hash, superadmin_id, locales_mapping
      end
      idea_statuses_hash = {}
      phases_hash.each do |id, phase|
        idea_statuses_hash[id] = map_idea_status phase, idea_statuses_mapping
      end
      ideas_hash = {}
      client['posts'].find.no_cursor_timeout.each do |p|
        migrate_idea p, ideas_hash, users_hash, projects_hash, areas_hash, topics_hash, idea_statuses_hash, locales_mapping
      end
      comments_hash = {}
      # process comments by order of creation such that the parents can always be found
      client['comments'].find.no_cursor_timeout.map { |x| x }.sort { |c1,c2| c1.dig('createdAt') <=> c2.dig('createdAt') }.each do |c|
        migrate_comment c, comments_hash, users_hash, ideas_hash, locales_mapping
      end
      pages_hash = {}
      client['pages'].find.no_cursor_timeout.each do |p|
        migrate_page p, pages_hash, locales_mapping
      end
      if !@log.empty?
        puts 'Migrated with errors!'
        @log.each(&method(:puts))
        puts "There were #{@log.size} migration errors."
      else
        puts 'Migration succeeded!'
      end
    end
  end


  def connect(platform: nil, password: nil)
    if platform && password
      Mongo::Client.new("mongodb://lamppost.14.mongolayer.com:10323/#{platform}", auth_mech: :mongodb_cr, user: 'citizenlab', password: password)
    else
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    end
  end


  def map_multiloc(old_multiloc, locales_mapping)
    new_multiloc = {}
    old_multiloc.each do |old_lang, content|
      new_lang = locales_mapping[old_lang]
      if new_lang
        new_multiloc[new_lang] = content
      end
    end
    new_multiloc
  end

  def multiloc_maxlen(multiloc, maxlen)
    multiloc.each do |l, str|
      if str.size >= maxlen
        return {}
      end
    end
    multiloc
  end


  def create_topics_code_hash
    locale = Tenant.current.settings.dig('core', 'locales').first
    topics_code_hash = {}
    YAML.load_file(Rails.root.join('config', 'locales', "#{locale}.yml"))
        .dig(locale, 'topics').each do |code, title|
          unless code.end_with? '_description'
            topics_code_hash[code] = Topic.where({ title_multiloc: { locale => title } }).first
          end
        end
    topics_code_hash
  end


  def create_tenant platform, host, s, m, migration_settings, locales_mapping, keep_settings=nil
    fb_login = m.find({ service: 'facebook' }).first
    d = {
      core: {
        allowed: true,
        enabled: true,
        locales: (s['languages'] || [s['language']]).map{|l| locales_mapping[l]}.select{|l| l},
        organization_type: migration_settings['organization_type'],
        organization_name: map_multiloc(s['title_i18n'] || {}, locales_mapping),
        header_title: multiloc_maxlen(map_multiloc(s['tagline_i18n'] || {}, locales_mapping), 35),
        header_slogan: multiloc_maxlen(map_multiloc(s['description_i18n'] || {}, locales_mapping), 90),
        meta_title: map_multiloc(s['tagline_i18n'] || {}, locales_mapping),
        meta_description: map_multiloc(s['description_i18n']|| {}, locales_mapping),
        timezone: migration_settings['timezone'],
        color_main: s['accentColor']
      },
      demographic_fields: {
        allowed: true,
        enabled: true,
        gender: true,
        domicile: true,
        birthyear: true,
        education: true,
      },
      groups: {
        enabled: true,
        allowed:true
      },
      private_projects: {
        enabled: true,
        allowed: true
      }
    }
    if fb_login['appId'] && fb_login['secret']
      d[:facebook_login] = {
          allowed: true,
          enabled: true,
          app_id: fb_login['appId'],
          app_secret: fb_login['secret']
        }
    end
    Tenant.create!({
      name: platform,
      host: host,
      remote_logo_url: s['logoUrl'],
      remote_header_bg_url: migration_settings['tenant_bg'] || s['bannerImage'],
      settings: keep_settings || d
    })
  end


  def map_topic c, topics_hash, topics_mapping, topics_code_hash
    topic_codes = c['name_i18n'].values.map{ |t| topics_mapping[t] }.select{|t| t}
    unless topic_codes.empty?
      topics_hash[c['_id']] = topics_code_hash[topic_codes.first]
    end
  end


  def migrate_area n, areas_hash, locales_mapping
    begin
      if n['name_i18n']
        areas_hash[n['_id']] = Area.create!(title_multiloc: map_multiloc(n['name_i18n'], locales_mapping), 
                                            description_multiloc: map_multiloc((n['description_i18n'] || {}), locales_mapping))
      else
        @log.concat ["Area has no name #{n}"]
      end
    rescue Exception => e
      @log.concat [e.message]
    end
  end

  def migrate_group g, groups_hash, locales_mapping
    if g['builtInId'] == 'superadmin'
      return g['_id']
    end
    begin
      groups_hash[g['_id']] = Group.create!(title_multiloc: map_multiloc(g['name_i18n'], locales_mapping))
    rescue Exception => e
      @log.concat [e.message]
    end
    false
  end

  def migrate_user u, users_hash, groups_hash, superadmin_id, locales_mapping
    # one big transaction
    d = {cl1_migrated: true}
    # email
    if u.dig('telescope', 'email') || u['registered_emails'] || u['emails']
      d[:email] = u.dig('telescope', 'email') || (u['registered_emails'] || u['emails'])&.first['address']
    elsif u.dig('services', 'facebook', 'email')
      d[:email] = u.dig('services', 'facebook', 'email')
    end
    if !(d[:email] && d[:email].include?('@') && d[:email].include?('.'))
      @log.concat ["Couldn't find an email for user #{u.to_s}"]
      username = u.dig('profile', 'name') || u['username'] || u['_id']
      d[:email] = "hello+#{username.split('@').first}@citizenlab.co".delete ' '
    end
    # handle duplicate emails
    duplicate_user = User.find_by(email: d[:email])
    if duplicate_user
      @log.concat ["Duplicate email for user #{d[:email]}"]
      users_hash[u['_id']] = duplicate_user
      return
    end
    # first_name and last_name
    if u.dig('services', 'facebook', 'first_name') && u.dig('services', 'facebook', 'last_name')
      d[:first_name] = u.dig('services', 'facebook', 'first_name')
      d[:last_name] = u.dig('services', 'facebook', 'last_name')
    elsif u.dig('profile', 'name') || u['username']
      username = u.dig('profile', 'name') || u['username']
      name_pts = username.split
      if name_pts.size < 2
        name_pts = username.split '_'
      end
      if name_pts.size < 2
        name_pts = username.split '-'
      end
      if name_pts.size >= 2
        d[:first_name] = name_pts.first
        d[:last_name] = name_pts.drop(1).join ' '
      else
        d[:first_name] = name_pts.first
      end
    else
      d[:first_name] = d[:email].split('@').first
    end
    if !d[:last_name]
      @log.concat ["Couldn't determine a last name for user #{d}"]
    end
    # password
    if u.dig('services', 'password', 'bcrypt')
      d[:password_digest] = u.dig('services', 'password', 'bcrypt')
    elsif u.dig('services', 'facebook', 'id')
      d[:identities] = [Identity.create!(uid: u.dig('services', 'facebook', 'id'), provider: 'facebook')]
    else 
      @log.concat ["Couldn't find a password for user #{d}"]
      d[:password] = SecureRandom.urlsafe_base64 32
    end
    # locale
    d[:locale] = locales_mapping[u.dig('telescope', 'locale')]
    if !(d[:locale] && Tenant.current.settings.dig('core', 'locales').include?(d[:locale]))
      d[:locale] = Tenant.current.settings.dig('core', 'locales').first
      if locales_mapping[u.dig('telescope', 'locale')]
        @log.concat ["Couldn't keep the locale for user #{d[:first_name]} #{d[:last_name]}: #{locales_mapping[u.dig('telescope', 'locale')]} was replaced by #{d[:locale]}"]
      end
    end
    # admin
    if u['isAdmin']
      d[:roles] = [{type: 'admin'}]
    end
    # groups (and admin)
    if u['groups']
      if u['groups'].include? superadmin_id
        d[:roles] = [{type: 'admin'}]
      end
      groups = u['groups'].map{|g| groups_hash[g]}.select{|g| g}
      if groups
        d[:groups] = groups
      end
    end
    # gender
    if u.dig('telescope', 'gender')
      d[:gender] = u.dig('telescope', 'gender')
    end
    # domicile
    if u.dig('telescope', 'domicile')
      if u.dig('telescope', 'domicile') == 'extern'
        d[:domicile] = 'outside'
      else
        area = Area.all.select { |a| a.title_multiloc.values.include? u.dig('telescope', 'domicile') }.first
        if area
          d[:domicile] = area.id
        else
          @log.concat ["Couldn't find the area #{u.dig('telescope', 'domicile')}"]
        end
      end
    end
    # birthyear
    if u.dig('telescope', 'birthyear')
      d[:birthyear] = u.dig('telescope', 'birthyear')
    end
    # education
    if u.dig('telescope', 'education')
      d[:education] = u.dig('telescope', 'education')
    end
    # image
    if u.dig('profile', 'image')
      d[:avatar] = u.dig('profile', 'image')
    end
    # timestamps
    if u['createdAt']
      d[:created_at] = u['createdAt']
    end
    begin
      record = User.new d
      # slug
      if u.dig('telescope', 'slug')
        record.slug = SlugService.new.generate_slug(record,u.dig('telescope', 'slug'))
        d[:slug] = record.slug # for inclusion in logging
      end
      record.save!
      users_hash[u['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def smart_name_split str
    # when possible, the name is at the first occurence
    # of two adjacent consonants after a vowel, or at
    # the first occurance of a typical last name prefix
    i = 1
    while (i < str.size-1)
      if str[i+1..-1].start_with?('van') || str[i+1..-1].start_with?('de')
        return [str[0..i],str[i+1..-1]]
      end
      i += 1
    end
    vowels = ['a','e','i','o','u','y']
    i = 0
    while (i < str.size-2) && !vowels.include?(str[i])
      i += 1
    end
    while (i < str.size-1) && (vowels.include?(str[i]) || vowels.include?(str[i+1]))
      i +=1
    end
    if i < str.size-1
      return [str[0..i],str[i+1..-1]]
    end
    [str,str]
  end

  def migrate_project p, projects_hash, areas_hash, topics_hash, phases_hash, groups_hash, superadmin_id, locales_mapping
    d = {}
    # title
    if p.dig('title_i18n')
      d[:title_multiloc] = map_multiloc(p.dig('title_i18n'), locales_mapping)
    else
      @log.concat ["FATAL: Couldn't find a title for project #{p.to_s}"]
      return
    end
    # description
    if p.dig('description_i18n')
      d[:description_multiloc] = map_multiloc(p.dig('description_i18n'), locales_mapping)
    end
    # header bg image
    if p.dig('images')&.first&.dig('original')
      d[:remote_header_bg_url] = p.dig('images').first.dig('original')
    end
    # areas
    if p.dig('neighbourhoods')
      d[:areas] = p.dig('neighbourhoods').map { |nid| areas_hash[nid] }
    end
    # topics
    if p.dig('categories')
      d[:topics] = p.dig('categories').map { |cid| topics_hash[cid] }.select{|t| t}.uniq{|t| t.id}
    end
    # timestamps
    if p['createdAt']
      d[:created_at] = p['createdAt']
    end
    # permissions
    if p['permissions'] && !p['permissions'].blank?
      if p['permissions'].values.include? superadmin_id
        d[:visible_to] = 'admins'
      else
        d[:visible_to] = 'groups'
        d[:groups] = p['permissions'].values.uniq.flatten.map{|g| groups_hash[g]}.select{|g| g}
      end
    else
      d[:visible_to] = 'public'
    end
    begin
      record = Project.new d
      # slug
      if p['slug']
        record.slug = SlugService.new.generate_slug(record,p['slug'])
        d[:slug] = record.slug # for inclusion in logging
      end
      record.save!
      # images
      if p.dig('images')
        p.dig('images').each do |i|
          begin
            ProjectImage.create!(remote_image_url: i.dig('original'), project: record)
          rescue Exception => e
            @log.concat [e.message+' '+p.to_s]
          end
        end
      end
      # events
      if p.dig('timeline', 'events')
        p.dig('timeline', 'events').each do |e|
          migrate_event(e, record, locales_mapping)
        end
      end
      # phases
      if p.dig('timeline', 'phases')
        p.dig('timeline', 'phases').each do |f|
          migrate_phase(f, record, phases_hash, locales_mapping)
        end
      end
      projects_hash[p['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def migrate_event e, project, locales_mapping
    d = {}
    # project
    d[:project] = project
    # title
    if e.dig('title_i18n')
      d[:title_multiloc] = map_multiloc(e.dig('title_i18n'), locales_mapping)
    else
      @log.concat ["FATAL: Couldn't find the title for event #{e.to_s}"]
      return
    end
    # description
    if e.dig('description_i18n')
      d[:description_multiloc] = map_multiloc(e.dig('description_i18n'), locales_mapping)
    end
    # location
    if e.dig('location')
      d[:location_multiloc] = Hash[d[:title_multiloc].map{|k,_| [k,e.dig('location')] } ]
    end
    # start and end time
    if e['startAt'] && e['endAt']
      if e['startAt'] < e['endAt']
        d[:start_at] = e['startAt']
        d[:end_at] = e['endAt']
      elsif e['startAt'] > e['endAt']
        d[:end_at] = e['startAt']
        d[:start_at] = e['endAt']
      else
        d[:start_at] = e['startAt']
        d[:end_at] = d[:start_at] + rand(12).hours
      end
    end 
    begin
      Event.create! d
    rescue Exception => e
      @log.concat [e.message]
    end
  end

  def migrate_phase p, project, phases_hash, locales_mapping
    d = {consultation_method: 'ideation'}
    # project
    d[:project] = project
    # title
    if p.dig('title_i18n')
      d[:title_multiloc] = map_multiloc(p.dig('title_i18n'), locales_mapping)
    else
      @log.concat ["FATAL: Couldn't find the title for phase #{p.to_s}"]
      return
    end
    # description
    if p.dig('description_i18n')
      d[:description_multiloc] = map_multiloc(p.dig('description_i18n'), locales_mapping)
    end
    # start
    if p['startAt']
      d[:start_at] = p['startAt']
    else
      @log.concat ["Couldn't find the start date for phase #{p.to_s}"]
      d[:start_at] = Faker::Date.between(1.year.ago, 1.year.from_now)
    end
    # end
    if p['endAt'] && (d[:start_at] < p['endAt'])
      d[:end_at] = p['endAt']
    else
      @log.concat ["Couldn't find the end date for phase #{p.to_s}"]
      d[:end_at] = d[:start_at] + rand(12).hours
    end
    begin
      phases_hash[p['_id']] = Phase.create! d
    rescue Exception => e
      @log.concat [e.message]
    end
  end

  def map_idea_status p, idea_statuses_mapping
    code = 'proposed'
    p.title_multiloc.values.each do |t|
      if idea_statuses_mapping[t]
        code = idea_statuses_mapping[t]
      end
    end
    IdeaStatus.find_by!(code: code)
  end

  def migrate_idea p, ideas_hash, users_hash, projects_hash, areas_hash, topics_hash, idea_statuses_hash, locales_mapping
    d = {}
    # only migrate published ideas
    if (p['status'] || -1) == 2
      d[:publication_status] = 'published'
    else
      return
    end
    # title
    if p.dig('title_i18n')
      d[:title_multiloc] = map_multiloc(p.dig('title_i18n'), locales_mapping)
    else
      @log.concat ["FATAL: Couldn't find a title for idea #{p.to_s}"]
      return
    end
    # description
    if p.dig('htmlBody_i18n') || p.dig('body_i18n')
      d[:body_multiloc] = map_multiloc(p.dig('htmlBody_i18n') || md_to_html(p.dig('body_i18n')), locales_mapping)
    else
      @log.concat ["Couldn't find a body for idea #{p.to_s}"]
      d[:body_multiloc] = d[:title_multiloc]
    end
    # author
    if p.dig('userId') && users_hash[p.dig('userId')]
      d[:author] = users_hash[p.dig('userId')]
    else
      @log.concat ["Couldn't find the author for idea #{d[:title_multiloc]}"]
    end
    # idea status
    if p.dig('phases')&.last
      d[:idea_status] = idea_statuses_hash[ p.dig('phases').last['_id']]
    end
    IdeaStatus.find_by!(code: 'proposed')
    # project
    if p.dig('projectId')
      d[:project] = projects_hash[p.dig('projectId')]
    end
    # areas
    if p.dig('neighbourhoods')
      d[:areas] = p.dig('neighbourhoods').map { |nid| areas_hash[nid] }
    end
    # votes
    votes_d = []
    if p['upvoters']
      votes_d.concat p['upvoters'].map{ |u| {mode: 'up', user: users_hash[u]} }
    end
    if p['downvoters']
      votes_d.concat p['downvoters'].map{ |u| {mode: 'down', user: users_hash[u]} }
    end
    votes_d.select!{ |v| v[:user] }
    # topics
    if p.dig('categories')
      d[:topics] = p.dig('categories').map { |cid| topics_hash[cid] }.select{|t| t}.uniq{|t| t.id}
    end
    # timestamps
    if p['createdAt']
      d[:created_at] = p['createdAt']
      d[:published_at] = p['createdAt']
    end
    if p['postedAt']
      d[:published_at] = p['postedAt']
    end
    begin
      record = Idea.new d
      # slug
      if p['slug']
        record.slug = SlugService.new.generate_slug(record,p['slug'])
        d[:slug] = record.slug # for inclusion in logging
      end
      begin
        record.save!
      rescue Exception => e
        if (record.errors.keys.sort == [:author, :author_name].sort) && (record.errors.values.sort == [["can't be blank"], ["can't be blank"]].sort)
          record.save!(validate: false)
        else
          raise e
        end
      end
      # images
      if p.dig('images')
        p.dig('images').each do |i|
          begin
            if i.dig('original')
              IdeaImage.create!(remote_image_url: i.dig('original'), idea: record)
            end
          rescue Exception => e
            @log.concat [e.message+' '+p.to_s]
          end
        end
      end
      # votes
      votes_d.each do |v| 
        v[:votable] = record
        v[:created_at] = record.published_at
        if Vote.find_by(votable_id: record.id, user: v[:user])
          @log.concat ["User voted more than onces on votable: #{v}"]
        else
          Vote.create! v 
        end
      end
      ideas_hash[p['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def migrate_comment c, comments_hash, users_hash, ideas_hash, locales_mapping
    d = {}
    # body
    if c.dig('htmlBody_i18n')
      d[:body_multiloc] = map_multiloc(c.dig('htmlBody_i18n'), locales_mapping)
    else
      @log.concat ["FATAL: Couldn't find the body for comment #{c.to_s}"]
      return
    end
    # author
    if c.dig('userId') && users_hash[c.dig('userId')]
      d[:author] = users_hash[c.dig('userId')]
    else
      @log.concat ["FATAL: Couldn't find the author for comment #{c.to_s}"]
      return
    end
    # idea
    if c.dig('postId') && ideas_hash[c.dig('postId')] 
      d[:idea] = ideas_hash[c.dig('postId')]
    else
      @log.concat ["FATAL: Couldn't find the idea for comment #{c.to_s}"]
      return
    end
    # parent
    if c.dig('parentCommentId')
      if comments_hash[c.dig('parentCommentId')]
        d[:parent] = comments_hash[c.dig('parentCommentId')]
      else # Comments on lost comments are retained on the top level
        @log.concat ["Comment on lost comment is now a top level comment, for comment #{c.to_s}"]
      end
    end
    # votes
    votes_d = []
    if c['upvoters']
      votes_d.concat c['upvoters'].map{ |u| {mode: 'up', user: users_hash[u]} }
    end
    if c['downvoters']
      votes_d.concat c['downvoters'].map{ |u| {mode: 'down', user: users_hash[u]} }
    end
    votes_d.select!{ |v| v[:user] }
    # timestamps
    if c['createdAt']
      d[:created_at] = c['createdAt']
    end
    begin
      record = Comment.new d
      record.save!
      # votes
      votes_d.each { |v| v[:votable] = record; Vote.create!(v) }
      comments_hash[c['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def migrate_page p, pages_hash, locales_mapping
    d = {}
    # title
    if p.dig('title_i18n')
      d[:title_multiloc] = map_multiloc(p.dig('title_i18n'), locales_mapping)
    else
      @log.concat ["FATAL: Couldn't find a title for page #{p.to_s}"]
      return
    end
    # body
    if p.dig('content_i18n')
      d[:body_multiloc] = map_multiloc(p.dig('content_i18n'), locales_mapping)
    else
      @log.concat ["Couldn't find a body for page #{p.to_s}"]
      d[:body_multiloc] = d[:title_multiloc]
    end
    begin
      record = Page.new d
      # slug
      if p['slug']
        record.slug = SlugService.new.generate_slug(record,p['slug'])
        d[:slug] = record.slug # for inclusion in logging
      end
      record.save!
      pages_hash[p['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end


  def md_to_html(md)
    md && Redcarpet::Markdown.new(Redcarpet::Render::HTML.new).render(md)
  end

end
