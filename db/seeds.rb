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
    name: 'Koen Gremmelprez',
    email: 'koen@citizenlab.co',
    password: 'testtest'
    })

  Topic.create({
    title_multiloc: {
      "en": "Health",
      "nl": "Gezondheid"
    },
    description_multiloc: {
      "en": "<p>Age expectations and so on...</p>",
      "nl": "<p>Levensverwachting enzovoort</p>"
    }
  });

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

  Idea.create({
    "title_multiloc": {
      "en": "Dance sessions in the park",
      "nl": "Dansen in het park"
    },
    body_multiloc: {
      "en" => "<p>Let's dance.</p>",
      "nl" => "<p>Dansen yihaa!</p>"
    },
    topics: [Topic.first],
    areas: [Area.first],
    author: User.first,
    lab: Lab.first,
    publication_status: 'published'
  })

end
