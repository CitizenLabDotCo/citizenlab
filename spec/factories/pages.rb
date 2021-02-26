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
  end
end
