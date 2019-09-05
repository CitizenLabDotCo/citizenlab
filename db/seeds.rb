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
num_initiatives = 4
case SEED_SIZE
  when 'small'
    num_users = 5
    num_projects = 1
    num_ideas = 4
    num_initiatives = 3
  when 'medium'
    num_users = 20
    num_projects = 5
    num_ideas = 35
    num_initiatives = 20
  when 'large'
    num_users = 50
    num_projects = 20
    num_ideas = 100
    num_initiatives = 60
end


def rand_instance scope
  scope.offset(rand(scope.size)).first
end

def create_comment_tree(post, parent, depth=0)
  amount = rand(5/(depth+1))
  amount.times do |i|
    c = Comment.create!({
      body_multiloc: {
        "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl-BE" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      },
      author: rand_instance(User.normal_user),
      post: post,
      parent: parent,
      created_at: Faker::Date.between((parent ? parent.created_at : post.published_at), Time.now)
    })
    User.all.each do |u|
      if rand(5) < 2
        Vote.create!(votable: c, user: u, mode: "up", created_at: Faker::Date.between(c.created_at, Time.now))
      end
    end
    create_comment_tree(post, c, depth+1)
  end
end

def create_for_some_locales
  translations = {}
  show_en = (rand(6) == 0)
  translations["en"] = yield if show_en
  translations["nl-BE"] = yield if rand(6) == 0 || !show_en
  translations
end

def generate_avatar gender
  i = rand(8) + 2
  if !%w(male female).include? gender
    gender = %w(male female)[rand(2)]
  end
  Rails.root.join("spec/fixtures/#{gender}_avatar_#{i}.jpg").open
end

def generate_file_attributes
  {
    name: Faker::File.file_name('', nil, ProjectFileUploader.new.extension_whitelist.shuffle.first, ''),
    file: Rails.root.join("spec/fixtures/afvalkalender.pdf").open
  }
end


if ['public','example_org'].include? Apartment::Tenant.current
  t = Tenant.create!({
    name: 'local',
    host: 'localhost',
    logo: Rails.root.join("spec/fixtures/logo.png").open,
    header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
    created_at: Faker::Date.between(Time.now - 1.year, Time.now),
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en','nl-BE'],
        organization_type: %w(small medium large).include?(SEED_SIZE) ? "#{SEED_SIZE}_city" : "generic",
        organization_name: {
          "en" => Faker::Address.city,
          "nl-BE" => Faker::Address.city,
          "fr-FR" => Faker::Address.city
        },
        lifecycle_stage: 'active',
        timezone: "Europe/Brussels",
        currency: CL2_SUPPORTED_CURRENCIES.shuffle.first,
        color_main: Faker::Color.hex_color,
        color_secondary: Faker::Color.hex_color,
        color_text: Faker::Color.hex_color,
      },
      password_login: {
        allowed: true,
        enabled: true,
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
        client_id: '898046778216-8hddufu4irag1bu1sfvsjjaah4i53fpf.apps.googleusercontent.com',
        client_secret: '-Kh_Hx325Pj02t1i50LHsRR6'
      },
      franceconnect_login: {
        allowed: true, 
        enabled: true,
        environment: 'integration',
        identifier: '0b8ba0f9a23f16bcbd86c783b2a41fd0cef0ea968e253734de71f641e0e66057',
        secret: '60ffb1156c02cda0b6ff0089e6ca4efc5d28dd6174a62c3a413640b899f0e3ae'
      },
      pages: {
        allowed: true, 
        enabled: true
      },
      groups: {
        enabled: true,
        allowed:true
      },
      ideas_overview: {
        enabled: true,
        allowed: true
      },
      manual_project_sorting: {
        enabled: true,
        allowed: true
      },
      private_projects: {
        enabled: true,
        allowed: true
      },
      maps: {
        enabled: true,
        allowed: true,
        tile_provider: "https://free.tilehosting.com/styles/positron/style.json?key=DIZiuhfkZEQ5EgsaTk6D",
        map_center: {
          lat: "50.8503",
          long: "4.3517"
        },
        zoom_level: 12,
        osm_relation_id: 2404021
      },
      excel_export: {
       enabled: true,
       allowed: true,
      },
      user_custom_fields: {
        enabled: true,
        allowed: true
      },
      widgets: {
        enabled: true,
        allowed: true
      },
      ideaflow_social_sharing: {
        enabled: true,
        allowed: true
      },
      manual_emailing: {
        enabled: true,
        allowed: true
      },
      automated_emailing_control: {
        enabled: true,
        allowed: true
      },
      granular_permissions: {
        enabled: true,
        allowed: true
      },
      participatory_budgeting: {
        enabled: true,
        allowed: true
      },
      machine_translations: {
        enabled: true,
        allowed: true
      },
      similar_ideas: {
        enabled: false,
        allowed: false
      },
      geographic_dashboard: {
        enabled: true,
        allowed: true
      },
      surveys: {
        enabled: true,
        allowed: true
      },
      typeform_surveys: {
        enabled: true,
        allowed: true
      },
      google_forms_surveys: {
        enabled: true,
        allowed: true
      },
      surveymonkey_surveys: {
        enabled: true,
        allowed: true
      },
      initiatives: {
        enabled: true,
        allowed: true,
        voting_threshold: 300,
        days_limit: 90,
        threshold_reached_message: MultilocService.new.i18n_to_multiloc(
          'initiatives.default_threshold_reached_message',
          locales: CL2_SUPPORTED_LOCALES
        ),
        eligibility_criteria: MultilocService.new.i18n_to_multiloc(
          'initiatives.default_eligibility_criteria',
          locales: CL2_SUPPORTED_LOCALES
        ),
        success_stories: [
          {
            "page_slug": "initiatives-success-1",
            "location": Faker::Address.city,
            "image_url": "https://www.quebecoriginal.com/en/listing/images/800x600/7fd3e9f7-aec9-4966-9751-bc0a1ab56127/parc-des-deux-rivieres-parc-des-deux-rivieres-en-ete.jpg",
          },
          {
            "page_slug": "initiatives-success-2",
            "location": Faker::Address.city,
            "image_url": "https://www.washingtonpost.com/resizer/I9IJifRLgy3uHVKcwZlvdjUBirc=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZQIB4NHDUMI6RKZMWMO42U6KNM.jpg",
          },
          {
            "page_slug": "initiatives-success-3",
            "location": Faker::Address.city,
            "image_url": "http://upthehillandthroughthewoods.files.wordpress.com/2012/12/1____image.jpg",
          }
        ]
      },
      polls: {
        enabled: true,
        allowed: true
      }
    }
  })

  Tenant.create!({
    name: 'empty',
    host: 'empty.localhost',
    logo: Rails.root.join("spec/fixtures/logo.png").open,
    header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
    created_at: Faker::Date.between(Time.now - 1.year, Time.now),
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en','nl-BE'],
        organization_type: 'small_city',
        organization_name: {
          "en" => Faker::Address.city,
          "nl-BE" => Faker::Address.city,
          "fr-FR" => Faker::Address.city
        },
        timezone: "Europe/Brussels",
        currency: CL2_SUPPORTED_CURRENCIES.shuffle.first,
        color_main: Faker::Color.hex_color,
        color_secondary: Faker::Color.hex_color,
        color_text: Faker::Color.hex_color,
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

admin = {
  email: 'admin@citizenlab.co',
  password: 'testtest',
  roles: [
    {type: "admin"},
  ]
}
moderator = {
  email: 'moderator@citizenlab.co',
  password: 'testtest',
  roles: []
}
user = {
  email: 'user@citizenlab.co',
  password: 'testtest',
  roles: []
}

if Apartment::Tenant.current == 'empty_localhost'
  TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
  SideFxTenantService.new.after_apply_template Tenant.current, nil
  User.create! AnonymizeUserService.new.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(admin)
end



if Apartment::Tenant.current == 'localhost'

  PublicApi::ApiClient.create!(
    id: '42cb419a-b1f8-4600-8c4e-fd45cca4bfd9',
    secret: "Hx7C27lxV7Qszw-zCg9UT-GFRQuxJNffllTpeU262CGabllbyTYwOmpizCygtPIZSwg",
  )
  
  custom_field = nil
  if SEED_SIZE != 'empty'
    custom_field = CustomField.create!(
      resource_type: 'User',
      key: 'politician',
      input_type: 'select',
      title_multiloc: { 'en' => 'Are you a politician?' },
      description_multiloc: { 'en' => 'We use this to provide you with customized information'},
      required: false,
    )

    CustomFieldOption.create!(custom_field: custom_field, key: 'active_politician', title_multiloc: {'en' => 'Active politician'})
    CustomFieldOption.create!(custom_field: custom_field, key: 'retired_politician', title_multiloc: {'en' => 'Retired politician'})
    CustomFieldOption.create!(custom_field: custom_field, key: 'no', title_multiloc: {'en' => 'No'})

    12.times do 
      Area.create!({
        title_multiloc: {
          "en": Faker::Address.city,
          "nl-BE": Faker::Address.city
        },
        description_multiloc: {
          "en": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
          "nl-BE": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
        }
      });
    end
  end

  TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
  SideFxTenantService.new.after_apply_template Tenant.current, nil
  User.create! AnonymizeUserService.new.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(admin)
  User.create! AnonymizeUserService.new.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(moderator)
  User.create! AnonymizeUserService.new.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(user)

  if SEED_SIZE != 'empty'
    num_users.times do
      User.create! AnonymizeUserService.new.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge({password: 'testtest'})
    end

    Area.create!({
      title_multiloc: {
        "en": "Westbrook",
        "nl-BE": "Westbroek"
      },
      description_multiloc: {
        "en": "<p>The place to be these days</p>",
        "nl-BE": "<p>Moet je geweest zijn</p>"
      }
    })

    num_projects.times do
      project = Project.new({
        title_multiloc: {
          "en": Faker::Lorem.sentence,
          "nl-BE": Faker::Lorem.sentence
        },
        description_multiloc: {
          "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
          "nl-BE" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
        },
        description_preview_multiloc: {
          "en" => "Let's renew the parc at the city border.",
          "nl-BE" => "Laten we het park op de grend van de stad vernieuwen."
        },
        header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
        visible_to: %w(admins groups public public public)[rand(5)],
        presentation_mode: ['card', 'card', 'card', 'map', 'map'][rand(5)],
        process_type: ['timeline','timeline','timeline','timeline','continuous'][rand(5)],
        publication_status: ['published','published','published','published','published','draft','archived'][rand(7)],
        areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first }
      })

      if project.continuous?
        project.update({
          posting_enabled: rand(4) != 0,
          voting_enabled: rand(3) != 0,
          commenting_enabled: rand(4) != 0,
          voting_method: ['unlimited','unlimited','unlimited','limited'][rand(4)],
          voting_limited_max: rand(15)+1,
        })
      end
      project.save!
      [0,1,2,3,4][rand(5)].times do |i|
        project.project_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if project.continuous? && rand(5) == 0
        (rand(3)+1).times do
          project.project_files.create!(generate_file_attributes)
        end
      end

      if project.timeline?
        start_at = Faker::Date.between(Tenant.current.created_at, 1.year.from_now)
        rand(8).times do
          start_at += 1.days
          phase = project.phases.create!({
            title_multiloc: {
              "en": Faker::Lorem.sentence,
              "nl-BE": Faker::Lorem.sentence
            },
            description_multiloc: {
              "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
              "nl-BE" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
            },
            start_at: start_at,
            end_at: (start_at += rand(150).days),
            participation_method: ['ideation','budgeting','poll','information', 'ideation', 'ideation'][rand(6)]
          })
          if rand(5) == 0
            (rand(3)+1).times do
              phase.phase_files.create!(generate_file_attributes)
            end
          end
          if phase.ideation?
            phase.update!({
              posting_enabled: rand(4) != 0,
              voting_enabled: rand(3) != 0,
              commenting_enabled: rand(4) != 0,
              voting_method: ['unlimited','unlimited','unlimited','limited'][rand(4)],
              voting_limited_max: rand(15)+1,
            })
          end
          if phase.budgeting?
            phase.update!({
              max_budget: (rand(1000000) + 100).round(-2)
            })
          end
          if phase.poll?
            rand(5).times do
              question = Polls::Question.create!(
                title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
                participation_context: phase
              )
              rand(5).times do
                Polls::Option.create!(
                  question: question,
                  title_multiloc: create_for_some_locales{Faker::Lorem.sentence}
                )
              end
            end
          end
        end
      end

      rand(5).times do
        start_at = Faker::Date.between(Tenant.current.created_at, 1.year.from_now)
        event = project.events.create!({
          title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
          description_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
          location_multiloc: create_for_some_locales{Faker::Address.street_address},
          start_at: start_at,
          end_at: start_at + rand(12).hours
        })
        if rand(5) == 0
          (rand(3)+1).times do
            event.event_files.create!(generate_file_attributes)
          end
        end
      end

      ([User.find_by(email: 'moderator@citizenlab.co')] + User.where.not(email: %w(admin@citizenlab.co user@citizenlab.co)).shuffle.take(rand(5))).each do |moderator|
        moderator.add_role 'project_moderator', project_id: project.id
        moderator.save!
       end

      if rand(5) == 0 
        project.default_assignee = rand_instance User.admin.or(User.project_moderator(project.id))
        project.save!
      end
    end


    MAP_CENTER = [50.8503, 4.3517]
    MAP_OFFSET = 0.1

    num_ideas.times do 
      created_at = Faker::Date.between(Tenant.current.created_at, Time.now)
      project = rand_instance Project.all
      phases = []
      if project && project.timeline?
        phases = project.phases.sample(rand(project.phases.size)).select do |phase| 
          phase.can_contain_ideas?
        end
      end
      idea = Idea.create!({
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence[0...80]},
        body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
        idea_status: rand_instance(IdeaStatus.all),
        topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
        areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
        author: rand_instance(User.all),
        project: project,
        phases: phases,
        publication_status: 'published',
        published_at: Faker::Date.between(created_at, Time.now),
        created_at: created_at,
        location_point: rand(3) == 0 ? nil : "POINT(#{MAP_CENTER[1]+((rand()*2-1)*MAP_OFFSET)} #{MAP_CENTER[0]+((rand()*2-1)*MAP_OFFSET)})",
        location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
        budget: rand(3) == 0 ? nil : (rand(10 ** (rand(3) + 2)) + 50).round(-1),
        assignee: rand(5) == 0 ? rand_instance(User.admin.or(User.project_moderator(project.id))) : nil
      })

      [0,0,1,1,2][rand(5)].times do |i|
        idea.idea_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if rand(5) == 0
        (rand(3)+1).times do
          idea.idea_files.create!(generate_file_attributes)
        end
      end

      User.all.each do |u|
        r = rand(5)
        if r == 0
          Vote.create!(votable: idea, user: u, mode: "down", created_at: Faker::Date.between(idea.published_at, Time.now))
        elsif 0 < r && r < 3
          Vote.create!(votable: idea, user: u, mode: "up", created_at: Faker::Date.between(idea.published_at, Time.now))
        end
      end

      rand(5).times do
        official_feedback = idea.official_feedbacks.create!(
          body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join}, 
          author_multiloc: create_for_some_locales{Faker::FunnyName.name},
          user: rand_instance(User.admin)
          )
      end

      create_comment_tree(idea, nil)
    end

    num_initiatives.times do 
      created_at = Faker::Date.between(Tenant.current.created_at, Time.now)
      initiative = Initiative.create!({
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence[0...80]},
        body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
        author: User.offset(rand(User.count)).first,
        publication_status: 'published',
        published_at: Faker::Date.between(created_at, Time.now),
        created_at: created_at,
        location_point: rand(3) == 0 ? nil : "POINT(#{MAP_CENTER[1]+((rand()*2-1)*MAP_OFFSET)} #{MAP_CENTER[0]+((rand()*2-1)*MAP_OFFSET)})",
        location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
        header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
        topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
        areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
        assignee: rand(5) == 0 ? User.admin.shuffle.first : nil,
        # TODO make initiative statuses correspond with required votes reached
        initiative_status: InitiativeStatus.offset(rand(InitiativeStatus.count)).first  
      })

      LogActivityJob.perform_later(initiative, 'created', initiative.author, initiative.created_at.to_i)

      [0,0,1,1,2][rand(5)].times do |i|
        initiative.initiative_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if rand(5) == 0
        (rand(3)+1).times do
          initiative.initiative_files.create!(generate_file_attributes)
        end
      end

      User.all.each do |u|
        r = rand(5)
        if r < 2
          Vote.create!(votable: initiative, user: u, mode: "up", created_at: Faker::Date.between(initiative.published_at, Time.now))
        end
      end

      rand(5).times do
        official_feedback = initiative.official_feedbacks.create!(
          body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join}, 
          author_multiloc: create_for_some_locales{Faker::FunnyName.name},
          user: User.admin.shuffle.first
          )
        LogActivityJob.perform_later(official_feedback, 'created', official_feedback.user, official_feedback.created_at.to_i)
      end

      create_comment_tree(initiative, nil)
    end

    Phase.where(participation_method: 'budgeting').each do |phase|
      User.all.shuffle.take(rand(20)+1).each do |user|
        chosen_ideas = phase.project.ideas.select{|i| i.budget}.shuffle.take(rand(10))
        Basket.create!({
          user: user,
          participation_context: phase,
          ideas: chosen_ideas
        })
      end
    end

    8.times do 
      Page.create!({
        title_multiloc:create_for_some_locales{Faker::Lorem.sentence},
        body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
        project: rand(2) == 0 ? rand_instance(Project.all) : nil,
      })
    end

    3.times do
      Group.create!({
        membership_type: 'manual',
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence},
        projects: Project.all.shuffle.take(rand(Project.count)),
        members: User.all.shuffle.take(rand(User.count))
      })
    end
    Group.create!({
      membership_type: 'rules',
        title_multiloc: create_for_some_locales{'Citizenlab Heroes'},
        rules: [
        {ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co'}
      ]
    })

    5.times do
      Invite.create!(
        invitee: User.create!(email: Faker::Internet.email, locale: 'en', invite_status: 'pending', first_name: Faker::Name.first_name, last_name: Faker::Name.last_name)
      )
    end

    Permission.all.shuffle.take(rand(10)+1).each do |permission|
      permitted_by = ['groups', 'admins_moderators'].shuffle.first
      permission.permitted_by = permitted_by
      if permitted_by == 'groups'
        permission.groups = Group.all.shuffle.take(rand(5))
      end
      permission.save!
    end
  end

end
