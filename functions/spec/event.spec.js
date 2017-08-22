const eventModule = require('./../event')
var UrlCreator = eventModule.UrlCreator
describe("An UrlCreator for single event", function () {

    var usedUrlsMock = [
        '3d-tisk',
        'gdg-garage',
        'ctvrtkon',
    ]

    var event = {
        "name": "A2 Workshop",
        "subtitle": "Přijď si A2 vyzkoušet v praxi!",
        "isMultipleEvent": false,
        "dates": {
            "start": "2017-09-03T16:00:00.000Z",
            "end": "2017-09-03T18:00:00.000Z"
        },
        "description": "...",
        "venue": "Brno",
        "chapters": [
            "gdg-brno"
        ],
        "guarantee": "-Kq-U7--b_XqZmhYoy3v",
        "organizers": {
            "-Kq-Tz6KoT_RyM7MF_qZ": true,
            "-Kq-U7--b_XqZmhYoy3v": true
        },
        "links": [
            {
                "url": "plus.google.com",
                "type": "google-plus"
            },
            {
                "url": "facebook.com",
                "type": "facebook"
            },
            {
                "url": ""
            }
        ]
    }

    it("creates url as event name without diacritics and spaces will be replaced by dash", function () {
        let NameAndUrl = function (name, url) {
            this.name = name
            this.url = url
        };

        let namesAndUrls = [
            new NameAndUrl('Angular 2 Workshop', 'angular-2-workshop'),
            new NameAndUrl('GDG Garage Žďár', 'gdg-garage-zdar'),
            new NameAndUrl('Čtvrtkon', 'ctvrtkon'),
            new NameAndUrl('3D tisk', '3d-tisk'),
            new NameAndUrl('ČSOB Hackathon', 'csob-hackathon')
        ];

        let testNameToUrl = function (nameAndUrl) {
            event.name = nameAndUrl.name
            var urlCreator = new UrlCreator(event, [])
            expect(urlCreator.getUrl()).toBe(nameAndUrl.url)
        }

        namesAndUrls.forEach(testNameToUrl);
    });

    it("creates unique url, in case of problem it add city name to url", function () {
        let NameCityAndUrl = function (name, city, url) {
            this.name = name
            this.city = city
            this.url = url
        };


        let namesCitiesAndUrls = [
            new NameCityAndUrl('3D tisk', 'Brno', '3d-tisk-brno'),
            new NameCityAndUrl('GDG Garage', 'Žďár', 'gdg-garage-zdar'),
            new NameCityAndUrl('Čtvrtkon', 'Budějovice', 'ctvrtkon-budejovice')
        ];

        let testNameToUrl = function (nameCityAndUrl) {
            event.name = nameCityAndUrl.name
            event.venue = nameCityAndUrl.city
            var urlCreator = new UrlCreator(event, usedUrlsMock)
            expect(urlCreator.getUrl()).toBe(nameCityAndUrl.url)
        }

        namesCitiesAndUrls.forEach(testNameToUrl);
    });

    it("creates unique url, in case of problem with added city it adds number to url", function () {
        let NameCityAndUrl = function (name, city, url) {
            this.name = name
            this.city = city
            this.url = url
        };

        usedUrlsMock = [
            '3d-tisk',
            '3d-tisk-brno',
            'gdg-garage',
            'gdg-garage-brno',
            'gdg-garage-zdar',
            'gdg-garage-zdar-2',
            'ctvrtkon',
            'ctvrtkon-budejovice'
        ]


        let namesCitiesAndUrls = [
            new NameCityAndUrl('3D tisk', 'Brno', '3d-tisk-brno-2'),
            new NameCityAndUrl('GDG Garage', 'Žďár', 'gdg-garage-zdar-3'),
            new NameCityAndUrl('Čtvrtkon', 'Budějovice', 'ctvrtkon-budejovice-2')
        ];

        let testNameToUrl = function (nameCityAndUrl) {
            event.name = nameCityAndUrl.name
            event.venue = nameCityAndUrl.city
            var urlCreator = new UrlCreator(event, usedUrlsMock)
            expect(urlCreator.getUrl()).toBe(nameCityAndUrl.url)
        }

        namesCitiesAndUrls.forEach(testNameToUrl);
    });


});
