module Analysis
  class PhaseToText < ModelToText
    def initialize(app_configuration = AppConfiguration.instance)
      super()
      @app_configuration = app_configuration
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
    end

    def execute(phase, **options)
      super.merge(
        **exectute_project(phase.project),
        **execute_phase(phase)
      )
    end

    private

    def exectute_project(project)
      {
        'Project title' => @multiloc_service.t(project.title_multiloc),
        'Project description' => project_description_text(project)
      }
    end

    # The project description lives in the project page layout, authored in the
    # project page builder.
    def project_description_text(project)
      layout = ContentBuilder::Layout.find_by(
        content_buildable: project,
        code: ContentBuilder::ProjectPageLayoutService::CODE,
        enabled: true
      )
      return '' unless layout

      multilocs = ContentBuilder::Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json).extract
      multilocs.map { |multiloc| Nokogiri::HTML(@multiloc_service.t(multiloc)).text }.join("\n")
    end

    def execute_phase(phase)
      {
        'Phase title' => @multiloc_service.t(phase.title_multiloc),
        'Phase description' => Nokogiri::HTML(@multiloc_service.t(phase.description_multiloc)).text
      }
    end
  end
end
