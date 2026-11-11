# frozen_string_literal: true

module Surveys::SurveyPhase
  extend ActiveSupport::Concern

  SURVEY_SERVICES = %w[
    typeform survey_monkey google_forms enalyzer survey_xact
    qualtrics microsoft_forms smart_survey snap_survey
  ].freeze

  # One or more host labels followed by a dot, e.g. `forms.` or `eu.survey.`.
  # Unlike `.*\.`, it cannot match `/`, `@`, `?` or `:`, so the allowed domain
  # has to be the actual host and not, for example, part of the path.
  SUBDOMAINS = '([\w-]+\.)+'

  included do
    has_many :survey_responses, class_name: 'Surveys::Response', dependent: :destroy

    with_options if: :survey? do
      validates :survey_embed_url, presence: true
      validate :survey_embed_url_must_be_https_url
      validates :survey_service, presence: true, inclusion: { in: SURVEY_SERVICES }
      validates :survey_embed_url, if: %i[survey? typeform?], format: {
        with: %r{\Ahttps://#{SUBDOMAINS}typeform\.com/to/.*\z}o,
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
        with: %r{\Ahttps://docs\.google\.com/forms/d/e/.*/viewform\?embedded=true\z},
        message: 'Not a valid Google Forms embed URL'
      }
      validates :survey_embed_url, if: %i[survey? enalyzer?], format: {
        with: %r{\Ahttps://surveys\.enalyzer\.com/?\?pid=.*\z},
        message: 'Not a valid Enalyzer embed'
      }
      validates :survey_embed_url, if: %i[survey? survey_xact?], format: {
        with: %r{\Ahttps://www\.survey-xact\.dk/LinkCollector\?key=.*\z},
        message: 'Not a valid Survey Xact embed'
      }
      validates :survey_embed_url, if: %i[survey? qualtrics?], format: {
        with: %r{\Ahttps://#{SUBDOMAINS}qualtrics\.com/jfe/form/.*\z}o,
        message: 'Not a valid Qualtrics survey embed'
      }
      validates :survey_embed_url, if: %i[survey? snap_survey?], format: {
        with: %r{\Ahttps://(#{SUBDOMAINS}welcomesyourfeedback\.net|(#{SUBDOMAINS})?snapsurveys\.com)([/?#].*)?\z}o,
        message: 'Not a valid Snap Survey embed URL'
      }
      validates :survey_embed_url, if: %i[survey? smart_survey?], format: {
        with: %r{\Ahttps://www\.smartsurvey\.co\.uk/.*\z},
        message: 'Not a valid SmartSurvey survey embed'
      }
      validates :survey_embed_url, if: %i[survey? microsoft_forms?], format: {
        with: %r{\Ahttps://#{SUBDOMAINS}(microsoft\.com|office\.com|cloud\.microsoft)/.*\z}o,
        message: 'Not a valid Microsoft Forms survey embed'
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

  # Second line of defence next to the per-service formats: the URL ends up
  # as an iframe (or script) src, so it must be a well-formed https URL with a
  # host. This rejects e.g. `javascript:` URLs even if a format regex is wrong.
  def survey_embed_url_must_be_https_url
    return if survey_embed_url.blank?

    uri = URI.parse(survey_embed_url)
    return if uri.is_a?(URI::HTTPS) && uri.host.present? && uri.userinfo.nil?

    errors.add(:survey_embed_url, :invalid, message: 'Not a valid https URL')
  rescue URI::InvalidURIError
    errors.add(:survey_embed_url, :invalid, message: 'Not a valid https URL')
  end

  def strip_survey_embed_url
    self.survey_embed_url = survey_embed_url&.strip
  end
end
