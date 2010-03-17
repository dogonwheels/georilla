var georilla = {};

georilla.punch = function () {
    console.log('Patching geolocation with georilla');
    var geo = georilla.newGeolocation();
    navigator.__defineGetter__('geolocation', function () { return geo; });
};

var exists = function (something) {
    return typeof(something) !== 'undefined';
};


georilla.newGeolocation = function () {
    var geo = {
        currentTime: 0
    };
    /*
       void getCurrentPosition(in PositionCallback successCallback,
                               in optional PositionErrorCallback errorCallback,
                               in optional PositionOptions options);
    */
    geo.getCurrentPosition = function (successCallback, errorCallback, options) {
        var maximumAge = 0;
        if (exists(options) && exists(options.maximumAge)) {
            maximumAge = options.maximumAge;
        }

        if (exists(geo.currentPosition) && 
            (geo.currentTime - geo.currentPosition.timestamp) <= maximumAge) {
            // We have a cached position, callback straightaway
            successCallback(geo.currentPosition);
            return;
        }

        if (exists(options) && exists(options.timeout)) {
            var timeout = options.timeout;
            if (timeout <= 0) {
                errorCallback({code: 'TIMEOUT'});
                return;
            }
        }

        // Currently don't have any positions, but we should callback when
        // we do get one
        geo.successCallback = successCallback;            
        
        if (exists(timeout)) {
            var onTimeout = function () {
                delete geo.successCallback;
                errorCallback({code: 'TIMEOUT'});
            };
            setTimeout(onTimeout, timeout);
        }

    };

    geo.setCurrentPosition = function (position) {
        geo.currentPosition = position;
        // If we have any active callbacks, let them know and remove them
        if (exists(geo.successCallback)) {
            geo.successCallback(position);
            delete geo.successCallback;
        }
    };

    geo.setCurrentTime = function (timestamp) {
        geo.currentTime = timestamp;
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

      interface Position {
        readonly attribute Coordinates coords;
        readonly attribute DOMTimeStamp timestamp;
      };
      
      interface Coordinates {
        readonly attribute double latitude;
        readonly attribute double longitude;
        readonly attribute double? altitude;
        readonly attribute double accuracy;
        readonly attribute double? altitudeAccuracy;
        readonly attribute double? heading;
        readonly attribute double? speed;
      };
      
      interface PositionError {
        const unsigned short PERMISSION_DENIED = 1;
        const unsigned short POSITION_UNAVAILABLE = 2;
        const unsigned short TIMEOUT = 3;
        readonly attribute unsigned short code;
        readonly attribute DOMString message;
      };
      
    */
    return geo;
};
