FactoryBot.define do
  factory :initiative do
    title_multiloc {{
      "en" => "Install water turbines on kanals",
      "nl-BE" => "Waterturbines op kanalen installeren"
    }}
    body_multiloc {{
      "en" => "<p>Surely we'll gain huge amounts of green energy from this!</p>",
      "nl-BE" => "<p>Hier zullen we vast wel hopen groene energie uit halen!</p>"
    }}
    sequence(:slug) {|n| "turbines-on-kanals-#{n}"}
    publication_status { "published" }
    author
  end
end
