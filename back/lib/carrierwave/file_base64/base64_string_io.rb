# frozen_string_literal: true

module Carrierwave
  module FileBase64
    class Base64StringIo < StringIO
      attr_reader :file_name, :file_extension

      def initialize(encoded_file, file_name, file_extension)
        @file_name = file_name
        @file_extension = file_extension

        _description, encoded_bytes = encoded_file.split ','
        raise ArgumentError if !encoded_bytes || encoded_bytes.eql?('(null)')

        bytes = ::Base64.decode64 encoded_bytes

        super bytes
      end

      def original_filename
        File.basename("#{@file_name}.#{@file_extension}")
      end
    end
  end
end
