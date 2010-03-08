var georilla = {};
georilla.punch = function () {
    console.log('Patching geolocation with georilla');
    navigator.__defineGetter__('geolocation', function () { return georilla.geolocation; });
};

georilla.geolocation = {};

/*
   void getCurrentPosition(in PositionCallback successCallback,
                           in optional PositionErrorCallback errorCallback,
                           in optional PositionOptions options);
*/
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
    // Always succeed for now
    // FIXME: Need to allow for errors
    // FIXME: Redirect position to a cursor (runner) and device for introducing
    // errors
    var success = function () {
        successCallback(position);
    };

    setTimeout(success, 1000);
};

/*
   long watchPosition(in PositionCallback successCallback,
                      in optional PositionErrorCallback errorCallback,
                      in optional PositionOptions options);
*/

/*
   void clearWatch(in long watchId);
*/

/*
 [Callback=FunctionOnly, NoInterfaceObject]
 interface PositionCallback {
   void handleEvent(in Position position);
 };

 [Callback=FunctionOnly, NoInterfaceObject]
 interface PositionErrorCallback {
   void handleEvent(in PositionError error);
 };

 [Callback, NoInterfaceObject]
  interface PositionOptions {
    attribute boolean enableHighAccuracy;
    attribute long timeout;
    attribute long maximumAge;
  };

*/
