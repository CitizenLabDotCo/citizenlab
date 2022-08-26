# frozen_string_literal: true

require 'digest'

module SmartGroups::Rules
  # Concern that groups common behaviour for smart group rules, such as description and caching logic.
  module Rule
    extend ActiveSupport::Concern

    def description_multiloc
      MultilocService.new.block_to_multiloc do |locale|
        case predicate
        when 'is_empty'
          I18n.t!('smart_group_rules.is_empty', property: description_property(locale))
        when 'not_is_empty'
          I18n.t!('smart_group_rules.not_is_empty', property: description_property(locale))
        else
          begin
            I18n.t!(
              "smart_group_rules.#{description_rule_type}.#{predicate}_#{value}",
              property: description_property(locale)
            )
          rescue I18n::MissingTranslationData
            begin
              I18n.t!(
                "smart_group_rules.#{description_rule_type}.#{predicate}",
                property: description_property(locale),
                value: description_value(locale)
              )
            rescue I18n::MissingTranslationData
              raise "Unsupported rule description: smart_group_rules.#{description_rule_type}.#{predicate}{_#{value}}"
            end
          end
        end
      end
    end

    def description_value(_locale)
      value
    end

    def description_rule_type
      self.class.rule_type
    end

    def description_property(_locale)
      nil
    end

    def value
      nil
    end

    # Filters the users by the rules.
    # Saves the result in the Rails cache if #{cachable?} is true.
    # @return ActiveRecord::Relation
    def filter(users_scope)
      if cachable?
        member_ids = Rails.cache.fetch(cache_key) do
          query(::User).pluck(:id)
        end
        users_scope.where(id: member_ids)
      else
        query(users_scope)
      end
    end

    # The rule class that includes this concern must implement this method that executes the rule.
    # @return ActiveRecord::Relation
    def query(_users_scope)
      nil
    end

    # The rule class that includes this concern must override this to `true` if the query should be cached.
    # @return[Boolean] Returns true if the result is cached.
    # @see #{cache_key_fragment}
    def cachable?
      false
    end

    # The rule class that includes this concern should override this method if the SQL query should be cached.
    # It must return an array of strings that act as cache key fragments for Rails low level cache.
    # The cache key fragments must change whenever the cache becomes invalid.
    #
    # Example:
    # There is a rule that filters users by email in the `users` table. Such rule should invalidate
    # when:
    # - the `users` table changes (e.g. a user record has been updated)
    # - the predicate changes (e.g. `ends_on`)
    # - the value changes (e.g. `@example.com`)
    # The implementation can look like this:
    #   def cache_key_fragments
    #     [User.all.cache_key_with_version, predicate, value]
    #   end
    #
    #   def cachable?
    #     true
    #   end
    # @see https://guides.rubyonrails.org/caching_with_rails.html#low-level-caching
    # @return Array[<String,nil>]
    def cache_key_fragments
      []
    end

    # Calculates the digest of the cache key based on {#cache_key_fragments}
    # @return[String]
    # @raise [StandardError] Raises in case {#cache_key_fragments} is empty
    def cache_key
      raise "Cannot calculate cache key for rule #{self.class}, cache_key_fragments is empty" unless cache_key_fragments.any?

      Digest::SHA2.hexdigest(cache_key_fragments.join)
    end
  end
end
