# frozen_string_literal: true

module CustomIdMethods::Magda
  # Turns a GeefPersoonResult into one of the RRN result codes that the ACM id
  # method stores in its result custom field:
  #
  #   valid              postcode is eligible and the person is old enough
  #   lives_outside      postcode is not in the eligible list
  #   under_minimum_age  eligible postcode, but younger than `minimum_age`
  #   no_match           MAGDA knows no person for this INSZ
  #   service_error      MAGDA could not be reached or answered with an error
  #
  # An empty postal code list means "no postcode restriction"; a blank minimum
  # age means "no age restriction". A missing birth date with a configured
  # minimum age is reported as `service_error`, not as `valid`.
  class ResidencyCheck
    RESULTS = %w[valid lives_outside under_minimum_age no_match service_error].freeze

    def self.call(result, postal_codes:, minimum_age: nil, today: Date.current)
      new(postal_codes:, minimum_age:, today:).call(result)
    end

    def initialize(postal_codes:, minimum_age: nil, today: Date.current)
      @postal_codes = Array(postal_codes).filter_map { |code| normalize(code) }
      @minimum_age = minimum_age.presence&.to_i
      @today = today
    end

    def call(result)
      # `not_registered` after the automatic repertorium registration means the
      # registration itself failed: a service problem, not a statement about the person.
      return 'service_error' if result.error? || result.not_registered?
      return 'no_match' if result.not_found?
      return 'lives_outside' unless eligible_postal_code?(result.postal_code)

      if @minimum_age
        birth_date = result.birth_date
        return 'service_error' unless birth_date
        return 'under_minimum_age' if age_on(birth_date) < @minimum_age
      end

      'valid'
    end

    private

    def eligible_postal_code?(postal_code)
      return true if @postal_codes.empty?

      @postal_codes.include?(normalize(postal_code))
    end

    def normalize(postal_code)
      postal_code.to_s.gsub(/\s+/, '').presence
    end

    def age_on(birth_date)
      age = @today.year - birth_date.year
      birthday_still_to_come = (@today.month < birth_date.month) ||
                               (@today.month == birth_date.month && @today.day < birth_date.day)
      birthday_still_to_come ? age - 1 : age
    end
  end
end
