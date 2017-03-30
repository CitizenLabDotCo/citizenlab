# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


Tenant.create({
  name: 'local',
  host: 'localhost',
  settings: {
    core: {
      allowed: true,
      enabled: true,
      locales: ['en','nl']
    }
  }
})

Apartment::Tenant.switch('localhost') do
  User.create({
    first_name: 'Koen',
    last_name: 'Gremmelprez',
    email: 'koen@citizenlab.co',
    password: 'testtest'
    })


  12.times do 
    Topic.create({
      title_multiloc: {
        "en": Faker::Lorem.word,
        "nl": Faker::Lorem.word
      },
      description_multiloc: {
        "en": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      }
    });
  end

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

  Lab.create({
    title_multiloc: {
      "en": "Renewing Westbrook parc",
      "nl": "Westbroek park vernieuwen"
    },
    description_multiloc: {
      "en" => "<p>Let's renew the parc at the city border and make it an enjoyable place for young and old.</p>",
      "nl" => "<p>Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>"
    }
  })

  40.times do 
    Idea.create({
      "title_multiloc": {
        "en": Faker::Lorem.sentence,
        "nl": Faker::Lorem.sentence
      },
      body_multiloc: {
        "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      },
      topics: rand(3).times.map{ Topic.offset(rand(Topic.count)).first },
      areas: rand(3).times.map{ Area.offset(rand(Area.count)).first },
      author: User.offset(rand(User.count)).first,
      lab: Lab.first,
      publication_status: 'published',
      images: [0,0,1,1,2][rand(5)].times.map{ Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
    })
  end

end
