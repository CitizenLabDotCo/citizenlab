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
    has_many :custom_fields, through: :analyses_custom_fields

    validate :project_xor_phase_present

    def inputs
      scope = Idea.published
      if phase_id
        scope.in_phase(phase_id)
      elsif project.timeline? # must be ideation
        scope.where(project_id: project_id, creation_phase: nil)
      elsif analysis.project.continuous?
        scope.where(project_id: analysis.project_id)
      end
    end

    def participation_method
      phase&.participation_method || project&.participation_method
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
  end
end
