# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Rails.application.eager_load!

# Possible values: large, medium, small, generic, offline, got
SEED_SIZE = ENV.fetch("SEED_SIZE")

def create_comment_tree(idea, parent, depth=0)
  amount = rand(5/(depth+1))
  amount.times do |i|
    c = Comment.create({
      body_multiloc: {
        "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      },
      author: User.offset(rand(User.count)).first,
      idea: idea,
      parent: parent,
      created_at: Faker::Date.between((parent ? parent.created_at : idea.published_at), Time.now)
    })
    if c.author.first_name == 'Chewbacca'
      c.body_multiloc = {
        "en" => Faker::StarWars.wookie_sentence,
        "nl" => Faker::StarWars.wookie_sentence
      }
      c.save!
    end
    MakeNotificationsJob.perform_now(Activity.new(item: c, action: 'created', user: c.author, acted_at: Time.now))
    create_comment_tree(idea, c, depth+1)
  end
end

def create_for_some_locales
  translations = {}
  show_en = (rand(6) == 0)
  translations["en"] = yield if show_en
  translations["nl"] = yield if rand(6) == 0 || !show_en
  translations
end

if Apartment::Tenant.current == 'public' || 'example_org'
  t = Tenant.create({
    name: 'local',
    host: 'localhost',
    logo: Rails.root.join("spec/fixtures/logo.png").open,
    remote_header_bg_url: SEED_SIZE == 'offline' ? nil : "http://lorempixel.com/1900/600/city/#{rand(10)+1}/",
    # header_bg: SEED_SIZE == 'offline' ? Rails.root.join("spec/fixtures/header.jpg").open : nil,
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en','nl'],
        organization_type: case SEED_SIZE
        when 'large'
          'large_city'
        when 'medium' 
          'medium_city'
        when 'small' 
          'small_city'
        else
          'generic'
        end,
        organization_name: {
          "en" => (SEED_SIZE == 'got') ? Faker::GameOfThrones.city : Faker::Address.city,
          "nl" => (SEED_SIZE == 'got') ? Faker::GameOfThrones.city : Faker::Address.city,
          "fr" => (SEED_SIZE == 'got') ? Faker::GameOfThrones.city : Faker::Address.city
        },
        timezone: "Europe/Brussels",
        color_main: Faker::Color.hex_color,
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
        app_id: '307796929633098',
        app_secret: '28082a4c201d7cee136dbe35236e44cb'
      },
      google_login: {
        allowed: true,
        enabled: true,
        client_id: '692484441813-98clbuerpm01bonc06htv95mec0pu1d3.apps.googleusercontent.com',
        client_secret: 'ueqXBAfEy7j7D_2Ge8d16a6v'
      },
      # mydigipass_login: {
      #   allowed: true,
      #   enabled: true,
      #   client_id: 'a76piarjfjbvwnukobjdzz07d',
      #   client_secret: '65xg35xpa84p14cgntyg0279k',
      #   require_eid: false
      # },
      groups: {
        enabled: true,
        allowed:true
      },
      private_projects: {
        enabled: true,
        allowed: true
      }
    }
  })

  Tenant.create({
    name: 'empty',
    host: 'empty.localhost',
    logo: Rails.root.join("spec/fixtures/logo.png").open,
    header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en','nl'],
        organization_type: 'medium_city',
        organization_name: {
          "en" => Faker::Address.city,
          "nl" => Faker::Address.city,
          "fr" => Faker::Address.city
        },
        timezone: "Europe/Brussels",
        color_main: Faker::Color.hex_color,
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
        app_id: '307796929633098',
        app_secret: '28082a4c201d7cee136dbe35236e44cb'
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
  })
end


if Apartment::Tenant.current == 'empty_localhost'
  User.create({
    first_name: 'Koen',
    last_name: 'Gremmelprez',
    email: 'koen@citizenlab.co',
    password: 'testtest',
    locale: 'en',
    roles: [
      {type: "admin"},
    ],
    gender: "male",
    domicile: 'outside',
    birthyear: 1987,
    education: 7
  })

  TenantTemplateService.new.apply_template('base')
end

tenant_template = TenantTemplateService.new.available_templates
tenant_template = tenant_template.find{|t| t == Apartment::Tenant.current}

TenantTemplateService.new.apply_template('base') if tenant_template



if Apartment::Tenant.current == 'localhost'

  User.create({
    first_name: 'Koen',
    last_name: 'Gremmelprez',
    email: 'koen@citizenlab.co',
    password: 'testtest',
    locale: 'en',
    roles: [
      {type: "admin"},
    ],
    gender: "male",
    domicile: 'outside',
    birthyear: 1987,
    education: 7
  })

  # normal users
  case SEED_SIZE
    when 'large'
      50
    when 'medium' 
      10
    when 'small' 
      1
    when 'offline'
      0
    else
      3
    end.times do 
    User.create({
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      email: Faker::Internet.email,
      password: 'testtest',
      locale: ['en','nl'][rand(1)],
      roles: rand(10) == 0 ? [{type: 'admin'}] : [],
      gender: %w(male female unspecified)[rand(4)],
      birthyear: rand(2) === 0 ? nil : 1927 + rand(90),
      education: rand(1) === 0 ? nil : rand(9),
      remote_avatar_url: (rand(2) == 0) ? "http://lorempixel.com/100/100/people/#{rand(10)+1}/" : Faker::Avatar.image
    })
  end

  # without an avatar
  case SEED_SIZE
    when 'large'
      50
    when 'medium' 
      10
    when 'small' 
      1
    when 'offline'
      10
    else
      4
    end.times do 
    User.create({
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      email: Faker::Internet.email,
      password: 'testtest',
      locale: ['en','nl'][rand(1)],
      roles: rand(10) == 0 ? [{type: 'admin'}] : [],
      gender: %w(male female unspecified)[rand(4)],
      birthyear: rand(2) === 0 ? nil : 1927 + rand(90),
      education: rand(1) === 0 ? nil : rand(9)
    })
  end

  # without a last name
  User.create({
    first_name: "Chewbacca",
    cl1_migrated: true,
    email: Faker::Internet.email,
    password: 'testtest',
    locale: ['en','nl'][rand(1)],
    roles: rand(10) == 0 ? [{type: 'admin'}] : [],
    gender: %w(male female unspecified)[rand(4)],
    birthyear: rand(2) === 0 ? nil : 1927 + rand(90),
    education: rand(1) === 0 ? nil : rand(9),
    remote_avatar_url: (SEED_SIZE != 'offline') ? "https://sequelsprequels.files.wordpress.com/2014/04/abominablechewbacca-swt.jpg" : nil
  })

  TenantTemplateService.new.apply_template('base') #####

  12.times do 
    Area.create({
      title_multiloc: {
        "en": Faker::Address.city,
        "nl": Faker::Address.city
      },
      description_multiloc: {
        "en": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      }
    });
  end

  Area.create({
    title_multiloc: {
      "en": "Westbrook",
      "nl": "Westbroek"
    },
    description_multiloc: {
      "en": "<p>The place to be these days</p>",
      "nl": "<p>Moet je geweest zijn</p>"
    }
  })

  case SEED_SIZE
    when 'large'
      20
    when 'medium' 
      5
    when 'small' 
      1
    else
      4
  end.times do
    project = Project.create({
      title_multiloc: {
        "en": "Renewing Westbrook parc",
        "nl": "Westbroek park vernieuwen"
      },
      description_multiloc: {
        "en" => "<p>Let's renew the parc at the city border and make it an enjoyable place for young and old.</p>",
        "nl" => "<p>Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>"
      },
      header_bg: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
      visible_to: case rand(5)
      when 0
        'admins'
      when 1
        'groups'
      else
        'public'
      end
    })

    [0,1,2,3,4][rand(5)].times do |i|
      project.project_images.create(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
    end

    if rand(5) == 0
      project.project_files.create(file: Rails.root.join("spec/fixtures/afvalkalender.pdf").open)
    end

    start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
    rand(5).times do
      start_at += 1.days
      project.phases.create({
        title_multiloc: {
          "en": Faker::Lorem.sentence,
          "nl": Faker::Lorem.sentence
        },
        description_multiloc: {
          "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
          "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
        },
        start_at: start_at,
        end_at: (start_at += rand(120).days)
      })
    end
    rand(5).times do
      start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
      project.events.create({
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
        description_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
        location_multiloc: create_for_some_locales{Faker::Address.street_address},
        start_at: start_at,
        end_at: start_at + rand(12).hours
      })
    end
  end


  MAP_CENTER = [50.8503, 4.3517]
  MAP_OFFSET = 0.5

  case SEED_SIZE
    when 'large'
      100
    when 'medium' 
      35
    when 'small' 
      4
    else
      30
  end.times do 
    idea = Idea.create({
      title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
      body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
      idea_status: IdeaStatus.offset(rand(IdeaStatus.count)).first,
      topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
      areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
      author: User.offset(rand(User.count)).first,
      project: (rand(5) != 0) ? Project.offset(rand(Project.count)).first : nil,
      publication_status: 'published',
      published_at: Faker::Date.between(1.year.ago, Time.now),
      created_at: Faker::Date.between(1.year.ago, Time.now),
      location_point: rand(2) == 0 ? nil : "POINT(#{MAP_CENTER[0]+((rand()*2-1)*MAP_OFFSET)} #{MAP_CENTER[1]+((rand()*2-1)*MAP_OFFSET)})",
      location_description: rand(2) == 0 ? nil : Faker::Address.street_address
    })

    [0,0,1,1,2][rand(5)].times do |i|
      idea.idea_images.create(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
    end

    if rand(2) == 0
      idea.idea_files.create(file: Rails.root.join("spec/fixtures/afvalkalender.pdf").open)
    end

    User.all.each do |u|
      r = rand(5)
      if r == 0
        Vote.create(votable: idea, user: u, mode: "down", created_at: Faker::Date.between(idea.published_at, Time.now))
      elsif 0 < r && r < 3
        Vote.create(votable: idea, user: u, mode: "up", created_at: Faker::Date.between(idea.published_at, Time.now))
      end
    end

    create_comment_tree(idea, nil)
  end

  8.times do 
    Page.create({
      title_multiloc:create_for_some_locales{Faker::Lorem.sentence},
      body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
      project: rand(1) == 1 ? Project.offset(rand(Project.count)).first : nil,
    })
  end

  3.times do
    Group.create({
      title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
      projects: Project.all.shuffle.take(rand(Project.count)),
      users: User.all.shuffle.take(rand(User.count))
    })
  end

end
