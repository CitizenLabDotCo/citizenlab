class BaseFileUploader < BaseUploader

  def fog_attributes
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    {"Content-Disposition" => "attachment; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\""}
  end

end
