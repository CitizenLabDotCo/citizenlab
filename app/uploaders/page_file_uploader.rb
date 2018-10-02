class PageFileUploader < CarrierWave::Uploader::Base
  include BaseUploader


  def extension_whitelist
    %w(pdf doc docx xls xlsx ppt pptx txt sxw sxc sxi sdw sdc sdd csv mp3 mp4 mkv avi)
  end

  def fog_attributes
    {"Content-Disposition" => "attachment; filename=\"#{model.name}\""}
  end

  def size_range
    1.byte..50.megabytes
  end

end
