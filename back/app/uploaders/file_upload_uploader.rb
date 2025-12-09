# frozen_string_literal: true

class FileUploadUploader < IdeaFileUploader
  def extension_allowlist
    # All file types are allowed.
  end

  def extension_denylist
    # Explicitly block SVG files due to XSS security risks
    # SVG files can contain embedded JavaScript that executes when rendered
    %w[svg]
  end
end
