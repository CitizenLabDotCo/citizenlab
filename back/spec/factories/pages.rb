FactoryBot.define do
  factory :page do
    title_multiloc {{
      "en" => Faker::Lorem.sentence,
      "nl-BE" => Faker::Lorem.sentence
    }}
    body_multiloc {{
      "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
      "nl-BE" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
    }}
    sequence(:slug) { |n| "#{Faker::Internet.slug.parameterize}-#{n}".gsub('_', '-') }

    navbar_item { build(:navbar_item, page: nil) }

    trait :skip_validation do
      to_create { |instance| instance.save(validate: false) }
    end

    trait :home do
      skip_validation

      slug { 'home' }
      body_multiloc { {} }
      navbar_item { build(:navbar_item, type: 'home', visible: true, position: 0) }
    end

    trait :projects do
      skip_validation

      slug { 'projects' }
      body_multiloc { {} }
      navbar_item { build(:navbar_item, type: 'projects', visible: true, position: 1) }
    end
  end
end
