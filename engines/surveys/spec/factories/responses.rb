FactoryBot.define do
  factory :survey_response, class: 'Surveys::Response' do
    association :participation_context, factory: :continuous_survey_project
    survey_service { "typeform" }
    external_survey_id { "ABCDE12" }
    external_response_id { "a3a12ec67a1365927098a606107fac15" }
    started_at { "2019-01-27 08:30" }
    submitted_at { "2019-01-27 08:31" }
    answers {[
      {
        "question_id" => "DlXFaesGBpoF",
        "question_text" => "Thanks, {{answer_60906475}}! What's it like where you live? Tell us in a few sentences.",
        "value" => "It's cold right now! I live in an older medium-sized city with a university. Geographically, the area is hilly."
      },
      {
        "question_id" => "SMEUb7VJz92Q",
        "question_text" => "If you're OK with our city management following up if they have further questions, please give us your email address.",
        "value" => "laura@example.com"
      }
    ]}
  end
end