# frozen_string_literal: true

module VcrHelper
  module_function

  def use_cassette_library_dir(dir_path)
    old_path = VCR.configuration.cassette_library_dir
    VCR.configure { |config| config.cassette_library_dir = dir_path }

    yield
  ensure
    VCR.configure { |config| config.cassette_library_dir = old_path }
  end
end
