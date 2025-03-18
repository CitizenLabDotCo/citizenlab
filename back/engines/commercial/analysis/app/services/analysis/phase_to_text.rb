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
      description_text = if ContentBuilder::Layout.exists?(content_buildable: project, code: 'project_description', enabled: true)
        layout = ContentBuilder::Layout.find_by!(content_buildable: project, code: 'project_description', enabled: true)
        multilocs = ContentBuilder::Craftjs::VisibleTextualMultilocs.new(layout.craftjs_json).extract
        multilocs.map { |multiloc| Nokogiri::HTML(@multiloc_service.t(multiloc)).text }.join("\n")
      else
        Nokogiri::HTML(@multiloc_service.t(project.description_multiloc)).text
      end
      {
        'Project title' => @multiloc_service.t(project.title_multiloc),
        'Project description' => description_text
      }
    end

    def execute_phase(phase)
      {
        'Phase title' => @multiloc_service.t(phase.title_multiloc),
        'Phase description' => Nokogiri::HTML(@multiloc_service.t(phase.description_multiloc)).text
      }
    end
  end
end
