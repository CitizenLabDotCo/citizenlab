# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Rails.application.eager_load!

# Since image optimization can be quite slow, we disable any carrierwave image
# processing while seeding. This massively speeds up the seeding process, at
# the expense of not having the proper image dimensions while developing.
CarrierWave.configure do |config|
  config.enable_processing = false
end

# Possible values: large, medium, small, generic, empty
SEED_SIZE = ENV.fetch('SEED_SIZE','medium')

num_users = 10
num_projects = 4
num_ideas = 5
case SEED_SIZE
  when 'small'
    num_users = 5
    num_projects = 1
    num_ideas = 4
  when 'medium'
    num_users = 20
    num_projects = 5
    num_ideas = 35
  when 'large'
    num_users = 50
    num_projects = 20
    num_ideas = 100
end


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

def generate_avatar
  i = rand(10)
  Rails.root.join("spec/fixtures/avatar#{i}.#{(i > 1) ? 'jpg' : 'png'}").open
end


if Apartment::Tenant.current == 'public' || 'example_org'

  
  t = Tenant.create({
    name: 'local',
    host: 'localhost',
    logo: Rails.root.join("spec/fixtures/logo.png").open,
    header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en','nl'],
        organization_type: %w(small medium large).include?(SEED_SIZE) ? "#{SEED_SIZE}_city" : "generic",
        organization_name: {
          "en" => Faker::Address.city,
          "nl" => Faker::Address.city,
          "fr" => Faker::Address.city
        },
        timezone: "Europe/Brussels",
        color_main: Faker::Color.hex_color,
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
      },
      surveys: {
       enabled: true,
       allowed: true,
      },
      maps: {
        enabled: true,
        allowed: true,
        tile_provider: "https://free.tilehosting.com/styles/positron/style.json?key=DIZiuhfkZEQ5EgsaTk6D",
        map_center: {
          lat: "50.8503",
          long: "4.3517"
        },
        zoom_level: 12
      },
      user_custom_fields: {
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
        organization_type: 'small_city',
        organization_name: {
          "en" => Faker::Address.city,
          "nl" => Faker::Address.city,
          "fr" => Faker::Address.city
        },
        timezone: "Europe/Brussels",
        color_main: Faker::Color.hex_color,
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

admin_koen = {
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
  birthyear: '1987',
  registration_completed_at: Time.now
}

if Apartment::Tenant.current == 'empty_localhost'
  TenantTemplateService.new.apply_template('base')
  
  User.create(admin_koen)
end

tenant_template = TenantTemplateService.new.available_templates
tenant_template = tenant_template.find{|t| t == Apartment::Tenant.current}

TenantTemplateService.new.apply_template('base') if tenant_template



if Apartment::Tenant.current == 'localhost'

  PublicApi::ApiClient.create(
    id: '42cb419a-b1f8-4600-8c4e-fd45cca4bfd9',
    secret: "Hx7C27lxV7Qszw-zCg9UT-GFRQuxJNffllTpeU262CGabllbyTYwOmpizCygtPIZSwg",
  )
  
  if SEED_SIZE != 'empty'
    custom_field = CustomField.create(
      resource_type: 'User',
      key: 'politician',
      input_type: 'select',
      title_multiloc: { 'en' => 'Are you a politician?' },
      description_multiloc: { 'en' => 'We use this to provide you with customized information'},
      required: false,
    )

    CustomFieldOption.create(custom_field: custom_field, key: 'active_politician', title_multiloc: {'en' => 'Active politician'})
    CustomFieldOption.create(custom_field: custom_field, key: 'retired_politician', title_multiloc: {'en' => 'Retired politician'})
    CustomFieldOption.create(custom_field: custom_field, key: 'no', title_multiloc: {'en' => 'No'})

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

    admin_koen[:domicile] = (rand(2) == 0 ? nil : Area.offset(rand(Area.count)).first.id)
    admin_koen[:custom_field_values] = ((rand(2) == 0) ? {} : {custom_field.key => CustomFieldOption.offset(rand(CustomFieldOption.count)).first.key})
  end

  TenantTemplateService.new.apply_template('base')
  User.create(admin_koen)

  if SEED_SIZE != 'empty'
    num_users.times do 
      first_name = Faker::Name.first_name
      last_name = Faker::Name.last_name
      has_last_name = (rand(5) > 0)
      User.create({
        first_name: first_name,
        last_name: has_last_name ? last_name : nil,
        cl1_migrated: !has_last_name,
        email: Faker::Internet.email,
        password: 'testtest',
        locale: ['en','nl'][rand(1)],
        roles: rand(10) == 0 ? [{type: 'admin'}] : [],
        gender: %w(male female unspecified)[rand(4)],
        birthyear: rand(2) === 0 ? nil : (1927 + rand(90)).to_s,
        education: rand(2) === 0 ? nil : rand(9).to_s,
        avatar: nil, # (rand(3) > 0) ? generate_avatar : nil,
        domicile: rand(2) == 0 ? nil : Area.offset(rand(Area.count)).first.id,
        custom_field_values: rand(2) == 0 ? {} : {custom_field.key => CustomFieldOption.offset(rand(CustomFieldOption.count)).first.key},
        registration_completed_at: Time.now
      })
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

    num_projects.times do
      project = Project.new({
        title_multiloc: {
          "en": Faker::Lorem.sentence,
          "nl": Faker::Lorem.sentence
        },
        description_multiloc: {
          "en" => "<p>Let's renew the parc at the city border and make it an enjoyable place for young and old.</p>",
          "nl" => "<p>Laten we het park op de grens van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>"
        },
        description_preview_multiloc: {
          "en" => "Let's renew the parc at the city border.",
          "nl" => "Laten we het park op de grend van de stad vernieuwen."
        },
        header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
        visible_to: %w(admins groups public public public)[rand(5)],
        presentation_mode: ['card', 'card', 'card', 'map', 'map'][rand(5)],
        process_type: ['timeline','timeline','timeline','timeline','continuous'][rand(5)],
        publication_status: ['published','published','published','published','published','draft','archived'][rand(7)]
      })

      if project.continuous?
        project.update({
          posting_enabled: rand(4) != 0,
          voting_enabled: rand(3) != 0,
          commenting_enabled: rand(4) != 0,
          voting_method: ['unlimited','unlimited','unlimited','limited'][rand(4)],
          voting_limited_max: rand(15),
        })
      end
      project.save
      [0,1,2,3,4][rand(5)].times do |i|
        project.project_images.create(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if rand(5) == 0
        project.project_files.create(file: Rails.root.join("spec/fixtures/afvalkalender.pdf").open)
      end

      start_at = Faker::Date.between(6.months.ago, 1.month.from_now)
      rand(8).times do
        start_at += 1.days
        phase = project.phases.create({
          title_multiloc: {
            "en": Faker::Lorem.sentence,
            "nl": Faker::Lorem.sentence
          },
          description_multiloc: {
            "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
            "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
          },
          start_at: start_at,
          end_at: (start_at += rand(150).days),
          participation_method: (rand(5) == 0) ? 'information' : 'ideation'
        })
        if phase.ideation?
          phase.update({
            posting_enabled: rand(4) != 0,
            voting_enabled: rand(3) != 0,
            commenting_enabled: rand(4) != 0,
            voting_method: ['unlimited','unlimited','unlimited','limited'][rand(4)],
            voting_limited_max: rand(15),
          })
        end
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
    MAP_OFFSET = 0.1

    num_ideas.times do 
      created_at = Faker::Date.between(1.year.ago, Time.now)
      project = Project.offset(rand(Project.count)).first
      idea = Idea.create({
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
        body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
        idea_status: IdeaStatus.offset(rand(IdeaStatus.count)).first,
        topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
        areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
        author: User.offset(rand(User.count)).first,
        project: project,
        phases: (project && project.timeline? && project.phases.sample(rand(project.phases.count)).select(&:ideation?)) || [],
        publication_status: 'published',
        published_at: Faker::Date.between(created_at, Time.now),
        created_at: created_at,
        location_point: rand(2) == 0 ? nil : "POINT(#{MAP_CENTER[0]+((rand()*2-1)*MAP_OFFSET)} #{MAP_CENTER[1]+((rand()*2-1)*MAP_OFFSET)})",
        location_description: rand(2) == 0 ? nil : Faker::Address.street_address
      })

      [0,0,1,1,2][rand(5)].times do |i|
        idea.idea_images.create(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if rand(5) == 0
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
        project: rand(2) == 0 ? Project.offset(rand(Project.count)).first : nil,
      })
    end

    3.times do
      Group.create({
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
        projects: Project.all.shuffle.take(rand(Project.count)),
        users: User.all.shuffle.take(rand(User.count))
      })
    end

    5.times do
      Invite.create(
        invitee: User.create(email: Faker::Internet.email, locale: 'en', invite_status: 'pending', first_name: Faker::Name.first_name, last_name: Faker::Name.last_name)
      )
    end
  end

end
