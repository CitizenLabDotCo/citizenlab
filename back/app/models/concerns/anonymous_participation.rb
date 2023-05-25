# frozen_string_literal: true

require 'active_support/concern'

module AnonymousParticipation
  extend ActiveSupport::Concern
  included do
    class << self
      def create_author_hash(author_id, project_id, anonymous)
        salt = anonymous ? "#{project_id}84c168c4-a240-4f0a-8468-9e2cf714d4e1" : '335b6eb2-9e7c-405c-9221-9b8919b64b8b'
        Digest::MD5.hexdigest(author_id + salt)
      end
    end

    before_validation :set_anonymous_values

    def anonymous?
      anonymous
    end

    private

    # Ensure author is always nil if anonymous is set and anonymous is false if author is present
    def set_anonymous_values
      set_author_hash if author_id_changed? || anonymous_changed?
      if anonymous_changed?(to: true)
        self.author = nil
      elsif author_id.present?
        self.anonymous = false
      end
    end

    def set_author_hash
      return if author_id.blank?

      self.author_hash = self.class.create_author_hash author_id, project_string, anonymous?
    end

    def project_string
      try(:project_id)
    end
  end
end
