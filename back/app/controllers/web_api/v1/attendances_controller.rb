class WebApi::V1::AttendancesController < ApplicationController
  before_action :set_attendance, only: %i[show destroy]
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    @attendances = policy_scope(Attendance)
      .where(event: params[:event_id])
      .order(created_at: :desc)
    @attendances = paginate @attendances

    render json: linked_json(@attendances, WebApi::V1::AttendanceSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::AttendanceSerializer.new(
      @attendance,
      params: fastjson_params
    ).serialized_json
  end

  def create
    @attendance = Attendance.new event_id: params[:event_id], user: current_user
    authorize @attendance
    SideFxAttendanceService.new.before_create @attendance, current_user
    if @attendance.save
      SideFxAttendanceService.new.after_create @attendance, current_user
      render json: WebApi::V1::AttendanceSerializer.new(
        @attendance,
        params: fastjson_params
      ).serialized_json, status: :created
    else
      render json: { errors: @attendance.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxAttendanceService.new.before_destroy @attendance, current_user
    attendance = @attendance.destroy
    if attendance.destroyed?
      SideFxAttendanceService.new.after_destroy attendance, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_attendance
    @attendance = Attendance.find params[:id]
    authorize @attendance
  end
end
