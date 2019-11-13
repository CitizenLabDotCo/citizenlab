class PageFileUploader < CarrierWave::Uploader::Base
  include BaseFileUploader
  

  def size_range
    1.byte..50.megabytes
  end

end
