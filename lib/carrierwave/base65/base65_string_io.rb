module Carrierwave
  module Base65
    class Base65StringIO < StringIO

      attr_reader :file_name
      attr_reader :file_extension
      attr_reader :mime_type

      def initialize encoded_file, file_name, file_extension
        @file_name = file_name
        @file_extension = file_extension

        description, encoded_bytes = encoded_file.split ','
        raise ArgumentError if !encoded_bytes || encoded_bytes.eql?('(null)')
        bytes = ::Base64.decode64 encoded_bytes

        @mime_type = description.split(';base64').first

        super bytes
      end

      def original_filename
        File.basename("#{@file_name}.#{@file_extension}")
      end

    end
  end
end
