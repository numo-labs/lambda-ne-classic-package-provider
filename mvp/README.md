## Building the *Skateboard* Hotel Candidate List

![mvp-skateboard-car](https://cloud.githubusercontent.com/assets/194400/13809689/d6864572-eb63-11e5-8ab1-1264beb6e322.png)

Until we have a Lambda-based Tagging System where we can lookup a *list*
of "*Candiate*" hotels for a given region/geo, we need to construct the list
*manually* that we can use to request a list of packages from the `/trips` API.

API Gateway does not allow us to *dynamically* specify the *range*
of hotels we want to fetch from the `/hotels` endpoint.  
i.e: requesting `/hotels/0/30` does not work.

Therefore I have written a *temporary* script to create the "*Candidate list*".
These are the steps it takes:

+ Fetch the hotels from NE API in batches and store the JSON *locally* in `all_hotels` array
+ Sort the hotels by guestRating (*highest to lowest*) - so we get the *best* hotels!
+ Extract *just* the Hotel ID (`wvId`) and create an array.

`candiate_list.csv` is the ***full*** list of **3652** Hotel IDs.
its only **24kb**:
![numo-hotel-candidate-list-24kb](https://cloud.githubusercontent.com/assets/194400/13814307/a2055c6a-eb7d-11e5-9ea6-f7f74714c698.png)

That means we can load the CSV in the lambda,
then we can *either* get a *random* selection of 30 hotels
to use in the `/trips` search ... *or* we can just pick the first (*top*) 30.
