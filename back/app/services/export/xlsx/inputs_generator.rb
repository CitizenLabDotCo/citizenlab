module Export
  module Xlsx
    class InputsGenerator
      def generate_inputs_for_phase(phase_id)
        phase = eager_load_phase(phase_id)
        create_stream do |workbook|
          generate_phase_sheet(workbook, phase)
        end
      end

      def generate_inputs_for_project(project_id)
        project = eager_load_project(project_id)
        create_stream do |workbook|
          generate_for_timeline_project(workbook, project)
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
        inputs.includes(:project, :author, :ideas_topics, :topics, :idea_files, :idea_status, :assignee).order(:created_at)
      end

      def generate_for_timeline_project(workbook, project)
        project.phases.each do |phase|
          next if !phase.pmethod.supports_exports?

          generate_phase_sheet(workbook, phase)
        end
      end

      def generate_phase_sheet(workbook, phase)
        inputs = eager_load_inputs(phase.ideas.submitted_or_published)
        inputs = inputs.with_content unless phase.participation_method == 'native_survey'

        generate_sheet(workbook, inputs, phase)
      end

      def generate_input_sheet(workbook, input)
        generate_sheet(workbook, [input], input.creation_phase)
      end

      def generate_sheet(workbook, inputs, phase)
        sheet_generator = InputSheetGenerator.new inputs, phase
        sheet_name = MultilocService.new.t phase.title_multiloc
        sheet_generator.generate_sheet(workbook, sheet_name)
      end

      def create_stream
        package = Axlsx::Package.new
        yield package.workbook
        package.to_stream
      end
    end
  end
end
