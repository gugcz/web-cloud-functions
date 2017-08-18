const eventModule = require('./../event')
describe("A getEventUrl function", function() {



    it("returns event name without diacritics and spaces will be replaced by dash", function() {
        let NameAndUrl = function (name, url) {
            this.name = name
            this.url = url
        };

        let namesAndUrls = [
            new NameAndUrl('Angular 2 Workshop', 'angular-2-workshop'),
            new NameAndUrl('GDG Garage Žďár #1', 'gdg-garage-zdar-1'),
            new NameAndUrl('Čtvrtkon Vol. 1', 'ctvrtkon-vol-1'),
            new NameAndUrl('ČSOB Hackathon', 'csob-hackathon')
        ];

        let testNameToUrl = nameAndUrl => expect(eventModule.getEventUrl(nameAndUrl.name)).toBe(nameAndUrl.url);

        namesAndUrls.forEach(testNameToUrl);
    });
});
