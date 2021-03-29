class ProjectFileUploader < BaseFileUploader

  def size_range
    1.byte..50.megabytes
  end

end
