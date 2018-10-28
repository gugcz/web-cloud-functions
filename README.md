# web-cloud-functions
Firebase Cloud Functions for GUG.cz presentation web

## Install: 

Recomended NODE version: v6.11.5.
StillWorking node version: v8.9.4
- this is potencial source of issues

install/update firebase-tools globally
```javascript
npm install -g firebase-tools
```

in directory `functions` run: 
```javascript 
npm install || yarn
```

## Configuration:
In directory `functions` create file `config.js` and put this line for posting to slack:

```
exports.slackPostingUrl = 'https://hooks.slack.com/services/.../.../...';
``` 

## Run: 

```javascript 
firebase serve --only functions
```

## Deploy: 

```javascript
firebase deploy --only functions
firebase deploy --only functions:saveEvent
```

### Save Event Function:

There is a structure which is needed for save event function as part of body `eventData` : 
```javascript
eventData = {
  // Required fields
  "name" : "Event Name",
  "regFormLink" : "https://forms.google.com",
  "created" : "2018-02-03T18:00:00.000Z",
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
