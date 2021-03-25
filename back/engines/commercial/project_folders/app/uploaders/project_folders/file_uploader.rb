module ProjectFolders
  class FileUploader < BaseFileUploader

    def size_range
      1.byte..50.megabytes
    end
  end
end
