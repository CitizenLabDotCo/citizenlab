module MachineTranslations
  class MachineTranslationPolicy < ApplicationPolicy

    def show?
      translatable_policy = case record.translatable_type
      when 'Idea' then IdeaPolicy
      when 'Comment' then "#{record.translatable.post_type}CommentPolicy".constantize
      else raise "#{record.translatable_type} has no voting policy defined"
      end
      translatable_policy.new(user, record.translatable).show?
    end

  end
end