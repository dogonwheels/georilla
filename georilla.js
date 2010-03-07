var georilla = {};
georilla.punch = function () {
    console.log('Patching geolocation with georilla');
    navigator.__defineGetter__('geolocation', function () { return georilla.geolocation; });
};

georilla.geolocation = {};
georilla.geolocation.getCurrentPosition = function (successCallback, errorCallback, options) {
    var position = {
        coords: {
            latitude: 200,
            longitude: 100,
            accuracy: 50,
            altitude: 0,
            altitudeAccuracy: 100,
            speed: -1,
            heading: 10,
        }
    };
    var success = function () {
        successCallback(position);
    };

    setTimeout(success, 1000);
};
