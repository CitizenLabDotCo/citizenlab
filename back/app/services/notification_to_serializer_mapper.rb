class NotificationToSerializerMapper
  def map
    Notification.descendants.select do |klaz|
      klaz.descendants.empty? && Object.const_defined? klaz.name
    end.map do |klaz|
      module_prefix = klaz.name.split(/Notifications\:\:/, 2).first # After https://stackoverflow.com/a/7523966/3585671
      [klaz, "#{module_prefix}WebApi::V1::Notifications::#{klaz.name.demodulize}Serializer".constantize]
    end.to_h
  end
end
