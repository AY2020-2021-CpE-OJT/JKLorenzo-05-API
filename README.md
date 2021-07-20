# JKLorenzo-05-API

A Heroku-hosted API for the Task 5 [Phonebook App](https://github.com/AY2020-2021-CpE-OJT/JKLorenzo-05-APP).

### Structures

Represents all the common objects used by the app and the API.

|     Name      |                                     Properties                                      |                Description                |
| :-----------: | :---------------------------------------------------------------------------------: | :---------------------------------------: |
|   AuthData    |                          { id?: string; token?: string; }                           | Used for authentication and authorization |
|  AuthPayload  |                                 { pld?: AuthData }                                  |    JWT payload format used by the app     |
|    PBData     |   { id: string; first_name: string; last_name: string; phone_numbers: string[]; }   |     Represents the full contact info      |
| PBPartialData | { id?: string; first_name?: string; last_name?: string; phone_numbers?: string[]; } |      Represents a part of a contact       |

<br>

### Endpoints

The list of all the available routes and their corresponding information.

| Method 	|       Route      	|                         Request Body                         	|                   Response Body                  	| Status Code 	|
|:------:	|:----------------:	|:------------------------------------------------------------:	|:------------------------------------------------:	|:-----------:	|
|   GET  	|      /status     	|                              N/A                             	|                     "online"                     	|     200     	|
|  POST  	|  /auth/register  	|                        AuthData as JWT                       	|                  AuthData as JWT                 	|     200     	|
| DELETE 	| /api/contact/:id 	|                              N/A                             	|                        N/A                       	|     205     	|
|   GET  	| /api/contact/:id 	|                              N/A                             	|                      PBData                      	|     200     	|
|  PATCH 	| /api/contact/:id 	| { first_name?, last_name?, phone_numbers? } in PBPartialData 	|                        N/A                       	|     205     	|
|   PUT  	|   /api/contact   	|  { first_name, last_name, phone_numbers? } in PBPartialData  	|                      PBData                      	|     201     	|
| DELETE 	|   /api/contacts  	|                   { id } in PBPartialData[]                  	|                      string                      	|     200     	|
|   GET  	|   /api/contacts  	|                              N/A                             	| { id, first_name, last_name } in PBPartialData[] 	|     200     	|

<br>

### Cache Logic

Used to improve API performance and lower database operations.

| Method |      Route       |                                                                                      Description                                                                                       | isValid | isOrdered |
| :----: | :--------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----: | :-------: |
| DELETE | /api/contact/:id |                                                                      Removes the data from the DB and the cache.                                                                       |   \*    |    \*     |
|  GET   | /api/contact/:id |                                                    Returns the data from cache if isValid() is true, else, will get it from the DB.                                                    |   \*    |    \*     |
| PATCH  | /api/contact/:id |                                     Updates the DB and cache and returns the updated data. Sets the isOrdered() to false if there's a name change.                                     |   \*    |  false\*  |
|  PUT   |   /api/contact   |                                           Inserts the data to the DB and cache and returns the inserted data. Sets the isOrdered() to false.                                           |   \*    |   false   |
| DELETE |  /api/contacts   |                                        Deletes the contacts on the DB and cache. Sets the isValid() to false if at least 1 contact was deleted.                                        | false\* |    \*     |
|  GET   |  /api/contacts   | Returns the data from cache if isValid() and isOrdered() are true, else, will get all the contacts from the DB and updates the cache after, setting isValid() and isOrdered() to true. | true\*  |  true\*   |

\* = remains unchanged

<br>

### TypeGuard

Used for input and output validation.

|   Property    |                                                     Requirement                                                      |         Error         |
| :-----------: | :------------------------------------------------------------------------------------------------------------------: | :-------------------: |
|      id       |                          Data is not null or undefined; Id is a string with a length of 24.                          |      Invalid ID       |
|  first_name   |                   Data is not null or undefined; First name is a string with at least 1 character.                   |  Invalid First Name   |
|   last_name   |                   Data is not null or undefined; Last name is a string with at least 1 character.                    |   Invalid Last Name   |
| phone_numbers | Data is not null or undefined. Phone numbers is an array of strings with at least 1 character for each phone number. | Invalid Phone Numbers |
