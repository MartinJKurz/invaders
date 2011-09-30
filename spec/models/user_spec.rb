require 'spec_helper'

describe User do

  before(:each) do
    @attr = { :name => "Example User" }
  end

  it "should create a new instance given valid attributes" do
    User.create!(@attr)
  end

  it "should require a name" do
    no_name_user = User.new(@attr.merge(:name => ""))
    no_name_user.should_not be_valid
  end

  it "should reject names that are too long" do
    long_name = "a" * 21
    long_name_user = User.new(@attr.merge(:name => long_name))
    long_name_user.should_not be_valid
  end

  it "should reject duplicate names" do
    # Put a user with given name into the database.
    User.create!(@attr)
    user_with_duplicate_name = User.new(@attr)
    user_with_duplicate_name.should_not be_valid
  end

  it "should reject names identical up to case" do
    upcased_name = @attr[:name].upcase
    User.create!(@attr.merge(:name => upcased_name))
    user_with_duplicate_name = User.new(@attr)
    user_with_duplicate_name.should_not be_valid
  end


end

