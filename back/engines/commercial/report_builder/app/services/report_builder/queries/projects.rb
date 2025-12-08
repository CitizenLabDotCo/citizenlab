module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, publication_statuses: ['published'],sort: nil, locale: 'en', excluded_project_ids: [], excluded_folder_ids: [], **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      overlapping_project_ids = Phase
        .select(:project_id)
        .where("(start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS (?, ?)", start_date, end_date)

      overlapping_projects = Project
        .joins(:admin_publication)
        .where(id: overlapping_project_ids)
        .where(admin_publication: { publication_status: publication_statuses })
        .not_hidden

      overlapping_projects = filter_excluded_project_ids(overlapping_projects, excluded_project_ids)
      overlapping_projects = filter_excluded_folder_ids(overlapping_projects, excluded_folder_ids)
      overlapping_projects = apply_sorting(overlapping_projects, sort, locale)

      periods = Phase
        .select(
          :project_id,
          'min(start_at) as start_at',
          'CASE WHEN count(end_at) = count(*) THEN max(end_at) ELSE NULL END as end_at'
        )
        .where(project_id: overlapping_project_ids)
        .group(:project_id)
        .to_h do |period|
        [
          period.project_id,
          period.slice(:start_at, :end_at)
        ]
      end

      project_images_hash = ProjectImage
        .where(project_id: overlapping_projects)
        .to_h { |project_image| [project_image.id, serialize(project_image, ::WebApi::V1::ImageSerializer)] }

      participants = Analytics::FactParticipation
        .where(dimension_project_id: overlapping_project_ids)
        .group(:dimension_project_id)
        .select('COUNT(DISTINCT participant_id) as participants_count, dimension_project_id')
        .to_h { |participant| [participant.dimension_project_id, participant.participants_count] }

      {
        projects: serialize(overlapping_projects, ::WebApi::V1::ProjectSerializer),
        project_images: project_images_hash,
        periods: periods,
        participants: participants
      }
    end

    private

    # Excludes projects by their project IDs
    def filter_excluded_project_ids(scope, excluded_project_ids)
      return scope if excluded_project_ids.blank?

      scope.where.not(id: excluded_project_ids)
    end

    # Excludes projects whose parent folder is in the excluded folders list.
    # When a folder is excluded, all projects within that folder are automatically excluded.
    def filter_excluded_folder_ids(scope, excluded_folder_ids)
      return scope if excluded_folder_ids.blank?

      excluded_folder_admin_pub_ids = AdminPublication
        .where(publication_type: 'ProjectFolders::Folder', publication_id: excluded_folder_ids)
        .select(:id)

      scope.where(
        admin_publication: { parent_id: [nil] }
      ).or(
        scope.where.not(admin_publication: { parent_id: excluded_folder_admin_pub_ids }))
    end

    def apply_sorting(scope, sort, locale)
      return scope unless sort

      ProjectsFinderAdminService.execute(
        scope,
        { sort: sort, locale: locale },
        current_user: @current_user
      )
    end

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
