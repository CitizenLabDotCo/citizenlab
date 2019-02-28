class PhaseFileUploader < CarrierWave::Uploader::Base
  include BaseUploader


  def extension_whitelist
    %w(pdf doc docx xls xlsx ppt pptx txt sxw sxc sxi sdw sdc sdd csv mp3 mp4 mkv avi)
  end

  def fog_attributes
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    {"Content-Disposition" => "attachment; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\""}
  end

  def size_range
	  1.byte..50.megabytes
	end
end