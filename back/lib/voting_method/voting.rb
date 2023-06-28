# frozen_string_literal: true

module VotingMethod
  class Voting < Base
    def initialize(participation_context)
      # Set the default voting term for the context
      if participation_context.voting_term_singular_multiloc.blank? && participation_context.voting_term_plural_multiloc.blank?
        participation_context.voting_term_singular_multiloc = CL2_SUPPORTED_LOCALES.index_with do |locale|
          I18n.t('voting_method.default_voting_term_singular', locale: locale)
        end
        participation_context.voting_term_plural_multiloc = CL2_SUPPORTED_LOCALES.index_with do |locale|
          I18n.t('voting_method.default_voting_term_plural', locale: locale)
        end
      end
      super
    end

    def validate
      if participation_context.voting_term_singular_multiloc.blank? && participation_context.voting_term_plural_multiloc.present?
        participation_context.errors.add :voting_term_singular_multiloc, :blank, message: 'singular voting term must be present with a plural voting term'
      end
      if participation_context.voting_term_singular_multiloc.present? && participation_context.voting_term_plural_multiloc.blank?
        participation_context.errors.add :voting_term_plural_multiloc, :blank, message: 'plural voting term must be present with a singular voting term'
      end
      if participation_context.voting_max_total.blank?
        participation_context.errors.add :voting_max_total, :blank, message: 'voting max total is blank'
      end
    end
  end
end
