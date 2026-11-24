# frozen_string_literal: true

module Analytics
  module ReportingRowsSpecSupport
    # Creates a new project with at least one row in every reporting view that
    # belongs to a project, and returns that project. Each call makes its own people,
    # so the rows of two calls never share a person.
    #
    # Not covered: reporting_community_monitor_scores (only the community monitor
    # project has them), the admin-only views, and reporting_reference_distributions
    # (no project).
    def create_reporting_rows
      project = create(:project)
      survey_phase = create(:native_survey_phase, project: project, start_at: 60.days.ago, end_at: 31.days.ago)
      phase = create(:phase, project: project, start_at: 30.days.ago, end_at: nil)

      create_survey_response(survey_phase)
      idea = create(:idea, project: project, phases: [phase], author: create_user_with_gender, submitted_at: Time.zone.now)
      create_input_rows(idea)
      create_analysis_rows(project, idea)

      create(:event, project: project)
      create(:report, phase: phase)
      create(:session, :with_pageview, project: project)
      create(:delivery, campaign: create(:manual_project_participants_campaign, context: project), sent_at: Time.zone.now)

      project
    end

    private

    def create_survey_response(phase)
      IdeaStatus.find_by(code: 'proposed', participation_method: 'ideation') || create(:idea_status_proposed)
      question = create(:custom_field_linear_scale, resource: create(:custom_form, participation_context: phase))
      response = create(:native_survey_response, project: phase.project, creation_phase: phase)
      response.custom_field_answers.create!(key: question.key, value: 4)
    end

    def create_user_with_gender
      CustomField.find_by(key: 'gender') || create(:custom_field_gender, :with_options)
      create(:user, custom_field_answers: [build(:custom_field_answer, key: 'gender', value: 'male')])
    end

    def create_input_rows(idea)
      create(:comment, idea: idea)
      create(:reaction, reactable: idea)
      create(:baskets_idea, idea: idea)
      create(:official_feedback, idea: idea)
      create(:idea_import, idea: idea)
      idea.input_topics << create(:input_topic, project: idea.project)

      statuses = create_list(:idea_status, 2)
      create(:changed_status_activity, item: idea, payload: { 'change' => statuses.map(&:id) })
    end

    def create_analysis_rows(project, idea)
      analysis = create(:analysis, project: project)
      tag = create(:tag, analysis: analysis)
      create(:tagging, tag: tag, input: idea)
      create(:heatmap_cell, analysis: analysis, row: tag)
      create(
        :summary,
        background_task: create(:summarization_task, analysis: analysis, state: 'succeeded', ended_at: Time.zone.now),
        insight_attributes: { analysis: analysis, filters: {}, inputs_ids: [idea.id] }
      )
    end
  end
end

RSpec.configure do |config|
  config.include Analytics::ReportingRowsSpecSupport
end
