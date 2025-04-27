    Feature: Error Validation for Errors User Login on SauceDemo

    Background:
        Given I am on the Sauce Demo login page

    Scenario:Verify the an error pop up is displayed when user tries to sort products
        Given I am logged in as "error_user"
        Then I should be on the products page
        When I sort products by "Price (low to high)"
        Then A popup is displayed with the below error message
            | Sorting is broken! This error has been reported to Backtrace. |


    Scenario: Error user can only add some items to cart
        Given I am logged in as "error_user"
        When I try to add all items to the cart
        Then Only 3 items should be added to the cart