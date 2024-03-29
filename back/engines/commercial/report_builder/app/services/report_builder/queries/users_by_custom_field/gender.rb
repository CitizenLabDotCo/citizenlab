module ReportBuilder
  class Queries::UsersByCustomField::Gender < Queries::UsersByCustomField::Base
    protected

    def custom_field_key
      :gender
    end
  end
end
