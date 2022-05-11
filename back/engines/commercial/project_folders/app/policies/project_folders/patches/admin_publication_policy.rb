module ProjectFolders
  module Patches
    module AdminPublicationPolicy
      def reorder?
        super || (record.publication_type == 'Project' && user&.moderates_parent_folder?(record.publication))
      end
    end
  end
end
