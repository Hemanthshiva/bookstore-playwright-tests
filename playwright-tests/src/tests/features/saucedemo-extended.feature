    Feature: Extended Sauce Demo Functionality

    Background:
        Given I am on the Sauce Demo login page

    Scenario Outline: Login with different user types
        When I enter username "<username>"
        And I enter password "secret_sauce"
        And I click on the login button
        Then I should verify "<behavior>"

        Examples:
            | username        | behavior                                            |
            | locked_out_user | Epic sadface: Sorry, this user has been locked out. |


    @performance
    Scenario: Verify performance_glitch_user basic functionality
        Given I am logged in as "performance_glitch_user"
        Then I should be on the products page
        And I should see the inventory list
        And I should be able to view product details
        But sorting functionality may be limited