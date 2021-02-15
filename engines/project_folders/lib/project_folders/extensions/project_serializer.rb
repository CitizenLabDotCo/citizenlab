module ProjectFolders
  module Extensions
    module ProjectSerializer
      def self.prepended(base)
        base.class_eval do
          attribute :folder_id do |project|
            project.folder&.id
          end
        end
      end
    end
  end
end
