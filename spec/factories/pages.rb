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
    slug { Faker::Internet.slug.parameterize }
  end
end
