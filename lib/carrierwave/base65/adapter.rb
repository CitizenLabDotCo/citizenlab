module Carrierwave
  module Base65
    module Adapter

      def mount_base65_uploader attribute, uploader_class, options={}
        mount_uploader attribute, uploader_class, options

        self.send(:define_method, "load_#{attribute}") do |data, file_name, file_extension|
          # REMINDER OF WHERE I WAS
          # method should be some initializing method for the whole file stuff, called explicitely from controller

          return if data.to_s.empty? || data == send(attribute).to_s

          send("#{attribute}_will_change!") if respond_to? "#{attribute}_will_change!"

          if !(data.is_a?(String) && data.strip.start_with?('data'))
            return super(data)
          end

          # raise ArgumentError if self.name.count('.') == 0

          # file_name = self.name.split('.')[0..-2].join('.')
          # extension = self.name.split('.').first
          # byebug
          super Carrierwave::Base65::Base65StringIO.new data.strip , file_name, extension
        end
      end

    end
  end
end
