# frozen_string_literal: true

class McpServer::Serializers::Base
  attr_reader :record

  def self.serialize(record)
    new(record).attributes
  end

  def initialize(record)
    @record = record
  end

  def attributes
    raise NotImplementedError, "#{self.class.name} must implement #attributes"
  end
end
