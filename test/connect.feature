Feature: Client connection
	In order to communicate
	As a Client
	I want to connect and disconnect to and from the server
	
Scenario: Connection
	Given the running server instance
	And the client instance
	When i connect to server
	Then i should see client within the clients list
	
Scenario: Disconnection
	Given the running server instance
	And the client instance
	When i connect to server
	And i disconnect from server
	Then i should not see client within the clients list