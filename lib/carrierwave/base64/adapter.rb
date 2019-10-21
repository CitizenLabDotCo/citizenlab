module Carrierwave
  module Base64
    module Adapter

      def mount_base64_uploader attribute, uploader_class, options={}
        mount_uploader attribute, uploader_class, options

        self.send(:define_method, "load_#{attribute}") do |data, file_name, file_extension|
          # REMINDER OF WHERE I WAS
          # method should be some initializing method for the whole file stuff, called explicitely from controller

          return if data.to_s.empty? || data == send(attribute).to_s

          send("#{attribute}_will_change!") if respond_to? "#{attribute}_will_change!"

          if !(data.is_a?(String) && data.strip.start_with?('data'))
            return self.file = data
          end

          # raise ArgumentError if self.name.count('.') == 0

          # file_name = self.name.split('.')[0..-2].join('.')
          # extension = self.name.split('.').first
          # byebug
          self.file = Carrierwave::Base65::Base64StringIO.new(data.strip, file_name, file_extension)
        end
      end

    end
  end
end
