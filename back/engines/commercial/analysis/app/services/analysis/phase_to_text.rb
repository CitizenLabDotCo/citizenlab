module Analysis
  class PhaseToText < ModelToText
    def initialize(app_configuration = AppConfiguration.instance)
      super()
      @app_configuration = app_configuration
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
    end

    def execute(phase, **options)
      super.merge(
        'Project title' => @multiloc_service.t(phase.project.title_multiloc),
        'Project description' => @multiloc_service.t(phase.project.description_multiloc), # TODO: Deal with content builder layouts
        'Phase title' => @multiloc_service.t(phase.title_multiloc),
        'Phase description' => @multiloc_service.t(phase.description_multiloc)
      )
    end
  end
end
