# frozen_string_literal: true

module BlockingProfanity
  extend ActiveSupport::Concern

  class ProfanityBlockedError < StandardError
    attr_reader :violating_attributes, :blocked_words

    def initialize(violating_attributes, blocked_words)
      super()
      @violating_attributes = violating_attributes
      @blocked_words = blocked_words
    end
  end

  DEFAULT_CLASS_ATTRS = {
    Comment.name => [:body_multiloc],
    Idea.name => %i[title_multiloc body_multiloc location_description]
  }.freeze

  # Can be turned on in settings - extended_blocking = true
  EXTENDED_CLASS_ATTRS = {
    User.name => %i[first_name last_name bio_multiloc]
  }.freeze

  included do
    rescue_from ProfanityBlockedError, with: :render_profanity_blocked
  end

  def verify_profanity(object)
    return unless AppConfiguration.instance.feature_activated? 'blocking_profanity'

    all_blocked_words = []
    violating_attributes = []
    service = ProfanityService.new
    attrs = DEFAULT_CLASS_ATTRS[object.class.name] || []
    attrs += EXTENDED_CLASS_ATTRS[object.class.name] || [] if AppConfiguration.instance.settings.dig('blocking_profanity', 'extended_blocking')
    attrs&.each do |atr|
      next if object[atr].blank?

      values = if atr.to_s.ends_with? '_multiloc'
        object[atr]
      else
        { nil => object[atr] }
      end
      values.each do |locale, text|
        next if text.blank?

        value_blocked_words = service.search_blocked_words(text)
        if value_blocked_words.present?
          violating_attributes << atr

          value_blocked_words.each do |result|
            result[:locale] = locale if locale
            result[:attribute] = atr
            all_blocked_words.push result
          end
        end
      end
    end
    raise ProfanityBlockedError.new(violating_attributes, all_blocked_words) if violating_attributes.present?
  end

  private

  # renders errors in a custom format (opposed to the new HookForm format overridden in InitiativesController)
  def render_profanity_blocked(exception)
    render json: { errors: { base: [{ error: :includes_banned_words, blocked_words: exception.blocked_words }] } }, status: :unprocessable_entity
  end
end
