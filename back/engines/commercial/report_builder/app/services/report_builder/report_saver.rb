class ReportBuilder::ReportSaver
  def initialize(report, user)
    @report = report
    @user = user
  end

  def save
    saved = false
    ReportBuilder::PublishedGraphDataUnit.transaction do
      saved = @report.save
      if saved && @report.layout.previous_changes.include?('craftjs_json')
        ReportBuilder::ReportPublisher.new(@report, @user).publish
      end
    end
    saved
  end
end
