# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_analyses
#
#  id                   :uuid             not null, primary key
#  project_id           :uuid
#  phase_id             :uuid
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  show_insights        :boolean          default(TRUE), not null
#  main_custom_field_id :uuid
#
# Indexes
#
#  index_analysis_analyses_on_main_custom_field_id  (main_custom_field_id)
#  index_analysis_analyses_on_phase_id              (phase_id)
#  index_analysis_analyses_on_project_id            (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (main_custom_field_id => custom_fields.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (project_id => projects.id)
#
module Analysis
  class Analysis < ApplicationRecord
    belongs_to :project, optional: true
    belongs_to :phase, optional: true

    belongs_to :main_custom_field, class_name: 'CustomField', optional: true
    has_many :analyses_additional_custom_fields, class_name: 'Analysis::AdditionalCustomField', dependent: :destroy
    has_many :additional_custom_fields, -> { order(ordering: :asc) }, through: :analyses_additional_custom_fields, class_name: 'CustomField', source: :custom_field
    has_many :tags, class_name: 'Analysis::Tag', dependent: :destroy
    has_many :taggings, class_name: 'Analysis::Tagging', through: :tags
    has_many :background_tasks, class_name: 'Analysis::BackgroundTask', dependent: :destroy
    has_many :insights, class_name: 'Analysis::Insight', dependent: :destroy
    has_many :heatmap_cells, class_name: 'Analysis::HeatmapCell', dependent: :destroy

    validate :project_xor_phase_present
    validate :project_or_phase_form_context, on: :create
    validate :main_or_additional_fields_present
    validates :main_custom_field_id, uniqueness: { allow_nil: true }
    validate :main_field_is_textual
    validate :main_field_not_in_additional_fields

    # The inputs of an analysis are those inputs that were created according to
    # the form definition of the project or phase assigned to the analysis, that
    # also are part of the phase.
    def inputs
      if phase_id
        phase.ideas.published
      elsif project_id
        project.ideas.transitive.published
      end
    end

    def participation_context
      phase || project
    end

    # TODO: move-participation-method-logic
    def participation_method
      if phase
        phase.participation_method
      elsif project
        'ideation'
      end
    end

    # We don't call this `project` to not collide with the project association
    def source_project
      project || phase&.project
    end

    def associated_custom_fields
      ([main_custom_field] + additional_custom_fields).compact
    end

    private

    def project_xor_phase_present
      return if phase.present? ^ project.present? # ^ on booleans is XOR

      errors.add(:base, :project_or_phase_present, message: 'This analysis does not have only a project or only a phase associated')
    end

    # The linked project or phase should be a valid form context (the
    # participation_context the custom_form is associated with)
    def project_or_phase_form_context
      # TODO: move-participation-method-logic
      allowed_project_methods = %w[ideation voting]
      project_or_nil = project || nil
      if phase && %w[native_survey proposals community_monitor_survey].exclude?(phase.participation_method)
        errors.add(:base, :project_or_phase_form_context, message: 'An analysis should be associated with a valid form context. The passed phase is not associated with a form definition.')
      elsif project_or_nil&.phases&.none? { |phase| allowed_project_methods.include?(phase.participation_method) }
        errors.add(:base, :project_or_phase_form_context, message: 'An analysis should be associated with a valid form context. The passed project has no phases supporting a participation method that can hold inputs')
      end
    end

    def main_or_additional_fields_present
      return if associated_custom_fields.present?

      errors.add(:base, :main_custom_field_or_additional_custom_fields_present, message: 'This analysis does not have any associated custom fields')
    end

    def main_field_is_textual
      if main_custom_field_id.present? && !main_custom_field.support_free_text_value?
        errors.add(:base, :main_custom_field_not_textual, message: 'The main custom field should be a textual custom field')
      end
    end

    def main_field_not_in_additional_fields
      if main_custom_field_id.present? && additional_custom_field_ids.include?(main_custom_field_id)
        errors.add(:base, :main_custom_field_in_additional_fields, message: 'The main custom field cannot be part of the additional custom fields')
      end
    end
  end
end
