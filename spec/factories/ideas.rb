FactoryGirl.define do
  factory :idea do
    title_multiloc {{
      "en" => "Plant more trees",
      "nl" => "Plant meer bomen"
    }}
    body_multiloc {{
      "en" => "<p>It would improve the air quality!</p>",
      "nl" => "<p>De luchtkwaliteit zou er gevoelig op vooruitgaan!</p>"
    }}
    publication_status "published"
    lab
    author
    # author nil
    # author_name "MyString"
    # images ""
    # files ""
  end
end
