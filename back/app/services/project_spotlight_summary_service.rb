# frozen_string_literal: true

class ProjectSpotlightSummaryService
  def initialize(project)
    @project = project
  end

  def call
    ideas = @project.ideas.count
    # comments = @project.comments.count
    # reactions = @project.reactions.count
    return nil if ideas == 0

    {
      total_views: ideas * 3,
      status: @project.admin_publication.publication_status == 'published' ? 'active' : 'archived'
    }
  end
end
