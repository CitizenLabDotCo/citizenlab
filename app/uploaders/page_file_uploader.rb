class PageFileUploader < CarrierWave::Uploader::Base
  include BaseFileUploader


  def extension_whitelist
    %w(pdf doc docx odt xls xlsx ods ppt pptx odp txt csv mp3 mp4 avi mkv)
  end

  def size_range
    1.byte..50.megabytes
  end

end
