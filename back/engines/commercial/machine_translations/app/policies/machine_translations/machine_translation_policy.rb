# frozen_string_literal: true

module MachineTranslations
  class MachineTranslationPolicy < ApplicationPolicy
    def show?
      translatable_policy = case record.translatable_type
      when 'Idea' then IdeaPolicy
      when 'Comment'then CommentPolicy
      else raise "#{record.translatable_type} has no known policy"
      end
      record.translatable && translatable_policy.new(user_context, record.translatable).show?
    end
  end
end
