module ReportBuilder
  class Queries::UsersByCustomField::Birthyear < Queries::UsersByCustomField::Base
    protected

    def custom_field_key
      :birthyear
    end
  end
end
