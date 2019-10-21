module Carrierwave
  module Base64
    module FileAdapter

      def mount_base64_file_uploader attribute, uploader_class, options={}
        mount_uploader attribute, uploader_class, options

        self.send(:define_method, "#{attribute}=") do |data|
          return if data.to_s.empty? || data == send(attribute).to_s

          send("#{attribute}_will_change!") if respond_to? "#{attribute}_will_change!"

          if !(data.is_a?(String) && data.strip.start_with?('data'))
            return self.file = data
          end

          file_name = self.name.split('.')[0..-2].join('.')
          extension = self.name.split('.').last
          self.file = Carrierwave::Base64::Base64FileStringIO.new(data.strip, file_name, extension)
        end
      end

    end
  end
end
