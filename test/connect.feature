Feature: Client connection
	In order to communicate
	As a Client
	I want to connect and disconnect to and from the server
	
Scenario: Connection
	Given the running server instance
	And the client instance
	When I connect to server
	Then I should see client within the clients list
	
Scenario: Disconnection
	Given the running server instance
	And the client instance
	When I connect to server
	And I disconnect from server
	Then I should not see client within the clients list