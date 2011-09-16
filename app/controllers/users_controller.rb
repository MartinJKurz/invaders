class UsersController < ApplicationController

  def index
    @title = "Listing all Users"
    @users = User.all
  end

  def show
    @user = User.find(params[:id])
  end

  def new
    @title = "Sign up"
  end
end

