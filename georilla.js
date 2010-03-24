var georilla = {};

georilla.patch = function () {
    console.log('Patching geolocation with georilla');
    var geo = georilla.newGeolocation();
    navigator.__defineGetter__('geolocation', function () { return geo; });
};

var exists = function (something) {
    return typeof(something) !== 'undefined';
};


georilla.newGeolocation = function () {
    var geo = {
        currentTime: 0,
        nextWatchId: 0,
        watchSuccessCallbacks: {}
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
        geo.currentTime = position.timestamp;

        // If we have any active callbacks, let them know and remove them
        if (exists(geo.successCallback)) {
            geo.successCallback(position);
            delete geo.successCallback;
        }

        // And let any watchers know
        for (watchId in geo.watchSuccessCallbacks) {
            if (geo.watchSuccessCallbacks.hasOwnProperty(watchId)) {
                var callbacks = geo.watchSuccessCallbacks[watchId];
                callbacks.onSuccess(position);
                callbacks.resetTimeout();
                callbacks.startTimeout();
            }
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
    geo.watchPosition = function (successCallback, errorCallback, options) {
        geo.nextWatchId++;

        var maximumAge = 0;
        if (exists(options) && exists(options.maximumAge) && (options.maximumAge > 0)) {
            maximumAge = options.maximumAge;
        }
                
        var timeout = Infinity;
        if (exists(options) && exists(options.timeout)) {
            timeout = options.timeout;
        }
        
        var previousTimerId = -1;
        var resetTimeout = function () {
            clearTimeout(previousTimerId);
        };
        var startTimeout = function () {
            var onError = function () {
                if (exists(errorCallback)) {
                    errorCallback( { code:'TIMEOUT' } );
                }
                startTimeout();
            };
            previousTimerId = setTimeout(onError, timeout);
        };
        startTimeout();

        if (exists(geo.currentPosition) && 
            (geo.currentTime - geo.currentPosition.timestamp) <= maximumAge) {
            successCallback(geo.currentPosition);
        }

        geo.watchSuccessCallbacks[geo.nextWatchId] = {
            onSuccess: successCallback,
            resetTimeout: resetTimeout,
            startTimeout: startTimeout
        }
        
        return geo.nextWatchId;
    };

    /*
       void clearWatch(in long watchId);
    */
    geo.clearWatch = function (watchId) {
        geo.watchSuccessCallbacks[watchId].resetTimeout();
        delete(geo.watchSuccessCallbacks[watchId]);
    }

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
