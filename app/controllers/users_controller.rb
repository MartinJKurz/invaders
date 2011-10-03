class UsersController < ApplicationController

  before_filter :correct_user, :only => [:edit, :update]

  helper_method :sort_score_column, :sort_direction, :sort_column

  def correct_user
    if (nil ==  current_user)
      redirect_to root_url, :flash => { :error => "not logged in" }
    else
      if (user_is_admin or user_is_logged_in params[:id])
        # ok
        # :flash => { :notice => 'hey ' + params[:id]}
      else
        redirect_to root_url, :flash => { :error => "can only edit own profile " + params[:id] }
      end
    end
  end

  def index
    @title = "All Users"
    @users = User.scoped.order(sort_column + ' ' + sort_direction).page(params[:page]).per(15)
  end

  # standard:
  # - get data,
  # - use show.html.erb to create the html
  # - send back html
  # - browser renders html, requests more data: style, js, other resources 
  def show
    begin
      @user = User.find(params[:id])
    rescue
      redirect_to root_url, :notice => 'user not found'
    end
    if @user
      @title = @user.name
      @scores = @user.scores.order(sort_score_column + ' ' + sort_direction).page(params[:page]).per(15)
    end
  end

  def new
    @title = "Sign up"
    @user = User.new
  end

  def create
    @user = User.new(params[:user])
    if @user.save
      redirect_to '/users/' + @user.id.to_s, :notice => "Signed up!"
      # log in
      session[:user_id] = @user.id
      #user_session.user_id = @user.id
    else
      render "new"
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    @user.update_attributes(params[:user])
    if @user.save
      redirect_to '/users/' + @user.id.to_s, :notice => "Updated user!"
    else
      render "edit"
    end
  end

  def destroy
    @user = User.find(params[:id])

    #test id user exist
    @user.testing

    ###
    # current_user = User.find(session[:user_id]) if session[:user_id]
    if current_user && current_user.id == params[:id]
      session.destroy :user_id => params[:id]
      #user_session.destroy
    end
    ###

    @user.destroy

    respond_to do |format|
      format.html  { redirect_to(users_url) }
      format.json  { render :json => {}, :status => :ok }
    end
  end

  def destroy_old_users
    if user_is_admin
      limit = APP_CONFIG['old_user']

      if !limit
        limit = 100
      end
      
      users = User.where("updated_at < '#{Time.now - limit.days}' AND name != 'admin'")
      ret = users.length.to_s + " users destroyed"

      #destroy_all, NOT delete_all, to destroy the associated scores
      User.destroy_all("updated_at < '#{Time.now - limit.days}' AND name != 'admin'")

      redirect_to '/users', :notice => ret
    else
      redirect_to '/', :notice => 'must be admin to delete scores'
    end
  end

  private
  
  def sort_score_column
    Score.column_names.include?(params[:sort]) ? params[:sort] : "score"
  end

  def sort_column
    User.column_names.include?(params[:sort]) ? params[:sort] : "name"
  end

  def sort_direction
    %w[asc desc].include?(params[:direction]) ? params[:direction] : "desc"
  end

end

