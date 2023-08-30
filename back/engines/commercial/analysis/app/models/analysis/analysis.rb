# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_analyses
#
#  id         :uuid             not null, primary key
#  project_id :uuid
#  phase_id   :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_analysis_analyses_on_phase_id    (phase_id)
#  index_analysis_analyses_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (project_id => projects.id)
#
module Analysis
  class Analysis < ApplicationRecord
    belongs_to :project, optional: true
    belongs_to :phase, optional: true

    has_many :analyses_custom_fields, class_name: 'Analysis::AnalysesCustomField', dependent: :destroy
    has_many :custom_fields, -> { order(ordering: :asc) }, through: :analyses_custom_fields
    has_many :tags, class_name: 'Analysis::Tag', dependent: :destroy
    has_many :taggings, class_name: 'Analysis::Tagging', through: :tags
    has_many :background_tasks, class_name: 'Analysis::BackgroundTask', dependent: :destroy
    has_many :insights, class_name: 'Analysis::Insight', dependent: :destroy

    validate :project_xor_phase_present
    validate :project_or_phase_form_context, on: :create

    # The inputs of an analysis are those inputs that were created according to
    # the form definition of the project or phase assigned to the analysis, that
    # also are part of the phase.
    def inputs
      scope = Idea.published
      if phase_id
        scope.where(creation_phase_id: phase_id)
      elsif project.timeline?
        scope.where(project_id: project_id, creation_phase: nil)
      elsif project.continuous?
        scope.where(project_id: project_id)
      end
    end

    def participation_method
      if phase
        phase.participation_method
      elsif project&.continuous?
        project.participation_method
      elsif project&.timeline?
        'ideation'
      end
    end

    # We don't call this `project` to not collide with the project association
    def source_project
      project || phase&.project
    end

    private

    def project_xor_phase_present
      return if phase.present? ^ project.present? # ^ on booleans is XOR

      errors.add(:base, :project_or_phase_present, message: 'This analysis does not have only a project or only a phase associated')
    end

    # The linked project or phase should be a valid form context (the
    # participation_context the custom_form is associated with)
    def project_or_phase_form_context
      if phase && (phase.can_contain_ideas? || !phase.can_contain_input?)
        errors.add(:base, :project_or_phase_form_context, message: 'An analysis should be associated with a valid form context. The passed phase is not associated with a form definition.')
      elsif project && !project.can_contain_input?
        errors.add(:base, :project_or_phase_form_context, message: 'An analysis should be associated with a valid form context. The passed project is not supporting a participation method that can hold inputs')
      end
    end
  end
end
