var _ = require('underscore');
var redis = require("redis"),
    util = require('util'),
    host = '127.0.0.1',
    port = 6379,
    EventEmitter = require('events').EventEmitter;
var QueueClient = require('./QueueClient');
function Commander(queueName, options) {
    var self = this;
    this.queueName = queueName;
    if (!queueName) throw new Error('Queue name not defined');
    this.options = _.extend({
        redis: {
            host: host,
            port: port
        },
        rabbitmq: {},
        log: function () {
        },
        error: function () {
            console.log.apply(console, arguments);
        }
    }, options || {});
    this.log = this.options.log;
    this.error = this.options.error;
    this.publisher = this.createRedisClient();
    this.subscriber = this.createRedisClient();
    this.queueClient = new QueueClient(this.options.rabbitmq);
    this.queueClient.connect();
}

module.exports = Commander;

/* Inherit from EventEmitter */
util.inherits(Commander, EventEmitter);

Commander.prototype.reportError = function (err) {
    this.emit('error', err);
    this.error(err);
};

Commander.prototype.createRedisClient = function () {
    var self = this;
    var redisClient = redis.createClient({
        host: this.options.host,
        port: this.options.port
    });

    redisClient.on('error', function (err) {
        self.reportError(err);
    });

    redisClient.on('ready', function (err) {
        self.log('Connected to redis');
    });
    return redisClient;
};

Commander.prototype.getJobQueueName = function () {
    return this.queueName + ':jobs';
};

Commander.prototype.getCommandQueueName = function () {
    return this.queueName + ':commands';
};

Commander.prototype.getChannelName = function () {
    return this.queueName + ':channel';
};

Commander.prototype.encodeObj = function (obj) {
    var result;
    try {
        result = JSON.stringify(obj)
    }
    catch (e) {
        this.reportError(e);
    }
    return result;
};
Commander.prototype.decodeObj = function (str) {
    var result;
    try {
        result = JSON.parse(str);
    }
    catch (e) {
        this.reportError(e);
    }
    return result;
};

Commander.prototype.postJob = function (job) {
    this._send(this.getJobQueueName(), job);
};

Commander.prototype.sendCommand = function (command) {
    this._send(this.getCommandQueueName(), command);
};

Commander.prototype.sendMessage = function (data) {
    var dataString = this.encodeObj(data);
    var channelName = this.getChannelName();
    if (!dataString) return;
    this.publisher.publish(channelName, dataString);
};

Commander.prototype._send = function (queue, data) {
    var self = this;
    if (this.queueClient.connection) {
        return this.queueClient.publish(queue, data);
    }
    this.queueClient.once('connected', function () {
        self.queueClient.publish(queue, data);
    });
};


Commander.prototype.startListening = function () {
    if (this.listening) return;
    this.listening = true;
    var self = this;
    this.queueClient.subscribe(this.getJobQueueName(), function (job, cb) {
        var listenerCount = EventEmitter.listenerCount(self, 'job');
        if (!job) return;
        self.emit('job', job, function () {
            listenerCount--;
            if (listenerCount) return;
            process.nextTick(function () {
                cb();
            });
        });
    });
    this.queueClient.subscribe(this.getCommandQueueName(), function (command, cb) {
        self.emit('command', command);
        process.nextTick(function () {
            cb();
        });
    });
};

Commander.prototype.subscribe = function () {
    var channelName = this.getChannelName();
    var self = this;
    if (this.subscribed) return;
    this.subscribed = true;
    this.subscriber.on('message', function (channel, message) {
        if (channelName != channel) return;
        var messageObj = self.decodeObj(message);
        if (!message) return;
        process.nextTick(function () {
            self.emit('message', messageObj);
        });

    });
    this.subscriber.subscribe(channelName);
};

Commander.prototype.unsubscribe = function () {
    var channelName = this.getChannelName();
    this.subscriber.unsubscribe(channelName);
};
