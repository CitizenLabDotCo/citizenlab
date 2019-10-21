module Carrierwave
  module Base64
    module Adapter

      def mount_base64_uploader attribute, uploader_class, options={}
        mount_uploader attribute, uploader_class, options

        self.send(:define_method, "load_#{attribute}") do |data, name|
          return if data.to_s.empty? || data == send(attribute).to_s

          send("#{attribute}_will_change!") if respond_to? "#{attribute}_will_change!"

          if !(data.is_a?(String) && data.strip.start_with?('data'))
            return self.file = data
          end

          file_name = self.name.split('.')[0..-2].join('.')
          extension = self.name.split('.').first
          self.file = Carrierwave::Base64::Base64StringIO.new(data.strip, file_name, extension)
        end
      end

    end
  end
end
