# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Private-space participants (`private_user` rows of a space's `NN---users.csv`) ──▶ a manual Go Vocal
    # `Group` per private space, with a `Membership` per imported member and a `GroupsProject` that makes
    # the project visible to that group only.
    #
    # {ProjectsExtractor} already hides a private space from everyone but admins. This opens it to its
    # members; a private space with no imported member stays admins-only. Spaces that aren't private (or are
    # transparent) are left alone even when their CSV lists private users.
    #
    # Kept apart from {ProcessRolesExtractor}, which reads the same rows: staff roles become moderators,
    # a different rule that changes for different reasons.
    class PrivateSpaceMembersExtractor < BaseExtractor
      COLUMNS = {
        user: 'uid',
        space: 'decidim_participatory_process',
        role: 'role'
      }.freeze

      PRIVATE_USER_ROLE = 'private_user'

      def run
        member_uids_by_space.flat_map do |space_uid, user_uids|
          project = ref_map.fetch(space_uid)
          next [] unless project&.model_name == 'project' && project.attributes['visible_to'] == 'admins'

          open_to_members(space_uid, project, user_uids)
        end
      end

      private

      def member_uids_by_space
        rows.each_with_object(Hash.new { |h, k| h[k] = [] }) do |row, acc|
          next unless present_value(row[COLUMNS[:role]])&.downcase == PRIVATE_USER_ROLE

          space_uid = present_value(row[COLUMNS[:space]])
          user_uid = present_value(row[COLUMNS[:user]])
          acc[space_uid] << user_uid if space_uid && user_uid
        end
      end

      def open_to_members(space_uid, project, user_uids)
        users = user_uids.uniq.filter_map do |uid|
          user = ref_map.fetch(uid)
          next user if user&.model_name == 'user'

          skip(uid, "private space member not imported (#{space_uid})")
        end
        # Two Decidim accounts with the same email are imported as one user ({UsersExtractor}).
        users.uniq!
        if users.empty?
          adjust(space_uid, 'private space with no imported member: visible to admins only')
          return []
        end

        group = register_group(space_uid, project)
        records = [group, register_groups_project(space_uid, group, project)]
        records += users.map { |user| register_membership(space_uid, group, user) }
        project.attributes['visible_to'] = 'groups'
        adjust(space_uid, "private space: visible to its #{users.size} member(s) only (manual group)")
        records
      end

      def register_group(space_uid, project)
        title = project.attributes['title_multiloc']
        group = Record.new('group', {
          'title_multiloc' => i18n_multiloc('private_space_members', locales: title.keys, space: title),
          'membership_type' => 'manual'
        })
        ref_map.register("#{space_uid}-members-group", group)
      end

      def register_groups_project(space_uid, group, project)
        groups_project = Record.new('groups_project', {})
        groups_project.reference('group', group)
        groups_project.reference('project', project)
        ref_map.register("#{space_uid}-members-group-project", groups_project)
      end

      def register_membership(space_uid, group, user)
        membership = Record.new('membership', {})
        membership.reference('group', group)
        membership.reference('user', user)
        ref_map.register("#{space_uid}-members-group-#{user.key}", membership)
      end
    end
  end
end
