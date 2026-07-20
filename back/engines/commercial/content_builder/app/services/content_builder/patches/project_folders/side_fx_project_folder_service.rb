# frozen_string_literal: true

module ContentBuilder
  module Patches
    module ProjectFolders
      module SideFxProjectFolderService
        def after_create(folder, current_user)
          super
          ContentBuilder::DescriptionLayoutService.new.provision_for(folder)
        end
      end
    end
  end
end
