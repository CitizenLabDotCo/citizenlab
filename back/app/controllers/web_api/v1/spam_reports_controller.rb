# frozen_string_literal: true

class WebApi::V1::SpamReportsController < ApplicationController
  before_action :set_spam_report, only: %i[show update destroy]
  before_action :set_spam_reportable_type_and_id, only: %i[index create]

  def index
    @spam_reports = policy_scope(SpamReport)
      .where(spam_reportable_type: @spam_reportable_type, spam_reportable_id: @spam_reportable_id)
      .includes(:user)
    @spam_reports = paginate @spam_reports

    render json: linked_json(@spam_reports, WebApi::V1::SpamReportSerializer, params: jsonapi_serializer_params, include: [:user])
  end

  def show
    render json: WebApi::V1::SpamReportSerializer.new(
      @spam_report,
      params: jsonapi_serializer_params,
      include: [:user]
    ).serializable_hash.to_json
  end

  def create
    @spam_report = SpamReport.new(spam_report_params)
    @spam_report.spam_reportable_type = @spam_reportable_type
    @spam_report.spam_reportable_id = @spam_reportable_id
    @spam_report.user ||= current_user
    authorize @spam_report

    if @spam_report.save
      SideFxSpamReportService.new.after_create(@spam_report, current_user)
      render json: WebApi::V1::SpamReportSerializer.new(
        @spam_report,
        params: jsonapi_serializer_params
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: @spam_report.errors.details }, status: :unprocessable_entity
    end
  end

  # patch
  def update
    ActiveRecord::Base.transaction do
      @spam_report.other_reason = nil if spam_report_params['reason_code'] != 'other'
      if @spam_report.update(spam_report_params)
        authorize @spam_report
        SideFxSpamReportService.new.after_update(@spam_report, current_user)
        render json: WebApi::V1::SpamReportSerializer.new(
          @spam_report.reload,
          params: jsonapi_serializer_params,
          include: [:user]
        ).serializable_hash.to_json, status: :ok
      else
        render json: { errors: @spam_report.errors.details }, status: :unprocessable_entity
      end
    end
  end

  # delete
  def destroy
    spam_report = @spam_report.destroy
    if spam_report.destroyed?
      SideFxSpamReportService.new.after_destroy(spam_report, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_spam_reportable_type_and_id
    @spam_reportable_type = params[:spam_reportable]
    @spam_reportable_id = params[:"#{@spam_reportable_type.underscore}_id"]
    raise 'must not be blank' if @spam_reportable_type.blank? || @spam_reportable_id.blank?
  end

  def set_spam_report
    @spam_report = SpamReport.find params[:id]
    authorize @spam_report
  end

  def spam_report_params
    params.require(:spam_report).permit(
      :reason_code,
      :other_reason,
      :user_id
    )
  end
end
