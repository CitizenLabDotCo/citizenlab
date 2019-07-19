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
    c = Comment.create!({
      body_multiloc: {
        "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl-BE" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      },
      author: User.normal_user.offset(rand(User.normal_user.count)).first,
      idea: idea,
      parent: parent,
      created_at: Faker::Date.between((parent ? parent.created_at : idea.published_at), Time.now)
    })
    User.all.each do |u|
      if rand(5) < 2
        Vote.create!(votable: c, user: u, mode: "up", created_at: Faker::Date.between(c.created_at, Time.now))
      end
    end
    LogActivityJob.perform_later(c, 'created', c.author, c.created_at.to_i)
    MakeNotificationsJob.perform_now(Activity.new(item: c, action: 'created', user: c.author, acted_at: Time.now))
    create_comment_tree(idea, c, depth+1)
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
            "page_slug": "success_story_1",
            "location": Faker::Address.city,
            "image_url": "https://www.quebecoriginal.com/en/listing/images/800x600/7fd3e9f7-aec9-4966-9751-bc0a1ab56127/parc-des-deux-rivieres-parc-des-deux-rivieres-en-ete.jpg",
          },
          {
            "page_slug": "success_story_2",
            "location": Faker::Address.city,
            "image_url": "https://www.washingtonpost.com/resizer/I9IJifRLgy3uHVKcwZlvdjUBirc=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZQIB4NHDUMI6RKZMWMO42U6KNM.jpg",
          },
          {
            "page_slug": "success_story_3",
            "location": Faker::Address.city,
            "image_url": "http://upthehillandthroughthewoods.files.wordpress.com/2012/12/1____image.jpg",
          }
        ]
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
  birthyear: 1987,
  registration_completed_at: Time.now
}

if Apartment::Tenant.current == 'empty_localhost'
  TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
  SideFxTenantService.new.after_apply_template Tenant.current, nil
  User.create! admin_koen
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

    admin_koen[:domicile] = (rand(2) == 0 ? nil : Area.offset(rand(Area.count)).first.id)
    admin_koen[:custom_field_values] = ((rand(2) == 0) ? {} : {custom_field.key => CustomFieldOption.where(custom_field_id: custom_field.id).all.shuffle.first.key})
  end

  TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
  SideFxTenantService.new.after_apply_template Tenant.current, nil
  User.create! admin_koen

  if SEED_SIZE != 'empty'
    num_users.times do 
      gender = %w(male female unspecified)[rand(4)]
      first_name = case gender
      when 'male'
        Faker::Name.male_first_name
      when 'female'
        Faker::Name.female_first_name
      else
        Faker::Name.first_name
      end
      last_name = Faker::Name.last_name
      has_last_name = (rand(5) > 0)
      User.create!({
        first_name: first_name,
        last_name: has_last_name ? last_name : nil,
        cl1_migrated: !has_last_name,
        email: Faker::Internet.email,
        password: 'testtest',
        locale: ['en','nl-BE'][rand(1)],
        roles: rand(10) == 0 ? [{type: 'admin'}] : [],
        gender: gender,
        birthyear: rand(2) === 0 ? nil : (1935 + rand(70)),
        education: rand(2) === 0 ? nil : (rand(7)+2).to_s,
        avatar: (rand(3) == 0) ? generate_avatar(gender) : nil,
        domicile: rand(2) == 0 ? nil : Area.offset(rand(Area.count)).first.id,
        custom_field_values: rand(2) == 0 ? {} : {custom_field.key => CustomFieldOption.where(custom_field_id: custom_field.id).all.shuffle.first.key},
        registration_completed_at: Faker::Date.between(Tenant.current.created_at, Time.now)
      })
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
        has_budgeting_phase = false
        rand(8).times do
          participation_method = ['ideation', 'information', 'ideation', 'budgeting', 'ideation'].shuffle.first
          if participation_method == 'budgeting'
            if has_budgeting_phase
              participation_method = 'ideation'
            else
              has_budgeting_phase = true
            end
          end
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
            participation_method: (rand(5) == 0) ? 'information' : 'ideation'
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
              # currency: [Faker::Currency.name, Faker::Currency.code, Faker::Currency.symbol, 'cheeseburgers'].shuffle.first
            })
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

      User.all.shuffle.take(rand(5)).each do |moderator|
        moderator.add_role 'project_moderator', project_id: project.id
        moderator.save!
       end

      if rand(5) == 0 
        project.default_assignee = User.admin.or(User.project_moderator(project.id)).shuffle.first
        project.save!
      end
    end


    MAP_CENTER = [50.8503, 4.3517]
    MAP_OFFSET = 0.1

    num_ideas.times do 
      created_at = Faker::Date.between(Tenant.current.created_at, Time.now)
      project = Project.offset(rand(Project.count)).first
      phases = []
      if project && project.timeline?
        phases = project.phases.sample(rand(project.phases.count)).select do |phase| 
          phase.can_contain_ideas?
        end
      end
      idea = Idea.create!({
        title_multiloc: create_for_some_locales{Faker::Lorem.sentence[0...80]},
        body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
        idea_status: IdeaStatus.offset(rand(IdeaStatus.count)).first,
        topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
        areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
        author: User.offset(rand(User.count)).first,
        project: project,
        phases: phases,
        publication_status: 'published',
        published_at: Faker::Date.between(created_at, Time.now),
        created_at: created_at,
        location_point: rand(3) == 0 ? nil : "POINT(#{MAP_CENTER[1]+((rand()*2-1)*MAP_OFFSET)} #{MAP_CENTER[0]+((rand()*2-1)*MAP_OFFSET)})",
        location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
        budget: rand(3) == 0 ? nil : (rand(10 ** (rand(3) + 2)) + 50).round(-1),
        assignee: rand(5) == 0 ? User.admin.or(User.project_moderator(project.id)).shuffle.first : nil
      })

      LogActivityJob.perform_later(idea, 'created', idea.author, idea.created_at.to_i)

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
          user: User.admin.shuffle.first
          )
        LogActivityJob.perform_later(official_feedback, 'created', official_feedback.user, official_feedback.created_at.to_i)
      end

      create_comment_tree(idea, nil)
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
        project: rand(2) == 0 ? Project.offset(rand(Project.count)).first : nil,
      })
    end

    # success stories
    3.times do |i|
      Page.create!({
        title_multiloc:create_for_some_locales{Faker::Lorem.sentence},
        slug: "success_story_#{i+1}",
        body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
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
