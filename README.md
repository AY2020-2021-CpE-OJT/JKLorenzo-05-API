# JKLorenzo-05-API
A heroku-hosted API for the [task 5 phonebook app](https://github.com/AY2020-2021-CpE-OJT/JKLorenzo-05-APP).

### Structures

| Name          	| Properties                                                                              	|
|---------------	|-----------------------------------------------------------------------------------------	|
| PBData        	| {  id: string;  first_name: string;  last_name: string;  phone_numbers: string[]; }     	|
| PBPartialData 	| {  id?: string;  first_name?: string;  last_name?: string;  phone_numbers?: string[]; } 	|


## Endpoints

| Method 	|       Route      	|                       Request Body                      	|                  Response Body                 	|
|:------:	|:----------------:	|:-------------------------------------------------------:	|:----------------------------------------------:	|
| DELETE 	| /api/contact/:id 	|                           N/A                           	|                      "OK"                      	|
|   GET  	| /api/contact/:id 	|                           N/A                           	|                     PBData                     	|
|  PATCH 	| /api/contact/:id 	| {first_name, last_name, phone_numbers} in PBPartialData 	|                      "OK"                      	|
|   PUT  	|   /api/contact   	| {first_name, last_name, phone_numbers} in PBPartialData 	|                     PBData                     	|
| DELETE 	|   /api/contacts  	|                 {id} in PBPartialData[]                 	|                  delete count                  	|
|   GET  	|   /api/contacts  	|                           N/A                           	| {id, first_name, last_name} in PBPartialData[] 	|


## Cache Manager Logic

#### * = remains unchanged

| Method 	| Route            	| Description                                                                                                                                                                            	| isValid 	| isOrdered 	|
|--------	|------------------	|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|---------	|-----------	|
| DELETE 	| /api/contact/:id 	| Removes the data from the DB and the cache.                                                                                                                                            	| *       	| *         	|
| GET    	| /api/contact/:id 	| Returns the data from cache if isValid() is true, else, will get it from the DB.                                                                                                       	| *       	| *         	|
| PATCH  	| /api/contact/:id 	| Updates the DB and cache and returns the updated data. Sets the isOrdered() to false if there's a name change.                                                                         	| *       	| false*    	|
| PUT    	| /api/contact     	| Inserts the data to the DB and cache and returns the inserted data. Sets the isOrdered() to false.                                                                                     	| *       	| false     	|
| DELETE 	| /api/contacts    	| Deletes the contacts on the DB and cache. Sets the isValid() to false if at least 1 contact was deleted.                                                                               	| false*  	| *         	|
| GET    	| /api/contacts    	| Returns the data from cache if isValid() and isOrdered() are true, else, will get all the contacts from the DB and updates the cache after, setting isValid() and isOrdered() to true. 	| true    	| true      	|

## Type Guard Logic

#### * = default when custom error message is undefined

|    Property   	|                                                      Requirement                                                     	|          Error         	|
|:-------------:	|:--------------------------------------------------------------------------------------------------------------------:	|:----------------------:	|
|       id      	|                          Data is not null or undefined; Id is a string with a length of 24.                          	|       INVALID_ID*      	|
|   first_name  	|                   Data is not null or undefined; First name is a string with at least 1 character.                   	|   INVALID_FIRST_NAME*  	|
|   last_name   	|                    Data is not null or undefined; Last name is a string with at least 1 character.                   	|   INVALID_LAST_NAME*   	|
| phone_numbers 	| Data is not null or undefined. Phone numbers is an array of strings with at least 1 character for each phone number. 	| INVALID_PHONE_NUMBERS* 	|
