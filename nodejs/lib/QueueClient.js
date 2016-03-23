var EventEmitter = require("events").EventEmitter,
    util = require('util'),
    host = '127.0.0.1',
    port = 5672,
    username = 'guest',
    password = 'guest'
    amqp = require('amqplib/callback_api');
var _ = require('underscore');
function QueueClient(opt) {
    // Super constructor
    EventEmitter.call(this);
    var options = _.extend({
        host: host,
        port: port,
        username: username,
        password: password
    }, opt);
    this.log = options.log || function () {
            console.log.apply(console, arguments);
        };
    delete options.log;
    this.options = options;
    this.publishChannels = {};
}

module.exports = QueueClient;
util.inherits(QueueClient, EventEmitter);

QueueClient.prototype.connect = function (cb) {
    var self = this;
    this.connection = amqp.connect(this.options, function (err, conn) {
        self.log('Connect to RabbitMQ:', err || 'OK');
        if (err) {
            self.emit('error', err);
            return cb && cb(err);
        }
        self.connection = conn;
        self.emit('connected', conn);
        cb && cb(err, conn);
    });
};

QueueClient.prototype._createQueueChannel = function (channelName, queueName, cb) {
    var self = this;
    this.connection.createChannel(function (err, ch) {
        self.log('Create RabbitMQ channel:', err || 'OK');
        if (err) {
            self.emit('error', err);
            return cb && cb(err);
        }
        ch.assertQueue(queueName, {ack: true, durable: true}, function (err) {
            self.log('Ensure that queue exists:', err || 'OK');
            if (channelName) self.publishChannels[channelName] = ch;
            self.emit('channel', ch, channelName);
            cb && cb(err, ch);
        });

    });
};

QueueClient.prototype.publish = function (queueName, data) {
    var self = this;
    if (!this.connection) {
        return this.once('connected', function () {
            self.publish(queueName, data);
        })
    }
    var channel = this.publishChannels[queueName];
    if (channel) {
        return channel.sendToQueue(queueName, self.encodeObj(data));
    }
    this._createQueueChannel(queueName, queueName, function (err, ch) {
        if (err) return self.emit('error', err);
        ch.sendToQueue(queueName, self.encodeObj(data));
    });
};

QueueClient.prototype.subscribe = function (queueName, doWork) {
    var self = this;
    if (!this.connection) {
        return this.once('connected', function () {
            self.subscribe(queueName, doWork);
        })
    }
    this._createQueueChannel(null, queueName, function (err, ch) {
        if (err) return self.emit('error', err);
        ch.prefetch(1, false, function () {
            ch.consume(queueName, function (msg) {
                var data = self.decodeObj(msg.content);
                if (!data) return ch.ack(msg);
                doWork(data, function () {
                    ch.ack(msg);
                });
            });
        });
    });
};

QueueClient.prototype.encodeObj = function (obj) {
    var result;
    try {
        result = new Buffer(JSON.stringify(obj), 'utf-8');
    }
    catch (e) {
        this.emit('error', e);
        this.log(e);
    }
    return result;
};

QueueClient.prototype.decodeObj = function (buff) {
    var result;
    try {
        result = JSON.parse(buff.toString('utf-8'));
    }
    catch (e) {
        this.emit('error', e);
        this.log(e);
    }
    return result;
};
