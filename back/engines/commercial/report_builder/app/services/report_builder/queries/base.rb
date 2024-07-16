class ReportBuilder::Queries::Base
  def initialize(current_user)
    @current_user = current_user
  end
end
