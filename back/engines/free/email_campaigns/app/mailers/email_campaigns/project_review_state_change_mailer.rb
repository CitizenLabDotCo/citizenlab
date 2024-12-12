# frozen_string_literal: true

module EmailCampaigns
  class ProjectReviewStateChangeMailer < ApplicationMailer
    helper_method :project_title, :project_description, :admin_project_url

    private

    def project_review
      ProjectReview.find(event.project_review_id)
    end

    def subject
      format_message('subject', values: { projectTitle: project_title })
    end

    def header_title
      format_message('header', values: {
        reviewerName: reviewer_name,
        projectTitle: project_title
      })
    end

    def preheader
      header_title
    end

    def reviewer_name
      project_review.reviewer.full_name
    end

    def project_title
      localize_for_recipient(project_review.project.title_multiloc)
    end

    def project_description
      localize_for_recipient(project_review.project.description_preview_multiloc)
    end

    def admin_project_url
      @admin_project_url ||=
        Frontend::UrlService.new.admin_project_url(project_review.project_id)
    end
  end
end
