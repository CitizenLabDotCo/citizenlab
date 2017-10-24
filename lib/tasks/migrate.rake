require 'mongo'
require 'redcarpet'

# require "rails"

@log = []

namespace :migrate do
  desc "Migrating Data from a CL1 Platform to a CL2 Tenant"
  task from_cl1: :environment do
  	## NOTE: it is assumed that the desired tenant is already created and been switched 
  	# uri = Mongo::URI.new("mongodb://citizenlab:jhshEVweHWULVCA9x2nLuWL8@lamppost.15.mongolayer.com:10300,lamppost.14.mongolayer.com:10323/demo?replicaSet=set-56285eff675db1d28f0012d1")
  	# client = Mongo::Client.new(uri.servers, uri.options)
  	# client.login(uri.credentials)
    platform = 'beograd'
    password = '5nghbqbtkag0000000000'
    host = "#{platform}.localhost"
    Tenant.where(host: host)&.first&.destroy
    client = connect(platform: platform, password: password)
    create_tenant(platform, host, client['settings'].find.first, client['meteor_accounts_loginServiceConfiguration'])
    Apartment::Tenant.switch("#{platform}_localhost")
    TenantTemplateService.new.apply_template 'base'
    
    areas_hash = {}
    client['neighbourhoods'].find.each do |n|
      migrate_area n, areas_hash
    end
    users_hash = {}
  	client['users'].find.each do |u|
  		migrate_user(u, users_hash)
  	end
    topics_hash = {}
    # client['categories'].find.each do |c|
    #   migrate_topic(c, topics_hash)
    # end
    # TODO events
    # TODO phases
    projects_hash = {}
    client['projects'].find.each do |p|
      migrate_project(p, projects_hash, areas_hash, topics_hash)
    end
    ideas_hash = {}
    client['posts'].find.each do |p|
      migrate_ideas(p, ideas_hash, users_hash, projects_hash, areas_hash, topics_hash)
    end
    comments_hash = {}
    # process comments by order of creation such that the parents can always be found
    client['comments'].find.map { |x| x }.sort { |c1,c2| c1.dig('createdAt') <=> c2.dig('createdAt') }.each do |c|
      migrate_comments(c, comments_hash, users_hash, ideas_hash)
    end
    if !@log.empty?
      puts 'Migrated with errors!'
      @log.each(&method(:puts))
      puts "There were #{@log.size} migration errors."
    else
      puts 'Migration succeeded!'
    end
    byebug
  end


  def connect(platform: nil, password: nil)
    if platform && password
      # Mongo::Client.new('mongodb://lamppost.14.mongolayer.com:10323/demo', auth_mech: :mongodb_cr, user: 'citizenlab', password: 'jhshEVweHWULVCA9x2nLuWL8')
      Mongo::Client.new "mongodb://citizenlab:#{password}@lamppost.14.mongolayer.com:10323/#{platform}"
    else
      Mongo::Client.new 'mongodb://docker.for.mac.localhost:27017/schiedam'
    end
  end


  def create_tenant(platform, host, s, m)
    fb_login = m.find({ service: 'facebook' }).first
    Tenant.create({
      name: platform,
      host: host,
      remote_logo_url: s['logoUrl'],
      remote_header_bg_url: s['bannerImage'],
      settings: {
        core: {
          allowed: true,
          enabled: true,
          locales: s['languages'],
          organization_type: 'generic', ## TODO
          organization_name: s['title_i18n'],
          timezone: "Europe/Brussels", ## TODO
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
        facebook_login: {
          allowed: true,
          enabled: true,
          app_id: fb_login['appId'],
          app_secret: fb_login['secret']
        }
      }
    })
  end


  def migrate_area n, areas_hash
    begin
      areas_hash[n['_id']] = Area.create!(title_multiloc: n['name_i18n'], description_multiloc: n['description_i18n'])
    rescue Exception => e
      @log.concat [e.message]
    end
  end

  def migrate_user u, users_hash
    # one big transaction
    d = {}
    # email
    if u['telescope']['email'] || u['registered_emails'] || u['emails']
      d[:email] = u['telescope']['email'] || (u['registered_emails'] || u['emails'])&.first['address']
    elsif u.dig('services', 'facebook', 'email')
      d[:email] = u.dig('services', 'facebook', 'email')
    else
      @log.concat ["Couldn't find an email for user #{u.to_s}"]
      return
    end
    # first_name and last_name
    if u.dig('services', 'facebook', 'first_name') && u.dig('services', 'facebook', 'last_name')
      d[:first_name] = u.dig('services', 'facebook', 'first_name')
      d[:last_name] = u.dig('services', 'facebook', 'last_name')
    elsif u.dig('profile', 'name') || u['username'] ###
      name_pts = (u.dig('profile', 'name') || u['username']).split
      if name_pts.size < 2
        name_pts = u['username'].split '_'
      end
      if name_pts.size >= 2
        d[:first_name] = name_pts.first
        d[:last_name] = name_pts.drop(1).join ' '
      else
        d[:first_name] = u['username']
        d[:last_name] = 'Unknown' ###
      end
    else
      @log.concat ["Couldn't find a name for user #{u.to_s}"]
      return
    end
    # password
    d[:password] = 'testtest' ### TODO
    # locale
    d[:locale] = u['telescope']['locale'] || Tenant.current.settings.dig('core', 'locales').first
    # admin
    if u['isAdmin']
      d[:roles] = [{type: 'admin'}]
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

  def migrate_topic c, topics_hash
    begin
      topics_hash[c['_id']] = Topic.create!(title_multiloc: c['name_i18n'], description_multiloc: c['description_i18n'])
    rescue Exception => e
      @log.concat [e.message+' '+c.to_s]
    end
  end

  def migrate_project(p, projects_hash, areas_hash, topics_hash)
    d = {}
    # title
    if p.dig('title_i18n')
      d[:title_multiloc] = p.dig('title_i18n')
    else
      @log.concat ["Couldn't find a title for project #{p.to_s}"]
      return
    end
    # description
    if p.dig('description_i18n')
      d[:description_multiloc] = p.dig('description_i18n')
    else
      @log.concat ["Couldn't find a description for project #{p.to_s}"]
      return
    end
    # image
    if p.dig('images')&.first&.dig('original')
      d[:remote_header_bg_url] = p.dig('images').first.dig('original')
    end
    # areas
    if p.dig('neighbourhoods')
      d[:areas] = p.dig('neighbourhoods').map { |nid| areas_hash[nid] }
    end
    # topics
    # if p.dig('categories')
    #   d[:topics] = p.dig('categories').map { |cid| topics_hash[cid] }
    # end
    begin
      record = Project.new d
      # slug
      if p['slug']
        record.slug = SlugService.new.generate_slug(record,p['slug'])
        d[:slug] = record.slug # for inclusion in logging
      end
      record.save!
      projects_hash[p['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def migrate_ideas(p, ideas_hash, users_hash, projects_hash, areas_hash, topics_hash)
    d = {}
    # only migrate published ideas
    if (p['status'] || -1) == 2
      d[:publication_status] = 'published'
    else
      return
    end
    # title
    if p.dig('title_i18n')
      d[:title_multiloc] = p.dig('title_i18n')
    else
      @log.concat ["Couldn't find a title for idea #{p.to_s}"]
      return
    end
    # description
    if p.dig('htmlBody_i18n') || p.dig('body_i18n')
      d[:body_multiloc] = p.dig('htmlBody_i18n') || md_to_html(p.dig('body_i18n'))
    else
      @log.concat ["Couldn't find a body for idea #{p.to_s}"]
      return
    end
    # author
    if p.dig('userId')
      d[:author] = users_hash[p.dig('userId')]
    else
      @log.concat ["Couldn't find the author for idea #{p.to_s}"]
      return
    end
    # TODO idea status mapping
    d[:idea_status] = IdeaStatus.find_by!(code: 'proposed')
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
    # if p.dig('categories')
    #   d[:topics] = p.dig('categories').map { |cid| topics_hash[cid] }
    # end
    begin
      record = Idea.new d
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
            IdeaImage.create!(remote_image_url: i.dig('original'), idea: record)
          rescue Exception => e
            @log.concat [e.message+' '+p.to_s]
          end
        end
      end
      # votes
      votes_d.each { |v| v[:votable] = record; Vote.create!(v) }
      ideas_hash[p['_id']] = record
    rescue Exception => e
      @log.concat [e.message+' '+d.to_s]
    end
  end

  def migrate_comments(c, comments_hash, users_hash, ideas_hash)
    d = {}
    # body
    if c.dig('htmlBody_i18n')
      d[:body_multiloc] = c.dig('htmlBody_i18n')
    else
      @log.concat ["Couldn't find the body for comment #{c.to_s}"]
      return
    end
    # author
    if c.dig('userId') && users_hash[c.dig('userId')]
      d[:author] = users_hash[c.dig('userId')]
    else
      @log.concat ["Couldn't find the author for comment #{c.to_s}"]
      return
    end
    # idea
    if c.dig('postId') && ideas_hash[c.dig('postId')] 
      d[:idea] = ideas_hash[c.dig('postId')]
    else
      @log.concat ["Couldn't find the idea for comment #{c.to_s}"]
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


  def md_to_html(md)
    md && Redcarpet::Markdown.new(Redcarpet::Render::HTML.new).render(md)
  end

end
