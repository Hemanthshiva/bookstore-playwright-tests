  Feature: Sauce Demo Basic Functionality

  Background:
    Given I am on the Sauce Demo login page

  Scenario: Successful login with valid credentials
    When I enter username "standard_user"
    And I enter password "secret_sauce"
    And I click on the login button
    Then I should be on the products page

  Scenario: Add item to cart and complete checkout
    Given I am logged in as a standard user
    When I add an item to the cart
    And I click on the shopping cart
    Then I should see the item in my cart
    When I proceed to checkout
    And I enter shipping information
      | FirstName | LastName | ZipCode |
      | John      | Doe      | 12345   |
    And I click continue
    And I click finish
    Then I should see the order confirmation

  Scenario: Add and verify item in cart
    Given I am logged in as a standard user
    When I add an item to the cart
    And I click on the shopping cart
    Then I should see the item in my cart
    And the cart badge should show "1"

  Scenario: Remove item from cart
    Given I am logged in as a standard user
    And I have an item in the cart
    When I click on the shopping cart
    And I remove the item from the cart
    Then the cart should be empty
    And the cart badge should not be visible