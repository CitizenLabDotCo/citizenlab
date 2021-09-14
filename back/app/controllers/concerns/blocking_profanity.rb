module BlockingProfanity
  extend ActiveSupport::Concern

  class ProfanityBlockedError < StandardError
    attr_reader :blocked_words
    def initialize blocked_words
      super
      @blocked_words = blocked_words
    end
  end

  SUPPORTED_CLASS_ATTRS = {
    Comment.name => [:body_multiloc],
    Idea.name => [:title_multiloc, :body_multiloc, :location_description],
    Initiative.name => [:title_multiloc, :body_multiloc, :location_description]
  }.freeze

  included do
    rescue_from ProfanityBlockedError, with: :render_profanity_blocked
  end

  def verify_profanity object
    return if !AppConfiguration.instance.feature_activated? 'blocking_profanity'
    
    blocked_words = []
    service = ProfanityService.new
    attrs = SUPPORTED_CLASS_ATTRS[object.class.name]
    attrs&.each do |atr|
      next if object[atr].blank?
      values = if atr.to_s.ends_with? '_multiloc'
        object[atr]
      else
        { nil => object[atr] }
      end
      values.each do |locale, text|
        next if text.blank?
        service.search_blocked_words(text)&.each do |result|
          result[:locale] = locale if locale
          result[:attribute] = atr
          blocked_words.push result
        end
      end
    end
    raise ProfanityBlockedError.new(blocked_words) if blocked_words.present?
  end

  private

  def render_profanity_blocked exception
    render json: { errors: { base: [{ error: :includes_banned_words, blocked_words: exception.blocked_words }] } }, status: 422
  end
end