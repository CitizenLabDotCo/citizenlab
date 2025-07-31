# frozen_string_literal: true

class ApplicationPolicy
  # Define patterns for class names that should be *excluded* from Pundit policy lookup.
  # This list will contain regex patterns for temporary or non-application models.
  # Placed at the top-level of ApplicationPolicy, so it's a class constant.
  EXCLUDED_POLICY_MODEL_NAME_PATTERNS = [
    # Pattern for Shoulda::Matchers temporary models (like 'Projecu')
    /^Shoulda::Matchers::ActiveRecord::Uniqueness::TestModels::/,
    /^AnonymousClass/, # Catches common forms of anonymous classes if their name method behaves this way
  ].freeze

  module Helpers
    def raise_not_authorized(reason)
      raise Pundit::NotAuthorizedErrorWithReason, reason: reason
    end

    private

    def policy_for(record)
      Pundit.policy!(user_context, record)
    end

    def scope_for(target_scope_or_klass)
      # 1. Basic check if it's a Class and an ActiveRecord descendant.
      is_a_potential_ar_model = target_scope_or_klass.is_a?(Class) &&
                                (target_scope_or_klass < ActiveRecord::Base || target_scope_or_klass < ApplicationRecord)

      if is_a_potential_ar_model
        # 2. Check against our EXCLUDED_POLICY_MODEL_NAME_PATTERNS.
        # This catches "Projecu" and similar temporary models.
        if EXCLUDED_POLICY_MODEL_NAME_PATTERNS.any? { |pattern| target_scope_or_klass.name.match?(pattern) }
          Rails.logger.debug "DEBUG: ApplicationPolicy::Helpers#scope_for: Skipping excluded temporary model by pattern: #{target_scope_or_klass.name.inspect}"
          return target_scope_or_klass.none # Return an empty ActiveRecord::Relation
        end

      # Handle cases where `target_scope_or_klass` is not a Class object
      # (e.g., it's already an ActiveRecord::Relation instance, which is fine)
      # Or if it's a Class but not an ActiveRecord descendant (e.g., a simple Ruby class that doesn't need policy scoping)
      elsif target_scope_or_klass.is_a?(Class) && target_scope_or_klass.name.blank?
        Rails.logger.debug "DEBUG: ApplicationPolicy::Helpers#scope_for: Skipping anonymous/blank-named class: #{target_scope_or_klass.inspect}"
        return [] # Return an empty array for anonymous classes
      end

      # If it passes all exclusion filters, assume it's a legitimate target for Pundit.
      Pundit.policy_scope!(user_context, target_scope_or_klass)
    end

    def can_moderate?
      user && UserRoleService.new.can_moderate?(record, user)
    end

    def admin?
      user&.admin?
    end

    def active_admin_or_moderator?
      active? && (admin? || user&.project_or_folder_moderator?)
    end

    def owner?
      user && record.user_id == user.id
    end

    def active?
      user&.active?
    end

    def active_admin?
      admin? && active?
    end
  end

  class UserContext
    attr_reader :user, :context

    def initialize(user, context = {})
      @user = user
      @context = context
    end
  end

  class Scope
    include Helpers

    attr_reader :scope, :user_context

    delegate :user, :context, to: :user_context

    def initialize(user_context, scope)
      @scope = scope
      @user_context = user_context.is_a?(UserContext) ? user_context : UserContext.new(user_context)
    end

    def resolve
      scope
    end
  end

  include Helpers

  attr_reader :record, :user_context

  delegate :context, :user, to: :user_context

  # @param [UserContext,User,nil] user_context
  def initialize(user_context, record)
    @record = record
    @user_context = user_context.is_a?(UserContext) ? user_context : UserContext.new(user_context)
  end

  def index?
    false
  end

  def show?
    scope.exists?(id: record.id)
  end

  def create?
    false
  end

  def update?
    false
  end

  def destroy?
    false
  end

  def scope
    Pundit.policy_scope!(user_context, record.class)
  end
end
