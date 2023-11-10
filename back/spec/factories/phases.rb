# frozen_string_literal: true

FactoryBot.define do
  factory :phase do
    project
    ideas_order { nil }
    input_term { nil }
    title_multiloc do
      {
        'en' => 'Idea phase',
        'nl-BE' => 'Ideeën fase'
      }
    end
    description_multiloc do
      {
        'en' => "<p>In this phase we gather ideas. Don't be shy, there are no stupid ideas!</p>",
        'nl-BE' => '<p>In deze fase verzamelen we ideeën. Wees niet verlegen, er zijn geen domme ideeën!</p>'
      }
    end
    participation_method { 'ideation' }
    start_at { '2017-05-01' }
    end_at { Date.parse(start_at) + 60.days }
    voting_min_total { 1 }
    voting_max_total { 10_000 }
    campaigns_settings { { project_phase_started: true } }

    transient do
      with_permissions { false }
    end

    after(:create) do |phase, evaluator|
      PermissionsService.new.update_permissions_for_scope(phase) if evaluator.with_permissions
    end

    factory :active_phase do
      after(:create) do |phase, _evaluator|
        phase.start_at = Time.now - 7.days
        phase.end_at = Time.now + 7.days
      end
    end

    factory :phase_sequence do
      transient do
        duration_in_days { 5 }
      end

      after(:build) do |phase, evaluator|
        phase.start_at = Time.now + ((evaluator.duration_in_days * Phase.count) + 1).days
        phase.end_at = Time.now + (evaluator.duration_in_days * (Phase.count + 1)).days
      end
    end

    factory :poll_phase do
      participation_method { 'poll' }
    end

    factory :typeform_survey_phase do
      participation_method { 'survey' }
      survey_service { 'typeform' }
      survey_embed_url { 'https://citizenlabco.typeform.com/to/HKGaPV?source=xxxxx' }
    end

    factory :google_survey_phase do
      participation_method { 'survey' }
      survey_service { 'google_forms' }
      survey_embed_url { 'https://docs.google.com/forms/d/e/fake/viewform?embedded=true' }
    end

    factory :enalyzer_survey_phase do
      participation_method { 'survey' }
      survey_service { 'enalyzer' }
      survey_embed_url { 'https://surveys.enalyzer.com?pid=HKGaPV' }
    end

    factory :volunteering_phase do
      participation_method { 'volunteering' }
    end

    factory :native_survey_phase do
      participation_method { 'native_survey' }
    end

    factory :single_voting_phase do
      participation_method { 'voting' }
      voting_method { 'single_voting' }
      voting_max_total { 10 }
    end

    factory :multiple_voting_phase do
      participation_method { 'voting' }
      voting_method { 'multiple_voting' }
      voting_max_total { 10 }
    end

    factory :budgeting_phase do
      participation_method { 'voting' }
      voting_method { 'budgeting' }
      voting_max_total { 1000 }
    end

    factory :information_phase do
      participation_method { 'information' }
    end

    factory :document_annotation_phase do
      participation_method { 'document_annotation' }
      document_annotation_embed_url { 'https://citizenlab.konveio.com/document-title' }
    end
  end
end
