# frozen_string_literal: true

module Carrierwave
  module FileBase64
    module Adapter
      def mount_base64_file_uploader(attribute, uploader_class, options = {})
        mount_uploader attribute, uploader_class, options

        send(:define_method, "#{attribute}_by_content=") do |file_attributes|
          raise ArgumentError if !file_attributes[:content] || !file_attributes[:name]

          data = file_attributes[:content]
          self.name = file_attributes[:name]
          return if data.to_s.empty? || data == send(attribute).to_s

          send("#{attribute}_will_change!") if respond_to? "#{attribute}_will_change!"

          unless data.is_a?(String) && data.strip.start_with?('data')
            send "#{attribute}=", data
            return
          end

          file_name = name.split('.')[0..-2].join('.')
          extension = name.split('.').last
          send "#{attribute}=", Carrierwave::FileBase64::Base64StringIo.new(data.strip, file_name, extension)
        end

        send(:define_method, "#{attribute}_by_url=") do |file_attributes|
          raise ArgumentError if !file_attributes[:url] || !file_attributes[:name]

          assign_attributes attribute => file_attributes[:name], "remote_#{attribute}_url" => file_attributes[:url]
        end
      end
    end
  end
end
