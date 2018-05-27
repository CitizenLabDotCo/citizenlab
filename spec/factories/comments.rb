FactoryBot.define do
  factory :comment do
    author
    idea
    parent nil
    publication_status 'published'
    body_multiloc {{
      "en" => "<p>I think this is a very good idea!</p>",
      "nl-BE" => "<p>Geweldig idee!</p>"
    }}
  end

  factory :nested_comment do
    author
    idea
    parent :comment
    publication_status 'published'
    body_multiloc {{
      "en" => "<p>After some more thinking, there are some issues actually ...!</p>",
      "nl-BE" => "<p>Na een nachtje slapen moet ik toegeven dat er toch nog wel problemen mee zijn</p>"
    }}
  end
end
