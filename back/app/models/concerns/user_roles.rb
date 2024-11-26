# frozen_string_literal: true

module UserRoles # rubocop:disable Metrics/ModuleLength
  extend ActiveSupport::Concern

  ROLES = %w[admin project_moderator project_folder_moderator].freeze
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

      project = Project.find(project_id)
      if project.folder
        where.not(id: project_moderator(project_id)).and(where(id: not_project_folder_moderator(project.folder.id)))
      else
        where.not(id: project_moderator(project_id))
      end
    }

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

    scope :project_reviewers, lambda { |project_reviewer = true|
      json_roles = [{ type: 'admin', project_reviewer: true }].to_json
      project_reviewer ? where('roles @> ?', json_roles) : where.not('roles @> ?', json_roles)
    }

    scope :admin_or_moderator, -> { where(id: admin).or(where(id: project_moderator)).or(where(id: project_folder_moderator)) }

    scope :order_role, lambda { |direction = :asc|
      joins('LEFT OUTER JOIN (SELECT jsonb_array_elements(roles) as ro, id FROM users) as r ON users.id = r.id')
        .order(Arel.sql("(roles @> '[{\"type\":\"admin\"}]')::integer #{direction}"))
        .reverse_order
        .group('users.id')
    }

    # https://www.postgresql.org/docs/12/functions-matching.html#FUNCTIONS-POSIX-REGEXP
    scope :citizenlab_member, -> { where('email ~* ?', CITIZENLAB_MEMBER_REGEX_CONTENT).or(where('email ~* ?', GOVOCAL_MEMBER_REGEX_CONTENT)) }
    scope :not_citizenlab_member, -> { where.not('email ~* ?', CITIZENLAB_MEMBER_REGEX_CONTENT).and(where.not('email ~* ?', GOVOCAL_MEMBER_REGEX_CONTENT)) }
    scope :billed_admins, -> { admin.not_citizenlab_member }
    scope :billed_moderators, lambda {
      # use any conditions before `or` very carefully (inspect the generated SQL)
      project_moderator.or(User.project_folder_moderator).where.not(id: admin).not_citizenlab_member
    }

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

  # Reduce the roles to add to the JWT cookie to stop it getting too large
  # Roles from cookie are ONLY used by workshops and cl2-admin-templates
  # - workshops only cares if it finds type: admin or type: project_moderator.
  #   It does not use project_id or use type: project_moderator
  # - cl2-admin-templates only cares if it finds type: admin or type: project_folder_moderator.
  #   It needs the project_folder_id but does not use type: project_moderator
  def compress_roles
    admin = false
    project_moderator = false
    compressed_roles = []

    roles.each do |role|
      case role['type']
      when 'admin'
        admin = true
      when 'project_moderator'
        project_moderator = true
      when 'project_folder_moderator'
        compressed_roles << role
      end
    end

    compressed_roles << { 'type' => 'admin' } if admin
    compressed_roles << { 'type' => 'project_moderator' } if project_moderator

    compressed_roles
  end

  def project_folder_moderator?(project_folder_id = nil)
    project_folder_id ? moderated_project_folder_ids.include?(project_folder_id) : moderated_project_folder_ids.present?
  end

  def project_moderator?(project_id = nil)
    project_id ? moderatable_project_ids.include?(project_id) : moderatable_project_ids.present?
  end

  def project_or_folder_moderator?
    project_moderator? || project_folder_moderator?
  end

  def normal_user?
    !admin? && moderatable_project_ids.blank? && moderated_project_folder_ids.blank?
  end

  def moderatable_project_ids
    # Does not include folders
    roles.select { |role| role['type'] == 'project_moderator' }.pluck('project_id').compact
  end

  def moderated_project_folder_ids
    roles.select { |role| role['type'] == 'project_folder_moderator' }.pluck('project_folder_id').compact
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
