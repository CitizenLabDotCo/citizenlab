# frozen_string_literal: true

module UserRoles # rubocop:disable Metrics/ModuleLength
  extend ActiveSupport::Concern

  ROLES = %w[admin project_moderator project_folder_moderator space_moderator].freeze
  CITIZENLAB_MEMBER_REGEX_CONTENT = 'citizenlab\.(eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$'
  GOVOCAL_MEMBER_REGEX_CONTENT = 'govocal\.(com|eu|be|ch|de|nl|co|uk|us|cl|dk|pl)$'

  class << self
    def roles_json_schema
      _roles_json_schema.deep_dup.tap do |schema|
        # Remove the schemas for roles that are not enabled.
        schema['items']['oneOf'] = schema.dig('items', 'oneOf').select do |role_schema|
          role_name = role_schema.dig('properties', 'type', 'enum', 0)
          ROLES.include?(role_name)
        end
      end
    end

    # Returns (and memoize) the schema of all declared roles without restrictions.
    def _roles_json_schema
      @_roles_json_schema ||= JSON.parse(Rails.root.join('config/schemas/user_roles.json_schema').read)
    end
  end

  included do
    scope :admin, -> { where("roles @> '[{\"type\":\"admin\"}]'") }
    scope :not_admin, -> { where.not("roles @> '[{\"type\":\"admin\"}]'") }
    scope :normal_user, -> { where("roles = '[]'::jsonb") }
    scope :not_normal_user, -> { where.not("roles = '[]'::jsonb") }
    scope :project_moderator, lambda { |project_id = nil|
      if project_id
        where('roles @> ?', JSON.generate([{ type: 'project_moderator', project_id: project_id }]))
      else
        where("roles @> '[{\"type\":\"project_moderator\"}]'")
      end
    }

    scope :not_project_moderator, lambda { |project_id = nil|
      return where.not(id: project_moderator) if project_id.nil?

      where.not(id: project_moderator(project_id))
    }

    # This scope works as an AND filter.
    # So the user will only be included in the scope if they
    # have moderation rights for all the specified project folders.
    scope :project_folder_moderator, lambda { |*project_folder_ids|
      return where("roles @> '[{\"type\":\"project_folder_moderator\"}]'") if project_folder_ids.empty?

      query = project_folder_ids.map do |id|
        { type: 'project_folder_moderator', project_folder_id: id }
      end

      where('roles @> ?', JSON.generate(query))
    }

    scope :not_project_folder_moderator, lambda { |*project_folder_ids|
      where.not(id: project_folder_moderator(*project_folder_ids))
    }

    scope :space_moderator, lambda { |space_id = nil|
      if space_id
        where('roles @> ?', JSON.generate([{ type: 'space_moderator', space_id: space_id }]))
      else
        where("roles @> '[{\"type\":\"space_moderator\"}]'")
      end
    }

    scope :not_space_moderator, lambda { |space_id = nil|
      return where.not(id: space_moderator) if space_id.nil?

      where.not(id: space_moderator(space_id))
    }

    scope :project_reviewers, lambda { |project_reviewer = true|
      json_roles = [{ type: 'admin', project_reviewer: true }].to_json
      project_reviewer ? where('roles @> ?', json_roles) : where.not('roles @> ?', json_roles)
    }

    scope :moderator, -> { where(id: project_moderator).or(where(id: project_folder_moderator)).or(where(id: space_moderator)) }
    scope :not_moderator, -> { where.not(id: moderator) }
    scope :admin_or_moderator, -> { admin.or(moderator) }

    scope :can_moderate, lambda { |project_id = nil|
      if project_id
        project = Project.find(project_id)
        moderators = project_moderator(project.id)
        moderators = moderators.or(project_folder_moderator(project.folder_id)) if project.folder_id
        moderators = moderators.or(space_moderator(project.space_id)) if project.space_id
        admin.or(moderators)
      else
        admin_or_moderator
      end
    }

    scope :order_role, lambda { |direction = :asc|
      joins('LEFT OUTER JOIN (SELECT jsonb_array_elements(roles) as ro, id FROM users) as r ON users.id = r.id')
        .order(Arel.sql("(roles @> '[{\"type\":\"admin\"}]')::integer #{direction}"))
        .reverse_order
        .group('users.id')
    }

    # https://www.postgresql.org/docs/12/functions-matching.html#FUNCTIONS-POSIX-REGEXP
    scope :citizenlab_member, -> { where('email ~* ?', CITIZENLAB_MEMBER_REGEX_CONTENT).or(where('email ~* ?', GOVOCAL_MEMBER_REGEX_CONTENT)) }
    scope :not_citizenlab_member, lambda {
      where(
        'email IS NULL OR (email IS NOT NULL AND email !~* ? AND email !~* ?)',
        CITIZENLAB_MEMBER_REGEX_CONTENT,
        GOVOCAL_MEMBER_REGEX_CONTENT
      )
    }

    scope :billed_admins, -> { admin.not_citizenlab_member }
    scope :billed_moderators, -> { moderator.not_admin.not_citizenlab_member }

    scope :super_admins, -> { citizenlab_member.admin }
    scope :not_super_admins, -> { where.not(id: super_admins) }

    after_initialize do
      next unless has_attribute?('roles')

      @highest_role_after_initialize = highest_role
    end

    attr_reader :highest_role_after_initialize

    validates :roles, json: { schema: -> { UserRoles.roles_json_schema } }
  end

  def highest_role
    if super_admin?
      :super_admin
    elsif admin?
      :admin
    elsif space_moderator?
      :space_moderator
    elsif project_folder_moderator?
      :project_folder_moderator
    elsif project_moderator?
      :project_moderator
    else
      :user
    end
  end

  def super_admin?
    admin? && !!(email =~ Regexp.new(CITIZENLAB_MEMBER_REGEX_CONTENT, 'i') || email =~ Regexp.new(GOVOCAL_MEMBER_REGEX_CONTENT, 'i'))
  end

  def admin?
    roles.any? { |r| r['type'] == 'admin' }
  end

  def project_folder_moderator?(project_folder_id = nil)
    project_folder_id ? moderated_project_folder_ids.include?(project_folder_id) : moderated_project_folder_ids.present?
  end

  def project_moderator?(project_id = nil)
    project_id ? moderated_project_ids.include?(project_id) : moderated_project_ids.present?
  end

  def moderator?
    project_moderator? || project_folder_moderator? || space_moderator?
  end

  def space_moderator?(space_id = nil)
    space_id ? moderated_space_ids.include?(space_id) : moderated_space_ids.present?
  end

  def normal_user?
    highest_role == :user
  end

  # Returns an array of project IDs that the user, other than an admin, moderates,
  # either directly, through a folder, or through a space.
  # Admins can always moderate all projects, so this method is only relevant for non-admins.
  def moderatable_project_ids
    moderated_directly_ids = moderated_project_ids

    # Include ids of projects in folders the user moderates
    moderated_folder_project_ids = AdminPublication
      .joins(:parent)
      .where(parents_admin_publications: {
        publication_type: 'ProjectFolders::Folder',
        publication_id: moderated_project_folder_ids
      })
      .where(publication_type: 'Project')
      .pluck(:publication_id)

    # Include ids of projects in spaces the user moderates
    moderated_space_project_ids = Project.where(space_id: moderated_space_ids).pluck(:id)

    (moderated_directly_ids + moderated_folder_project_ids + moderated_space_project_ids).uniq
  end

  # Returns an array of folder IDs that the user, other than an admin, moderates,
  # either directly or through a space.
  # Admins can always moderate all folders, so this method is only relevant for non-admins.
  def moderatable_folder_ids
    # Include folders the user moderates directly
    moderated_directly_ids = moderated_project_folder_ids

    # Include folders in spaces the user moderates
    moderated_space_folder_ids = ProjectFolders::Folder.where(space_id: moderated_space_ids).pluck(:id)

    (moderated_directly_ids + moderated_space_folder_ids).uniq
  end

  def moderated_project_ids
    roles.select { |role| role['type'] == 'project_moderator' }.pluck('project_id').compact
  end

  def moderated_project_folder_ids
    roles.select { |role| role['type'] == 'project_folder_moderator' }.pluck('project_folder_id').compact
  end

  def moderated_space_ids
    roles.select { |role| role['type'] == 'space_moderator' }.pluck('space_id').compact
  end

  def add_role(type, options = {})
    roles << { 'type' => type.to_s }.merge(options.stringify_keys)
    roles.uniq!
    self
  end

  def delete_role(type, options = {})
    roles.delete({ 'type' => type.to_s }.merge(options.stringify_keys))
    self
  end
end
