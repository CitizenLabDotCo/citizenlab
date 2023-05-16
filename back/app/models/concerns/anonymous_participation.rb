# frozen_string_literal: true

require 'active_support/concern'

module AnonymousParticipation
  extend ActiveSupport::Concern
  included do
    after_create :set_author_hash
    after_create :anonymize_author

    def anonymous?
      anonymous
    end

    private

    # TODO: Could the user hash be based only on the user id if not anonymous?
    # Then a non-anonymized post gets a consistent avatar across projects
    def set_author_hash
      # SHA-256 would be more secure, but is it really needed? Random UUID on the end is a salt
      self.author_hash = Digest::MD5.hexdigest(author_id + project_id + '84c168c4-a240-4f0a-8468-9e2cf714d4e1')
    end

    def anonymize_author
      self.author = nil if anonymous?
    end
  end
end
