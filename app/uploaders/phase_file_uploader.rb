class PhaseFileUploader < CarrierWave::Uploader::Base
  include BaseUploader


  def extension_whitelist
    %w(pdf doc docx xls xlsx ppt pptx txt sxw sxc sxi sdw sdc sdd csv mp3 mp4 mkv avi)
  end
end