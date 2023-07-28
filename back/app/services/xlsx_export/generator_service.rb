# frozen_string_literal: true

module XlsxExport
  class GeneratorService
    def generate_inputs_for_phase(phase_id, include_private_attributes)
      phase = eager_load_phase(phase_id)
      create_stream do |workbook|
        create_phase_sheet(workbook, phase, include_private_attributes)
      end
    end

    def generate_inputs_for_project(project_id, include_private_attributes)
      project = eager_load_project(project_id)
      create_stream do |workbook|
        if project.continuous?
          generate_for_continuous_project(workbook, project, include_private_attributes)
        else
          generate_for_timeline_project(workbook, project, include_private_attributes)
        end
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

    def generate_for_continuous_project(workbook, project, include_private_attributes)
      sheet_name = MultilocService.new.t project.title_multiloc
      inputs = eager_load_inputs(project.ideas)
      sheet_generator = InputSheetGenerator.new inputs, project, include_private_attributes
      sheet_generator.generate_sheet(workbook, sheet_name)
    end

    def generate_for_timeline_project(workbook, project, include_private_attributes)
      project.phases.each do |phase|
        next unless Factory.instance.participation_method_for(phase).supports_exports?

        create_phase_sheet(workbook, phase, include_private_attributes)
      end
    end

    def create_phase_sheet(workbook, phase, include_private_attributes)
      inputs = eager_load_inputs(phase.ideas)
      sheet_generator = InputSheetGenerator.new inputs, phase, include_private_attributes
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
