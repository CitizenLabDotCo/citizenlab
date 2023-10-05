# frozen_string_literal: true

module SmartGroups::Rules
  class EventAttendance
    include ActiveModel::Validations
    include DescribableRule

    VALUELESS_PREDICATES = %w[attends_something attends_nothing].freeze
    SINGLEVALUE_PREDICATES = [].freeze
    MULTIVALUE_PREDICATES = %w[attends_some_of attends_none_of].freeze

    PREDICATE_VALUES = VALUELESS_PREDICATES + SINGLEVALUE_PREDICATES + MULTIVALUE_PREDICATES

    attr_accessor :predicate, :value

    validates :predicate, presence: true, inclusion: { in: PREDICATE_VALUES }
    validates :value, presence: true, if: :needs_value?
    validate :validate_value_inclusion

    class << self
      def to_json_schema
        [
          # Multivalue predicates (n-ary predicates)
          {
            type: 'object',
            'required' => %w[ruleType predicate value],
            'additionalProperties' => false,
            'properties' => {
              'ruleType' => {
                'type' => 'string',
                'enum' => [rule_type]
              },
              'predicate' => {
                type: 'string',
                enum: MULTIVALUE_PREDICATES
              },
              'value' => {
                'description' => 'A list of event identifiers',
                'type' => 'array',
                'items' => { 'type' => 'string' },
                'uniqueItems' => true,
                'minItems' => 1
              }
            }
          },
          # Valueless predicates (nullary predicates)
          {
            'type' => 'object',
            'required' => %w[ruleType predicate],
            'additionalProperties' => false,
            'properties' => {
              'ruleType' => {
                'type' => 'string',
                'enum' => [rule_type]
              },
              'predicate' => {
                'type' => 'string',
                'enum' => VALUELESS_PREDICATES
              }
            }
          }
        ]
      end

      def rule_type
        'event_attendances'
      end

      def from_json(json)
        new(json['predicate'], json['value'])
      end
    end

    # @param [String] predicate
    # @param [NilClass, Array<String>] value
    def initialize(predicate, value = nil)
      self.predicate = predicate
      self.value = value if value
    end

    # The queries depend on Events::Attendance models, which are not taken into account
    # when generating the cache key.
    def cachable_by_users_scope?
      false
    end

    # @param [User::ActiveRecord_Relation] users_scope
    # @return [User::ActiveRecord_Relation]
    def filter(users_scope)
      case predicate
      when 'attends_something'
        # `distinct` is needed because `associated` introduces duplicates when the user
        # is associated to multiple attendances.
        users_scope.where.associated(:event_attendances).distinct
      when 'attends_nothing'
        users_scope.where.missing(:event_attendances)
      when 'attends_some_of'
        attendees = Events::Attendance
          .where(event_id: value)
          .select(:attendee_id).distinct
        users_scope.where(id: attendees)
      when 'attends_none_of'
        attendees = Events::Attendance.where(event_id: value).select(:attendee_id)
        users_scope.where.not(id: attendees)
      else
        raise "Unexpected predicate for #{self.class}: #{predicate}"
      end
    end

    # @return [String] a human-readable description of the value
    def description_value(locale)
      event_ids = Array.wrap(value)

      Event
        .where(id: event_ids)
        .pluck(:id, :title_multiloc)
        # Ensure the titles are ordered in the same way as the event_ids
        .sort_by { |id, _| event_ids.index(id) }
        .map { |_, title_multiloc| multiloc_service.t(title_multiloc, locale: locale) }
        .join(', ')
    end

    private

    def valueless_predicate?
      predicate.in?(VALUELESS_PREDICATES)
    end

    def singlevalue_predicate?
      predicate.in?(SINGLEVALUE_PREDICATES)
    end

    def multivalue_predicate?
      predicate.in?(MULTIVALUE_PREDICATES)
    end

    def needs_value?
      singlevalue_predicate? || multivalue_predicate?
    end

    def validate_value_inclusion
      if valueless_predicate?
        errors.add(:value, 'must be blank') if value.present?

      elsif singlevalue_predicate?
        errors.add(:value, <<~MSG.chomp) unless Event.exists?(value)
          is not a valid event identifier
        MSG

      elsif multivalue_predicate?
        invalid_event_ids = value - Event.where(id: value).pluck(:id)
        errors.add(:value, <<~MSG.chomp) if invalid_event_ids.any?
          contains invalid event identifiers
        MSG
      end
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
