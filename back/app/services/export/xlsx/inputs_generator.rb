module Export
  module Xlsx
    class InputsGenerator < Generator
      def generate_inputs_for_phase(phase_id, redacted_field_keys: [])
        phase = eager_load_phase(phase_id)
        create_stream do |workbook|
          generate_phase_sheet(workbook, phase, redacted_field_keys: redacted_field_keys)
        end
      end

      # idea_ids limits each phase sheet to those inputs (a selection made in
      # the project's input manager); the sheets keep the same columns.
      def generate_inputs_for_project(project_id, idea_ids: nil)
        project = eager_load_project(project_id)
        create_stream do |workbook|
          generate_for_timeline_project(workbook, project, idea_ids: idea_ids)
        end
      end

      def generate_for_input(input)
        create_stream do |workbook|
          generate_input_sheet(workbook, input)
        end
      end

      private

      def eager_load_phase(phase_id)
        Phase.where(
          id: phase_id
        ).includes(
          :ideas_phases,
          project: { custom_form: { custom_fields: :options } },
          custom_form: { custom_fields: :options }
        ).first
      end

      def eager_load_project(project_id)
        Project.where(
          id: project_id
        ).includes(
          custom_form: { custom_fields: :options },
          phases: [:project, { custom_form: { custom_fields: :options } }]
        ).first
      end

      def eager_load_inputs(inputs)
        inputs.includes(*Export::InputReportFields::EAGER_LOADS).order(:created_at)
      end

      def generate_for_timeline_project(workbook, project, idea_ids: nil)
        phases = project.phases.select { |phase| phase.pmethod.supports_exports? }
        phases_to_titles = add_suffix_to_duplicate_titles(phases) # avoid ArgumentError due to duplicate sheet names

        phases.each do |phase|
          generate_phase_sheet(workbook, phase, idea_ids: idea_ids, sheet_name: phases_to_titles[phase.id])
        end
      end

      def generate_phase_sheet(workbook, phase, redacted_field_keys: [], idea_ids: nil, sheet_name: nil)
        inputs = phase.inputs_for_export
        inputs = inputs.where(id: idea_ids) if idea_ids
        generate_sheet(workbook, eager_load_inputs(inputs), phase, redacted_field_keys: redacted_field_keys, sheet_name: sheet_name)
      end

      def generate_input_sheet(workbook, input)
        generate_sheet(workbook, [input], input.creation_phase)
      end

      def generate_sheet(workbook, inputs, phase, redacted_field_keys: [], sheet_name: nil)
        sheet_generator = InputSheetGenerator.new(inputs, phase, redacted_field_keys: redacted_field_keys)
        sheet_generator.generate_sheet(workbook, sheet_name || multiloc_service.t(phase.title_multiloc))
      end

      def create_stream
        package = Axlsx::Package.new
        yield package.workbook
        package.to_stream
      end
    end
  end
end

Export::Xlsx::InputsGenerator.prepend(BulkImportIdeas::Patches::InputsGenerator)
