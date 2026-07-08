# frozen_string_literal: true

module ContentBuilder
  module Patches
    module SideFxProjectService
      def after_create(project, current_user)
        super
        ContentBuilder::DescriptionLayoutService.new.provision_for(project)
      end

      def after_copy(source_project, copied_project, current_user, start_time)
        super
        ContentBuilder::DescriptionLayoutService.new.provision_for(copied_project)
      end
    end
  end
end
