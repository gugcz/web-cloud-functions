# web-cloud-functions
Firebase Cloud Functions for GUG.cz presentation web



### Save Event Function:

There is a structure which is needed for save event function as part of body `eventData` : 
```json
{
  // Required fields
  "name" : "Event Name",
  "regFormLink" : "https://forms.google.com",
  "dates" : {
    "end" : "2018-02-03T18:00:00.000Z",
    "isRepeatingEvent" : false,
    "start" : "2018-02-03T16:00:00.000Z"
  },
  "venue" : {
      "address" : "Venue Address",
      "city" : "Venue City",
      "coordinates" : {
        "lat" : 10.0,
        "lng" : 10.0
      },
      "howTo" : "", // Optional
      "mapUrl" : "https://maps.google.com/",
      "name" : "Venue Name"
    },
  "chapters" : {
      "chapterId" : true,
      "chapterId..." : true
    },
  "organizers" : {
      "orgId" : true,
      "orgId..." : true
  },
  "guarantee" : "orgId", // Guarantee have to be also in organizers list
  "published" : true,
  
  // Optional fields
  "subtitle" : "Event Subtitle",
  "description" : "Event Desciption (can be markdown)",
  "cover" : "https://cover-url.com",
  "links" : [ {
      "type" : "facebook",
      "url" : "facebook.com"
    }, {
      "type" : "meetup",
      "url" : "meetup.com"
    }, {
      "type" : "google-plus",
      "url" : "plus.google.com"
    } ]
  
}

```
