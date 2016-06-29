process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../lib/server.js');
var mongoose = require('../lib/config/mongo.js');
var should = chai.should();
var Event = require('../lib/eventModel.js');

module.exports = function() {
	before(function(done) {
		Event.collection.drop();
		done();
	});

	beforeEach(function(done) {
		// Populate db
		var event1 = new Event({
			name: "Develop Yourself 2",
			starts: "2015-12-11 15:00",
			ends: "2015-12-14 12:00",
			description: "A training event to boost your self-confidence and teamworking skills",
			organizing_locals: [{foreign_id: "AEGEE-Dresden"}],
			type: "non-statutory",
			max_participants: 22,
			application_deadline: "2015-11-30",
			application_status: "closed",
			organizers: [{foreign_id: "cave.johnson"}],
			application_fields : [
					{name: "Motivation"},
					{name: "TShirt-Size"}, 
					{name: "Meaning of Life"}
			],
		});

		event1.save(function(err, event1) {
			event1.applications = [
				{
					foreign_id: "cave.johnson",
					application_status: "requesting",
					application: [
						{
							field_id: event1.application_fields[0]._id,
							value: "I am unmotivated"
						}, {
							field_id: event1.application_fields[1]._id,
							value: "L"
						}
					]
				}
			]

			event1.save(function(err) {
				done();
			});
		});
	});

	afterEach(function(done) {
		Event.collection.drop();
		done();
	});

	it('should list all applications to an event on /single/id/participants/ GET', function(done) {
		chai.request(server)
			.get('/')
			.end(function(err, event) {
				chai.request(server)
					.get(event.body[0].application_url)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('array');

						res.body.should.have.lengthOf(1);
						done();
					});
			});
	});


	it('should record an application to an event on /single/id/participants/ POST');
	it('should return one specific application on /single/id/participants/id GET');
	it('should edit details of one application on /single/id/participants/id PUT');
}