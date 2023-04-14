# frozen_string_literal: true

module Surveys::SurveyParticipationContext
  extend ActiveSupport::Concern

  SURVEY_SERVICES = %w[
    typeform survey_monkey google_forms enalyzer survey_xact
    qualtrics microsoft_forms smart_survey snap_survey konveio
  ].freeze

  included do
    has_many :survey_responses, class_name: 'Surveys::Response', as: :participation_context, dependent: :destroy

    with_options if: :survey?, unless: :timeline_project? do
      validates :survey_embed_url, presence: true
      validates :survey_service, presence: true, inclusion: { in: SURVEY_SERVICES }
      validates :survey_embed_url, if: %i[survey? typeform?], format: {
        with: %r{\Ahttps://.*\.typeform\.com/to/.*\z},
        message: 'Not a valid Typeform embed URL'
      }
      validates :survey_embed_url, if: %i[survey? typeform?], format: {
        without: /\A.*\?*.email=.*\z/,
        message: 'Not a valid Typeform embed URL'
      }
      validates :survey_embed_url, if: %i[survey? survey_monkey?], format: {
        with: %r{\Ahttps://widget\.surveymonkey\.com/collect/website/js/.*\.js\z},
        message: 'Not a valid SurveyMonkey embed URL'
      }
      validates :survey_embed_url, if: %i[survey? google_forms?], format: {
        with: %r{\Ahttps://docs.google.com/forms/d/e/.*/viewform\?embedded=true\z},
        message: 'Not a valid Google Forms embed URL'
      }
      validates :survey_embed_url, if: %i[survey? enalyzer?], format: {
        with: %r{\Ahttps://surveys.enalyzer.com/?\?pid=.*\z},
        message: 'Not a valid Enalyzer embed'
      }
      validates :survey_embed_url, if: %i[survey? survey_xact?], format: {
        with: %r{\Ahttps://www\.survey-xact\.dk/LinkCollector\?key=.*\z},
        message: 'Not a valid Survey Xact embed'
      }
      validates :survey_embed_url, if: %i[survey? qualtrics?], format: {
        with: %r{\Ahttps://.*\.qualtrics\.com/jfe/form/.*\z},
        message: 'Not a valid Qualtrics survey embed'
      }
      validates :survey_embed_url, if: %i[survey? snap_survey?], format: {
        with: %r{\Ahttps://.*\.welcomesyourfeedback.net|snapsurveys.com/.*\z},
        message: 'Not a valid Snap Survey embed URL'
      }
      validates :survey_embed_url, if: %i[survey? smart_survey?], format: {
        with: %r{\Ahttps://www\.smartsurvey\.co\.uk/.*\z},
        message: 'Not a valid SmartSurvey survey embed'
      }
      validates :survey_embed_url, if: %i[survey? microsoft_forms?], format: {
        with: %r{\Ahttps://.*\.(microsoft|office)\.com/},
        message: 'Not a valid Microsoft Forms survey embed'
      }
      validates :survey_embed_url, if: %i[survey? konveio?], format: {
        with: %r{\Ahttps://.*\.konveio\.com/.*\z},
        message: 'Not a valid Konveio embed URL'
      }
      before_validation :strip_survey_embed_url
    end
  end

  def survey?
    participation_method == 'survey'
  end

  def typeform_form_id
    return unless survey? && typeform?

    URI(survey_embed_url).path.split('/').last
  end

  private

  def typeform?
    survey_service == 'typeform'
  end

  def survey_monkey?
    survey_service == 'survey_monkey'
  end

  def google_forms?
    survey_service == 'google_forms'
  end

  def enalyzer?
    survey_service == 'enalyzer'
  end

  def survey_xact?
    survey_service == 'survey_xact'
  end

  def qualtrics?
    survey_service == 'qualtrics'
  end

  def snap_survey?
    survey_service == 'snap_survey'
  end

  def microsoft_forms?
    survey_service == 'microsoft_forms'
  end

  def smart_survey?
    survey_service == 'smart_survey'
  end

  def konveio?
    survey_service == 'konveio'
  end

  def strip_survey_embed_url
    self.survey_embed_url = survey_embed_url&.strip
  end
end
