"use strict";

var helpers = require("./helpers");
var Devices;

// Wrapper for AT&T M2X Device API
//
// https://m2x.att.com/developer/documentation/device
Devices = function(client, keysAPI) {
    this.client = client;
    this.keysAPI = keysAPI;
};

// List/search the catalog of public devices
//
// This allows unauthenticated users to search Devices from other users
// that have been marked as public, allowing them to read public Device
// metadata, locations, streams list, and view each Devices' stream metadata
// and its values.
//
// https://m2x.att.com/developer/documentation/v2/device#List-Search-Public-Devices-Catalog
Devices.prototype.catalog = function(params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    return this.client.get("/devices/catalog", { qs: params || {} }, callback);
};

// Retrieve the list of devices accessible by the authenticated API key that
// meet the search criteria
//
// https://m2x.att.com/developer/documentation/v2/device#List-Search-Devices
Devices.prototype.list = function(params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    return this.client.get("/devices", { qs: params || {} }, callback);
};

// List the devices tags for the authenticated user
//
// https://m2x.att.com/developer/documentation/v2/device#List-Device-Tags
Devices.prototype.tags = function(callback) {
    return this.client.get("/devices/tags", callback);
};

// Create a new device
//
// https://m2x.att.com/developer/documentation/v2/device#Create-Device
Devices.prototype.create = function(params, callback) {
    return this.client.post("/devices", {
        headers: { "Content-Type": "application/json" },
        params: params
    }, callback);
};

// Update a device
//
// https://m2x.att.com/developer/documentation/v2/device#Update-Device-Details
Devices.prototype.update = function(id, params, callback) {
    return this.client.put(helpers.url("/devices/%s", id), {
        headers: { "Content-Type": "application/json" },
        params: params
    }, callback);
};

// Return the details of the supplied device
//
// https://m2x.att.com/developer/documentation/v2/device#View-Device-Details
Devices.prototype.view = function(id, callback) {
    return this.client.get(helpers.url("/devices/%s", id), callback);
};

// Return the current location of the supplied device
//
// Note that this method can return an empty value (response status
// of 204) if the device has no location defined.
//
// https://m2x.att.com/developer/documentation/v2/device#Read-Device-Location
Devices.prototype.location = function(id, callback) {
    return this.client.get(helpers.url("/devices/%s/location", id), callback);
};

// Update the current location of the device
//
// https://m2x.att.com/developer/documentation/v2/device#Update-Device-Location
Devices.prototype.updateLocation = function(id, params, callback) {
    return this.client.put(
        helpers.url("/devices/%s/location", id),
        { params: params },
        callback
    );
};

// Delete Device Location History
//
// Delete location history details of an existing Device
//
// https://m2x.att.com/developer/documentation/v2/device#Delete-Location-History
Devices.prototype.deleteLocationHistory = function(id, params, callback) {	
    return this.client.del(
        helpers.url("/devices/%s/location/waypoints", id),
    	{ params: params },
    	callback
    );
};

// Return a list of the associated streams for the supplied device
//
// https://m2x.att.com/developer/documentation/v2/device#List-Data-Streams
Devices.prototype.streams = function(id, callback) {
    return this.client.get(helpers.url("/devices/%s/streams", id), callback);
};

// Update stream's properties
//
// If the stream doesn't exist it will create it.
//
// https://m2x.att.com/developer/documentation/v2/device#Create-Update-Data-Stream
Devices.prototype.updateStream = function(id, name, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }

    return this.client.put(
        helpers.url("/devices/%s/streams/%s", id, name),
        { params: params },
        callback
    );
};

// Export all data streams for the supplied device
//
// https://m2x.att.com/developer/documentation/v2/device#Export-Values-from-all-Data-Streams-of-a-Device
Devices.prototype.exportAllDataStreamsByDeviceId = function(id, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }

    return this.client.get(
        helpers.url("/devices/%s/values/export.csv", id),
        { params: params },
        callback
    );
};


// Export all data streams for the supplied device
//
// https://m2x.att.com/developer/documentation/v2/device#Export-Values-from-all-Data-Streams-of-a-Device
Devices.prototype.getValuesFromAllDataStreams = function(url, callback) {
    return this.client.get(url, callback);
};

// Update multiple streams
//
// names is a string array containing the stream names to be updated.
//
// Example usage:
//
//   devices.updateStreams(id, ["stream1", "stream2"], function(response, responses) {
//      if (response.isError()) {
//        console.log("It failed.");
//      } else {
//        console.log("Success!");
//      }
//      console.log("stream1 -> ", responses["stream1"]);
//      console.log("stream2 -> ", responses["stream2"]);
//   });
//
//
// Example usage for applying the same stream properties to each:
//
//   devices.updateStreams(id, ["stream1", "stream2"], {"type": "numeric"}, function(response, responses) {
//     ...
//   });
//
//
// Example usage for applying seperate stream properties:
//
//   var streams = {
//     "stream1": {"type": "numeric"},
//     "stream2": {
//        "unit": {
//            "label": "percentage",
//            "symbol": "%"
//        },
//        "type": "numeric"
//     }
//   }
//   devices.updateStreams(id, streams, function(response, responses) {
//     ...
//   });
//
//
// The callback will receive response and responses, where:
//   response is the last response. It can be used to indicate if the whole
//            process was successful or not.
//   responses is a map with the responses for each stream update.
//
// For properties details, see:
// https://m2x.att.com/developer/documentation/v2/device#Create-Update-Data-Stream
Devices.prototype.updateStreams = function(id, names, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    if (typeof names === "object") {
        var newNames = [];
        var newParams = [];
        for (var key in names) {
            newNames.push(key);
            newParams.push(names[key]);
        }
        names = newNames;
        params = newParams;
    }

    var self = this;
    var updateNext = function(index, responses) {
        var name = names[index];

        var streamParams = Array.isArray(params) ? params[index] : params;
        self.updateStream(id, name, streamParams, function(response) {
            responses[name] = response;

            if (response.isError() || index === 0) {
                callback(response, responses);
            } else {
                updateNext(index - 1, responses);
            }
        });
    };

    updateNext(names.length - 1, {});
};

// Set the stream value
//
// https://m2x.att.com/developer/documentation/v2/device#Update-Data-Stream-Value
Devices.prototype.setStreamValue = function(id, name, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }

    return this.client.put(
        helpers.url("/devices/%s/streams/%s/value", id, name),
        { params: params },
        callback
    );
};

// Return the details of the supplied stream
//
// https://m2x.att.com/developer/documentation/v2/device#View-Data-Stream
Devices.prototype.stream = function(id, name, callback) {
    return this.client.get(
        helpers.url("/devices/%s/streams/%s", id, name),
        callback
    );
};

// List values from an existing data stream associated with a
// specific device, sorted in reverse chronological order (most
// recent values first).
//
// https://m2x.att.com/developer/documentation/v2/device#List-Data-Stream-Values
Devices.prototype.streamValues = function(id, name, params, callback) {
    var url = helpers.url("/devices/%s/streams/%s/values", id, name);

    if (typeof params === "function") {
        callback = params;
        params = {};
    }

    return this.client.get(url, { qs: params }, callback);
};

// Sample values from an existing stream
//
// https://m2x.att.com/developer/documentation/v2/device#Data-Stream-Sampling
Devices.prototype.sampleStreamValues = function(id, name, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    return this.client.get(
        helpers.url("/devices/%s/streams/%s/sampling", id, name),
        { qs: params },
        callback
    );
};

// Return the stream stats
//
// https://m2x.att.com/developer/documentation/v2/device#Data-Stream-Stats
Devices.prototype.streamStats = function(id, name, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    return this.client.get(
        helpers.url("/devices/%s/streams/%s/stats", id, name),
        { qs: params },
        callback
    );
};

// Post timestamped values to an existing stream
//
// https://m2x.att.com/developer/documentation/v2/device#Post-Data-Stream-Values
Devices.prototype.postValues = function(id, name, values, callback) {
    return this.client.post(
        helpers.url("/devices/%s/streams/%s/values", id, name),
        { params: { values: values } },
        callback
    );
};

// Delete values from a stream by a date range
//
// https://m2x.att.com/developer/documentation/v2/device#Delete-Data-Stream-Values
Devices.prototype.deleteStreamValues = function(id, name, params, callback) {
    return this.del(
        helpers.url("/devices/%s/streams/%s/values", id, name),
        { params: params },
        callback
    );
};

// Delete the stream (and all its values) from the device
//
// https://m2x.att.com/developer/documentation/v2/device#Delete-Data-Stream
Devices.prototype.deleteStream = function(id, name, callback) {
    return this.client.del(helpers.url("/devices/%s/streams/%s", id, name), callback);
};

// Post multiple values to multiple streams
//
// This method allows posting multiple values to multiple streams
// belonging to a device. All the streams should be created before
// posting values using this method.
//
// https://m2x.att.com/developer/documentation/v2/device#Post-Device-Updates--Multiple-Values-to-Multiple-Streams-
Devices.prototype.postMultiple = function(id, values, callback) {
    return this.client.post(helpers.url("/devices/%s/updates", id), {
        headers: { "Content-Type": "application/json" },
        params: { values: values }
    }, callback);
};


// Update single value to multiple streams
//
// This method allows posting single value to multiple streams
// belonging to a device. All the streams should be created before
// posting values using this method.
//
// https://m2x.att.com/developer/documentation/v2/device#Post-Device-Update--Single-Values-to-Multiple-Streams-
Devices.prototype.postDeviceUpdate = function(id, params, callback) {
    return this.client.post(helpers.url("/devices/%s/update", id), {
        headers: {"Content-Type": "application/json"},
        params: params
    }, callback);
};

//Retrieve the list of devices accessible by the
// authenticated API key that meet the search criteria.
//
// https://m2x.att.com/developer/documentation/v2/device#Search-Devices

Devices.prototype.searchDevices = function(params, callback) {
    return this.client.post("/devices/search", { params: params }, callback);
};

// Return a list of access log to the supplied device
//
// https://m2x.att.com/developer/documentation/v2/device#View-Request-Log
Devices.prototype.log = function(id, callback) {
    return this.client.get(helpers.url("/devices/%s/log", id), callback);
};

// Delete an existing device
//
// https://m2x.att.com/developer/documentation/v2/device#Delete-Device
Devices.prototype.deleteDevice = function(id, callback) {
  return this.del(helpers.url("/devices/%s", id), callback);
};

// Returns a list of API keys associated with the device
Devices.prototype.keys = function(id, callback) {
    return this.client.get("/keys", { qs: { device: id } }, callback);
};

// Creates a new API key associated to the device
//
// If a parameter named `stream` is supplied with a stream name, it
// will create an API key associated with that stream only.
Devices.prototype.createKey = function(id, params, callback) {
    this.keysAPI.create(helpers.extend(params, { device: id }), callback);
};

// Updates an API key properties
Devices.prototype.updateKey = function(id, key, params, callback) {
    this.keysAPI.update(key, helpers.extend(params, { device: id }), callback);
};

// Return the location history of the supplied device.
//
// https://m2x.att.com/developer/documentation/v2/device#Read-Device-Location-History
Devices.prototype.locationHistory = function(id, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }

    return this.client.get(helpers.url("/devices/%s/location/waypoints", id), { qs: params }, callback);
};

// Read Device Metadata
//
// Get custom metadata of an existing Device.
//
// https://m2x.att.com/developer/documentation/v2/device#Read-Device-Metadata
Devices.prototype.metadata = function(id, callback) {
    return this.client.get(helpers.url("/devices/%s/metadata", id), callback);
};

// Read Device Metadata Field
//
// Get the value of a single custom metadata field from an existing Device.
//
// https://m2x.att.com/developer/documentation/v2/device#Read-Device-Metadata-Field
Devices.prototype.metadataField = function(id, field, callback) {
    return this.client.get(helpers.url("/devices/%s/metadata/%s", id, field), callback);
};

// Update Device Metadata
//
// https://m2x.att.com/developer/documentation/v2/device#Update-Device-Metadata
Devices.prototype.updateMetadata = function(id, params, callback) {
    return this.client.put(
        helpers.url("/devices/%s/metadata", id),
        { params: params },
        callback
    );
};

// Update Device Metadata Field
//
// https://m2x.att.com/developer/documentation/v2/device#Update-Device-Metadata-Field
Devices.prototype.updateMetadataField = function(id, field, value, callback) {
    return this.client.put(
        helpers.url("/devices/%s/metadata/%s", id, field),
        { params: { value: value}},
        callback
    );
};

// Returns the stream values from all data streams of the device
//
//https://m2x.att.com/developer/documentation/v2/device#Search-Values-from-all-Data-Streams-of-a-Device
Devices.prototype.searchDatastreamValues = function(id, params, callback) {
    return this.client.post(helpers.url("/devices/%s/values/search", id), {
        params: params
    }, callback);
};

module.exports = Devices;
