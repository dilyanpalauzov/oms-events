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
			organizers: [{foreign_id: "vincent.vega"}],
		});

		event1.save(function(err) {
			var event2 = new Event({
				name: "EPM Zagreb",
				starts: "2017-02-23",
				ends: "2017-02-27",
				description: "Drafting the Action Agenda and drinking cheap vodka",
				organizing_locals: [{"foreign_id": "ZAG"},{"foreign_id": "SOF"}],
				type: "statutory",
				max_participants: 300,
				application_deadline: "2017-01-01",
				application_fields : [
					{name: "Motivation"}, 
					{name: "Allergies"}, 
					{name: "Disabilities"}, 
					{name: "TShirt-Size"}, 
					{name: "Meaning of Life"}
				],
				organizers: [{foreign_id: "vincent.vega"}],
			});

			event2.save(function(err) {
				done();
			});
		});
	});

	afterEach(function(done) {
		Event.collection.drop();
		done();
	});

	it('should list all events on / GET', function(done) {
		chai.request(server)
			.get('/')
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');

				res.body[0].should.have.property('_id');
				res.body[0].should.have.property('name');
				res.body[0].should.have.property('starts');
				res.body[0].should.have.property('ends');
				res.body[0].should.have.property('application_deadline');
				res.body[0].should.have.property('application_status');
				res.body[0].should.have.property('max_participants');
				res.body[0].should.have.property('status');
				res.body[0].should.have.property('type');
				res.body[0].should.have.property('organizing_locals');
				res.body[0].should.have.property('description');
				res.body[0].should.have.property('url');
				res.body[0].should.have.property('organizer_url');
				res.body[0].should.have.property('application_url');

				res.body[0].should.not.have.property('application_fields');
				res.body[0].should.not.have.property('organizers');
				res.body[0].should.not.have.property('applications');

				done();
			});
	});

	it('should create a new event on minimal sane / POST', function(done) {
		chai.request(server)
			.post('/')
			.send({
				name: "Develop Yourself 2",
				starts: "2015-12-11 15:00",
				ends: "2015-12-14 12:00",
			})
			.end(function(err, res) {
				res.should.have.status(201);
				res.should.be.json;
				res.should.be.a('object');

				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.should.have.property('starts');
				res.body.should.have.property('ends');
				res.body.should.have.property('application_status');
				res.body.should.have.property('max_participants');
				res.body.should.have.property('status');
				res.body.should.have.property('type');
				res.body.should.have.property('organizing_locals');
				res.body.should.have.property('description');
				res.body.should.have.property('url');
				res.body.should.have.property('organizer_url');
				res.body.should.have.property('application_url');
				res.body.should.have.property('application_fields');
				res.body.should.have.property('organizers');
				res.body.should.have.property('applications');

				// Check auto-filled fields
				res.body.status.should.equal('draft');
				res.body.type.should.equal('non-statutory');
				res.body.application_status.should.equal('closed');
				res.body.application_fields.should.have.lengthOf(3);
				res.body.max_participants.should.equal(0);

				// application deadline optional when application closed
				//res.body.should.have.property('application_deadline');

				done();
			});
	});

	it('should create a new event on exhausive sane / POST', function(done) {
		chai.request(server)
			.post('/')
			.send({
				name: "Develop Yourself 2",
				starts: "2015-12-11 15:00",
				ends: "2015-12-14 12:00",
				description: "A training event to boost your self-confidence and teamworking skills",
				organizing_locals: [{foreign_id: "AEGEE-Dresden"}],
				type: "non-statutory",
				max_participants: 22,
				application_deadline: "2015-11-30",
				application_fields: [
					{
						name: "What is the greatest local",
						description: "Tell something about which AEGEE-Local is the best",
					},
					{
						name: "What is the meaning of life",
						description: "Please be concise",
					}
				],
				application_status: "closed"
			})
			.end(function(err, res) {
				res.should.have.status(201);
				res.should.be.json;
				res.should.be.a('object');

				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.should.have.property('starts');
				res.body.should.have.property('ends');
				res.body.should.have.property('application_deadline');
				res.body.should.have.property('application_status');
				res.body.should.have.property('max_participants');
				res.body.should.have.property('status');
				res.body.should.have.property('type');
				res.body.should.have.property('organizing_locals');
				res.body.should.have.property('description');
				res.body.should.have.property('url');
				res.body.should.have.property('organizer_url');
				res.body.should.have.property('application_url');
				res.body.should.have.property('application_fields');
				res.body.should.have.property('organizers');
				res.body.should.have.property('applications');

				res.body.application_fields.should.have.lengthOf(2);

				// Not yet implemented
				//res.body.organizers.should.have.lengthOf(1);

				done();
			});
	});

	it('should discart superflous fields on overly detailed / POST', function(done) {
		chai.request(server)
			.post('/')
			.send({
				name: "Develop Yourself 2",
				starts: "2015-12-11 15:00",
				ends: "2015-12-14 12:00",
				organizers: [
					{
						foreign_id: "eve.mallory",
						role: "full"
					}
				],
				applications: [
					{
						foreign_id: "eve.mallory",
						application_status: "approved"
					}
				]
			})
			.end(function(err, res) {
				res.body.applications.should.have.lengthOf(0);

				// Not implemented yet
				//res.body.organizers.should.have.lengthOf(1);
				//res.body.organizers[0].foreign_id.should.not.equal('eve.mallory');

				done();
			});
	});

	it('should return validation errors on malformed / POST', function(done) {
		chai.request(server)
			.post('/')
			.send({
				starts: "2015-12-11 15:00",
				ends: "sometime, dunno yet"
			})
			.end(function(err, res) {
				res.body.should.have.property('errors');
				res.body.errors.should.have.property('ends');
				res.body.errors.should.have.property('name');

				done();
			});
	})
}