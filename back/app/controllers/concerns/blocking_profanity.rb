# frozen_string_literal: true

module BlockingProfanity
  extend ActiveSupport::Concern

  DEFAULT_CLASS_ATTRS = {
    Comment.name => [:body_multiloc],
    Idea.name => %i[title_multiloc body_multiloc location_description]
  }.freeze

  # Can be turned on in settings - extended_blocking = true
  EXTENDED_CLASS_ATTRS = {
    User.name => %i[first_name last_name bio_multiloc]
  }.freeze

  def verify_profanity(object)
    return unless AppConfiguration.instance.feature_activated? 'blocking_profanity'

    all_blocked_words = []
    service = ProfanityService.new
    attrs = DEFAULT_CLASS_ATTRS[object.class.name] || []
    attrs += EXTENDED_CLASS_ATTRS[object.class.name] || [] if AppConfiguration.instance.settings.dig('blocking_profanity', 'extended_blocking')
    attrs&.each do |atr|
      next if object[atr].blank?
      next unless object.attribute_changed?(atr.to_s)

      values = if atr.to_s.ends_with? '_multiloc'
        old_hash = object.attribute_was(atr.to_s) || {}
        new_hash = object[atr] || {}
        new_hash.reject { |locale, text| old_hash[locale] == text }
      else
        { nil => object[atr] }
      end
      values.each do |locale, text|
        next if text.blank?

        value_blocked_words = service.search_blocked_words(text)
        if value_blocked_words.present?
          value_blocked_words.each do |result|
            result[:locale] = locale if locale
            result[:attribute] = atr
            all_blocked_words.push result
          end
        end
      end
    end
    raise ApiError.new(:includes_banned_words, blocked_words: all_blocked_words) if all_blocked_words.present?
  end
end
