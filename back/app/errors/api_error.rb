# frozen_string_literal: true

class ApiError < StandardError
  attr_reader :status, :payload

  # Simple usage:      raise ApiError, :anonymous_participation_not_allowed
  # With status:       raise ApiError.new(:token_not_found, status: 401)
  # With field:        raise ApiError.new(:invalid_code, field: :code, value: 'proposed')
  # With extra data:   raise ApiError.new(:includes_banned_words, blocked_words: [...])
  # Validation errors: raise ApiError.from_record(record)
  def initialize(error_key, status: 422, field: :base, payload: nil, **details)
    super(error_key.to_s)
    @status = status
    if payload
      @payload = payload
    else
      error_hash = { error: error_key }
      error_hash.merge!(details) if details.any?
      @payload = { errors: { field => [error_hash] } }
    end
  end

  def self.from_record(record, status: 422)
    new(:validation_failed, status: status, payload: { errors: record.errors.details })
  end
end
